import React, { useEffect, useRef } from 'react';
import type { Hand } from '@tensorflow-models/hand-pose-detection';

interface VideoPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onHandDetected?: (hand: Hand) => void;
  handDetector: any;
  isSlappingMotion: (hand: Hand) => boolean;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ 
  videoRef, 
  onHandDetected,
  handDetector,
  isSlappingMotion
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!handDetector || !videoRef.current || !canvasRef.current) return;
    
    let animationFrame: number;
    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Make sure video dimensions match canvas
    const resizeCanvas = () => {
      if (!canvasRef.current || !videoRef.current) return;
      const { videoWidth, videoHeight } = videoRef.current;
      if (videoWidth && videoHeight) {
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
      }
    };

    videoRef.current.addEventListener('loadedmetadata', resizeCanvas);
    resizeCanvas();
    
    const detectHands = async () => {
      if (!videoRef.current || !ctx) return;
      
      // Clear previous frame
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      // Draw video frame
      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        ctx.drawImage(videoRef.current, 0, 0);
      }
      
      try {
        const hands = await handDetector.estimateHands(videoRef.current);
        
        if (hands.length > 0) {
          const hand = hands[0];
          
          // Draw hand landmarks
          hand.keypoints.forEach((point: any) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = isSlappingMotion(hand) ? 'red' : 'lime';
            ctx.fill();
          });
          
          // Connect landmarks
          ctx.beginPath();
          ctx.moveTo(hand.keypoints[0].x, hand.keypoints[0].y);
          
          hand.keypoints.forEach((point: any) => {
            ctx.lineTo(point.x, point.y);
          });
          
          ctx.strokeStyle = isSlappingMotion(hand) ? 'red' : 'lime';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          if (onHandDetected) {
            onHandDetected(hand);
          }
        }
      } catch (error) {
        console.error('Hand detection error:', error);
      }
      
      animationFrame = requestAnimationFrame(detectHands);
    };
    
    detectHands();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      videoRef.current?.removeEventListener('loadedmetadata', resizeCanvas);
    };
  }, [handDetector, videoRef, onHandDetected, isSlappingMotion]);

  return (
    <div className="fixed top-4 right-4 w-80 h-60 rounded-lg overflow-hidden shadow-xl border-2 border-white bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{ transform: 'scaleX(-1)' }}
      />
    </div>
  );
};
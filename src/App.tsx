import React, { useCallback, useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { useCamera } from './hooks/useCamera';
import { useDetectors } from './hooks/useDetectors';
import { useHandVelocity } from './hooks/useHandVelocity';
import { Canvas } from './components/Canvas';
import { VideoPreview } from './components/VideoPreview';
import { LoadingSpinner } from './components/LoadingSpinner';
import { distortImage } from './utils/imageProcessing';
import type { Hand } from '@tensorflow-models/hand-pose-detection';

function App() {
  const { videoRef, isStreamReady } = useCamera();
  const { faceDetector, handDetector, isLoading, error } = useDetectors();
  const { isSlappingMotion } = useHandVelocity();
  const [capturedImage, setCapturedImage] = useState<ImageData | null>(null);
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !faceDetector || !canvasContext) return;

    try {
      const faces = await faceDetector.estimateFaces(videoRef.current);
      if (faces.length > 0) {
        const { videoWidth, videoHeight } = videoRef.current;
        const { width: canvasWidth, height: canvasHeight } = canvasContext.canvas;
        
        const scale = Math.max(canvasWidth / videoWidth, canvasHeight / videoHeight);
        const scaledWidth = videoWidth * scale;
        const scaledHeight = videoHeight * scale;
        
        const x = (canvasWidth - scaledWidth) / 2;
        const y = (canvasHeight - scaledHeight) / 2;
        
        canvasContext.drawImage(videoRef.current, x, y, scaledWidth, scaledHeight);
        setCapturedImage(canvasContext.getImageData(0, 0, canvasWidth, canvasHeight));
      }
    } catch (err) {
      console.error('Error capturing face:', err);
    }
  }, [faceDetector, videoRef, canvasContext]);

  const handleCanvasReady = useCallback((context: CanvasRenderingContext2D) => {
    setCanvasContext(context);
  }, []);

  const handleHandDetected = useCallback((hand: Hand) => {
    if (!canvasContext || !capturedImage) return;

    const isSlapping = isSlappingMotion(hand);
    const distortedImage = distortImage(
      canvasContext,
      capturedImage,
      hand,
      isSlapping
    );
    
    canvasContext.putImageData(distortedImage, 0, 0);
  }, [canvasContext, capturedImage, isSlappingMotion]);

  if (isLoading || error) {
    return <LoadingSpinner error={error} />;
  }

  return (
    <div className="fixed inset-0 bg-gray-900">
      {!capturedImage && (
        <video
          ref={videoRef}
          className="fixed inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
      )}
      
      <Canvas onCanvasReady={handleCanvasReady} />

      {capturedImage && handDetector && (
        <VideoPreview 
          videoRef={videoRef}
          onHandDetected={handleHandDetected}
          handDetector={handDetector}
          isSlappingMotion={isSlappingMotion}
        />
      )}

      {isStreamReady && !capturedImage && (
        <button
          onClick={handleCapture}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 
                   bg-white text-gray-900 px-6 py-3 rounded-full
                   flex items-center space-x-3 hover:bg-gray-100
                   transition-colors duration-200 text-lg shadow-lg"
        >
          <Camera size={24} />
          <span>Capture Face</span>
        </button>
      )}
    </div>
  );
}
import { useEffect, useRef, useState } from 'react';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);

  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.playsInline = true;
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current?.play();
              setIsStreamReady(true);
            } catch (error) {
              console.error('Error playing video:', error);
            }
          };
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    setupCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { videoRef, isStreamReady };
};
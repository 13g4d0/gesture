import React, { useRef, useEffect } from 'react';

interface CanvasProps {
  onCanvasReady: (context: CanvasRenderingContext2D) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ onCanvasReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Set canvas size to window size
      const updateCanvasSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const context = canvas.getContext('2d');
        if (context) {
          onCanvasReady(context);
        }
      };

      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);

      return () => {
        window.removeEventListener('resize', updateCanvasSize);
      };
    }
  }, [onCanvasReady]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
    />
  );
};
import type { Hand } from '@tensorflow-models/hand-pose-detection';

interface Point {
  x: number;
  y: number;
}

const calculateHandCenter = (hand: Hand): Point => {
  const palm = hand.keypoints[0];
  const fingers = hand.keypoints.slice(1, 5);
  
  // Scale coordinates to canvas size
  const centerX = palm.x;
  const centerY = palm.y;
  
  return { x: centerX, y: centerY };
};

export const distortImage = (
  ctx: CanvasRenderingContext2D,
  sourceImageData: ImageData,
  hand: Hand,
  isSlapping: boolean
) => {
  const { width, height } = ctx.canvas;
  const destImageData = ctx.createImageData(width, height);
  const center = calculateHandCenter(hand);
  
  // Scale the effect based on canvas size
  const baseStrength = Math.min(width, height) * 0.1;
  const baseRadius = Math.min(width, height) * 0.2;
  
  const strength = isSlapping ? baseStrength * 3 : baseStrength;
  const radius = isSlapping ? baseRadius * 2 : baseRadius;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - center.x;
      const dy = y - center.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < radius) {
        let distortionFactor = (radius - distance) / radius * strength;
        
        if (isSlapping) {
          // Add explosive effect when slapping
          const angle = Math.atan2(dy, dx);
          distortionFactor *= 1 + Math.random() * 0.5;
          const sourceX = Math.floor(x + Math.cos(angle) * distortionFactor);
          const sourceY = Math.floor(y + Math.sin(angle) * distortionFactor);
          
          if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
            const sourceIndex = (sourceY * width + sourceX) * 4;
            const destIndex = (y * width + x) * 4;
            
            destImageData.data[destIndex] = sourceImageData.data[sourceIndex];
            destImageData.data[destIndex + 1] = sourceImageData.data[sourceIndex + 1];
            destImageData.data[destIndex + 2] = sourceImageData.data[sourceIndex + 2];
            destImageData.data[destIndex + 3] = sourceImageData.data[sourceIndex + 3];
          }
        } else {
          // Normal distortion for regular hand movement
          const angle = Math.atan2(dy, dx);
          const sourceX = Math.floor(x + Math.cos(angle) * distortionFactor);
          const sourceY = Math.floor(y + Math.sin(angle) * distortionFactor);
          
          if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
            const sourceIndex = (sourceY * width + sourceX) * 4;
            const destIndex = (y * width + x) * 4;
            
            destImageData.data[destIndex] = sourceImageData.data[sourceIndex];
            destImageData.data[destIndex + 1] = sourceImageData.data[sourceIndex + 1];
            destImageData.data[destIndex + 2] = sourceImageData.data[sourceIndex + 2];
            destImageData.data[destIndex + 3] = sourceImageData.data[sourceIndex + 3];
          }
        }
      } else {
        const sourceIndex = (y * width + x) * 4;
        const destIndex = sourceIndex;
        
        destImageData.data[destIndex] = sourceImageData.data[sourceIndex];
        destImageData.data[destIndex + 1] = sourceImageData.data[sourceIndex + 1];
        destImageData.data[destIndex + 2] = sourceImageData.data[sourceIndex + 2];
        destImageData.data[destIndex + 3] = sourceImageData.data[sourceIndex + 3];
      }
    }
  }
  
  return destImageData;
};
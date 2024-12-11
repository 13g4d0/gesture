import { useRef } from 'react';
import type { Hand } from '@tensorflow-models/hand-pose-detection';

const VELOCITY_THRESHOLD = 50; // Adjust this value to change slap sensitivity

export const useHandVelocity = () => {
  const lastPositionRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const calculateVelocity = (hand: Hand) => {
    const palm = hand.keypoints[0];
    const currentTime = performance.now();

    if (!lastPositionRef.current) {
      lastPositionRef.current = { x: palm.x, y: palm.y, time: currentTime };
      return 0;
    }

    const deltaX = palm.x - lastPositionRef.current.x;
    const deltaY = palm.y - lastPositionRef.current.y;
    const deltaTime = currentTime - lastPositionRef.current.time;

    // Calculate velocity in pixels per millisecond
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;

    lastPositionRef.current = { x: palm.x, y: palm.y, time: currentTime };

    return velocity;
  };

  const isSlappingMotion = (hand: Hand) => {
    const velocity = calculateVelocity(hand);
    return velocity > VELOCITY_THRESHOLD;
  };

  return { isSlappingMotion };
};
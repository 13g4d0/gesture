import { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const loadModelWithRetry = async <T>(
  loadFn: () => Promise<T>,
  attempts: number = RETRY_ATTEMPTS
): Promise<T> => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await loadFn();
    } catch (error) {
      console.error(`Attempt ${i + 1}/${attempts} failed:`, error);
      if (i === attempts - 1) throw error;
      await delay(RETRY_DELAY);
    }
  }
  throw new Error('Failed to load model after all attempts');
};

export const useDetectors = () => {
  const [faceDetector, setFaceDetector] = useState<faceDetection.FaceDetector | null>(null);
  const [handDetector, setHandDetector] = useState<handPoseDetection.HandDetector | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Initialize TensorFlow.js with WebGL backend
        await tf.setBackend('webgl');
        await tf.ready();

        // Enable memory cleanup
        if (tf.env().get('IS_BROWSER')) {
          tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
        }

        // Load models with retry logic
        const [faceModel, handModel] = await Promise.all([
          loadModelWithRetry(async () => 
            faceDetection.createDetector(
              faceDetection.SupportedModels.MediaPipeFaceDetector,
              {
                runtime: 'tfjs',
                modelType: 'short',
                maxFaces: 1
              }
            )
          ),
          loadModelWithRetry(async () =>
            handPoseDetection.createDetector(
              handPoseDetection.SupportedModels.MediaPipeHands,
              {
                runtime: 'tfjs',
                modelType: 'lite',
                maxHands: 1
              }
            )
          )
        ]);

        setFaceDetector(faceModel);
        setHandDetector(handModel);
        setError(null);
      } catch (err) {
        console.error('Failed to load AI models:', err);
        setError('Failed to load AI models. Please refresh the page to try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();

    return () => {
      // Cleanup TensorFlow.js resources
      if (tf.env().get('IS_BROWSER')) {
        tf.engine().endScope();
        tf.engine().disposeVariables();
      }
    };
  }, []);

  return { faceDetector, handDetector, isLoading, error };
};
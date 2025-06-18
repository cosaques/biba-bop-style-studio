
import { useState, useCallback } from 'react';

export interface EnhancementState {
  isEnhancing: boolean;
  enhancedImage: Blob | null;
  error: string | null;
}

export const useImageEnhancement = () => {
  const [enhancementState, setEnhancementState] = useState<EnhancementState>({
    isEnhancing: false,
    enhancedImage: null,
    error: null
  });

  const enhanceImage = useCallback(async (file: File): Promise<Blob | null> => {
    setEnhancementState({
      isEnhancing: true,
      enhancedImage: null,
      error: null
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/enhance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Enhancement failed: ${response.status}`);
      }

      // The response should already be a PNG with transparent background
      const enhancedBlob = await response.blob();
      
      // Ensure the blob is treated as PNG
      const pngBlob = new Blob([enhancedBlob], { type: 'image/png' });
      
      setEnhancementState({
        isEnhancing: false,
        enhancedImage: pngBlob,
        error: null
      });

      return pngBlob;
    } catch (error) {
      console.error('Error enhancing image:', error);
      setEnhancementState({
        isEnhancing: false,
        enhancedImage: null,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'amélioration'
      });
      return null;
    }
  }, []);

  const resetEnhancement = useCallback(() => {
    setEnhancementState({
      isEnhancing: false,
      enhancedImage: null,
      error: null
    });
  }, []);

  return {
    ...enhancementState,
    enhanceImage,
    resetEnhancement
  };
};

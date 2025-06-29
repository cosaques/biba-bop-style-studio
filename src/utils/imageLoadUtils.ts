
export const getImageDimensions = (imageUrl: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = imageUrl;
  });
};

export const calculateOptimalSize = (
  naturalWidth: number, 
  naturalHeight: number, 
  maxSize: number = 120
): { width: number; height: number } => {
  const aspectRatio = naturalWidth / naturalHeight;
  
  if (naturalWidth > naturalHeight) {
    // Landscape image
    const width = Math.min(maxSize, naturalWidth);
    const height = width / aspectRatio;
    return { width, height };
  } else {
    // Portrait or square image
    const height = Math.min(maxSize, naturalHeight);
    const width = height * aspectRatio;
    return { width, height };
  }
};

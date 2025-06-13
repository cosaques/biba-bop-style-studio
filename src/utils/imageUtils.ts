
export const compressAndResizeImage = (file: File, maxSize: number = 2000): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      const maxDimension = Math.max(width, height);
      
      if (maxDimension > maxSize) {
        const ratio = maxSize / maxDimension;
        width *= ratio;
        height *= ratio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        0.8
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const uploadClothingImage = async (file: File, userId: string): Promise<{ url: string; path: string }> => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  // Compress the image
  const compressedBlob = await compressAndResizeImage(file);
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('clothing-images')
    .upload(filePath, compressedBlob, {
      contentType: file.type,
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('clothing-images')
    .getPublicUrl(filePath);

  return { url: publicUrl, path: filePath };
};

export const getOptimizedImageUrl = (url: string, size: number = 400): string => {
  if (!url.includes('supabase')) return url;
  
  // Add Supabase image transformation parameters
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${size}&height=${size}&resize=contain&format=webp`;
};

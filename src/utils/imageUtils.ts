import { supabase } from '@/integrations/supabase/client';

export const compressAndResizeImage = (file: File, maxSize: number = 1024): Promise<Blob> => {
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

  // Compress the image to max 1024px
  const compressedBlob = await compressAndResizeImage(file, 1024);

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
  if (!url) return url;

  // Check if this is a Supabase storage URL
  if (!url.includes('supabase.co/storage/v1/object/public/')) {
    return url;
  }

  try {
    // Extract the bucket and path from the URL
    const urlParts = url.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) return url;

    const [bucketAndPath] = urlParts[1].split('/');
    const bucket = bucketAndPath;
    const path = urlParts[1].substring(bucket.length + 1);

    // Use Supabase's image transformation
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path, {
        transform: {
          width: size,
          height: size,
          resize: 'contain',
          quality: 80
        }
      });

    return publicUrl;
  } catch (error) {
    console.error('Error optimizing image URL:', error);
    return url;
  }
};

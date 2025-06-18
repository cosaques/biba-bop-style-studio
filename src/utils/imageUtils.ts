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

export const uploadClothingImage = async (file: File | Blob, userId: string, isEnhanced: boolean = false): Promise<{ url: string; path: string }> => {
  const { supabase } = await import('@/integrations/supabase/client');

  let processedBlob: Blob;
  let fileName: string;
  let contentType: string;

  if (isEnhanced) {
    // For enhanced images, keep as PNG with transparent background
    processedBlob = file;
    fileName = `enhanced_${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
    contentType = 'image/png';
  } else {
    // For original images, check if it's PNG to preserve format
    const imageFile = file as File;
    const isPngOriginal = imageFile.type === 'image/png';
    
    if (isPngOriginal) {
      // Keep PNG original as PNG to preserve transparency
      processedBlob = imageFile;
      fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
      contentType = 'image/png';
    } else {
      // Compress JPEG images as before
      processedBlob = await compressAndResizeImage(imageFile, 1024);
      const fileExt = imageFile.name.split('.').pop();
      fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      contentType = imageFile.type;
    }
  }

  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('clothing-images')
    .upload(filePath, processedBlob, {
      contentType: contentType,
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

    // For PNG images (enhanced or original PNG), preserve transparency
    const isPng = path.toLowerCase().includes('enhanced') || path.toLowerCase().endsWith('.png');
    
    // Use Supabase's image transformation
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path, {
        transform: {
          width: size,
          height: size,
          resize: 'contain',
          quality: isPng ? 100 : 80 // Higher quality for PNG to preserve transparency
        }
      });

    return publicUrl;
  } catch (error) {
    console.error('Error optimizing image URL:', error);
    return url;
  }
};

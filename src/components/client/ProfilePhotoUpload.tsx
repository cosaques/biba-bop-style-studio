
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Upload, X } from "lucide-react";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUpdate: (url: string | null) => void;
  className?: string;
}

export function ProfilePhotoUpload({ currentPhotoUrl, onPhotoUpdate, className }: ProfilePhotoUploadProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isUploading, setIsUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    
    // Calculate crop to center a square that fits within the image
    const size = Math.min(naturalWidth, naturalHeight);
    const x = (naturalWidth - size) / 2;
    const y = (naturalHeight - size) / 2;
    
    setCrop({
      unit: 'px',
      width: size * 0.6,
      height: size * 0.6,
      x: x + (size * 0.2),
      y: y + (size * 0.2),
    });
  };

  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = 200;
    canvas.height = 200;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      200,
      200
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg', 0.8);
    });
  };

  const deleteOldPhoto = async (photoUrl: string) => {
    try {
      // Extract the file path from the URL
      const urlParts = photoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user?.id}/${fileName}`;
      
      await supabase.storage
        .from('profile-photos')
        .remove([filePath]);
    } catch (error) {
      console.error('Error deleting old photo:', error);
    }
  };

  const uploadPhoto = async () => {
    if (!imgRef.current || !completedCrop || !user) return;

    setIsUploading(true);
    try {
      // Delete old photo if exists
      if (currentPhotoUrl) {
        await deleteOldPhoto(currentPhotoUrl);
      }

      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      const fileName = `${user.id}/profile-photo-${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, croppedImageBlob, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onPhotoUpdate(publicUrl);
      setIsOpen(false);
      setImageSrc('');
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = async () => {
    if (!user) return;

    setIsUploading(true);
    try {
      // Delete photo from storage if exists
      if (currentPhotoUrl) {
        await deleteOldPhoto(currentPhotoUrl);
      }

      const { error } = await supabase
        .from('profiles')
        .update({ profile_photo_url: null })
        .eq('id', user.id);

      if (error) throw error;

      onPhotoUpdate(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Error removing photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Camera className="mr-2 h-4 w-4" />
          {currentPhotoUrl ? 'Modifier' : 'Ajouter'} une photo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Photo de profil</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!imageSrc ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
                  {currentPhotoUrl ? (
                    <img
                      src={currentPhotoUrl}
                      alt="Photo actuelle"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Choisir une photo
                </Button>
                
                {currentPhotoUrl && (
                  <Button variant="destructive" onClick={removePhoto} disabled={isUploading}>
                    <X className="mr-2 h-4 w-4" />
                    Supprimer la photo
                  </Button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-96 overflow-hidden flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                  className="max-w-full"
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageSrc}
                    className="max-h-96 max-w-full object-contain"
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={uploadPhoto} disabled={isUploading}>
                  {isUploading ? 'Envoi...' : 'Confirmer'}
                </Button>
                <Button variant="outline" onClick={() => setImageSrc('')}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

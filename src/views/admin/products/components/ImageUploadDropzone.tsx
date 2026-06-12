'use client';

import { useState, useRef, useCallback } from 'react';
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { uploadImageAction } from '@/entities/admin/api/upload.action';

interface ImageUploadDropzoneProps {
  bucket?: string;
  folder?: string;
  onUploadComplete: (url: string, path: string) => void;
  onUploadError?: (error: string) => void;
  existingUrl?: string | null;
  label?: string;
}

export function ImageUploadDropzone({ bucket = 'Products', folder = '', onUploadComplete, onUploadError, existingUrl, label = 'Перетащите изображение сюда или кликните для загрузки' }: ImageUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onUploadError?.('Пожалуйста, загрузите изображение');
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Local preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      if (folder) formData.append('folder', folder);

      const result = await uploadImageAction(formData);

      if (result.error) {
        throw new Error(result.error);
      }
      
      onUploadComplete(result.publicUrl, result.imagePath);
    } catch (err: any) {
      console.error('Upload error:', err);
      onUploadError?.(err.message || 'Ошибка при загрузке');
      setPreview(existingUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, [bucket]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onUploadComplete('', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
          ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-[#333] hover:border-[#555] bg-[#1A1A1A]'}
          ${isUploading ? 'opacity-70 pointer-events-none' : ''}
          ${preview ? 'h-48' : 'h-32'}
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        {preview ? (
          <div className="relative w-full h-full group">
            <Image 
              src={preview} 
              alt="Preview" 
              fill 
              className="object-cover"
              unoptimized={preview.startsWith('blob:')}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                type="button" 
                onClick={handleRemove}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#A1A1AA] gap-2 p-4 text-center">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            ) : (
              <>
                <UploadCloud className="w-8 h-8 mb-1 opacity-80" />
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs opacity-60">PNG, JPG, WEBP (до 5MB)</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

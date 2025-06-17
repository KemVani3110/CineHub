'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useLoadingState } from '@/hooks/useLoadingState';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
  value?: string;
}

export default function FileUpload({
  onUploadComplete,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  label = 'Upload File',
  value,
}: FileUploadProps) {
  const { setLoading, isLoading } = useLoadingState();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      toast.error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setLoading('upload', true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Upload failed');
      }

      const data = await response.json();
      onUploadComplete(data.url);
      toast.success('File uploaded successfully');
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setLoading('upload', false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="flex-1"
        />
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isLoading('upload')}
        >
          <Upload className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </div>
      {selectedFile && (
        <p className="text-sm text-muted-foreground">
          Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
        </p>
      )}
      {value && (
        <p className="text-sm text-muted-foreground">
          Current file: {value.split('/').pop()}
        </p>
      )}
    </div>
  );
} 
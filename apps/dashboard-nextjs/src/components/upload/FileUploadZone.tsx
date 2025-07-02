'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  File, 
  FileText, 
  FileSpreadsheet, 
  Image, 
  X, 
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileWithProgress {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  uploadId?: string;
}

interface FileUploadZoneProps {
  onFilesAdded: (files: FileWithProgress[]) => void;
  onFileRemove: (fileId: string) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
} as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUploadZone({ 
  onFilesAdded, 
  onFileRemove, 
  maxFiles = 10,
  maxSize = 10,
  className 
}: FileUploadZoneProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      console.error('Rejected files:', rejectedFiles);
      // You could show toast notifications here
    }

    // Process accepted files
    const newFiles: FileWithProgress[] = acceptedFiles.map(file => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      progress: 0,
      status: 'pending' as const,
    }));

    setFiles(prev => {
      const updated = [...prev, ...newFiles];
      if (updated.length > maxFiles) {
        return updated.slice(0, maxFiles);
      }
      return updated;
    });

    onFilesAdded(newFiles);
  }, [maxFiles, onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles,
    multiple: true,
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    onFileRemove(fileId);
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) {
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    }
    if (type.includes('image')) return <Image className="h-8 w-8 text-blue-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const getStatusIcon = (status: FileWithProgress['status']) => {
    switch (status) {
      case 'pending':
        return <Upload className="h-4 w-4 text-gray-500" />;
      case 'uploading':
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: FileWithProgress['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700';
      case 'uploading':
        return 'bg-blue-100 text-blue-700';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <Card className={cn(
        'border-2 border-dashed transition-all duration-200 cursor-pointer',
        isDragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
      )}>
        <CardContent className="p-8">
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <div className="text-center">
              <div className={cn(
                'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
                isDragActive ? 'bg-blue-100' : 'bg-gray-100'
              )}>
                <Upload className={cn(
                  'h-8 w-8',
                  isDragActive ? 'text-blue-600' : 'text-gray-600'
                )} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  {isDragActive ? 'Drop files here' : 'Upload documents'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isDragActive 
                    ? 'Release to upload your files'
                    : 'Drag and drop files here, or click to browse'
                  }
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline">PDF</Badge>
                  <Badge variant="outline">Excel</Badge>
                  <Badge variant="outline">CSV</Badge>
                  <Badge variant="outline">Images</Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Maximum file size: {maxSize}MB • Up to {maxFiles} files
                </p>
              </div>

              {!isDragActive && (
                <Button className="mt-4" type="button">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Files
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Uploaded Files ({files.length})</h4>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    files.forEach(f => removeFile(f.id));
                  }}
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-2">
                {files.map((fileWithProgress) => (
                  <div
                    key={fileWithProgress.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                  >
                    {getFileIcon(fileWithProgress.file)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <p className="text-sm font-medium truncate">
                            {fileWithProgress.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(fileWithProgress.file.size)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(fileWithProgress.status)}
                          >
                            <div className="flex items-center gap-1">
                              {getStatusIcon(fileWithProgress.status)}
                              {fileWithProgress.status}
                            </div>
                          </Badge>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(fileWithProgress.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {(fileWithProgress.status === 'uploading' || fileWithProgress.status === 'processing') && (
                        <div className="mt-2">
                          <Progress value={fileWithProgress.progress} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">
                            {fileWithProgress.progress}% complete
                          </p>
                        </div>
                      )}

                      {/* Error Message */}
                      {fileWithProgress.status === 'error' && fileWithProgress.error && (
                        <p className="text-xs text-red-600 mt-1">
                          {fileWithProgress.error}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

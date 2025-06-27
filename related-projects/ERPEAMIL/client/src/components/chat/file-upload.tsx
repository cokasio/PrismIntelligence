import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUpload, FileText, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';

interface FileUploadProps {
  sessionId: number;
  onUploadComplete?: (result: any) => void;
  onUploadStart?: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export function FileUpload({ sessionId, onUploadComplete, onUploadStart }: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    onUploadStart?.();
    
    // Initialize uploading files
    const newUploadingFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));
    
    setUploadingFiles(newUploadingFiles);

    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev => prev.map(item => ({
          ...item,
          progress: Math.min(item.progress + Math.random() * 20, 90)
        })));
      }, 200);

      const response = await apiRequest('POST', `/api/sessions/${sessionId}/upload`, formData);
      const result = await response.json();

      clearInterval(progressInterval);

      // Mark all as completed
      setUploadingFiles(prev => prev.map(item => ({
        ...item,
        progress: 100,
        status: 'completed'
      })));

      onUploadComplete?.(result);

      // Clear after 2 seconds
      setTimeout(() => {
        setUploadingFiles([]);
      }, 2000);

    } catch (error) {
      setUploadingFiles(prev => prev.map(item => ({
        ...item,
        status: 'error',
        error: error.message
      })));
    }
  }, [sessionId, onUploadComplete, onUploadStart]);

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive || dropzoneActive
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="gradient-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
          <CloudUpload className="h-6 w-6 text-white" />
        </div>
        {isDragActive || dropzoneActive ? (
          <p className="text-primary font-semibold">
            Drop your financial documents here...
          </p>
        ) : (
          <div>
            <p className="text-gray-900 font-semibold mb-2 text-lg">
              Upload Financial Documents
            </p>
            <p className="text-gray-600 mb-4">
              Drag & drop CSV, Excel files here, or click to browse
            </p>
            <div className="inline-flex items-center bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-600">
              <span>Supports: CSV, Excel • Max 10MB each</span>
            </div>
          </div>
        )}
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((item, index) => (
            <Card key={index} className="p-3 bg-white/10 border-white/20">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-green-400 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white truncate">
                      {item.file.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">
                        {(item.file.size / 1024).toFixed(1)} KB
                      </span>
                      {item.status !== 'uploading' && item.status !== 'processing' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0 hover:bg-white/20"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {item.status === 'uploading' || item.status === 'processing' ? (
                    <div className="space-y-1">
                      <Progress value={item.progress} className="h-1" />
                      <p className="text-xs text-gray-400">
                        {item.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                      </p>
                    </div>
                  ) : item.status === 'completed' ? (
                    <p className="text-xs text-green-400">✓ Upload completed</p>
                  ) : item.status === 'error' ? (
                    <p className="text-xs text-red-400">✗ {item.error || 'Upload failed'}</p>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

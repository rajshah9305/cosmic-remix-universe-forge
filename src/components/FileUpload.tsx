
import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileImage, X, File, Video, Music, Archive, FileText, Trash2, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

interface FileWithProgress extends File {
  id: string;
  progress: number;
  preview?: string;
  status: 'uploading' | 'completed' | 'error';
}

interface FileUploadProps {
  onFileSelect: (files: FileWithProgress[]) => void;
  acceptedTypes?: string;
  maxFileSize?: number; // in MB
  multiple?: boolean;
  showPreview?: boolean;
  allowFileManagement?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedTypes = "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar,.json,.csv,.xlsx,.pptx",
  maxFileSize = 25,
  multiple = true,
  showPreview = true,
  allowFileManagement = true
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <FileImage className="h-5 w-5" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (type.startsWith('audio/')) return <Music className="h-5 w-5" />;
    if (type.includes('pdf')) return <FileText className="h-5 w-5" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const validateFile = (file: File): boolean => {
    if (file.size > maxFileSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `${file.name} exceeds ${maxFileSize}MB limit`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const generatePreview = useCallback(async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
    return undefined;
  }, []);

  const simulateUpload = (fileId: string): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setSelectedFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, progress: 100, status: 'completed' } : f
          ));
          resolve();
        } else {
          setSelectedFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, progress } : f
          ));
        }
      }, 100);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    
    setIsUploading(true);
    const newFiles: FileWithProgress[] = [];
    
    for (const file of Array.from(files)) {
      if (validateFile(file)) {
        const fileWithProgress: FileWithProgress = {
          ...file,
          id: `${Date.now()}-${Math.random()}`,
          progress: 0,
          status: 'uploading',
          preview: await generatePreview(file)
        };
        newFiles.push(fileWithProgress);
      }
    }
    
    setSelectedFiles(prev => multiple ? [...prev, ...newFiles] : newFiles);
    
    // Simulate upload progress for each file
    await Promise.all(newFiles.map(file => simulateUpload(file.id)));
    
    setIsUploading(false);
    onFileSelect(newFiles);
    
    toast({
      title: "Upload completed",
      description: `${newFiles.length} file(s) uploaded successfully`
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
    toast({
      title: "File removed",
      description: "File has been removed from the upload queue"
    });
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    toast({
      title: "All files cleared",
      description: "All files have been removed"
    });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-300 cursor-pointer
          ${dragActive 
            ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg' 
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes}
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className={`p-3 rounded-full bg-muted transition-all duration-300 ${dragActive ? 'scale-110' : ''}`}>
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {isUploading ? 'Uploading files...' : 'Drop files here or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports images, videos, audio, documents up to {maxFileSize}MB
            </p>
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">
              Files ({selectedFiles.length})
            </h4>
            {allowFileManagement && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFiles}
                className="h-8 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {selectedFiles.map((file) => (
              <FilePreview
                key={file.id}
                file={file}
                onRemove={() => removeFile(file.id)}
                showPreview={showPreview}
                allowManagement={allowFileManagement}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

interface FilePreviewProps {
  file: FileWithProgress;
  onRemove: () => void;
  showPreview?: boolean;
  allowManagement?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({ 
  file, 
  onRemove, 
  showPreview = true, 
  allowManagement = true 
}) => {
  const [showFullPreview, setShowFullPreview] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <FileImage className="h-5 w-5" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (type.startsWith('audio/')) return <Music className="h-5 w-5" />;
    if (type.includes('pdf')) return <FileText className="h-5 w-5" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const getStatusColor = () => {
    switch (file.status) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
      <div className="flex-shrink-0">
        {showPreview && file.type.startsWith('image/') && file.preview ? (
          <div className="relative">
            <img 
              src={file.preview} 
              alt={file.name}
              className="h-12 w-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setShowFullPreview(true)}
            />
            {file.status === 'uploading' && (
              <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                <div className="text-white text-xs">{Math.round(file.progress)}%</div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
            {getFileIcon(file)}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <div className="flex items-center space-x-2 mt-1">
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          <span className={`text-xs ${getStatusColor()}`}>
            {file.status === 'uploading' ? `${Math.round(file.progress)}%` : file.status}
          </span>
        </div>
        
        {file.status === 'uploading' && (
          <Progress value={file.progress} className="h-1 mt-2" />
        )}
      </div>
      
      {allowManagement && (
        <div className="flex items-center space-x-1">
          {showPreview && file.preview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullPreview(true)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {showFullPreview && file.preview && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullPreview(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={file.preview} 
              alt={file.name}
              className="max-w-full max-h-full object-contain rounded"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFullPreview(false)}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

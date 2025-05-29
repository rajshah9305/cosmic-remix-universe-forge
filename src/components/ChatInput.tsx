
import React, { useState } from 'react';
import { Send, FileUp, Paperclip, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import FileUpload from './FileUpload';

interface FileWithProgress extends File {
  id: string;
  progress: number;
  preview?: string;
  status: 'uploading' | 'completed' | 'error';
}

interface ChatInputProps {
  onSendMessage: (message: string, files?: FileWithProgress[]) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<FileWithProgress[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleSend = () => {
    if (message.trim() || attachedFiles.length > 0) {
      onSendMessage(message.trim(), attachedFiles);
      setMessage('');
      setAttachedFiles([]);
      setShowFileUpload(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (files: FileWithProgress[]) => {
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileTypeIcon = (file: FileWithProgress) => {
    if (file.type.startsWith('image/')) return <Image className="h-3 w-3" />;
    return <Paperclip className="h-3 w-3" />;
  };

  const completedFiles = attachedFiles.filter(f => f.status === 'completed');
  const uploadingFiles = attachedFiles.filter(f => f.status === 'uploading');

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end space-x-2 max-w-4xl mx-auto">
        <div className="flex-1 space-y-2">
          {/* File attachments preview */}
          {attachedFiles.length > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Attached Files ({attachedFiles.length})
                </span>
                {uploadingFiles.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Uploading {uploadingFiles.length}...
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center space-x-1 bg-background px-2 py-1 rounded border text-xs max-w-[200px]"
                  >
                    {getFileTypeIcon(file)}
                    <span className="truncate flex-1">{file.name}</span>
                    {file.status === 'uploading' && (
                      <span className="text-blue-600">{Math.round(file.progress)}%</span>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-muted-foreground hover:text-destructive ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-end space-x-2">
            <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  disabled={disabled}
                >
                  <FileUp className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Upload Files</DialogTitle>
                </DialogHeader>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  multiple={true}
                  maxFileSize={25}
                  showPreview={true}
                  allowFileManagement={true}
                />
              </DialogContent>
            </Dialog>

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="min-h-[40px] max-h-32 resize-none"
              disabled={disabled}
            />
            
            <Button
              onClick={handleSend}
              disabled={disabled || (!message.trim() && completedFiles.length === 0) || uploadingFiles.length > 0}
              className="h-10 w-10 shrink-0"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;

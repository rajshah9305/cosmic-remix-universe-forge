
import React, { useState } from 'react';
import { Send, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import FileUpload from './FileUpload';

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
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

  const handleFileSelect = (files: File[]) => {
    setAttachedFiles(files);
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end space-x-2 max-w-4xl mx-auto">
        <div className="flex-1 space-y-2">
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg">
              {attachedFiles.map((file, index) => (
                <div key={index} className="text-xs bg-background px-2 py-1 rounded border">
                  {file.name}
                </div>
              ))}
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
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Files</DialogTitle>
                </DialogHeader>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  multiple={true}
                  maxFileSize={25}
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
              disabled={disabled || (!message.trim() && attachedFiles.length === 0)}
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

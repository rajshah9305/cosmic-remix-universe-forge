
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileImage, File, Video, Music, Archive, FileText } from 'lucide-react';
import ChatInput from './ChatInput';
import { toast } from '@/hooks/use-toast';

interface FileWithProgress extends File {
  id: string;
  progress: number;
  preview?: string;
  status: 'uploading' | 'completed' | 'error';
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  files?: FileWithProgress[];
}

const CosmicChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to the Cosmic App Universe Builder! I can help you create amazing applications. Feel free to upload files, images, or documents to get started. I support various file types including images, videos, audio, documents, and archives.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSendMessage = async (text: string, files?: FileWithProgress[]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      files
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate bot response with file analysis
    setTimeout(() => {
      let botText = '';
      
      if (files?.length) {
        const fileAnalysis = analyzeFiles(files);
        botText = `I can see you've uploaded ${files.length} file(s): ${fileAnalysis}. `;
        
        if (text) {
          botText += `You also mentioned: "${text}". `;
        }
        
        botText += "I can help you work with these files - whether you need to analyze images, process documents, or integrate them into your application. What would you like me to do with these files?";
      } else {
        botText = `Thanks for your message: "${text}". I'm here to help you build amazing cosmic applications! You can upload files anytime to get started with more specific assistance.`;
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
      
      if (files?.length) {
        toast({
          title: "Files processed",
          description: `Successfully analyzed ${files.length} file(s)`
        });
      }
    }, 1500);
  };

  const analyzeFiles = (files: FileWithProgress[]): string => {
    const fileTypes: { [key: string]: number } = {};
    
    files.forEach(file => {
      const type = getFileCategory(file);
      fileTypes[type] = (fileTypes[type] || 0) + 1;
    });
    
    const analysis = Object.entries(fileTypes)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');
    
    return analysis;
  };

  const getFileCategory = (file: File): string => {
    const type = file.type;
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('doc')) return 'document';
    if (type.includes('zip') || type.includes('rar')) return 'archive';
    return 'file';
  };

  const getFileIcon = (file: FileWithProgress) => {
    const type = file.type;
    if (type.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleImagePreview = (preview: string) => {
    setSelectedImage(preview);
  };

  const downloadFile = (file: FileWithProgress) => {
    // In a real implementation, you'd handle actual file downloads
    toast({
      title: "Download started",
      description: `Downloading ${file.name}...`
    });
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-purple-600/10 to-blue-600/10">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🌌 Cosmic Assistant
          </h2>
          <p className="text-sm text-muted-foreground">
            Your AI companion for building amazing applications with advanced file handling
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-muted mr-4'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                
                {message.files && message.files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs opacity-75">Attached files:</span>
                      <Badge variant="secondary" className="text-xs">
                        {message.files.length}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {message.files.map((file, index) => (
                        <div 
                          key={index} 
                          className="flex items-center space-x-2 p-2 bg-background/20 rounded text-xs"
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            {getFileIcon(file)}
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium">{file.name}</p>
                              <p className="text-xs opacity-75">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {file.preview && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleImagePreview(file.preview!)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <img 
                                  src={file.preview} 
                                  alt={file.name}
                                  className="h-8 w-8 object-cover rounded cursor-pointer hover:opacity-80"
                                  onClick={() => handleImagePreview(file.preview!)}
                                />
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadFile(file)}
                              className="h-6 w-6 p-0"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-xs opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 mr-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </Card>

      {/* Image preview modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={selectedImage} 
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2"
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CosmicChatbot;

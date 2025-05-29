
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import ChatInput from './ChatInput';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  files?: File[];
}

const CosmicChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to the Cosmic App Universe Builder! I can help you create amazing applications. Feel free to upload files or images to get started.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string, files?: File[]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      files
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: files?.length 
          ? `I can see you've uploaded ${files.length} file(s). ${text ? `You also mentioned: "${text}"` : 'How would you like me to help you with these files?'}`
          : `Thanks for your message: "${text}". I'm here to help you build amazing cosmic applications!`,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
      
      if (files?.length) {
        toast({
          title: "Files processed",
          description: `Successfully processed ${files.length} file(s)`
        });
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-purple-600/10 to-blue-600/10">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🌌 Cosmic Assistant
          </h2>
          <p className="text-sm text-muted-foreground">
            Your AI companion for building amazing applications
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
                <p className="text-sm">{message.text}</p>
                {message.files && message.files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs opacity-75">Attached files:</p>
                    {message.files.map((file, index) => (
                      <div key={index} className="text-xs bg-background/20 rounded px-2 py-1">
                        📎 {file.name}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs opacity-60 mt-1">
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
    </div>
  );
};

export default CosmicChatbot;

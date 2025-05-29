
import React from 'react';
import CosmicChatbot from '@/components/CosmicChatbot';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🌟 Cosmic App Universe Builder
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build amazing applications with the power of AI. Upload files, images, videos, documents and let our cosmic assistant help you create something extraordinary with advanced file management and processing capabilities.
          </p>
        </div>
        
        <CosmicChatbot />
      </div>
    </div>
  );
};

export default Index;

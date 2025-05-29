
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  SortAsc, 
  SortDesc, 
  File, 
  FileImage, 
  Video, 
  Music, 
  Archive, 
  FileText,
  Eye,
  Download,
  Trash2,
  Folder,
  FolderOpen
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileWithProgress extends File {
  id: string;
  progress: number;
  preview?: string;
  status: 'uploading' | 'completed' | 'error';
  category?: string;
  tags?: string[];
  uploadDate?: Date;
}

interface FileManagerProps {
  files: FileWithProgress[];
  onFileSelect?: (file: FileWithProgress) => void;
  onFileDelete?: (fileId: string) => void;
  onFileDownload?: (file: FileWithProgress) => void;
  allowMultiSelect?: boolean;
}

const FileManager: React.FC<FileManagerProps> = ({
  files,
  onFileSelect,
  onFileDelete,
  onFileDownload,
  allowMultiSelect = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const getFileIcon = (file: FileWithProgress) => {
    const type = file.type;
    if (type.startsWith('image/')) return <FileImage className="h-5 w-5" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (type.startsWith('audio/')) return <Music className="h-5 w-5" />;
    if (type.includes('pdf')) return <FileText className="h-5 w-5" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const getFileCategory = (file: FileWithProgress): string => {
    const type = file.type;
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('doc')) return 'document';
    if (type.includes('zip') || type.includes('rar')) return 'archive';
    return 'other';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredAndSortedFiles = files
    .filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || getFileCategory(file) === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'date':
          comparison = (a.uploadDate || new Date()).getTime() - (b.uploadDate || new Date()).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const fileTypes = ['all', 'image', 'video', 'audio', 'pdf', 'document', 'archive', 'other'];

  const handleFileClick = (file: FileWithProgress) => {
    if (allowMultiSelect) {
      setSelectedFiles(prev => 
        prev.includes(file.id) 
          ? prev.filter(id => id !== file.id)
          : [...prev, file.id]
      );
    }
    onFileSelect?.(file);
  };

  const handleDelete = (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onFileDelete?.(fileId);
    toast({
      title: "File deleted",
      description: "File has been removed from storage"
    });
  };

  const handleDownload = (file: FileWithProgress, event: React.MouseEvent) => {
    event.stopPropagation();
    onFileDownload?.(file);
    toast({
      title: "Download started",
      description: `Downloading ${file.name}...`
    });
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">File Manager</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          {fileTypes.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Files' : type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'size' | 'date')}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="name">Sort by Name</option>
          <option value="size">Sort by Size</option>
          <option value="date">Sort by Date</option>
        </select>

        <Button variant="outline" size="sm" onClick={toggleSort}>
          {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>
      </div>

      {/* File Stats */}
      <div className="flex items-center space-x-4 mb-4 text-sm text-muted-foreground">
        <span>{filteredAndSortedFiles.length} files</span>
        <span>
          Total size: {formatFileSize(filteredAndSortedFiles.reduce((acc, file) => acc + file.size, 0))}
        </span>
        {selectedFiles.length > 0 && (
          <Badge variant="secondary">{selectedFiles.length} selected</Badge>
        )}
      </div>

      {/* Files Grid/List */}
      {filteredAndSortedFiles.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No files found</p>
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
            : 'space-y-2'
          }
        `}>
          {filteredAndSortedFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => handleFileClick(file)}
              className={`
                relative cursor-pointer border rounded-lg transition-all hover:shadow-md
                ${viewMode === 'grid' ? 'p-3' : 'p-2 flex items-center space-x-3'}
                ${selectedFiles.includes(file.id) ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}
              `}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="aspect-square mb-2 flex items-center justify-center bg-muted/50 rounded">
                    {file.preview ? (
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      getFileIcon(file)
                    )}
                  </div>
                  <h4 className="text-sm font-medium truncate mb-1">{file.name}</h4>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {getFileCategory(file)}
                  </Badge>
                </>
              ) : (
                <>
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{file.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {getFileCategory(file)}
                    </p>
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div className={`
                ${viewMode === 'grid' 
                  ? 'absolute top-2 right-2 opacity-0 group-hover:opacity-100' 
                  : 'flex items-center space-x-1'
                } transition-opacity
              `}>
                {file.preview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle preview
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDownload(file, e)}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDelete(file.id, e)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default FileManager;

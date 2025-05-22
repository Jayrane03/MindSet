import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Document } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface DocumentUploaderProps {
  onSuccess: (document: Document) => void;
  onCancel: () => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError('');
    
    // Check file type (PDF only)
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are supported');
      return;
    }
    
    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the maximum limit of 10MB');
      return;
    }
    
    setFile(selectedFile);
    
    // Auto-extract title from filename if not set
    if (!title) {
      const fileName = selectedFile.name.replace(/\.pdf$/, '');
      setTitle(fileName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a document title');
      return;
    }
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Simulate API request for document upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a mock document
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        title: title.trim(),
        fileName: file.name,
        uploadDate: new Date(),
        status: 'analyzing',
      };
      
      onSuccess(newDocument);
      
      // Simulate document analysis completion after some time
      setTimeout(() => {
        showToast(`Analysis of "${newDocument.title}" completed`, 'success');
      }, 5000);
      
    } catch (error) {
      setError('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Upload Document</h3>
        <button 
          onClick={onCancel}
          className="text-neutral-500 hover:text-neutral-700"
        >
          <X size={20} />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
            Document Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="e.g., Research Paper on Climate Change"
            disabled={isUploading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Document File (PDF only)
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isDragging 
                ? 'border-primary-400 bg-primary-50' 
                : file 
                  ? 'border-success-400 bg-success-50' 
                  : 'border-neutral-300 hover:border-primary-300 hover:bg-primary-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? (
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-success-600" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-neutral-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Upload size={32} className="text-neutral-400 mb-2" />
                <p className="font-medium text-neutral-700 mb-1">
                  Drag & drop your PDF file here
                </p>
                <p className="text-sm text-neutral-500 mb-2">
                  or click to browse files
                </p>
                <p className="text-xs text-neutral-400">
                  Maximum file size: 10MB
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            className="btn-outline"
            onClick={onCancel}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Upload Document</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUploader;
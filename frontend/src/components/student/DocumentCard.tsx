import React, { useState } from 'react';
import { Document } from '../../types';
import { FileText, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface DocumentCardProps {
  document: Document;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const [expanded, setExpanded] = useState(false);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const getStatusIcon = () => {
    switch (document.status) {
      case 'analyzing':
        return <Clock size={16} className="text-warning-500" />;
      case 'analyzed':
        return <CheckCircle size={16} className="text-success-500" />;
      case 'failed':
        return <XCircle size={16} className="text-error-500" />;
      default:
        return null;
    }
  };
  
  const getStatusText = () => {
    switch (document.status) {
      case 'analyzing':
        return 'Analyzing';
      case 'analyzed':
        return 'Analysis Complete';
      case 'failed':
        return 'Analysis Failed';
      default:
        return '';
    }
  };
  
  return (
    <div className="card hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className="bg-primary-100 p-3 rounded-lg">
          <FileText size={20} className="text-primary-700" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{document.title}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600 mb-3">
            <span>{document.fileName}</span>
            <span>Uploaded {formatDate(document.uploadDate)}</span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            {getStatusIcon()}
            <span className="text-sm font-medium">
              {getStatusText()}
            </span>
          </div>
          
          {document.status === 'analyzed' && document.analysis && (
            <button
              className="text-primary-600 text-sm font-medium flex items-center gap-1"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Hide Analysis' : 'View Analysis'}
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>
      
      {expanded && document.analysis && (
        <div className="mt-4 pt-4 border-t border-neutral-200 animate-fade-in">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-neutral-700 mb-2">Summary</h4>
            <p className="text-sm text-neutral-600">{document.analysis.summary}</p>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-neutral-700 mb-2">Key Points</h4>
            <ul className="space-y-1">
              {document.analysis.keyPoints.map((point, index) => (
                <li key={index} className="text-sm text-neutral-600 flex gap-2">
                  <span className="text-primary-500">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-neutral-700 mb-2">Topics</h4>
            <div className="flex flex-wrap gap-2">
              {document.analysis.topics.map((topic, index) => (
                <div key={index} className="bg-neutral-100 px-3 py-1 rounded-full text-xs">
                  {topic.name} ({(topic.confidence * 100).toFixed(0)}%)
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
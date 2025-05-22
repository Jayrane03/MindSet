import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Loader2, Bot, X, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import { createWorker } from 'tesseract.js';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      content: 'Hello! Upload a PDF document, and I can answer questions about its content.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentText, setDocumentText] = useState<string>('');
  const [isDocumentReady, setIsDocumentReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const apiConfig = {
    baseURL: 'https://api.together.xyz/v1',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_TOGETHER_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  const LLM_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';
  const MAX_LLM_CONTEXT_CHARS = 120000;

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingIndicator]);

  useEffect(() => {
    if (!isProcessing && isDocumentReady) {
      inputRef.current?.focus();
    }
  }, [isProcessing, isDocumentReady]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const extractTextLayerFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + ' ';
      }

      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text layer:', error);
      return '';
    }
  };

  const performOcrOnPdf = async (file: File): Promise<string> => {
    addMessage('bot', 'Attempting OCR to extract text from images...');
    const worker = await createWorker('eng');
    let ocrText = '';

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        const { data: { text } } = await worker.recognize(canvas);
        ocrText += text + ' ';

        canvas.remove();
      }

      await worker.terminate();
      return ocrText.trim();

    } catch (error) {
      console.error('Error during OCR:', error);
      await worker.terminate();
      throw new Error('OCR processing failed.');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    // Reset messages, preserve only welcome
    setMessages(prev => prev.slice(0, 1));
    setDocumentText('');
    setSelectedFile(null);
    setIsDocumentReady(false);

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        addMessage('bot', 'Please upload a PDF file.');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      if (file.size > 25 * 1024 * 1024) {
        addMessage('bot', 'Warning: This is a large file. Extraction or OCR may take a long time.');
      }

      setSelectedFile(file);
      addMessage('bot', `PDF "${file.name}" selected. Attempting to extract text...`);
      setIsProcessing(true);

      let extractedText = '';

      try {
        extractedText = await extractTextLayerFromPDF(file);

        if (extractedText.length > 0) {
          addMessage('bot', `Text extracted from "${file.name}". You can now ask me questions about its content.`);
          setDocumentText(extractedText);
          setIsDocumentReady(true);

        } else {
          addMessage('bot', 'No text layer found. Trying to read text from images (OCR)...');
          extractedText = await performOcrOnPdf(file);

          if (extractedText.length > 0) {
            addMessage('bot', `OCR completed. Text extracted from "${file.name}". You can now ask me questions about its content.`);
            setDocumentText(extractedText);
            setIsDocumentReady(true);
          } else {
            setError('Failed to extract any readable text using both methods.');
            addMessage('bot', 'Sorry, I was unable to extract any readable text from that PDF.');
            setDocumentText('');
            setSelectedFile(null);
            setIsDocumentReady(false);
          }
        }

      } catch (error) {
        console.error('Error during PDF processing:', error);
        setError(`Failed to process PDF file: ${error instanceof Error ? error.message : 'An unknown error occurred'}.`);
        addMessage('bot', 'Sorry, I encountered an error processing that PDF. Please try again later.');
        setDocumentText('');
        setSelectedFile(null);
        setIsDocumentReady(false);

      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const addMessage = (type: 'user' | 'bot', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = async (message: string) => {
    setTypingIndicator(true);
    const words = message.split(' ');
    let partialMessage = '';

    for (const word of words) {
      partialMessage += word + ' ';
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.type === 'bot' && lastMessage.id === 'typing') {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, content: partialMessage }
          ];
        }
        return [
          ...prev,
          { id: 'typing', type: 'bot', content: partialMessage, timestamp: new Date() }
        ];
      });
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
    }

    setTypingIndicator(false);
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage.id === 'typing') {
        return [
          ...prev.slice(0, -1),
          { ...lastMessage, id: Date.now().toString() }
        ];
      }
      return prev;
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('user', userMessage);

    if (!documentText || !isDocumentReady || isProcessing) {
      if (isProcessing) {
        addMessage('bot', 'I am currently processing. Please wait.');
      } else {
        addMessage('bot', 'Sorry, I cannot answer questions because I have no extracted document text.');
      }
      return;
    }

    setIsProcessing(true);
    try {
      const trimmedDocumentText = documentText.substring(0, MAX_LLM_CONTEXT_CHARS);

      if (documentText.length > MAX_LLM_CONTEXT_CHARS) {
        addMessage('bot', 'Note: Document text was truncated to fit the AI context window.');
      }

      const prompt = `You are a helpful assistant that answers questions based on the provided document text.
Answer the user's question truthfully using only the information in the following text.
If the answer cannot be found, say so and do not invent an answer.

Document Text:
'''
${trimmedDocumentText}
'''

Question: ${userMessage}

Answer:`;

      const togetherChatResponse = await axios.post(
        `${apiConfig.baseURL}/chat/completions`,
        {
          model: LLM_MODEL,
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 700,
          temperature: 0.1,
          top_p: 0.9
        },
        { headers: apiConfig.headers }
      );

      const botResponseContent = togetherChatResponse.data?.choices?.[0]?.message?.content?.trim();

      if (botResponseContent) {
        await simulateTyping(botResponseContent);
      } else {
        addMessage('bot', 'Sorry, I received an empty response from the AI. Could you please try again?');
      }

    } catch (error) {
      console.error('Error calling Together AI Chat API:', error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message;

        if (status === 401) {
          setError('API Key invalid or missing. Check your VITE_TOGETHER_API_KEY.');
          addMessage('bot', 'Configuration error: My AI access is not set up correctly.');
        } else if (
          status === 400 &&
          (errorMessage.includes('limit') ||
           errorMessage.includes('context window') ||
           errorMessage.includes('length') ||
           errorMessage.includes('token'))
        ) {
          setError('Document content plus your question exceeded the AI limit.');
          addMessage('bot', 'Sorry, the document plus your question is too large for me to process at once.');
        } else {
          setError(`API Error (${status || 'unknown'}): ${errorMessage}`);
          addMessage('bot', 'Sorry, I encountered an error. Please try again.');
        }
      } else {
        setError(`Unexpected error: ${String(error)}`);
        addMessage('bot', 'Sorry, an unexpected error occurred. Please try again.');
      }

    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Minimized state UI
  if (isMinimized) {
    return (
      <div className="fixed z-50 bottom-6 right-6 sm:bottom-8 sm:right-8 md:bottom-10 md:right-10 w-72 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-xl overflow-hidden">
        <div
          className="p-4 text-white flex items-center justify-between cursor-pointer"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center gap-2">
            <Bot size={20} />
            <h3 className="font-semibold">Mindset AI Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <ChevronUp size={20} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed z-50 bottom-6 right-6 sm:bottom-8 sm:right-8 
                 md:bottom-10 md:right-10 w-[95%] sm:w-96 md:w-[28rem] 
                 max-h-[85vh] bg-white rounded-xl shadow-2xl 
                 flex flex-col overflow-hidden animate-slide-up"
    >
      {/* Header */}
      <div
        className="p-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white
                   flex items-center justify-between cursor-pointer"
        onClick={() => setIsMinimized(true)}
      >
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <h3 className="font-semibold">Mindset AI Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
          <ChevronDown
            size={20}
            className="text-white/80 hover:text-white transition-colors"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4 bg-gray-50">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 text-sm leading-relaxed 
                          rounded-lg shadow-sm 
                          ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none'
                              : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                          }
                        `}
            >
              {message.content}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {typingIndicator && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 max-w-[80%] rounded-lg p-3 border border-gray-200 rounded-bl-none shadow-sm">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertTriangle size={16} />
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input / Upload */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2 mb-4 items-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`px-3 py-2 border rounded-md transition-colors flex items-center gap-2 text-sm 
              ${
                selectedFile
                  ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            disabled={isProcessing}
          >
            <FileText size={16} />
            {selectedFile ? 'Change PDF' : 'Upload PDF'}
          </button>
          <div
            className={`flex-1 truncate text-sm px-2 py-1 rounded 
              ${selectedFile ? 'text-gray-700' : 'text-gray-500 italic'}
            `}
          >
            {selectedFile ? selectedFile.name : 'No PDF selected'}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              isDocumentReady
                ? 'Ask a question about the PDF...'
                : isProcessing
                ? 'Processing PDF...'
                : 'Upload a PDF to start...'
            }
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent disabled:opacity-50 
                       disabled:cursor-not-allowed transition-all"
            onKeyPress={handleInputKeyPress}
            disabled={isProcessing || !isDocumentReady}
          />
          <button
            className={`p-2 rounded-full transition-colors flex-shrink-0
              ${
                isProcessing || !isDocumentReady || !inputMessage.trim()
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600'
              }
            `}
            onClick={handleSendMessage}
            disabled={isProcessing || !isDocumentReady || !inputMessage.trim()}
          >
            {isProcessing ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatBot;

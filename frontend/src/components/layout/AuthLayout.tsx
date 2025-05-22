import React from 'react';
import { Book } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <Book size={40} className="text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Mindset</h1>
          <p className="text-primary-100">Educational Platform</p>
        </div>
        <div className="bg-white rounded-xl shadow-xl overflow-hidden animate-scale-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
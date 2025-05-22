import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<User>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

const login = async (email: string, password: string, role: UserRole): Promise<User> => {
  const res = await axios.post('http://localhost:5000/api/auth/login', {
    email,
    password,
    role
  });

  const { user, token } = res.data;
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
  setCurrentUser(user);
  return user;
};


  const register = async (name: string, email: string, password: string, role: UserRole) => {
    await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role });
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

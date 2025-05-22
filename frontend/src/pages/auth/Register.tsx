import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { UserPlus, Loader, UserCog, GraduationCap } from 'lucide-react';
import type { UserRole } from '../../types';


const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name || !role) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (role === 'admin' && adminKey !== '123Admin') {
      showToast('Invalid admin key', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
  await register(name, email, password, role);
      showToast('Registration successful! Please log in.', 'success');
      navigate('/login');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      if (errorMessage.includes('user_already_exists')) {
        showToast('This email is already registered. Please log in instead.', 'error');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Create Account</h2>
      <p className="text-neutral-600 mb-6">Join Mindset to enhance your learning journey</p>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Select Role
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`p-4 rounded-lg border-2 transition-all ${
                role === 'student'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-primary-100">
                  <GraduationCap size={24} className="text-primary-600" />
                </div>
                <span className="font-medium">Student</span>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`p-4 rounded-lg border-2 transition-all ${
                role === 'admin'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-primary-100">
                  <UserCog size={24} className="text-primary-600" />
                </div>
                <span className="font-medium">Admin</span>
              </div>
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="John Doe"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

{role === 'admin' && (
  <input
    type="text"
    value={adminKey}
    onChange={(e) => setAdminKey(e.target.value)}
    placeholder="Enter Admin Key"
  />
)}

        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={18} />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <UserPlus size={18} />
              <span>Create Account</span>
            </>
          )}
        </button>

        <p className="text-center text-sm text-neutral-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { LogIn } from 'lucide-react';
import type { UserRole } from '../../types';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  // const [role, setRole] = useState<'admin' | 'student'>('student'); // Default to 'student'
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !role) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);

    try {
     const user = await login(email, password, role as UserRole);
 // pass role too

      if (user?.role === 'admin') {
        navigate('/admin');
        console.log('Admin user logged in:', user);
      } else if (user?.role === 'student') {
        navigate('/student');
        console.log('Student user logged in:', user); 
      }
      showToast(`Welcome back, ${user.name}!`, 'success');
    } catch (error: any) {
      console.error('Login error:', error);

      if (error.response?.data?.message) {
        showToast(error.response.data.message, 'error');
      } else if (error.message) {
        showToast(error.message, 'error');
      } else {
        showToast('An unexpected error occurred during login', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Welcome Back</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
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
            required
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
            required
          />
        </div>

       <div>
  <label htmlFor="role" className="block text-sm font-medium text-neutral-700 mb-1">
    Select Role
  </label>
  <select
    id="role"
    value={role}
    onChange={(e) => setRole(e.target.value)}
    className="input"
    required
    disabled={loading}
  >
    <option value="">-- Choose Role --</option>
    <option value="admin">Admin</option>
    <option value="student">Student</option>
  </select>
</div>

        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <>
              <LogIn size={18} />
              <span>Log In</span>
            </>
          )}
        </button>

        <p className="text-center text-sm text-neutral-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;


import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      await authService.login(email, password);
      // Login successful
      setIsLoading(false);
      setEmail('');
      setPassword('');
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative bg-[#013328] border border-[#f4a261]/30 w-full max-w-md rounded-2xl shadow-2xl p-8 animate-[fadeIn_0.3s_ease-out]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#ede9d6]/60 hover:text-[#f4a261] transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#ede9d6] mb-2">Welcome Back</h2>
          <p className="text-[#ede9d6]/60 text-sm">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#ede9d6]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ede9d6]/50" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#021a15] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-[#ede9d6] focus:outline-none focus:border-[#f4a261] transition-colors placeholder-[#ede9d6]/30"
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#ede9d6]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ede9d6]/50" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#021a15] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-[#ede9d6] focus:outline-none focus:border-[#f4a261] transition-colors placeholder-[#ede9d6]/30"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="rounded bg-[#021a15] border-white/10 text-[#f4a261] focus:ring-0 accent-[#f4a261]" defaultChecked />
              <span className="text-[#ede9d6]/60 group-hover:text-[#ede9d6] transition-colors">Remember me</span>
            </label>
            <a href="#" className="text-[#f4a261] hover:text-[#e67e22] transition-colors">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#f4a261] text-[#013328] font-bold py-3 rounded-lg hover:bg-[#e67e22] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;

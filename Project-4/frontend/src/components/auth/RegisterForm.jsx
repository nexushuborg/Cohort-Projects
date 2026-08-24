import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/useAuthStore';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      const res = await authService.register(data);
      if (res.data?.token) {
        setAuth(res.data.user || { name: data.name, email: data.email }, res.data.token);
        navigate('/workspaces');
      } else {
        setAuth({ name: data.name, email: data.email }, 'mock-jwt-token');
        navigate('/workspaces');
      }
    } catch (err) {
      setServerError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xl text-white mx-auto">
          CT
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Create Account</h2>
        <p className="text-xs text-slate-400">Join Collaborative Task Management</p>
      </div>

      {serverError && <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-400">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              {...register('name', { required: 'Name required', minLength: { value: 2, message: 'Min 2 chars' } })}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              {...register('password', {
                required: 'Password required',
                minLength: { value: 8, message: 'Min 8 chars' },
                pattern: { value: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, message: '1 uppercase, 1 number, 1 special char' },
              })}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
          {isSubmitting ? 'Creating account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Already have an account? <Link to="/login" className="text-blue-400 font-semibold hover:underline">Sign In</Link>
      </div>
    </div>
  );
};
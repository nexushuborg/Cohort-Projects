import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/useAuthStore';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginForm = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');

      const res = await authService.login(data);
      const responseData = res?.data?.data ?? res?.data;

      const accessToken = responseData?.accessToken;
      const user = responseData?.user;

      if (!accessToken) {
        throw new Error('Login succeeded but no access token was returned.');
      }

      setAuth(
        user || {
          email: data.email,
          name: data.email.split('@')[0],
        },
        accessToken
      );

      navigate('/workspaces');
    } catch (err) {
      setServerError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xl text-white mx-auto">
          CT
        </div>

        <h2 className="text-2xl font-bold text-slate-100">
          Welcome Back
        </h2>

        <p className="text-xs text-slate-400">
          Sign in to Collaborative Task Management
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-400"
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-medium text-slate-300 mb-1"
          >
            Email
          </label>

          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={
                errors.email ? 'login-email-error' : undefined
              }
              {...register('email', {
                required: 'Email required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email',
                },
              })}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {errors.email && (
            <p
              id="login-email-error"
              className="text-red-400 text-xs mt-1"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-xs font-medium text-slate-300 mb-1"
          >
            Password
          </label>

          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={
                errors.password ? 'login-password-error' : undefined
              }
              {...register('password', {
                required: 'Password required',
              })}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {errors.password && (
            <p
              id="login-password-error"
              className="text-red-400 text-xs mt-1"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="text-blue-400 font-semibold hover:underline"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
};
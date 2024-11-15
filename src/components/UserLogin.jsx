import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function UserLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (data?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('type')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        if (profile) {
          localStorage.setItem('userRole', profile.type);

          switch (profile.type) {
            case 'participant':
              navigate('/participant/dashboard');
              break;
            case 'volunteer':
              navigate('/volunteer/dashboard');
              break;
            case 'both':
              navigate('/participant/dashboard');
              break;
            default:
              navigate('/participant/dashboard');
          }
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage('Password reset instructions have been sent to your email');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message || 'Failed to send reset instructions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {showForgotPassword ? 'Reset Password' : 'Welcome Back'}
          </h2>
          {!showForgotPassword && (
            <p className="mt-2 text-center text-sm text-blue-200">
              Or{' '}
              <Link to="/register" className="font-medium text-blue-300 hover:text-blue-200 underline">
                register for the hackathon
              </Link>
            </p>
          )}
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg bg-green-500/10 p-4 backdrop-blur-sm"
          >
            <div className="text-sm text-green-200">{message}</div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg bg-red-500/10 p-4 backdrop-blur-sm"
          >
            <div className="text-sm text-red-200">{error}</div>
          </motion.div>
        )}

        {showForgotPassword ? (
          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label htmlFor="reset-email" className="sr-only">Email address</label>
              <input
                id="reset-email"
                type="email"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-white/10 placeholder-gray-400 text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                placeholder="Enter your email address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </motion.button>
              
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full flex justify-center py-3 px-4 border border-white/20 text-sm font-medium rounded-xl text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  type="email"
                  required
                  className="appearance-none rounded-t-xl relative block w-full px-4 py-3 border border-white/10 placeholder-gray-400 text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Email address"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  className="appearance-none rounded-b-xl relative block w-full px-4 py-3 border border-white/10 placeholder-gray-400 text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-300 hover:text-blue-200"
              >
                Forgot your password?
              </button>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useSEO } from '../hooks/useSEO';

const ForgotPasswordPage = () => {
  useSEO('Forgot Password', 'Reset your password.');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Simulate sending an email
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <div className="flex justify-center items-center py-2">
        <div className="w-full max-w-md bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg p-8 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-200 mb-2">Reset Password</h2>
          
          {submitted ? (
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-300 my-6">If an account with the email <strong>{email}</strong> exists, we have sent a password reset link.</p>
              <Link to="/login" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
                Enter your email address and we will send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-2 font-semibold" htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 rounded-md bg-white/80 dark:bg-slate-700/80 border-2 border-slate-300/50 dark:border-slate-600/50 focus:border-cyan-500 focus:ring-cyan-500 transition-all text-slate-800 dark:text-slate-200"
                    placeholder="you@example.com"
                  />
                </div>
                <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg">
                  Send Reset Link
                </button>
              </form>
              <p className="text-center text-slate-500 dark:text-slate-400 mt-8">
                Remember your password?{' '}
                <Link to="/login" className="text-cyan-600 hover:underline font-semibold">
                  Login here
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

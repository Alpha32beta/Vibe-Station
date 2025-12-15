'use client'

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SignupPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { strength: 0, text: '', color: '' };
    if (pass.length < 6) return { strength: 1, text: 'Weak', color: 'bg-red-500' };
    if (pass.length < 8) return { strength: 2, text: 'Fair', color: 'bg-yellow-500' };
    
    let score = 2;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score >= 4) return { strength: 4, text: 'Strong', color: 'bg-green-500' };
    return { strength: 3, text: 'Good', color: 'bg-blue-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-spotify-black to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white">Vibe Station</h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Sign up for free</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-black rounded-lg p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded">
              Account created successfully! Redirecting...
            </div>
          )}

          <div>
            <label className="block text-white font-semibold mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full px-4 py-3 bg-spotify-gray text-white rounded border border-gray-700 focus:border-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-3 bg-spotify-gray text-white rounded border border-gray-700 focus:border-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              required
              className="w-full px-4 py-3 bg-spotify-gray text-white rounded border border-gray-700 focus:border-white focus:outline-none"
            />
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded ${
                        level <= passwordStrength.strength
                          ? passwordStrength.color
                          : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${passwordStrength.color.replace('bg-', 'text-')}`}>
                  Password strength: {passwordStrength.text}
                </p>
                {password.length < 6 && (
                  <p className="text-xs text-red-400 mt-1">Must be at least 6 characters</p>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-black font-bold py-3 rounded-full hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-white underline hover:text-green-500">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

// Email validation helper
const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  // Check if email is empty
  if (!email || !email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }

  // Check basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  // Check for common invalid patterns
  const lowercaseEmail = email.toLowerCase();
  
  // Block common test/fake domains
  const fakeDomains = ['test.com', 'fake.com', 'example.com', 'temp.com', 'throwaway.com'];
  const domain = lowercaseEmail.split('@')[1];
  if (fakeDomains.includes(domain)) {
    return { isValid: false, message: 'Please use a real email address' };
  }

  // Check for obviously fake patterns
  if (
    lowercaseEmail.includes('test@') ||
    lowercaseEmail.includes('fake@') ||
    lowercaseEmail.includes('dummy@') ||
    lowercaseEmail.startsWith('test') && lowercaseEmail.includes('@test')
  ) {
    return { isValid: false, message: 'Please use a real email address' };
  }

  // Check minimum domain length (e.g., a@b.c is suspicious)
  const [localPart, domainPart] = email.split('@');
  if (localPart.length < 2 || domainPart.length < 5) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // Validate email format first
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { error: { message: emailValidation.message } };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    // DETAILED DEBUG LOGGING
    console.log('=== SIGNUP DEBUG ===');
    console.log('Full response:', { data, error });
    console.log('Has error?', !!error);
    console.log('Error message:', error?.message);
    console.log('Has data?', !!data);
    console.log('Has user?', !!data?.user);
    console.log('User ID:', data?.user?.id);
    console.log('Identities:', data?.user?.identities);
    console.log('Identities length:', data?.user?.identities?.length);
    console.log('===================');

    if (error) {
      console.log('ERROR PATH: Error exists');
      if (error.message.includes('already registered')) {
        console.log('ERROR PATH: Message includes "already registered"');
        return { 
          error: { 
            message: 'This email is already registered. Please sign in instead.' 
          } 
        };
      } else if (error.message.includes('User already registered')) {
        console.log('ERROR PATH: Message includes "User already registered"');
        return { 
          error: { 
            message: 'An account with this email already exists. Try signing in.' 
          } 
        };
      } else {
        console.log('ERROR PATH: Other error:', error.message);
        return { error };
      }
    } else {
      console.log('SUCCESS PATH: No error, checking identities');
      // Check if email already exists (Supabase returns user but with empty identities array)
      if (data?.user?.identities && data.user.identities.length === 0) {
        console.log('SUCCESS PATH: Identities array is empty - DUPLICATE EMAIL!');
        return { 
          error: { 
            message: 'This email is already registered. Please sign in instead.' 
          } 
        };
      } else {
        console.log('SUCCESS PATH: New user created successfully');
      }
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    // Validate email format first
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { error: { message: emailValidation.message } };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Doctor {
  name: string;
}

interface AuthContextType {
  doctor: Doctor | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  //new code to get doctor name from login
    useEffect(() => {
      const storedDoctor = localStorage.getItem('doctor');
      if (storedDoctor) {
        //console.log('[DEBUG] restoring doctor from localStorage:', storedDoctor);
        setDoctor(JSON.parse(storedDoctor));
      } else {
        //console.log('[DEBUG] no doctor in localStorage');
      }
    }, []);

  const login = async (username: string, password: string) => {
    // This is a dummy authentication
    // In a real app, this would make an API call to your backend
    if (username === 'admin' && password === 'vtehr') {
      const doctorInfo = { name: 'Dr. Ilponen' };
      setDoctor(doctorInfo);
       localStorage.setItem('doctor', JSON.stringify(doctorInfo));
      return true;
    }
    return false;
  };

  const logout = () => {
    // Clear all transcription data from localStorage
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('transcription_')) {
          localStorage.removeItem(key);
        }
      });
    }
    setDoctor(null);
  };

  return (
    <AuthContext.Provider value={{ doctor, login, logout }}>
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
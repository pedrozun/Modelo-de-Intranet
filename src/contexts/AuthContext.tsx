import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticate, clearAuth, checkSession } from '../services/authService';

interface User {
  username: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Verificar a sessão ao iniciar e quando houver mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const isValid = checkSession();
      if (!isValid && isAuthenticated) {
        setIsAuthenticated(false);
        setUser(null);
        navigate('/login');
      }
    };

    // Verificar sessão inicial
    const initialCheck = () => {
      const isValid = checkSession();
      if (isValid) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          clearAuth();
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    initialCheck();

    // Adicionar listener para mudanças no localStorage
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate, isAuthenticated]);

  const login = async (username: string, password: string) => {
    const result = await authenticate(username, password);
    
    if (result.success && result.userData) {
      setIsAuthenticated(true);
      setUser(result.userData);
      localStorage.setItem('user', JSON.stringify(result.userData));
    } else {
      throw new Error('Credenciais inválidas');
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkSession, clearAuth, hasRequiredGroup } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredGroup?: string;
}

export function ProtectedRoute({ children, requiredGroup }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!checkSession()) {
      clearAuth();
    }
  }, [location]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredGroup && !hasRequiredGroup(requiredGroup)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
import { 
  STORAGE_KEYS, 
  setSessionItem, 
  clearSession, 
  isSessionValid 
} from './sessionManager';

interface AuthResult {
  success: boolean;
  userData?: {
    username: string;
    role?: string;
    groups?: string[];
  };
}

let authToken: string | null = null;

export function getAuthToken(): string {
  if (!authToken) {
    const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!storedToken) {
      throw new Error('No authentication token found');
    }
    authToken = storedToken;
  }
  return authToken;
}

export function isValidToken(token: string): boolean {
  try {
    const [username, password] = atob(token).split(':');
    return Boolean(username && password);
  } catch {
    return false;
  }
}

export function checkSession(): boolean {
  return isSessionValid();
}

export function getUserGroups(): string[] {
  const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
  return user.groups || [];
}

export function hasRequiredGroup(requiredGroup?: string): boolean {
  if (!requiredGroup || import.meta.env.VITE_USE_AD_AUTH !== 'true') {
    return true;
  }
  const userGroups = getUserGroups();
  return userGroups.includes(requiredGroup);
}

export async function authenticate(username: string, password: string): Promise<AuthResult> {
  try {
    const useAD = import.meta.env.VITE_USE_AD_AUTH === 'true';
    
    if (useAD) {
      const response = await fetch('/api/auth/ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      
      if (data.success) {
        const token = btoa(`${username}:${password}`);
        setSessionItem('AUTH_TOKEN', token);
        setSessionItem('IS_AUTHENTICATED', 'true');
        authToken = token;
        
        const userData = {
          username,
          role: data.userData?.role || 'user',
          groups: data.userData?.groups || []
        };
        
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        
        return {
          success: true,
          userData
        };
      }
      
      return { success: false };
    } else {
      const devUsername = import.meta.env.VITE_DEV_USERNAME;
      const devPassword = import.meta.env.VITE_DEV_PASSWORD;
      
      const isValid = username === devUsername && password === devPassword;
      
      if (isValid) {
        const token = btoa(`${username}:${password}`);
        setSessionItem('AUTH_TOKEN', token);
        setSessionItem('IS_AUTHENTICATED', 'true');
        authToken = token;
        
        const userData = {
          username: devUsername,
          role: 'admin',
          groups: ['Sistema_Office_KM', 'Dashboard_Tarefas']
        };
        
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        
        return {
          success: true,
          userData
        };
      }
      
      return { success: false };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false };
  }
}

export function clearAuth(): void {
  clearSession();
  authToken = null;
}
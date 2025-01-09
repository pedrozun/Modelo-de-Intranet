// Constantes para chaves de armazenamento
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
  IS_AUTHENTICATED: 'isAuthenticated'
} as const;

// Gerenciamento de sessão
export function getSessionItem(key: keyof typeof STORAGE_KEYS) {
  return localStorage.getItem(STORAGE_KEYS[key]);
}

export function setSessionItem(key: keyof typeof STORAGE_KEYS, value: string) {
  localStorage.setItem(STORAGE_KEYS[key], value);
  if (key === 'IS_AUTHENTICATED') {
    sessionStorage.setItem(STORAGE_KEYS[key], value);
  }
}

export function removeSessionItem(key: keyof typeof STORAGE_KEYS) {
  localStorage.removeItem(STORAGE_KEYS[key]);
  if (key === 'IS_AUTHENTICATED') {
    sessionStorage.removeItem(STORAGE_KEYS[key]);
  }
}

export function clearSession() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

export function isSessionValid(): boolean {
  const authToken = getSessionItem('AUTH_TOKEN');
  const user = getSessionItem('USER');
  const isAuthenticated = sessionStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
  
  return Boolean(authToken && user && isAuthenticated);
}
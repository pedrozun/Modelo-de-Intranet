interface ADConfig {
  server: string;
  domain: string;
  port: number;
}

const AD_CONFIG: ADConfig = {
  server: 'ldap://192.168.100.200',
  domain: 'km.srv.br',
  port: 389
};

export async function authenticateWithAD(username: string, password: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/ad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password
      }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('AD Authentication error:', error);
    throw error;
  }
}
import dotenv from 'dotenv';
import { LDAPService } from '../services/ldapService.js';

dotenv.config();

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const [username, password] = Buffer.from(token, 'base64')
      .toString()
      .split(':');

    if (!username || !password) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const useAD = process.env.VITE_USE_AD_AUTH === 'true';

    if (useAD) {
      const ldapService = new LDAPService();
      const authResult = await ldapService.authenticate(username, password);

      if (!authResult.authenticated) {
        return res
          .status(401)
          .json({ message: 'Unauthorized - Invalid credentials' });
      }

      // Se `authResult.userData` for nulo, garantimos um usuário mínimo com username
      req.user = authResult.userData || { username };
    } else {
      const devUsername = process.env.VITE_DEV_USERNAME;
      const devPassword = process.env.VITE_DEV_PASSWORD;

      if (username !== devUsername || password !== devPassword) {
        return res
          .status(401)
          .json({ message: 'Unauthorized - Invalid credentials' });
      }

      req.user = { username: devUsername };
    }

    console.log('Usuário autenticado:', req.user); // Log para depuração

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

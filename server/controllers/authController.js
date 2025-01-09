import { LDAPService } from '../services/ldapService.js';

export class AuthController {
  constructor() {
    this.ldapService = new LDAPService();
  }

  async login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuário e senha são obrigatórios'
      });
    }

    try {
      const result = await this.ldapService.authenticate(username, password);
      
      if (result.authenticated) {
        // Include groups in the response
        const userData = {
          username: result.userData.sAMAccountName || username,
          displayName: result.userData.displayName,
          email: result.userData.mail,
          department: result.userData.department,
          groups: result.userData.groups || []
        };

        res.json({
          success: true,
          userData
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}
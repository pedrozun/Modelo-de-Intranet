import ldap from 'ldapjs';
import { ldapConfig } from '../config/ldapConfig.js';

export class LDAPService {
  constructor() {
    this.config = ldapConfig;
  }

  async authenticate(username, password) {
    return new Promise((resolve, reject) => {
      const client = ldap.createClient({
        url: this.config.server,
        reconnect: true,
      });

      client.on('error', (err) => {
        console.error('LDAP connection error:', err);
        reject(new Error('Erro de conexão com o servidor LDAP'));
      });

      const userDN = `${username}@${this.config.domain}`;

      client.bind(userDN, password, (err) => {
        if (err) {
          console.error('LDAP bind error:', err);
          client.destroy();
          resolve({ authenticated: false, userData: null });
          return;
        }

        const searchOptions = {
          filter: `(sAMAccountName=${username})`,
          scope: 'sub',
          attributes: [
            'cn',
            'displayName',
            'mail',
            'department',
            'sAMAccountName',
            'memberOf'
          ],
        };

        client.search(this.config.baseDN, searchOptions, (err, res) => {
          if (err) {
            console.error('LDAP search error:', err);
            client.destroy();
            reject(new Error('Erro ao buscar informações do usuário'));
            return;
          }

          let userData = null;

          res.on('searchEntry', (entry) => {
            // Convert the raw entry to a plain object
            const user = {
              ...entry.pojo, 
              memberOf: entry.pojo.attributes.find(attr => attr.type === 'memberOf')?.values || []
            };

            userData = {
              username: username,
              displayName: entry.pojo.attributes.find(attr => attr.type === 'displayName')?.values[0],
              mail: entry.pojo.attributes.find(attr => attr.type === 'mail')?.values[0],
              department: entry.pojo.attributes.find(attr => attr.type === 'department')?.values[0],
              groups: user.memberOf.map(dn => {
                const match = dn.match(/CN=([^,]+)/);
                return match ? match[1] : null;
              }).filter(Boolean)
            };
          });

          res.on('error', (err) => {
            console.error('Search error:', err);
            client.destroy();
            reject(new Error('Erro na busca LDAP'));
          });

          res.on('end', () => {
            client.destroy();
            if (!userData) {
              userData = { 
                username,
                groups: []
              };
            }
            resolve({ authenticated: true, userData });
          });
        });
      });
    });
  }
}
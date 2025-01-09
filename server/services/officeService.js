// services/officeService.js
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_SERVERNAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export class OfficeService {
  async getClients() {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute(
        'SELECT Cliente, NomeFant FROM clientes'
      );
      return rows;
    } finally {
      await connection.end();
    }
  }

  async createClient(name, acronym) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Check if client exists
      const [existing] = await connection.execute(
        'SELECT * FROM clientes WHERE Cliente = ?',
        [acronym]
      );

      if (existing.length > 0) {
        throw new Error('Já existe esta SIGLA.');
      }

      // Insert new client
      await connection.execute(
        'INSERT INTO clientes (Cliente, NomeFant) VALUES (?, ?)',
        [acronym, name]
      );

      return { message: 'Cliente cadastrado com sucesso' };
    } finally {
      await connection.end();
    }
  }

  async getProducts() {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute(
        'SELECT Produto, nome FROM produtos'
      );
      return rows;
    } finally {
      await connection.end();
    }
  }

  async createBatch(clientName, productName, quantity) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Get client code
      const [clientResult] = await connection.execute(
        'SELECT Cliente FROM clientes WHERE NomeFant = ?',
        [clientName]
      );

      if (clientResult.length === 0) {
        throw new Error('Cliente não encontrado');
      }
      const clientCode = clientResult[0].Cliente;

      // Get product code
      const [productResult] = await connection.execute(
        'SELECT Produto FROM produtos WHERE nome = ?',
        [productName]
      );

      if (productResult.length === 0) {
        throw new Error('Produto não encontrado');
      }
      const productCode = productResult[0].Produto;

      // Generate batch code
      const batchCode = this.generateBatchCode();

      // Insert batch
      await connection.execute(
        'INSERT INTO lotes (Lote, Cliente, TamLote, LoteUSO, Produto) VALUES (?, ?, ?, ?, ?)',
        [batchCode, clientCode, quantity, 0, productCode]
      );

      return {
        message: 'Lote criado com sucesso',
        batchCode,
        clientCode,
      };
    } finally {
      await connection.end();
    }
  }

  generateBatchCode(length = 10) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += characters[Math.floor(Math.random() * characters.length)];
    }
    return code;
  }
}

// backend/config/db.js - Configuração da conexão com o banco de dados MySQL
// Este arquivo configura e testa a conexão com o banco de dados MySQL usando variáveis de ambiente.
// Ele cria um pool de conexões para eficiência e exporta para uso em outros arquivos.

const mysql = require('mysql2/promise'); // Biblioteca para conectar ao MySQL com suporte a Promises
require('dotenv').config({ path: '../.env' }); // Carrega variáveis de ambiente do arquivo .env na raiz do projeto

// Logs para depuração: mostra as variáveis de ambiente carregadas (remover em produção)
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);

// Cria um pool de conexões MySQL para reutilização e melhor performance
const connection = mysql.createPool({
  host: process.env.DB_HOST, // Endereço do servidor MySQL
  user: process.env.DB_USER, // Nome do usuário do banco
  password: process.env.DB_PASSWORD, // Senha do usuário
  database: process.env.DB_NAME, // Nome do banco de dados
  port: process.env.DB_PORT || 3306 // Porta do MySQL (padrão 3306)
});

// Testa a conexão ao iniciar
connection.getConnection()
  .then(() => console.log('✅ Conexão MySQL estabelecida com sucesso!'))
  .catch(err => console.error('Erro na conexão MySQL:', err.message));

// Exporta o pool de conexões para uso em controllers e rotas
module.exports = connection;

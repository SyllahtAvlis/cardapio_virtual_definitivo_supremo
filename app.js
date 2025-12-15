// app.js - Arquivo principal do servidor backend
// Este arquivo configura e inicia o servidor Express.js para a aplicação de cardápio virtual.
// Ele conecta ao banco de dados MySQL, define rotas da API e serve arquivos estáticos.

const express = require('express'); // Framework para criar o servidor web
const cors = require('cors'); // Permite requisições de diferentes origens (Cross-Origin Resource Sharing)

// Carrega variáveis de ambiente do arquivo .env (como senhas e configurações)
require('dotenv').config({ path: '.env' });
const path = require('path'); // Módulo para trabalhar com caminhos de arquivos

// Conecta ao banco de dados MySQL usando as configurações do arquivo db.js
const db = require('./backend/config/db');

// Importa as rotas (endpoints) da API para usuários, produtos e pedidos
const usuarioRoutes = require('./backend/routes/usuario');
const produtoRoutes = require('./backend/routes/produto');
const pedidoRoutes = require('./backend/routes/pedido');

const app = express(); // Cria uma instância do aplicativo Express
const port = process.env.PORT || 3000; // Porta do servidor (usa variável de ambiente ou 3000)

// Serve arquivos estáticos (CSS, JS, imagens) da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares para processar requisições
app.use(cors()); // Permite acesso de outros domínios
app.use(express.json()); // Converte JSON nas requisições para objetos JavaScript

// Define as rotas da API REST
app.use('/api/usuario', usuarioRoutes); // Rotas para gerenciar usuários
app.use('/api/produto', produtoRoutes); // Rotas para gerenciar produtos
app.use('/api/pedido', pedidoRoutes); // Rotas para gerenciar pedidos

// Rota principal: serve a página inicial (index.html) quando acessam a raiz do site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// Testa a conexão com o banco de dados e inicia o servidor se tudo estiver ok
db.getConnection()
    .then(() => {
        console.log('Conexao MySQL estabelecida com sucesso!');
        app.listen(port, () => {
            console.log(`Servidor rodando em http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('Falha ao conectar ao MySQL:', err.message);
        console.log('Servidor nao iniciado devido a erro no banco de dados.');
    });

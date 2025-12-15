// backend/routes/usuario.js - Definição das rotas da API para usuários
// Este arquivo define os endereços (URLs) que a API responde para operações com usuários.
// Cada rota conecta um endereço web a uma função específica que processa a requisição.
// É como um mapa que direciona as chamadas da interface para as funções corretas.

const express = require('express'); // Framework para criar rotas
const router = express.Router(); // Cria um objeto de roteamento
const usuarioController = require('../controllers/usuarioController'); // Importa as funções do controlador

// ROTAS DE AUTENTICAÇÃO (POST para enviar dados)
// Estas rotas são usadas quando usuários querem se registrar ou entrar no sistema
router.post('/cadastro', usuarioController.cadastro); // Cadastra novo usuário - cria conta
router.post('/login', usuarioController.login); // Faz login do usuário - entra na conta

// ROTAS CRUD PARA GERENCIAR USUÁRIOS (GET, PUT, DELETE)
// CRUD significa Create, Read, Update, Delete - operações básicas de banco de dados
router.get('/', usuarioController.listarUsuarios); // Lista todos os usuários (GET) - mostra lista completa
router.get('/:id', usuarioController.buscarPorId); // Busca usuário por ID (GET) - encontra usuário específico

// Atualiza dados do usuário (PUT) - unificada para dados e senha
// Permite modificar informações do usuário como nome, email, senha
router.put('/:id', usuarioController.atualizarDados);

// Deleta usuário por ID (DELETE)
// Remove permanentemente um usuário do sistema
router.delete('/:id', usuarioController.deletar);

module.exports = router; // Exporta as rotas para uso no app.js
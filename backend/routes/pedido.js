// backend/routes/pedido.js
// Este arquivo define as rotas da API para operações com pedidos.
// Gerencia todo o ciclo de vida dos pedidos: criação, modificação, acompanhamento.
// Conecta as ações dos clientes e cozinheiros às funções que processam pedidos.

const express = require('express');
const router = express.Router();
const controller = require('../controllers/pedidoController');

// ROTAS PARA GERENCIAR PEDIDOS
// Listar TODOS os pedidos (para o painel do cozinheiro)
// Listar TODOS os pedidos (para o painel do cozinheiro)
router.get('/', controller.listarTodos);

// Listar itens de um pedido (mais específica)
router.get('/:id/itens', controller.listarItens);

// Adicionar item em um pedido
router.post('/:id/itens', controller.adicionarItem);

// Finalizar/Atualizar status do pedido
router.patch('/:id/finalizar', controller.finalizar);

// Marcar pedido como cancelado (preservar histórico)
router.patch('/:id/cancelar', controller.cancelar);

// Listar pedidos de um usuário (genérica)
router.get('/:id', controller.listar);

// Criar pedido
router.post('/', controller.criar);

// Deletar pedido
router.delete('/:id', controller.deletar);

module.exports = router;

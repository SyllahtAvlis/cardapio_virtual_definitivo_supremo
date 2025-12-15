// backend/routes/produto.js
// Este arquivo define as rotas da API para operações com produtos do cardápio.
// Cada rota conecta um endereço web a uma função que gerencia produtos.
// Permite que a interface do restaurante gerencie o cardápio completo.

const express = require('express');
const router = express.Router();
const controller = require('../controllers/produtoController');

// ROTAS PARA GERENCIAR PRODUTOS DO CARDÁPIO
router.get('/', controller.listar); // Lista todos os produtos - mostra cardápio completo
router.get('/:id', controller.buscar); // Busca produto específico - encontra um item do cardápio
router.post('/', controller.inserir); // Adiciona novo produto - inclui item no cardápio
router.put('/:id', controller.atualizar); // Atualiza produto existente - modifica item do cardápio
router.delete('/:id', controller.deletar); // Remove produto - tira item do cardápio

module.exports = router;

// backend/controllers/itemPedidoController.js
// Este arquivo controla as operações relacionadas aos itens individuais dos pedidos.
// Gerencia listagem e adição de itens aos pedidos existentes.
// Também recalcula automaticamente o total do pedido quando itens são modificados.

const ItemPedido = require('../models/itemPedido');
const Pedido = require('../models/pedido');

// Listar todos os itens de um pedido específico
// Retorna a lista completa de produtos e quantidades de um pedido.
// Inclui detalhes como nome do produto, preço unitário e subtotal.
exports.listarItens = async (req, res) => {
    const { id_pedido } = req.params;

    try {
        const itens = await ItemPedido.listarPorPedido(id_pedido);
        res.status(200).json(itens);
    } catch (err) {
        console.error("Erro ao listar itens do pedido:", err);
        res.status(500).json({ message: 'Erro ao listar itens do pedido.' });
    }
};

// Adicionar item a um pedido
// Permite adicionar um novo produto a um pedido já existente.
// Verifica se o pedido existe antes de adicionar.
// Recalcula e atualiza o total do pedido automaticamente.
exports.adicionarItem = async (req, res) => {
    const { id_pedido } = req.params;       // usa id_pedido como você quer
    const { id_produto, quantidade } = req.body;

    try {
        // Verifica se o pedido existe
        const pedido = await Pedido.listarPorId(id_pedido);
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido não encontrado.' });
        }

        // Adiciona item ao pedido
        await ItemPedido.inserir(id_pedido, id_produto, quantidade);

        // Recalcula total do pedido
        const total = await Pedido.calcularTotal(id_pedido);

        // Atualiza total no pedido
        await Pedido.atualizarTotal(id_pedido, total);

        res.status(201).json({
            message: 'Item adicionado ao pedido com sucesso!',
            total
        });
    } catch (err) {
        console.error("Erro ao adicionar item:", err);
        res.status(500).json({ message: 'Erro ao adicionar item ao pedido.' });
    }
};

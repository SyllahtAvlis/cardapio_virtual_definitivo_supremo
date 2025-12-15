// backend/models/itemPedido.js
// Este arquivo define as operações de banco de dados para itens individuais dos pedidos.
// Gerencia a relação entre pedidos e produtos, incluindo quantidades e preços.
// Cada função representa uma consulta SQL específica para manipular itens de pedido.

const db = require('../config/db');
const Pedido = require('./pedido'); 

const ItemPedido = {
    // Função para inserir um item no pedido
    // Adiciona um produto específico a um pedido existente.
    // Busca automaticamente o preço atual do produto no momento da compra.
    // Salva o preço junto com o item para manter histórico de preços.
    inserir: async (id_pedido, id_produto, quantidade) => {
        try {
            // Primeiro, buscamos o preço do produto
            const [produto] = await db.query(
                "SELECT preco FROM produto WHERE id_produto = ?",
                [id_produto]
            );

            // Se não encontrar o produto, retorna erro
            if (produto.length === 0) {
                throw new Error('Produto não encontrado');
            }

            // O preço unitário do produto no momento da compra
            const precoUnitario = produto[0].preco; 

            // 🟢 CORREÇÃO CRÍTICA: Incluir 'preco' na instrução INSERT
            const [result] = await db.query(
                "INSERT INTO itempedido (id_pedido, id_produto, quantidade, preco) VALUES (?, ?, ?, ?)",
                [id_pedido, id_produto, quantidade, precoUnitario]
            );

            // 🛑 REMOVIDO: A atualização do total do pedido será feita no Controller
            // após a inserção de TODOS os itens, para otimizar.

            return {
                id_item: result.insertId,
                id_pedido,
                id_produto,
                quantidade,
                preco: precoUnitario
            }; 
        } catch (error) {
            throw new Error('Erro ao adicionar item ao pedido: ' + error.message);
        }
    },

    // Função para listar os itens de um pedido específico
    // Retorna todos os produtos de um pedido com suas quantidades e preços.
    // Faz JOIN com a tabela produto para incluir o nome do produto.
    // Usado para mostrar detalhes completos de um pedido.
    listarPorPedido: async (id_pedido) => {
        try {
            const sql = `
                SELECT i.id_item, i.id_pedido, i.id_produto, i.quantidade, i.preco AS preco_unitario, 
                    p.nome AS produto_nome
                FROM itempedido i
                JOIN produto p ON p.id_produto = i.id_produto
                WHERE i.id_pedido = ?
            `;
            const [results] = await db.query(sql, [id_pedido]);
            return results; 
        } catch (error) {
            throw new Error('Erro ao listar itens do pedido: ' + error.message);
        }
    },

    // Função para deletar todos os itens de um produto específico
    // Remove todos os registros de itempedido que referenciam um produto.
    // Usado quando um produto é deletado do cardápio para manter integridade.
    // Atenção: isso afeta todos os pedidos que contenham esse produto.
    deletarPorProduto: async (id_produto) => {
        try {
            const [result] = await db.query(
                "DELETE FROM itempedido WHERE id_produto = ?",
                [id_produto]
            );
            return result;
        } catch (error) {
            throw new Error('Erro ao deletar itens do produto: ' + error.message);
        }
    },

    deletarPorPedido: async (id_pedido) => {
        try {
            const [result] = await db.query(
                "DELETE FROM itempedido WHERE id_pedido = ?",
                [id_pedido]
            );
            return result;
        } catch (error) {
            throw new Error('Erro ao deletar itens do pedido: ' + error.message);
        }
    },
};

// Função para deletar todos os itens de um pedido específico
// Usado antes de deletar o pedido para evitar erro de chave estrangeira.


module.exports = ItemPedido;
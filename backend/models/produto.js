// backend/models/produto.js
// Este arquivo define as operações de banco de dados para produtos do cardápio.
// Cada função representa uma consulta SQL específica para gerenciar produtos.
// Inclui operações básicas: listar, buscar, inserir, atualizar e deletar.

const db = require('../config/db');

const Produto = {
    // FUNÇÃO LISTAR: Retorna todos os produtos do cardápio.
    // Inclui informações como nome, descrição, preço, imagem e categoria.
    // Usado para exibir o cardápio completo aos clientes.
    listar: async () => {
        const [results] = await db.query("SELECT id_produto, nome, descricao, preco, imagem, categoria FROM produto");
        return results;
    },

    // FUNÇÃO BUSCAR POR ID: Encontra um produto específico usando seu ID.
    // Retorna todas as informações de um único produto.
    // Usado quando precisamos editar ou visualizar detalhes de um produto.
    buscarPorId: async (id) => {
        const [results] = await db.query("SELECT id_produto, nome, descricao, preco, imagem, categoria FROM produto WHERE id_produto = ?", [id]);
        return results;
    },

    // FUNÇÃO INSERIR: Adiciona um novo produto ao banco de dados.
    // Recebe nome, descrição, preço, imagem e categoria como parâmetros.
    // Retorna o resultado da operação INSERT (incluindo ID gerado).
    inserir: async (nome, descricao, preco, imagem, categoria) => {
        const [result] = await db.query(
            "INSERT INTO produto (nome, descricao, preco, imagem, categoria) VALUES (?, ?, ?, ?, ?)",
            [nome, descricao, preco, imagem, categoria]
        );
        return result;
    },
    
    // FUNÇÃO ATUALIZAR: Modifica um produto existente no banco.
    // Permite alterar qualquer campo: nome, descrição, preço, imagem ou categoria.
    // Identifica o produto pelo ID fornecido.
    atualizar: async (id, nome, descricao, preco, imagem, categoria) => {
        const [result] = await db.query(
            "UPDATE produto SET nome = ?, descricao = ?, preco = ?, imagem = ?, categoria = ? WHERE id_produto = ?",
            [nome, descricao, preco, imagem, categoria, id]
        );
        return result;
    },
    
    // FUNÇÃO DELETAR: Remove um produto do banco de dados.
    // Identifica o produto pelo ID e o remove permanentemente.
    // Cuidado: esta operação não pode ser desfeita.
    deletar: async (id) => {
        const [result] = await db.query("DELETE FROM produto WHERE id_produto = ?", [id]);
        return result;
    }
};

module.exports = Produto;
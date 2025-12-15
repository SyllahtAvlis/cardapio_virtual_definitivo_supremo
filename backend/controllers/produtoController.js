// backend/controllers/produtoController.js
// Este arquivo controla as operações relacionadas aos produtos do cardápio.
// Ele gerencia listar, buscar, inserir, atualizar e deletar produtos.
// Usa o modelo Produto para interagir com o banco de dados.

const Produto = require('../models/produto');
const ItemPedido = require('../models/itemPedido');

// Função LISTAR: Retorna todos os produtos do cardápio.
// Usada para exibir o cardápio completo na página do cliente.
exports.listar = async (req, res) => {
    try {
        const produtos = await Produto.listar();
        res.json(produtos);
    } catch (err) {
        console.error("Erro ao listar produtos:", err);
        res.status(500).json({ message: 'Erro ao listar produtos.' });
    }
};

// Função BUSCAR: Encontra um produto específico pelo ID.
// Útil para editar ou visualizar detalhes de um produto.
exports.buscar = async (req, res) => {
    try {
        const produto = await Produto.buscarPorId(req.params.id);
        if (produto.length === 0) return res.status(404).json({ message: 'Produto não encontrado.' }); 
        res.json(produto[0]); 
    } catch (err) {
        console.error("Erro ao buscar produto:", err);
        res.status(500).json({ message: 'Erro ao buscar produto.' });
    }
};

// Função INSERIR: Adiciona um novo produto ao cardápio.
// Recebe dados do formulário e salva no banco de dados.
// Valida se nome, preço e categoria estão presentes e válidos.
exports.inserir = async (req, res) => {
    // Extrai os dados enviados no corpo da requisição
    const { nome, descricao, preco, imagem, categoria } = req.body;

    // Verifica se os campos obrigatórios foram preenchidos
    if (!nome || !preco || !categoria) {
        return res.status(400).json({ message: 'Nome, preço e categoria são obrigatórios para o cadastro do produto.' });
    }
    
    // Verifica se a categoria é uma das permitidas
    const categoriasValidas = ['carnes', 'frangos', 'peixe', 'massas', 'bebida', 'porcao'];
    if (!categoriasValidas.includes(categoria.toLowerCase())) {
        return res.status(400).json({ message: `Categoria inválida. Use uma das seguintes: ${categoriasValidas.join(', ')}.` });
    }

    // Converte o preço para número e verifica se é válido
    const precoFormatado = parseFloat(preco);
    if (isNaN(precoFormatado) || precoFormatado <= 0) {
        return res.status(400).json({ message: 'O preço deve ser um número positivo válido.' });
    }
    // -----------------------------

    try {
        // Salva o produto no banco de dados
        await Produto.inserir(nome, descricao, precoFormatado, imagem || null, categoria.toLowerCase()); 
        res.status(201).json({ message: 'Produto cadastrado com sucesso no cardápio!' });
    } catch (err) {
        console.error("Erro ao criar produto:", err);
        res.status(500).json({ message: 'Erro interno ao cadastrar o produto.' });
    }
};

// Função ATUALIZAR: Modifica um produto existente.
// Permite alterar nome, descrição, preço, imagem e categoria.
// Valida se a categoria é uma das permitidas.
exports.atualizar = async (req, res) => {
    // Extrai os dados enviados
    const { nome, descricao, preco, imagem, categoria } = req.body;
    
    // Verifica se a categoria foi informada
    if (!categoria) {
        return res.status(400).json({ message: 'A categoria é obrigatória para a atualização do produto.' });
    }
    
    // Verifica se a categoria é uma das permitidas
    const categoriasValidas = ['carnes', 'frangos', 'peixe', 'massas', 'bebida', 'porcao'];
    if (!categoriasValidas.includes(categoria.toLowerCase())) {
        return res.status(400).json({ message: `Categoria inválida. Use uma das seguintes: ${categoriasValidas.join(', ')}.` });
    }
    
    try {
        // Atualiza o produto no banco de dados
        await Produto.atualizar(req.params.id, nome, descricao, preco, imagem, categoria.toLowerCase());
        res.json({ message: 'Produto atualizado com sucesso!' });
    } catch (err) {
        console.error("Erro ao atualizar produto:", err);
        res.status(500).json({ message: 'Erro ao atualizar produto.' });
    }
};

// Função DELETAR: Remove um produto do cardápio.
// Antes de deletar o produto, remove todos os itens de pedido relacionados para manter a integridade do banco.
exports.deletar = async (req, res) => {
    try {
        const produtoId = req.params.id;
        
        // Primeiro, deleta todos os itens do pedido que referem este produto
        await ItemPedido.deletarPorProduto(produtoId);
        
        // Depois, deleta o produto
        await Produto.deletar(produtoId);
        res.json({ message: 'Produto removido!' });
    } catch (err) {
        console.error("Erro ao remover produto:", err);
        res.status(500).json({ message: 'Erro ao remover produto.' });
    }
};
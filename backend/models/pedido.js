// backend/models/pedido.js
// Este arquivo define as operações de banco de dados para pedidos.
// Gerencia todas as funções relacionadas a pedidos: criação, listagem, atualização de status, cálculo de total, etc.
// Cada função representa uma consulta SQL específica para manipular pedidos.

const db = require('../config/db');

const Pedido = {
    // Criar pedido
    // Insere um novo pedido no banco de dados com status inicial 'pendente'.
    // Recebe o ID do usuário e observações opcionais.
    // O total inicial é 0 e será calculado quando itens forem adicionados.
    criar: async (id_usuario, observacoes = '') => {
        // id_usuario = id do usuário
        const [result] = await db.query(
            "INSERT INTO pedido (id, total, status, observacoes) VALUES (?, ?, ?, ?)",
            [id_usuario, 0, 'pendente', observacoes || '']
        );
        // O insertId é o id_pedido gerado
        return result;
    },

    // Listar pedidos por usuário
    // Retorna todos os pedidos de um usuário específico.
    // Usado para mostrar histórico de pedidos na conta do cliente.
    listarPorUsuario: async (id) => {
        const [results] = await db.query(
            "SELECT * FROM pedido WHERE id = ?",
            [id]
        );
        return results;
    },

    // Listar pedido por id
    // Busca um pedido específico usando seu ID único.
    // Retorna um único pedido ou undefined se não encontrado.
    listarPorId: async (id_pedido) => {
        const [results] = await db.query(
            "SELECT * FROM pedido WHERE id_pedido = ?",
            [id_pedido]
        );
        return results[0];
    },

    // Finalizar pedido
    // Marca um pedido como 'finalizado'.
    // Usado quando o pedido está pronto para entrega ou foi concluído.
    finalizar: async (id_pedido) => {
        const [result] = await db.query(
            "UPDATE pedido SET status = 'finalizado' WHERE id_pedido = ?",
            [id_pedido]
        );
        return result.affectedRows > 0;
    },

    // Calcular total
    // Soma o preço de todos os itens multiplicado pelas quantidades.
    // Faz um JOIN entre itempedido e produto para obter os preços.
    // Retorna o valor total do pedido.
    calcularTotal: async (id_pedido) => {
        const sql = `
            SELECT SUM(i.preco * i.quantidade) AS total
            FROM itempedido i
            WHERE i.id_pedido = ?
        `;
        const [result] = await db.query(sql, [id_pedido]);
        return result[0]?.total || 0;
    },

    // Atualizar total
    // Salva o valor total calculado no registro do pedido.
    // Chamado sempre que itens são adicionados ou removidos.
    atualizarTotal: async (id_pedido, total) => {
        const [result] = await db.query(
            "UPDATE pedido SET total = ? WHERE id_pedido = ?",
            [total, id_pedido]
        );
        return result;
    },

    // Listar TODOS os pedidos (para o painel do cozinheiro)
    // Retorna todos os pedidos do sistema, ordenados por data (mais recentes primeiro).
    // Usado no painel administrativo do cozinheiro para gerenciar pedidos.
    listarTodos: async () => {
        const [results] = await db.query(
            "SELECT * FROM pedido ORDER BY data_pedido DESC"
        );
        return results;
    },

    // Listar itens de um pedido
    // Retorna todos os produtos de um pedido específico com suas quantidades.
    // Faz JOIN com a tabela produto para incluir o nome do produto.
    // Usado para mostrar detalhes completos de um pedido.
    listarItensDoPedido: async (id_pedido) => {
        const [results] = await db.query(`
            SELECT i.id_item, i.id_pedido, i.id_produto, i.quantidade, i.preco,
                   p.nome AS produto_nome
            FROM itempedido i
            JOIN produto p ON p.id_produto = i.id_produto
            WHERE i.id_pedido = ?
        `, [id_pedido]);
        return results;
    },

    // Atualizar status do pedido
    // Muda o status de um pedido (pendente, preparando, pronto, etc.).
    // Usado pelo cozinheiro para acompanhar o andamento dos pedidos.
    atualizarStatus: async (id_pedido, novoStatus) => {
        console.log(`[atualizarStatus] id_pedido=${id_pedido}, novoStatus='${novoStatus}' (type: ${typeof novoStatus}, length: ${novoStatus?.length})`);
        const [result] = await db.query(
            "UPDATE pedido SET status = ? WHERE id_pedido = ?",
            [novoStatus, id_pedido]
        );
        console.log(`[atualizarStatus] Query executada. affectedRows: ${result.affectedRows}`);
        return result.affectedRows > 0;
    },

    // Atualizar pedido completo
    // Permite atualizar múltiplos campos do pedido de uma vez.
    // Pode alterar status, número da mesa e observações simultaneamente.
    // Mais eficiente que fazer múltiplas chamadas separadas.
    atualizarPedido: async (id_pedido, dados) => {
        const { status, numero_mesa, observacoes } = dados;
        
        let query = "UPDATE pedido SET ";
        let updates = [];
        let values = [];

        if (status !== undefined) {
            updates.push("status = ?");
            values.push(status);
        }
        if (numero_mesa !== undefined) {
            updates.push("numero_mesa = ?");
            values.push(numero_mesa);
        }
        if (observacoes !== undefined) {
            updates.push("observacoes = ?");
            values.push(observacoes);
        }

        if (updates.length === 0) {
            return true; // Nada para atualizar
        }

        query += updates.join(", ");
        query += " WHERE id_pedido = ?";
        values.push(id_pedido);

        console.log("[atualizarPedido] Query:", query);
        console.log("[atualizarPedido] Values:", values);

        const [result] = await db.query(query, values);
        console.log("[atualizarPedido] affectedRows:", result.affectedRows);
        return result.affectedRows > 0;
    },

    // Deletar pedido
    // Remove um pedido do banco de dados completamente.
    // Atenção: os itens do pedido devem ser deletados separadamente antes.
    deletar: async (id_pedido) => {
        const [result] = await db.query(
            "DELETE FROM pedido WHERE id_pedido = ?",
            [id_pedido]
        );
        return result.affectedRows > 0;
    },
};

module.exports = Pedido;

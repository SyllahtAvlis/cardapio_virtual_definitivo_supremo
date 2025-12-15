// backend/models/usuario.js - Modelo de dados para usuários
// Este arquivo define funções para interagir com a tabela 'usuario' no banco de dados.
// Ele encapsula as consultas SQL para buscar, inserir e gerenciar usuários.
// Cada função representa uma operação específica no banco de dados.

const db = require('../config/db'); // Importa a conexão com o banco de dados

const Usuario = {
    // Busca usuários por nome ou email (usado para verificar duplicatas no cadastro)
    // Retorna um array com usuários que têm o mesmo nome ou email fornecido.
    // Útil para impedir cadastros duplicados.
    buscarPorNomeOuEmail: async (username, email) => {
        const [results] = await db.query(
            'SELECT * FROM usuario WHERE nome = ? OR email = ?',
            [username, email]
        );
        return results;
    },

    // Busca usuário por nome e senha (usado no login para autenticação)
    // Retorna o usuário se as credenciais estiverem corretas, senão retorna array vazio.
    // Esta é a função principal usada no processo de login.
    buscarPorCredenciais: async (username, password) => {
        const [results] = await db.query(
            'SELECT * FROM usuario WHERE nome = ? AND senha = ?',
            [username, password]
        );
        return results;
    },

    // Busca todos os usuários administradores (usado para controlar criação de novos admins)
    // Retorna lista de todos os usuários com tipo 'administrador'.
    // Importante para limitar a criação de novos administradores.
    buscarAdmins: async () => {
        const [results] = await db.query("SELECT * FROM usuario WHERE tipo = 'administrador'");
        return results;
    },

    // Insere um novo usuário na tabela (usado no cadastro)
    // Adiciona um novo registro na tabela usuario com nome, email, senha e tipo.
    // Retorna o resultado da operação INSERT (incluindo o ID gerado).
    inserir: async (username, email, password, tipoUsuario) => {
        const [result] = await db.query(
            "INSERT INTO usuario (nome, email, senha, tipo) VALUES (?, ?, ?, ?)",
            [username, email, password, tipoUsuario]
        );
        return result;
    },

    // Lista todos os usuários (usado para administração)
    // Retorna todos os usuários do sistema.
    // Usado em painéis administrativos para gerenciar usuários.
    listarTodos: async () => {
        const [results] = await db.query("SELECT * FROM usuario");
        return results;
    },

    // Busca um usuário específico por ID
    // Retorna um único usuário baseado no ID fornecido.
    // Usado quando precisamos carregar dados de um usuário específico.
    buscarPorId: async (id) => {
        const [results] = await db.query(
            "SELECT * FROM usuario WHERE id = ?",
            [id]
        );
        return results[0];
    },

    // Função para atualizar os dados do usuário (nome, email, tipo)
    // Modifica informações básicas do usuário (exceto senha).
    // Usado quando o usuário edita seu perfil ou quando um admin edita dados.
    atualizarDados: async (id, nome, email, tipo) => {
        await db.query(
            // CORRIGIDO: de id_usuario para id
            "UPDATE usuario SET nome = ?, email = ?, tipo = ? WHERE id = ?",
            [nome, email, tipo, id]
        );
    },

    // Função para atualizar a senha do usuário
    // Altera apenas a senha de um usuário específico.
    // Usado quando o usuário solicita mudança de senha.
    atualizarSenha: async (id, senha) => {
        await db.query(
            // CORRIGIDO: de id_usuario para id
            "UPDATE usuario SET senha = ? WHERE id = ?",
            [senha, id]
        );
    },

    // Função para deletar um usuário
    // Remove completamente um usuário do sistema.
    // Implementa exclusão em cascata para manter a integridade do banco:
    // Primeiro deleta itens de pedido, depois pedidos, e finalmente o usuário.
    deletar: async (id) => {
        // CORRIGIDO: de id_usuario para id
        // Implementa exclusão em cascata para evitar conflitos com foreign keys
        
        // 1. Primeiro, deleta todos os itens de pedido associados aos pedidos do usuário
        await db.query(
            `DELETE FROM itempedido 
             WHERE id_pedido IN (
                 SELECT id_pedido FROM pedido WHERE id = ?
             )`,
            [id]
        );

        // 2. Depois, deleta todos os pedidos do usuário
        await db.query(
            "DELETE FROM pedido WHERE id = ?",
            [id]
        );

        // 3. Finalmente, deleta o usuário
        await db.query("DELETE FROM usuario WHERE id = ?", [id]);
    }
};

module.exports = Usuario;
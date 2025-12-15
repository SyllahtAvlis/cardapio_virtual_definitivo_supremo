// backend/controllers/usuarioController.js - Controlador para operações de usuários
// Este arquivo contém as funções (controllers) que lidam com requisições relacionadas a usuários,
// como cadastro, login e logout. Ele valida dados, interage com o modelo de usuário e retorna respostas.

const Usuario = require('../models/usuario'); // Importa o modelo de usuário para acessar o banco
const ADMIN_CODE = process.env.ADMIN_CODE; // Código secreto para criar administradores

// ---------------------
// FUNÇÃO DE CADASTRO DE USUÁRIO
// ---------------------
// Recebe dados do formulário de cadastro e cria um novo usuário no banco
exports.cadastro = async (req, res) => {
    const { username, email, password, tipo, adminCode } = req.body; // Extrai dados da requisição

    // Validação básica: verifica se campos obrigatórios foram preenchidos
    if (!username || !email || !password)
        return res.status(400).json({ message: 'Preencha todos os campos!' });

    try {
        // Verifica se usuário ou email já existem
        const userCheck = await Usuario.buscarPorNomeOuEmail(username, email);
        if (userCheck.length > 0)
            return res.status(409).json({ message: 'Usuário ou e-mail já existe!' });

        let tipoUsuario = 'cliente'; // Tipo padrão é cliente

        // Se solicitou administrador, verifica código secreto
        if (tipo === "administrador") {
            const admins = await Usuario.buscarAdmins();
            tipoUsuario = 'administrador';

            if (admins.length > 0 && adminCode !== ADMIN_CODE) {
                return res.status(403).json({ message: "Código de admin inválido!" });
            }
        }

        // Insere o novo usuário no banco
        await Usuario.inserir(username, email, password, tipoUsuario);
        res.status(201).json({ message: `${tipoUsuario} cadastrado com sucesso!` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// ---------------------
// FUNÇÃO DE LOGIN
// ---------------------
// Verifica credenciais e permite acesso se corretas
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ message: 'Preencha todos os campos!' });

    try {
        const results = await Usuario.buscarPorCredenciais(username, password);

        if (results.length === 0)
            return res.status(401).json({ message: 'Usuário ou senha incorretos!' });

        res.json({ message: "Login realizado com sucesso!", usuario: results[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// ---------------------
// LISTAR TODOS USUÁRIOS
// ---------------------
// Retorna lista de todos os usuários (para administração)
exports.listarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.listarTodos();
        res.json(usuarios);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao listar usuários.' });
    }
};

// ---------------------
// BUSCAR POR ID
// ---------------------
// Busca um usuário específico pelo ID
exports.buscarPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const usuario = await Usuario.buscarPorId(id);
        if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });

        res.json(usuario);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar usuário.' });
    }
};

// ---------------------
// ATUALIZAR DADOS (UNIFICADO)
// ---------------------
// Atualiza nome, email, tipo e/ou senha do usuário
exports.atualizarDados = async (req, res) => {
    const { id } = req.params;
    const { nome, email, tipo, senhaAtual, novaSenha } = req.body;

    try {
        // Verifica se o usuário existe
        const usuario = await Usuario.buscarPorId(id);
        if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });

        // Lógica para atualizar a senha (se fornecida)
        if (novaSenha) {
            if (!senhaAtual) {
                return res.status(400).json({ message: 'Senha atual é obrigatória para mudar a senha!' });
            }

            // Verifica se a senha atual está correta
            if (usuario.senha !== senhaAtual) {
                return res.status(401).json({ message: 'Senha atual incorreta!' });
            }

            // Atualiza a senha
            await Usuario.atualizarSenha(id, novaSenha);
        }

        // Atualiza os dados de nome, email e tipo
        const tipoAtualizado = tipo || usuario.tipo;
        await Usuario.atualizarDados(id, nome, email, tipoAtualizado);

        res.json({ message: 'Informações da conta atualizadas com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar dados do usuário.' });
    }
};

// ---------------------
// DELETAR
// ---------------------
// Remove um usuário do sistema (requer senha para confirmação)
exports.deletar = async (req, res) => {
    const { id } = req.params;
    const { senha } = req.body;

    try {
        // Valida se a senha foi fornecida
        if (!senha) {
            return res.status(400).json({ message: 'Senha é obrigatória para deletar a conta.' });
        }

        // Busca o usuário pelo ID
        const usuario = await Usuario.buscarPorId(id);

        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Verifica se a senha está correta
        if (usuario.senha !== senha) {
            return res.status(401).json({ message: 'Senha incorreta. Não foi possível deletar a conta.' });
        }

        // Deleta o usuário
        await Usuario.deletar(id);

        res.json({ message: 'Usuário deletado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao deletar usuário.' });
    }
};
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ message: 'Preencha todos os campos!' });

    try {
        const results = await Usuario.buscarPorCredenciais(username, password);

        if (results.length === 0)
            return res.status(401).json({ message: 'Usuário ou senha incorretos!' });

        res.json({ message: "Login realizado com sucesso!", usuario: results[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// ---------------------
// LISTAR TODOS USUÁRIOS
// ---------------------
exports.listarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.listarTodos();
        res.json(usuarios);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao listar usuários.' });
    }
};

// ---------------------
// BUSCAR POR ID
// ---------------------
exports.buscarPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const usuario = await Usuario.buscarPorId(id);
        if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });

        res.json(usuario);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar usuário.' });
    }
};

// ---------------------
// ATUALIZAR DADOS (UNIFICADO)
// ---------------------
exports.atualizarDados = async (req, res) => {
    const { id } = req.params;
    // Adiciona senhaAtual e novaSenha na desestruturação
    const { nome, email, tipo, senhaAtual, novaSenha } = req.body; 

    try {
        // 1. Verifica se o usuário existe
        const usuario = await Usuario.buscarPorId(id);
        if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });

        // 2. Lógica para atualizar a SENHA (se novaSenha for fornecida)
        if (novaSenha) {
            if (!senhaAtual) {
                return res.status(400).json({ message: 'Senha atual é obrigatória para mudar a senha!' });
            }
            
            // Verifica se a senha atual está correta
            if (usuario.senha !== senhaAtual) {
                return res.status(401).json({ message: 'Senha atual incorreta!' });
            }
            
            // Chama a função do Model para atualizar a senha
            await Usuario.atualizarSenha(id, novaSenha);
        }

        // 3. Atualiza os dados de nome, e-mail e tipo
        // Se 'tipo' não for fornecido no body, usa o tipo existente no DB para evitar sobrescrever com null/undefined
        const tipoAtualizado = tipo || usuario.tipo; 
        
        await Usuario.atualizarDados(id, nome, email, tipoAtualizado);

        res.json({ message: 'Informações da conta atualizadas com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar dados do usuário.' });
    }
};

// ---------------------
// DELETAR
// ---------------------
exports.deletar = async (req, res) => {
    const { id } = req.params;
    const { senha } = req.body;

    try {
        // Valida se a senha foi fornecida
        if (!senha) {
            return res.status(400).json({ message: 'Senha é obrigatória para deletar a conta.' });
        }

        // Busca o usuário pelo ID
        const usuario = await Usuario.buscarPorId(id);

        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Verifica se a senha está correta
        if (usuario.senha !== senha) {
            return res.status(401).json({ message: 'Senha incorreta. Não foi possível deletar a conta.' });
        }

        // Se a senha está correta, deleta o usuário (com cascata)
        await Usuario.deletar(id);

        res.json({ message: 'Usuário deletado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao deletar usuário.' });
    }
};
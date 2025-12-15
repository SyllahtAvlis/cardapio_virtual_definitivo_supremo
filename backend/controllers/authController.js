// backend/controllers/authController.js

const Usuario = require('../models/usuario');
const ADMIN_CODE = process.env.ADMIN_CODE; // Pega o código secreto do .env

// Lógica de CADASTRO
exports.cadastro = async (req, res) => {
    const { username, email, password, tipo, adminCode } = req.body;

    // Validação básica (deveria estar em um middleware, mas mantemos aqui por simplicidade)
    if (!username || !email || !password)
        return res.status(400).json({ message: 'Preencha todos os campos!' });

    try {
        // 1. Chamar o Modelo: Verificar se usuário ou e-mail já existem
        const userCheck = await Usuario.buscarPorNomeOuEmail(username, email);
        if (userCheck.length > 0)
            return res.status(409).json({ message: 'Usuário ou e-mail já existe!' });

        let tipoUsuario = 'cliente';

        // 2. Lógica de ADMIN
        if (tipo === "administrador") {
            const admins = await Usuario.buscarAdmins();
            tipoUsuario = 'administrador';

            // Se já existem admins E o código está incorreto
            if (admins.length > 0 && adminCode !== ADMIN_CODE) {
                // Note: O primeiro admin não precisa de código
                return res.status(403).json({ message: "Código de admin inválido!" });
            }
        }

        // 3. Chamar o Modelo: Inserir no banco
        await Usuario.inserir(username, email, password, tipoUsuario);
        res.status(201).json({ message: `${tipoUsuario} cadastrado com sucesso!` });

    } catch (err) {
        console.error('Erro no servidor durante o cadastro:', err);
        return res.status(500).json({ message: 'Erro no servidor.' });
    }
};


// Lógica de LOGIN
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ message: "Preencha todos os campos!" });

    try {
        // 1. Chamar o Modelo: Buscar por credenciais
        const results = await Usuario.buscarPorCredenciais(username, password);

        if (results.length === 0)
            return res.status(401).json({ message: "Usuário ou senha incorretos!" });

        res.json({ message: "Login realizado com sucesso!", usuario: results[0] });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        return res.status(500).json({ message: 'Erro no servidor.' });
    }
};
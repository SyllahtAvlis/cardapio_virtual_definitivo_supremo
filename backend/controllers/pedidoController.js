// backend/controllers/pedidoController.js
// Este arquivo controla todas as operações relacionadas aos pedidos.
// Gerencia criação, listagem, atualização de status e exclusão de pedidos.
// Também lida com itens dos pedidos e cálculos de total.

const Pedido = require('../models/pedido');
const ItemPedido = require('../models/itemPedido');

// Listar pedidos por usuário
// Retorna todos os pedidos de um cliente específico.
// Usado na página da conta do cliente para ver histórico de pedidos.
exports.listar = async (req, res) => {
    const id_usuario = req.params.id; // agora é id, não id_usuario

    try {
        const pedidos = await Pedido.listarPorUsuario(id_usuario);
        res.json(pedidos);
    } catch (err) {
        console.error("Erro ao listar pedidos:", err);
        res.status(500).json({ message: 'Erro ao listar pedidos.' });
    }
};

// Listar TODOS os pedidos (para o painel do cozinheiro)
// Retorna todos os pedidos do sistema com detalhes completos.
// Inclui itens do pedido, nome do cliente e timestamp da data.
// Usado no painel do cozinheiro para gerenciar pedidos.
exports.listarTodos = async (req, res) => {
    try {
        console.log("📡 === LISTAR TODOS OS PEDIDOS ===");
        const pedidos = await Pedido.listarTodos();
        console.log("✅ Pedidos encontrados:", pedidos.length);
        
        const Usuario = require('../models/usuario');
        
        // Buscar itens para cada pedido
        const pedidosComItens = await Promise.all(
            pedidos.map(async (pedido) => {
                const itens = await Pedido.listarItensDoPedido(pedido.id_pedido);
                
                // Buscar o nome do cliente pelo id
                console.log(`🔍 Buscando usuário com ID: ${pedido.id}`);
                const usuario = await Usuario.buscarPorId(pedido.id);
                console.log(`👤 Usuário encontrado:`, usuario);
                const nomeCliente = usuario ? usuario.nome : "Cliente Desconhecido";
                console.log(`📝 Nome do cliente: ${nomeCliente}`);
                
                // Converter data_pedido para timestamp unix (em milissegundos)
                let timestampPedido = 0;
                if (pedido.data_pedido) {
                    timestampPedido = new Date(pedido.data_pedido).getTime();
                }
                
                return {
                    ...pedido,
                    data_pedido: timestampPedido, // Substitui pela timestamp unix
                    itens: itens,
                    nome_cliente: nomeCliente // Nome real do cliente do banco
                };
            })
        );

        res.json(pedidosComItens);
    } catch (err) {
        console.error("❌ Erro ao listar todos os pedidos:", err);
        res.status(500).json({ message: 'Erro ao listar pedidos.', erro: err.message });
    }
};

// Criar pedido
// Cria um novo pedido para um usuário com itens opcionais.
// Calcula o total automaticamente baseado nos produtos selecionados.
// Usado quando o cliente finaliza um pedido no cardápio.
exports.criar = async (req, res) => {
    const { id, itens, observacoes } = req.body; // id = id do usuário

    console.log("📝 === CRIAR PEDIDO ===");
    console.log("Dados recebidos:", { id, itens, observacoes });

    try {
        // Validação
        if (!id) {
            console.error("❌ Erro: ID do usuário não fornecido");
            return res.status(400).json({ message: 'ID do usuário é obrigatório!' });
        }

        console.log("✅ Validações passaram");

        // cria pedido (mesmo que vazio)
        console.log("📦 Criando pedido para usuário ID:", id);
        const novoPedido = await Pedido.criar(id, observacoes);
        console.log("🔍 Resultado do INSERT:", JSON.stringify(novoPedido, null, 2));
        const id_pedido = novoPedido.insertId;
        console.log("✅ Pedido criado com ID:", id_pedido);

        // adiciona itens (se houver)
        if (itens && itens.length > 0) {
            console.log(`📋 Adicionando ${itens.length} itens...`);
            for (let i = 0; i < itens.length; i++) {
                const item = itens[i];
                console.log(`  Item ${i + 1}: Produto ${item.id_produto}, Quantidade ${item.quantidade}`);
                await ItemPedido.inserir(id_pedido, item.id_produto, item.quantidade);
                console.log(`  ✅ Item ${i + 1} adicionado com sucesso`);
            }

            // calcula total
            console.log("🧮 Calculando total...");
            const total = await Pedido.calcularTotal(id_pedido);
            console.log("✅ Total calculado:", total);

            // atualiza total
            console.log("💾 Atualizando total no pedido...");
            await Pedido.atualizarTotal(id_pedido, total);
            console.log("✅ Total atualizado");
        } else {
            console.log("⚠️ Pedido criado vazio (sem itens)");
        }

        console.log("🎉 Pedido criado com sucesso!");
        res.status(201).json({
            id_pedido,
            total: 0,
            message: 'Pedido criado com sucesso!'
        });

    } catch (err) {
        console.error("❌ ERRO AO CRIAR PEDIDO:", err);
        console.error("Stack:", err.stack);
        res.status(500).json({ 
            message: 'Erro ao criar pedido.',
            erro: err.message 
        });
    }
};

// Listar itens do pedido
// Retorna todos os itens de um pedido específico.
// Mostra produtos, quantidades e preços individuais.
exports.listarItens = async (req, res) => {
    const id_pedido = req.params.id;

    try {
        const itens = await ItemPedido.listarPorPedido(id_pedido);
        res.json(itens);
    } catch (err) {
        console.error("Erro ao listar itens do pedido:", err);
        res.status(500).json({ message: 'Erro ao listar itens do pedido.' });
    }
};

// Adicionar item ao pedido existente
// Permite adicionar mais produtos a um pedido já criado.
// Recalcula o total automaticamente após adicionar o item.
exports.adicionarItem = async (req, res) => {
    const id_pedido = req.params.id;
    const { id_produto, quantidade } = req.body;

    console.log("📝 === ADICIONAR ITEM AO PEDIDO ===");
    console.log("Dados recebidos:", { id_pedido, id_produto, quantidade });

    try {
        console.log("🛒 Inserindo item no banco...");
        const item = await ItemPedido.inserir(id_pedido, id_produto, quantidade);
        console.log("✅ Item inserido:", item);

        console.log("🧮 Calculando novo total...");
        const total = await Pedido.calcularTotal(id_pedido);
        console.log("✅ Total calculado:", total);

        console.log("💾 Atualizando total do pedido...");
        await Pedido.atualizarTotal(id_pedido, total);
        console.log("✅ Total atualizado");

        res.status(201).json({
            message: 'Item adicionado ao pedido!',
            total
        });
    } catch (err) {
        console.error("❌ ERRO AO ADICIONAR ITEM:", err);
        console.error("Mensagem:", err.message);
        console.error("Stack:", err.stack);
        res.status(500).json({ 
            message: 'Erro ao adicionar item.',
            erro: err.message 
        });
    }
};

// Finalizar pedido (ou atualizar status)
// Atualiza o status do pedido (pendente, preparando, pronto, etc.).
// Também pode atualizar número da mesa e observações.
// Usado pelo cozinheiro para gerenciar o andamento dos pedidos.
exports.finalizar = async (req, res) => {
    const id_pedido = req.params.id;
    const { status, numero_mesa, observacoes } = req.body;

    console.log("[finalizar] === ATUALIZAR STATUS DO PEDIDO ===");
    console.log("[finalizar] ID do pedido:", id_pedido, "(type: " + typeof id_pedido + ")");
    console.log("[finalizar] Novo status recebido:", status, "(type: " + typeof status + ")");
    console.log("[finalizar] Número da mesa:", numero_mesa);
    console.log("[finalizar] Observações:", observacoes);
    console.log("[finalizar] Body recebido (raw):", req.body);

    try {
        // Validar que o pedido existe
        const pedidoExistente = await Pedido.listarPorId(id_pedido);
        console.log("[finalizar] Pedido existente:", pedidoExistente);
        
        if (!pedidoExistente) {
            console.error("[finalizar] Pedido nao encontrado");
            return res.status(404).json({ message: 'Pedido nao encontrado.' });
        }

        const novoStatus = status || 'pendente';
        console.log("[finalizar] Atualizando para status:", novoStatus, "(type: " + typeof novoStatus + ")");
        
        // Atualizar status, número_mesa e observações
        const sucesso = await Pedido.atualizarPedido(id_pedido, {
            status: novoStatus,
            numero_mesa: numero_mesa,
            observacoes: observacoes
        });

        if (sucesso) {
            console.log("[finalizar] Pedido atualizado com sucesso!");
            res.json({ message: 'Pedido atualizado com sucesso!' });
        } else {
            console.error("[finalizar] Falha ao atualizar o pedido");
            res.status(400).json({ message: 'Nao foi possivel atualizar o pedido.' });
        }

    } catch (err) {
        console.error("[finalizar] ERRO AO ATUALIZAR PEDIDO:", err.message);
        console.error("[finalizar] Stack trace:", err.stack);
        res.status(500).json({ 
            message: 'Erro ao atualizar pedido.',
            erro: err.message
        });
    }
};

// Deletar pedido
// Remove um pedido completamente do sistema.
// Primeiro remove os itens do pedido para evitar erro de FK.
exports.deletar = async (req, res) => {
    const id_pedido = req.params.id;

    console.log("🗑️ === DELETAR PEDIDO ===");
    console.log("ID do pedido:", id_pedido);

    try {
        // 1️⃣ Deletar itens do pedido
        console.log("🧹 Deletando itens do pedido...");
        await ItemPedido.deletarPorPedido(id_pedido);

        // 2️⃣ Deletar o pedido
        console.log("🗑️ Deletando pedido...");
        const sucesso = await Pedido.deletar(id_pedido);

        if (sucesso) {
            console.log("✅ Pedido deletado com sucesso!");
            res.json({ message: 'Pedido deletado com sucesso!' });
        } else {
            console.error("❌ Pedido não encontrado");
            res.status(404).json({ message: 'Pedido não encontrado.' });
        }

    } catch (err) {
        console.error("❌ ERRO AO DELETAR PEDIDO:", err);
        res.status(500).json({ 
            message: 'Erro ao deletar pedido.',
            erro: err.message 
        });
    }
};

// Marcar pedido como cancelado (preservar histórico)
exports.cancelar = async (req, res) => {
    const id_pedido = req.params.id;

    console.log("🗂️ === CANCELAR PEDIDO ===");
    console.log("ID do pedido:", id_pedido);

    try {
        const pedidoExistente = await Pedido.listarPorId(id_pedido);
        if (!pedidoExistente) {
            console.error("[cancelar] Pedido nao encontrado");
            return res.status(404).json({ message: 'Pedido nao encontrado.' });
        }

        const sucesso = await Pedido.atualizarPedido(id_pedido, { status: 'cancelado' });

        if (sucesso) {
            console.log("✅ Pedido marcado como cancelado");
            return res.json({ message: 'Pedido cancelado com sucesso!' });
        } else {
            console.error("❌ Falha ao marcar pedido como cancelado");
            return res.status(400).json({ message: 'Nao foi possivel cancelar o pedido.' });
        }
    } catch (err) {
        console.error("❌ ERRO AO CANCELAR PEDIDO:", err.message);
        console.error("Stack:", err.stack);

        // Detectar erro de CHECK/constraint (campo `status` não aceita 'cancelado')
        const msg = String(err.message || '').toLowerCase();
        if (msg.includes('check') || msg.includes('constraint') || msg.includes('er_check')) {
            return res.status(500).json({
                message: 'Erro ao cancelar pedido: restrição de status no banco de dados.',
                detalhe: 'O banco de dados não permite o valor "cancelado" para o campo status. Execute a migração em backend/migrations/001_allow_cancelado_status.sql para adicionar o valor.'
            });
        }

        return res.status(500).json({ message: 'Erro ao cancelar pedido.', erro: err.message });
    }
};

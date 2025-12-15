// public/js/produto.js

let produtoParaEditar = null;
let produtoParaDeletar = null;

document.addEventListener('DOMContentLoaded', () => {
    // ====================================================
    // SISTEMA DE ABAS
    // ====================================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;

            // Remove active de todas as abas
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Adiciona active apenas na aba clicada
            btn.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');

            // Se for a aba de listar, carrega os produtos
            if (tabName === 'listar') {
                carregarProdutos();
            }
        });
    });

    // ====================================================
    // CADASTRO DE PRODUTO
    // ====================================================
    const form = document.getElementById('produtoForm');
    const messageContainer = document.getElementById('message-container');
    const messageText = document.getElementById('message-text');

    function showMessage(msg, type = 'success') {
        messageText.textContent = msg;
        messageContainer.classList.remove('hidden', 'success', 'error');
        messageContainer.classList.add(type);
        setTimeout(() => {
            messageContainer.classList.add('hidden');
        }, 4000);
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nome = document.getElementById('nome').value.trim();
            const preco = document.getElementById('preco').value.trim();
            const categoria = document.getElementById('categoria').value.trim().toLowerCase();
            const descricao = document.getElementById('descricao').value.trim();
            const imagem = document.getElementById('imagem').value.trim();

            if (!nome || !preco || !categoria) {
                return showMessage('Nome, preço e categoria são obrigatórios!', 'error');
            }

            if (isNaN(parseFloat(preco)) || parseFloat(preco) <= 0) {
                return showMessage('O preço deve ser um número positivo válido.', 'error');
            }

            const produtoData = {
                nome,
                descricao,
                preco: parseFloat(preco),
                imagem: imagem || null,
                categoria
            };

            try {
                const response = await fetch('http://localhost:3000/api/produto', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(produtoData)
                });

                const data = await response.json();

                if (!response.ok) {
                    return showMessage(`Erro: ${data.message || 'Falha ao cadastrar produto.'}`, 'error');
                }

                showMessage(data.message, 'success');
                form.reset();
                
                // Carrega os produtos atualizados
                setTimeout(() => {
                    carregarProdutos();
                    document.querySelector('[data-tab="listar"]').click();
                }, 1500);
                
            } catch (err) {
                console.error('Erro de conexão:', err);
                showMessage('Erro ao conectar com o servidor.', 'error');
            }
        });
    }

    // ====================================================
    // LISTAR PRODUTOS
    // ====================================================
    async function carregarProdutos() {
        const productsList = document.getElementById('products-list');

        try {
            const response = await fetch('http://localhost:3000/api/produto');

            if (!response.ok) {
                productsList.innerHTML = '<div class="loading">Erro ao carregar produtos.</div>';
                return;
            }

            const produtos = await response.json();

            if (produtos.length === 0) {
                productsList.innerHTML = '<div class="loading">Nenhum produto cadastrado ainda.</div>';
                return;
            }

            productsList.innerHTML = produtos.map(prod => `
                <div class="product-card">
                    <img src="${prod.imagem || '/img/default.png'}" alt="${prod.nome}">
                    <div class="product-card-body">
                        <h3>${prod.nome}</h3>
                        <span class="product-category">${formatarCategoria(prod.categoria)}</span>
                        <p class="product-description">${prod.descricao || 'Sem descrição'}</p>
                        <div class="product-price">R$ ${Number(prod.preco).toFixed(2)}</div>
                        <div class="product-actions">
                            <button class="btn edit" onclick="abrirEdicao(${prod.id_produto})">✏️ Editar</button>
                            <button class="btn delete" onclick="abrirDelecao(${prod.id_produto}, '${prod.nome}')">🗑️ Excluir</button>
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (err) {
            console.error(err);
            productsList.innerHTML = '<div class="loading">Erro ao carregar produtos.</div>';
        }
    }

    // ====================================================
    // EDIÇÃO DE PRODUTO
    // ====================================================
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const closeEditModal = document.getElementById('closeEditModal');
    const editModalOverlay = document.getElementById('editModalOverlay');
    const cancelEdit = document.getElementById('cancelEdit');
    const saveEdit = document.getElementById('saveEdit');
    const editMessage = document.getElementById('editMessage');

    window.abrirEdicao = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/api/produto/${id}`);

            if (!response.ok) {
                alert('Erro ao carregar dados do produto.');
                return;
            }

            const produto = await response.json();
            produtoParaEditar = id;

            document.getElementById('editProdutoId').value = id;
            document.getElementById('editNome').value = produto.nome;
            document.getElementById('editPreco').value = produto.preco;
            document.getElementById('editCategoria').value = produto.categoria;
            document.getElementById('editDescricao').value = produto.descricao || '';
            document.getElementById('editImagem').value = produto.imagem || '';

            editMessage.classList.add('hidden');
            editModal.classList.remove('hidden');

        } catch (err) {
            console.error(err);
            alert('Erro ao carregar produto.');
        }
    };

    function closeEdit() {
        editModal.classList.add('hidden');
        produtoParaEditar = null;
    }

    closeEditModal.addEventListener('click', closeEdit);
    cancelEdit.addEventListener('click', closeEdit);
    editModalOverlay.addEventListener('click', closeEdit);

    saveEdit.addEventListener('click', async () => {
        const id = document.getElementById('editProdutoId').value;
        const nome = document.getElementById('editNome').value.trim();
        const preco = document.getElementById('editPreco').value.trim();
        const categoria = document.getElementById('editCategoria').value.trim().toLowerCase();
        const descricao = document.getElementById('editDescricao').value.trim();
        const imagem = document.getElementById('editImagem').value.trim();

        if (!nome || !preco || !categoria) {
            showEditMessage('Nome, preço e categoria são obrigatórios!', 'error');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/produto/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome,
                    preco: parseFloat(preco),
                    categoria,
                    descricao,
                    imagem: imagem || null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showEditMessage(`Erro: ${data.message}`, 'error');
                return;
            }

            showEditMessage('Produto atualizado com sucesso!', 'success');
            setTimeout(() => {
                closeEdit();
                carregarProdutos();
            }, 1500);

        } catch (err) {
            console.error(err);
            showEditMessage('Erro ao conectar com o servidor.', 'error');
        }
    });

    function showEditMessage(msg, type) {
        editMessage.textContent = msg;
        editMessage.classList.remove('hidden', 'success', 'error');
        editMessage.classList.add(type);
    }

    // ====================================================
    // EXCLUSÃO DE PRODUTO
    // ====================================================
    const deleteModal = document.getElementById('deleteModal');
    const deleteMessage = document.getElementById('deleteMessage');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const deleteModalOverlay = document.getElementById('deleteModalOverlay');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');

    window.abrirDelecao = (id, nome) => {
        produtoParaDeletar = id;
        deleteMessage.innerHTML = `⚠️ Tem certeza que deseja excluir <strong>${nome}</strong>? Esta ação é irreversível.`;
        deleteModal.classList.remove('hidden');
    };

    function closeDelete() {
        deleteModal.classList.add('hidden');
        produtoParaDeletar = null;
    }

    closeDeleteModal.addEventListener('click', closeDelete);
    cancelDelete.addEventListener('click', closeDelete);
    deleteModalOverlay.addEventListener('click', closeDelete);

    confirmDelete.addEventListener('click', async () => {
        if (!produtoParaDeletar) return;

        try {
            const response = await fetch(`http://localhost:3000/api/produto/${produtoParaDeletar}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok) {
                alert(`Erro: ${data.message}`);
                return;
            }

            closeDelete();
            carregarProdutos();

        } catch (err) {
            console.error(err);
            alert('Erro ao conectar com o servidor.');
        }
    });

    // ====================================================
    // FUNÇÕES AUXILIARES
    // ====================================================
function formatarCategoria(categoria) {
    const nomes = {
        'carnes': '🍖 Carnes',
        'frangos': '🍗 Frangos',
        'peixe': '🐟 Peixe & Camarão',
        'massas': '🍝 Massas',
        'bebida': '🥤 Bebidas',
        'porcao': '🍟 Porções'
    };
    return nomes[categoria] || categoria;
}


    // Fechar modais com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!editModal.classList.contains('hidden')) closeEdit();
            if (!deleteModal.classList.contains('hidden')) closeDelete();
        }
    });
});
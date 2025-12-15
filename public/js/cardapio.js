// ====================== public/js/cardapio.js ======================

document.addEventListener("DOMContentLoaded", () => {

    const menuGrid = document.getElementById("menuGrid");
    const bebidasGrid = document.getElementById("bebidasGrid");
    const filters = document.querySelectorAll(".filter");

    let produtos = []; // Variável global para armazenar os produtos

    // ======================================================
    // === 1. Carregar produtos da API ===
    // ======================================================

    async function carregarCardapio() {
        if (!menuGrid) return;

        menuGrid.innerHTML = '<p>Carregando cardápio...</p>';
        if (bebidasGrid) bebidasGrid.innerHTML = '<p>Carregando bebidas...</p>';

        try {
            const response = await fetch('/api/produto');
            if (!response.ok) throw new Error('Erro ao buscar produtos da API.');

            produtos = await response.json();  // Atualizando a variável global
            renderizarCards(produtos);

        } catch (error) {
            console.error('Erro ao carregar o cardápio:', error);
            menuGrid.innerHTML = '<p style="color: red;">Erro ao carregar os pratos.</p>';
            if (bebidasGrid) bebidasGrid.innerHTML = '';
        }
    }

    // ======================================================
    // === 2. Criar os cards no HTML ===
    // ======================================================

    function renderizarCards(produtos) {

        const pratos = produtos.filter(p => p.categoria && p.categoria.toLowerCase() !== 'bebida');
        const bebidas = produtos.filter(p => p.categoria && p.categoria.toLowerCase() === 'bebida');

        // === PRATOS ===
        const htmlPratos = pratos.map(produto => {
            return `
            <div class="highlight-card" data-id="${produto.id_produto}" data-category="${produto.categoria}">
                <img src="${produto.imagem || '/img/default.png'}" alt="Imagem de ${produto.nome}">
                <div class="card-body">
                    <h3>${produto.nome}</h3>
                    <p>${produto.descricao.substring(0, 80)}${produto.descricao.length > 80 ? '...' : ''}</p>
                    <span class="price">R$ ${Number(produto.preco).toFixed(2)}</span>
                    <!-- Botão Adicionar ao Pedido -->
                    <button class="btn-add">Adicionar ao Pedido</button>
                </div>
            </div>
        `;
        }).join('');
        menuGrid.innerHTML = htmlPratos;

        // === BEBIDAS ===
        if (bebidasGrid) {
            const htmlBebidas = bebidas.map(produto => {
                return `
            <div class="highlight-card" data-id="${produto.id_produto}">
                <img src="${produto.imagem || '/img/default.png'}" alt="Imagem de ${produto.nome}">
                <div class="card-body">
                    <h3>${produto.nome}</h3>
                    <p>${produto.descricao.substring(0, 80)}${produto.descricao.length > 80 ? '...' : ''}</p>
                    <span class="price">R$ ${Number(produto.preco).toFixed(2)}</span>
                    <!-- Botão Adicionar ao Pedido -->
                    <button class="btn-add">Adicionar ao Pedido</button>
                </div>
            </div>
        `;
            }).join('');
            bebidasGrid.innerHTML = htmlBebidas;
        }

        // Adiciona os event listeners para os botões de adicionar ao pedido
        document.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', () => {
                const produtoId = btn.closest('.highlight-card').getAttribute('data-id');
                adicionarAoPedido(parseInt(produtoId));
            });
        });

        iniciarLógicaInterface();
    }

    // ======================================================
    // === 3. Filtros + Mostrar Mais + Modal ===
    // ======================================================

    function iniciarLógicaInterface() {

        const cards = Array.from(document.querySelectorAll("#menuGrid .highlight-card"));
        if (cards.length === 0) return;

        // === Botão Mostrar Mais ===
        let showMoreBtn = document.querySelector(".show-more");
        if (!showMoreBtn) {
            showMoreBtn = document.createElement("button");
            showMoreBtn.textContent = "Mostrar mais";
            showMoreBtn.classList.add("btn", "show-more");
            menuGrid.after(showMoreBtn);
        }

        let cardsVisible = 6;
        let showAll = false;

        function updateCards(filter = "all", showAllParam = false) {
            let count = 0;

            cards.forEach(card => {
                const category = card.dataset.category;
                if ((filter === "all" || category === filter) && (showAllParam || count < cardsVisible)) {
                    card.style.display = "block";
                    count++;
                } else {
                    card.style.display = "none";
                }
            });

            const activeFilter = document.querySelector(".filter.active")?.dataset.filter || "all";
            const filteredCards = activeFilter === "all" ? cards : cards.filter(c => c.dataset.category === activeFilter);

            showMoreBtn.style.display = (filteredCards.length > cardsVisible && !showAllParam) ? "block" : "none";
        }

        updateCards();

        // === Filtros ===
        filters.forEach(btn => {
            btn.addEventListener("click", () => {
                filters.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                showAll = false;
                updateCards(btn.dataset.filter);
            });
        });

        // === Mostrar Mais ===
        showMoreBtn.addEventListener("click", () => {
            showAll = true;
            const activeFilter = document.querySelector(".filter.active").dataset.filter;
            updateCards(activeFilter, true);
            showMoreBtn.style.display = "none";
        });
    }

    // Função para adicionar o produto ao pedido (COM SALVO NO BANCO)
    async function adicionarAoPedido(id_produto) {
        console.log("🛒 Adicionando produto ao pedido:", id_produto);

        // 1️⃣ Verificar se usuário está logado
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario || !usuario.id) {
            alert("⚠️ Faça login para adicionar itens ao pedido!");
            window.location.href = "/html/login.html";
            return;
        }

        // 2️⃣ Procurar o produto
        const produto = produtos.find(p => p.id_produto === id_produto);
        if (!produto) {
            console.error("❌ Produto não encontrado");
            return;
        }

        try {
            let id_pedido = localStorage.getItem("id_pedido_atual");

            // 3️⃣ Se tiver um pedido, verificar se ele ainda existe no banco
            if (id_pedido) {
                console.log("🔍 Verificando se pedido ID " + id_pedido + " ainda existe...");
                try {
                    const verificarRes = await fetch(`/api/pedido/${id_pedido}/itens`);
                    if (!verificarRes.ok) {
                        console.warn("⚠️ Pedido não encontrado no banco. Criando novo...");
                        localStorage.removeItem("id_pedido_atual");
                        id_pedido = null;
                    } else {
                        console.log("✅ Pedido ainda existe no banco");
                    }
                } catch (err) {
                    console.warn("⚠️ Erro ao verificar pedido. Criando novo...");
                    localStorage.removeItem("id_pedido_atual");
                    id_pedido = null;
                }
            }

            // 4️⃣ Se NÃO tiver pedido, criar um novo
            if (!id_pedido) {
                console.log("📝 Criando novo pedido no banco...");
                
                // Limpar localStorage antigo
                localStorage.removeItem("pedido");
                
                const pedidoRes = await fetch("/api/pedido", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: usuario.id,
                        itens: [],  // Começar vazio
                        observacoes: ""
                    })
                });

                if (!pedidoRes.ok) {
                    const erro = await pedidoRes.json();
                    throw new Error(erro.message || "Erro ao criar pedido");
                }

                const pedidoData = await pedidoRes.json();
                id_pedido = pedidoData.id_pedido;

                console.log("✅ Pedido criado com ID:", id_pedido);
                localStorage.setItem("id_pedido_atual", id_pedido);
            }

            // 5️⃣ Adicionar item ao pedido no banco
            console.log("📦 Adicionando item ao pedido...");
            
            const adicionarRes = await fetch(`/api/pedido/${id_pedido}/itens`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_produto: id_produto,
                    quantidade: 1  // Sempre começar com 1, o backend controla
                })
            });

            if (!adicionarRes.ok) {
                const erro = await adicionarRes.json();
                throw new Error(erro.message || "Erro ao adicionar item");
            }

            // 6️⃣ Atualizar localStorage para exibição local
            let pedidoLocal = JSON.parse(localStorage.getItem("pedido")) || [];
            const itemExistente = pedidoLocal.find(item => item.id_produto === id_produto);
            
            if (itemExistente) {
                itemExistente.quantidade += 1;
            } else {
                pedidoLocal.push({
                    id_produto: produto.id_produto,
                    nome: produto.nome,
                    descricao: produto.descricao,
                    preco: produto.preco,
                    quantidade: 1
                });
            }

            localStorage.setItem("pedido", JSON.stringify(pedidoLocal));

            console.log("✅ Produto adicionado com sucesso!");
            alert("✅ Produto adicionado ao pedido!\n\nID do Pedido: " + id_pedido);

        } catch (err) {
            console.error("❌ ERRO ao adicionar produto:", err);
            alert("❌ Erro ao adicionar produto:\n" + err.message);
        }
    }

    carregarCardapio();
});

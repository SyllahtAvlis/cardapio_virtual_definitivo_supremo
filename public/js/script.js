// public/js/script.js - Script JavaScript para funcionalidades da página inicial
// Este arquivo controla a navegação, autenticação de usuário e interações dinâmicas.
// Ele gerencia o menu baseado no status de login e manipula eventos de clique.

const loginLink = document.getElementById("login-link");
const cadastroLink = document.getElementById("cadastro-link");
const logoutButton = document.getElementById("logout-button");
const usernameDisplay = document.getElementById("username-display");
const contaLink = document.getElementById("conta-link");

// Recupera dados do usuário logado armazenados no navegador (localStorage)
const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));

// Mostra link "Gerenciar Produtos" apenas para administradores
const produtoLink = document.getElementById("produto-link-item");
if (produtoLink && usuarioLogado && usuarioLogado.tipo === "administrador") {
    produtoLink.style.display = "inline-block";
}

// Mostra link "Painel do Cozinheiro" apenas para administradores
const cozinheiroLink = document.getElementById("cozinheiro-link-item");
if (cozinheiroLink && usuarioLogado && usuarioLogado.tipo === "administrador") {
    cozinheiroLink.style.display = "inline-block";
}

// -----------------------------
// CONTROLE DE EXIBIÇÃO DO MENU BASEADO NO LOGIN
// -----------------------------
if (usuarioLogado) {
    // Usuário logado: esconde opções de login/cadastro
    if (loginLink) loginLink.style.display = "none";
    if (cadastroLink) cadastroLink.style.display = "none";

    // Mostra botão de logout
    if (logoutButton) logoutButton.style.display = "inline-block";

    // Exibe saudação com nome do usuário
    if (usernameDisplay) {
        usernameDisplay.textContent = `Bem-vindo, ${usuarioLogado.nome}!`;
        usernameDisplay.style.display = "inline-block";
    }

    // Mostra link para "Perfil"
    if (contaLink) contaLink.style.display = "inline-block";
} else {
    // Usuário não logado: esconde opções de conta
    if (contaLink) contaLink.style.display = "none";
    if (logoutButton) logoutButton.style.display = "none";

    if (loginLink) loginLink.style.display = "inline-block";
    if (cadastroLink) cadastroLink.style.display = "inline-block";
}

// -----------------------------
// Logout
// -----------------------------
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("usuario");
        alert("Logout realizado com sucesso!");
        window.location.href = "/html/index.html";
    });
}

// ======================================================
// PARTE CORRIGIDA — CARREGAR PRODUTOS NO INDEX (Destaques)
// Ajustada para alinhamento vertical consistente.
// ======================================================

document.addEventListener("DOMContentLoaded", carregarProdutos);

async function carregarProdutos() {
    const container = document.getElementById("produtos-container");

    if (!container) return;

    try {
        const response = await fetch("/api/produto");

        if (!response.ok) {
            throw new Error('Falha ao buscar os produtos.');
        }

        const produtos = await response.json();

        if (produtos.length === 0) {
            container.innerHTML = '<p style="color: var(--muted); text-align: center;">Nenhum produto em destaque no momento.</p>';
            return;
        }

        // Seleciona aleatoriamente 3 produtos para destaque
        const produtosDestaque = produtos.sort(() => 0.5 - Math.random()).slice(0, 3);

        // Monta o HTML dos cards com a nova estrutura para Flexbox
        container.innerHTML = produtosDestaque.map(prod => `
            <div class="highlight-card"
                onclick="window.location.href='/html/cardapio.html?id=${prod.id_produto}'">

                <img src="${prod.imagem || '/img/default.png'}" 
                    alt="Imagem de ${prod.nome}">
                
                <div class="card-body">                     <h3>${prod.nome}</h3> 
                    <p>${prod.descricao.substring(0, 80)}${prod.descricao.length > 80 ? '...' : ''}</p>

                    <span class="price">R$ ${Number(prod.preco).toFixed(2)}</span>
                </div> 
            </div>
        `).join("");

	} catch (error) {
		console.error(error);
		container.innerHTML = '<p style="color: red; text-align: center;">Falha ao carregar os destaques da API.</p>';
	}
}

// ======================================================
// TOGGLE MENU MÓVEL (AJUSTADO)
// ======================================================
const navToggle = document.getElementById("navToggle");
const navList = document.getElementById("navList");

if (navToggle && navList) {
	navToggle.addEventListener("click", (e) => {
		e.stopPropagation(); // Não fecha ao clicar no toggle
		const isOpen = navList.classList.contains("open");
		navList.classList.toggle("open");
		navToggle.setAttribute("aria-expanded", !isOpen);
	});

	// Fecha menu ao clicar em um link
	const navLinks = navList.querySelectorAll("a");
	navLinks.forEach(link => {
		link.addEventListener("click", () => {
			navList.classList.remove("open");
			navToggle.setAttribute("aria-expanded", "false");
		});
	});

	// Fecha menu ao clicar fora do menu e do toggle
	document.addEventListener("click", (e) => {
		if (!e.target.closest(".main-nav") && !e.target.closest(".nav-toggle")) {
			navList.classList.remove("open");
			navToggle.setAttribute("aria-expanded", "false");
		}
	});
}
// -----------------------------
// CONTROLE GERAL DO HEADER
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  // 2. USER AREA (MOSTRAR NOME, ESCONDER/MOSTRAR LINKS)
  let usuario = null;
  try {
    usuario = JSON.parse(localStorage.getItem('usuario'));
  } catch (err) {
    usuario = null;
  }

  const loginLinks = document.querySelectorAll('#login-link');
  const cadastroLinks = document.querySelectorAll('#cadastro-link');
  const contaLinks = document.querySelectorAll('#conta-link');
  const usernameDisplays = document.querySelectorAll('#username-display');
  const logoutButtons = document.querySelectorAll('#logout-button');

  function applyLoggedState(user) {
    if (user && user.id) {
      const displayName = user.nome || user.username || user.email || 'Usuário';
      usernameDisplays.forEach(el => {
        el.textContent = displayName;
        el.style.display = 'inline-block';
      });
      loginLinks.forEach(a => a.style.display = 'none');
      cadastroLinks.forEach(a => a.style.display = 'none');
      contaLinks.forEach(a => a.style.display = 'inline-block');
      logoutButtons.forEach(b => b.style.display = 'inline-block');
    } else {
      usernameDisplays.forEach(el => el.style.display = 'none');
      loginLinks.forEach(a => a.style.display = 'inline-block');
      cadastroLinks.forEach(a => a.style.display = 'inline-block');
      contaLinks.forEach(a => a.style.display = 'none');
      logoutButtons.forEach(b => b.style.display = 'none');
    }
  }

  function handleLogoutClick(e) {
    e.preventDefault();
    if (confirm('Tem certeza que deseja sair?')) {
      try {
        localStorage.removeItem('usuario');
        localStorage.removeItem('pedido');
        localStorage.removeItem('id_pedido_atual');
      } catch (err) {}
      window.location.href = '/html/index.html';
    }
  }

  logoutButtons.forEach(btn => {
    btn.removeEventListener('click', handleLogoutClick);
    btn.addEventListener('click', handleLogoutClick);
  });

  applyLoggedState(usuario);

  window.addEventListener('storage', (e) => {
    if (e.key === 'usuario') {
      let u = null;
      try { u = JSON.parse(e.newValue); } catch (err) { u = null; }
      applyLoggedState(u);
    }
  });

  // 3. ATUALIZAR ANO NO FOOTER
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
console.log('✅ script.js inicializado com sucesso');
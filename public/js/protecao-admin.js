// public/js/protecao-admin.js
// Sistema de proteção para páginas administrativas
// Redireciona para login se não for administrador

(function() {
    // Lista de páginas que requerem acesso de administrador
    const paginasAdmin = [
        '/html/produto.html',
        '/html/cozinheiro.html'
    ];

    const caminhoAtual = window.location.pathname;
    const estaEmPaginaAdmin = paginasAdmin.some(pagina => caminhoAtual.includes(pagina));
    
    if (!estaEmPaginaAdmin) return;

    // Recupera usuário logado do localStorage
    const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));

    // Se não está logado, redireciona para login
    if (!usuarioLogado) {
        window.location.href = "/html/login.html?redirect=" + encodeURIComponent(window.location.pathname) + "&msg=login_required";
        return;
    }

    // Verifica se não é administrador (tipo pode ser "administrador" ou "admin")
    const ehAdmin = usuarioLogado.tipo === "administrador" || usuarioLogado.tipo === "admin";
    
    // Se não é admin, redireciona para login com mensagem
    if (!ehAdmin) {
        window.location.href = "/html/login.html?redirect=" + encodeURIComponent(window.location.pathname) + "&msg=admin_required";
        return;
    }

    // Se chegou aqui, o usuário é admin logado - tudo OK!
    console.log(`✓ Acesso autorizado para administrador: ${usuarioLogado.nome}`);
})();

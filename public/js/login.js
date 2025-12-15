// public/js/login.js

// Função para obter parâmetros da URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Mostra mensagens especiais se vier de redirecionamento
document.addEventListener('DOMContentLoaded', () => {
    const msg = getQueryParam('msg');
    const errorMsg = document.getElementById("error");
    
    if (!errorMsg) return;
    
    if (msg === 'login_required') {
        errorMsg.textContent = "🔐 Você precisa estar logado para acessar esta página.";
        errorMsg.classList.add("show");
    } else if (msg === 'admin_required') {
        errorMsg.textContent = "⚠️ Esta página é exclusiva para administradores. Faça login com uma conta de administrador.";
        errorMsg.classList.add("show");
    }
});

// -----------------------------
// Login (só funciona na tela de login)
// -----------------------------
const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("error");

function showError(msg) {
    if (errorMsg) {
        errorMsg.textContent = msg;
        errorMsg.classList.add("show");
        setTimeout(() => errorMsg.classList.remove("show"), 3000);
    }
}

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) return showError("Preencha todos os campos!");

        try {
            const response = await fetch("http://localhost:3000/api/usuario/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (!response.ok) return showError(data.message);

            // Salva TUDO do usuário
            localStorage.setItem("usuario", JSON.stringify(data.usuario));

            alert("Login realizado com sucesso!");

            // Verifica se veio de um redirecionamento de página protegida
            const redirectUrl = getQueryParam('redirect');
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                // Lógica padrão se não veio de redirecionamento
                const currentPage = window.location.pathname;
                if (currentPage.includes("/html/login.html")) {
                    window.location.href = "/html/index.html";
                } else {
                    window.location.href = "/html/conta.html";
                }
            }

        } catch (err) {
            console.error(err);
            showError("Erro ao conectar com o servidor.");
        }
    });
}

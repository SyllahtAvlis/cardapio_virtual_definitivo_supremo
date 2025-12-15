// public/js/cadastro.js

const form = document.getElementById("cadastroForm");
const errorMsg = document.getElementById("error");
const tipoSelect = document.getElementById("tipo");
const adminCodeContainer = document.getElementById("adminCodeContainer");

// Função para mostrar mensagens de erro
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.add("show");
  setTimeout(() => errorMsg.classList.remove("show"), 3000);
}

// Exibe ou oculta o campo de código de admin dependendo da seleção
tipoSelect.addEventListener("change", function () {
  if (tipoSelect.value === "admin") {
    adminCodeContainer.style.display = "block";  // Exibe o campo
  } else {
    adminCodeContainer.style.display = "none";  // Oculta o campo
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const tipoFront = document.getElementById("tipo").value;  // "user" ou "admin"
  const adminCode = document.getElementById("adminCode")?.value.trim() || "";

  // Converte tipo para o que o backend espera
  const tipo = tipoFront === "admin" ? "administrador" : "cliente";

  // Verifica campos obrigatórios
  if (!username || !email || !password || !confirmPassword) {
    return showError("Preencha todos os campos!");
  }

  if (password !== confirmPassword) {
    return showError("As senhas não coincidem!");
  }

  // Se for admin, verifica se preencheu o código
  if (tipo === "administrador" && !adminCode) {
    return showError("Por favor, insira o código de administrador.");
  }

  // Envia os dados para o backend
  try {
    const response = await fetch("http://localhost:3000/api/usuario/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, tipo, adminCode })
    });

    const data = await response.json();

    if (!response.ok) return showError(data.message);

    alert("Usuário cadastrado com sucesso!");
    window.location.href = "/html/index.html";
  } catch (err) {
    console.error(err);
    showError("Erro ao conectar com o servidor.");
  }
});
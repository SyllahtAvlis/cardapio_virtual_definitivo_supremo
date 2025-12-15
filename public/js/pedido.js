// public/js/pedido.js

console.log("📄 Carregando pedido.js...");

// Expor funções globalmente para o HTML
let finalizarPedido;
let cancelarPedido;

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM carregado");
  
  const abrirModalBtn = document.getElementById("abrirModal");
  const fecharModalBtn = document.getElementById("fecharModal");
  const modal = document.getElementById("modalPagamento");
  const cartItemsContainer = document.getElementById("cart-items");
  const observacoesInput = document.getElementById("observacoes");
  const observacoesTexto = document.getElementById("observacoesTexto");

  console.log("Elementos encontrados:", { abrirModalBtn, fecharModalBtn, modal, cartItemsContainer });

  // Carrega o pedido salvo no localStorage
  let pedido = JSON.parse(localStorage.getItem("pedido")) || [];
  console.log("📦 Pedido do localStorage:", pedido);

  // ==============================
  // EXIBIR CARRINHO
  // ==============================
  async function exibirCarrinho() {
    console.log("📋 Exibindo carrinho...");
    
    // Tenta buscar do banco se tiver um pedido atual
    const id_pedido = localStorage.getItem("id_pedido_atual");
    let itens = [];

    if (id_pedido) {
      try {
        console.log("📡 Buscando itens do banco para pedido ID:", id_pedido);
        const res = await fetch(`/api/pedido/${id_pedido}/itens`);
        
        if (res.ok) {
          itens = await res.json();
          console.log("✅ Itens do banco:", itens);
          
          // Agrupar itens com mesmo id_produto
          const itensAgrupados = {};
          itens.forEach(item => {
            if (itensAgrupados[item.id_produto]) {
              itensAgrupados[item.id_produto].quantidade += item.quantidade;
            } else {
              itensAgrupados[item.id_produto] = {
                id_produto: item.id_produto,
                nome: item.produto_nome || "Produto",
                preco: item.preco_unitario,
                quantidade: item.quantidade,
                descricao: ""
              };
            }
          });
          
          itens = Object.values(itensAgrupados);
          
          // Atualizar localStorage com os itens agrupados
          localStorage.setItem("pedido", JSON.stringify(itens));
        }
      } catch (err) {
        console.error("❌ Erro ao buscar itens do banco:", err);
        // Usar localStorage como fallback
        itens = JSON.parse(localStorage.getItem("pedido")) || [];
      }
    } else {
      // Sem pedido no banco, usar localStorage
      itens = JSON.parse(localStorage.getItem("pedido")) || [];
    }

    if (itens.length === 0) {
      cartItemsContainer.innerHTML = "<p>Nenhum item no pedido.</p>";
      return;
    }

    let total = 0;

    const list = itens
      .map(item => {
        total += item.preco * item.quantidade;

        return `
          <div class="cart-item">
            <h3>${item.nome}</h3>
            <p>${(item.descricao || "").substring(0, 80)}${(item.descricao || "").length > 80 ? "..." : ""}</p>
            <span class="price">R$ ${Number(item.preco).toFixed(2)}</span>
            <span class="quantidade">Quantidade: ${item.quantidade}</span>
            <hr>
          </div>
        `;
      })
      .join("");

    cartItemsContainer.innerHTML = list;

    const totalElement = document.createElement("p");
    totalElement.innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
    cartItemsContainer.appendChild(totalElement);

    observacoesTexto.textContent = observacoesInput.value;
  }

  exibirCarrinho();

  // ==============================
  // ABRIR MODAL
  // ==============================
  if (abrirModalBtn) {
    console.log("✅ Botão 'Pagar' encontrado");
    abrirModalBtn.addEventListener("click", () => {
      console.log("🔘 Clique em 'Pagar'");
      
      // Preencher modal com itens do pedido
      const itensParaModal = JSON.parse(localStorage.getItem("pedido")) || [];
      const modalResumeItens = document.getElementById("modal-resume-itens");
      const modalTotal = document.getElementById("modal-total");
      
      if (itensParaModal.length === 0) {
        alert("⚠️ Seu pedido está vazio!");
        return;
      }
      
      let total = 0;
      const htmlItens = itensParaModal
        .map(item => {
          const subtotal = item.preco * item.quantidade;
          total += subtotal;
          return `
            <div class="modal-item">
              <h4>${item.nome}</h4>
              <p>${item.quantidade}x R$ ${Number(item.preco).toFixed(2)} = <strong>R$ ${subtotal.toFixed(2)}</strong></p>
            </div>
          `;
        })
        .join("");
      
      modalResumeItens.innerHTML = htmlItens;
      modalTotal.textContent = `R$ ${total.toFixed(2)}`;
      
      modal.style.display = "flex";

      // Criar botão confirmar se não existir
      if (!document.getElementById("confirmPayment")) {
        console.log("🔲 Criando botão 'Confirmar Pagamento'");
        const confirmBtn = document.createElement("button");
        confirmBtn.id = "confirmPayment";
        confirmBtn.className = "btn confirmar-pagamento";
        confirmBtn.textContent = "Confirmar Pedido";

        confirmBtn.style.marginTop = "12px";
        confirmBtn.style.padding = "12px";
        confirmBtn.style.borderRadius = "10px";
        confirmBtn.style.border = "none";
        confirmBtn.style.cursor = "pointer";
        confirmBtn.style.fontSize = "16px";

        const modalContent = modal.querySelector(".modal-content");
        modalContent.appendChild(confirmBtn);

        confirmBtn.addEventListener("click", () => {
          console.log("🔘 Clique em 'Confirmar Pedido'");
          const obs = observacoesInput.value;
          finalizarPedido(obs);
        });
      }
    });
  }

  // ==============================
  // FINALIZAR PEDIDO
  // ==============================
  finalizarPedido = async (observacoes) => {
    console.log("🚀 === INICIAR FINALIZAR PEDIDO ===");
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const id_pedido = localStorage.getItem("id_pedido_atual");
      const numeromesa = document.getElementById("numeromesa").value;

      console.log("👤 Usuário:", usuario);
      console.log("🎯 ID do pedido:", id_pedido);
      console.log("🪑 Número da mesa:", numeromesa);

      if (!usuario || !usuario.id) {
        console.error("❌ Usuário não logado");
        alert("Erro: usuário não está logado.");
        return;
      }

      if (!id_pedido) {
        console.error("❌ Nenhum pedido em andamento");
        alert("Erro: Nenhum pedido em andamento. Adicione itens primeiro!");
        return;
      }

      if (!numeromesa) {
        console.error("❌ Número da mesa não selecionado");
        alert("Erro: Selecione um número de mesa!");
        return;
      }

      // 1️⃣ Atualizar observações no pedido (salvar as observações finais)
      console.log("📝 Observações do cliente:", observacoes);
      
      // 2️⃣ Finalizar pedido
      console.log("🔄 Finalizando pedido...");
      const finalizarRes = await fetch(`/api/pedido/${id_pedido}/finalizar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "pendente",
          numero_mesa: parseInt(numeromesa),
          observacoes: observacoes
        })
      });

      console.log("Resposta finalizar (status):", finalizarRes.status);

      if (!finalizarRes.ok) {
        const erro = await finalizarRes.json();
        console.error("❌ Erro ao finalizar:", erro);
        alert("⚠️ Erro ao finalizar:\n" + erro.message);
        return;
      }

      console.log("✅ Pedido finalizado com sucesso!");
      alert("✅ Pedido finalizado com sucesso! ID: " + id_pedido);

      // 3️⃣ Limpar localStorage
      localStorage.removeItem("pedido");
      localStorage.removeItem("id_pedido_atual");

      // 4️⃣ Redirecionar para o cardápio (página inicial)
      setTimeout(() => {
        window.location.href = "/html/cardapio.html";
      }, 1500);

    } catch (err) {
      console.error("❌ ERRO AO FINALIZAR PEDIDO:", err);
      console.error("Stack:", err.stack);
      alert("❌ Erro ao finalizar pedido:\n" + err.message);
    }
  };

  // ==============================
  // CANCELAR PEDIDO
  // ==============================
  cancelarPedido = () => {
    console.log("🔙 Cancelando pedido...");
    if (confirm("Tem certeza que deseja cancelar o pedido?")) {
      localStorage.removeItem("pedido");
      localStorage.removeItem("id_pedido_atual");
      console.log("✅ Pedido cancelado");
      alert("Pedido cancelado.");
      window.location.href = "/html/index.html";
    }
  };

  // ==============================
  // FECHAR MODAL
  // ==============================
  if (fecharModalBtn) {
    fecharModalBtn.addEventListener("click", () => {
      console.log("❌ Fechando modal");
      modal.style.display = "none";
    });
  }

  // ==============================
  // FECHAR MODAL AO CLICAR FORA
  // ==============================
  modal.addEventListener("click", e => {
    if (e.target === modal) {
      console.log("❌ Fechando modal (clique fora)");
      modal.style.display = "none";
    }
  });

  console.log("✅ Scripts de pedido inicializados");
});

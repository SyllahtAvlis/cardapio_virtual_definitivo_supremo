// ====================== LISTA DE PEDIDOS ======================
// Agora busca do banco de dados em tempo real
let pedidos = [];

// ====================== FUNÇÃO PARA CARREGAR PEDIDOS DO BANCO ======================
async function carregarPedidosDoBanco() {
    try {
        console.log("📡 Carregando pedidos do banco...");
        const res = await fetch("/api/pedido");
        
        if (!res.ok) {
            throw new Error(`Erro HTTP: ${res.status}`);
        }

        const dados = await res.json();
        console.log("✅ Pedidos carregados:", dados.length, "pedidos");

        // Transformar dados do banco para o formato esperado pelo código existente
        const pedidosAtualizados = dados.map((pedido, idx) => {
            // Buscar itens e formatá-los
            const produtos = (pedido.itens || []).map(item => ({
                nome: item.produto_nome || "Produto",
                observacao: "",
                pronto: false,
                bebida: false,
                quantidade: item.quantidade,
                preco: item.preco
            }));

            // Converter status do banco para o formato esperado (mantém status original do banco para referência)
            const statusMap = {
                'pendente': 'Aguardando',
                'em preparo': 'Em preparo',
                'pronto': 'Pronto',
                'entregue': 'Entregue',
                'finalizado': 'Pronto', // Para compatibilidade com dados antigos
                'aguardando': 'Aguardando',
                'em_preparo': 'Em preparo'
            };

            const statusBDFormatado = statusMap[pedido.status?.toLowerCase()] || pedido.status || "Aguardando";

            // Calcular tempo decorrido inicial
            const tempoSegundosInicial = Math.max(0, Math.floor((Date.now() - (pedido.data_pedido || 0)) / 1000));
            
            // ====================================================================
            // CORREÇÃO 1: CALCULAR PRIORIDADE NA CARGA DO BANCO PARA EVITAR RESET
            // ====================================================================
            let prioridadeInicial = "Normal";

            if (statusBDFormatado === "Aguardando" && tempoSegundosInicial >= AGUARDANDO_URG_SECONDS) {
                prioridadeInicial = "Urgente";
            } else if (statusBDFormatado === "Em preparo" && tempoSegundosInicial >= PREPARO_URG_SECONDS) {
                prioridadeInicial = "Urgente";
            }
            // ====================================================================

            // Preservar o estado "pronto" dos items que já existiam
            const pedidoExistente = pedidos.find(p => p.id_pedido === pedido.id_pedido);
            if (pedidoExistente && pedidoExistente.produtos) {
                produtos.forEach((prod, idx) => {
                    if (pedidoExistente.produtos[idx] && pedidoExistente.produtos[idx].pronto) {
                        prod.pronto = true;
                    }
                });
            }

            return {
                mesa: pedido.numero_mesa || (idx + 1),
                cliente: pedido.nome_cliente || "Cliente",
                tempoEstimado: 30,
                status: statusBDFormatado,
                statusBD: pedido.status, // Guardar status original do banco para operações
                prioridade: prioridadeInicial, // USAR A PRIORIDADE CALCULADA
                produtos: produtos,
                id_pedido: pedido.id_pedido,
                observacoes: pedido.observacoes || "",
                total: pedido.total || 0,
                data_pedido: pedido.data_pedido, // Agora é um timestamp unix (número)
                tempoSegundos: tempoSegundosInicial // Inicializar com o tempo decorrido
            };
        });

        pedidos = pedidosAtualizados;
        console.log("✅ Pedidos transformados:", pedidos);
        renderPedidos();
    } catch (err) {
        console.error("❌ Erro ao carregar pedidos do banco:", err);
        // Manter os pedidos em memória como fallback
        console.log("⚠️ Usando dados em cache");
    }
}

// Carregar pedidos na inicialização e atualizar a cada 3 segundos
// Movido para dentro do DOMContentLoaded

// ====================== ESTADO DE FILTROS GLOBAIS ======================
let mesaFiltro = null;
let prioridadeFiltro = null;

// ====================== DADOS DE CONEXÃO DO BANCO ======================
let ultimaAtualizacaoDB = "N/A";
let ultimoErroDB = "Nenhum erro registrado.";

// ====================== CONSTANTES DE URGÊNCIA ======================
const AGUARDANDO_URG_SECONDS = 60; // 1 minuto
const PREPARO_URG_SECONDS = 60 * 20; // 20 minutos

// ====================== FUNÇÃO MODAL CUSTOMIZADO ======================
function showCustomModal(title, message, showConfirm, callback) {
  const modal = document.getElementById("modal-confirmacao");
  if (!modal) return;

  const messageEl = modal.querySelector(".modal-text");
  const confirmarBtn = modal.querySelector("#confirmar-cancelar");
  const fecharBtn = modal.querySelector("#fechar-modal");
  
  if (messageEl) messageEl.textContent = message;

  if (confirmarBtn) {
    if (showConfirm) {
      confirmarBtn.style.display = "inline-block";
    } else {
      confirmarBtn.style.display = "none";
      if(fecharBtn) fecharBtn.textContent = "Entendido";
    }
  }

  modal.style.display = "flex";
  
  if(fecharBtn && showConfirm) fecharBtn.textContent = "Não, voltar";

  function cleanup() {
    modal.style.display = "none";
    if (confirmarBtn) confirmarBtn.removeEventListener("click", onConfirm);
    if (fecharBtn) fecharBtn.removeEventListener("click", onCancel);
  }

  function onConfirm() {
    cleanup();
    callback(true);
  }

  function onCancel() {
    cleanup();
    callback(false);
  }

  if (confirmarBtn && showConfirm) confirmarBtn.addEventListener("click", onConfirm);
  if (fecharBtn) fecharBtn.addEventListener("click", onCancel);
}

// ====================== FUNÇÕES DE PEDIDO ======================
function togglePronto(indexPedido, indexProduto) {
  const pedido = pedidos[indexPedido];
  if (!pedido) return;
  
  if (pedido.status === "Pronto" || pedido.status === "Entregue") return; 
  
  if (pedido.status === "Aguardando") {
      showCustomModal("Atenção", "O pedido deve estar 'Em preparo' para marcar os itens.", false, () => {});
      return;
  }
  
  pedido.produtos[indexProduto].pronto = !pedido.produtos[indexProduto].pronto;

  const card = document.querySelector(`.card-pedido[data-index='${indexPedido}']`);
  if (!card) return;
  const item = card.querySelectorAll(".item-pedido")[indexProduto];
  if (item) item.classList.toggle("pronto");
}

function atualizarContagemBotoes() {
  const contagens = { "Aguardando": 0, "Em preparo": 0, "Pronto": 0, "Entregue": 0 };
  pedidos.forEach(p => {
    if (contagens[p.status] === undefined) contagens[p.status] = 0;
    contagens[p.status]++;
  });

  const aguardandoEl = document.querySelector(".status-btn.aguardando");
  const preparoEl = document.querySelector(".status-btn.preparo");
  const finalizadosEl = document.querySelector(".status-btn.finalizados");
  const entreguesEl = document.querySelector(".status-btn.entregues");
  const todosEl = document.querySelector(".status-btn.todos");

  if (aguardandoEl) aguardandoEl.textContent = `Aguardando (${contagens["Aguardando"] || 0})`;
  if (preparoEl) preparoEl.textContent = `Em preparo (${contagens["Em preparo"] || 0})`;
  if (finalizadosEl) finalizadosEl.textContent = `Prontos (${contagens["Pronto"] || 0})`;
  if (entreguesEl) entreguesEl.textContent = `Entregues (${contagens["Entregue"] || 0})`;
  if (todosEl) todosEl.textContent = `Todos (${pedidos.length})`;
}

// ====================== RENDER PEDIDOS ======================
function renderPedidos() {
  const container = document.getElementById("pedidos-container");
  if (!container) {
    console.error("❌ Container pedidos-container não encontrado!");
    return;
  }

  const statusFiltro = document.querySelector(".status-btn.active")?.dataset.status || "Todos";

  console.log("🎯 renderPedidos chamado - statusFiltro:", statusFiltro);
  console.log("📊 pedidos no array:", pedidos.length);
  console.log("📋 pedidos statuses:", pedidos.map(p => ({id: p.id_pedido, status: p.status})));

  let pedidosFiltrados = pedidos.filter(p => {
    const statusOk = statusFiltro === "Todos" ? true : p.status === statusFiltro;
    const mesaOk = mesaFiltro === null ? true : p.mesa === mesaFiltro;
    const prioridadeOk = prioridadeFiltro === null ? true : p.prioridade === prioridadeFiltro;
    return statusOk && mesaOk && prioridadeOk;
  });

  console.log("🔍 pedidosFiltrados:", pedidosFiltrados.length);

  if (statusFiltro === "Todos") {
    pedidosFiltrados.sort((a, b) => {
        const ordemStatus = { "Aguardando": 0, "Em preparo": 1, "Pronto": 2, "Entregue": 3 };
        const diffStatus = (ordemStatus[a.status] || 99) - (ordemStatus[b.status] || 99);
        if (diffStatus !== 0) return diffStatus;
        if (a.prioridade === "Urgente" && b.prioridade === "Normal") return -1;
        if (a.prioridade === "Normal" && b.prioridade === "Urgente") return 1;
        return 0;
    });
  }

  // Remover cards que não estão no filtro atual
  const indicesVisiveisEsperados = pedidosFiltrados.map(p => pedidos.indexOf(p));
  document.querySelectorAll(".card-pedido").forEach(card => {
    const index = parseInt(card.dataset.index);
    if (!indicesVisiveisEsperados.includes(index)) {
      card.remove();
    }
  });

  if (pedidosFiltrados.length === 0) {
    console.log("📭 Nenhum pedido filtrado - mostrando mensagem");
    container.innerHTML = `<div class="sem-pedidos">Nenhum pedido no momento</div>`;
    atualizarContagemBotoes();
    return;
  }

  console.log("🛠️ Criando", pedidosFiltrados.length, "cards...");
  // Limpar completamente o container e recriar todos os cards
  container.innerHTML = '';

  // Para cada pedido filtrado, criar novo card
  pedidosFiltrados.forEach((pedido, index) => {
    console.log(`📄 Criando card ${index + 1}/${pedidosFiltrados.length} - Mesa ${pedido.mesa}`);
    const indexOriginal = pedidos.indexOf(pedido);

    // Criar novo card
    const card = document.createElement("div");

    card.classList.add("card-pedido",
      pedido.status === "Aguardando" ? "aguardando" :
      pedido.status === "Em preparo" ? "preparo" : "finalizados"
    );

    if (pedido.prioridade === "Urgente") card.classList.add("urgente");

    card.dataset.index = indexOriginal;

    const tempoMin = Math.floor(pedido.tempoSegundos / 60);
    const tempoSec = pedido.tempoSegundos % 60;

    const tempoDisplay = (pedido.status === "Pronto" || pedido.status === "Entregue" || pedido.status === "cancelado") ? 'style="display: none;"' : '';

    const produtosHTML = pedido.produtos.map(prod => {
      const classe = `item-pedido ${prod.pronto ? "pronto" : ""} ${prod.bebida ? "bebida" : ""}`;
      const observacaoHTML = prod.observacao ? 
          `<div class="itens"><p class="nota-cliente">${prod.observacao}</p></div>` : 
          '';

      return `
        <div class="${classe}" onclick="togglePronto(${indexOriginal}, ${pedido.produtos.indexOf(prod)})">
          <strong>${prod.nome}</strong>
          ${observacaoHTML}
        </div>
      `;
    }).join("");

    // Adicionar observações do pedido (se existirem)
    const observacoesHTML = pedido.observacoes ? 
        `<div class="card-observacoes"><strong>📝 Observações:</strong> ${pedido.observacoes}</div>` : 
        '';

    card.innerHTML = `
      <div class="card-header">
        <span>Mesa ${pedido.mesa} - ${pedido.cliente}</span>
        <span class="tempo" ${tempoDisplay}>${tempoMin.toString().padStart(2,"0")}:${tempoSec.toString().padStart(2,"0")}</span>
      </div>
      
      <div class="card-content">
        ${produtosHTML}
        ${observacoesHTML}
      </div>
      
      <div class="actions-wrapper">
      </div>
    `;

    container.appendChild(card);

    // Criar botões através do DOM para evitar problemas com onclick inline
    const actionsWrapper = card.querySelector('.actions-wrapper');
    if (actionsWrapper) {
      const botoes = gerarBotoes(pedido, indexOriginal);
      if (botoes) actionsWrapper.appendChild(botoes);
    }
  });

  console.log("✅ Cards criados com sucesso!");
  atualizarContagemBotoes();
}

// ====================== BOTÕES ======================
function gerarBotoes(pedido, i) {
  const wrapper = document.createElement('div');
  wrapper.className = 'actions';

  if (pedido.status === "Aguardando") {
    const btnCancelar = document.createElement('button');
    btnCancelar.className = 'btn cancelar';
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.addEventListener('click', () => cancelar(i));

    const btnPreparar = document.createElement('button');
    btnPreparar.className = 'btn preparar';
    btnPreparar.textContent = 'Preparar';
    btnPreparar.addEventListener('click', () => preparar(i));

    wrapper.appendChild(btnCancelar);
    wrapper.appendChild(btnPreparar);
    return wrapper;
  } else if (pedido.status === "Em preparo") {
    const btnVoltar = document.createElement('button');
    btnVoltar.className = 'btn voltar';
    btnVoltar.textContent = 'Voltar';
    btnVoltar.addEventListener('click', () => voltarEtapa(i));

    const btnFinalizar = document.createElement('button');
    btnFinalizar.className = 'btn finalizar';
    btnFinalizar.textContent = 'Finalizar';
    btnFinalizar.addEventListener('click', () => finalizar(i));

    wrapper.appendChild(btnVoltar);
    wrapper.appendChild(btnFinalizar);
    return wrapper;
  } else if (pedido.status === "Pronto") {
    const btnVoltar = document.createElement('button');
    btnVoltar.className = 'btn voltar';
    btnVoltar.textContent = 'Voltar';
    btnVoltar.addEventListener('click', () => voltarEtapa(i));

    const btnEntregar = document.createElement('button');
    btnEntregar.className = 'btn entregar';
    btnEntregar.textContent = 'Entregar';
    btnEntregar.addEventListener('click', () => entregar(i));

    wrapper.appendChild(btnVoltar);
    wrapper.appendChild(btnEntregar);
    return wrapper;
  } else if (pedido.status === "Entregue") {
    const span = document.createElement('span');
    span.className = 'status-entregue';
    span.textContent = '✓ Pedido Entregue';
    wrapper.appendChild(span);
    return wrapper;
  }
  return null;
}

function preparar(i) {
  if (!pedidos[i]) return;
  const pedido = pedidos[i];
  const id_pedido = pedido.id_pedido;
  
  console.log(`📦 Marcando pedido ${id_pedido} como "Em preparo"...`);
  
  fetch(`/api/pedido/${id_pedido}/finalizar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'em preparo' })
  })
  .then(res => res.json())
  .then(() => {
    console.log("✅ Pedido atualizado");
    carregarPedidosDoBanco(); // Recarregar os dados
  })
  .catch(err => {
    console.error("❌ Erro ao atualizar:", err);
    showCustomModal("Erro", "Não foi possível atualizar o pedido.", false, () => {});
  });
}

function cancelar(i) {
  if (!pedidos[i]) return;
  const pedido = pedidos[i];
  const id_pedido = pedido.id_pedido;
  
  showCustomModal("Confirmação", "Você tem certeza que deseja cancelar este pedido?", true, (confirmed) => {
    if (confirmed) {
      console.log(`🗑️ Cancelando pedido ${id_pedido}...`);
      
      fetch(`/api/pedido/${id_pedido}/cancelar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelado' })
      })
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text().catch(() => 'Resposta de erro não pôde ser lida');
            throw new Error(text || res.statusText || 'Erro desconhecido');
          }
          // tenta parsear JSON quando houver
          try {
            return await res.json();
          } catch (e) {
            return null;
          }
        })
        .then(() => {
          console.log("✅ Pedido cancelado (status 'cancelado')");
          carregarPedidosDoBanco(); // Recarregar os dados
        })
        .catch(err => {
          console.error("❌ Erro ao cancelar:", err);
          showCustomModal("Erro", "Não foi possível cancelar o pedido. " + err.message, false, () => {});
        });
    }
  });
}

function voltarEtapa(i) {
  if (!pedidos[i]) return;
  const pedido = pedidos[i];
  const id_pedido = pedido.id_pedido;
  
  // Voltar ao status anterior baseado no status atual
  let novoStatus = 'pendente'; // default
  if (pedido.statusBD === 'pronto') {
    novoStatus = 'em preparo';
  } else if (pedido.statusBD === 'em preparo') {
    novoStatus = 'pendente';
  }
  
  console.log(`↩️ Voltando pedido ${id_pedido} de ${pedido.statusBD} para ${novoStatus}...`);
  
  fetch(`/api/pedido/${id_pedido}/finalizar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: novoStatus })
  })
  .then(res => res.json())
  .then(() => {
    console.log("✅ Pedido atualizado");
    carregarPedidosDoBanco(); // Recarregar os dados
  })
  .catch(err => {
    console.error("❌ Erro ao atualizar:", err);
    showCustomModal("Erro", "Não foi possível atualizar o pedido.", false, () => {});
  });
}

function finalizar(i) {
  if (!pedidos[i]) return;
  const pedido = pedidos[i];
  const todosProntos = pedido.produtos.every(prod => prod.pronto);
  
  if (todosProntos) {
    const id_pedido = pedido.id_pedido;
    console.log(`✅ Finalizando pedido ${id_pedido}...`);
    
    fetch(`/api/pedido/${id_pedido}/finalizar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'pronto' })
    })
    .then(res => res.json())
    .then(() => {
      console.log("✅ Pedido finalizado");
      carregarPedidosDoBanco(); // Recarregar os dados
    })
    .catch(err => {
      console.error("❌ Erro ao finalizar:", err);
      showCustomModal("Erro", "Não foi possível finalizar o pedido.", false, () => {});
    });
  } else {
    showCustomModal("Atenção", "Para finalizar, todos os itens do pedido devem ser marcados como prontos.", false, () => {});
  }
}

function entregar(i) {
  if (!pedidos[i]) return;
  const pedido = pedidos[i];
  const id_pedido = pedido.id_pedido;
  
  console.log(`🚚 Entregando pedido ${id_pedido}...`);
  
  fetch(`/api/pedido/${id_pedido}/finalizar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'entregue' })
  })
  .then(res => res.json())
  .then(() => {
    console.log("✅ Pedido entregue");
    carregarPedidosDoBanco(); // Recarregar os dados
  })
  .catch(err => {
    console.error("❌ Erro ao entregar:", err);
    showCustomModal("Erro", "Não foi possível entregar o pedido.", false, () => {});
  });
}

// ====================== TIMER ======================
// Função para calcular tempo decorrido baseado na timestamp unix do banco
function calcularTempoDecorrido(timestampPedido) {
    // Validação robusta do timestamp
    if (!timestampPedido || timestampPedido === 0 || isNaN(timestampPedido)) return 0;
    
    // timestampPedido é um número (unix timestamp em ms)
    const agora = Date.now();
    const tempoMilis = agora - timestampPedido;
    const tempoSegundos = Math.floor(tempoMilis / 1000);
    
    // Não deixar negativo
    return Math.max(0, tempoSegundos);
}

setInterval(() => {
  pedidos.forEach((p, index) => {
    // Validar que data_pedido existe e é válida antes de calcular
    if (!p.data_pedido || isNaN(p.data_pedido)) {
        console.warn(`⚠️ Pedido ${index} tem data_pedido inválida:`, p.data_pedido);
        return; // Pular este pedido
    }

    // Calcula tempo decorrido desde a criação do pedido
    const tempoSegundos = calcularTempoDecorrido(p.data_pedido);
    p.tempoSegundos = tempoSegundos;

    let novaPrioridade = "Normal";

    if (p.status === "Aguardando" && p.tempoSegundos >= AGUARDANDO_URG_SECONDS) {
        novaPrioridade = "Urgente";
    } else if (p.status === "Em preparo" && p.tempoSegundos >= PREPARO_URG_SECONDS) {
        novaPrioridade = "Urgente";
    }

    if (novaPrioridade !== p.prioridade) {
        p.prioridade = novaPrioridade;
        
        // ====================================================================
        // CORREÇÃO 2: ATUALIZAÇÃO DA PRIORIDADE E RENDERIZAÇÃO CONDICIONAL
        // Evita pisca-pisca ao só chamar renderPedidos() se houver um filtro ativo.
        // ====================================================================
        const card = document.querySelector(`.card-pedido[data-index='${index}']`);
        if (card) {
            // Atualiza o estado visual do card (classe 'urgente')
            if (novaPrioridade === "Urgente") {
                card.classList.add("urgente");
            } else {
                card.classList.remove("urgente");
            }
        }
        
        const statusFiltro = document.querySelector(".status-btn.active")?.dataset.status;

        // Chama renderPedidos se a prioridade mudar E houver filtro ativo (prioridade ou Todos)
        if (prioridadeFiltro !== null || statusFiltro === "Todos") {
             renderPedidos();
        }
        // ====================================================================
    }

    // Atualizar apenas o tempo no DOM sem re-renderizar tudo
    const card = document.querySelector(`.card-pedido[data-index='${index}']`);
    if (card) {
      const tempoSpan = card.querySelector(".tempo");
      if (tempoSpan && p.status !== "Pronto" && p.status !== "Entregue" && p.status !== "cancelado") {
        const minutos = Math.floor(p.tempoSegundos / 60).toString().padStart(2, "0");
        const segundos = (p.tempoSegundos % 60).toString().padStart(2, "0");
        // Validar antes de atualizar o texto
        if (!isNaN(minutos) && !isNaN(segundos)) {
          tempoSpan.textContent = `${minutos}:${segundos}`;
        }
      } else if (tempoSpan && (p.status === "Pronto" || p.status === "Entregue" || p.status === "cancelado")) {
        // Esconder o timer para pedidos prontos, entregues ou cancelados
        tempoSpan.style.display = "none";
      }
    }
  });
}, 1000);

// ====================== MENU LATERAL ======================
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("overlay");
const menuClose = document.getElementById("menu-close");

if (menuClose) {
  menuClose.addEventListener("click", () => toggleMenu(false));
}
if(overlay) {
    overlay.addEventListener("click", () => toggleMenu(false));
}

function toggleMenu(open) {
  if (open) {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    menuToggle.classList.add("active");
  } else {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    menuToggle.classList.remove("active");
  }
}

if(menuToggle) {
    menuToggle.addEventListener("click", () => {
    // Em mobile, alterna visibilidade do header
    const headerWrapper = document.querySelector(".header-wrapper");
    const isMobile = window.innerWidth <= 480;
    
    if (isMobile) {
      headerWrapper.classList.toggle("mobile-open");
    } else {
      toggleMenu(!sidebar.classList.contains("active"));
    }
    });
}
if(menuClose) menuClose.addEventListener("click", () => toggleMenu(false));


// ====================== FILTROS ======================
// Movido para dentro do DOMContentLoaded

// ====================== DROPDOWNS E SELEÇÃO ======================
document.addEventListener("DOMContentLoaded", () => {
  // Carregar pedidos após o DOM carregar
  carregarPedidosDoBanco();
  setInterval(carregarPedidosDoBanco, 3000);

  // Filtros de status
  document.querySelectorAll(".status-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".status-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderPedidos();
    });
  });

  const dropdownMesasContent = document.getElementById("dropdown-mesas-content");
  const btnMesas = document.getElementById("dropdown-mesas");
  const dropdownPrioridadeContent = document.getElementById("dropdown-prioridade-content");
  const btnPrioridade = document.getElementById("dropdown-prioridade");

  // === INICIALIZAÇÃO MESAS ===
  if (dropdownMesasContent && btnMesas) {
    dropdownMesasContent.innerHTML = "";
    
    const todas = document.createElement("button");
    todas.textContent = "Todas";
    todas.dataset.mesa = "todas";
    todas.classList.add("selected"); 
    dropdownMesasContent.appendChild(todas);

    for (let m = 1; m <= 10; m++) {
      const b = document.createElement("button");
      b.textContent = `Mesa ${m}`;
      b.dataset.mesa = m;
      dropdownMesasContent.appendChild(b);
    }

    dropdownMesasContent.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;

      dropdownMesasContent.querySelectorAll("button").forEach(btn => btn.classList.remove("selected"));
      b.classList.add("selected");

      if (b.dataset.mesa === "todas") {
        mesaFiltro = null;
        btnMesas.textContent = "Mesas";
      } else {
        mesaFiltro = Number(b.dataset.mesa);
        btnMesas.textContent = b.textContent;
      }

      dropdownMesasContent.style.display = "none";
      btnMesas.classList.remove("active-dropdown");
      renderPedidos();
    });
  }

  // === INICIALIZAÇÃO PRIORIDADES ===
  if (dropdownPrioridadeContent && btnPrioridade) {
    dropdownPrioridadeContent.innerHTML = "";
    
    const pt = document.createElement("button");
    pt.textContent = "Todos";
    pt.dataset.prioridade = "todas";
    pt.classList.add("selected");
    dropdownPrioridadeContent.appendChild(pt);

    ["Urgente", "Normal"].forEach(pr => {
      const b = document.createElement("button");
      b.textContent = pr;
      b.dataset.prioridade = pr;
      dropdownPrioridadeContent.appendChild(b);
    });

    dropdownPrioridadeContent.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;

      dropdownPrioridadeContent.querySelectorAll("button").forEach(btn => btn.classList.remove("selected"));
      b.classList.add("selected");

      if (b.dataset.prioridade === "todas") {
        prioridadeFiltro = null;
        btnPrioridade.textContent = "Prioridades";
      } else {
        prioridadeFiltro = b.dataset.prioridade;
        btnPrioridade.textContent = b.dataset.prioridade;
      }

      dropdownPrioridadeContent.style.display = "none";
      btnPrioridade.classList.remove("active-dropdown");
      renderPedidos();
    });
  }

  // === LÓGICA DE ABRIR/FECHAR DROPDOWNS ===
  document.querySelectorAll(".dropdown-wrapper").forEach(wrapper => {
    const btn = wrapper.querySelector(".dropdown-btn");
    const content = wrapper.querySelector(".dropdown-content");
    if (!btn || !content) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".dropdown-content").forEach(c => {
        if (c !== content) c.style.display = "none";
      });
      document.querySelectorAll(".dropdown-btn").forEach(b => b.classList.remove("active-dropdown"));

      const aberto = content.style.display === "flex";
      if (!aberto) {
        content.style.display = "flex";
        btn.classList.add("active-dropdown");
      } else {
        content.style.display = "none";
      }
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-content").forEach(c => c.style.display = "none");
    document.querySelectorAll(".dropdown-btn").forEach(b => b.classList.remove("active-dropdown"));
  });
});

// ====================== NAVEGAÇÃO E CONFIGURAÇÕES ======================

const btnMenuPedidos = document.querySelector(".menu-btn.pedidos");
const btnMenuConfig = document.querySelector(".menu-btn.config");
const btnMenuSair = document.querySelector(".menu-btn.sair"); 
const configSection = document.getElementById("configuracoes");
const contentWrapper = document.querySelector(".content");
const headerWrapper = document.querySelector(".header-wrapper");

function setActiveMenuButton(activeButton) {
    const allMenuBtns = [btnMenuPedidos, btnMenuConfig, btnMenuSair];
    allMenuBtns.forEach(btn => {
        if (btn) btn.classList.remove("active-menu-btn");
    });
    if (activeButton) {
        activeButton.classList.add("active-menu-btn");
    }
}

function updateConfigDisplay(status) {
    const statusEl = document.getElementById("status-banco");
    const updateEl = document.getElementById("last-update");
    const errorEl = document.getElementById("last-error");

    if (statusEl) {
        statusEl.classList.remove("online", "offline", "testando");
        statusEl.textContent = status;
        if (status === "Online") statusEl.classList.add("online");
        if (status === "Offline") statusEl.classList.add("offline");
        if (status === "Testando...") statusEl.classList.add("testando");
    }
    if (updateEl) updateEl.textContent = ultimaAtualizacaoDB;
    if (errorEl) errorEl.textContent = ultimoErroDB;
}

function setupConfigSection() {
    if (!configSection) return;
    if (configSection.dataset.inited) {
        updateConfigDisplay(document.getElementById("status-banco")?.textContent || "Desconhecido");
        return;
    }

    configSection.innerHTML = '';

    const title = document.createElement("h2");
    title.textContent = "Configurações do Sistema";
    title.className = "config-title";
    configSection.appendChild(title);

    const cardsWrapper = document.createElement("div");
    cardsWrapper.className = "config-cards-wrapper";
    configSection.appendChild(cardsWrapper);

    const statusCard = document.createElement("div");
    statusCard.className = "config-card";

    const subTitle = document.createElement("h2");
    subTitle.textContent = "Status de Conexão com o Banco de Dados";
    statusCard.appendChild(subTitle);

    // ============================================
    // CORREÇÃO: DIVIDIR EM DOIS WRAPPERS
    // ============================================

    // 1. WRAPPER SUPERIOR (Status)
    const statusWrapperTop = document.createElement("div");
    statusWrapperTop.className = "config-status-wrapper";
    
    const statusP = document.createElement("p");
    statusP.innerHTML = 'Status da conexão: <strong id="status-banco">Desconhecido</strong>';
    statusWrapperTop.appendChild(statusP);
    
    statusCard.appendChild(statusWrapperTop);

    // 2. LISTA DE DETALHES (Meio)
    const details = document.createElement("ul");
    details.className = "details-list";
    details.innerHTML = `
        <li>Host: <strong>localhost</strong></li>
        <li>Porta: <strong>3306</strong></li>
        <li>Usuário: <strong>root</strong></li>
        <li>Banco: <strong>chefmaster_db</strong></li>
    `;
    statusCard.appendChild(details);

    // 3. WRAPPER INFERIOR (Update e Erro)
    const statusWrapperBottom = document.createElement("div");
    statusWrapperBottom.className = "config-status-wrapper";

    const updateP = document.createElement("p");
    updateP.innerHTML = 'Última Atualização: <strong id="last-update">N/A</strong>';

    const errorP = document.createElement("p");
    errorP.innerHTML = 'Último Erro: <strong id="last-error">Nenhum erro registrado.</strong>';

    statusWrapperBottom.appendChild(updateP);
    statusWrapperBottom.appendChild(errorP);
    
    statusCard.appendChild(statusWrapperBottom);

    // 4. BOTÃO (Fundo)
    const btnTest = document.createElement("button");
    btnTest.textContent = "Testar Conexão";
    btnTest.className = "btn testar";
    statusCard.appendChild(btnTest);

    cardsWrapper.appendChild(statusCard);

    btnTest.addEventListener("click", () => {
        ultimaAtualizacaoDB = "Testando..."; 
        updateConfigDisplay("Testando...");

        setTimeout(() => {
            const conectado = Math.random() > 0.25; 
            const agora = new Date().toLocaleString();
            ultimaAtualizacaoDB = agora;
            if (conectado) {
                ultimoErroDB = "Nenhum erro registrado.";
                updateConfigDisplay("Online");
            } else {
                ultimoErroDB = `[${agora}] Timeout de conexão. Servidor não respondeu.`;
                updateConfigDisplay("Offline");
            }
        }, 700);
    });

    updateConfigDisplay("Desconhecido"); 
    configSection.dataset.inited = "1";
}

if (btnMenuPedidos) {
  btnMenuPedidos.addEventListener("click", () => {
    setActiveMenuButton(btnMenuPedidos);
    if (contentWrapper) contentWrapper.style.display = "block";
    if (configSection) configSection.style.display = "none";
    if (headerWrapper) headerWrapper.style.display = "flex"; 
    toggleMenu(false);
    renderPedidos();
  });
}

if (btnMenuConfig) {
  btnMenuConfig.addEventListener("click", () => {
    setActiveMenuButton(btnMenuConfig);
    if (contentWrapper) contentWrapper.style.display = "none";
    if (configSection) configSection.style.display = "flex"; 
    if (headerWrapper) headerWrapper.style.display = "none";
    setupConfigSection();
    toggleMenu(false);
  });
}

if (btnMenuSair) {
  btnMenuSair.addEventListener("click", () => {
    setActiveMenuButton(btnMenuSair);
    toggleMenu(false);
    showCustomModal("Sair", "Encerrando sessão...", false, () => {
        console.log("Sessão encerrada.");
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
    if (configSection) configSection.style.display = "none";
    if (contentWrapper) contentWrapper.style.display = "block";
    if (headerWrapper) headerWrapper.style.display = "flex";
    
    setActiveMenuButton(btnMenuPedidos); 
});

renderPedidos();
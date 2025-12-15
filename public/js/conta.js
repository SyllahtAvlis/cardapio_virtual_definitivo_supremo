// public/js/conta.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('accountForm');
    const errorMsg = document.getElementById('error');

    // Função para mostrar mensagens de erro
    function showError(msg) {
        if (errorMsg) {
            errorMsg.textContent = msg;
            errorMsg.classList.add('show');
            setTimeout(() => errorMsg.classList.remove('show'), 3000);
        }
    }

    // Recupera os dados do usuário logado
    const loggedInUser = localStorage.getItem('usuario');
    if (!loggedInUser) {
        // Se não estiver logado, redireciona para login
        window.location.href = '/html/login.html';
        return;
    }

    const userInfo = JSON.parse(loggedInUser);

    // Preenche os campos com os dados do usuário
    document.getElementById('username').value = userInfo.nome;
    document.getElementById('email').value = userInfo.email;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const senhaAtual = document.getElementById('senhaAtual').value.trim();
        const novaSenha = document.getElementById('novaSenha').value.trim();
        const confirmarNovaSenha = document.getElementById('confirmarNovaSenha').value.trim();

        // Verifica campos obrigatórios
        // ATENÇÃO: Se o campo senhaAtual não for obrigatório para ATUALIZAR DADOS, remova-o daqui.
        // No momento, seu backend exige que senhaAtual seja enviada SE novaSenha for enviada.
        if (!nome || !email) {
            return showError('Nome e e-mail são obrigatórios!');
        }

        // Verifica se nova senha e confirmação coincidem
        if (novaSenha && novaSenha !== confirmarNovaSenha) {
            return showError('As senhas não coincidem!');
        }
        
        // Verifica se o usuário quer mudar a senha, mas não forneceu a senha atual
        if (novaSenha && !senhaAtual) {
             return showError('A senha atual é obrigatória para definir uma nova senha!');
        }

        try {
            // CORREÇÃO 1: A URL foi simplificada para /api/usuario/:id
            // CORREÇÃO 2: O ID do usuário agora é userInfo.id (propriedade corrigida no DB/Backend)
            const response = await fetch(`http://localhost:3000/api/usuario/${userInfo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome,
                    email,
                    senhaAtual,
                    novaSenha
                })
            });

            const data = await response.json();

            if (!response.ok) return showError(data.message);

            // Atualiza os dados no localStorage
            // Mantém o ID e o TIPO do usuário, atualizando nome e email
            localStorage.setItem('usuario', JSON.stringify({ ...userInfo, nome, email }));

            alert('Informações atualizadas com sucesso!');
            window.location.href = '/html/index.html';
        } catch (err) {
            console.error(err);
            showError('Erro ao conectar com o servidor.');
        }
    });

    // ======================================================
    // EXCLUSÃO DE CONTA
    // ======================================================
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const deleteModal = document.getElementById('deleteModal');
    const closeModal = document.getElementById('closeModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');
    const deletePassword = document.getElementById('deletePassword');

    // Abre o modal de exclusão
    deleteAccountBtn.addEventListener('click', () => {
        deleteModal.classList.remove('hidden');
        deletePassword.value = '';
        deletePassword.focus();
    });

    // Fecha o modal
    function closeDeleteModal() {
        deleteModal.classList.add('hidden');
        deletePassword.value = '';
    }

    closeModal.addEventListener('click', closeDeleteModal);
    cancelDelete.addEventListener('click', closeDeleteModal);
    modalOverlay.addEventListener('click', closeDeleteModal);

    // Confirma exclusão de conta
    confirmDelete.addEventListener('click', async () => {
        const password = deletePassword.value.trim();

        if (!password) {
            alert('Por favor, digite sua senha para confirmar a exclusão!');
            return;
        }

        try {
            // Envia requisição DELETE com a senha para confirmação
            const response = await fetch(`http://localhost:3000/api/usuario/${userInfo.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senha: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Erro ao deletar conta. Verifique sua senha.');
                return;
            }

            // Remove dados do localStorage
            localStorage.removeItem('usuario');

            // Exibe mensagem de sucesso
            alert('Sua conta foi excluída permanentemente. Você será redirecionado.');

            // Redireciona para a página inicial
            window.location.href = '/html/index.html';
        } catch (err) {
            console.error(err);
            alert('Erro ao conectar com o servidor.');
        }
    });

    // Fechar modal ao pressionar ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !deleteModal.classList.contains('hidden')) {
            closeDeleteModal();
        }
    });
});
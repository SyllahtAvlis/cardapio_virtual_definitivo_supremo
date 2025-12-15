# 🍕 Cardápio Virtual - ChefMaster

## 📋 Descrição
Sistema completo de cardápio digital para restaurantes e lanchonetes. Permite que clientes façam pedidos online e administradores gerenciem produtos e pedidos em tempo real através de painéis dedicados.

## ✨ Funcionalidades

### 👤 Para Clientes
- ✅ Visualização completa do cardápio
- ✅ Cadastro e login de usuários
- ✅ Sistema de carrinho de compras
- ✅ Realização de pedidos com observações
- ✅ Histórico de pedidos na conta pessoal

### 👨‍🍳 Para Administradores/Cozinheiros
- ✅ **Painel Administrativo**: Cadastro, edição e exclusão de produtos
- ✅ **Painel da Cozinha**: Acompanhamento em tempo real dos pedidos
- ✅ **Gestão de Pedidos**: Marcar como "Em preparo", "Pronto" e "Entregue"
- ✅ **Sistema de Cancelamento**: Cancelar pedidos quando necessário
- ✅ **Filtros Avançados**: Por status, mesa e prioridade

## 🛠️ Tecnologias Utilizadas
- **Backend**: Node.js + Express.js
- **Banco de Dados**: MySQL 8.0+
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Autenticação**: Sistema de sessões com localStorage
- **APIs**: RESTful com JSON

## 📁 Estrutura do Projeto
```
cardapio_virtual/
├── app.js                 # Servidor principal
├── package.json           # Dependências Node.js
├── backend/               # Código do servidor
│   ├── config/db.js       # Conexão MySQL
│   ├── controllers/       # Lógica de negócio
│   ├── models/            # Queries SQL
│   └── routes/            # Rotas da API
├── public/                # Frontend
│   ├── html/              # Páginas
│   ├── css/               # Estilos
│   ├── js/                # Scripts
│   └── img/               # Imagens
└── sql/full_db_dump.sql   # Setup do banco
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 16+
- MySQL 8.0+
- npm ou yarn

### Passos de Instalação

1. **Clone o repositório e instale dependências:**
   ```bash
   git clone <url-do-repositorio>
   cd cardapio_virtual
   npm install
   ```

2. **Configure o banco MySQL:**
   - Crie um banco chamado `cardapio_virtual`
   - Execute o script SQL:
   ```bash
   mysql -u root -p cardapio_virtual < sql/full_db_dump.sql
   ```

3. **Configure as variáveis de ambiente:**
   - Crie um arquivo `.env` na raiz do projeto:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=sua_senha_mysql
   DB_NAME=cardapio_virtual
   DB_PORT=3306
   PORT=3000
   ```

4. **Inicie o servidor:**
   ```bash
   node app.js
   ```

5. **Acesse a aplicação:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api/*

## 🎯 Como Usar

### Primeiro Acesso
1. Acesse http://localhost:3000
2. Clique em "Cadastre-se" para criar uma conta de cliente
3. Para acessar áreas administrativas, use uma conta com tipo "administrador"

### Criando um Administrador
Execute no MySQL:
```sql
INSERT INTO usuario (nome, email, senha, tipo) VALUES
('Admin', 'admin@chefmaster.com', 'admin123', 'administrador');
```

### Funcionalidades Principais

#### 🛒 Fazendo um Pedido
1. Navegue pelo cardápio
2. Adicione itens ao carrinho
3. Vá para "Fazer Pedido"
4. Preencha observações e número da mesa
5. Confirme o pedido

#### 👨‍🍳 Gerenciando Pedidos (Cozinheiro)
1. Faça login como administrador
2. Acesse "Painel do Cozinheiro"
3. Visualize pedidos por status
4. Clique em "Preparar" → "Finalizar" → "Entregar"
5. Use "Cancelar" se necessário

#### 📦 Gerenciando Produtos (Admin)
1. Faça login como administrador
2. Acesse "Gerenciar Produtos"
3. Adicione, edite ou remova itens do cardápio

## 🔧 Scripts Disponíveis
```bash
npm start          # Inicia o servidor
npm run dev        # Desenvolvimento com nodemon (opcional)
```

## 📊 API Endpoints

### Usuários
- `POST /api/usuario` - Criar usuário
- `POST /api/usuario/login` - Login

### Produtos
- `GET /api/produto` - Listar produtos
- `POST /api/produto` - Criar produto (admin)
- `PUT /api/produto/:id` - Atualizar produto (admin)
- `DELETE /api/produto/:id` - Deletar produto (admin)

### Pedidos
- `GET /api/pedido` - Listar todos os pedidos (admin)
- `POST /api/pedido` - Criar pedido
- `PATCH /api/pedido/:id/finalizar` - Atualizar status
- `PATCH /api/pedido/:id/cancelar` - Cancelar pedido
- `DELETE /api/pedido/:id` - Deletar pedido

## 🐛 Solução de Problemas

### Erro de conexão com MySQL
- Verifique se o MySQL está rodando
- Confirme as credenciais no `.env`
- Certifique-se que o banco `cardapio_virtual` existe

### Botão cancelar não funciona
- Certifique-se que o dump SQL foi executado (inclui 'cancelado' no CHECK)
- Verifique se o servidor foi reiniciado após mudanças

### Acesso negado em áreas admin
- Use uma conta com `tipo = 'administrador'`
- O sistema verifica permissões automaticamente

## 📝 Notas de Desenvolvimento
- O projeto usa `localStorage` para sessões (não recomendado para produção)
- Logs são exibidos no console do servidor
- Estrutura preparada para adicionar autenticação JWT futuramente

## 🤝 Contribuição
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença
Este projeto é open source e está sob a licença MIT.
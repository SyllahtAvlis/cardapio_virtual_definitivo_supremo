CREATE DATABASE IF NOT EXISTS cardapio_virtual
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE cardapio_virtual;

-- =====================
-- Tabela usuario
-- =====================
DROP TABLE IF EXISTS itempedido;
DROP TABLE IF EXISTS pedido;
DROP TABLE IF EXISTS produto;
DROP TABLE IF EXISTS usuario;

CREATE TABLE usuario (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY email (email),
    CHECK (tipo IN ('cliente', 'atendente', 'administrador'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- Tabela produto
-- =====================
CREATE TABLE produto (
    id_produto INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    imagem VARCHAR(255),
    categoria VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_produto),
    CHECK (categoria IN ('carnes', 'frangos', 'peixe', 'massas', 'bebida', 'porcao'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- Tabela pedido
-- =====================
CREATE TABLE pedido (
    id_pedido INT NOT NULL AUTO_INCREMENT,
    id INT NOT NULL,
    observacoes TEXT,
    total DECIMAL(10,2) DEFAULT 0,
    data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pendente',
    numero_mesa INT,
    PRIMARY KEY (id_pedido),
    CONSTRAINT fk_pedido_usuario
        FOREIGN KEY (id)
        REFERENCES usuario(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CHECK (status IN ('pendente', 'em preparo', 'pronto', 'entregue', 'cancelado'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- Tabela itempedido
-- =====================
CREATE TABLE itempedido (
    id_item INT NOT NULL AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    data_adicao DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_item),
    KEY idx_itempedido_pedido (id_pedido),
    KEY idx_itempedido_produto (id_produto),
    CONSTRAINT fk_itempedido_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido(id_pedido)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_itempedido_produto
        FOREIGN KEY (id_produto)
        REFERENCES produto(id_produto)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

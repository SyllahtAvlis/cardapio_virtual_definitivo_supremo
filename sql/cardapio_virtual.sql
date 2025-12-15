CREATE DATABASE  IF NOT EXISTS `cardapio_virtual` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `cardapio_virtual`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: cardapio_virtual
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `itempedido`
--

DROP TABLE IF EXISTS `itempedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itempedido` (
  `id_item` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int DEFAULT NULL,
  `id_produto` int DEFAULT NULL,
  `quantidade` int NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `data_adicao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_item`),
  KEY `idx_itempedido_pedido` (`id_pedido`),
  KEY `idx_itempedido_produto` (`id_produto`),
  CONSTRAINT `itempedido_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`),
  CONSTRAINT `itempedido_ibfk_2` FOREIGN KEY (`id_produto`) REFERENCES `produto` (`id_produto`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itempedido`
--

LOCK TABLES `itempedido` WRITE;
/*!40000 ALTER TABLE `itempedido` DISABLE KEYS */;
INSERT INTO `itempedido` VALUES (27,7,4,1,25.90,'2025-12-08 18:44:45'),(28,8,4,1,25.90,'2025-12-08 18:57:16'),(29,9,4,1,25.90,'2025-12-08 19:36:06'),(30,10,4,1,25.90,'2025-12-10 22:23:43'),(31,11,6,1,10.00,'2025-12-11 23:11:41'),(32,11,4,1,25.90,'2025-12-11 23:11:44'),(33,11,7,1,6.50,'2025-12-11 23:11:47'),(34,12,4,1,25.90,'2025-12-11 23:14:37'),(35,12,4,1,25.90,'2025-12-11 23:14:40'),(36,13,4,1,25.90,'2025-12-13 18:58:06'),(37,13,6,1,10.00,'2025-12-13 18:58:09'),(39,14,4,1,25.90,'2025-12-13 23:30:20'),(40,14,6,1,10.00,'2025-12-13 23:30:23'),(41,14,7,1,6.50,'2025-12-13 23:30:28'),(42,15,4,1,25.90,'2025-12-13 23:51:13'),(43,15,6,1,10.00,'2025-12-13 23:51:15'),(44,15,7,1,6.50,'2025-12-13 23:51:18'),(45,16,6,1,10.00,'2025-12-14 01:31:01'),(46,16,4,1,25.90,'2025-12-14 21:19:12'),(47,16,6,1,10.00,'2025-12-14 21:19:15'),(48,16,10,1,30.00,'2025-12-14 21:19:19'),(49,16,11,1,30.00,'2025-12-14 21:19:21'),(50,16,7,1,6.50,'2025-12-14 21:19:24'),(51,16,12,1,7.00,'2025-12-14 21:19:27'),(52,16,4,1,25.90,'2025-12-14 22:05:00'),(53,16,6,1,10.00,'2025-12-14 22:05:02'),(54,16,12,1,7.00,'2025-12-14 22:05:05'),(55,17,6,1,10.00,'2025-12-14 22:24:59'),(56,17,4,1,25.90,'2025-12-14 22:25:02'),(57,18,11,1,30.00,'2025-12-14 23:19:43');
/*!40000 ALTER TABLE `itempedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido`
--

DROP TABLE IF EXISTS `pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido` (
  `id_pedido` int NOT NULL AUTO_INCREMENT,
  `id` int NOT NULL,
  `observacoes` text,
  `total` decimal(10,2) DEFAULT '0.00',
  `data_pedido` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) DEFAULT 'pendente',
  `numero_mesa` int DEFAULT NULL,
  PRIMARY KEY (`id_pedido`),
  KEY `fk_pedido_usuario` (`id`),
  KEY `idx_pedido_mesa` (`numero_mesa`),
  CONSTRAINT `fk_pedido_usuario` FOREIGN KEY (`id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_status` CHECK ((`status` in (_utf8mb4'pendente',_utf8mb4'em preparo',_utf8mb4'pronto',_utf8mb4'entregue',_utf8mb4'cancelado')))
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido`
--

LOCK TABLES `pedido` WRITE;
/*!40000 ALTER TABLE `pedido` DISABLE KEYS */;
INSERT INTO `pedido` VALUES (7,3,'Quero ele bem saboroso',25.90,'2025-12-08 18:44:45','entregue',10),(8,3,'Quero ele com pão tostado',25.90,'2025-12-08 18:57:16','entregue',6),(9,3,'',25.90,'2025-12-08 19:36:06','entregue',9),(10,4,'Quero queijo extra',25.90,'2025-12-10 22:23:43','entregue',6),(11,6,'Meu refrigerante sem gelo.',42.40,'2025-12-11 23:11:41','entregue',9),(12,6,'',51.80,'2025-12-11 23:14:37','entregue',4),(13,2,'Meu lanche sem mostarda.',41.90,'2025-12-13 18:58:06','entregue',10),(14,8,'Quero meu refrigerante sem gelo.',42.40,'2025-12-13 23:30:20','entregue',9),(15,3,'Quero tudo bom',42.40,'2025-12-13 23:51:13','entregue',4),(16,3,'Eu quero encomendar o assassinato do Hector Ruy.',162.30,'2025-12-14 01:31:01','entregue',4),(17,3,'',35.90,'2025-12-14 22:24:59','cancelado',4),(18,3,'',30.00,'2025-12-14 23:19:43','cancelado',NULL);
/*!40000 ALTER TABLE `pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produto`
--

DROP TABLE IF EXISTS `produto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produto` (
  `id_produto` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text,
  `preco` decimal(10,2) NOT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  `categoria` varchar(50) NOT NULL,
  PRIMARY KEY (`id_produto`),
  CONSTRAINT `produto_chk_1` CHECK ((`categoria` in (_utf8mb4'carnes',_utf8mb4'frangos',_utf8mb4'peixe',_utf8mb4'massas',_utf8mb4'bebida',_utf8mb4'porcao')))
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produto`
--

LOCK TABLES `produto` WRITE;
/*!40000 ALTER TABLE `produto` DISABLE KEYS */;
INSERT INTO `produto` VALUES (4,'Hambúrguer Clássico','Dois pães, carne e queijo cheddar',25.90,'https://paulinlanches.pedidoturbo.com.br/_core/_uploads/129/2023/01/1611240123gkig53i7i1.jpeg','carnes'),(6,'Batata frita','Porção grande de batatas fritas.',10.00,'https://beagaembalagem.com.br/wp-content/uploads/2021/06/batata-frita.jpeg','porcao'),(7,'Coca-Cola 500 ml','Coca-Cola de garrafa 500 ml.',6.50,'https://cdn.awsli.com.br/600x700/1330/1330028/produto/98133241/83788642fb.jpg','bebida'),(10,'Lasanha','Lasanha',30.00,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9nwl5521sA6T4xT-TpJefsLnHrlT_h-YIMw&s','massas'),(11,'Strogonoff','Strogonoff',30.00,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTst9MHkFlUxhwr07fcvH2FqWRzfzxk5-ZJDw&s','massas'),(12,'Pepsi','Pepsi 500 ml',7.00,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoOwNlZAB0mDX4a4SYpVbDmgpJDIsBKM8zkg&s','bebida'),(14,'Macarrão','Macarrão',20.00,'https://s2-receitas.glbimg.com/gkcFAmP_rvKZpIH1MdXzUr6wCMw=/1280x0/filters:format(jpeg)/https://i.s3.glbimg.com/v1/AUTH_1f540e0b94d8437dbbc39d567a1dee68/internal_photos/bs/2022/R/X/Lj3rwSQpm7BgzSEvJ1Mw/macarrao-simples-como-fazer.jpg','massas'),(15,'Frango','Frango',25.00,'https://bakeandcakegourmet.com.br/uploads/site/receitas/frango-assado-bebado-post-do-instagram-3-jznsbl3g.jpg','frangos'),(16,'Sushi holandês','Peixe',518.00,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZp94DyFtEghzCAGSE3wyiPImV9atn20A4BA&s','peixe');
/*!40000 ALTER TABLE `produto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(100) NOT NULL,
  `tipo` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `usuario_chk_1` CHECK ((`tipo` in (_utf8mb4'cliente',_utf8mb4'atendente',_utf8mb4'administrador')))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (2,'Thallys','syllahtavlis777@gmail.com','1234','cliente'),(3,'ThallysADM','thallys777@gmail.com','1234','administrador'),(4,'Hector','hectorruy@gmail.com','1234','cliente'),(5,'HectorADM','HectorADM@gmail.com','1234','administrador'),(6,'MiguelFusariADM','miguelfusariADM@gmail.com','0987','administrador'),(7,'Miguel','miguel@gmail.com','1234','cliente'),(8,'Breno','breno@gmail.com','1234','cliente');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-15  0:43:16

-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: shoes
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `variant_id` int DEFAULT NULL,
  `quantity` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `variant_id` (`variant_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (89,6,1,1),(90,6,40,1);
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `image` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,NULL,'Giày Sneaker','giay-sneaker','Giày thể thao năng động, thời trang',NULL,1,'2026-05-25 14:16:24'),(2,NULL,'Giày Cao Gót','giay-cao-got','Dành cho các buổi tiệc và công sở',NULL,1,'2026-05-25 14:16:24'),(3,NULL,'Giày Tây Nam','giay-tay-nam','Sang trọng, lịch lãm cho phái mạnh',NULL,1,'2026-05-25 14:16:24'),(4,NULL,'Dép & Sandals','dep-and-sandals','Thoải mái, tiện lợi đi hàng ngày',NULL,1,'2026-05-25 14:16:24'),(6,1,'Sneaker Chạy Bộ (Running)','sneaker-chay-bo-running','Giày sneaker tối ưu cho chạy bộ thể thao, đệm êm.',NULL,1,'2026-05-25 14:19:43'),(7,1,'Sneaker Bóng Rổ','sneaker-bong-ro','Giày cổ cao, bảo vệ cổ chân chuyên dụng bóng rổ.',NULL,1,'2026-05-25 14:19:43'),(8,1,'Sneaker Thời Trang (Casual)','sneaker-thoi-trang-casual','Các mẫu sneaker quốc dân đi học, đi chơi hàng ngày.',NULL,1,'2026-05-25 14:19:43'),(9,2,'Giày Cao Gót Mũi Nhọn','giay-cao-got-mui-nhon','Thiết kế thanh lịch, hack dáng cho quý cô công sở.',NULL,1,'2026-05-25 14:19:43'),(10,2,'Sandal Cao Gót','sandal-cao-got','Sandal cao gót quai mảnh thoáng chân, đi tiệc.',NULL,1,'2026-05-25 14:19:43'),(11,3,'Giày Oxford / Derby','giay-oxford-derby','Mẫu giày tây buộc dây cổ điển chuẩn quý ông.',NULL,1,'2026-05-25 14:19:43'),(12,3,'Giày Lười (Loafers)','giay-luoi-loafers','Giày tây xỏ chân tiện lợi, trẻ trung lịch lãm.',NULL,1,'2026-05-25 14:19:43'),(13,4,'Sandal Quai Ngang','sandal-quai-ngang','Sandal học sinh, sinh viên năng động bền bỉ.',NULL,1,'2026-05-25 14:19:43'),(15,NULL,'Giày Đá Banh','giay-da-banh','Mẫu giày đinh dăm TF, đinh cao FG chuyên dụng','{\"public_id\": \"shoes_categories/h7p12ybsjgnbn9ztag7q\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779719242/shoes_categories/h7p12ybsjgnbn9ztag7q.jpg\"}',1,'2026-05-25 14:27:23');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `store_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`store_id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,7,2,'2026-05-29 12:15:55','2026-06-21 09:11:31'),(2,19,2,'2026-06-09 14:12:35','2026-06-13 10:21:46'),(3,6,2,'2026-06-12 13:03:06','2026-06-21 08:29:05'),(4,7,6,'2026-06-19 11:55:49','2026-06-19 11:55:49');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (6,1),(7,1),(11,1),(6,3),(7,3),(7,7),(6,8),(7,8),(6,9),(7,9);
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `global_colors`
--

DROP TABLE IF EXISTS `global_colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `global_colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `color_name` varchar(50) NOT NULL,
  `color_code` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `color_name` (`color_name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `global_colors`
--

LOCK TABLES `global_colors` WRITE;
/*!40000 ALTER TABLE `global_colors` DISABLE KEYS */;
INSERT INTO `global_colors` VALUES (1,'Đen (Black)','#000000','2026-05-25 13:51:14'),(2,'Trắng (White)','#FFFFFF','2026-05-25 13:51:14'),(3,'Đỏ (Red)','#DC2626','2026-05-25 13:51:14'),(4,'Xanh Dương (Blue)','#2563EB','2026-05-25 13:51:14'),(5,'Xám (Grey)','#4B5563','2026-05-25 13:51:14'),(6,'Hồng (Pink)','#EC4899','2026-05-25 13:51:14'),(7,'Vàng (Yellow)','#EAB308','2026-05-25 13:51:14');
/*!40000 ALTER TABLE `global_colors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `global_sizes`
--

DROP TABLE IF EXISTS `global_sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `global_sizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `size_value` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `size_value` (`size_value`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `global_sizes`
--

LOCK TABLES `global_sizes` WRITE;
/*!40000 ALTER TABLE `global_sizes` DISABLE KEYS */;
INSERT INTO `global_sizes` VALUES (2,'36','2026-05-25 13:50:39'),(3,'37','2026-05-25 13:50:39'),(4,'38','2026-05-25 13:50:39'),(5,'39','2026-05-25 13:50:39'),(6,'40','2026-05-25 13:50:39'),(7,'41','2026-05-25 13:50:39'),(8,'42','2026-05-25 13:50:39'),(9,'43','2026-05-25 13:50:39'),(10,'44','2026-05-25 13:50:39'),(13,'35','2026-06-18 11:35:03');
/*!40000 ALTER TABLE `global_sizes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `content` text,
  `images` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,7,'Shop ơi giày này còn size 42 không?','[{\"public_id\": \"shoes_store_chats/w4n3ak3vduflccxj3r5h\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780056953/shoes_store_chats/w4n3ak3vduflccxj3r5h.jpg\"}]',1,'2026-05-29 12:15:55'),(2,1,7,'Chào shop','[]',1,'2026-06-08 17:01:22'),(3,1,7,'Chào shop nha','[]',1,'2026-06-09 09:24:00'),(4,1,7,'shop oi','[]',1,'2026-06-09 09:25:13'),(5,1,7,'shop còn onl không','[]',1,'2026-06-09 09:25:33'),(6,1,7,'chào shop nha','[]',1,'2026-06-09 09:28:08'),(7,1,7,'shop ơi','[]',1,'2026-06-09 09:53:13'),(8,1,7,'hello shop','[]',1,'2026-06-09 10:17:32'),(9,1,7,'Chào shop nha','[]',1,'2026-06-12 12:57:25'),(10,1,7,'chào shop','[]',1,'2026-06-12 12:58:21'),(11,3,6,'chào bạn','[]',0,'2026-06-12 13:03:06'),(12,3,6,'Chào bạn nha','[]',0,'2026-06-12 13:29:21'),(13,1,7,'Chào shop','[]',1,'2026-06-12 13:29:38'),(14,1,6,'Chào bạn nha','[]',1,'2026-06-12 13:51:45'),(15,1,7,'Chào shop nha','[]',1,'2026-06-12 13:52:15'),(16,1,6,'Chào bạn','[]',1,'2026-06-12 13:53:07'),(17,1,7,'Chào shop','[]',1,'2026-06-12 13:53:31'),(18,1,6,'Shop chào bạn nha','[]',1,'2026-06-12 14:06:51'),(19,1,6,'Chào bạn','[]',1,'2026-06-13 08:18:46'),(20,1,7,'Chào shop','[]',1,'2026-06-13 08:19:29'),(21,1,6,'Chào bạn','[]',1,'2026-06-13 08:23:02'),(22,1,7,'Chào shop','[]',1,'2026-06-13 08:23:17'),(23,1,6,'Chào bạn','[]',1,'2026-06-13 08:24:01'),(24,1,6,'Chào b','[]',1,'2026-06-13 08:26:08'),(25,1,6,'Chào bạn nha','[]',1,'2026-06-13 08:26:42'),(26,1,6,'Chào b','[]',1,'2026-06-13 08:27:40'),(27,1,6,'Chào bạn','[]',1,'2026-06-13 08:42:38'),(28,1,7,'Chào shop','[]',1,'2026-06-13 08:43:06'),(29,1,6,'Chào bạn','[]',1,'2026-06-13 08:43:36'),(30,1,7,'Chào shop nha','[]',1,'2026-06-13 08:43:44'),(31,1,7,'Chào bạn','[]',1,'2026-06-13 08:49:12'),(32,1,6,'Shop chào bạn nha','[]',1,'2026-06-13 08:49:22'),(33,1,6,'Chào bạn','[]',1,'2026-06-13 08:49:44'),(34,1,6,'Chào bnaj','[]',1,'2026-06-13 08:54:43'),(35,1,6,'Oke bạn','[]',1,'2026-06-13 08:56:12'),(36,1,7,'Chào shop','[]',1,'2026-06-13 09:23:43'),(37,1,7,'Shop ơi','[]',1,'2026-06-13 10:12:10'),(38,1,7,'Shop còn sản phẩm Giày sneaker đen không','[]',1,'2026-06-13 10:12:20'),(39,1,7,'Shop ơi','[]',1,'2026-06-13 10:12:48'),(40,1,7,'Hello shop','[]',1,'2026-06-13 10:12:54'),(41,1,7,'Shop có còn không','[]',1,'2026-06-13 10:13:06'),(42,2,19,'Chào shop nha','[]',1,'2026-06-13 10:14:00'),(43,2,19,'chào shop','[]',1,'2026-06-13 10:21:37'),(44,2,19,'Shop có sản phẩm nào kh','[]',1,'2026-06-13 10:21:46'),(45,1,7,'Chào shop','[]',1,'2026-06-13 10:22:14'),(46,1,6,'Shop chào bạn','[]',1,'2026-06-13 10:25:55'),(47,1,6,'Shop còn sản phẩm','[]',1,'2026-06-13 10:26:08'),(48,1,6,'helo bạn','[]',1,'2026-06-13 10:27:16'),(49,1,6,'Chào bạn','[]',1,'2026-06-21 08:28:39'),(50,3,6,'Chào shop nha','[]',0,'2026-06-21 08:29:05'),(51,1,7,'Chào shop','[]',1,'2026-06-21 08:29:59'),(52,1,6,'chào bạn','[]',1,'2026-06-21 08:30:14'),(53,1,7,'Chào hsop','[]',1,'2026-06-21 08:30:20'),(54,1,6,'Chào bạn','[]',1,'2026-06-21 08:30:28'),(55,1,7,'Chào shop','[]',1,'2026-06-21 08:30:36'),(56,1,6,'Chào bạn','[]',1,'2026-06-21 09:01:09'),(57,1,6,'Bạn có cần gì không','[]',1,'2026-06-21 09:01:14'),(58,1,7,'Bạn còn sản phẩm này không','[{\"public_id\": \"shoes_store_chats/kc0f0j2j2oxxoslxhboz\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1782033087/shoes_store_chats/kc0f0j2j2oxxoslxhboz.jpg\"}]',1,'2026-06-21 09:11:29'),(59,1,7,'Bạn còn sản phẩm này không','[{\"public_id\": \"shoes_store_chats/ebczcpyimnfr9mois5fh\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1782033089/shoes_store_chats/ebczcpyimnfr9mois5fh.jpg\"}]',1,'2026-06-21 09:11:31');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `reference_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=222 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (17,10,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa báo cáo vi phạm đối với 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','REVIEW_REPORTED',2,0,'2026-05-29 19:29:47'),(18,11,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa báo cáo vi phạm đối với 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','REVIEW_REPORTED',2,1,'2026-05-29 19:29:47'),(19,6,'Kết quả giải quyết khiếu nại','{\"message\":\"Đơn tố cáo bị bác bỏ. Đánh giá của khách hàng thien vẫn hiển thị bình thường.\",\"image\":\"\"}','REVIEW_RESOLVED_APPROVED',6,1,'2026-05-29 19:36:18'),(20,10,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa báo cáo vi phạm đối với 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','REVIEW_REPORTED',2,0,'2026-05-29 19:38:50'),(21,11,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa báo cáo vi phạm đối với 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','REVIEW_REPORTED',2,1,'2026-05-29 19:38:50'),(22,6,'Kết quả giải quyết khiếu nại','{\"message\":\"Đơn tố cáo bị bác bỏ. Đánh giá của khách hàng thien vẫn hiển thị bình thường.\",\"image\":\"\"}','REVIEW_RESOLVED_APPROVED',6,1,'2026-05-29 19:39:19'),(23,10,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa báo cáo vi phạm đối với 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','REVIEW_REPORTED',2,0,'2026-05-29 19:50:49'),(24,11,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa báo cáo vi phạm đối với 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','REVIEW_REPORTED',2,1,'2026-05-29 19:50:49'),(25,6,'Kết quả giải quyết khiếu nại','{\"message\":\"Đơn tố cáo thành công. Hệ thống đã ẩn đánh giá của khách hàng thien.\",\"image\":\"\"}','REVIEW_RESOLVED_BANNED',6,1,'2026-05-29 19:51:20'),(26,10,'Yêu cầu mở lại đánh giá bị ẩn','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa xin mở lại 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','REVIEW_REOPEN_REQUESTED',2,0,'2026-05-29 19:52:00'),(27,11,'Yêu cầu mở lại đánh giá bị ẩn','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa xin mở lại 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','REVIEW_REOPEN_REQUESTED',2,1,'2026-05-29 19:52:00'),(28,6,'Kết quả giải quyết khiếu nại','{\"message\":\"Yêu cầu thành công. Đánh giá của khách hàng thien đã được khôi phục.\",\"image\":\"\"}','REVIEW_RESOLVED_APPROVED',6,1,'2026-05-29 19:52:07'),(29,1,'Yêu cầu rút tiền mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa đặt lệnh rút 1.000.000 VNĐ.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','PAYOUT_REQUESTED',2,0,'2026-05-29 20:18:44'),(30,13,'Yêu cầu rút tiền mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa đặt lệnh rút 1.000.000 VNĐ.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','PAYOUT_REQUESTED',2,1,'2026-05-29 20:18:44'),(31,6,'Lệnh rút tiền thành công','{\"message\":\"Lệnh rút 1.000.000 VNĐ đã được xử lý hoàn tất.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','PAYOUT_APPROVED',2,1,'2026-05-29 20:19:28'),(32,1,'Yêu cầu cứu xét cửa hàng','{\"message\":\"Cửa hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa nộp đơn khiếu nại xin khôi phục hoạt động.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','APPEAL_REQUESTED',2,0,'2026-05-29 20:30:04'),(33,13,'Yêu cầu cứu xét cửa hàng','{\"message\":\"Cửa hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa nộp đơn khiếu nại xin khôi phục hoạt động.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','APPEAL_REQUESTED',2,1,'2026-05-29 20:30:04'),(34,6,'Khôi phục cửa hàng thành công','{\"message\":\"Chúc mừng! Cửa hàng của bạn đã được khôi phục trạng thái hoạt động.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','APPEAL_APPROVED',3,1,'2026-05-29 20:30:50'),(35,10,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: Giày Nike Air Jordan 1 High Travis Scott\",\"image\":\"\"}','PRODUCT_PENDING',20,0,'2026-06-07 13:27:00'),(36,11,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: Giày Nike Air Jordan 1 High Travis Scott\",\"image\":\"\"}','PRODUCT_PENDING',20,1,'2026-06-07 13:27:00'),(37,6,'Cập nhật trạng thái sản phẩm','{\"message\":\"Sản phẩm \\\"Giày Nike Air Jordan 1 High Travis Scott\\\" đã chuyển sang trạng thái: rejected\",\"image\":\"\"}','PRODUCT_REJECTED',20,1,'2026-06-07 13:29:00'),(38,10,'Yêu cầu mở gian hàng mới','{\"message\":\"Gian hàng \\\"Sneaker Heavy\\\" vừa gửi hồ sơ đăng ký.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781013058/shoes_store_profiles/eatie09hz6sunriewlad.jpg\",\"ownerName\":\"Hà Y Như Ý\",\"ownerEmail\":\"nhuyhay2005@gmail.com\"}','STORE_PENDING',12,0,'2026-06-09 13:51:01'),(39,11,'Yêu cầu mở gian hàng mới','{\"message\":\"Gian hàng \\\"Sneaker Heavy\\\" vừa gửi hồ sơ đăng ký.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781013058/shoes_store_profiles/eatie09hz6sunriewlad.jpg\",\"ownerName\":\"Hà Y Như Ý\",\"ownerEmail\":\"nhuyhay2005@gmail.com\"}','STORE_PENDING',12,1,'2026-06-09 13:51:01'),(40,10,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: giày sneaker\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781199521/shoes_store_products/zyckux8ihuoiuc3hcgaq.webp\"}','PRODUCT_PENDING',21,0,'2026-06-11 17:38:43'),(41,11,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: giày sneaker\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781199521/shoes_store_products/zyckux8ihuoiuc3hcgaq.webp\"}','PRODUCT_PENDING',21,1,'2026-06-11 17:38:43'),(42,10,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: giày sneaker\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781200418/shoes_store_products/kymlnmb0zpgoekdiku7q.jpg\"}','PRODUCT_PENDING',22,0,'2026-06-11 17:53:39'),(43,11,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: giày sneaker\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781200418/shoes_store_products/kymlnmb0zpgoekdiku7q.jpg\"}','PRODUCT_PENDING',22,1,'2026-06-11 17:53:39'),(44,10,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: giày sneaker 1\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781200705/shoes_store_products/urm4mogi2khj5knxrao5.webp\"}','PRODUCT_PENDING',23,0,'2026-06-11 17:58:27'),(45,11,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: giày sneaker 1\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781200705/shoes_store_products/urm4mogi2khj5knxrao5.webp\"}','PRODUCT_PENDING',23,1,'2026-06-11 17:58:27'),(46,10,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: giày sneaker\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781202480/shoes_store_products/tum62858umz9zjlxbm0j.webp\"}','PRODUCT_PENDING',24,0,'2026-06-11 18:28:03'),(47,11,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: giày sneaker\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781202480/shoes_store_products/tum62858umz9zjlxbm0j.webp\"}','PRODUCT_PENDING',24,1,'2026-06-11 18:28:03'),(48,10,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: giày sneaker\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781202510/shoes_store_products/jx4vmdlsvizhwxdm5aae.webp\"}','PRODUCT_PENDING',25,0,'2026-06-11 18:28:32'),(49,11,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: giày sneaker\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781202510/shoes_store_products/jx4vmdlsvizhwxdm5aae.webp\"}','PRODUCT_PENDING',25,1,'2026-06-11 18:28:32'),(50,10,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa báo cáo vi phạm đối với 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780514457/shoes_store_profiles/y8y0i5fcx3ggwtcsvkpj.jpg\"}','REVIEW_REPORTED',2,0,'2026-06-12 08:11:52'),(51,11,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa báo cáo vi phạm đối với 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780514457/shoes_store_profiles/y8y0i5fcx3ggwtcsvkpj.jpg\"}','REVIEW_REPORTED',2,1,'2026-06-12 08:11:52'),(52,1,'Yêu cầu rút tiền mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa đặt lệnh rút 230.000 VNĐ.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780514457/shoes_store_profiles/y8y0i5fcx3ggwtcsvkpj.jpg\"}','PAYOUT_REQUESTED',3,0,'2026-06-12 08:52:46'),(53,13,'Yêu cầu rút tiền mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa đặt lệnh rút 230.000 VNĐ.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780514457/shoes_store_profiles/y8y0i5fcx3ggwtcsvkpj.jpg\"}','PAYOUT_REQUESTED',3,1,'2026-06-12 08:52:46'),(54,6,'Cập nhật trạng thái sản phẩm','{\"message\":\"Sản phẩm \\\"Nike Air Jordan 1 Low\\\" đã chuyển sang trạng thái: approved\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781206591/shoes_store_products/ifjapzb1yl1gl2po75cd.webp\"}','PRODUCT_APPROVED',1,1,'2026-06-14 18:26:08'),(55,6,'Sản phẩm bị từ chối','{\"message\":\"Sản phẩm Giày Nike Air Jordan 1 High Travis Scott đã bị đình chỉ/từ chối.\",\"image\":\"\"}','PRODUCT_REJECTED',20,1,'2026-06-14 18:30:40'),(56,6,'CẢNH BÁO KHÓA SẢN PHẨM','{\"message\":\"Sản phẩm Adidas Forum Low White đã bị đình chỉ/từ chối.\",\"image\":\"\"}','PRODUCT_BANNED',2,1,'2026-06-14 18:59:13'),(57,6,'Sản phẩm đã được duyệt','{\"message\":\"Sản phẩm Adidas Forum Low White đã sẵn sàng giao dịch.\",\"image\":\"\"}','PRODUCT_APPROVED',2,1,'2026-06-14 19:03:38'),(58,6,'CẢNH BÁO KHÓA SẢN PHẨM','{\"message\":\"Sản phẩm Adidas Forum Low White đã bị đình chỉ/từ chối.\",\"image\":\"\"}','PRODUCT_BANNED',2,1,'2026-06-14 19:38:04'),(59,10,'Yêu cầu giải trình cứu xét sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa gửi yêu cầu duyệt lại 1 sản phẩm bị vi phạm: Adidas Forum Low White\",\"image\":\"\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productCount\":1,\"productNames\":[\"Adidas Forum Low White\"]}','PRODUCT_REAPPROVAL',2,0,'2026-06-14 19:38:30'),(60,11,'Yêu cầu giải trình cứu xét sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa gửi yêu cầu duyệt lại 1 sản phẩm bị vi phạm: Adidas Forum Low White\",\"image\":\"\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productCount\":1,\"productNames\":[\"Adidas Forum Low White\"]}','PRODUCT_REAPPROVAL',2,1,'2026-06-14 19:38:30'),(61,6,'Sản phẩm đã được duyệt','{\"message\":\"Sản phẩm Adidas Forum Low White đã sẵn sàng giao dịch.\",\"image\":\"\"}','PRODUCT_APPROVED',2,1,'2026-06-14 19:43:34'),(62,10,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: Visd ád\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781466727/shoes_store_products/etzcpvwfy6ajtyhdcq16.jpg\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productName\":\"Visd ád\"}','PRODUCT_PENDING',27,0,'2026-06-14 19:52:08'),(63,11,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: Visd ád\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781466727/shoes_store_products/etzcpvwfy6ajtyhdcq16.jpg\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productName\":\"Visd ád\"}','PRODUCT_PENDING',27,1,'2026-06-14 19:52:08'),(64,10,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: sdasda\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781466847/shoes_store_products/iksbgcwl6dfzppjkfzqg.jpg\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productName\":\"sdasda\"}','PRODUCT_PENDING',28,0,'2026-06-14 19:54:08'),(65,11,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: sdasda\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781466847/shoes_store_products/iksbgcwl6dfzppjkfzqg.jpg\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productName\":\"sdasda\"}','PRODUCT_PENDING',28,1,'2026-06-14 19:54:08'),(66,10,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: ádasd\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781466924/shoes_store_products/bvfj2qw7uf3cihecyz7h.jpg\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productName\":\"ádasd\"}','PRODUCT_PENDING',29,0,'2026-06-14 19:55:25'),(67,11,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: ádasd\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781466924/shoes_store_products/bvfj2qw7uf3cihecyz7h.jpg\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productName\":\"ádasd\"}','PRODUCT_PENDING',29,1,'2026-06-14 19:55:25'),(68,6,'Sản phẩm đã được duyệt','{\"message\":\"Sản phẩm Giày Sneaker chạy bộ đã sẵn sàng giao dịch.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781464680/shoes_store_products/dwwcyypdxi1gelhb4giy.jpg\"}','PRODUCT_APPROVED',26,1,'2026-06-14 19:57:32'),(69,6,'CẢNH BÁO KHÓA SẢN PHẨM','{\"message\":\"Sản phẩm Giày Sneaker chạy bộ đã bị đình chỉ/từ chối.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781464680/shoes_store_products/dwwcyypdxi1gelhb4giy.jpg\"}','PRODUCT_BANNED',26,1,'2026-06-14 19:58:03'),(70,10,'Yêu cầu giải trình cứu xét sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa gửi yêu cầu duyệt lại 1 sản phẩm bị vi phạm: Giày Sneaker chạy bộ\",\"image\":\"\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productCount\":1,\"productNames\":[\"Giày Sneaker chạy bộ\"]}','PRODUCT_REAPPROVAL',26,0,'2026-06-14 19:59:16'),(71,11,'Yêu cầu giải trình cứu xét sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa gửi yêu cầu duyệt lại 1 sản phẩm bị vi phạm: Giày Sneaker chạy bộ\",\"image\":\"\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productCount\":1,\"productNames\":[\"Giày Sneaker chạy bộ\"]}','PRODUCT_REAPPROVAL',26,1,'2026-06-14 19:59:16'),(72,6,'Sản phẩm đã được duyệt','{\"message\":\"Sản phẩm Giày Sneaker chạy bộ đã sẵn sàng giao dịch.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781464680/shoes_store_products/dwwcyypdxi1gelhb4giy.jpg\"}','PRODUCT_APPROVED',26,1,'2026-06-14 20:08:59'),(73,6,'CẢNH BÁO KHÓA SẢN PHẨM','{\"message\":\"Sản phẩm Giày Sneaker chạy bộ đã bị đình chỉ/từ chối.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781464680/shoes_store_products/dwwcyypdxi1gelhb4giy.jpg\"}','PRODUCT_BANNED',26,1,'2026-06-14 20:09:53'),(74,10,'Yêu cầu giải trình cứu xét sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa gửi yêu cầu duyệt lại 1 sản phẩm bị vi phạm: Giày Sneaker chạy bộ\",\"image\":\"\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productCount\":1,\"productNames\":[\"Giày Sneaker chạy bộ\"]}','PRODUCT_REAPPROVAL',26,0,'2026-06-14 20:10:34'),(75,11,'Yêu cầu giải trình cứu xét sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa gửi yêu cầu duyệt lại 1 sản phẩm bị vi phạm: Giày Sneaker chạy bộ\",\"image\":\"\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productCount\":1,\"productNames\":[\"Giày Sneaker chạy bộ\"]}','PRODUCT_REAPPROVAL',26,1,'2026-06-14 20:10:34'),(76,10,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: giày \",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781468107/shoes_store_products/yzo7szy4u9kbutbpgja5.jpg\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productName\":\"giày \"}','PRODUCT_PENDING',30,0,'2026-06-14 20:15:09'),(77,11,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: giày \",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781468107/shoes_store_products/yzo7szy4u9kbutbpgja5.jpg\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productName\":\"giày \"}','PRODUCT_PENDING',30,1,'2026-06-14 20:15:09'),(78,6,'Kết quả giải quyết khiếu nại','{\"message\":\"Đơn tố cáo thành công. Hệ thống đã ẩn đánh giá của khách hàng Ngọc Thiênnn.\",\"image\":\"\"}','REVIEW_RESOLVED_BANNED',6,1,'2026-06-15 09:27:13'),(86,10,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" báo cáo vi phạm đánh giá: \\\"Chủ shop tư vấn size siêu nhiệt tình, đóng gói kỹ càng, 10 điểm không có nhưng!...\\\"\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780514457/shoes_store_profiles/y8y0i5fcx3ggwtcsvkpj.jpg\",\"reviewId\":6,\"reviewType\":\"product\",\"rating\":5,\"productName\":\"Nike Air Jordan 1 Low\"}','REVIEW_REPORTED',6,0,'2026-06-15 10:30:58'),(87,11,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" báo cáo vi phạm đánh giá: \\\"Chủ shop tư vấn size siêu nhiệt tình, đóng gói kỹ càng, 10 điểm không có nhưng!...\\\"\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780514457/shoes_store_profiles/y8y0i5fcx3ggwtcsvkpj.jpg\",\"reviewId\":6,\"reviewType\":\"product\",\"rating\":5,\"productName\":\"Nike Air Jordan 1 Low\"}','REVIEW_REPORTED',6,1,'2026-06-15 10:30:58'),(88,10,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" báo cáo vi phạm đánh giá: \\\"Chủ shop tư vấn size siêu nhiệt tình, đóng gói kỹ càng, 10 điểm không có nhưng!...\\\"\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780514457/shoes_store_profiles/y8y0i5fcx3ggwtcsvkpj.jpg\",\"reviewId\":8,\"reviewType\":\"store\",\"rating\":5,\"productName\":null}','REVIEW_REPORTED',8,0,'2026-06-15 10:32:23'),(89,11,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" báo cáo vi phạm đánh giá: \\\"Chủ shop tư vấn size siêu nhiệt tình, đóng gói kỹ càng, 10 điểm không có nhưng!...\\\"\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780514457/shoes_store_profiles/y8y0i5fcx3ggwtcsvkpj.jpg\",\"reviewId\":8,\"reviewType\":\"store\",\"rating\":5,\"productName\":null}','REVIEW_REPORTED',8,1,'2026-06-15 10:32:23'),(90,6,'CẢNH BÁO KHÓA GIAN HÀNG','{\"message\":\"Cửa hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" của bạn đã bị đình chỉ do vi phạm. Lý do: Cửa hàng vi phạm\\n\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780514457/shoes_store_profiles/y8y0i5fcx3ggwtcsvkpj.jpg\"}','STORE_BANNED',2,1,'2026-06-16 08:54:43'),(91,10,'Yêu cầu cứu xét cửa hàng mới','{\"message\":\"Cửa hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa nộp đơn khiếu nại xin khôi phục hoạt động.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780514457/shoes_store_profiles/y8y0i5fcx3ggwtcsvkpj.jpg\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"storeId\":2,\"appealId\":4}','APPEAL_REQUESTED',4,0,'2026-06-16 09:07:06'),(92,11,'Yêu cầu cứu xét cửa hàng mới','{\"message\":\"Cửa hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa nộp đơn khiếu nại xin khôi phục hoạt động.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780514457/shoes_store_profiles/y8y0i5fcx3ggwtcsvkpj.jpg\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"storeId\":2,\"appealId\":4}','APPEAL_REQUESTED',4,1,'2026-06-16 09:07:06'),(93,6,'Khôi phục cửa hàng thành công','{\"message\":\"Chúc mừng! Cửa hàng của bạn đã được khôi phục trạng thái hoạt động.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780514457/shoes_store_profiles/y8y0i5fcx3ggwtcsvkpj.jpg\"}','APPEAL_APPROVED',4,1,'2026-06-16 09:27:16'),(94,10,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Nike Air Jordan 1 Low. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":1,\"productName\":\"Nike Air Jordan 1 Low\"}','PRODUCT_REAPPROVAL',1,0,'2026-06-17 14:29:05'),(95,11,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Nike Air Jordan 1 Low. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":1,\"productName\":\"Nike Air Jordan 1 Low\"}','PRODUCT_REAPPROVAL',1,1,'2026-06-17 14:29:05'),(96,6,'Sản phẩm đã được duyệt','{\"message\":\"Sản phẩm Nike Air Jordan 1 Low đã sẵn sàng giao dịch.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781206591/shoes_store_products/ifjapzb1yl1gl2po75cd.webp\"}','PRODUCT_APPROVED',1,1,'2026-06-17 14:29:20'),(97,6,'CẢNH BÁO KHÓA SẢN PHẨM','{\"message\":\"Sản phẩm Nike Air Jordan 1 Low đã bị đình chỉ/từ chối.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781206591/shoes_store_products/ifjapzb1yl1gl2po75cd.webp\"}','PRODUCT_BANNED',1,1,'2026-06-18 11:13:31'),(98,2,'Yêu cầu giải trình cứu xét sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa gửi yêu cầu duyệt lại 1 sản phẩm bị vi phạm: Nike Air Jordan 1 Low\",\"image\":\"\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productCount\":1,\"productNames\":[\"Nike Air Jordan 1 Low\"]}','PRODUCT_REAPPROVAL',1,0,'2026-06-18 11:15:16'),(99,10,'Yêu cầu giải trình cứu xét sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa gửi yêu cầu duyệt lại 1 sản phẩm bị vi phạm: Nike Air Jordan 1 Low\",\"image\":\"\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productCount\":1,\"productNames\":[\"Nike Air Jordan 1 Low\"]}','PRODUCT_REAPPROVAL',1,0,'2026-06-18 11:15:16'),(100,11,'Yêu cầu giải trình cứu xét sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa gửi yêu cầu duyệt lại 1 sản phẩm bị vi phạm: Nike Air Jordan 1 Low\",\"image\":\"\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productCount\":1,\"productNames\":[\"Nike Air Jordan 1 Low\"]}','PRODUCT_REAPPROVAL',1,1,'2026-06-18 11:15:16'),(101,6,'Sản phẩm đã được duyệt','{\"message\":\"Sản phẩm Nike Air Jordan 1 Low đã sẵn sàng giao dịch.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781206591/shoes_store_products/ifjapzb1yl1gl2po75cd.webp\"}','PRODUCT_APPROVED',1,1,'2026-06-18 11:15:23'),(102,6,'Lệnh rút tiền thành công','{\"message\":\"Lệnh rút 230.000 VNĐ đã được xử lý hoàn tất.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780514457/shoes_store_profiles/y8y0i5fcx3ggwtcsvkpj.jpg\"}','PAYOUT_APPROVED',3,1,'2026-06-18 12:54:07'),(103,13,'Yêu cầu rút tiền mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa đặt lệnh rút 543.750 VNĐ.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780514457/shoes_store_profiles/y8y0i5fcx3ggwtcsvkpj.jpg\"}','PAYOUT_REQUESTED',4,1,'2026-06-18 12:58:45'),(104,1,'Yêu cầu rút tiền mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa đặt lệnh rút 543.750 VNĐ.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780514457/shoes_store_profiles/y8y0i5fcx3ggwtcsvkpj.jpg\"}','PAYOUT_REQUESTED',4,0,'2026-06-18 12:58:45'),(105,6,'Lệnh rút tiền bị từ chối','{\"message\":\"Lệnh rút 543.750 VNĐ bị từ chối. Đã hoàn tiền về ví.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780514457/shoes_store_profiles/y8y0i5fcx3ggwtcsvkpj.jpg\"}','PAYOUT_REJECTED',4,1,'2026-06-18 12:59:16'),(106,6,'CẢNH BÁO KHÓA SẢN PHẨM','{\"message\":\"Sản phẩm Nike Air Jordan 1 Low đã bị đình chỉ/từ chối.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781206591/shoes_store_products/ifjapzb1yl1gl2po75cd.webp\"}','PRODUCT_BANNED',1,1,'2026-06-18 15:15:10'),(107,2,'Yêu cầu giải trình cứu xét sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa gửi yêu cầu duyệt lại 1 sản phẩm bị vi phạm: Nike Air Jordan 1 Low\",\"image\":\"\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productCount\":1,\"productNames\":[\"Nike Air Jordan 1 Low\"]}','PRODUCT_REAPPROVAL',1,0,'2026-06-18 15:15:31'),(108,10,'Yêu cầu giải trình cứu xét sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa gửi yêu cầu duyệt lại 1 sản phẩm bị vi phạm: Nike Air Jordan 1 Low\",\"image\":\"\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productCount\":1,\"productNames\":[\"Nike Air Jordan 1 Low\"]}','PRODUCT_REAPPROVAL',1,0,'2026-06-18 15:15:31'),(109,11,'Yêu cầu giải trình cứu xét sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa gửi yêu cầu duyệt lại 1 sản phẩm bị vi phạm: Nike Air Jordan 1 Low\",\"image\":\"\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productCount\":1,\"productNames\":[\"Nike Air Jordan 1 Low\"]}','PRODUCT_REAPPROVAL',1,1,'2026-06-18 15:15:31'),(110,6,'Sản phẩm đã được duyệt','{\"message\":\"Sản phẩm Nike Air Jordan 1 Low đã sẵn sàng giao dịch.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781206591/shoes_store_products/ifjapzb1yl1gl2po75cd.webp\"}','PRODUCT_APPROVED',1,1,'2026-06-18 15:15:44'),(111,6,'Đơn hàng chờ thanh toán','{\"message\":\"\",\"orderId\":40,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"2975000.00\"}','ORDER_PENDING_PAYMENT',40,1,'2026-06-18 15:26:37'),(112,7,'Đơn hàng đang chờ thanh toán','{\"message\":\"Đơn hàng #40 đã được tạo. Vui lòng thanh toán để hoàn tất đặt hàng.\",\"orderId\":40}','ORDER_PENDING_PAYMENT',40,1,'2026-06-18 15:26:37'),(113,6,'Đơn hàng đã thanh toán','{\"message\":\"Đơn hàng #40 từ khách hàng Ngọc Thiênnn đã được thanh toán thành công với tổng tiền 2.975.000 ₫. Vui lòng xác nhận và chuẩn bị hàng.\",\"orderId\":40,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"2975000.00\"}','ORDER_PAID',40,1,'2026-06-18 15:26:59'),(114,7,'Thanh toán thành công','{\"message\":\"Đơn hàng #40 đã được thanh toán thành công qua VNPAY với số tiền 2.975.000 ₫. Cửa hàng sẽ sớm xác nhận và giao hàng.\",\"orderId\":40}','ORDER_PAID',40,1,'2026-06-18 15:26:59'),(115,7,'Đơn hàng đang giao','{\"message\":\"Đơn hàng #40 đã được giao cho đơn vị vận chuyển.\",\"orderId\":40}','ORDER_SHIPPED',40,1,'2026-06-18 15:28:54'),(116,7,'Đơn hàng đã giao thành công','{\"message\":\"Đơn hàng #40 đã được giao thành công. Cảm ơn bạn đã mua sắm!\",\"orderId\":40}','ORDER_DELIVERED',40,1,'2026-06-18 15:29:50'),(117,2,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Nike Air Jordan 1 Low. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":1,\"productName\":\"Nike Air Jordan 1 Low\"}','PRODUCT_REAPPROVAL',1,0,'2026-06-20 08:35:05'),(118,10,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Nike Air Jordan 1 Low. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":1,\"productName\":\"Nike Air Jordan 1 Low\"}','PRODUCT_REAPPROVAL',1,0,'2026-06-20 08:35:05'),(119,11,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Nike Air Jordan 1 Low. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":1,\"productName\":\"Nike Air Jordan 1 Low\"}','PRODUCT_REAPPROVAL',1,1,'2026-06-20 08:35:05'),(120,6,'Sản phẩm đã được duyệt','{\"message\":\"Sản phẩm Nike Air Jordan 1 Low đã sẵn sàng giao dịch.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781944504/shoes_store_products/jvfu01dhuszxa5cskv3m.webp\"}','PRODUCT_APPROVED',1,1,'2026-06-20 08:35:34'),(121,2,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Nike Air Jordan 1 Low. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":1,\"productName\":\"Nike Air Jordan 1 Low\"}','PRODUCT_REAPPROVAL',1,0,'2026-06-20 08:37:25'),(122,10,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Nike Air Jordan 1 Low. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":1,\"productName\":\"Nike Air Jordan 1 Low\"}','PRODUCT_REAPPROVAL',1,0,'2026-06-20 08:37:25'),(123,11,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Nike Air Jordan 1 Low. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":1,\"productName\":\"Nike Air Jordan 1 Low\"}','PRODUCT_REAPPROVAL',1,1,'2026-06-20 08:37:25'),(124,6,'Sản phẩm đã được duyệt','{\"message\":\"Sản phẩm Nike Air Jordan 1 Low đã sẵn sàng giao dịch.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781944504/shoes_store_products/jvfu01dhuszxa5cskv3m.webp\"}','PRODUCT_APPROVED',1,1,'2026-06-20 09:01:52'),(125,2,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Nike Air Jordan 1 Low. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":1,\"productName\":\"Nike Air Jordan 1 Low\"}','PRODUCT_REAPPROVAL',1,0,'2026-06-20 09:08:27'),(126,10,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Nike Air Jordan 1 Low. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":1,\"productName\":\"Nike Air Jordan 1 Low\"}','PRODUCT_REAPPROVAL',1,0,'2026-06-20 09:08:27'),(127,11,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Nike Air Jordan 1 Low. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":1,\"productName\":\"Nike Air Jordan 1 Low\"}','PRODUCT_REAPPROVAL',1,1,'2026-06-20 09:08:27'),(128,6,'Sản phẩm đã được duyệt','{\"message\":\"Sản phẩm Nike Air Jordan 1 Low đã sẵn sàng giao dịch.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781946506/shoes_store_products/ttafbwbqkm8wbsmt88g7.png\"}','PRODUCT_APPROVED',1,1,'2026-06-20 09:10:42'),(129,2,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Adidas Forum Low White. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":2,\"productName\":\"Adidas Forum Low White\"}','PRODUCT_REAPPROVAL',2,0,'2026-06-20 09:15:28'),(130,10,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Adidas Forum Low White. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":2,\"productName\":\"Adidas Forum Low White\"}','PRODUCT_REAPPROVAL',2,0,'2026-06-20 09:15:28'),(131,11,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Adidas Forum Low White. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":2,\"productName\":\"Adidas Forum Low White\"}','PRODUCT_REAPPROVAL',2,1,'2026-06-20 09:15:28'),(132,6,'Sản phẩm đã được duyệt','{\"message\":\"Sản phẩm Adidas Forum Low White đã sẵn sàng giao dịch.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781946927/shoes_store_products/ujstjzigorbrqvldumuu.jpg\"}','PRODUCT_APPROVED',2,1,'2026-06-20 09:16:04'),(133,2,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: New Balance 550 Blue. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":3,\"productName\":\"New Balance 550 Blue\"}','PRODUCT_REAPPROVAL',3,0,'2026-06-20 09:19:24'),(134,10,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: New Balance 550 Blue. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":3,\"productName\":\"New Balance 550 Blue\"}','PRODUCT_REAPPROVAL',3,0,'2026-06-20 09:19:24'),(135,11,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: New Balance 550 Blue. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":3,\"productName\":\"New Balance 550 Blue\"}','PRODUCT_REAPPROVAL',3,1,'2026-06-20 09:19:24'),(136,2,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Biti’s Hunter Heels. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":4,\"productName\":\"Biti’s Hunter Heels\"}','PRODUCT_REAPPROVAL',4,0,'2026-06-20 09:24:23'),(137,10,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Biti’s Hunter Heels. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":4,\"productName\":\"Biti’s Hunter Heels\"}','PRODUCT_REAPPROVAL',4,0,'2026-06-20 09:24:23'),(138,11,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Biti’s Hunter Heels. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":4,\"productName\":\"Biti’s Hunter Heels\"}','PRODUCT_REAPPROVAL',4,1,'2026-06-20 09:24:23'),(139,2,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Stiletto Cao Gót 9cm. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":5,\"productName\":\"Stiletto Cao Gót 9cm\"}','PRODUCT_REAPPROVAL',5,0,'2026-06-20 09:32:56'),(140,10,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Stiletto Cao Gót 9cm. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":5,\"productName\":\"Stiletto Cao Gót 9cm\"}','PRODUCT_REAPPROVAL',5,0,'2026-06-20 09:32:56'),(141,11,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Stiletto Cao Gót 9cm. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":5,\"productName\":\"Stiletto Cao Gót 9cm\"}','PRODUCT_REAPPROVAL',5,1,'2026-06-20 09:32:56'),(142,2,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Oxford Classic Leather. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":6,\"productName\":\"Oxford Classic Leather\"}','PRODUCT_REAPPROVAL',6,0,'2026-06-20 09:37:01'),(143,10,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Oxford Classic Leather. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":6,\"productName\":\"Oxford Classic Leather\"}','PRODUCT_REAPPROVAL',6,0,'2026-06-20 09:37:01'),(144,11,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Oxford Classic Leather. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":6,\"productName\":\"Oxford Classic Leather\"}','PRODUCT_REAPPROVAL',6,1,'2026-06-20 09:37:01'),(145,2,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Chelsea Boot Suede. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":7,\"productName\":\"Chelsea Boot Suede\"}','PRODUCT_REAPPROVAL',7,0,'2026-06-20 09:40:45'),(146,10,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Chelsea Boot Suede. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":7,\"productName\":\"Chelsea Boot Suede\"}','PRODUCT_REAPPROVAL',7,0,'2026-06-20 09:40:45'),(147,11,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Chelsea Boot Suede. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":7,\"productName\":\"Chelsea Boot Suede\"}','PRODUCT_REAPPROVAL',7,1,'2026-06-20 09:40:45'),(148,2,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Sandals Quai Hậu Học Sinh. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":9,\"productName\":\"Sandals Quai Hậu Học Sinh\"}','PRODUCT_REAPPROVAL',9,0,'2026-06-20 09:42:56'),(149,10,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Sandals Quai Hậu Học Sinh. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":9,\"productName\":\"Sandals Quai Hậu Học Sinh\"}','PRODUCT_REAPPROVAL',9,0,'2026-06-20 09:42:56'),(150,11,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: Sandals Quai Hậu Học Sinh. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":9,\"productName\":\"Sandals Quai Hậu Học Sinh\"}','PRODUCT_REAPPROVAL',9,1,'2026-06-20 09:42:56'),(151,2,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: Sandals Cao Gót Biti\'s Nữ\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781948800/shoes_store_products/n3vpqqqq7qyrrionjdvy.jpg\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productName\":\"Sandals Cao Gót Biti\'s Nữ\"}','PRODUCT_PENDING',31,0,'2026-06-20 09:46:41'),(152,10,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: Sandals Cao Gót Biti\'s Nữ\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781948800/shoes_store_products/n3vpqqqq7qyrrionjdvy.jpg\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productName\":\"Sandals Cao Gót Biti\'s Nữ\"}','PRODUCT_PENDING',31,0,'2026-06-20 09:46:41'),(153,11,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa thêm sản phẩm: Sandals Cao Gót Biti\'s Nữ\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781948800/shoes_store_products/n3vpqqqq7qyrrionjdvy.jpg\",\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"productName\":\"Sandals Cao Gót Biti\'s Nữ\"}','PRODUCT_PENDING',31,1,'2026-06-20 09:46:41'),(154,6,'Cập nhật trạng thái sản phẩm','{\"message\":\"Sản phẩm \\\"New Balance 550 Blue\\\" đã chuyển sang trạng thái: approved\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781947192/shoes_store_products/xa5u8tuemdcj2ohpk2p7.jpg\"}','PRODUCT_APPROVED',3,1,'2026-06-20 09:47:26'),(155,6,'Cập nhật trạng thái sản phẩm','{\"message\":\"Sản phẩm \\\"Biti’s Hunter Heels\\\" đã chuyển sang trạng thái: approved\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781947836/shoes_store_products/rvd5hvveges6lzogewiv.jpg\"}','PRODUCT_APPROVED',4,1,'2026-06-20 09:47:26'),(156,6,'Cập nhật trạng thái sản phẩm','{\"message\":\"Sản phẩm \\\"Stiletto Cao Gót 9cm\\\" đã chuyển sang trạng thái: approved\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781947976/shoes_store_products/w56m7va2rlmgzcpv2gjp.webp\"}','PRODUCT_APPROVED',5,1,'2026-06-20 09:47:26'),(157,6,'Cập nhật trạng thái sản phẩm','{\"message\":\"Sản phẩm \\\"Oxford Classic Leather\\\" đã chuyển sang trạng thái: approved\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781948220/shoes_store_products/xsasqfzntnumntbfwqir.jpg\"}','PRODUCT_APPROVED',6,1,'2026-06-20 09:47:26'),(158,6,'Cập nhật trạng thái sản phẩm','{\"message\":\"Sản phẩm \\\"Chelsea Boot Suede\\\" đã chuyển sang trạng thái: approved\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781948444/shoes_store_products/nbhaag0lrh0zswpycsqd.webp\"}','PRODUCT_APPROVED',7,1,'2026-06-20 09:47:26'),(159,6,'Cập nhật trạng thái sản phẩm','{\"message\":\"Sản phẩm \\\"Sandals Quai Hậu Học Sinh\\\" đã chuyển sang trạng thái: approved\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781948575/shoes_store_products/xaydtl7meqboikwtr1bt.png\"}','PRODUCT_APPROVED',9,1,'2026-06-20 09:47:26'),(160,6,'Cập nhật trạng thái sản phẩm','{\"message\":\"Sản phẩm \\\"Sandals Cao Gót Biti\'s Nữ\\\" đã chuyển sang trạng thái: approved\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781948800/shoes_store_products/n3vpqqqq7qyrrionjdvy.jpg\"}','PRODUCT_APPROVED',31,1,'2026-06-20 09:47:26'),(161,2,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Premium (huu)\\\" vừa chỉnh sửa sản phẩm: Dép Yeezy Slide Bone. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":8,\"productName\":\"Dép Yeezy Slide Bone\"}','PRODUCT_REAPPROVAL',8,0,'2026-06-20 09:50:17'),(162,10,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Premium (huu)\\\" vừa chỉnh sửa sản phẩm: Dép Yeezy Slide Bone. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":8,\"productName\":\"Dép Yeezy Slide Bone\"}','PRODUCT_REAPPROVAL',8,0,'2026-06-20 09:50:17'),(163,11,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Premium (huu)\\\" vừa chỉnh sửa sản phẩm: Dép Yeezy Slide Bone. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":8,\"productName\":\"Dép Yeezy Slide Bone\"}','PRODUCT_REAPPROVAL',8,1,'2026-06-20 09:50:17'),(164,12,'Sản phẩm đã được duyệt','{\"message\":\"Sản phẩm Dép Yeezy Slide đã sẵn sàng giao dịch.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781949017/shoes_store_products/ae07oa3hoaikktnj7l5t.jpg\"}','PRODUCT_APPROVED',8,1,'2026-06-20 09:51:02'),(165,2,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Premium (huu)\\\" vừa chỉnh sửa sản phẩm: Dép Yeezy Slide. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":8,\"productName\":\"Dép Yeezy Slide\"}','PRODUCT_REAPPROVAL',8,0,'2026-06-20 11:38:27'),(166,10,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Premium (huu)\\\" vừa chỉnh sửa sản phẩm: Dép Yeezy Slide. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":8,\"productName\":\"Dép Yeezy Slide\"}','PRODUCT_REAPPROVAL',8,0,'2026-06-20 11:38:27'),(167,11,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Premium (huu)\\\" vừa chỉnh sửa sản phẩm: Dép Yeezy Slide. Vui lòng kiểm duyệt lại.\",\"image\":\"\",\"productId\":8,\"productName\":\"Dép Yeezy Slide\"}','PRODUCT_REAPPROVAL',8,1,'2026-06-20 11:38:27'),(168,2,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Premium (huu)\\\" vừa thêm sản phẩm: Nike Air Jordan 1 Low\",\"image\":\"\",\"storeName\":\"Sneaker World Premium (huu)\",\"productName\":\"Nike Air Jordan 1 Low\"}','PRODUCT_PENDING',32,0,'2026-06-20 12:19:36'),(169,10,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Premium (huu)\\\" vừa thêm sản phẩm: Nike Air Jordan 1 Low\",\"image\":\"\",\"storeName\":\"Sneaker World Premium (huu)\",\"productName\":\"Nike Air Jordan 1 Low\"}','PRODUCT_PENDING',32,0,'2026-06-20 12:19:36'),(170,11,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Premium (huu)\\\" vừa thêm sản phẩm: Nike Air Jordan 1 Low\",\"image\":\"\",\"storeName\":\"Sneaker World Premium (huu)\",\"productName\":\"Nike Air Jordan 1 Low\"}','PRODUCT_PENDING',32,1,'2026-06-20 12:19:36'),(171,2,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: New Balance 550 Blue. Vui lòng kiểm duyệt lại.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963275/shoes_store_products/rlw2pobyuimrarxjhnr6.jpg\",\"productId\":3,\"productName\":\"New Balance 550 Blue\"}','PRODUCT_REAPPROVAL',3,0,'2026-06-20 13:48:51'),(172,10,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: New Balance 550 Blue. Vui lòng kiểm duyệt lại.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963275/shoes_store_products/rlw2pobyuimrarxjhnr6.jpg\",\"productId\":3,\"productName\":\"New Balance 550 Blue\"}','PRODUCT_REAPPROVAL',3,0,'2026-06-20 13:48:51'),(173,11,'Yêu cầu kiểm duyệt lại sản phẩm','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa chỉnh sửa sản phẩm: New Balance 550 Blue. Vui lòng kiểm duyệt lại.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963275/shoes_store_products/rlw2pobyuimrarxjhnr6.jpg\",\"productId\":3,\"productName\":\"New Balance 550 Blue\"}','PRODUCT_REAPPROVAL',3,1,'2026-06-20 13:48:51'),(174,6,'Cập nhật trạng thái sản phẩm','{\"message\":\"Sản phẩm \\\"New Balance 550 Blue\\\" đã chuyển sang trạng thái: approved\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963335/shoes_store_products/a8noqo6n7rkogoakmwo2.jpg\"}','PRODUCT_APPROVED',3,1,'2026-06-20 13:54:56'),(175,12,'Cập nhật trạng thái sản phẩm','{\"message\":\"Sản phẩm \\\"Dép Yeezy Slide\\\" đã chuyển sang trạng thái: approved\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963014/shoes_store_products/l8ac8jclkwq0fjmq67ig.jpg\"}','PRODUCT_APPROVED',8,1,'2026-06-20 13:54:56'),(176,12,'Cập nhật trạng thái sản phẩm','{\"message\":\"Sản phẩm \\\"Nike Air Jordan 1 Low\\\" đã chuyển sang trạng thái: approved\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781962883/shoes_store_products/xvny1ycs0dkg2czkknmd.png\"}','PRODUCT_APPROVED',32,1,'2026-06-20 13:54:56'),(177,2,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Premium (huu)\\\" vừa thêm sản phẩm: Adidas Predator Elite\",\"image\":\"\",\"storeName\":\"Sneaker World Premium (huu)\",\"productName\":\"Adidas Predator Elite\"}','PRODUCT_PENDING',33,0,'2026-06-20 19:06:41'),(178,10,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Premium (huu)\\\" vừa thêm sản phẩm: Adidas Predator Elite\",\"image\":\"\",\"storeName\":\"Sneaker World Premium (huu)\",\"productName\":\"Adidas Predator Elite\"}','PRODUCT_PENDING',33,0,'2026-06-20 19:06:41'),(179,11,'Yêu cầu kiểm duyệt sản phẩm mới','{\"message\":\"Gian hàng \\\"Sneaker World Premium (huu)\\\" vừa thêm sản phẩm: Adidas Predator Elite\",\"image\":\"\",\"storeName\":\"Sneaker World Premium (huu)\",\"productName\":\"Adidas Predator Elite\"}','PRODUCT_PENDING',33,1,'2026-06-20 19:06:41'),(180,12,'Sản phẩm đã được duyệt','{\"message\":\"Sản phẩm Adidas Predator Elite đã sẵn sàng giao dịch.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781982525/shoes_store_products/hwu5mu6ykknlvntgix9n.jpg\"}','PRODUCT_APPROVED',33,1,'2026-06-20 19:09:45'),(181,6,'Đơn hàng chờ thanh toán','{\"message\":\"\",\"orderId\":41,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"637500.00\"}','ORDER_PENDING_PAYMENT',41,1,'2026-06-20 19:15:04'),(182,7,'Đơn hàng đang chờ thanh toán','{\"message\":\"Đơn hàng #41 đã được tạo. Vui lòng thanh toán để hoàn tất đặt hàng.\",\"orderId\":41}','ORDER_PENDING_PAYMENT',41,1,'2026-06-20 19:15:04'),(183,12,'Đơn hàng chờ thanh toán','{\"message\":\"\",\"orderId\":42,\"storeName\":\"Sneaker World Premium (huu)\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"600000.00\"}','ORDER_PENDING_PAYMENT',42,1,'2026-06-20 19:15:04'),(184,7,'Đơn hàng đang chờ thanh toán','{\"message\":\"Đơn hàng #42 đã được tạo. Vui lòng thanh toán để hoàn tất đặt hàng.\",\"orderId\":42}','ORDER_PENDING_PAYMENT',42,1,'2026-06-20 19:15:04'),(185,6,'Đơn hàng đã thanh toán','{\"message\":\"Đơn hàng #41 từ khách hàng Ngọc Thiênnn đã được thanh toán thành công với tổng tiền 637.500 ₫. Vui lòng xác nhận và chuẩn bị hàng.\",\"orderId\":41,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"637500.00\"}','ORDER_PAID',41,1,'2026-06-20 19:15:43'),(186,7,'Thanh toán thành công','{\"message\":\"Đơn hàng #41 đã được thanh toán thành công qua VNPAY với số tiền 637.500 ₫. Cửa hàng sẽ sớm xác nhận và giao hàng.\",\"orderId\":41}','ORDER_PAID',41,1,'2026-06-20 19:15:43'),(187,12,'Đơn hàng đã thanh toán','{\"message\":\"Đơn hàng #42 từ khách hàng Ngọc Thiênnn đã được thanh toán thành công với tổng tiền 600.000 ₫. Vui lòng xác nhận và chuẩn bị hàng.\",\"orderId\":42,\"storeName\":\"Sneaker World Premium (huu)\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"600000.00\"}','ORDER_PAID',42,1,'2026-06-20 19:15:43'),(188,7,'Thanh toán thành công','{\"message\":\"Đơn hàng #42 đã được thanh toán thành công qua VNPAY với số tiền 600.000 ₫. Cửa hàng sẽ sớm xác nhận và giao hàng.\",\"orderId\":42}','ORDER_PAID',42,1,'2026-06-20 19:15:43'),(189,7,'Đơn hàng đang giao','{\"message\":\"Đơn hàng #42 đã được giao cho đơn vị vận chuyển.\",\"orderId\":42}','ORDER_SHIPPED',42,1,'2026-06-20 19:17:08'),(190,6,'Đơn hàng mới','{\"message\":\"Có đơn hàng mới #43 từ khách hàng Ngọc Thiênnn với tổng tiền 2.450.000 ₫\",\"orderId\":43,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"2450000.00\"}','ORDER_CREATED',43,1,'2026-06-20 19:18:12'),(191,7,'Đặt hàng thành công','{\"message\":\"Đơn hàng #43 đã được đặt thành công. Cửa hàng sẽ sớm xác nhận và giao hàng.\",\"orderId\":43}','ORDER_CREATED',43,1,'2026-06-20 19:18:12'),(192,6,'Đơn hàng mới','{\"message\":\"Có đơn hàng mới #44 từ khách hàng Ngọc Thiênnn với tổng tiền 2.975.000 ₫\",\"orderId\":44,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"2975000.00\"}','ORDER_CREATED',44,1,'2026-06-20 19:26:32'),(193,7,'Đặt hàng thành công','{\"message\":\"Đơn hàng #44 đã được đặt thành công. Cửa hàng sẽ sớm xác nhận và giao hàng.\",\"orderId\":44}','ORDER_CREATED',44,1,'2026-06-20 19:26:32'),(194,6,'Đơn hàng mới','{\"message\":\"Có đơn hàng mới #45 từ khách hàng Ngọc Thiênnn với tổng tiền 2.975.000 ₫\",\"orderId\":45,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"2975000.00\"}','ORDER_CREATED',45,1,'2026-06-21 09:15:08'),(195,7,'Đặt hàng thành công','{\"message\":\"Đơn hàng #45 đã được đặt thành công. Cửa hàng sẽ sớm xác nhận và giao hàng.\",\"orderId\":45}','ORDER_CREATED',45,1,'2026-06-21 09:15:08'),(196,6,'Đơn hàng mới','{\"message\":\"Có đơn hàng mới #46 từ khách hàng Ngọc Thiênnn với tổng tiền 2.975.000 ₫\",\"orderId\":46,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"2975000.00\"}','ORDER_CREATED',46,1,'2026-06-21 09:29:21'),(197,7,'Đặt hàng thành công','{\"message\":\"Đơn hàng #46 đã được đặt thành công. Cửa hàng sẽ sớm xác nhận và giao hàng.\",\"orderId\":46}','ORDER_CREATED',46,1,'2026-06-21 09:29:21'),(198,6,'Đơn hàng mới','{\"message\":\"Có đơn hàng mới #47 từ khách hàng Ngọc Thiênnn với tổng tiền 2.975.000 ₫\",\"orderId\":47,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"2975000.00\"}','ORDER_CREATED',47,1,'2026-06-21 09:34:47'),(199,7,'Đặt hàng thành công','{\"message\":\"Đơn hàng #47 đã được đặt thành công. Cửa hàng sẽ sớm xác nhận và giao hàng.\",\"orderId\":47}','ORDER_CREATED',47,1,'2026-06-21 09:34:47'),(200,6,'Đơn hàng mới','{\"message\":\"Có đơn hàng mới #48 từ khách hàng Ngọc Thiênnn với tổng tiền 2.975.000 ₫\",\"orderId\":48,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"2975000.00\"}','ORDER_CREATED',48,1,'2026-06-21 09:40:16'),(201,7,'Đặt hàng thành công','{\"message\":\"Đơn hàng #48 đã được đặt thành công. Cửa hàng sẽ sớm xác nhận và giao hàng.\",\"orderId\":48}','ORDER_CREATED',48,1,'2026-06-21 09:40:16'),(202,7,'Đơn hàng đã hủy','{\"message\":\"Đơn hàng #48 đã được hủy theo yêu cầu của bạn.\",\"orderId\":48}','ORDER_CANCELLED',48,1,'2026-06-21 09:45:28'),(203,6,'Yêu cầu hủy đơn hàng','{\"message\":\"Khách hàng Ngọc Thiênnn đã gửi yêu cầu hủy đơn hàng #41 với lý do: \\\"Đặt nhầm sản phẩm/kích cỡ\\\". Tổng tiền: 637.500 ₫. Vui lòng xem xét và duyệt yêu cầu.\",\"orderId\":41,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"637500.00\",\"reason\":\"Đặt nhầm sản phẩm/kích cỡ\"}','ORDER_CANCEL_REQUESTED',41,1,'2026-06-21 10:13:43'),(204,7,'Đã gửi yêu cầu hủy đơn','{\"message\":\"Yêu cầu hủy đơn hàng #41 đã được gửi đến Sneaker World Siêu Cấp Vip Pro. Vui lòng chờ cửa hàng xác nhận.\",\"orderId\":41}','ORDER_CANCEL_REQUESTED',41,1,'2026-06-21 10:13:43'),(205,7,'Đã rút yêu cầu hủy đơn','{\"message\":\"Bạn đã rút lại yêu cầu hủy đơn hàng #41. Đơn hàng đã được đưa trở lại trạng thái đang xử lý.\",\"orderId\":41}','ORDER_PROCESSING',41,1,'2026-06-21 10:14:28'),(206,6,'Yêu cầu hủy đơn hàng','{\"message\":\"Khách hàng Ngọc Thiênnn đã gửi yêu cầu hủy đơn hàng #19 với lý do: \\\"Thay đổi ý định mua hàng\\\". Tổng tiền: 1.950.000 ₫. Vui lòng xem xét và duyệt yêu cầu.\",\"orderId\":19,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"1950000.00\",\"reason\":\"Thay đổi ý định mua hàng\"}','ORDER_CANCEL_REQUESTED',19,1,'2026-06-21 10:22:13'),(207,7,'Đã gửi yêu cầu hủy đơn','{\"message\":\"Yêu cầu hủy đơn hàng #19 đã được gửi đến Sneaker World Siêu Cấp Vip Pro. Vui lòng chờ cửa hàng xác nhận.\",\"orderId\":19}','ORDER_CANCEL_REQUESTED',19,1,'2026-06-21 10:22:13'),(208,6,'Khách hàng đã rút yêu cầu hủy đơn hàng','{\"message\":\"\",\"orderId\":19,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"1950000.00\",\"reason\":null}','ORDER_PROCESSING',19,1,'2026-06-21 10:23:00'),(209,7,'Đã rút yêu cầu hủy đơn','{\"message\":\"Bạn đã rút lại yêu cầu hủy đơn hàng #19. Đơn hàng đã được đưa trở lại trạng thái đang xử lý.\",\"orderId\":19}','ORDER_PROCESSING',19,1,'2026-06-21 10:23:00'),(210,6,'Yêu cầu hủy đơn hàng','{\"message\":\"Khách hàng Ngọc Thiênnn đã gửi yêu cầu hủy đơn hàng #41 với lý do: \\\"Thay đổi ý định mua hàng\\\". Tổng tiền: 637.500 ₫. Vui lòng xem xét và duyệt yêu cầu.\",\"orderId\":41,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"637500.00\",\"reason\":\"Thay đổi ý định mua hàng\",\"orderStatus\":null}','ORDER_CANCEL_REQUESTED',41,1,'2026-06-21 10:33:14'),(211,7,'Đã gửi yêu cầu hủy đơn','{\"message\":\"Yêu cầu hủy đơn hàng #41 đã được gửi đến Sneaker World Siêu Cấp Vip Pro. Vui lòng chờ cửa hàng xác nhận.\",\"orderId\":41}','ORDER_CANCEL_REQUESTED',41,1,'2026-06-21 10:33:14'),(212,6,'Khách hàng đã rút yêu cầu hủy đơn hàng','{\"message\":\"Khách hàng Ngọc Thiênnn đã rút lại yêu cầu hủy đơn hàng #41. Tổng tiền: 637.500 ₫. Đơn hàng đã được đưa trở lại trạng thái đang xử lý.\",\"orderId\":41,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"637500.00\",\"reason\":null,\"orderStatus\":\"processing\"}','ORDER_PROCESSING',41,1,'2026-06-21 10:33:48'),(213,7,'Đã rút yêu cầu hủy đơn','{\"message\":\"Bạn đã rút lại yêu cầu hủy đơn hàng #41. Đơn hàng đã được đưa trở lại trạng thái đang xử lý.\",\"orderId\":41}','ORDER_PROCESSING',41,1,'2026-06-21 10:33:48'),(214,6,'Đơn hàng mới','{\"message\":\"Có đơn hàng mới #49 từ khách hàng Ngọc Thiênnn với tổng tiền 372.000 ₫\",\"orderId\":49,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"372000.00\"}','ORDER_CREATED',49,1,'2026-06-21 10:39:48'),(215,7,'Đặt hàng thành công','{\"message\":\"Đơn hàng #49 đã được đặt thành công. Cửa hàng sẽ sớm xác nhận và giao hàng.\",\"orderId\":49}','ORDER_CREATED',49,1,'2026-06-21 10:39:48'),(216,6,'Đơn hàng đã bị hủy','{\"message\":\"Đơn hàng #49 từ khách hàng Ngọc Thiênnn đã bị hủy trực tiếp với lý do: \\\"Thay đổi ý định mua hàng\\\". Tổng tiền: 372.000 ₫.\",\"orderId\":49,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"372000.00\",\"reason\":\"Thay đổi ý định mua hàng\",\"orderStatus\":null}','ORDER_CANCELLED',49,1,'2026-06-21 10:40:11'),(217,7,'Đơn hàng đã được hủy','{\"message\":\"Đơn hàng #49 đã được hủy thành công. Số lượng sản phẩm đã được hoàn lại vào kho.\",\"orderId\":49}','ORDER_CANCELLED',49,1,'2026-06-21 10:40:11'),(218,6,'Yêu cầu hủy đơn hàng','{\"message\":\"Khách hàng Ngọc Thiênnn đã gửi yêu cầu hủy đơn hàng #41 với lý do: \\\"Sai địa chỉ giao hàng\\\". Tổng tiền: 637.500 ₫. Vui lòng xem xét và duyệt yêu cầu.\",\"orderId\":41,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"637500.00\",\"reason\":\"Sai địa chỉ giao hàng\",\"orderStatus\":\"cancel_requested\"}','ORDER_CANCEL_REQUESTED',41,1,'2026-06-21 10:52:49'),(219,7,'Đã gửi yêu cầu hủy đơn','{\"message\":\"Yêu cầu hủy đơn hàng #41 đã được gửi đến Sneaker World Siêu Cấp Vip Pro. Vui lòng chờ cửa hàng xác nhận.\",\"orderId\":41}','ORDER_CANCEL_REQUESTED',41,1,'2026-06-21 10:52:49'),(220,6,'Khách hàng đã rút yêu cầu hủy đơn hàng','{\"message\":\"Khách hàng Ngọc Thiênnn đã rút lại yêu cầu hủy đơn hàng #41. Tổng tiền: 637.500 ₫. Đơn hàng đã được đưa trở lại trạng thái đang xử lý.\",\"orderId\":41,\"storeName\":\"Sneaker World Siêu Cấp Vip Pro\",\"buyerName\":\"Ngọc Thiênnn\",\"amount\":\"637500.00\",\"reason\":null,\"orderStatus\":\"processing\"}','ORDER_PROCESSING',41,1,'2026-06-21 10:53:07'),(221,7,'Đã rút yêu cầu hủy đơn','{\"message\":\"Bạn đã rút lại yêu cầu hủy đơn hàng #41. Đơn hàng đã được đưa trở lại trạng thái đang xử lý.\",\"orderId\":41}','ORDER_PROCESSING',41,1,'2026-06-21 10:53:07');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `variant_id` int DEFAULT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `variant_id` (`variant_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,3,1,2,3500000.00),(2,4,1,3,3500000.00),(3,5,1,4,3500000.00),(9,9,4,1,1950000.00),(10,9,5,2,1950000.00),(14,12,4,1,1950000.00),(20,18,4,1,1950000.00),(21,19,4,1,1950000.00),(28,25,2,1,3500000.00),(30,27,2,1,3500000.00),(33,30,2,1,3500000.00),(38,35,2,1,3500000.00),(39,36,1,1,3500000.00),(42,39,2,2,3500000.00),(43,40,2,1,3500000.00),(44,41,18,1,750000.00),(45,42,42,1,750000.00),(51,48,1,1,3500000.00),(52,49,23,1,465000.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `recipient_name` varchar(255) NOT NULL,
  `recipient_phone` varchar(20) NOT NULL,
  `store_id` int DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `discount_amount` decimal(15,2) DEFAULT '0.00',
  `commission_rate_snapshot` decimal(5,2) NOT NULL DEFAULT '10.00',
  `shipping_address` text NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled','cancel_requested') DEFAULT 'pending',
  `cancel_reason` text,
  `payment_status` enum('unpaid','paid','refunded') DEFAULT 'unpaid',
  `payment_method` varchar(50) DEFAULT 'COD',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `applied_voucher` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,4,'','',1,3500000.00,0.00,10.00,'123 Đường ABC, Linh Trung, Thủ Đức, TP.HCM','delivered',NULL,'paid','COD','2026-05-19 03:59:28',NULL),(2,4,'','',1,3500000.00,0.00,10.00,'123 Đường ABC, Linh Trung, Thủ Đức, TP.HCM','delivered',NULL,'paid','COD','2026-05-19 04:00:18',NULL),(3,6,'','',1,7000000.00,0.00,10.00,'Số 1 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. Hồ Chí Minh','delivered',NULL,'paid','COD','2026-05-20 07:36:03',NULL),(4,6,'','',1,10500000.00,0.00,10.00,'Số 1 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. Hồ Chí Minh','cancelled',NULL,'unpaid','COD','2026-05-20 08:24:43',NULL),(5,7,'','',2,14000000.00,0.00,10.00,'Số 134 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. Hồ Chí Minh','cancelled','Người mua không còn nhu cầu','unpaid','COD','2026-05-21 06:00:03',NULL),(9,7,'','',2,5850000.00,0.00,10.00,'Số 134 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. Hồ Chí Minh','delivered',NULL,'paid','COD','2026-05-25 17:23:54',NULL),(12,7,'Trần Thanh Toán','0987654321',2,1950000.00,0.00,10.00,'1 Võ Văn Ngân, Thủ Đức, TP.HCM','processing',NULL,'paid','VNPAY','2026-06-01 09:58:26',NULL),(18,7,'Trần MoMo','0987654321',2,1950000.00,0.00,10.00,'123 Đường Dân Chủ, Thủ Đức, TP.HCM','processing',NULL,'paid','MOMO','2026-06-01 10:44:19',NULL),(19,7,'Trần MoMo','0987654321',2,1950000.00,0.00,10.00,'123 Đường Dân Chủ, Thủ Đức, TP.HCM','processing',NULL,'paid','MOMO','2026-06-01 12:11:30',NULL),(25,7,'Ngọc Thiênnn','0123456789',2,3500000.00,0.00,10.00,'99 Lê Đại Hành, Phường 11, Quận 11, TP. HCM','delivered',NULL,'unpaid','COD','2026-06-06 12:05:57',NULL),(27,7,'Ngọc Thiênnn','0123456789',2,2450000.00,1050000.00,10.00,'99 Lê Đại Hành, Phường 11, Quận 11, TP. HCM','processing',NULL,'unpaid','COD','2026-06-07 09:29:41','FLASHSALE30'),(30,7,'Ngọc Thiênnn','0123456789',2,2450000.00,1050000.00,10.00,'99 Lê Đại Hành, Phường 11, Quận 11, TP. HCM','cancelled','[ADMIN FORCE CANCEL] Đơn hàng vi phạm','unpaid','COD','2026-06-07 12:17:23','FLASHSALE30'),(35,7,'Ngọc Thiênnn','0123456789',2,3500000.00,0.00,10.00,'99 Lê Đại Hành, Phường 11, Quận 11, TP. HCM','cancelled','Sai địa chỉ giao hàng','paid','VNPAY','2026-06-08 08:32:23',NULL),(36,7,'Ngọc Thiênnn','0123456789',2,2625000.00,875000.00,10.00,'99 Lê Đại Hành, Phường 11, Quận 11, TP. HCM','delivered',NULL,'paid','VNPAY','2026-06-08 08:52:46','FLASHSALE25'),(39,7,'Ngọc Thiênnn','0123456789',2,5950000.00,1050000.00,10.00,'99 Lê Đại Hành, Phường 11, Quận 11, TP. HCM','shipped',NULL,'paid','VNPAY','2026-06-18 15:08:50','KM2026'),(40,7,'Ngọc Thiênnn','0123456789',2,2975000.00,525000.00,10.00,'99 Lê Đại Hành, Phường 11, Quận 11, TP. HCM','delivered',NULL,'paid','VNPAY','2026-06-18 15:26:37','KM2026'),(41,7,'Ngọc Thiênnn','0123456789',2,637500.00,112500.00,10.00,'99 Lê Đại Hành, Phường 11, Quận 11, TP. HCM','processing',NULL,'paid','VNPAY','2026-06-20 19:15:04','KM2026'),(42,7,'Ngọc Thiênnn','0123456789',6,600000.00,150000.00,10.00,'99 Lê Đại Hành, Phường 11, Quận 11, TP. HCM','shipped',NULL,'paid','VNPAY','2026-06-20 19:15:04','KMM2106'),(48,7,'Ngọc Thiênnn','0123456789',2,2975000.00,525000.00,10.00,'99 Lê Đại Hành, Phường 11, Quận 11, TP. HCM','cancelled','Thay đổi ý định mua hàng','unpaid','COD','2026-06-21 09:40:16',NULL),(49,7,'Ngọc Thiênnn','0123456789',2,372000.00,93000.00,10.00,'99 Lê Đại Hành, Phường 11, Quận 11, TP. HCM','cancelled','Thay đổi ý định mua hàng','unpaid','COD','2026-06-21 10:39:48',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payout_requests`
--

DROP TABLE IF EXISTS `payout_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payout_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `account_name` varchar(150) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `payout_requests_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payout_requests`
--

LOCK TABLES `payout_requests` WRITE;
/*!40000 ALTER TABLE `payout_requests` DISABLE KEYS */;
INSERT INTO `payout_requests` VALUES (1,2,2000000.00,'Vietcombank','0071001234567','NGUYEN VAN A','approved','Đã chuyển khoản thành công qua Vietcombank Bank - Mã GD: MB888999','2026-05-25 17:57:18','2026-05-25 17:59:40'),(2,2,1000000.00,'Vietcombank','0071001234567','NGUYEN VAN A','approved','Đã chuyển khoản thành công qua MB Bank - Mã GD: MB999999','2026-05-29 20:18:44','2026-05-29 20:19:28'),(3,2,230000.00,'Vietcombank','124124124','CỐ NHÂN ','approved','Đã chuyển khoản ','2026-06-12 08:52:46','2026-06-18 12:54:07'),(4,2,543750.00,'Techcombank','0378240914','CAO NGOC THIEN','rejected',NULL,'2026-06-18 12:58:45','2026-06-18 12:59:16');
/*!40000 ALTER TABLE `payout_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_promotions`
--

DROP TABLE IF EXISTS `product_promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_promotions` (
  `product_id` int NOT NULL,
  `promotion_id` int NOT NULL,
  PRIMARY KEY (`product_id`,`promotion_id`),
  KEY `promotion_id` (`promotion_id`),
  CONSTRAINT `product_promotions_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_promotions_ibfk_2` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_promotions`
--

LOCK TABLES `product_promotions` WRITE;
/*!40000 ALTER TABLE `product_promotions` DISABLE KEYS */;
INSERT INTO `product_promotions` VALUES (1,11),(3,11),(31,12),(33,13);
/*!40000 ALTER TABLE `product_promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_reviews`
--

DROP TABLE IF EXISTS `product_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `images` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_reported` tinyint(1) DEFAULT '0',
  `report_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `product_reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reviews`
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
INSERT INTO `product_reviews` VALUES (1,4,1,1,5,'Giày quá đẹp, check chuẩn real, shop đóng gói rất kỹ có cả double box',NULL,1,0,NULL,'2026-05-19 04:00:21'),(2,4,1,1,4,'Hàng đẹp nhưng giao hàng hơi chậm tí, 4 sao khuyến khích.',NULL,1,0,'Khách hàng này cố tình bôi nhọ, sử dụng từ ngữ xúc phạm danh dự cửa hàng và spam số điện thoại lừa đảo kéo khách ra ngoài sàn.','2026-05-19 04:00:21'),(3,4,8,1,5,'Dép đi như trên mây vậy, rất đáng tiền',NULL,1,0,NULL,'2026-05-19 04:00:21'),(4,6,1,3,5,'Giày đẹp xuất sắc pro ơi, da lộn xịn đét đi êm chân cực kỳ luôn!','[]',1,0,'Khách hàng cố tình bôi nhọ, sử dụng từ ngữ xúc phạm danh dự cửa hàng và spam số điện thoại lừa đảo kéo khách ra ngoài sàn.','2026-05-20 12:57:18'),(5,6,1,3,5,'Chủ shop tư vấn size siêu nhiệt tình, đóng gói kỹ càng, 10 điểm không có nhưng!','[]',1,0,'Khách hàng spam đánh giá, bình luận bôi nhọ sản phẩm không đúng sự thật.','2026-05-20 13:02:27'),(6,7,1,3,5,'Chủ shop tư vấn size siêu nhiệt tình, đóng gói kỹ càng, 10 điểm không có nhưng!','[]',1,1,'Tiết lộ thông tin cá nhân','2026-05-20 13:03:47'),(7,7,8,NULL,5,'Chủ shop tư vấn size siêu nhiệt tình, đóng gói kỹ càng, 10 điểm không có nhưng!','[{\"public_id\": \"shoes_store_reviews/ux2afi079gtldqlxbjmh\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779566713/shoes_store_reviews/ux2afi079gtldqlxbjmh.jpg\"}]',1,0,'Khách hàng spam đánh giá, bình luận bôi nhọ sản phẩm không đúng sự thật.','2026-05-23 20:05:14'),(8,7,1,25,5,'Sản phẩm quá đẹp luôn','[{\"public_id\": \"shoes_store_reviews/myigymd6bslksy19d5t7\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780923880/shoes_store_reviews/myigymd6bslksy19d5t7.jpg\"}]',1,1,'Quảng cáo hoặc spam trong bình luận','2026-06-08 13:04:41');
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `size` varchar(20) NOT NULL,
  `color` varchar(50) NOT NULL,
  `stock` int DEFAULT '0',
  `image` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,1,'39','Đỏ (Red)',48,'{\"public_id\": \"shoes_store_products/dxuw5nitqrrsvhvdizh1\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963157/shoes_store_products/dxuw5nitqrrsvhvdizh1.png\"}'),(2,1,'40','Xanh Dương (Blue)',46,'{\"public_id\": \"shoes_store_products/sjeiwqedzrwlgdxoi5g6\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963168/shoes_store_products/sjeiwqedzrwlgdxoi5g6.png\"}'),(3,1,'41','Đen (Black)',49,'{\"public_id\": \"shoes_store_products/lygqvntkvo00gubn5tvb\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963179/shoes_store_products/lygqvntkvo00gubn5tvb.png\"}'),(4,8,'40','Xám (Grey)',15,'{\"public_id\": \"shoes_store_products/z8ezkut6cqy2hzojcjzy\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781956362/shoes_store_products/z8ezkut6cqy2hzojcjzy.jpg\"}'),(5,8,'41','Đen (Black)',25,'{\"public_id\": \"shoes_store_products/l8ac8jclkwq0fjmq67ig\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963014/shoes_store_products/l8ac8jclkwq0fjmq67ig.jpg\"}'),(16,2,'39','Trắng (White)',50,'{\"public_id\": \"shoes_store_products/f2iaq6zpctavshhlii3u\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963221/shoes_store_products/f2iaq6zpctavshhlii3u.jpg\"}'),(17,3,'38','Xanh Dương (Blue)',36,'{\"public_id\": \"shoes_store_products/rlw2pobyuimrarxjhnr6\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963275/shoes_store_products/rlw2pobyuimrarxjhnr6.jpg\"}'),(18,4,'38','Trắng (White)',41,'{\"public_id\": \"shoes_store_products/kgb5jcjbskifehavos1w\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963556/shoes_store_products/kgb5jcjbskifehavos1w.jpg\"}'),(19,5,'39','Vàng (Yellow)',34,'{\"public_id\": \"shoes_store_products/pdpa2dgdk1je4kakwmdb\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963527/shoes_store_products/pdpa2dgdk1je4kakwmdb.webp\"}'),(20,6,'40','Đen (Black)',56,'{\"public_id\": \"shoes_store_products/dnojtwmabu9u5a6atbma\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963578/shoes_store_products/dnojtwmabu9u5a6atbma.jpg\"}'),(21,7,'39','Đen (Black)',34,'{\"public_id\": \"shoes_store_products/yr6fb6hipqpulf60f8ub\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963607/shoes_store_products/yr6fb6hipqpulf60f8ub.webp\"}'),(22,9,'39','Đen (Black)',45,'{\"public_id\": \"shoes_store_products/nnkzktodcggpdapt0w8g\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963627/shoes_store_products/nnkzktodcggpdapt0w8g.png\"}'),(23,31,'38','Đỏ (Red)',57,'{\"public_id\": \"shoes_store_products/p5wsg9bdd51gfh8uied4\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963095/shoes_store_products/p5wsg9bdd51gfh8uied4.jpg\"}'),(40,3,'38','Trắng (White)',56,'{\"public_id\": \"shoes_store_products/a8noqo6n7rkogoakmwo2\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963335/shoes_store_products/a8noqo6n7rkogoakmwo2.jpg\"}'),(41,33,'41','Hồng (Pink)',65,'{\"public_id\": \"shoes_store_products/hjenet4ngkhgysbgnwn6\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781982404/shoes_store_products/hjenet4ngkhgysbgnwn6.jpg\"}'),(42,33,'40','Xanh Dương (Blue)',44,'{\"public_id\": \"shoes_store_products/hwu5mu6ykknlvntgix9n\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781982525/shoes_store_products/hwu5mu6ykknlvntgix9n.jpg\"}');
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `store_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `sold` int DEFAULT '0',
  `rating_avg` decimal(3,2) DEFAULT '0.00',
  `view_count` int DEFAULT '0',
  `images` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `status` varchar(50) DEFAULT 'approved',
  `reject_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `store_id` (`store_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,2,1,'Nike Air Jordan 1 Low','nike-air-jordan-1-low','Phối màu Panda kinh điển',3500000.00,117,4.83,806,'[{\"public_id\": \"shoes_store_products/lygqvntkvo00gubn5tvb\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963179/shoes_store_products/lygqvntkvo00gubn5tvb.png\"}]',1,'approved',NULL,'2026-05-19 03:58:37','2026-06-21 09:40:16'),(2,2,1,'Adidas Forum Low White','adidas-forum-low-white','Phong cách retro thập niên 80',2100000.00,35,0.00,831,'[{\"public_id\": \"shoes_store_products/f2iaq6zpctavshhlii3u\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963221/shoes_store_products/f2iaq6zpctavshhlii3u.jpg\"}]',1,'approved',NULL,'2026-05-19 03:58:37','2026-06-20 16:30:57'),(3,2,1,'New Balance 550 Blue','new-balance-550-blue','Sự kết hợp hoàn hảo thể thao thời trang',3200000.00,20,0.00,130,'[{\"public_id\": \"shoes_store_products/a8noqo6n7rkogoakmwo2\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963335/shoes_store_products/a8noqo6n7rkogoakmwo2.jpg\"}]',1,'approved',NULL,'2026-05-19 03:58:37','2026-06-20 18:06:15'),(4,2,2,'Biti’s Hunter Heels','bitis-hunter-heels','Êm ái, tôn dáng cho phái đẹp',750000.00,121,0.00,8,'[{\"public_id\": \"shoes_store_products/kgb5jcjbskifehavos1w\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963556/shoes_store_products/kgb5jcjbskifehavos1w.jpg\"}]',1,'approved',NULL,'2026-05-19 03:58:37','2026-06-20 19:15:04'),(5,2,2,'Stiletto Cao Gót 9cm','stiletto-cao-got-9cm','Màu đỏ mận quý phái, gót nhọn',1200000.00,15,0.00,13,'[{\"public_id\": \"shoes_store_products/pdpa2dgdk1je4kakwmdb\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963527/shoes_store_products/pdpa2dgdk1je4kakwmdb.webp\"}]',1,'approved',NULL,'2026-05-19 03:58:37','2026-06-20 13:52:08'),(6,2,3,'Oxford Classic Leather','oxford-classic-leather','Da bò thật nguyên tấm, khâu tay',1850000.00,5,5.00,8,'[{\"public_id\": \"shoes_store_products/dnojtwmabu9u5a6atbma\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963578/shoes_store_products/dnojtwmabu9u5a6atbma.jpg\"}]',1,'approved',NULL,'2026-05-19 03:58:37','2026-06-20 13:52:59'),(7,2,3,'Chelsea Boot Suede','chelsea-boot-suede','Da lộn màu nâu đất, phong cách bụi bặm',1600000.00,45,0.00,22,'[{\"public_id\": \"shoes_store_products/yr6fb6hipqpulf60f8ub\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963607/shoes_store_products/yr6fb6hipqpulf60f8ub.webp\"}]',1,'approved',NULL,'2026-05-19 03:58:37','2026-06-20 13:53:28'),(8,2,4,'Dép Yeezy Slide','dep-yeezy-slide-bone','Chất liệu bọt EVA siêu nhẹ, cực êm',1950000.00,230,5.00,34,'[{\"public_id\": \"shoes_store_products/l8ac8jclkwq0fjmq67ig\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963014/shoes_store_products/l8ac8jclkwq0fjmq67ig.jpg\"}]',1,'approved',NULL,'2026-05-19 03:58:37','2026-06-21 08:26:12'),(9,2,4,'Sandals Quai Hậu Học Sinh','sandals-quai-hau-hoc-sinh','Thiết kế đơn giản, bền bỉ',250000.00,500,0.00,37,'[{\"public_id\": \"shoes_store_products/nnkzktodcggpdapt0w8g\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963627/shoes_store_products/nnkzktodcggpdapt0w8g.png\"}]',1,'approved',NULL,'2026-05-19 03:58:37','2026-06-20 13:53:49'),(31,2,10,'Sandals Cao Gót Biti\'s Nữ','sandals-cao-got-bitis-nu-1781948801777','Mang thoải mái, đẹp và dễ chịu',465000.00,1,0.00,0,'[{\"public_id\": \"shoes_store_products/p5wsg9bdd51gfh8uied4\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781963095/shoes_store_products/p5wsg9bdd51gfh8uied4.jpg\"}]',1,'approved',NULL,'2026-06-20 09:46:41','2026-06-21 10:39:48'),(33,6,15,'Adidas Predator Elite','adidas-predator-elite-1781982401135','Giày kiểm soát bóng với các gân cao su dọc thân giày tăng độ xoáy và kiểm soát khi sút. Đế cá tính cho sân cỏ tự nhiên, công nghệ HybridTouch 2.0 mang lại cảm giác bóng mượt mà.',750000.00,1,0.00,12,'[{\"public_id\": \"shoes_store_products/hwu5mu6ykknlvntgix9n\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781982525/shoes_store_products/hwu5mu6ykknlvntgix9n.jpg\"}]',1,'approved',NULL,'2026-06-20 19:06:41','2026-06-21 09:10:57');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `store_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_value` decimal(10,2) DEFAULT '0.00',
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `promotions_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (1,1,'CLEARANCE SALE - GIÀY CHÍNH HÃNG',NULL,30.00,0.00,500000.00,'2026-05-13 00:00:00','2026-06-13 23:59:59',1,'2026-05-19 03:59:23','2026-05-19 03:59:23'),(7,2,'FLASHSALE25','Mã giảm giá cực sâu 25% áp dụng cho toàn bộ các dòng sản phẩm giày Sneaker dịp hè 2026.',25.00,600000.00,150000.00,'2026-06-01 00:00:00','2026-06-15 00:00:00',1,'2026-05-23 19:03:14','2026-06-11 20:22:43'),(8,2,'FLASHSALE30','Mã giảm giá cực sâu 30% áp dụng cho toàn bộ các dòng sản phẩm giày Sneaker dịp hè 2026.',30.00,600000.00,150000.00,'2026-06-01 00:00:00','2026-06-15 00:00:00',1,'2026-05-23 19:13:03','2026-06-12 06:52:43'),(11,2,'KM2026',NULL,15.00,50000.00,2000000.00,'2026-06-18 00:00:00','2026-12-30 00:00:00',1,'2026-06-18 15:07:40','2026-06-21 09:03:24'),(12,6,'KMM2106',NULL,20.00,100000.00,NULL,'2026-06-20 00:00:00','2026-12-30 00:00:00',1,'2026-06-20 10:21:41','2026-06-20 10:21:41'),(13,2,'KM1902','Giảm giá 1902 cực mạnh',25.00,200000.00,NULL,'2026-06-21 00:00:00','2026-12-20 00:00:00',1,'2026-06-21 09:04:55','2026-06-21 09:04:55');
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN'),(2,'MANAGER'),(4,'USER'),(3,'VENDOR');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_appeals`
--

DROP TABLE IF EXISTS `store_appeals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_appeals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `appeal_reason` text NOT NULL,
  `evidence_images` json DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `manager_note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `store_appeals_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_appeals`
--

LOCK TABLES `store_appeals` WRITE;
/*!40000 ALTER TABLE `store_appeals` DISABLE KEYS */;
INSERT INTO `store_appeals` VALUES (1,2,'Tôi xin cam kết gỡ bỏ toàn bộ mẫu giày Nike fake ra khỏi cửa hàng, mong ban quản trị mở lại shop.','[{\"public_id\": \"shoes_store_appeals/rjxmigex5m4fpz5zaf3z\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779714094/shoes_store_appeals/rjxmigex5m4fpz5zaf3z.jpg\"}]','approved','Hồ sơ hóa đơn đối soát chính hãng hợp lệ. Cảnh cáo Vendor không được tái phạm đăng bán sản phẩm không rõ nguồn gốc.','2026-05-25 13:01:35','2026-05-25 13:04:13'),(2,2,'Tôi xin cam kết gỡ bỏ toàn bộ mẫu giày Nike fake ra khỏi cửa hàng, mong ban quản trị mở lại shop.','[{\"public_id\": \"shoes_store_appeals/bszlhb2oe8gpccnil4lt\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779716378/shoes_store_appeals/bszlhb2oe8gpccnil4lt.jpg\"}]','approved','Hồ sơ hóa đơn đối soát chính hãng hợp lệ. Cảnh cáo Vendor không được tái phạm đăng bán sản phẩm không rõ nguồn gốc.','2026-05-25 13:39:39','2026-05-25 13:40:22'),(3,2,'Tôi xin cam kết gỡ bỏ toàn bộ mẫu giày Nike fake ra khỏi cửa hàng, mong ban quản trị mở lại shop.','[{\"public_id\": \"shoes_store_appeals/moux5rw32xbnc2cxfivh\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780086603/shoes_store_appeals/moux5rw32xbnc2cxfivh.jpg\"}]','approved','Hồ sơ hóa đơn đối soát chính hãng hợp lệ. Cảnh cáo Vendor không được tái phạm đăng bán sản phẩm không rõ nguồn gốc.','2026-05-29 20:30:04','2026-05-29 20:30:50'),(4,2,'Xin phép gỡ khóa','[{\"public_id\": \"shoes_store_appeals/fvczbspznsg7ob64xxun\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781600823/shoes_store_appeals/fvczbspznsg7ob64xxun.jpg\"}]','approved','Hãy xem kỹ lưỡng ','2026-06-16 09:07:05','2026-06-16 09:27:15');
/*!40000 ALTER TABLE `store_appeals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_reviews`
--

DROP TABLE IF EXISTS `store_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `store_id` int DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `is_active` tinyint(1) DEFAULT '1',
  `is_reported` tinyint(1) DEFAULT '0',
  `report_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `store_id` (`store_id`),
  KEY `fk_store_reviews_order` (`order_id`),
  CONSTRAINT `fk_store_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `store_reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `store_reviews_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  CONSTRAINT `store_reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_reviews`
--

LOCK TABLES `store_reviews` WRITE;
/*!40000 ALTER TABLE `store_reviews` DISABLE KEYS */;
INSERT INTO `store_reviews` VALUES (5,7,2,NULL,5,'Shop hỗ trợ tuyệt vời',1,0,NULL,'2026-06-08 12:58:48'),(6,7,2,NULL,5,'Shop hỗ trợ tuyệt vời',1,0,NULL,'2026-06-08 12:58:53'),(7,7,2,NULL,5,'Shop hỗ trợ tuyệt vời',1,1,'Nội dung không phù hợp, thiếu văn hóa','2026-06-08 13:04:38'),(8,7,2,NULL,5,'Chủ shop tư vấn size siêu nhiệt tình, đóng gói kỹ càng, 10 điểm không có nhưng!',1,1,'Đánh giá sai sự thật, mang tính vu khống','2026-06-08 15:12:41');
/*!40000 ALTER TABLE `store_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stores`
--

DROP TABLE IF EXISTS `stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `bio` text,
  `logo` json DEFAULT NULL,
  `banner` json DEFAULT NULL,
  `address` text,
  `balance` decimal(15,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `rating_average` decimal(3,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `commission_rate` decimal(5,2) NOT NULL DEFAULT '10.00' COMMENT 'Tỷ lệ % chiết khấu hoa hồng sàn thu trên mỗi đơn hàng thành công',
  `reject_reason` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `owner_id` (`owner_id`),
  CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stores`
--

LOCK TABLES `stores` WRITE;
/*!40000 ALTER TABLE `stores` DISABLE KEYS */;
INSERT INTO `stores` VALUES (1,3,'Sneaker World','Chuyên cung cấp giày chính hãng',NULL,NULL,NULL,5000000.00,1,4.75,'2026-05-19 03:58:28',10.00,NULL),(2,6,'Sneaker World Siêu Cấp Vip Pro','Chuyên phân phối các dòng giày Sneaker chính hãng Nike, Adidas, Jordan uy tín số 1.','{\"public_id\": \"shoes_store_profiles/kgvkrtulwb8cmughhrxv\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1782032175/shoes_store_profiles/kgvkrtulwb8cmughhrxv.jpg\"}','{\"public_id\": \"shoes_store_profiles/d7qix9wfw3m7eczaidov\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1782032176/shoes_store_profiles/d7qix9wfw3m7eczaidov.jpg\"}','466 Đường Lê Văn Việt, Phường Tăng Nhơn Phú A, Thành phố Thủ Đức, TP.HCM',7221250.00,1,4.88,'2026-05-21 02:40:02',10.00,NULL),(6,12,'Sneaker World Premium (huu)','Chuyên phân phối các dòng giày Sneaker chính hãng Nike, Adidas số n.','{\"public_id\": \"shoes_store_profiles/nw38tqkma3e8uqba2jcs\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1782032237/shoes_store_profiles/nw38tqkma3e8uqba2jcs.jpg\"}','{\"public_id\": \"shoes_store_profiles/vuafcnbkbis7zt9ctmfr\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1782032236/shoes_store_profiles/vuafcnbkbis7zt9ctmfr.jpg\"}','Quận Thủ Đức 1',0.00,1,0.00,'2026-05-23 12:55:35',10.00,NULL),(11,17,'Sneaker World Premium (tesst1)','Chuyên phân phối các dòng giày Sneaker chính hãng Nike, Adidas số n.','{\"public_id\": \"shoes_store_profiles/wg1wjsxvp85wl7umqhsv\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781445032/shoes_store_profiles/wg1wjsxvp85wl7umqhsv.jpg\"}','{\"public_id\": \"shoes_store_profiles/uiaot2cayvdglsqec4ay\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780081243/shoes_store_profiles/uiaot2cayvdglsqec4ay.jpg\"}','Quận Thủ Đức 3',0.00,1,0.00,'2026-05-29 19:00:46',10.00,NULL),(12,19,'Sneaker Heavy','Chuyên cung cấp các dòng sản phẩm Sneaker','{\"public_id\": \"shoes_store_profiles/eatie09hz6sunriewlad\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781013058/shoes_store_profiles/eatie09hz6sunriewlad.jpg\"}','{\"public_id\": \"shoes_store_profiles/pkxjabvth2kzzutdwanq\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781013059/shoes_store_profiles/pkxjabvth2kzzutdwanq.jpg\"}','331 Lê Duẩn, Phường 12, Quận Tân Bình, TP. HCM',0.00,1,0.00,'2026-06-09 13:51:01',8.00,NULL),(13,4,'Sneaker World Siêu Cấp Vip Pro 11111','',NULL,NULL,'31 Đống Đa, Phường 1, Quận Thủ Đức, TP. HCM',0.00,1,0.00,'2026-06-17 17:52:07',10.00,NULL);
/*!40000 ALTER TABLE `stores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int NOT NULL DEFAULT '1',
  `is_maintenance` tinyint(1) DEFAULT '0',
  `maintenance_message` text,
  `global_commission_rate` decimal(5,2) DEFAULT '10.00',
  `hotline` varchar(20) DEFAULT '19001000',
  `support_email` varchar(100) DEFAULT 'support@shoesshop.com',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `check_single_row` CHECK ((`id` = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,0,'Sàn bảo trì nâng cấp hệ thống',10.00,'19001000','admin@shoesshop.com','2026-05-26 02:12:44','2026-06-18 13:37:38');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int DEFAULT NULL,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `avatar` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_verified` tinyint(1) DEFAULT '0',
  `otp_code` varchar(10) DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `refresh_token` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_online` tinyint(1) DEFAULT '0',
  `last_active` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'Tổng Quản Trị','admin@gmail.com','hash_pass_123','0123456789',NULL,NULL,1,1,NULL,NULL,NULL,'2026-05-19 03:58:25',0,'2026-05-29 11:10:52'),(2,2,'Quản Lý Hệ Thống','manager@gmail.com','hash_pass_123','0987654321',NULL,NULL,1,1,NULL,NULL,NULL,'2026-05-19 03:58:25',0,'2026-05-29 11:10:52'),(3,3,'Chủ Shop Sneaker','vendor_giay@gmail.com','hash_pass_123','0911223344',NULL,NULL,1,1,NULL,NULL,NULL,'2026-05-19 03:58:25',0,'2026-05-29 11:10:52'),(4,4,'Nguyễn Văn Khách','khachhang@gmail.com','hash_pass_123','0900112233',NULL,NULL,1,1,NULL,NULL,NULL,'2026-05-19 03:58:25',0,'2026-05-29 11:10:52'),(6,3,'Ngọc Thiên (Kun)','caongocthien1902@gmail.com','$2b$08$Og4Z99qBauBxNwbMXj75NOdjCx0tX1/FGDR9qSvA07NifBVww/X.e','0378240911','Ngọc Lãng 1, Tuy Hòa, Phú Yên','{\"public_id\": \"shoes_store_avatars/oqmvmcpuflfbdwxy696x\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781264481/shoes_store_avatars/oqmvmcpuflfbdwxy696x.jpg\"}',1,1,'562809','2026-06-16 09:50:09','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJjYW9uZ29jdGhpZW4xOTAyQGdtYWlsLmNvbSIsInJvbGVJZCI6MywiaWF0IjoxNzgyMDM5NDkzLCJleHAiOjE3ODMyNDkwOTN9.JzyHLndKV7G-6xd2J4eVCy0Oi-05F5C49xcKPB5NZS8','2026-05-19 12:08:23',0,'2026-06-21 11:09:48'),(7,4,'Ngọc Thiênnn','23110332@student.hcmute.edu.vn','$2b$08$dz8FL2w..YwyipOu5chWbO.peUejPYvTk9yFvgoShhGIWJ3mBsYBS','0123456789','99 Lê Đại Hành, Phường 11, Quận 11, TP. HCM','{\"public_id\": \"shoes_store_avatars/xc4xeqzyeyfqbcqximpt\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780862310/shoes_store_avatars/xc4xeqzyeyfqbcqximpt.webp\"}',1,1,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZW1haWwiOiIyMzExMDMzMkBzdHVkZW50LmhjbXV0ZS5lZHUudm4iLCJyb2xlSWQiOjQsImlhdCI6MTc4MjA0MDQ1MywiZXhwIjoxNzgzMjUwMDUzfQ.i1Zz6DSa819oE7JxYDHcTrOWO-nPjNcUrRh6ZQJSEDM','2026-05-21 05:55:31',0,'2026-06-21 11:38:05'),(10,2,'Manager 1','manager1@gmail.com','$2b$10$AzR7yD8bZ2mOm0CefmXpG.Z7MdB7UoKj4D3QvZ9gqYm6Y9H6hK2gq','0987654321',NULL,'{\"public_id\": \"avatars/manager_default\", \"secure_url\": \"https://res.cloudinary.com/demo/image/upload/v123456/sample.jpg\"}',1,1,NULL,NULL,NULL,'2026-05-23 11:38:29',0,'2026-05-29 11:10:52'),(11,2,'Manager Ý','23521843@gm.uit.edu.vn','$2b$10$iHog8Ft12XKoDeswZh9cr.5wE4.k3MsJHePNHdMNITMLNgf/cApvq','0987654323','31 Đống Đa, Phường 1, Quận Thủ Đức, TP. HCM','{\"public_id\": \"shoes_store_avatars/n78tyzpuw5g9iszeo0ws\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781442576/shoes_store_avatars/n78tyzpuw5g9iszeo0ws.jpg\"}',1,1,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsImVtYWlsIjoiMjM1MjE4NDNAZ20udWl0LmVkdS52biIsInJvbGVJZCI6MiwiaWF0IjoxNzgyMDQwMTkyLCJleHAiOjE3ODMyNDk3OTJ9.N7yb-kDnLCcvM1IaLWzY2gMy17PxVqBjsdAk1-iDhVE','2026-05-23 11:39:59',0,'2026-06-21 11:11:54'),(12,3,'Manager Ý','ngochuunaksss@gmail.com','$2b$10$aPSveGIQgHhlrQp7fgWBqe12otG6Q5kwVcZTSvPJ8xPLOsSWZ0Ev.','0987654321','31 Đống Đa, Phường 1, Quận Thủ Đức, TP. HCM','{\"public_id\": \"shoes_store_avatars/frwdw7r4qut5nrd5hs7b\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781444787/shoes_store_avatars/frwdw7r4qut5nrd5hs7b.jpg\"}',1,1,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoibmdvY2h1dW5ha3Nzc0BnbWFpbC5jb20iLCJyb2xlSWQiOjMsImlhdCI6MTc4MjAzMjIxNiwiZXhwIjoxNzgzMjQxODE2fQ.VhBuF5PBSMe3R95D5To6Zrea9L2UDYJN5N2tSPayT10','2026-05-23 12:03:42',0,'2026-06-21 09:00:38'),(13,1,'Admin Toan','23110345@student.hcmute.edu.vn','$2b$08$A9UppNO/9pYL2XiRqW9gyeJ6lN9wQfnzT7BIEVnHMJwECPaUZzViS','0987654321','31 Đống Đa, Phường 1, Quận Thủ Đức, TP. HCM','{\"public_id\": \"shoes_store_avatars/keocawopzufqr9el4y0z\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781791821/shoes_store_avatars/keocawopzufqr9el4y0z.jpg\"}',1,1,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsImVtYWlsIjoiMjMxMTAzNDVAc3R1ZGVudC5oY211dGUuZWR1LnZuIiwicm9sZUlkIjoxLCJpYXQiOjE3ODIwNDAzMjAsImV4cCI6MTc4MzI0OTkyMH0.PKbpZAPbEmMBN4080B6z2JHCUiW2QkgZoAsIS-oKF1o','2026-05-25 06:36:59',0,'2026-06-21 11:14:08'),(17,3,'User1','user1@gmail.com','$2b$08$rPVENyWerX/FBIfQeVCxte3U3CDB7DU39bhnKPHvJImKJ.VjV/tL.','0911223344','Ngọc Lãng 2, Tuy Hòa, Phú Yên','{\"public_id\": \"shoes_store_avatars/gswx1v0acgrls77zicze\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781444868/shoes_store_avatars/gswx1v0acgrls77zicze.jpg\"}',1,1,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZUlkIjozLCJpYXQiOjE3ODE0NDUwMTgsImV4cCI6MTc4MjY1NDYxOH0.CHc1x94ux0JRjJIEGu1AbGix_2tjZP3X2-DOHSLLGFo','2026-05-29 18:59:59',0,'2026-06-14 13:53:30'),(19,4,'Hà Y Như Ý','nhuyhay2005@gmail.com','$2b$08$SvKWjVG.IMb7lIHTreTXnODw5P/x1pp4p4fiY5cEgdooA0x6Jik1G','0123456789','331 Lê Duẩn, Phường 12, Quận Tân Bình, TP. HCM','{\"public_id\": \"shoes_store_avatars/ifasbbvygzbk4omygjzz\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1781013015/shoes_store_avatars/ifasbbvygzbk4omygjzz.jpg\"}',1,1,NULL,NULL,NULL,'2026-06-04 10:33:59',0,'2026-06-20 08:14:21'),(23,4,'test','test@gmail.com','$2b$08$XwVXbO5J3UtVWS8RmccQ4.5wH9IL1K33DfqHx6h1JD3xZ2yKV9SU6','0987654321','466 Đường Lê Văn Việt, Phường Tăng Nhơn Phú A, Thành phố Thủ Đức, TP.HCM',NULL,1,1,NULL,NULL,NULL,'2026-06-20 08:29:25',0,'2026-06-20 08:30:31');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-21 18:54:18

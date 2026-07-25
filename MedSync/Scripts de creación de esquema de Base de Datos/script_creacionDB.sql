-- =====================================================================
-- CERSEU - FACULTY OF MEDICINE - UNMSM
-- UNIVERSITY EXTENSION COURSE MANAGEMENT SYSTEM
-- BLOCK 1: DATABASE SCHEMA GENERATION SCRIPT
-- DBMS: MySQL 8.0+
-- =====================================================================
 
-- Create application user
DROP USER IF EXISTS 'cerseu_admin'@'localhost';
CREATE USER 'cerseu_admin'@'localhost' IDENTIFIED BY 'cerseu2026';
 
-- Grant privileges over the project database
GRANT ALL PRIVILEGES ON cerseu_med.* TO 'cerseu_admin'@'localhost';
 
-- Apply changes
FLUSH PRIVILEGES;
 
-- Create and select the database
DROP DATABASE IF EXISTS cerseu_med;
CREATE DATABASE cerseu_med
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE cerseu_med;
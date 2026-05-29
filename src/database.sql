CREATE DATABASE IF NOT EXISTS corp_system;
USE corp_system;

-- 1. Tabel Departemen
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL
);

-- 2. Tabel Karyawan (Master Employee)
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nik VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    role VARCHAR(50),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    signature LONGTEXT
);

-- 3. Tabel Berita (News)
CREATE TABLE news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    content TEXT,
    date DATE,
    author VARCHAR(100),
    image LONGTEXT, -- Untuk menyimpan Base64
    modify_date DATETIME,
    modify_by VARCHAR(100)
);

-- 4. Tabel Formulir & Prosedur
CREATE TABLE procedures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    category ENUM('Form', 'Prosedur'),
    type VARCHAR(10),
    size VARCHAR(20),
    description TEXT,
    attachment JSON, -- Menyimpan metadata file
    modify_date DATETIME,
    modify_by VARCHAR(100)
);

-- 5. Tabel Tipe Approval
CREATE TABLE approval_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10),
    name VARCHAR(100)
);

-- 6. Tabel Routing Approval
CREATE TABLE routings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    approval_type VARCHAR(100),
    department VARCHAR(100),
    path JSON -- Menyimpan array tingkat approval
);

-- 7. Tabel Transaksi Approval
CREATE TABLE approvals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(100),
    requester VARCHAR(100),
    description TEXT,
    status ENUM('Pending', 'Approved', 'Rejected', 'Hold') DEFAULT 'Pending',
    date DATE,
    current_step_index INT DEFAULT 0,
    path JSON,
    attachment JSON,
    last_comment TEXT,
    amount DECIMAL(15, 2) DEFAULT 0,
    gl_account VARCHAR(50),
    cost_center VARCHAR(50)
);

-- 8. Tabel Audit Logs
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    modify_date DATETIME,
    modify_by VARCHAR(100),
    action_type VARCHAR(50),
    menu_asal VARCHAR(100),
    description TEXT
);

-- 9. Tabel Hak Akses (Role Access)
CREATE TABLE role_access (
    role_name VARCHAR(50),
    menu_id VARCHAR(100),
    PRIMARY KEY (role_name, menu_id)
);

-- Tambahkan tabel Master baru yang mungkin belum ada di file backend
CREATE TABLE IF NOT EXISTS gl_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    modify_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    modify_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS cost_centers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    modify_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    modify_by VARCHAR(100)
);

-- 12. Tabel Kalender Event
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time VARCHAR(10), -- format HH:mm
    color VARCHAR(20) DEFAULT 'indigo',
    modify_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    modify_by VARCHAR(100)
);

-- (Gunakan data INSERT yang sama seperti di file corp-system/src/database.sql untuk mengisi datanya)
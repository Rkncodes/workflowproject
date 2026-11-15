-- ==========================================================
-- CivicFlow – Municipal Building Permit Management System
-- Database Schema (MySQL 8.0)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS civicflow_db;
USE civicflow_db;

-- 1. Users table (Citizen/Architect, Officers, Admin)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role ENUM('APPLICANT', 'OFFICER', 'ADMIN') NOT NULL,
    department ENUM('FIRE_SAFETY', 'WATER', 'ZONING', 'ENVIRONMENTAL', 'NONE') DEFAULT 'NONE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Applications table
CREATE TABLE IF NOT EXISTS applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_number VARCHAR(64) NOT NULL UNIQUE,
    applicant_id BIGINT NOT NULL,
    project_name VARCHAR(150) NOT NULL,
    applicant_type ENUM('INDIVIDUAL', 'ARCHITECT', 'COMPANY') NOT NULL,
    property_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    pin_code VARCHAR(20) NOT NULL,
    survey_number VARCHAR(50) NOT NULL,
    plot_area DOUBLE NOT NULL,
    building_type ENUM('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL') NOT NULL,
    number_of_floors INT NOT NULL,
    proposed_building_area DOUBLE NOT NULL,
    status ENUM('SUBMITTED', 'UNDER_VERIFICATION', 'DEPARTMENTAL_REVIEW', 'REVISION_REQUIRED', 'PENDING_PAYMENT', 'PAYMENT_COMPLETED', 'PERMIT_ISSUED', 'REJECTED') DEFAULT 'SUBMITTED',
    current_stage VARCHAR(100) DEFAULT 'Application Submitted',
    camunda_process_instance_key BIGINT,
    revision_count INT DEFAULT 0,
    max_revisions INT DEFAULT 3,
    land_verification_status ENUM('PENDING', 'VALID', 'INVALID') DEFAULT 'PENDING',
    land_verification_remarks TEXT,
    calculated_fee DOUBLE DEFAULT 0.0,
    permit_number VARCHAR(100),
    is_overdue BOOLEAN DEFAULT FALSE,
    overdue_departments VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Documents table
CREATE TABLE IF NOT EXISTS documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    document_type ENUM('BUILDING_BLUEPRINT', 'LAND_OWNERSHIP_CERTIFICATE', 'SITE_PLAN', 'STRUCTURAL_STABILITY_CERTIFICATE', 'IDENTITY_PROOF', 'REVISED_BLUEPRINT') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- 4. Department Reviews table (Fire, Water, Zoning, Environmental)
CREATE TABLE IF NOT EXISTS department_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    department ENUM('FIRE_SAFETY', 'WATER', 'ZONING', 'ENVIRONMENTAL') NOT NULL,
    officer_id BIGINT,
    officer_name VARCHAR(100),
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED') DEFAULT 'PENDING',
    comments TEXT,
    camunda_task_id VARCHAR(100),
    reviewed_at TIMESTAMP NULL,
    is_overdue BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Payments table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    amount DOUBLE NOT NULL,
    payment_method ENUM('CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'UPI', 'MOCK_GATEWAY') DEFAULT 'MOCK_GATEWAY',
    payment_status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
    payment_date TIMESTAMP NULL,
    receipt_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- 6. Permits table
CREATE TABLE IF NOT EXISTS permits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE,
    permit_number VARCHAR(100) NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    digital_signature VARCHAR(255) NOT NULL,
    pdf_file_path VARCHAR(500),
    qr_code_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- 7. Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    user_role VARCHAR(50),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL
);

-- 8. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    application_id BIGINT,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    notification_type ENUM('INFO', 'APPROVAL', 'REJECTION', 'REVISION', 'ESCALATION', 'PAYMENT', 'PERMIT') DEFAULT 'INFO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);


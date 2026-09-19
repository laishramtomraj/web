-- ==========================================================
-- ResourceMatch AI - Enterprise MySQL 8.0 Database Schema
-- ==========================================================

CREATE TABLE IF NOT EXISTS organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL DEFAULT 'Non-Profit',
    contact_email VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_org_type (type),
    INDEX idx_org_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'coordinator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_user_org (organization_id),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS resource_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    `condition` VARCHAR(50) NOT NULL DEFAULT 'Good',
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, MATCHED, TRANSFERRED, RESERVED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_resource_category (category),
    INDEX idx_resource_subcategory (subcategory),
    INDEX idx_resource_status (status),
    INDEX idx_resource_org (organization_id),
    INDEX idx_resource_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    urgency VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
    deadline DATE NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, MATCHED, FULFILLED, CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_request_category (category),
    INDEX idx_request_subcategory (subcategory),
    INDEX idx_request_urgency (urgency),
    INDEX idx_request_status (status),
    INDEX idx_request_deadline (deadline),
    INDEX idx_request_org (organization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resource_id INT NOT NULL,
    request_id INT NOT NULL,
    match_score INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'RECOMMENDED', -- RECOMMENDED, ACCEPTED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    INDEX idx_match_score (match_score),
    INDEX idx_match_resource (resource_id),
    INDEX idx_match_request (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resource_id INT NOT NULL,
    request_id INT NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED', -- SCHEDULED, IN_TRANSIT, COMPLETED, CANCELLED
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE RESTRICT,
    INDEX idx_transfer_status (status),
    INDEX idx_transfer_date (transfer_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_analytics_event (event_type),
    INDEX idx_analytics_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

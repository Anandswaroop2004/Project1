-- =========================================================================
-- Military Asset Management System (MAMS) - Database Schema and Seed Data
-- Database: MySQL 8.0+
-- =========================================================================

CREATE DATABASE IF NOT EXISTS military_asset_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE military_asset_db;

-- 1. Military Bases Table
CREATE TABLE IF NOT EXISTS military_bases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    commanding_officer VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    military_rank VARCHAR(50) NOT NULL,
    service_number VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL, -- 'ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'
    base_id BIGINT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (base_id) REFERENCES military_bases(id) ON DELETE SET NULL
);

-- 3. Asset Categories Table
CREATE TABLE IF NOT EXISTS asset_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category_id BIGINT NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'Units',
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    is_expendable BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES asset_categories(id)
);

-- 5. Base Inventories Table (Main tracking for Opening, Net Movements, Assigned, Expended, Closing)
CREATE TABLE IF NOT EXISTS base_inventories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_id BIGINT NOT NULL,
    asset_id BIGINT NOT NULL,
    opening_balance INT NOT NULL DEFAULT 0,
    current_balance INT NOT NULL DEFAULT 0,
    assigned_quantity INT NOT NULL DEFAULT 0,
    expended_quantity INT NOT NULL DEFAULT 0,
    total_purchased INT NOT NULL DEFAULT 0,
    total_transferred_in INT NOT NULL DEFAULT 0,
    total_transferred_out INT NOT NULL DEFAULT 0,
    closing_balance INT NOT NULL DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_base_asset (base_id, asset_id),
    FOREIGN KEY (base_id) REFERENCES military_bases(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- 6. Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_number VARCHAR(50) NOT NULL UNIQUE,
    base_id BIGINT NOT NULL,
    asset_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_cost DECIMAL(12, 2) NOT NULL,
    total_cost DECIMAL(14, 2) NOT NULL,
    supplier VARCHAR(100) NOT NULL,
    purchase_date DATETIME NOT NULL,
    received_by_user_id BIGINT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (base_id) REFERENCES military_bases(id),
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (received_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. Transfers Table
CREATE TABLE IF NOT EXISTS transfers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transfer_number VARCHAR(50) NOT NULL UNIQUE,
    source_base_id BIGINT NOT NULL,
    destination_base_id BIGINT NOT NULL,
    asset_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED', -- 'PENDING_DISPATCH', 'IN_TRANSIT', 'COMPLETED', 'REJECTED'
    initiated_by_user_id BIGINT NULL,
    received_by_user_id BIGINT NULL,
    dispatched_at DATETIME NOT NULL,
    completed_at DATETIME NULL,
    reason_or_mission TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_base_id) REFERENCES military_bases(id),
    FOREIGN KEY (destination_base_id) REFERENCES military_bases(id),
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (initiated_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (received_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 8. Asset Assignments Table
CREATE TABLE IF NOT EXISTS asset_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_code VARCHAR(50) NOT NULL UNIQUE,
    base_id BIGINT NOT NULL,
    asset_id BIGINT NOT NULL,
    assigned_to_name VARCHAR(100) NOT NULL,
    assigned_to_rank VARCHAR(50) NOT NULL,
    assigned_to_service_id VARCHAR(50) NOT NULL,
    unit_or_squadron VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    assigned_date DATETIME NOT NULL,
    expected_return_date DATE NULL,
    returned_date DATETIME NULL,
    condition_on_issue VARCHAR(50) NOT NULL DEFAULT 'EXCELLENT',
    condition_on_return VARCHAR(50) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'RETURNED', 'LOST_OR_DAMAGED'
    assigned_by_user_id BIGINT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (base_id) REFERENCES military_bases(id),
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (assigned_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 9. Asset Expenditures Table (Track expended ammunition, fuel, disposable gear)
CREATE TABLE IF NOT EXISTS asset_expenditures (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    expenditure_code VARCHAR(50) NOT NULL UNIQUE,
    base_id BIGINT NOT NULL,
    asset_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    expended_date DATETIME NOT NULL,
    mission_or_exercise VARCHAR(150) NOT NULL,
    authorized_officer VARCHAR(100) NOT NULL,
    recorded_by_user_id BIGINT NULL,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (base_id) REFERENCES military_bases(id),
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 10. Audit Logs Table (Logging all transactional and security operations)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NULL,
    username VARCHAR(50) NOT NULL,
    role VARCHAR(30) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NULL,
    details TEXT,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1'
);

-- =========================================================================
-- Realistic Military Seed Data
-- =========================================================================

-- Insert Military Bases
INSERT INTO military_bases (id, code, name, location, commanding_officer, status) VALUES
(1, 'BASE-LIBERTY', 'Fort Liberty Command', 'Fayetteville, North Carolina', 'Gen. Marcus Vance', 'ACTIVE'),
(2, 'BASE-PENDLETON', 'Camp Pendleton Marine Base', 'Oceanside, California', 'Col. Sarah Jenkins', 'ACTIVE'),
(3, 'BASE-NELLIS', 'Nellis Strategic Air Base', 'Clark County, Nevada', 'Maj. Gen. David Sterling', 'ACTIVE'),
(4, 'BASE-RAMSTEIN', 'Ramstein Allied Support Base', 'Rhineland-Palatinate, Germany', 'Brig. Gen. Elena Rostova', 'ACTIVE'),
(5, 'BASE-NORFOLK', 'Naval Station Norfolk Command', 'Norfolk, Virginia', 'Rear Adm. Thomas Blake', 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Password for all default accounts is 'Admin@123' or 'Password@123'
-- BCrypt hash for 'Admin@123': $2a$10$9vE9Y0o7rB.Q2o2y4z.UweaFh1uVj1rKqgA6cM7p5oR/J2aO1qfKC (or we update from Spring Boot)
-- We will use a standard BCrypt hash for 'admin123' / 'password123': $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a (admin123)
-- And $2a$10$eACCYoNOHEqgkHgk.I5yiuBfMvA7lOq3eE7W9VzR6m1VzK6/jJcKi (password123)

INSERT INTO users (id, username, password, full_name, military_rank, service_number, email, role, base_id, status) VALUES
(1, 'admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Gen. Alexander Hayes', 'General (4-Star)', 'DOD-HQ-001', 'admin@mams.mil', 'ADMIN', NULL, 'ACTIVE'),
(2, 'commander_liberty', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Gen. Marcus Vance', 'Lieutenant General', 'USA-LIB-104', 'vance.m@liberty.mil', 'BASE_COMMANDER', 1, 'ACTIVE'),
(3, 'commander_pendleton', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Col. Sarah Jenkins', 'Colonel', 'USMC-PEN-209', 'jenkins.s@pendleton.mil', 'BASE_COMMANDER', 2, 'ACTIVE'),
(4, 'logistics_liberty', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Maj. Robert Evans', 'Major', 'USA-LOG-512', 'evans.r@logistics.mil', 'LOGISTICS_OFFICER', 1, 'ACTIVE'),
(5, 'logistics_pendleton', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Capt. Emily Rodriguez', 'Captain', 'USMC-LOG-881', 'rodriguez.e@logistics.mil', 'LOGISTICS_OFFICER', 2, 'ACTIVE'),
(6, 'commander_nellis', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Maj. Gen. David Sterling', 'Major General', 'USAF-NEL-303', 'sterling.d@nellis.mil', 'BASE_COMMANDER', 3, 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Insert Categories
INSERT INTO asset_categories (id, name, code, description) VALUES
(1, 'Weapons', 'CAT-WPN', 'Assault rifles, carbines, sniper platforms, tactical sidearms, and crew-served heavy weapons'),
(2, 'Vehicles', 'CAT-VEH', 'Armored fighting vehicles, main battle tanks, Joint Light Tactical Vehicles, and troop transports'),
(3, 'Ammunition', 'CAT-AMM', 'Live munitions, high-explosive artillery rounds, guided anti-tank missiles, and small-caliber cartridges'),
(4, 'Tactical Communications', 'CAT-COM', 'Multiband cryptographic radios, satellite uplinks, mesh networking nodes, and command terminals'),
(5, 'Aviation & UAVs', 'CAT-AIR', 'Tactical reconnaissance drones, electronic surveillance UAVs, transport helicopters, and attack platforms'),
(6, 'Heavy Equipment', 'CAT-HEV', 'Mobile radar stations, field generators, armored recovery systems, and engineering logistics gear')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Assets
INSERT INTO assets (id, asset_code, name, category_id, unit_of_measure, unit_price, description, is_expendable) VALUES
(1, 'WPN-M4A1-TAC', 'M4A1 Tactical Carbine 5.56mm', 1, 'Units', 1450.00, 'Standard infantry service rifle with optical rail and selector switch.', FALSE),
(2, 'WPN-M240B-MG', 'M240B Medium Machine Gun 7.62mm', 1, 'Units', 6800.00, 'Crew-served gas-operated machine gun for high-volume suppressing fire.', FALSE),
(3, 'WPN-BARRETT-M82', 'Barrett M82A1 .50 BMG Anti-Materiel', 1, 'Units', 11200.00, 'Long-range precision heavy rifle for anti-equipment and defensive operations.', FALSE),
(4, 'VEH-JLTV-ARM', 'Joint Light Tactical Vehicle (JLTV)', 2, 'Vehicles', 385000.00, '4x4 heavily armored tactical vehicle with integrated blast protection.', FALSE),
(5, 'VEH-M2A3-BRADLEY', 'M2A3 Bradley Infantry Fighting Vehicle', 2, 'Vehicles', 3200000.00, 'Tracked armored combat vehicle equipped with 25mm Bushmaster autocannon & TOW missiles.', FALSE),
(6, 'VEH-M1A2-SEP3', 'M1A2 Abrams SEPv3 Main Battle Tank', 2, 'Vehicles', 9800000.00, 'Third-generation main battle tank with 120mm smoothbore cannon and reactive armor.', FALSE),
(7, 'AMM-556-NATO', '5.56x45mm NATO Ball M855A1 (10,000 Rds)', 3, 'Crates', 4500.00, 'High-velocity enhanced performance infantry ammunition crate.', TRUE),
(8, 'AMM-762-LINKED', '7.62x51mm NATO Linked Belts (5,000 Rds)', 3, 'Crates', 3800.00, 'Belted ammunition for vehicle and infantry medium machine gun emplacements.', TRUE),
(9, 'AMM-JAVELIN-MSL', 'FGM-148 Javelin Anti-Tank Missile', 3, 'Missiles', 178000.00, 'Fire-and-forget man-portable lock-on top-attack anti-armor missile round.', TRUE),
(10, 'COM-PRC-152A', 'AN/PRC-152A Handheld Tactical Radio', 4, 'Units', 6200.00, 'Type-1 encrypted multiband handheld transceiver with GPS and satellite capability.', FALSE),
(11, 'COM-SAT-TERMV3', 'Mil-Satcom Tactical Command Terminal', 4, 'Systems', 48000.00, 'High-bandwidth portable satellite ground station for battlefield command networking.', FALSE),
(12, 'AIR-MQ9-REAPER', 'MQ-9 Reaper Tactical Strike UAV', 5, 'Aircraft', 16500000.00, 'Remotely piloted aircraft system for intelligence, surveillance, and precision strikes.', FALSE),
(13, 'AIR-BLACKHAWK-UH60', 'UH-60M Black Hawk Utility Helicopter', 5, 'Aircraft', 21000000.00, 'Four-blade, twin-engine medium-lift tactical transport and assault helicopter.', FALSE),
(14, 'HEV-GEN-60KW', '60kW Tactical Quiet Generator Plant', 6, 'Units', 24500.00, 'Ruggedized mobile diesel generator for command centers and radar arrays.', FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Base Inventories Initial Population
-- Fort Liberty (Base 1)
INSERT INTO base_inventories (base_id, asset_id, opening_balance, total_purchased, total_transferred_in, total_transferred_out, assigned_quantity, expended_quantity, closing_balance, current_balance) VALUES
(1, 1, 350, 80, 20, 15, 65, 0, 435, 370), -- M4A1
(1, 2, 45, 10, 5, 2, 12, 0, 58, 46),     -- M240B
(1, 4, 30, 8, 4, 2, 10, 0, 40, 30),       -- JLTV
(1, 5, 14, 2, 0, 1, 4, 0, 15, 11),        -- Bradley
(1, 7, 200, 50, 10, 20, 0, 45, 195, 195),  -- 5.56 Ammo
(1, 9, 35, 10, 0, 5, 0, 8, 32, 32),       -- Javelin
(1, 10, 120, 30, 15, 10, 42, 0, 155, 113),-- Radio
(1, 12, 6, 2, 0, 1, 2, 0, 7, 5)           -- MQ9 Reaper
ON DUPLICATE KEY UPDATE closing_balance=VALUES(closing_balance);

-- Camp Pendleton (Base 2)
INSERT INTO base_inventories (base_id, asset_id, opening_balance, total_purchased, total_transferred_in, total_transferred_out, assigned_quantity, expended_quantity, closing_balance, current_balance) VALUES
(2, 1, 280, 50, 15, 10, 50, 0, 335, 285), -- M4A1
(2, 2, 35, 8, 2, 0, 8, 0, 45, 37),        -- M240B
(2, 3, 12, 4, 0, 1, 3, 0, 15, 12),        -- Barrett
(2, 4, 24, 6, 2, 0, 6, 0, 32, 26),        -- JLTV
(2, 7, 180, 40, 20, 5, 0, 30, 205, 205),   -- 5.56 Ammo
(2, 8, 90, 20, 5, 0, 0, 15, 100, 100),    -- 7.62 Ammo
(2, 10, 95, 20, 10, 5, 30, 0, 120, 90),   -- Radio
(2, 13, 8, 2, 0, 0, 3, 0, 10, 7)          -- Blackhawk
ON DUPLICATE KEY UPDATE closing_balance=VALUES(closing_balance);

-- Nellis Air Base (Base 3)
INSERT INTO base_inventories (base_id, asset_id, opening_balance, total_purchased, total_transferred_in, total_transferred_out, assigned_quantity, expended_quantity, closing_balance, current_balance) VALUES
(3, 1, 150, 30, 5, 0, 25, 0, 185, 160),
(3, 10, 80, 15, 5, 0, 20, 0, 100, 80),
(3, 11, 10, 2, 1, 0, 3, 0, 13, 10),
(3, 12, 12, 4, 1, 0, 4, 0, 17, 13),
(3, 14, 18, 5, 0, 0, 4, 0, 23, 19)
ON DUPLICATE KEY UPDATE closing_balance=VALUES(closing_balance);

-- Ramstein (Base 4)
INSERT INTO base_inventories (base_id, asset_id, opening_balance, total_purchased, total_transferred_in, total_transferred_out, assigned_quantity, expended_quantity, closing_balance, current_balance) VALUES
(4, 1, 200, 40, 10, 5, 40, 0, 245, 205),
(4, 4, 18, 4, 1, 0, 5, 0, 23, 18),
(4, 7, 150, 30, 5, 0, 0, 20, 165, 165),
(4, 10, 70, 15, 5, 2, 22, 0, 88, 66),
(4, 13, 6, 2, 0, 0, 2, 0, 8, 6)
ON DUPLICATE KEY UPDATE closing_balance=VALUES(closing_balance);

-- Norfolk (Base 5)
INSERT INTO base_inventories (base_id, asset_id, opening_balance, total_purchased, total_transferred_in, total_transferred_out, assigned_quantity, expended_quantity, closing_balance, current_balance) VALUES
(5, 1, 180, 25, 5, 0, 30, 0, 210, 180),
(5, 2, 25, 5, 0, 0, 6, 0, 30, 24),
(5, 10, 60, 10, 0, 0, 15, 0, 70, 55),
(5, 11, 8, 3, 0, 0, 2, 0, 11, 9)
ON DUPLICATE KEY UPDATE closing_balance=VALUES(closing_balance);

-- Insert Purchases
INSERT INTO purchases (id, purchase_order_number, base_id, asset_id, quantity, unit_cost, total_cost, supplier, purchase_date, received_by_user_id, status, notes) VALUES
(1, 'PO-2026-MIL-8001', 1, 1, 80, 1450.00, 116000.00, 'Colt Defense Corp', '2026-08-15 09:30:00', 4, 'RECEIVED', 'Procured standard issue rifles for 82nd Airborne Division rotation.'),
(2, 'PO-2026-MIL-8002', 1, 4, 8, 385000.00, 3080000.00, 'Oshkosh Defense LLC', '2026-08-20 11:15:00', 4, 'RECEIVED', 'New JLTV variant with upgraded composite armor plates.'),
(3, 'PO-2026-MIL-8003', 1, 7, 50, 4500.00, 225000.00, 'Lake City Army Ammunition Plant', '2026-08-25 14:00:00', 4, 'RECEIVED', 'Q3 regular ammunition replenishment for training and operational reserve.'),
(4, 'PO-2026-MIL-8004', 2, 1, 50, 1450.00, 72500.00, 'Colt Defense Corp', '2026-08-28 10:00:00', 5, 'RECEIVED', 'Marine Expeditionary Unit tactical weapons modernization.'),
(5, 'PO-2026-MIL-8005', 2, 7, 40, 4500.00, 180000.00, 'Winchester Defense Munitions', '2026-09-02 13:45:00', 5, 'RECEIVED', 'Live fire training stockpile for Camp Pendleton ranges.'),
(6, 'PO-2026-MIL-8006', 3, 12, 4, 16500000.00, 66000000.00, 'General Atomics Aeronautical', '2026-09-05 08:30:00', 6, 'RECEIVED', 'Reaper Block 5 UAV addition for Red Flag joint tactical exercise.'),
(7, 'PO-2026-MIL-8007', 4, 10, 15, 6200.00, 93000.00, 'L3Harris Tactical Communications', '2026-09-10 15:20:00', 1, 'RECEIVED', 'Secure encrypted VHF/UHF tactical radio transceivers.')
ON DUPLICATE KEY UPDATE purchase_order_number=VALUES(purchase_order_number);

-- Insert Transfers
INSERT INTO transfers (id, transfer_number, source_base_id, destination_base_id, asset_id, quantity, status, initiated_by_user_id, received_by_user_id, dispatched_at, completed_at, reason_or_mission) VALUES
(1, 'TRF-2026-9001', 1, 2, 1, 15, 'COMPLETED', 4, 5, '2026-09-01 08:00:00', '2026-09-02 16:30:00', 'Inter-base support for joint USMC/Army rapid deployment training.'),
(2, 'TRF-2026-9002', 2, 1, 7, 20, 'COMPLETED', 5, 4, '2026-09-04 10:00:00', '2026-09-05 14:00:00', 'Ammo balance re-allocation due to impending exercise at Fort Liberty.'),
(3, 'TRF-2026-9003', 1, 3, 10, 5, 'COMPLETED', 4, 6, '2026-09-08 11:30:00', '2026-09-09 12:00:00', 'Transfer of cryptographic communications units for airbase security squad.'),
(4, 'TRF-2026-9004', 1, 4, 4, 1, 'COMPLETED', 4, 1, '2026-09-12 09:00:00', '2026-09-14 18:00:00', 'Airlift deployment of armored JLTV to Ramstein for NATO logistics inspection.'),
(5, 'TRF-2026-9005', 2, 4, 10, 5, 'COMPLETED', 5, 1, '2026-09-18 13:00:00', '2026-09-20 15:30:00', 'Allied communication protocol integration support.')
ON DUPLICATE KEY UPDATE transfer_number=VALUES(transfer_number);

-- Insert Asset Assignments
INSERT INTO asset_assignments (id, assignment_code, base_id, asset_id, assigned_to_name, assigned_to_rank, assigned_to_service_id, unit_or_squadron, quantity, assigned_date, expected_return_date, condition_on_issue, status, assigned_by_user_id, notes) VALUES
(1, 'ASG-2026-101', 1, 1, 'Staff Sgt. Nathan Cole', 'Staff Sergeant', 'USA-INF-4482', '82nd Airborne Division / 2nd Brigade', 1, '2026-09-01 09:00:00', '2026-10-01', 'EXCELLENT', 'ACTIVE', 2, 'Primary weapon issued for field deployment.'),
(2, 'ASG-2026-102', 1, 4, '1st Lt. Andrea Gomez', '1st Lieutenant', 'USA-ARM-1193', '3rd Armored Cavalry Recon Unit', 1, '2026-09-03 10:30:00', '2026-11-15', 'EXCELLENT', 'ACTIVE', 2, 'Command JLTV vehicle assigned for tactical reconnaissance.'),
(3, 'ASG-2026-103', 1, 10, 'Sgt. Lucas Vance', 'Sergeant', 'USA-SIG-7721', 'Signal Intelligence Detachment Delta', 2, '2026-09-05 14:00:00', '2026-09-30', 'EXCELLENT', 'ACTIVE', 4, 'Encrypted handheld radios for perimeter surveillance.'),
(4, 'ASG-2026-104', 2, 1, 'Cpl. Jason Taylor', 'Corporal', 'USMC-INF-9820', '1st Marine Division / Charlie Company', 1, '2026-09-06 08:00:00', '2026-10-15', 'EXCELLENT', 'ACTIVE', 3, 'Standard weapon issue for amphibious training detachment.'),
(5, 'ASG-2026-105', 2, 2, 'Gunnery Sgt. Derek Hall', 'Gunnery Sergeant', 'USMC-WEP-3310', 'Heavy Weapons Platoon', 1, '2026-09-08 11:00:00', '2026-10-30', 'EXCELLENT', 'ACTIVE', 3, 'Medium machine gun for tactical support post.')
ON DUPLICATE KEY UPDATE assignment_code=VALUES(assignment_code);

-- Insert Asset Expenditures
INSERT INTO asset_expenditures (id, expenditure_code, base_id, asset_id, quantity, expended_date, mission_or_exercise, authorized_officer, recorded_by_user_id, remarks) VALUES
(1, 'EXP-2026-501', 1, 7, 30, '2026-09-05 16:00:00', 'Exercise Iron Saber - Infantry Marksmanship Qualification', 'Gen. Marcus Vance', 4, '300,000 rounds of 5.56mm expended across 4 battalions with 98% qualification rate.'),
(2, 'EXP-2026-502', 1, 9, 4, '2026-09-10 14:30:00', 'Operation Northern Strike - Heavy Armor Denial Drill', 'Gen. Marcus Vance', 4, '4 Javelin missiles fired against remote target tanks. 4 direct hits confirmed.'),
(3, 'EXP-2026-503', 2, 7, 20, '2026-09-12 11:00:00', 'Exercise Steel Knight - Live Fire Assault Course', 'Col. Sarah Jenkins', 5, '200,000 rounds expended during combined arms assault simulations.'),
(4, 'EXP-2026-504', 2, 8, 10, '2026-09-15 15:45:00', 'Camp Pendleton Heavy Gunner Range Certification', 'Col. Sarah Jenkins', 5, 'M240B continuous suppressive fire training drills.')
ON DUPLICATE KEY UPDATE expenditure_code=VALUES(expenditure_code);

-- Insert Initial Audit Logs
INSERT INTO audit_logs (timestamp, user_id, username, role, action, entity_name, entity_id, details, ip_address) VALUES
('2026-08-15 09:30:00', 4, 'logistics_liberty', 'LOGISTICS_OFFICER', 'PURCHASE_RECORDED', 'Purchase', 'PO-2026-MIL-8001', 'Recorded purchase of 80 units of M4A1 Tactical Carbine from Colt Defense Corp.', '127.0.0.1'),
('2026-08-20 11:15:00', 4, 'logistics_liberty', 'LOGISTICS_OFFICER', 'PURCHASE_RECORDED', 'Purchase', 'PO-2026-MIL-8002', 'Recorded purchase of 8 units of JLTV from Oshkosh Defense LLC.', '127.0.0.1'),
('2026-09-01 08:00:00', 4, 'logistics_liberty', 'LOGISTICS_OFFICER', 'TRANSFER_INITIATED', 'Transfer', 'TRF-2026-9001', 'Dispatched 15 units of M4A1 Carbine from Fort Liberty to Camp Pendleton.', '127.0.0.1'),
('2026-09-02 16:30:00', 5, 'logistics_pendleton', 'LOGISTICS_OFFICER', 'TRANSFER_COMPLETED', 'Transfer', 'TRF-2026-9001', 'Received and verified 15 units of M4A1 Carbine at Camp Pendleton.', '127.0.0.1'),
('2026-09-05 16:00:00', 4, 'logistics_liberty', 'LOGISTICS_OFFICER', 'ASSET_EXPENDED', 'Expenditure', 'EXP-2026-501', 'Recorded expenditure of 30 crates of 5.56mm Ammo for Exercise Iron Saber.', '127.0.0.1')
ON DUPLICATE KEY UPDATE details=VALUES(details);

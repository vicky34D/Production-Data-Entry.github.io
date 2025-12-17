-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'staff', -- 'admin', 'staff'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Raw Materials Inventory
CREATE TABLE IF NOT EXISTS raw_materials (
    id SERIAL PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- 'Bamboo', 'Charcoal', 'Jigat', 'Essential Oil'
    current_stock DECIMAL(10, 2) DEFAULT 0.00,
    unit VARCHAR(20) DEFAULT 'kg',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Formulations (Recipes)
CREATE TABLE IF NOT EXISTS formulations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50), -- 'Flora', 'Masala', 'Dipped'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Production Batches
CREATE TABLE IF NOT EXISTS production_batches (
    id SERIAL PRIMARY KEY,
    batch_code VARCHAR(50) UNIQUE NOT NULL,
    formulation_id INTEGER REFERENCES formulations(id),
    status VARCHAR(50) DEFAULT 'Planned', -- 'Planned', 'Mixing', 'Rolling', 'Drying', 'Packing', 'Completed'
    target_quantity DECIMAL(10, 2),
    produced_quantity DECIMAL(10, 2) DEFAULT 0,
    start_date TIMESTAMP,
    end_date TIMESTAMP
);

-- Daily Work Logs (Worker Output)
CREATE TABLE IF NOT EXISTS daily_logs (
    id SERIAL PRIMARY KEY,
    worker_name VARCHAR(100),
    activity VARCHAR(50), -- 'Rolling', 'Packing'
    quantity DECIMAL(10, 2),
    date DATE DEFAULT CURRENT_DATE
);

-- Initial Seed Data (Optional - prevents empty app on first run)
INSERT INTO raw_materials (item_code, name, category, current_stock, unit) VALUES
('RM-001', 'Bamboo Sticks (8 inch)', 'Bamboo', 5000.00, 'kg'),
('RM-002', 'Charcoal Powder', 'Charcoal', 2000.00, 'kg'),
('RM-003', 'Jigat Powder', 'Jigat', 800.00, 'kg'),
('RM-004', 'Sandalwood Oil', 'Essential Oil', 50.00, 'liters')
ON CONFLICT (item_code) DO NOTHING;

INSERT INTO formulations (name, type, description) VALUES
('Sandalwood Supreme', 'Masala', 'Premium sandalwood blend with natural extracts'),
('Rose Moghul', 'Flora', 'Traditional rose scent with slow-burning binder')
ON CONFLICT DO NOTHING;

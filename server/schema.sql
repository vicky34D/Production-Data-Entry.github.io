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

-- Formulation Ingredients (The Mix/Ratio)
CREATE TABLE IF NOT EXISTS formulation_ingredients (
    id SERIAL PRIMARY KEY,
    formulation_id INTEGER REFERENCES formulations(id) ON DELETE CASCADE,
    raw_material_id INTEGER REFERENCES raw_materials(id),
    quantity_per_unit DECIMAL(10, 4) NOT NULL, -- e.g., 0.600 for 600g per 1 unit
    unit VARCHAR(20) DEFAULT 'kg'
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

-- Product / Item Master (used across all flows)
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    category VARCHAR(80) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goods Received Notes (Raw Material IN)
CREATE TABLE IF NOT EXISTS goods_received_notes (
    id SERIAL PRIMARY KEY,
    grn_date DATE NOT NULL,
    po_number VARCHAR(100) NOT NULL,
    supplier_invoice VARCHAR(100),
    supplier_name VARCHAR(150) NOT NULL,
    item_id INTEGER NOT NULL REFERENCES items(id),
    total_bags NUMERIC(12,2) NOT NULL,
    qty_per_bag NUMERIC(12,3) NOT NULL,
    total_kg NUMERIC(14,3) NOT NULL,
    unloading_cost NUMERIC(14,2) DEFAULT 0,
    document_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Store Updates (Raw Material OUT to production)
CREATE TABLE IF NOT EXISTS daily_store_updates (
    id SERIAL PRIMARY KEY,
    update_date DATE NOT NULL,
    item_id INTEGER NOT NULL REFERENCES items(id),
    bags_out NUMERIC(12,2) NOT NULL,
    qty_per_bag NUMERIC(12,3) NOT NULL,
    total_kg_out NUMERIC(14,3) NOT NULL,
    document_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spare Parts Purchases (IN)
CREATE TABLE IF NOT EXISTS spare_parts_purchases (
    id SERIAL PRIMARY KEY,
    purchase_date DATE NOT NULL,
    supplier_name VARCHAR(150) NOT NULL,
    item_id INTEGER NOT NULL REFERENCES items(id),
    quantity NUMERIC(14,3) NOT NULL,
    document_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spare Parts Usage / Updates (OUT)
CREATE TABLE IF NOT EXISTS spare_parts_updates (
    id SERIAL PRIMARY KEY,
    update_date DATE NOT NULL,
    item_id INTEGER NOT NULL REFERENCES items(id),
    quantity NUMERIC(14,3) NOT NULL,
    machine_number VARCHAR(50) NOT NULL,
    document_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Finished Goods Production (IN to FG stock)
CREATE TABLE IF NOT EXISTS finished_goods_inventory (
    id SERIAL PRIMARY KEY,
    production_date DATE NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    item_id INTEGER NOT NULL REFERENCES items(id),
    total_bags NUMERIC(12,2) NOT NULL,
    kg_per_bag NUMERIC(12,3) NOT NULL,
    total_packed_kg NUMERIC(14,3) NOT NULL,
    document_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goods Dispatch Notes (OUT from FG stock)
CREATE TABLE IF NOT EXISTS goods_dispatch_notes (
    id SERIAL PRIMARY KEY,
    dispatch_date DATE NOT NULL,
    invoice_number VARCHAR(120) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    item_id INTEGER NOT NULL REFERENCES items(id),
    total_bags NUMERIC(12,2) NOT NULL,
    kg_per_bag NUMERIC(12,3) NOT NULL,
    total_kg NUMERIC(14,3) NOT NULL,
    loading_cost NUMERIC(14,2) DEFAULT 0,
    document_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Seed a few default items (used by UI)
INSERT INTO items (name, category) VALUES
('Sandalwood Supreme', 'Premium Masala'),
('Rose Petals', 'Flora'),
('Oudh Aura', 'Dipped')
ON CONFLICT (name) DO NOTHING;

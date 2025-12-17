import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors());
app.use(express.json());

// Database Pool
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: { rejectUnauthorized: false } // Enable for production (e.g., Heroku/Vercel)
});

// Initialize Database Schema
const initDB = async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
        console.log('✅ Database Schema initialized successfully');
    } catch (err) {
        console.error('❌ Error initializing database schema:', err.message);
    }
};

// Connect & Init
pool.connect((err, client, release) => {
    if (err) {
        console.error('⚠️ Could not connect to PostgreSQL.', err.message);
    } else {
        console.log('✅ Connected to PostgreSQL');
        initDB(); // Run schema on connection
        release();
    }
});

// --- Routes ---

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'active', system: 'AJ Aromatics Backend', time: new Date() });
});

// 1. Auth / Users
app.post('/api/login', async (req, res) => {
    const { email } = req.body;
    try {
        // Simple Logic: If user exists, log in. If not, create new user.
        let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            userResult = await pool.query(
                'INSERT INTO users (email, role) VALUES ($1, $2) RETURNING *',
                [email, 'staff']
            );
        }

        const user = userResult.rows[0];
        res.json({ success: true, user, token: `mock-jwt-${user.id}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Database error during login' });
    }
});

// 2. Inventory (Raw Materials)
app.get('/api/inventory', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM raw_materials ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

app.post('/api/inventory', async (req, res) => {
    const { item_code, name, category, current_stock, unit } = req.body;
    try {
        const { rows } = await pool.query(
            'INSERT INTO raw_materials (item_code, name, category, current_stock, unit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [item_code, name, category, current_stock, unit]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Production Batches
app.get('/api/production', async (req, res) => {
    try {
        const query = `
            SELECT pb.*, f.name as formulation_name 
            FROM production_batches pb
            LEFT JOIN formulations f ON pb.formulation_id = f.id
            ORDER BY pb.start_date DESC
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch production data' });
    }
});

app.post('/api/production', async (req, res) => {
    const { batch_code, formulation_id, target_quantity, status } = req.body;
    try {
        const { rows } = await pool.query(
            'INSERT INTO production_batches (batch_code, formulation_id, target_quantity, status, start_date) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [batch_code, formulation_id, target_quantity, status || 'Planned']
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Dashboard Stats (Aggregated)
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const inventoryCount = await pool.query('SELECT COUNT(*) FROM raw_materials');
        const productionActive = await pool.query("SELECT COUNT(*) FROM production_batches WHERE status != 'Completed'");
        const totalProduced = await pool.query('SELECT SUM(produced_quantity) FROM production_batches');

        res.json({
            total_inventory_items: parseInt(inventoryCount.rows[0].count),
            active_batches: parseInt(productionActive.rows[0].count),
            total_production_kg: parseFloat(totalProduced.rows[0].sum || 0)
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 AJ Aromatics Backend running on http://localhost:${port}`);
});

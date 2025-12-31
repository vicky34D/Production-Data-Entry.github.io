import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
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

// --- Auth Helpers ---

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // optional: force specific email as admin

const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
};

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ success: false, error: 'Missing token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
};

const requireRole = (role) => (req, res, next) => {
    if (!req.user || (req.user.role !== role && req.user.role !== 'admin')) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    next();
};

// --- Routes ---

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'active', system: 'AJ Aromatics Backend', time: new Date() });
});

// 1. Auth / Users
app.post('/api/login', async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        // Determine role for new user
        let role = 'staff';
        if (ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            role = 'admin';
        }

        if (userResult.rows.length === 0) {
            userResult = await pool.query(
                'INSERT INTO users (email, role) VALUES ($1, $2) RETURNING *',
                [email, role]
            );
        } else if (ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && userResult.rows[0].role !== 'admin') {
            // Ensure configured admin is always admin
            userResult = await pool.query(
                'UPDATE users SET role = $2 WHERE email = $1 RETURNING *',
                [email, 'admin']
            );
        }

        const user = userResult.rows[0];
        const token = generateToken(user);
        res.json({ success: true, user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Database error during login' });
    }
});

// 2. Inventory (Raw Materials) - legacy simple endpoint, keep open for now
app.get('/api/inventory', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM raw_materials ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

// 2b. Item Master (Products) - used by all inventory screens
app.get('/api/items', authMiddleware, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM items ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

app.post('/api/items', authMiddleware, requireRole('admin'), async (req, res) => {
    const { name, category } = req.body;
    if (!name || !category) {
        return res.status(400).json({ error: 'Name and category are required' });
    }
    try {
        const { rows } = await pool.query(
            'INSERT INTO items (name, category) VALUES ($1, $2) RETURNING *',
            [name, category]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/items/:id', authMiddleware, requireRole('admin'), async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM items WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete item' });
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

// 2c. Formulations & Recipes
app.get('/api/formulations', authMiddleware, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM formulations ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch formulations' });
    }
});

app.post('/api/formulations', authMiddleware, async (req, res) => {
    const { name, type, description } = req.body;
    try {
        const { rows } = await pool.query(
            'INSERT INTO formulations (name, type, description) VALUES ($1, $2, $3) RETURNING *',
            [name, type, description]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create formulation' });
    }
});

app.delete('/api/formulations/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM formulations WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete formulation' });
    }
});

app.get('/api/formulations/:id/ingredients', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT fi.*, rm.name as raw_material_name, rm.unit as raw_material_unit
            FROM formulation_ingredients fi
            JOIN raw_materials rm ON fi.raw_material_id = rm.id
            WHERE fi.formulation_id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch ingredients' });
    }
});

app.post('/api/formulations/:id/ingredients', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { ingredients } = req.body; // Array of { raw_material_id, quantity_per_unit }

    if (!Array.isArray(ingredients)) {
        return res.status(400).json({ error: 'Ingredients must be an array' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Clear existing ingredients
        await client.query('DELETE FROM formulation_ingredients WHERE formulation_id = $1', [id]);

        // Insert new ones
        for (const ing of ingredients) {
            await client.query(
                'INSERT INTO formulation_ingredients (formulation_id, raw_material_id, quantity_per_unit) VALUES ($1, $2, $3)',
                [id, ing.raw_material_id, ing.quantity_per_unit]
            );
        }

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to update ingredients' });
    } finally {
        client.release();
    }
});

// 3. Production Batches
app.get('/api/production', authMiddleware, async (req, res) => {
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

app.post('/api/production', authMiddleware, async (req, res) => {
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
app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
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

// 5. Goods Received Notes (GRN)
app.get('/api/grn', authMiddleware, async (req, res) => {
    const { date } = req.query;
    try {
        let query = `
            SELECT g.*, i.name AS item_name, i.category AS item_category
            FROM goods_received_notes g
            JOIN items i ON g.item_id = i.id
        `;
        const params = [];
        if (date) {
            params.push(date);
            query += ' WHERE g.grn_date = $1';
        }
        query += ' ORDER BY g.grn_date DESC, g.id DESC';

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch GRN records' });
    }
});

app.post('/api/grn', authMiddleware, async (req, res) => {
    const {
        grn_date,
        po_number,
        supplier_invoice,
        supplier_name,
        item_id,
        total_bags,
        qty_per_bag,
        total_kg,
        unloading_cost,
        document_name
    } = req.body;

    if (!grn_date || !po_number || !supplier_name || !item_id || !total_bags || !qty_per_bag || !total_kg) {
        return res.status(400).json({ error: 'Missing required GRN fields' });
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO goods_received_notes
            (grn_date, po_number, supplier_invoice, supplier_name, item_id, total_bags, qty_per_bag, total_kg, unloading_cost, document_name)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *`,
            [
                grn_date,
                po_number,
                supplier_invoice || null,
                supplier_name,
                item_id,
                total_bags,
                qty_per_bag,
                total_kg,
                unloading_cost || 0,
                document_name || null
            ]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create GRN record' });
    }
});

app.delete('/api/grn/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM goods_received_notes WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete GRN record' });
    }
});

// 6. Daily Store Updates
app.get('/api/store-updates', authMiddleware, async (req, res) => {
    const { date } = req.query;
    try {
        let query = `
            SELECT d.*, i.name AS item_name, i.category AS item_category
            FROM daily_store_updates d
            JOIN items i ON d.item_id = i.id
        `;
        const params = [];
        if (date) {
            params.push(date);
            query += ' WHERE d.update_date = $1';
        }
        query += ' ORDER BY d.update_date DESC, d.id DESC';

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch store updates' });
    }
});

app.post('/api/store-updates', authMiddleware, async (req, res) => {
    const {
        update_date,
        item_id,
        bags_out,
        qty_per_bag,
        total_kg_out,
        document_name
    } = req.body;

    if (!update_date || !item_id || !bags_out || !qty_per_bag || !total_kg_out) {
        return res.status(400).json({ error: 'Missing required store update fields' });
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO daily_store_updates
            (update_date, item_id, bags_out, qty_per_bag, total_kg_out, document_name)
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING *`,
            [
                update_date,
                item_id,
                bags_out,
                qty_per_bag,
                total_kg_out,
                document_name || null
            ]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create store update record' });
    }
});

app.delete('/api/store-updates/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM daily_store_updates WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete store update record' });
    }
});

// 7. Spare Parts Purchase
app.get('/api/spare-parts/purchases', authMiddleware, async (req, res) => {
    const { date } = req.query;
    try {
        let query = `
            SELECT s.*, i.name AS item_name, i.category AS item_category
            FROM spare_parts_purchases s
            JOIN items i ON s.item_id = i.id
        `;
        const params = [];
        if (date) {
            params.push(date);
            query += ' WHERE s.purchase_date = $1';
        }
        query += ' ORDER BY s.purchase_date DESC, s.id DESC';

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch spare parts purchases' });
    }
});

app.post('/api/spare-parts/purchases', authMiddleware, async (req, res) => {
    const {
        purchase_date,
        supplier_name,
        item_id,
        quantity,
        document_name
    } = req.body;

    if (!purchase_date || !supplier_name || !item_id || !quantity) {
        return res.status(400).json({ error: 'Missing required spare parts purchase fields' });
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO spare_parts_purchases
            (purchase_date, supplier_name, item_id, quantity, document_name)
            VALUES ($1,$2,$3,$4,$5)
            RETURNING *`,
            [
                purchase_date,
                supplier_name,
                item_id,
                quantity,
                document_name || null
            ]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create spare parts purchase record' });
    }
});

app.delete('/api/spare-parts/purchases/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM spare_parts_purchases WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete spare parts purchase record' });
    }
});

// 8. Spare Parts Updates (usage)
app.get('/api/spare-parts/updates', authMiddleware, async (req, res) => {
    const { date } = req.query;
    try {
        let query = `
            SELECT s.*, i.name AS item_name, i.category AS item_category
            FROM spare_parts_updates s
            JOIN items i ON s.item_id = i.id
        `;
        const params = [];
        if (date) {
            params.push(date);
            query += ' WHERE s.update_date = $1';
        }
        query += ' ORDER BY s.update_date DESC, s.id DESC';

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch spare parts updates' });
    }
});

app.post('/api/spare-parts/updates', authMiddleware, async (req, res) => {
    const {
        update_date,
        item_id,
        quantity,
        machine_number,
        document_name
    } = req.body;

    if (!update_date || !item_id || !quantity || !machine_number) {
        return res.status(400).json({ error: 'Missing required spare parts update fields' });
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO spare_parts_updates
            (update_date, item_id, quantity, machine_number, document_name)
            VALUES ($1,$2,$3,$4,$5)
            RETURNING *`,
            [
                update_date,
                item_id,
                quantity,
                machine_number,
                document_name || null
            ]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create spare parts update record' });
    }
});

app.delete('/api/spare-parts/updates/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM spare_parts_updates WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete spare parts update record' });
    }
});

// 9. Finished Goods Inventory (production IN)
app.get('/api/finished-goods', authMiddleware, async (req, res) => {
    const { date } = req.query;
    try {
        let query = `
            SELECT f.*, i.name AS item_name, i.category AS item_category
            FROM finished_goods_inventory f
            JOIN items i ON f.item_id = i.id
        `;
        const params = [];
        if (date) {
            params.push(date);
            query += ' WHERE f.production_date = $1';
        }
        query += ' ORDER BY f.production_date DESC, f.id DESC';

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch finished goods records' });
    }
});

app.post('/api/finished-goods', authMiddleware, async (req, res) => {
    const {
        production_date,
        customer_name,
        item_id,
        total_bags,
        kg_per_bag,
        total_packed_kg,
        document_name
    } = req.body;

    if (!production_date || !customer_name || !item_id || !total_bags || !kg_per_bag || !total_packed_kg) {
        return res.status(400).json({ error: 'Missing required finished goods fields' });
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO finished_goods_inventory
            (production_date, customer_name, item_id, total_bags, kg_per_bag, total_packed_kg, document_name)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *`,
            [
                production_date,
                customer_name,
                item_id,
                total_bags,
                kg_per_bag,
                total_packed_kg,
                document_name || null
            ]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create finished goods record' });
    }
});

app.delete('/api/finished-goods/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM finished_goods_inventory WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete finished goods record' });
    }
});

// 10. Goods Dispatch Notes
app.get('/api/dispatch', authMiddleware, async (req, res) => {
    const { date } = req.query;
    try {
        let query = `
            SELECT g.*, i.name AS item_name, i.category AS item_category
            FROM goods_dispatch_notes g
            JOIN items i ON g.item_id = i.id
        `;
        const params = [];
        if (date) {
            params.push(date);
            query += ' WHERE g.dispatch_date = $1';
        }
        query += ' ORDER BY g.dispatch_date DESC, g.id DESC';

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch dispatch records' });
    }
});

app.post('/api/dispatch', authMiddleware, async (req, res) => {
    const {
        dispatch_date,
        invoice_number,
        customer_name,
        item_id,
        total_bags,
        kg_per_bag,
        total_kg,
        loading_cost,
        document_name
    } = req.body;

    if (!dispatch_date || !invoice_number || !customer_name || !item_id || !total_bags || !kg_per_bag || !total_kg) {
        return res.status(400).json({ error: 'Missing required dispatch fields' });
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO goods_dispatch_notes
            (dispatch_date, invoice_number, customer_name, item_id, total_bags, kg_per_bag, total_kg, loading_cost, document_name)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *`,
            [
                dispatch_date,
                invoice_number,
                customer_name,
                item_id,
                total_bags,
                kg_per_bag,
                total_kg,
                loading_cost || 0,
                document_name || null
            ]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create dispatch record' });
    }
});

app.delete('/api/dispatch/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM goods_dispatch_notes WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete dispatch record' });
    }
});

// 11. Inventory Summary by Item (IN / OUT / balance)
app.get('/api/inventory/summary', authMiddleware, async (req, res) => {
    try {
        const { rows } = await pool.query(`
            WITH
            grn_in AS (
                SELECT item_id, COALESCE(SUM(total_kg), 0) AS qty_in
                FROM goods_received_notes
                GROUP BY item_id
            ),
            dsu_out AS (
                SELECT item_id, COALESCE(SUM(total_kg_out), 0) AS qty_out
                FROM daily_store_updates
                GROUP BY item_id
            ),
            spp_in AS (
                SELECT item_id, COALESCE(SUM(quantity), 0) AS qty_in
                FROM spare_parts_purchases
                GROUP BY item_id
            ),
            spu_out AS (
                SELECT item_id, COALESCE(SUM(quantity), 0) AS qty_out
                FROM spare_parts_updates
                GROUP BY item_id
            ),
            fgi_in AS (
                SELECT item_id, COALESCE(SUM(total_packed_kg), 0) AS qty_in
                FROM finished_goods_inventory
                GROUP BY item_id
            ),
            gdn_out AS (
                SELECT item_id, COALESCE(SUM(total_kg), 0) AS qty_out
                FROM goods_dispatch_notes
                GROUP BY item_id
            )
            SELECT
                it.id,
                it.name,
                it.category,
                COALESCE(gi.qty_in, 0) + COALESCE(si.qty_in, 0) + COALESCE(fi.qty_in, 0) AS total_in,
                COALESCE(do.qty_out, 0) + COALESCE(so.qty_out, 0) + COALESCE(go.qty_out, 0) AS total_out
            FROM items it
            LEFT JOIN grn_in gi ON gi.item_id = it.id
            LEFT JOIN spp_in si ON si.item_id = it.id
            LEFT JOIN fgi_in fi ON fi.item_id = it.id
            LEFT JOIN dsu_out do ON do.item_id = it.id
            LEFT JOIN spu_out so ON so.item_id = it.id
            LEFT JOIN gdn_out go ON go.item_id = it.id
            ORDER BY it.name ASC;
        `);

        const enriched = rows.map(r => ({
            ...r,
            current_stock: Number(r.total_in) - Number(r.total_out),
            is_dead: Number(r.total_in) === 0 && Number(r.total_out) === 0
        }));

        res.json(enriched);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch inventory summary' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 AJ Aromatics Backend running on http://localhost:${port}`);
});

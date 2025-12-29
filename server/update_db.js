import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = new pg.Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'ajaromatics',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function updateSchema() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();

        console.log('Applying schema updates...');

        // Add formulation_ingredients table
        await client.query(`
            CREATE TABLE IF NOT EXISTS formulation_ingredients (
                id SERIAL PRIMARY KEY,
                formulation_id INTEGER REFERENCES formulations(id) ON DELETE CASCADE,
                raw_material_id INTEGER REFERENCES raw_materials(id),
                quantity_per_unit DECIMAL(10, 4) NOT NULL,
                unit VARCHAR(20) DEFAULT 'kg'
            );
        `);
        console.log('Created formulation_ingredients table');

        // Check if raw_materials is using item_code or just id, and if we need to link it
        // The schema uses raw_materials(id) which matches our new table.

        client.release();
        console.log('Schema update complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}

updateSchema();

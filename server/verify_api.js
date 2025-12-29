
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function verify() {
    try {
        console.log('0. Logging in...');
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@ajaromatics.com' })
        });
        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('   Success. Token obtained.');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        console.log('1. Fetching Formulations...');
        const res1 = await fetch(`${BASE_URL}/formulations`, { headers });
        if (!res1.ok) throw new Error(`Failed to fetch formulations: ${res1.statusText}`);
        const forms = await res1.json();
        console.log('   Success. Count:', forms.length);

        console.log('2. Creating Test Formulation...');
        const res2 = await fetch(`${BASE_URL}/formulations`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: 'Verification Mix', type: 'Masala', description: 'Test' })
        });
        if (!res2.ok) throw new Error(`Failed to create formulation`);
        const newForm = await res2.json();
        console.log('   Success. ID:', newForm.id);

        console.log('3. Fetching Raw Materials...');
        const res3 = await fetch(`${BASE_URL}/inventory`); // Inventory is public? Checking index.js...
        // Line 133: app.get('/api/inventory'...) NO authMiddleware. 
        // So this is fine. But let's send headers just in case I misread or it changes.
        // Actually verify_api.js previous run failed on Fetching Formulations which DOES have auth.
        const inventory = await res3.json();
        // Ensure we have at least one RM
        let rmId;
        if (inventory.length === 0) {
            console.log('   No RM found. Creating one...');
            const res4 = await fetch(`${BASE_URL}/inventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_code: 'TEST-001',
                    name: 'Test Sandalwood',
                    category: 'Wood',
                    current_stock: 100,
                    unit: 'kg'
                })
            });
            const newRm = await res4.json();
            rmId = newRm.id;
        } else {
            rmId = inventory[0].id;
        }
        console.log('   Using RM ID:', rmId);

        console.log('4. Adding Ingredients...');
        const res5 = await fetch(`${BASE_URL}/formulations/${newForm.id}/ingredients`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                ingredients: [
                    { raw_material_id: rmId, quantity_per_unit: 0.5 }
                ]
            })
        });
        if (!res5.ok) throw new Error(`Failed to add ingredients`);
        console.log('   Success.');

        console.log('5. Verifying Ingredients...');
        const res6 = await fetch(`${BASE_URL}/formulations/${newForm.id}/ingredients`, { headers });
        const ingredients = await res6.json();
        if (ingredients.length !== 1 || parseFloat(ingredients[0].quantity_per_unit) !== 0.5) {
            console.log('   Mismatch:', ingredients);
            throw new Error('Ingredient verification failed');
        }
        console.log('   Success. Verified Quantity: 0.5');

        console.log('✅ ALL CHECKS PASSED');

    } catch (err) {
        console.error('❌ Verification Failed:', err);
        process.exit(1);
    }
}

verify();

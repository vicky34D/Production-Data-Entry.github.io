import React, { useState, useEffect } from 'react';
import { Calculator, AlertTriangle, CheckCircle, Package, Play, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProductionPlanner.css';

const ProductionPlanner = () => {
    const navigate = useNavigate();
    const [formulations, setFormulations] = useState([]);
    const [selectedFormulationId, setSelectedFormulationId] = useState('');
    const [targetQuantity, setTargetQuantity] = useState('');
    const [inventory, setInventory] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [plan, setPlan] = useState(null);
    const [batchId, setBatchId] = useState('');

    // ... (previous imports)

    useEffect(() => {
        fetchFormulations();
        fetchInventory();
        generateBatchId();
    }, []);

    const generateBatchId = () => {
        const date = new Date();
        const id = `B${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`;
        setBatchId(id);
    };

    const fetchFormulations = async () => {
        try {
            // Try API first
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/api/formulations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFormulations(data);
            } else {
                throw new Error("API failed");
            }
        } catch (err) {
            // Fallback to Mock Formulations
            console.warn('Backend unavailable, using mock data');
            setFormulations([
                { id: 1, name: 'Sandalwood Premium', type: 'Masala' },
                { id: 2, name: 'Rose Deluxe', type: 'Dipped' },
                { id: 3, name: 'Mogra Gold', type: 'Flora' }
            ]);
        }
    };

    const fetchInventory = () => {
        // Load Real Inventory from LocalStorage Service (replicating InventorySummary logic)
        const products = JSON.parse(localStorage.getItem('productItems') || '[]');
        const grn = JSON.parse(localStorage.getItem('inventoryData') || '[]');
        const dsu = JSON.parse(localStorage.getItem('storeUpdateData') || '[]');
        const spu = JSON.parse(localStorage.getItem('sparePartsUpdateData') || '[]');

        // Calculate Stock for each item
        const norm = (str) => (str || '').toString().toLowerCase().trim();

        const realInventory = products.map(p => {
            const pName = norm(p.name);
            const inQty = grn.filter(d => norm(d.item) === pName).reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0);
            const outQty = dsu.filter(d => norm(d.item) === pName).reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0)
                + spu.filter(d => norm(d.item) === pName).reduce((sum, d) => sum + (parseFloat(d.quantity) || 0), 0);
            return {
                id: p.id,
                name: p.name,
                current_stock: inQty - outQty,
                unit: 'kg' // Assuming KG for consistency
            };
        });

        if (realInventory.length > 0) {
            setInventory(realInventory);
        } else {
            // Fallback if no items in master
            setInventory([
                { id: 101, name: 'Bamboo Sticks', current_stock: 5000, unit: 'kg' },
                { id: 102, name: 'Charcoal Powder', current_stock: 200, unit: 'kg' },
                { id: 103, name: 'Jigat Powder', current_stock: 50, unit: 'kg' }
            ]);
        }
    };

    const handleCalculate = async () => {
        if (!selectedFormulationId || !targetQuantity) return;

        // Mock Ingredients logic linked to inventory names
        // In a real app, this comes from the FormulationManager API/State
        // We'll map formulation types to likely ingredients
        let mockIngredients = [];
        const form = formulations.find(f => f.id == selectedFormulationId);

        if (form) {
            // Dynamic Recipe based on available inventory
            // We search for keywords in inventory items
            const findItem = (keyword) => inventory.find(i => i.name.toLowerCase().includes(keyword.toLowerCase()));

            const bamboo = findItem('bamboo') || { id: 101, name: 'Bamboo Sticks' };
            const charcoal = findItem('charcoal') || { id: 102, name: 'Charcoal Powder' };
            const jigat = findItem('jigat') || { id: 103, name: 'Jigat Powder' };
            const perfume = findItem('perfume') || findItem('oil') || { id: 999, name: 'Perfume Compound' };

            mockIngredients = [
                { raw_material_id: bamboo.id, raw_material_name: bamboo.name, quantity_per_unit: 0.8, raw_material_unit: 'kg' },
                { raw_material_id: charcoal.id, raw_material_name: charcoal.name, quantity_per_unit: 0.2, raw_material_unit: 'kg' },
                { raw_material_id: jigat.id, raw_material_name: jigat.name, quantity_per_unit: 0.1, raw_material_unit: 'kg' },
                { raw_material_id: perfume.id, raw_material_name: perfume.name, quantity_per_unit: 0.05, raw_material_unit: 'kg' }
            ];
        }

        setIngredients(mockIngredients);

        // Calculate
        const requirements = mockIngredients.map(ing => {
            const requiredQty = ing.quantity_per_unit * parseFloat(targetQuantity);
            // Match exactly by name if ID fails, or use ID
            const stockItem = inventory.find(i => i.name === ing.raw_material_name);
            const currentStock = stockItem ? parseFloat(stockItem.current_stock) : 0;

            return {
                ...ing,
                requiredQty,
                currentStock,
                shortage: Math.max(0, requiredQty - currentStock),
                sufficient: currentStock >= requiredQty
            };
        });

        setPlan({
            target: parseFloat(targetQuantity),
            formulationName: form?.name || 'Unknown',
            requirements
        });
    };

    const handleCreateBatch = () => {
        if (!plan) return;

        const newBatch = {
            id: batchId,
            status: 'In Production',
            formulationId: selectedFormulationId,
            formulationName: plan.formulationName,
            targetQuantity: plan.target,
            startDate: new Date().toISOString().split('T')[0],
            requirements: plan.requirements
        };

        // 1. Save Batch
        const existingBatches = JSON.parse(localStorage.getItem('productionBatches') || '[]');
        localStorage.setItem('productionBatches', JSON.stringify([...existingBatches, newBatch]));

        // 2. Deduct Inventory (Auto-Issue Materials)
        const dsu = JSON.parse(localStorage.getItem('storeUpdateData') || '[]');
        const newDsuEntries = plan.requirements.map((req, idx) => ({
            id: Date.now() + idx,
            date: new Date().toISOString().split('T')[0],
            item: req.raw_material_name,
            totalKg: req.requiredQty, // Deducting required quantity
            purpose: `Production Issue for Batch ${batchId}`,
            remarks: 'Auto-deducted by Planner'
        }));

        localStorage.setItem('storeUpdateData', JSON.stringify([...dsu, ...newDsuEntries]));

        alert(`Batch ${batchId} Created! Materials have been issued from inventory.`);
        navigate('/dashboard');
    };

    const getStatusColor = (req) => req.sufficient ? 'text-success' : 'text-danger';

    return (
        <div className="planner-container">
            <div className="planner-card glass">
                <div className="card-header">
                    <Calculator size={24} className="icon-primary" />
                    <h2>Production Planner</h2>
                </div>

                <div className="planner-inputs">
                    <div className="input-group">
                        <label>Batch ID</label>
                        <input type="text" value={batchId} readOnly style={{ background: '#f1f5f9', color: '#64748b' }} />
                    </div>

                    <div className="input-group">
                        <label>Select Formulation</label>
                        <select
                            value={selectedFormulationId}
                            onChange={e => setSelectedFormulationId(e.target.value)}
                        >
                            <option value="">-- Choose Recipe --</option>
                            {formulations.map(f => (
                                <option key={f.id} value={f.id}>{f.name} ({f.type})</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Target Quantity (Output)</label>
                        <div className="input-wrapper">
                            <input
                                type="number"
                                placeholder="Enter Qty"
                                value={targetQuantity}
                                onChange={e => setTargetQuantity(e.target.value)}
                            />
                            <span className="unit-badge">Cases</span>
                        </div>
                    </div>

                    <button
                        className="calculate-btn"
                        onClick={handleCalculate}
                        disabled={!selectedFormulationId || !targetQuantity}
                    >
                        Calculate Plan
                    </button>
                </div>
            </div>

            {plan && (
                <div className="results-area glass">
                    <div className="results-header">
                        <h3>Material Requirements for Batch {batchId}</h3>
                        <p>{plan.target} Units of {plan.formulationName}</p>
                    </div>

                    <div className="requirements-grid">
                        {plan.requirements.map((req, idx) => (
                            <div key={idx} className={`req-card ${!req.sufficient ? 'shortage' : ''}`}>
                                <div className="req-header">
                                    <span className="material-name">{req.raw_material_name}</span>
                                    {req.sufficient ?
                                        <CheckCircle size={20} className="text-success" /> :
                                        <AlertTriangle size={20} className="text-danger" />
                                    }
                                </div>

                                <div className="req-details">
                                    <div className="detail-row">
                                        <span>Required:</span>
                                        <strong>{req.requiredQty.toFixed(2)} {req.raw_material_unit}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Allocated:</span>
                                        <span className={getStatusColor(req)}>{req.sufficient ? 'Full' : 'Partial'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="action-footer">
                        <button className="btn-confirm" onClick={handleCreateBatch}>
                            <Play size={20} /> Start Production Batch
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductionPlanner;

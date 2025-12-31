import React, { useState, useEffect } from 'react';
import { Calculator, AlertTriangle, CheckCircle, Package, Play, Save, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import './ProductionPlanner.css';

const ProductionPlanner = () => {
    const navigate = useNavigate();
    const [formulations, setFormulations] = useState([]);
    const [selectedFormulationId, setSelectedFormulationId] = useState('');
    const [targetQuantity, setTargetQuantity] = useState('');
    const [inventory, setInventory] = useState([]);
    const [plan, setPlan] = useState(null);
    const [batchId, setBatchId] = useState('');

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

    const fetchFormulations = () => {
        const saved = localStorage.getItem('formulations');
        if (saved) {
            setFormulations(JSON.parse(saved));
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
                unit: 'kg'
            };
        });

        setInventory(realInventory);
    };

    const handleCalculate = () => {
        if (!selectedFormulationId || !targetQuantity) return;

        const form = formulations.find(f => f.id.toString() === selectedFormulationId.toString());

        if (!form) return;

        const ingredients = form.ingredients || [];

        // Calculate
        const requirements = ingredients.map(ing => {
            // ing.raw_material_id stores the name in the new logic (see FormulationManager)
            // Or if it stores ID, we need to map back.
            // In FormulationManager, I changed the value to 'rm.name'.

            const requiredQty = (parseFloat(ing.quantity_per_unit) || 0) * parseFloat(targetQuantity);

            // Match inventory
            const stockItem = inventory.find(i => i.name === ing.raw_material_id); // raw_material_id holds name now
            const currentStock = stockItem ? parseFloat(stockItem.current_stock) : 0;

            return {
                ...ing,
                requiredQty,
                currentStock,
                shortage: Math.max(0, requiredQty - currentStock),
                sufficient: currentStock >= requiredQty,
                name: ing.raw_material_id // keep track of name
            };
        });

        setPlan({
            target: parseFloat(targetQuantity),
            formulationName: form.name,
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

        // 1. Save Batch (Planned Only)
        const existingBatches = JSON.parse(localStorage.getItem('productionBatches') || '[]');
        localStorage.setItem('productionBatches', JSON.stringify([...existingBatches, newBatch]));

        // No auto-deduction here. Deduction happens in Finished Goods Inventory when adding entries.

        alert(`Batch ${batchId} Planned! \n\nGo to 'Finished Goods Inventory' to log actual produced quantities and deduct items progressively.`);
        navigate('/inventory/fgi');
    };

    const getStatusColor = (req) => req.sufficient ? 'text-success' : 'text-danger';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
            <header className="inventory-header">
                <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link to="/inventory" style={{ opacity: 0.7, transition: 'opacity 0.2s' }} title="Back to Hub">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="brand-icon" style={{
                        width: '32px', height: '32px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'white'
                    }}>PP</div>
                    <h1>Production Planner</h1>
                </div>
            </header>

            <div className="inventory-container" style={{ display: 'block', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <div className="planner-card glass" style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div className="card-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
                        <Calculator size={24} className="icon-primary" color="#f59e0b" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Calculate Material Requirements</h2>
                    </div>

                    <div className="planner-inputs" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>Batch ID</label>
                            <input type="text" value={batchId} readOnly style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b' }} />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>Select Formulation</label>
                            <select
                                value={selectedFormulationId}
                                onChange={e => setSelectedFormulationId(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            >
                                <option value="">-- Choose Recipe --</option>
                                {formulations.map(f => (
                                    <option key={f.id} value={f.id}>{f.name} ({f.type})</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>Target Quantity (Output)</label>
                            <div className="input-wrapper" style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    placeholder="Enter Qty"
                                    value={targetQuantity}
                                    onChange={e => setTargetQuantity(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                        </div>

                        <button
                            className="calculate-btn"
                            onClick={handleCalculate}
                            disabled={!selectedFormulationId || !targetQuantity}
                            style={{
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: (!selectedFormulationId || !targetQuantity) ? 'not-allowed' : 'pointer',
                                opacity: (!selectedFormulationId || !targetQuantity) ? 0.7 : 1
                            }}
                        >
                            Calculate Plan
                        </button>
                    </div>
                </div>

                {plan && (
                    <div className="results-area glass" style={{ marginTop: '30px', background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <div className="results-header" style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Material Requirements for Batch {batchId}</h3>
                            <p style={{ color: '#64748b' }}>{plan.target} Units of {plan.formulationName}</p>
                        </div>

                        <div className="requirements-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                            {plan.requirements.map((req, idx) => (
                                <div key={idx} className={`req-card`} style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    borderLeft: `4px solid ${req.sufficient ? '#10b981' : '#ef4444'}`
                                }}>
                                    <div className="req-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span className="material-name" style={{ fontWeight: 600, fontSize: '1rem' }}>{req.name}</span>
                                        {req.sufficient ?
                                            <CheckCircle size={20} className="text-success" color="#10b981" /> :
                                            <AlertTriangle size={20} className="text-danger" color="#ef4444" />
                                        }
                                    </div>

                                    <div className="req-details" style={{ fontSize: '0.9rem' }}>
                                        <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ color: '#64748b' }}>Required:</span>
                                            <strong>{req.requiredQty.toFixed(2)} KG</strong>
                                        </div>
                                        <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ color: '#64748b' }}>In Stock:</span>
                                            <strong>{req.currentStock.toFixed(2)} KG</strong>
                                        </div>
                                        {!req.sufficient && (
                                            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', background: '#fef2f2', padding: '4px', borderRadius: '4px' }}>
                                                <span style={{ color: '#ef4444', fontWeight: 600 }}>Shortage:</span>
                                                <span style={{ color: '#ef4444', fontWeight: 700 }}>-{req.shortage.toFixed(2)} KG</span>
                                            </div>
                                        )}
                                        <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#64748b' }}>Status:</span>
                                            <span style={{ color: req.sufficient ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                                {req.sufficient ? 'Available' : 'INSUFFICIENT'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="action-footer" style={{ textAlign: 'right' }}>
                            <button className="btn-confirm" onClick={handleCreateBatch} style={{
                                padding: '12px 24px',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '1rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                transition: 'filter 0.2s'
                            }}>
                                <Play size={20} /> Execute Production Batch
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductionPlanner;

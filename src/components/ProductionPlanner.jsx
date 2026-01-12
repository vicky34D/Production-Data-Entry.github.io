import React, { useState, useEffect } from 'react';
import { Calculator, AlertTriangle, CheckCircle, Play, ArrowLeft, Package, Boxes } from 'lucide-react';
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
        // Load Real Inventory from LocalStorage
        const products = JSON.parse(localStorage.getItem('productItems') || '[]');
        const grn = JSON.parse(localStorage.getItem('inventoryData') || '[]');
        const dsu = JSON.parse(localStorage.getItem('storeUpdateData') || '[]');
        const spu = JSON.parse(localStorage.getItem('sparePartsUpdateData') || '[]');

        const norm = (str) => (str || '').toString().toLowerCase().trim();

        const realInventory = products.map(p => {
            const pName = norm(p.name);
            const inQty = grn.filter(d => norm(d.item) === pName).reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0);
            const outQty = dsu
                .filter(d => norm(d.item) === pName && d.type !== 'GRN_IN' && d.type !== 'PRODUCTION_IN')
                .reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0)
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

        const requirements = ingredients.map(ing => {
            const qtyPerUnit = parseFloat(ing.quantity_per_unit) || 0;
            const requiredQty = qtyPerUnit * parseFloat(targetQuantity);

            // Robust matching for inventory lookup
            const ingName = (ing.raw_material_id || '').trim().toLowerCase();
            const stockItem = inventory.find(i => (i.name || '').trim().toLowerCase() === ingName);
            const currentStock = stockItem ? parseFloat(stockItem.current_stock) : 0;

            const isZeroRequirement = requiredQty === 0;
            const sufficient = currentStock >= requiredQty;

            return {
                ...ing,
                requiredQty,
                currentStock,
                shortage: Math.max(0, requiredQty - currentStock),
                sufficient,
                isZeroRequirement,
                name: ing.raw_material_id
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

        const existingBatches = JSON.parse(localStorage.getItem('productionBatches') || '[]');
        localStorage.setItem('productionBatches', JSON.stringify([...existingBatches, newBatch]));

        alert(`Batch ${batchId} Planned! \n\nGo to 'Finished Goods Inventory' to log actual produced quantities.`);
        navigate('/inventory/fgi');
    };

    return (
        <div className="planner-container">
            {/* Header */}
            <header className="planner-header">
                <div className="brand-section">
                    <Link to="/inventory" title="Back to Hub">
                        <ArrowLeft size={24} color="var(--text-secondary)" />
                    </Link>
                    <div className="brand-icon">
                        <Boxes size={24} />
                    </div>
                    <div className="planner-title">
                        <h1>Production Planner</h1>
                        <p>Calculate material needs and schedule batches</p>
                    </div>
                </div>
                <div className="batch-badge">
                    {/* Optional: Status badge if needed */}
                </div>
            </header>

            {/* Input Section */}
            <div className="planner-card">
                <div className="card-title">
                    <Calculator size={20} color="#F59E0B" />
                    <span>New Production Plan</span>
                </div>

                <div className="input-grid">
                    <div className="form-group">
                        <label>Batch ID (Auto)</label>
                        <input type="text" value={batchId} readOnly />
                    </div>

                    <div className="form-group">
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

                    <div className="form-group">
                        <label>Target Quantity (Output)</label>
                        <input
                            type="number"
                            placeholder="e.g 1000"
                            value={targetQuantity}
                            onChange={e => setTargetQuantity(e.target.value)}
                        />
                    </div>
                </div>

                <div className="planner-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        className="btn-calculate"
                        onClick={handleCalculate}
                        disabled={!selectedFormulationId || !targetQuantity}
                        style={{ width: 'auto', padding: '0.6rem 1.5rem', marginTop: 0 }}
                    >
                        <Play size={16} fill="currentColor" /> Calculate
                    </button>
                </div>
            </div>

            {/* Results Section */}
            {plan && (
                <div className="results-container">
                    <div className="results-header">
                        <h3>Material Analysis Table</h3>
                        <div className="status-badge" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                            Target: {plan.target} Units
                        </div>
                    </div>

                    <div className="grid-cols-4">
                        {plan.requirements.map((req, idx) => (
                            <div key={idx} className={`req-card ${!req.sufficient ? 'shortage' : (req.isZeroRequirement ? 'neutral' : 'sufficient')}`}>
                                <div className="req-header">
                                    <strong>{req.name}</strong>
                                    {!req.sufficient ? (
                                        <AlertTriangle size={18} color="#EF4444" />
                                    ) : req.isZeroRequirement ? (
                                        <AlertTriangle size={18} color="var(--text-secondary)" />
                                    ) : (
                                        <CheckCircle size={18} color="#10B981" />
                                    )}
                                </div>

                                <div className="data-row">
                                    <span>Required</span>
                                    <span>{req.requiredQty.toFixed(4)} Kg</span>
                                </div>
                                <div className="data-row">
                                    <span>Available</span>
                                    <span>{req.currentStock.toFixed(2)} Kg</span>
                                </div>

                                {!req.sufficient ? (
                                    <div className="shortage-alert">
                                        Shortage: -{req.shortage.toFixed(2)} Kg
                                    </div>
                                ) : req.isZeroRequirement ? (
                                    <div className="status-badge" style={{ textAlign: 'center', marginTop: '1rem', display: 'block', background: 'var(--bg-page)' }}>
                                        No Qty Set
                                    </div>
                                ) : (
                                    <div className="status-badge ok" style={{ textAlign: 'center', marginTop: '1rem', display: 'block' }}>
                                        Stock Available
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="action-bar-bottom">
                        <button className="btn-execute" onClick={handleCreateBatch}>
                            <Package size={20} />
                            Confirm & Create Batch
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductionPlanner;

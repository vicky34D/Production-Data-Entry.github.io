import React, { useState, useEffect } from 'react';
import { Calculator, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import './ProductionPlanner.css';

const ProductionPlanner = () => {
    const [formulations, setFormulations] = useState([]);
    const [selectedFormulationId, setSelectedFormulationId] = useState('');
    const [targetQuantity, setTargetQuantity] = useState('');
    const [inventory, setInventory] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [plan, setPlan] = useState(null);

    useEffect(() => {
        fetchFormulations();
        fetchInventory();
    }, []);

    const fetchFormulations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/api/formulations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setFormulations(data);
        } catch (err) {
            console.error('Error fetching formulations:', err);
        }
    };

    const fetchInventory = async () => {
        try {
            // Inventory might be public, but let's be safe
            const res = await fetch('http://localhost:3001/api/inventory');
            const data = await res.json();
            // Create a lookup map for easier access
            setInventory(data);
        } catch (err) {
            console.error('Error fetching inventory:', err);
        }
    };

    const handleCalculate = async () => {
        if (!selectedFormulationId || !targetQuantity) return;

        try {
            // 1. Fetch ingredients for the formulation
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/api/formulations/${selectedFormulationId}/ingredients`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const ings = await res.json();
            setIngredients(ings);

            // 2. Calculate Requirements
            const requirements = ings.map(ing => {
                const requiredQty = ing.quantity_per_unit * parseFloat(targetQuantity);

                // Find current stock
                const stockItem = inventory.find(i => i.id === ing.raw_material_id);
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
                formulationName: formulations.find(f => f.id === parseInt(selectedFormulationId))?.name,
                requirements
            });

        } catch (err) {
            console.error('Error calculating plan:', err);
        }
    };

    const getStatusColor = (req) => req.sufficient ? 'text-success' : 'text-danger';

    return (
        <div className="planner-container">
            <div className="planner-card">
                <div className="card-header">
                    <Calculator size={24} className="icon-primary" />
                    <h2>Production Planner (Backtracking)</h2>
                </div>

                <div className="planner-inputs">
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
                        <label>Target Quantity (Finished Goods)</label>
                        <div className="input-wrapper">
                            <input
                                type="number"
                                placeholder="Enter Qty"
                                value={targetQuantity}
                                onChange={e => setTargetQuantity(e.target.value)}
                            />
                            <span className="unit-badge">Units</span>
                        </div>
                    </div>

                    <button
                        className="calculate-btn"
                        onClick={handleCalculate}
                        disabled={!selectedFormulationId || !targetQuantity}
                    >
                        Calculate Requirements
                    </button>
                </div>
            </div>

            {plan && (
                <div className="results-area">
                    <div className="results-header">
                        <h3>Material Requirements for {plan.target} Units of {plan.formulationName}</h3>
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
                                        <span>In Stock:</span>
                                        <span className={getStatusColor(req)}>{req.currentStock.toFixed(2)} {req.raw_material_unit}</span>
                                    </div>
                                    {!req.sufficient && (
                                        <div className="shortage-alert">
                                            Need to order: {(req.requiredQty - req.currentStock).toFixed(2)} {req.raw_material_unit}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductionPlanner;

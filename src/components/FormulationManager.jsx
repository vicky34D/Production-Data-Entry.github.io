import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ChevronRight, Check } from 'lucide-react';
import './FormulationManager.css';

const FormulationManager = () => {
    const [formulations, setFormulations] = useState([]);
    const [selectedFormulation, setSelectedFormulation] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);

    const [newFormName, setNewFormName] = useState('');
    const [newFormType, setNewFormType] = useState('Masala'); // Default
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        fetchFormulations();
        fetchRawMaterials();
    }, []);

    useEffect(() => {
        if (selectedFormulation) {
            fetchIngredients(selectedFormulation.id);
        } else {
            setIngredients([]);
        }
    }, [selectedFormulation]);

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

    const fetchRawMaterials = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/api/inventory', {
                headers: { 'Authorization': `Bearer ${token}` } // Assuming inventory is protected? index.js says line 133 is NOT protected, but wait..
                // index.js line 133: app.get('/api/inventory'...) NO authMiddleware.
                // But let's check line 144 /api/items HAS authMiddleware.
                // My code uses /api/inventory for RMs. Safety: send token anyway.
            });
            const data = await res.json();
            setRawMaterials(data);
        } catch (err) {
            console.error('Error fetching raw materials:', err);
        }
    };

    const fetchIngredients = async (id) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/api/formulations/${id}/ingredients`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            // Map to local state format
            const mapped = data.map(i => ({
                id: i.raw_material_id, // simple ID tracking
                raw_material_id: i.raw_material_id,
                quantity_per_unit: i.quantity_per_unit,
                unit: i.unit || 'kg',
                name: i.raw_material_name // for display
            }));
            setIngredients(mapped);
        } catch (err) {
            console.error('Error fetching ingredients:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFormulation = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/api/formulations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newFormName, type: newFormType, description: '' })
            });
            const data = await res.json();
            setFormulations([...formulations, data]);
            setNewFormName('');
            setSelectedFormulation(data);
        } catch (err) {
            console.error('Error creating formulation:', err);
        }
    };

    const handleAddIngredientRow = () => {
        setIngredients([...ingredients, { raw_material_id: '', quantity_per_unit: 0, unit: 'kg' }]);
    };

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index][field] = value;
        setIngredients(newIngredients);
    };

    const handleRemoveIngredient = (index) => {
        const newIngredients = [...ingredients];
        newIngredients.splice(index, 1);
        setIngredients(newIngredients);
    };

    const handleSaveIngredients = async () => {
        if (!selectedFormulation) return;
        setSaveStatus('Saving...');
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3001/api/formulations/${selectedFormulation.id}/ingredients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ingredients: ingredients })
            });
            setSaveStatus('Saved!');
            setTimeout(() => setSaveStatus(''), 2000);
        } catch (err) {
            setSaveStatus('Error!');
            console.error('Error saving ingredients:', err);
        }
    };

    return (
        <div className="formulation-container">
            {/* Sidebar List */}
            <div className="formulation-list">
                <h3>Formulations</h3>
                <div className="list-content">
                    {formulations.map(f => (
                        <div
                            key={f.id}
                            className={`list-item ${selectedFormulation?.id === f.id ? 'active' : ''}`}
                            onClick={() => setSelectedFormulation(f)}
                        >
                            <span className="item-name">{f.name}</span>
                            <span className="item-type">{f.type}</span>
                            <ChevronRight size={16} className="arrow" />
                        </div>
                    ))}
                </div>
                <form className="add-form" onSubmit={handleCreateFormulation}>
                    <input
                        type="text"
                        placeholder="New Formulation Name"
                        value={newFormName}
                        onChange={e => setNewFormName(e.target.value)}
                        required
                    />
                    <select value={newFormType} onChange={e => setNewFormType(e.target.value)}>
                        <option value="Masala">Masala</option>
                        <option value="Flora">Flora</option>
                        <option value="Dipped">Dipped</option>
                    </select>
                    <button type="submit"><Plus size={18} /></button>
                </form>
            </div>

            {/* Main Edit Area */}
            <div className="formulation-editor">
                {!selectedFormulation ? (
                    <div className="empty-state">Select a formulation to edit ingredients</div>
                ) : (
                    <>
                        <div className="editor-header">
                            <div>
                                <h2>{selectedFormulation.name}</h2>
                                <p className="subtitle">Define raw material mix ratio per 1 Unit of Output</p>
                            </div>
                            <button className="save-btn" onClick={handleSaveIngredients}>
                                <Save size={18} />
                                {saveStatus || 'Save Ingredients'}
                            </button>
                        </div>

                        <div className="ingredients-table-wrapper">
                            <table className="ingredients-table">
                                <thead>
                                    <tr>
                                        <th>Raw Material</th>
                                        <th>Qty per Unit</th>
                                        <th>Unit</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ingredients.map((ing, index) => (
                                        <tr key={index}>
                                            <td>
                                                <select
                                                    value={ing.raw_material_id}
                                                    onChange={e => handleIngredientChange(index, 'raw_material_id', e.target.value)}
                                                >
                                                    <option value="">Select Material...</option>
                                                    {rawMaterials.map(rm => (
                                                        <option key={rm.id} value={rm.id}>{rm.name} ({rm.item_code})</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    step="0.0001"
                                                    value={ing.quantity_per_unit}
                                                    onChange={e => handleIngredientChange(index, 'quantity_per_unit', parseFloat(e.target.value))}
                                                />
                                            </td>
                                            <td>KG</td>
                                            <td>
                                                <button className="remove-btn" onClick={() => handleRemoveIngredient(index)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="add-row-btn" onClick={handleAddIngredientRow}>
                                <Plus size={16} /> Add Ingredient
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FormulationManager;

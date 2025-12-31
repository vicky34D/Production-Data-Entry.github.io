import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Save, ChevronRight, FlaskConical, ArrowLeft } from 'lucide-react';
import './FormulationManager.css';

const FormulationManager = () => {
    const [formulations, setFormulations] = useState(() => {
        const saved = localStorage.getItem('formulations');
        return saved ? JSON.parse(saved) : [];
    });

    const [selectedFormulation, setSelectedFormulation] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);

    const [newFormName, setNewFormName] = useState('');
    const [newFormType, setNewFormType] = useState('Masala'); // Default
    const [newFormDesc, setNewFormDesc] = useState('');
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        fetchRawMaterials();
    }, []);

    // Persist Formulations whenever they change
    useEffect(() => {
        localStorage.setItem('formulations', JSON.stringify(formulations));
    }, [formulations]);

    // Load ingredients when selection changes
    useEffect(() => {
        if (selectedFormulation) {
            // Find the latest version of the selected formulation from state
            const current = formulations.find(f => f.id === selectedFormulation.id);
            if (current && current.ingredients) {
                setIngredients(current.ingredients);
            } else {
                setIngredients([]);
            }
        } else {
            setIngredients([]);
        }
    }, [selectedFormulation, formulations]);

    const fetchRawMaterials = () => {
        const savedItems = localStorage.getItem('productItems');
        if (savedItems) {
            setRawMaterials(JSON.parse(savedItems));
        } else {
            // Fallback/Demo Data if needed
            setRawMaterials([]);
        }
    };

    const handleCreateFormulation = (e) => {
        e.preventDefault();
        if (!newFormName) return;

        const newForm = {
            id: Date.now(),
            name: newFormName,
            type: newFormType,
            description: newFormDesc,
            ingredients: []
        };

        setFormulations([...formulations, newForm]);
        setNewFormName('');
        setNewFormDesc('');
        setSelectedFormulation(newForm);
    };

    const handleDeleteFormulation = () => {
        if (!selectedFormulation || !window.confirm(`Are you sure you want to delete "${selectedFormulation.name}"?`)) return;
        const updatedList = formulations.filter(f => f.id !== selectedFormulation.id);
        setFormulations(updatedList);
        setSelectedFormulation(null);
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

    const handleSaveIngredients = () => {
        if (!selectedFormulation) return;
        setSaveStatus('Saving...');

        const updatedFormulations = formulations.map(f => {
            if (f.id === selectedFormulation.id) {
                return { ...f, ingredients: ingredients };
            }
            return f;
        });

        setFormulations(updatedFormulations);
        setSaveStatus('Saved!');
        setTimeout(() => setSaveStatus(''), 2000);
    };

    return (
        <div className="formulation-page" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
            <header className="inventory-header">
                <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link to="/inventory" style={{ opacity: 0.7, transition: 'opacity 0.2s' }} title="Back to Hub">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="brand-icon" style={{
                        width: '32px', height: '32px',
                        background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'white'
                    }}>FM</div>
                    <h1>Formulation Manager</h1>
                </div>
            </header>

            <div className="formulation-container">
                {/* Sidebar List */}
                <div className="formulation-list">
                    <div className="list-header">
                        <h3>Recipes</h3>
                    </div>
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
                        <div className="add-form-title">New Recipe</div>
                        <input
                            type="text"
                            placeholder="Formulation Name"
                            value={newFormName}
                            onChange={e => setNewFormName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            value={newFormDesc}
                            onChange={e => setNewFormDesc(e.target.value)}
                            className="desc-input"
                        />
                        <select value={newFormType} onChange={e => setNewFormType(e.target.value)}>
                            <option value="Masala">Masala</option>
                            <option value="Flora">Flora</option>
                            <option value="Dipped">Dipped</option>
                        </select>
                        <button type="submit"><Plus size={18} /> Create Pattern</button>
                    </form>
                </div>

                {/* Main Edit Area */}
                <div className="formulation-editor">
                    {!selectedFormulation ? (
                        <div className="empty-state">
                            <FlaskConical size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            Select a formulation to edit its composition
                        </div>
                    ) : (
                        <>
                            <div className="editor-header">
                                <div>
                                    <h2>{selectedFormulation.name}</h2>
                                    <p className="subtitle">Raw material mix ratio per 1 Unit of Output</p>
                                </div>
                                <div className="header-actions">
                                    <button className="delete-btn-header" onClick={handleDeleteFormulation} title="Delete Formulation">
                                        <Trash2 size={18} />
                                    </button>
                                    <button className="save-btn" onClick={handleSaveIngredients}>
                                        <Save size={18} />
                                        {saveStatus || 'Save Ingredients'}
                                    </button>
                                </div>
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
                                                            <option key={rm.id} value={rm.name}>{rm.name} ({rm.category})</option>
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
            </div >
        </div>
    );
};

export default FormulationManager;

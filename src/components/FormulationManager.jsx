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
            const current = formulations.find(f => f.id === selectedFormulation.id);
            if (current && current.ingredients) {
                // Deep copy to prevent mutation of the global state
                setIngredients(JSON.parse(JSON.stringify(current.ingredients)));
            } else {
                setIngredients([]);
            }
        } else {
            setIngredients([]);
        }
    }, [selectedFormulation]);


    const fetchRawMaterials = () => {
        const savedItems = localStorage.getItem('productItems');
        if (savedItems) {
            setRawMaterials(JSON.parse(savedItems));
        } else {
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
        // Create a copy of the item to avoid mutating the object reference directly
        newIngredients[index] = { ...newIngredients[index], [field]: value };
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
        <div className="formulation-page">
            {/* 1. Header Section */}
            <header className="formulation-header">
                <div className="brand-section">
                    <Link to="/inventory" title="Back to Hub">
                        <ArrowLeft size={24} color="var(--text-secondary)" />
                    </Link>
                    <div className="brand-icon">FM</div>
                    <div className="header-title">
                        <h1>Formulation Manager</h1>
                        <p>Create & Manage Production Recipes</p>
                    </div>
                </div>
            </header>

            {/* 2. Main Layout */}
            <div className="formulation-layout">
                {/* Left Sidebar: List & Create */}
                <aside className="recipe-sidebar">
                    <div className="sidebar-header">
                        <h3>Saved Recipes</h3>
                    </div>

                    <div className="recipe-list">
                        {formulations.map(f => (
                            <div
                                key={f.id}
                                className={`recipe-item ${selectedFormulation?.id === f.id ? 'active' : ''}`}
                                onClick={() => setSelectedFormulation(f)}
                            >
                                <div className="item-info">
                                    <span className="item-name">{f.name}</span>
                                    <span className="item-badge">{f.type}</span>
                                </div>
                                <ChevronRight size={16} color="var(--text-secondary)" />
                            </div>
                        ))}
                    </div>

                    <form className="create-form" onSubmit={handleCreateFormulation}>
                        <input
                            type="text"
                            placeholder="New Recipe Name"
                            value={newFormName}
                            onChange={e => setNewFormName(e.target.value)}
                            required
                        />
                        <select value={newFormType} onChange={e => setNewFormType(e.target.value)}>
                            <option value="Masala">Masala</option>
                            <option value="Flora">Flora</option>
                            <option value="Dipped">Dipped</option>
                        </select>
                        <button type="submit" className="btn-create">
                            <Plus size={18} /> Create New
                        </button>
                    </form>
                </aside>

                {/* Right Panel: Editor */}
                <main className="editor-panel">
                    {!selectedFormulation ? (
                        <div className="empty-state">
                            <FlaskConical size={64} strokeWidth={1} style={{ opacity: 0.3 }} />
                            <h3>Select a recipe to modify</h3>
                            <p>Configure raw material mix ratios per unit output.</p>
                        </div>
                    ) : (
                        <>
                            <div className="editor-header">
                                <div className="editor-title">
                                    <h2>{selectedFormulation.name}</h2>
                                    <p>{selectedFormulation.type} Formulation • Mix per 1 Unit</p>
                                </div>
                                <div className="editor-actions">
                                    <button className="btn-icon-danger" onClick={handleDeleteFormulation} title="Delete">
                                        <Trash2 size={20} />
                                    </button>
                                    <button className="btn-save" onClick={handleSaveIngredients}>
                                        <Save size={18} />
                                        {saveStatus || 'Save Ingredients'}
                                    </button>
                                </div>
                            </div>

                            <div className="table-scroll-area">
                                <table className="ing-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40%' }}>Raw Material</th>
                                            <th style={{ width: '30%' }}>Quantity</th>
                                            <th style={{ width: '20%' }}>Unit</th>
                                            <th style={{ width: '10%' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ingredients.map((ing, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <select
                                                        className="table-select"
                                                        value={ing.raw_material_id}
                                                        onChange={e => handleIngredientChange(index, 'raw_material_id', e.target.value)}
                                                    >
                                                        <option value="">Select Material...</option>
                                                        {rawMaterials.map(rm => (
                                                            <option key={rm.id} value={rm.name}>{rm.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        step="0.0001"
                                                        className="table-input"
                                                        value={ing.quantity_per_unit || ''}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            handleIngredientChange(index, 'quantity_per_unit', val === '' ? '' : parseFloat(val));
                                                        }}
                                                    />
                                                </td>
                                                <td>KG</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button className="btn-remove" onClick={() => handleRemoveIngredient(index)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="footer-actions">
                                <button className="btn-add-row" onClick={handleAddIngredientRow}>
                                    <Plus size={16} /> Add Ingredient Row
                                </button>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default FormulationManager;

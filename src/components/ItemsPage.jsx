import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Search, Package, Tag, Info, AlertCircle } from 'lucide-react';
import './ItemsPage.css';

const ItemsPage = () => {
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('productItems');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'Sandalwood Supreme', category: 'Premium Masala' },
            { id: 2, name: 'Rose Petals', category: 'Flora' },
            { id: 3, name: 'Oudh Aura', category: 'Dipped' }
        ];
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [newItem, setNewItem] = useState({ name: '', category: 'Flora' });
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        localStorage.setItem('productItems', JSON.stringify(items));
    }, [items]);

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItem.name) {
            alert("Please fill in the Item Name");
            return;
        }

        const item = {
            ...newItem,
            id: Date.now()
        };

        setItems([item, ...items]);
        setNewItem({ name: '', category: 'Flora' });
        setShowAddForm(false);
    };

    const handleDeleteItem = (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="items-page">
            <header className="items-header">
                <div className="header-left">
                    <Link to="/" className="back-btn">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="brand-logo">
                        <Package size={28} className="logo-icon" />
                        <h1>Product Catalog</h1>
                    </div>
                </div>
                <div className="header-right">
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="add-main-btn" onClick={() => setShowAddForm(!showAddForm)}>
                        <Plus size={20} />
                        <span>Add Item</span>
                    </button>
                </div>
            </header>

            <main className="items-content">
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="add-form-wrapper"
                        >
                            <form onSubmit={handleAddItem} className="add-item-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label><Tag size={16} /> Item Name</label>
                                        <input
                                            type="text"
                                            className="item-input"
                                            placeholder="Enter item name"
                                            value={newItem.name}
                                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Info size={16} /> Category</label>
                                        <select
                                            className="item-select"
                                            value={newItem.category}
                                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                        >
                                            <option value="Flora">Flora</option>
                                            <option value="Premium Masala">Premium Masala</option>
                                            <option value="Dipped">Dipped</option>
                                            <option value="Dhoop">Dhoop</option>
                                            <option value="Cones">Cones</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                                    <button type="submit" className="submit-btn">Save Item</button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="items-grid">
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="item-card"
                            >
                                <div className="card-header">
                                    <span className="category-badge">{item.category}</span>
                                    <button className="delete-btn" onClick={() => handleDeleteItem(item.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="card-body">
                                    <h3>{item.name}</h3>
                                </div>
                                <div className="card-footer">
                                    <div className="stock-info">Available for Selection</div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="no-items">
                            <AlertCircle size={48} />
                            <p>No items found matching your search.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ItemsPage;

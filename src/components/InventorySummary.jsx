import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Download } from 'lucide-react';
import './InventorySummary.css';

const InventorySummary = () => {
    // 1. Data Loading from LocalStorage
    const [grnData, setGrnData] = useState([]);
    const [dsuData, setDsuData] = useState([]);
    const [sppData, setSppData] = useState([]);
    const [spuData, setSpuData] = useState([]);
    const [fgiData, setFgiData] = useState([]);
    const [gdnData, setGdnData] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setGrnData(JSON.parse(localStorage.getItem('inventoryData') || '[]'));
        setDsuData(JSON.parse(localStorage.getItem('storeUpdateData') || '[]'));
        setSppData(JSON.parse(localStorage.getItem('sparePartsPurchaseData') || '[]'));
        setSpuData(JSON.parse(localStorage.getItem('sparePartsUpdateData') || '[]'));
        setFgiData(JSON.parse(localStorage.getItem('finishedGoodsData') || '[]'));
        setGdnData(JSON.parse(localStorage.getItem('goodsDispatchData') || '[]'));
    };

    // 2. Initial Data Definitions (from User Request)
    const rawMaterialsList = [
        { name: 'Charcoal (SS Enterprise)', initial: 0 },
        { name: 'Charcoal (RC Enterprise)', initial: 0 },
        { name: 'Sawdust (SS Pulverising)', initial: 0 },
        { name: 'Joss', initial: 0 },
        { name: 'Guar Gum', initial: 0 },
        { name: 'Potassium', initial: 0 },
        { name: 'CH - 9 Inch Bamboo Stick', initial: 0 },
        { name: 'CH - 8 Inch Bamboo Stick', initial: 0 },
        { name: 'CH - 10 Inch Bamboo Stick', initial: 0 },
        { name: 'Sawdust (Sanjiban Pal)', initial: 0 },
        { name: 'Black Premix', initial: 0 },
    ];

    const finishedGoodsList = [
        { customer: 'ITC', item: 'Black Raw Agarbatti 8 Inch', initial: 0 },
        { customer: 'N Ranga Rao & Sons', item: 'Black Raw Agarbatti 8 Inch', initial: 0 },
        { customer: 'N Ranga Rao & Sons', item: 'Black Raw Agarbatti 9 Inch', initial: 0 },
        { customer: 'N Ranga Rao & Sons', item: 'Black Raw Agarbatti 10 Inch', initial: 0 },
        { customer: 'JFH', item: 'Black Raw Agarbatti 9 Inch', initial: 0 },
        { customer: 'JFH', item: 'Black Raw Agarbatti 12 Inch', initial: 0 },
        { customer: 'Reject/Returns', item: 'Black Raw Agarbatti 8 Inch', initial: 0 },
        { customer: 'Reject/Returns', item: 'Black Raw Agarbatti 9 Inch', initial: 0 },
        { customer: 'Reject/Returns', item: 'Black Raw Agarbatti 10 Inch', initial: 0 },
    ];

    const sparePartsList = [
        "Piston Set HT1", "Piston Set HT2", "Cylinder & Piston HT1", "Cylinder & Piston HT2",
        "Piston Cyliner HT1", "Piston Cyliner HT2", "Piston Rod",
        "Rocket 2.0", "Rocket 2.1", "Rocket 2.2",
        "Die 2.9", "Die 3.0", "Die 2.7", "Die 2.8", "Die 2.85", "Die 3.1", "Die 3.2", "Die 3.5",
        "Sweeping Vane Carbide", "Bowl Carbide", "Bush Bolt", "Pressure Bolt", "Sensor",
        "Sensor Patti Bolt", "Long Spring", "Restart Switch", "Upper Iron Roller",
        "Circuit Board (Old Model)", "Circuit Board (New Model)", "Gear Motor", "DC Motor",
        "Alloy Teeth", "Auto Feeder Regulator B22K", "Auto Feeder Regulator B5K",
        "Small Rubber Roller with Bearing", "SmallRubber Roller without Bearing",
        "Piston Lock", "Iron Bushing", "Piston Bolt", "Oil Cup", "Oil Seal",
        "T-Mold", "T-Mold Wrench", "Cleaning Rod", "Hopper", "Sweeping Vane", "Bowl",
        "Cast Iron Frame", "Sweeping Vane Nut", "Hopper Screw", "Slider Assembly", "Slider",
        "Eccentric Disc with Bolts", "Eccentric Disc without Bolts", "Bearing Bushing",
        "Connecting Rod", "Bearing & Ring", "Rod End Bearing RB1", "Ball Bearing 1204",
        "Bolt - Eccentric Disc", "Stick Feeder Assembly", "Stick Feeder Frame",
        "Sensor Plate", "Roller Plate", "Short Spring",
        "Toggle Switch 2P", "Toggle Switch 3P", "Toggle Switch 6P",
        "Rubber Roller with Bearing", "Rubber Roller without Bearing", "Rubber Roller Sleeve",
        "Upper Rubber Roller", "Iron Roller Set", "Lower Iron Roller", "Lower Iron Roller (No Bearing)",
        "Front Plate of Auto Feeder", "Transformer", "Bracket - Feeder Disc", "Feeder Disc",
        "Small Rubber Roller Sleeve", "Metal Roller", "Connecting Rod CR1", "Connecting Rod CR2",
        "Big CAM", "Gear 1", "Gear 2", "Gear 3", "Gear 4", "Gear 5", "Gear 6",
        "Oil Nipple", "Bearing 6207 Z For Gear 1", "Bearing 6205 For Gear 1",
        "Bearing 6004 Z For Gear 2,3,4,5 & 6", "Oil Seal for Gear - Big", "Oil Seal for Gear - Small",
        "Gear 1 with Bearing", "Gear 2 with Bearing", "Gear 3 with Bearing", "Gear 4 with Bearing",
        "Gear 5 with Bearing", "Gear 6 with Bearing",
        "1 HP Motor", "Chain Coupling", "Gear Box Bottom Plate", "Gear Box Top Plate",
        "Connection Plate Domino", "Adaptor", "INVT Drive", "Cooling Fan", "Gear Shaft",
        "Steel Tray", "Auto Feeder with Stand", "Relay Switch", "Red LED Light",
        "Bearing (6204-2RS) - Main Motor Shaft", "Bearing (Z869) - Feeder Roller",
        "Bearing (Z869) - Feeder Roller - Dong Tam",
        "Old Die 2.8", "Old Die 2.9", "Old Die 3.0", "Old Die 3.5", "Old Die 4.0",
        "Old Rocket Nozzle 2.0", "Old Rocket Nozzle 2.1", "Old Rocket Nozzle 2.2",
        "Piston Oil Seal", "INVT Drive Old", "Bobbin suta", "Bundle suta",
        "Yellow Colour", "Basta - Premix", "Basta - Raw batti"
    ].map(name => ({ name, initial: 0 }));


    // 3. Calculation Helper Functions
    // Helper to normalize strings for comparison (remove extra spaces, lowercase)
    const norm = (str) => (str || '').toString().toLowerCase().trim();

    const calculateRawStock = (itemDef) => {
        // Purchased: From GRN (inventoryData) - sum 'totalKg' where Item matches
        const purchased = grnData
            .filter(d => norm(d.item) === norm(itemDef.name) || norm(d.item).includes(norm(itemDef.name)))
            .reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0);

        // Used: From DSU (storeUpdateData) - sum 'totalKg' (totalKg of Output) where Item matches
        const used = dsuData
            .filter(d => norm(d.item) === norm(itemDef.name) || norm(d.item).includes(norm(itemDef.name)))
            .reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0);

        const current = itemDef.initial + purchased - used;
        return { initial: itemDef.initial, purchased, used, current };
    };

    const calculateSpareStock = (itemDef) => {
        // Purchased: From SPP (sparePartsPurchaseData) - sum 'quantity'
        const purchased = sppData
            .filter(d => norm(d.item) === norm(itemDef.name))
            .reduce((sum, d) => sum + (parseFloat(d.quantity) || 0), 0);

        // Used: From SPU (sparePartsUpdateData) - sum 'quantity'
        const used = spuData
            .filter(d => norm(d.item) === norm(itemDef.name))
            .reduce((sum, d) => sum + (parseFloat(d.quantity) || 0), 0);

        const current = itemDef.initial + purchased - used;
        return { initial: itemDef.initial, purchased, used, current };
    };

    const calculateFGStock = (itemDef) => {
        // Packed: From FGI (finishedGoodsData) - sum 'totalBags' (assuming bags for stock count)
        const packed = fgiData
            .filter(d => norm(d.customerName) === norm(itemDef.customer) && norm(d.item) === norm(itemDef.item))
            .reduce((sum, d) => sum + (parseFloat(d.totalBags) || 0), 0);

        // Dispatched: From GDN (goodsDispatchData) - sum 'totalBags'
        const dispatched = gdnData
            .filter(d => norm(d.customerName) === norm(itemDef.customer) && norm(d.item) === norm(itemDef.item))
            .reduce((sum, d) => sum + (parseFloat(d.totalBags) || 0), 0);

        const current = itemDef.initial + packed - dispatched;
        return { initial: itemDef.initial, packed, dispatched, current };
    };

    const exportSummaryCSV = () => {
        let csv = "Category,Item/Description,Initial (10/11/25),In,Out,Current Stock\n";

        rawMaterialsList.forEach(item => {
            const stock = calculateRawStock(item);
            csv += `Raw Material,${item.name},${stock.initial},${stock.purchased},${stock.used},${stock.current}\n`;
        });

        sparePartsList.forEach(item => {
            const stock = calculateSpareStock(item);
            csv += `Spare Part,${item.name},${stock.initial},${stock.purchased},${stock.used},${stock.current}\n`;
        });

        finishedGoodsList.forEach(item => {
            const stock = calculateFGStock(item);
            // Escape names with commas
            const name = `"${item.customer} - ${item.item}"`;
            csv += `Finished Goods,${name},${stock.initial},${stock.packed},${stock.dispatched},${stock.current}\n`;
        });

        const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "inventory_summary.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="inventory-summary-container">
            <header className="summary-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link to="/inventory" style={{ opacity: 0.7 }} title="Back to Inventory Hub">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="brand-icon-summary">SUM</div>
                    <h1>Stock Summary Reference</h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={loadData} title="Refresh Data">
                        <RefreshCw size={16} style={{ marginRight: '5px' }} /> Refresh
                    </button>
                    <button className="btn btn-primary" onClick={exportSummaryCSV}>
                        <Download size={16} style={{ marginRight: '5px' }} /> Export Summary
                    </button>
                </div>
            </header>

            <div className="summary-sections">

                {/* 1. Raw Materials */}
                <section className="summary-section">
                    <div className="section-title">RAW MATERIAL STOCK</div>
                    <div className="summary-table-container">
                        <table className="summary-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Closing Stock (10/11/25)</th>
                                    <th>Total Purchased (Kg)</th>
                                    <th>Used for Production (Kg)</th>
                                    <th>Current In Stock (Kg)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rawMaterialsList.map((item, index) => {
                                    const stock = calculateRawStock(item);
                                    return (
                                        <tr key={index}>
                                            <td>{item.name}</td>
                                            <td>{stock.initial}</td>
                                            <td className="stock-positive">{stock.purchased !== 0 ? stock.purchased.toFixed(2) : '-'}</td>
                                            <td className="stock-negative">{stock.used !== 0 ? stock.used.toFixed(2) : '-'}</td>
                                            <td style={{ fontWeight: 'bold' }}>{stock.current.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 2. Finished Goods */}
                <section className="summary-section">
                    <div className="section-title">FINISHED GOODS STOCK (Bags/Bundles)</div>
                    <div className="summary-table-container">
                        <table className="summary-table">
                            <thead>
                                <tr>
                                    <th>Customer Name</th>
                                    <th>Description</th>
                                    <th>Closing Stock (10/11/25)</th>
                                    <th>Total Bundled & Packed</th>
                                    <th>Total Dispatched</th>
                                    <th>Current In Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {finishedGoodsList.map((item, index) => {
                                    const stock = calculateFGStock(item);
                                    return (
                                        <tr key={index}>
                                            <td>{item.customer}</td>
                                            <td>{item.item}</td>
                                            <td>{stock.initial}</td>
                                            <td className="stock-positive">{stock.packed !== 0 ? stock.packed : '-'}</td>
                                            <td className="stock-negative">{stock.dispatched !== 0 ? stock.dispatched : '-'}</td>
                                            <td style={{ fontWeight: 'bold' }}>{stock.current}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 3. Spare Parts */}
                <section className="summary-section">
                    <div className="section-title">SPARE PARTS STOCK</div>
                    <div className="summary-table-container">
                        <table className="summary-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Closing Stock (10/11/25)</th>
                                    <th>Total Purchased</th>
                                    <th>Used</th>
                                    <th>Current In Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sparePartsList.map((item, index) => {
                                    const stock = calculateSpareStock(item);
                                    return (
                                        <tr key={index}>
                                            <td>{item.name}</td>
                                            <td>{stock.initial}</td>
                                            <td className="stock-positive">{stock.purchased !== 0 ? stock.purchased : '-'}</td>
                                            <td className="stock-negative">{stock.used !== 0 ? stock.used : '-'}</td>
                                            <td style={{ fontWeight: 'bold' }}>{stock.current}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default InventorySummary;

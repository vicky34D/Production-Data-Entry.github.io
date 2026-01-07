// Initial data for Intense Sticks ERP
export const RAW_MATERIALS = [
    { id: 'RM001', name: 'Bamboo Sticks (8")', category: 'Raw Base', unit: 'Kg', currentStock: 500, reorderLevel: 100, costPerUnit: 45 },
    { id: 'RM002', name: 'Charcoal Powder', category: 'Raw Powder', unit: 'Kg', currentStock: 1200, reorderLevel: 200, costPerUnit: 12 },
    { id: 'RM003', name: 'Jigat Powder', category: 'Raw Powder', unit: 'Kg', currentStock: 300, reorderLevel: 50, costPerUnit: 85 },
    { id: 'RM004', name: 'Saw Dust', category: 'Raw Powder', unit: 'Kg', currentStock: 800, reorderLevel: 150, costPerUnit: 5 },
    { id: 'RM005', name: 'Rose Perfume', category: 'Fragrance', unit: 'Ltr', currentStock: 50, reorderLevel: 10, costPerUnit: 1200 },
    { id: 'RM006', name: 'Sandal Perfume', category: 'Fragrance', unit: 'Ltr', currentStock: 40, reorderLevel: 10, costPerUnit: 1500 },
    { id: 'RM007', name: 'DEP Oil', category: 'Oil', unit: 'Ltr', currentStock: 200, reorderLevel: 50, costPerUnit: 110 },
    { id: 'RM008', name: 'Inner Boxes (Rose)', category: 'Packing', unit: 'Pcs', currentStock: 5000, reorderLevel: 1000, costPerUnit: 2.5 },
    { id: 'RM009', name: 'Master Cartons', category: 'Packing', unit: 'Pcs', currentStock: 500, reorderLevel: 50, costPerUnit: 15 }
];

export const FINISHED_GOODS = [
    { id: 'FG001', name: 'Rose Masala Sticks', category: 'Premium', unit: 'Dozens', currentStock: 50, sellingPrice: 120 },
    { id: 'FG002', name: 'Sandalwood Gold', category: 'Premium', unit: 'Dozens', currentStock: 120, sellingPrice: 150 },
    { id: 'FG003', name: 'Jasmine Daily', category: 'Economy', unit: 'Dozens', currentStock: 300, sellingPrice: 60 }
];

export const FORMULATIONS = [
    {
        id: 'RCP001',
        name: 'Standard Masala Mix (100kg)',
        outputItem: 'Raw Agarbatti (Unscented)',
        outputQty: 100,
        ingredients: [
            { itemId: 'RM002', name: 'Charcoal Powder', qty: 40 },
            { itemId: 'RM004', name: 'Saw Dust', qty: 40 },
            { itemId: 'RM003', name: 'Jigat Powder', qty: 20 }
        ]
    },
    {
        id: 'RCP002',
        name: 'Rose Dipping Solution (10L)',
        outputItem: 'Rose Perfume Mix',
        outputQty: 10,
        ingredients: [
            { itemId: 'RM005', name: 'Rose Perfume', qty: 2 },
            { itemId: 'RM007', name: 'DEP Oil', qty: 8 }
        ]
    }
];

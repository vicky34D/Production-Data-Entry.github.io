import { RAW_MATERIALS, FINISHED_GOODS, FORMULATIONS } from './seedData';
import { safeGet, safeSet } from './storage';

export const initializeERP = () => {
    // Check if data exists, if not, seed it
    const existingRM = safeGet('rawMaterials', null);
    if (!existingRM || existingRM.length === 0) {
        safeSet('rawMaterials', RAW_MATERIALS);
        console.log('Seeded Raw Materials');
    }

    const existingFG = safeGet('finishedGoods', null);
    if (!existingFG || existingFG.length === 0) {
        safeSet('finishedGoods', FINISHED_GOODS);
        console.log('Seeded Finished Goods');
    }

    const existingFormulas = safeGet('formulations', null);
    if (!existingFormulas || existingFormulas.length === 0) {
        safeSet('formulations', FORMULATIONS);
        console.log('Seeded Formulations');
    }
};

export const getInventoryBalance = () => {
    // Calculate live balance from transactions if implemented, or return current snapshot
    return {
        rawMaterials: safeGet('rawMaterials', []),
        finishedGoods: safeGet('finishedGoods', [])
    };
};

export const recordTransaction = (transaction) => {
    // transaction: { type: 'GRN'|'PROD'|'DISPATCH', details: {...} }
    const history = safeGet('transactionHistory', []);
    const newTx = { ...transaction, id: Date.now(), timestamp: new Date().toISOString() };
    safeSet('transactionHistory', [newTx, ...history]);

    // Update Master Stock
    if (transaction.type === 'GRN') {
        const materials = safeGet('rawMaterials', []);
        const updated = materials.map(m => {
            if (m.id === transaction.itemId) {
                return { ...m, currentStock: m.currentStock + transaction.qty };
            }
            return m;
        });
        safeSet('rawMaterials', updated);
    } else if (transaction.type === 'PRODUCTION') {
        // Complex logic: Deduct RM, Add FG (handled in component usually, or here)
    }

    return newTx;
};

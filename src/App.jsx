import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import TodoList from './components/TodoList';
import InventoryHub from './components/InventoryHub';
import GoodsReceivedNote from './components/GoodsReceivedNote';
import DailyStoreUpdate from './components/DailyStoreUpdate';
import SparePartsPurchase from './components/SparePartsPurchase';
import SparePartsUpdate from './components/SparePartsUpdate';
import FinishedGoodsInventory from './components/FinishedGoodsInventory';
import GoodsDispatchNote from './components/GoodsDispatchNote';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/todo" element={<TodoList />} />
        <Route path="/inventory" element={<InventoryHub />} />
        <Route path="/inventory/grn" element={<GoodsReceivedNote />} />
        <Route path="/inventory/dsu" element={<DailyStoreUpdate />} />
        <Route path="/inventory/spp" element={<SparePartsPurchase />} />
        <Route path="/inventory/spu" element={<SparePartsUpdate />} />
        <Route path="/inventory/fgi" element={<FinishedGoodsInventory />} />
        <Route path="/inventory/gdn" element={<GoodsDispatchNote />} />
      </Routes>
    </Router>
  );
}

export default App;

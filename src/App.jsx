import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import TodoList from './components/TodoList';
import InventoryHub from './components/InventoryHub';
import GoodsReceivedNote from './components/GoodsReceivedNote';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/todo" element={<TodoList />} />
        <Route path="/inventory" element={<InventoryHub />} />
        <Route path="/inventory/grn" element={<GoodsReceivedNote />} />
      </Routes>
    </Router>
  );
}

export default App;

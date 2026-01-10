import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

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
import InventorySummary from './components/InventorySummary';
import ItemsPage from './components/ItemsPage';
import FormulationManager from './components/FormulationManager';
import ProductionPlanner from './components/ProductionPlanner';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import ProductionScheduler from './components/ProductionScheduler';
import CustomReportBuilder from './components/CustomReportBuilder';
import Login from './components/Login';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on mount
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsAuthenticated(isLoggedIn);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        } />

        <Route element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout} />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/todo" element={<TodoList />} />

          <Route path="/inventory" element={<InventoryHub />} />
          <Route path="/inventory/grn" element={<GoodsReceivedNote />} />
          <Route path="/inventory/dsu" element={<DailyStoreUpdate />} />
          <Route path="/inventory/spp" element={<SparePartsPurchase />} />
          <Route path="/inventory/spu" element={<SparePartsUpdate />} />
          <Route path="/inventory/fgi" element={<FinishedGoodsInventory />} />
          <Route path="/inventory/gdn" element={<GoodsDispatchNote />} />
          <Route path="/inventory/summary" element={<InventorySummary />} />

          <Route path="/items" element={<ItemsPage />} />
          <Route path="/formulations" element={<FormulationManager />} />
          <Route path="/plan" element={<ProductionPlanner />} />
          <Route path="/analytics" element={<AdvancedAnalytics />} />
          <Route path="/scheduler" element={<ProductionScheduler />} />
          <Route path="/reports" element={<CustomReportBuilder />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

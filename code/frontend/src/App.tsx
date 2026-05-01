/**
 * SentinelScan App Root Component
 * Path: src/App.tsx
 *
 * Main application component that handles routing and navigation.
 * Defines routes for public pages (Index, Login) and protected dashboard routes.
 */
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardIndex } from './pages/Dashboard/Index';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardIndex />} />
        <Route path="scans" element={<div className="text-white p-6">Scans Page (Coming Soon)</div>} />
        <Route path="templates" element={<div className="text-white p-6">Templates Page (Coming Soon)</div>} />
        <Route path="reports" element={<div className="text-white p-6">Reports Page (Coming Soon)</div>} />
        <Route path="settings" element={<div className="text-white p-6">Settings Page (Coming Soon)</div>} />
      </Route>
    </Routes>
  );
}

export default App;
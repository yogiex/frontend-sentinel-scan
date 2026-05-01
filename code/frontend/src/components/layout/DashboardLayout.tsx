/**
 * SentinelScan Dashboard Layout Component
 * Path: src/components/layout/DashboardLayout.tsx
 *
 * Main layout wrapper that combines Sidebar, Header, and Outlet for nested routes.
 * Uses react-router-dom's Outlet to render child routes.
 */
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
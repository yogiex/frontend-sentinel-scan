/**
 * SentinelScan App Root Component
 * Path: src/App.tsx
 *
 * Main application component that handles routing and navigation.
 * Defines routes for public pages (Index, Login) and protected dashboard routes.
 */
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LoggingProvider } from './contexts/LoggingContext';
import { TelemetryProvider } from './components/TelemetryProvider';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useNavigationLogger } from './hooks/useNavigationLogger';
import Index from './pages/Index';
import Login from './pages/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardIndex } from './pages/Dashboard/Index';
import { AllScans } from './pages/Dashboard/Scans/AllScans';
import { MyScans } from './pages/Dashboard/Scans/MyScans';
import { TrashScans } from './pages/Dashboard/Scans/TrashScans';
import { NewScan } from './pages/Dashboard/Scans/NewScan';
import { ScanDetail } from './pages/Dashboard/Scans/ScanDetail';
import { ScanProgress } from './pages/Dashboard/Scans/ScanProgress';
import { ScanResultDetail } from './pages/Dashboard/Scans/ScanResultDetail';
import { Templates } from './pages/Dashboard/Templates/Templates';
import { UserManagement } from './pages/Dashboard/Users/Users';
import { Reports } from './pages/Dashboard/Reports/Reports';
import { Settings } from './pages/Dashboard/Settings/Settings';
import { LogViewer } from './pages/Dashboard/LogViewer';
import { TicketList } from './pages/Dashboard/Tickets/TicketList';
import { TicketDetail } from './pages/Dashboard/Tickets/TicketDetail';
import { CreateTicket } from './pages/Dashboard/Tickets/CreateTicket';
import { KanbanBoardPage } from './pages/Dashboard/Tickets/KanbanBoardPage';

function App() {
  // Enable automatic navigation logging for all route changes
  useNavigationLogger();

  return (
    <LoggingProvider>
      <TelemetryProvider>
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardIndex />} />
              
              {/* Scans Subtree */}
              <Route path="scans">
                <Route index element={<AllScans />} />
                <Route path="all" element={<AllScans />} />
                <Route path="new" element={<NewScan />} />
                <Route path=":id/progress" element={<ScanProgress />} />
                <Route path=":id" element={<ScanDetail />} />
                <Route path=":scanId/results/:vulnId" element={<ScanResultDetail />} />
                <Route path="my-scans" element={<MyScans />} />
                <Route path="trash" element={<TrashScans />} />
              </Route>
              
              <Route path="templates" element={<Templates />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="logs" element={<LogViewer />} />
              
                  {/* Tickets Subtree */}
                  <Route path="tickets">
                    <Route index element={<TicketList />} />
                    <Route path="new" element={<CreateTicket />} />
                    <Route path="kanban" element={<KanbanBoardPage />} />
                    <Route path=":id" element={<TicketDetail />} />
                  </Route>
            </Route>
          </Routes>
          {/* Sonner Toast Provider */}
          <Toaster 
            position="top-right" 
            richColors 
            closeButton 
            toastOptions={{
              duration: 4000,
            }}
          />
        </ErrorBoundary>
      </TelemetryProvider>
    </LoggingProvider>
  );
}

export default App;

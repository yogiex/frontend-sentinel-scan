/**
 * SentinelScan App Root Component
 * Path: src/App.tsx
 *
 * Route table: `docs/ROUTES.md`.
 * Public routes + guarded dashboard subtree. Judul header diturunkan dari route
 * (`src/app/nav.ts`), bukan dari map manual.
 */
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LoggingProvider } from './contexts/LoggingContext';
import { TelemetryProvider } from './components/TelemetryProvider';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useNavigationLogger } from './hooks/useNavigationLogger';
import { GuestOnly, RequireAuth, RequirePermission } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { NotFound } from './app/NotFound';
import { Placeholder } from './app/Placeholder';

import Index from './pages/Index';
import Login from './pages/Login';
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
  useNavigationLogger();

  return (
    <LoggingProvider>
      <TelemetryProvider>
        <ErrorBoundary>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route
              path="/login"
              element={
                <GuestOnly>
                  <Login />
                </GuestOnly>
              }
            />
            <Route
              path="/register"
              element={
                <GuestOnly>
                  <Placeholder
                    title="Registration is not open yet"
                    description="Accounts are created by an administrator. Ask your security lead for an invite."
                  />
                </GuestOnly>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <GuestOnly>
                  <Placeholder
                    title="Password reset is not available yet"
                    description="Contact an administrator to reset your password."
                  />
                </GuestOnly>
              }
            />

            {/* Protected dashboard */}
            <Route element={<RequireAuth />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardIndex />} />

                <Route path="scans">
                  <Route index element={<AllScans />} />
                  <Route path="all" element={<Navigate to="/dashboard/scans" replace />} />
                  <Route path="new" element={<NewScan />} />
                  <Route path="my-scans" element={<MyScans />} />
                  <Route path="trash" element={<TrashScans />} />
                  <Route path=":id/progress" element={<ScanProgress />} />
                  <Route path=":scanId/results/:vulnId" element={<ScanResultDetail />} />
                  <Route path=":id" element={<ScanDetail />} />
                </Route>

                <Route path="templates" element={<Templates />} />
                <Route
                  path="users"
                  element={
                    <RequirePermission permission="user_management">
                      <UserManagement />
                    </RequirePermission>
                  }
                />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="logs" element={<LogViewer />} />

                <Route path="tickets">
                  <Route index element={<TicketList />} />
                  <Route path="new" element={<CreateTicket />} />
                  <Route path="kanban" element={<KanbanBoardPage />} />
                  <Route path=":id" element={<TicketDetail />} />
                </Route>
              </Route>
            </Route>

            {/* Unknown URLs land here instead of a blank screen */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{ duration: 4000 }}
          />
        </ErrorBoundary>
      </TelemetryProvider>
    </LoggingProvider>
  );
}

export default App;

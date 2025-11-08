import { Routes, Route, Navigate } from 'react-router-dom';
import { hasAnyRole } from './lib/authSim';
import type { UserRole } from './types/models';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

// Pages
import Home from './routes/Home';
import MaintenanceNew from './routes/MaintenanceNew';
import MaintenanceMy from './routes/MaintenanceMy';
import MaintenanceDetail from './routes/MaintenanceDetail';
import CommunityList from './routes/CommunityList';
import CommunityThread from './routes/CommunityThread';
import Profile from './routes/Profile';
import StaffTickets from './routes/StaffTickets';
import StaffKB from './routes/StaffKB';
import AdminNoticesOutages from './routes/AdminNoticesOutages';
import AdminUsers from './routes/AdminUsers';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  if (!hasAnyRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />

          {/* Renter Routes */}
          <Route
            path="/maintenance/new"
            element={
              <ProtectedRoute allowedRoles={['Renter']}>
                <MaintenanceNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance/my"
            element={
              <ProtectedRoute allowedRoles={['Renter']}>
                <MaintenanceMy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance/:ticketId"
            element={
              <ProtectedRoute allowedRoles={['Renter']}>
                <MaintenanceDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute allowedRoles={['Renter', 'Staff', 'Admin']}>
                <CommunityList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community/:threadId"
            element={
              <ProtectedRoute allowedRoles={['Renter', 'Staff', 'Admin']}>
                <CommunityThread />
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff/tickets"
            element={
              <ProtectedRoute allowedRoles={['Staff', 'Admin']}>
                <StaffTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/tickets/:ticketId"
            element={
              <ProtectedRoute allowedRoles={['Staff', 'Admin']}>
                <MaintenanceDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/kb"
            element={
              <ProtectedRoute allowedRoles={['Staff', 'Admin']}>
                <StaffKB />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/notices"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminNoticesOutages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

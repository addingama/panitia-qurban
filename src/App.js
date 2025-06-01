import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminMasterQRPage from './pages/AdminMasterQRPage';
import AdminTahunKuponPage from './pages/AdminTahunKuponPage';
import { Button } from 'antd';

function PanitiaPage() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };
  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Panitia Page</h2>
        <Button onClick={handleLogout} type="primary" danger>Logout</Button>
      </div>
      <p>Selamat datang, Panitia!</p>
    </div>
  );
}

function RequireAuth({ children, role }) {
  const userRole = localStorage.getItem('role');
  if (!userRole) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to={`/${userRole}`} replace />;
  return children;
}

function AdminLayout() {
  const navigate = useNavigate();
  const handleMenuClick = (key) => {
    if (key === 'master') navigate('/admin');
    if (key === 'tahun') navigate('/admin/tahun');
  };
  // Tentukan menu aktif berdasarkan path
  const path = window.location.pathname;
  let activeKey = 'master';
  if (path.startsWith('/admin/tahun')) activeKey = 'tahun';
  return (
    <>
      {/* Outlet akan render halaman child (MasterQR atau Tahun) */}
      <Outlet context={{ activeKey, onMenuClick: handleMenuClick }} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminMasterQRPage />} />
          <Route path="tahun" element={<AdminTahunKuponPage />} />
        </Route>
        <Route
          path="/panitia"
          element={
            <RequireAuth role="panitia">
              <PanitiaPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

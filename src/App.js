import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminMasterQRPage from './pages/AdminMasterQRPage';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <AdminMasterQRPage />
            </RequireAuth>
          }
        />
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

export default App;

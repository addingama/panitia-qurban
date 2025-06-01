import React from 'react';
import LoginPage from './pages/LoginPage';
import { Button } from 'antd';

function handleLogout() {
  localStorage.removeItem('role');
  window.location.reload();
}

function AdminPage() {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Admin Page</h2>
        <Button onClick={handleLogout} type="primary" danger>Logout</Button>
      </div>
      <p>Selamat datang, Admin!</p>
    </div>
  );
}

function PanitiaPage() {
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

function App() {
  const role = localStorage.getItem('role');

  if (!role) {
    return <LoginPage />;
  }

  if (role === 'admin') {
    return <AdminPage />;
  }
  if (role === 'panitia') {
    return <PanitiaPage />;
  }
  // fallback jika role tidak valid
  return <LoginPage />;
}

export default App;

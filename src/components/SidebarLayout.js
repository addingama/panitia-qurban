import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  QrcodeOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

const { Sider, Content } = Layout;

const adminMenu = [
  { key: 'master', icon: <QrcodeOutlined />, label: 'Master QR' },
  { key: 'tahun', icon: <CalendarOutlined />, label: 'Tahun' },
  { key: 'aktivasi', icon: <ThunderboltOutlined />, label: 'Aktivasi QR' },
  // Tambahkan menu lain untuk admin di sini
];

const panitiaMenu = [
  { key: 'scan', icon: <DashboardOutlined />, label: 'Scan Pengambilan' },
  // Tambahkan menu lain untuk panitia di sini
];

export default function SidebarLayout({ children, activeKey, onMenuClick }) {
  const role = localStorage.getItem('role');
  const menuItems = role === 'admin' ? adminMenu : panitiaMenu;
  const [collapsed, setCollapsed] = useState(false);

  // Responsive: auto collapse on small screen
  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
      >
        <div>
          <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 20, letterSpacing: 1, borderBottom: '1px solid #f0f0f0' }}>
            Qurban App
          </div>
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            style={{ borderRight: 0, marginTop: 16 }}
            items={menuItems}
            onClick={({ key }) => onMenuClick && onMenuClick(key)}
          />
        </div>
        <div style={{ padding: collapsed ? 0 : 16, width: '100%' }}>
          <Button icon={<LogoutOutlined />} danger block style={{ width: '100%', marginTop: 8 }} onClick={handleLogout}>
            {!collapsed && 'Logout'}
          </Button>
        </div>
      </Sider>
      <Layout>
        <Content style={{ margin: 0, padding: 24, minHeight: 280, background: '#f8fafd' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
} 
import React from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  QrcodeOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

const { Sider, Content } = Layout;

const adminMenu = [
  { key: 'master', icon: <QrcodeOutlined />, label: 'Master QR' },
  { key: 'tahun', icon: <CalendarOutlined />, label: 'Tahun' },
  // Tambahkan menu lain untuk admin di sini
];

const panitiaMenu = [
  { key: 'scan', icon: <DashboardOutlined />, label: 'Scan Pengambilan' },
  // Tambahkan menu lain untuk panitia di sini
];

export default function SidebarLayout({ children, activeKey, onMenuClick }) {
  const role = localStorage.getItem('role');
  const menuItems = role === 'admin' ? adminMenu : panitiaMenu;

  const handleLogout = () => {
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} style={{ background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
        <div style={{ padding: 16 }}>
          <Button icon={<LogoutOutlined />} danger block onClick={handleLogout}>
            Logout
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
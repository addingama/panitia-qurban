import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  QrcodeOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Sider, Content, Header } = Layout;

const adminMenu = [
  { key: 'master', icon: <QrcodeOutlined />, label: 'Master QR' },
  { key: 'tahun', icon: <CalendarOutlined />, label: 'Tahun' },
  { key: 'aktivasi', icon: <ThunderboltOutlined />, label: 'Aktivasi QR' },
  { key: 'kupon-aktif', icon: <CheckCircleOutlined />, label: 'Kupon Aktif Tahun Ini' },
  // Tambahkan menu lain untuk admin di sini
];

const panitiaMenu = [
  { key: 'scan', icon: <DashboardOutlined />, label: 'Scan Pengambilan' },
  // Tambahkan menu lain untuk panitia di sini
];

export default function SidebarLayout({ children, activeKey, onMenuClick }) {
  const role = localStorage.getItem('role');
  const menuItems = role === 'admin' ? adminMenu : panitiaMenu;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [collapsed, setCollapsed] = useState(false);

  // Responsive: switch to topnav on small screen
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
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

  if (isMobile) {
    // Topnav mode
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px #f0f1f2' }}>
          <div style={{ fontWeight: 'bold', fontSize: 18, paddingLeft: 16 }}>Qurban App</div>
          <Menu
            mode="horizontal"
            selectedKeys={[activeKey]}
            items={menuItems}
            onClick={({ key }) => onMenuClick && onMenuClick(key)}
            style={{ flex: 1, minWidth: 0, borderBottom: 'none', justifyContent: 'center' }}
          />
          <Button icon={<LogoutOutlined />} danger style={{ marginRight: 8 }} onClick={handleLogout}>
            Logout
          </Button>
        </Header>
        <Content style={{ margin: 0, padding: 12, minHeight: 280, background: '#f8fafd' }}>
          {children}
        </Content>
      </Layout>
    );
  }

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
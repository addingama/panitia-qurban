import React, { useState } from 'react';
import { Form, Input, Button, Select, Typography, message } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const ROLE_PASSWORDS = {
  admin: 'admin123',
  panitia: 'panitia123',
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    const { role, password } = values;
    if (ROLE_PASSWORDS[role] === password) {
      localStorage.setItem('role', role);
      message.success('Login berhasil!');
      // TODO: Redirect ke halaman sesuai role
      window.location.reload();
    } else {
      message.error('Password salah!');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 350, margin: '80px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #f0f1f2' }}>
      <Title level={3} style={{ textAlign: 'center' }}>Login Panitia Qurban</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="role" label="Login sebagai" rules={[{ required: true, message: 'Pilih role!' }]}> 
          <Select placeholder="Pilih role">
            <Option value="admin">Admin</Option>
            <Option value="panitia">Panitia</Option>
          </Select>
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Masukkan password!' }]}> 
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
} 
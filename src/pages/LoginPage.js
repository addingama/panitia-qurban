import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const EMAIL_ROLE = {
  'admin@qurban.com': 'admin',
  'panitia@qurban.com': 'panitia',
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    const { email, password } = values;
    try {
      await login(email, password);
      const role = EMAIL_ROLE[email];
      if (role) {
        localStorage.setItem('role', role);
        message.success('Login berhasil!');
        navigate(`/${role}`, { replace: true });
      } else {
        message.error('Email tidak terdaftar sebagai admin/panitia!');
      }
    } catch (e) {
      message.error('Email atau password salah!');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 350, margin: '80px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #f0f1f2' }}>
      <Title level={3} style={{ textAlign: 'center' }}>Login Panitia Qurban</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Masukkan email!' }]}> 
          <Input placeholder="Email" type="email" autoComplete="username" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Masukkan password!' }]}> 
          <Input.Password placeholder="Password" autoComplete="current-password" />
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
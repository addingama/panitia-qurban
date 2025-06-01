import React, { useEffect, useState } from 'react';
import { Table, Button, Select, InputNumber, Form, message, Popconfirm, Typography, Tag } from 'antd';
import { getAllKupons, addKupons, deleteKupon } from '../services/kuponService';
import { generateKuponUUID } from '../utils/uuidGenerator';
import { QRCodeCanvas } from 'qrcode.react';
import SidebarLayout from '../components/SidebarLayout';

const { Title } = Typography;
const { Option } = Select;

const MAX_PANITIA = 50;
const MAX_PESERTA = 500;

export default function AdminMasterQRPage() {
  const [kupons, setKupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchKupons = async () => {
    setLoading(true);
    const data = await getAllKupons();
    setKupons(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchKupons();
  }, []);

  const handleAddKupon = async (values) => {
    setLoading(true);
    const { jenis, jumlah } = values;
    const existing = kupons.filter(k => k.jenis === jenis);
    const max = jenis === 'panitia' ? MAX_PANITIA : MAX_PESERTA;
    const sisa = max - existing.length;
    if (jumlah > sisa) {
      message.error(`Sisa kupon ${jenis} yang bisa ditambah: ${sisa}`);
      setLoading(false);
      return;
    }
    const newKupons = generateKuponUUID(jenis === 'panitia' ? jumlah : 0, jenis === 'peserta' ? jumlah : 0)
      .filter(k => !kupons.some(kk => kk.uuid === k.uuid && kk.jenis === k.jenis));
    try {
      await addKupons(newKupons);
      message.success('Berhasil menambah kupon!');
      form.resetFields();
      fetchKupons();
    } catch (e) {
      message.error('Gagal menambah kupon!');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteKupon(id);
      message.success('Kupon dihapus!');
      fetchKupons();
    } catch (e) {
      message.error('Gagal menghapus kupon!');
    }
    setLoading(false);
  };

  const columns = [
    {
      title: 'UUID',
      dataIndex: 'uuid',
      key: 'uuid',
      render: text => <span style={{ fontSize: 12 }}>{text}</span>,
    },
    {
      title: 'Jenis',
      dataIndex: 'jenis',
      key: 'jenis',
      render: jenis => <Tag color={jenis === 'panitia' ? 'blue' : 'green'}>{jenis.toUpperCase()}</Tag>,
      filters: [
        { text: 'Panitia', value: 'panitia' },
        { text: 'Peserta', value: 'peserta' },
      ],
      onFilter: (value, record) => record.jenis === value,
    },
    {
      title: 'QR Code',
      dataIndex: 'uuid',
      key: 'qr',
      render: uuid => <QRCodeCanvas value={uuid} size={48} />,
    },
    {
      title: 'Aksi',
      key: 'aksi',
      render: (_, record) => (
        <Popconfirm title="Hapus kupon ini?" onConfirm={() => handleDelete(record.id)} okText="Ya" cancelText="Batal">
          <Button danger size="small">Hapus</Button>
        </Popconfirm>
      ),
    },
  ];

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
    printWindow.document.write('<h2>Daftar QR Code Kupon Qurban</h2>');
    printWindow.document.write('<div style="display: flex; flex-wrap: wrap; gap: 16px;">');
    kupons.forEach(k => {
      printWindow.document.write(`
        <div style="border:1px solid #ccc; padding:8px; margin:8px; text-align:center; width:140px;">
          <div><strong>${k.jenis.toUpperCase()}</strong></div>
          <div style="margin:8px 0;"><img src="${document.querySelector(`img[alt='qr-${k.uuid}']`)?.src || ''}" width="96" height="96" /></div>
          <div style="font-size:10px;word-break:break-all;">${k.uuid}</div>
        </div>
      `);
    });
    printWindow.document.write('</div></body></html>');
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <SidebarLayout activeKey="master">
      <div style={{ maxWidth: 1000, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 8 }}>
        <Title level={3}>Master Data QR Code Kupon</Title>
        <Form layout="inline" form={form} onFinish={handleAddKupon} style={{ marginBottom: 24 }}>
          <Form.Item name="jenis" label="Jenis Kupon" rules={[{ required: true, message: 'Pilih jenis kupon!' }]}> 
            <Select style={{ width: 120 }} placeholder="Pilih jenis">
              <Option value="panitia">Panitia</Option>
              <Option value="peserta">Peserta</Option>
            </Select>
          </Form.Item>
          <Form.Item name="jumlah" label="Jumlah" rules={[{ required: true, message: 'Masukkan jumlah!' }]}> 
            <InputNumber min={1} max={500} style={{ width: 100 }} placeholder="Jumlah" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>Tambah QR</Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={handlePrint} type="default">Print Massal</Button>
          </Form.Item>
        </Form>
        <Table
          columns={columns}
          dataSource={kupons.map(k => ({ ...k, key: k.id }))}
          loading={loading}
          pagination={{ pageSize: 20 }}
          scroll={{ x: true }}
          bordered
          size="small"
          rowKey="id"
        />
      </div>
    </SidebarLayout>
  );
} 
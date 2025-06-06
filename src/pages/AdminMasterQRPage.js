import React, { useEffect, useState } from 'react';
import { Table, Button, Select, InputNumber, Form, message, Popconfirm, Typography, Tag, Drawer } from 'antd';
import { getAllKupons, addKupons, deleteKupon } from '../services/kuponService';
import { generateKuponUUID } from '../utils/uuidGenerator';
import { QRCodeCanvas } from 'qrcode.react';
import SidebarLayout from '../components/SidebarLayout';
import QRCode from 'qrcode';
import { useOutletContext } from 'react-router-dom';
import { getAllStatusKuponByTahun } from '../services/kuponStatusService';
import { getAllTahunAktif } from '../services/tahunQurbanService';

const { Title } = Typography;
const { Option } = Select;

const MAX_PANITIA = 50;
const MAX_PESERTA = 500;

export default function AdminMasterQRPage() {
  const [kupons, setKupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { activeKey, onMenuClick } = useOutletContext() || {};
  const [preview, setPreview] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [statusKuponAktif, setStatusKuponAktif] = useState({});
  const [tahunAktif, setTahunAktif] = useState(null);

  const fetchTahunAktifAndStatus = async (kuponList) => {
    const tahunList = await getAllTahunAktif();
    const aktif = tahunList.find(t => t.aktif);
    setTahunAktif(aktif);
    if (aktif) {
      const statusList = await getAllStatusKuponByTahun(aktif.tahun);
      const statusMap = {};
      statusList.forEach(s => {
        statusMap[s.uuid] = s.status;
      });
      setStatusKuponAktif(statusMap);
    } else {
      setStatusKuponAktif({});
    }
  };

  const fetchKupons = async () => {
    setLoading(true);
    const data = await getAllKupons();
    setKupons(data);
    await fetchTahunAktifAndStatus(data);
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
      render: (uuid, record) => (
        <span style={{ cursor: 'pointer' }} onClick={() => { setPreview(record); setDrawerOpen(true); }}>
          <QRCodeCanvas value={uuid} size={48} />
        </span>
      ),
    },
    {
      title: 'Status Aktivasi',
      key: 'statusAktif',
      filters: [
        { text: 'Sudah Aktif', value: 'aktif' },
        { text: 'Belum Aktif', value: 'belum' },
      ],
      onFilter: (value, record) => {
        if (!tahunAktif) return false;
        const status = statusKuponAktif[record.uuid];
        if (value === 'aktif') return status === 'aktif' || status === 'diambil';
        if (value === 'belum') return !status;
        return false;
      },
      render: (_, record) => {
        if (!tahunAktif) return <span style={{ color: '#aaa' }}>-</span>;
        const status = statusKuponAktif[record.uuid];
        if (status === 'aktif' || status === 'diambil') {
          return <Tag color="green">Sudah Aktif</Tag>;
        }
        return <Tag color="red">Belum Aktif</Tag>;
      },
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

  const handlePrint = async () => {
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
    printWindow.document.write('<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">');
    for (let i = 0; i < kupons.length; i++) {
      const k = kupons[i];
      const dataUrl = await QRCode.toDataURL(k.uuid, { width: 96, margin: 2 });
      if (i > 0 && i % 25 === 0) {
        printWindow.document.write('</div><div style="page-break-before: always; display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">');
      }
      printWindow.document.write(`
        <div style="border:1px solid #ccc; padding:8px; margin:8px; text-align:center; width:120px; box-sizing:border-box;">
          <div style=\"font-size:14px;\"><strong>${k.jenis.toUpperCase()}</strong></div>
          <div style=\"margin:8px 0;\"><img src=\"${dataUrl}\" width=\"96\" height=\"96\" /></div>
          <div style=\"font-size:10px;word-break:break-all;\">${k.uuid}</div>
        </div>
      `);
    }
    printWindow.document.write('</div></body></html>');
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const handlePrintSelected = async () => {
    if (selectedRows.length === 0) return;
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
    printWindow.document.write('<h2 style="font-size:18px;">Daftar QR Code Kupon Terpilih</h2>');
    printWindow.document.write('<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">');
    for (let i = 0; i < selectedRows.length; i++) {
      const k = selectedRows[i];
      const dataUrl = await QRCode.toDataURL(k.uuid, { width: 96, margin: 2 });
      if (i > 0 && i % 25 === 0) {
        printWindow.document.write('</div><div style="page-break-before: always; display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">');
      }
      printWindow.document.write(`
        <div style="border:1px solid #ccc; padding:8px; margin:8px; text-align:center; width:120px; box-sizing:border-box;">
          <div style=\"font-size:14px;\"><strong>${k.jenis.toUpperCase()}</strong></div>
          <div style=\"margin:8px 0;\"><img src=\"${dataUrl}\" width=\"96\" height=\"96\" /></div>
          <div style=\"font-size:12px;word-break:break-all;\">${k.uuid}</div>
        </div>
      `);
    }
    printWindow.document.write('</div></body></html>');
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  // Hitung jumlah kupon per jenis
  const totalKupon = kupons.length;
  const totalPanitia = kupons.filter(k => k.jenis === 'panitia').length;
  const totalPeserta = kupons.filter(k => k.jenis === 'peserta').length;

  return (
    <SidebarLayout activeKey={activeKey || 'master'} onMenuClick={onMenuClick}>
      <div style={{ maxWidth: '100%', width: '100%', margin: 0, background: '#fff', padding: 24, borderRadius: 8 }}>
        <Title level={3}>Master Data QR Code Kupon</Title>
        <div style={{ marginBottom: 16, fontSize: 16 }}>
          <strong>Total Kupon:</strong> {totalKupon} &nbsp;|&nbsp; 
          <strong>Panitia:</strong> {totalPanitia} &nbsp;|&nbsp; 
          <strong>Peserta:</strong> {totalPeserta}
        </div>
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
          <Form.Item>
            <Button onClick={handlePrintSelected} type="primary" disabled={selectedRows.length === 0}>Print Terpilih</Button>
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
          rowSelection={{
            selectedRowKeys,
            onChange: (keys, rows) => {
              setSelectedRowKeys(keys);
              setSelectedRows(rows);
            },
            preserveSelectedRowKeys: true,
          }}
        />
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Preview QR Code"
          width={340}
        >
          {preview && (
            <div style={{ textAlign: 'center' }}>
              <QRCodeCanvas value={preview.uuid} size={220} />
              <div style={{ marginTop: 16, fontSize: 16 }}>
                <strong>{preview.uuid}</strong>
                <div style={{ fontSize: 14, color: '#888' }}>{preview.jenis}</div>
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </SidebarLayout>
  );
} 
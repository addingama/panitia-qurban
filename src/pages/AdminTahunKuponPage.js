import React, { useEffect, useState } from 'react';
import { Table, Button, Form, InputNumber, Input, Typography, message, Popconfirm, Modal, Drawer, Tag } from 'antd';
import { getAllTahunAktif, addTahunAktif, updateTahunAktif, deleteTahunAktif, setTahunAktif } from '../services/tahunQurbanService';
import { getAllKupons } from '../services/kuponService';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import SidebarLayout from '../components/SidebarLayout';
import { useOutletContext } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

const { Title } = Typography;

export default function AdminTahunKuponPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editModal, setEditModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editForm] = Form.useForm();
  const { activeKey, onMenuClick } = useOutletContext() || {};
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [kuponAktifList, setKuponAktifList] = useState([]);
  const [kuponAktifTahun, setKuponAktifTahun] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const tahunList = await getAllTahunAktif();
    setData(tahunList.sort((a, b) => b.tahun - a.tahun));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onFinish = async (values) => {
    if (values.jumlahPanitia > 50 || values.jumlahPeserta > 500) {
      message.error('Jumlah panitia maks 50, peserta maks 500');
      return;
    }
    setLoading(true);
    try {
      await addTahunAktif(values);
      message.success('Data tahun berhasil ditambah!');
      form.resetFields();
      fetchData();
    } catch (e) {
      message.error('Gagal menambah data tahun!');
    }
    setLoading(false);
  };

  const onEdit = (record) => {
    setEditRecord(record);
    setEditModal(true);
    editForm.setFieldsValue(record);
  };

  const onEditFinish = async (values) => {
    if (values.jumlahPanitia > 50 || values.jumlahPeserta > 500) {
      message.error('Jumlah panitia maks 50, peserta maks 500');
      return;
    }
    setLoading(true);
    try {
      await updateTahunAktif(editRecord.id, values);
      message.success('Data tahun berhasil diupdate!');
      setEditModal(false);
      fetchData();
    } catch (e) {
      message.error('Gagal update data tahun!');
    }
    setLoading(false);
  };

  const onDelete = async (id) => {
    setLoading(true);
    try {
      await deleteTahunAktif(id);
      message.success('Data tahun dihapus!');
      fetchData();
    } catch (e) {
      message.error('Gagal hapus data tahun!');
    }
    setLoading(false);
  };

  const handleSetAktif = async (id) => {
    setLoading(true);
    try {
      await setTahunAktif(id);
      message.success('Tahun berhasil di-set sebagai aktif!');
      fetchData();
    } catch (e) {
      message.error('Gagal set tahun aktif!');
    }
    setLoading(false);
  };

  // Ambil daftar kupon aktif untuk tahun tertentu
  const handleShowKuponAktif = async (tahun) => {
    setDrawerOpen(true);
    setKuponAktifTahun(tahun);
    // Ambil kupon_status dengan tahun dan status aktif
    const q = query(collection(db, 'kupon_status'), where('tahun', '==', tahun), where('status', '==', 'aktif'));
    const snapshot = await getDocs(q);
    const kuponStatus = snapshot.docs.map(doc => doc.data());
    // Ambil master kupon untuk info jenis
    const masterKupon = await getAllKupons();
    // Gabungkan info jenis
    const list = kuponStatus.map(k => ({
      ...k,
      jenis: masterKupon.find(m => m.uuid === k.uuid)?.jenis || '-',
    }));
    setKuponAktifList(list);
  };

  const columns = [
    { title: 'Tahun', dataIndex: 'tahun', key: 'tahun', sorter: (a, b) => b.tahun - a.tahun },
    { title: 'Kupon Panitia', dataIndex: 'jumlahPanitia', key: 'jumlahPanitia' },
    { title: 'Kupon Peserta', dataIndex: 'jumlahPeserta', key: 'jumlahPeserta' },
    {
      title: 'Status',
      dataIndex: 'aktif',
      key: 'aktif',
      render: aktif => aktif ? <span style={{ color: 'green', fontWeight: 'bold' }}>Aktif</span> : <span style={{ color: '#aaa' }}>-</span>,
    },
    {
      title: 'Aksi',
      key: 'aksi',
      render: (_, record) => (
        <>
          <Button size="small" onClick={() => handleShowKuponAktif(record.tahun)} style={{ marginRight: 8 }}>Lihat Kupon Aktif</Button>
          {!record.aktif && (
            <Button size="small" type="primary" onClick={() => handleSetAktif(record.id)} style={{ marginRight: 8 }}>Set Aktif</Button>
          )}
          <Button size="small" onClick={() => onEdit(record)} style={{ marginRight: 8 }}>Edit</Button>
          <Popconfirm title="Hapus data tahun ini?" onConfirm={() => onDelete(record.id)} okText="Ya" cancelText="Batal">
            <Button size="small" danger>Hapus</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <SidebarLayout activeKey={activeKey || 'tahun'} onMenuClick={onMenuClick}>
      <div style={{ maxWidth: '100%', width: '100%', margin: 0, background: '#fff', padding: 24, borderRadius: 8 }}>
        <Title level={3}>Tahun Qurban & Kuota Kupon</Title>
        <Form layout="inline" form={form} onFinish={onFinish} style={{ marginBottom: 24 }}>
          <Form.Item name="tahun" label="Tahun" rules={[{ required: true, message: 'Masukkan tahun!' }]}> 
            <InputNumber min={2020} max={2100} style={{ width: 180 }} placeholder="Tahun" />
          </Form.Item>
          <Form.Item name="jumlahPanitia" label="Panitia" rules={[{ required: true, message: 'Masukkan jumlah!' }]}> 
            <InputNumber min={0} max={50} style={{ width: 180 }} placeholder="Panitia" />
          </Form.Item>
          <Form.Item name="jumlahPeserta" label="Peserta" rules={[{ required: true, message: 'Masukkan jumlah!' }]}> 
            <InputNumber min={0} max={500} style={{ width: 180 }} placeholder="Peserta" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>Tambah</Button>
          </Form.Item>
        </Form>
        <Table
          columns={columns}
          dataSource={data.map(d => ({ ...d, key: d.id }))}
          loading={loading}
          pagination={false}
          bordered
          size="small"
          rowKey="id"
        />
        <Modal
          open={editModal}
          title="Edit Tahun Qurban"
          onCancel={() => setEditModal(false)}
          footer={null}
          destroyOnClose
        >
          <Form layout="vertical" form={editForm} onFinish={onEditFinish}>
            <Form.Item name="tahun" label="Tahun" rules={[{ required: true, message: 'Masukkan tahun!' }]}> 
              <InputNumber min={2020} max={2100} style={{ width: 180 }} placeholder="Tahun" />
            </Form.Item>
            <Form.Item name="jumlahPanitia" label="Panitia" rules={[{ required: true, message: 'Masukkan jumlah!' }]}> 
              <InputNumber min={0} max={50} style={{ width: 180 }} placeholder="Panitia" />
            </Form.Item>
            <Form.Item name="jumlahPeserta" label="Peserta" rules={[{ required: true, message: 'Masukkan jumlah!' }]}> 
              <InputNumber min={0} max={500} style={{ width: 180 }} placeholder="Peserta" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>Simpan</Button>
            </Form.Item>
          </Form>
        </Modal>
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={`Daftar Kupon Aktif Tahun ${kuponAktifTahun || ''}`}
          width={420}
        >
          <Table
            columns={[
              { title: 'UUID', dataIndex: 'uuid', key: 'uuid', render: text => <span style={{ fontSize: 12 }}>{text}</span> },
              { title: 'Jenis', dataIndex: 'jenis', key: 'jenis', render: jenis => <Tag color={jenis === 'panitia' ? 'blue' : 'green'}>{jenis.toUpperCase()}</Tag> },
              { title: 'QR', dataIndex: 'uuid', key: 'qr', render: uuid => <QRCodeCanvas value={uuid} size={40} /> },
            ]}
            dataSource={kuponAktifList.map((k, i) => ({ ...k, key: k.uuid + i }))}
            size="small"
            pagination={{ pageSize: 20 }}
            scroll={{ x: true, y: 400 }}
            bordered
          />
        </Drawer>
      </div>
    </SidebarLayout>
  );
} 
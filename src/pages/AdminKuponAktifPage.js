import React, { useEffect, useState } from 'react';
import { Typography, Table, Tag, Spin, Popconfirm, Button, message } from 'antd';
import { getAllTahunAktif } from '../services/tahunQurbanService';
import { getAllKupons } from '../services/kuponService';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import SidebarLayout from '../components/SidebarLayout';
import { useOutletContext } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { deleteStatusKupon } from '../services/kuponStatusService';

const { Title } = Typography;

export default function AdminKuponAktifPage() {
  const { activeKey, onMenuClick } = useOutletContext() || {};
  const [loading, setLoading] = useState(true);
  const [tahunAktif, setTahunAktif] = useState(null);
  const [kuponAktifList, setKuponAktifList] = useState([]);
  const [stat, setStat] = useState({
    jumlahPanitia: 0,
    jumlahPeserta: 0,
    aktifPanitia: 0,
    aktifPeserta: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const tahunList = await getAllTahunAktif();
      const aktif = tahunList.find(t => t.aktif);
      setTahunAktif(aktif);
      if (aktif) {
        const q = query(collection(db, 'kupon_status'), where('tahun', '==', aktif.tahun));
        const snapshot = await getDocs(q);
        const kuponStatus = snapshot.docs
          .map(doc => doc.data())
          .filter(k => k.status === 'aktif' || k.status === 'diambil');
        const masterKupon = await getAllKupons();
        const list = kuponStatus.map(k => ({
          ...k,
          jenis: masterKupon.find(m => m.uuid === k.uuid)?.jenis || '-',
        }));
        setKuponAktifList(list);
        const aktifPanitia = list.filter(k => k.jenis === 'panitia').length;
        const aktifPeserta = list.filter(k => k.jenis === 'peserta').length;
        setStat({
          jumlahPanitia: aktif.jumlahPanitia || 0,
          jumlahPeserta: aktif.jumlahPeserta || 0,
          aktifPanitia,
          aktifPeserta,
        });
      } else {
        setKuponAktifList([]);
        setStat({ jumlahPanitia: 0, jumlahPeserta: 0, aktifPanitia: 0, aktifPeserta: 0 });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleDelete = async (uuid) => {
    if (!tahunAktif) return;
    try {
      await deleteStatusKupon(uuid, tahunAktif.tahun);
      message.success('Kupon berhasil dihapus dari status aktif!');
      // Refresh data
      const tahunList = await getAllTahunAktif();
      const aktif = tahunList.find(t => t.aktif);
      setTahunAktif(aktif);
      if (aktif) {
        const q = query(collection(db, 'kupon_status'), where('tahun', '==', aktif.tahun));
        const snapshot = await getDocs(q);
        const kuponStatus = snapshot.docs
          .map(doc => doc.data())
          .filter(k => k.status === 'aktif' || k.status === 'diambil');
        const masterKupon = await getAllKupons();
        const list = kuponStatus.map(k => ({
          ...k,
          jenis: masterKupon.find(m => m.uuid === k.uuid)?.jenis || '-',
        }));
        setKuponAktifList(list);
        const aktifPanitia = list.filter(k => k.jenis === 'panitia').length;
        const aktifPeserta = list.filter(k => k.jenis === 'peserta').length;
        setStat({
          jumlahPanitia: aktif.jumlahPanitia || 0,
          jumlahPeserta: aktif.jumlahPeserta || 0,
          aktifPanitia,
          aktifPeserta,
        });
      } else {
        setKuponAktifList([]);
        setStat({ jumlahPanitia: 0, jumlahPeserta: 0, aktifPanitia: 0, aktifPeserta: 0 });
      }
    } catch (e) {
      message.error('Gagal menghapus status kupon!');
    }
  };

  return (
    <SidebarLayout activeKey={activeKey || 'kupon-aktif'} onMenuClick={onMenuClick}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 8 }}>
        <Title level={3}>Daftar Kupon Aktif Tahun {tahunAktif ? tahunAktif.tahun : '-'}</Title>
        {(stat.jumlahPanitia !== stat.aktifPanitia || stat.jumlahPeserta !== stat.aktifPeserta) && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ display: 'block', color: 'red' }}>
              <b>
                <span style={{ color: '#faad14' }}>⚠️ </span>
                Warning: Jumlah kupon yang diaktifkan tidak sama dengan kuota!
              </b>
            </span>
          </div>
        )}
        <div style={{ marginBottom: 16, fontSize: 16 }}>
          <b>Kuota Tahun Ini:</b> Panitia: {stat.jumlahPanitia} | Peserta: {stat.jumlahPeserta}<br /><br />
          <b>Sudah Diaktifkan:</b> Panitia: {stat.aktifPanitia} | Peserta: {stat.aktifPeserta}
        </div>
        {loading ? <Spin /> : (
          <Table
            columns={[
              { 
                title: 'UUID', 
                dataIndex: 'uuid', 
                key: 'uuid', 
                render: text => <span style={{ fontSize: 12 }}>{text}</span>,
                filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                  <div style={{ padding: 8 }}>
                    <input
                      placeholder="Cari UUID"
                      value={selectedKeys[0]}
                      onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                      onPressEnter={confirm}
                      style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Button
                      type="primary"
                      onClick={confirm}
                      icon={null}
                      size="small"
                      style={{ width: 90, marginRight: 8 }}
                    >
                      Cari
                    </Button>
                    <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
                      Reset
                    </Button>
                  </div>
                ),
                filterIcon: filtered => <span role="img" aria-label="search" style={{ color: filtered ? '#1890ff' : undefined }}>🔍</span>,
                onFilter: (value, record) => record.uuid.toLowerCase().includes(value.toLowerCase()),
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
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: status => status === 'diambil' ? <Tag color="red">Diambil</Tag> : <Tag color="green">Aktif</Tag>,
                filters: [
                  { text: 'Aktif', value: 'aktif' },
                  { text: 'Diambil', value: 'diambil' },
                ],
                onFilter: (value, record) => record.status === value,
              },
              { title: 'QR', dataIndex: 'uuid', key: 'qr', render: uuid => <QRCodeCanvas value={uuid} size={40} /> },
              {
                title: 'Aksi',
                key: 'aksi',
                render: (_, record) => (
                  <Popconfirm title="Hapus status aktif kupon ini?" onConfirm={() => handleDelete(record.uuid)} okText="Ya" cancelText="Batal">
                    <Button danger size="small">Hapus</Button>
                  </Popconfirm>
                ),
              },
            ]}
            dataSource={kuponAktifList.map((k, i) => ({ ...k, key: k.uuid + i }))}
            size="small"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true}}
            bordered
          />
        )}
      </div>
    </SidebarLayout>
  );
} 
import React, { useEffect, useState } from 'react';
import { Typography, Table, Tag, Spin } from 'antd';
import { getAllTahunAktif } from '../services/tahunQurbanService';
import { getAllKupons } from '../services/kuponService';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import SidebarLayout from '../components/SidebarLayout';
import { useOutletContext } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

const { Title } = Typography;

export default function AdminKuponAktifPage() {
  const { activeKey, onMenuClick } = useOutletContext() || {};
  const [loading, setLoading] = useState(true);
  const [tahunAktif, setTahunAktif] = useState(null);
  const [kuponAktifList, setKuponAktifList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const tahunList = await getAllTahunAktif();
      const aktif = tahunList.find(t => t.aktif);
      setTahunAktif(aktif);
      if (aktif) {
        const q = query(collection(db, 'kupon_status'), where('tahun', '==', aktif.tahun), where('status', '==', 'aktif'));
        const snapshot = await getDocs(q);
        const kuponStatus = snapshot.docs.map(doc => doc.data());
        const masterKupon = await getAllKupons();
        const list = kuponStatus.map(k => ({
          ...k,
          jenis: masterKupon.find(m => m.uuid === k.uuid)?.jenis || '-',
        }));
        setKuponAktifList(list);
      } else {
        setKuponAktifList([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <SidebarLayout activeKey={activeKey || 'kupon-aktif'} onMenuClick={onMenuClick}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 8 }}>
        <Title level={3}>Daftar Kupon Aktif Tahun {tahunAktif ? tahunAktif.tahun : '-'}</Title>
        {loading ? <Spin /> : (
          <Table
            columns={[
              { title: 'UUID', dataIndex: 'uuid', key: 'uuid', render: text => <span style={{ fontSize: 12 }}>{text}</span> },
              { title: 'Jenis', dataIndex: 'jenis', key: 'jenis', render: jenis => <Tag color={jenis === 'panitia' ? 'blue' : 'green'}>{jenis.toUpperCase()}</Tag> },
              { title: 'QR', dataIndex: 'uuid', key: 'qr', render: uuid => <QRCodeCanvas value={uuid} size={40} /> },
            ]}
            dataSource={kuponAktifList.map((k, i) => ({ ...k, key: k.uuid + i }))}
            size="small"
            pagination={{ pageSize: 20 }}
            scroll={{ x: true, y: 500 }}
            bordered
          />
        )}
      </div>
    </SidebarLayout>
  );
} 
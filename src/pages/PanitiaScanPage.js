import React, { useEffect, useState } from 'react';
import { Typography, Alert, Spin, Button } from 'antd';
import { getAllTahunAktif } from '../services/tahunQurbanService';
import { getAllKupons } from '../services/kuponService';
import { getStatusKupon, setStatusKuponDiambil, getAllStatusKuponByTahun } from '../services/kuponStatusService';
import SidebarLayout from '../components/SidebarLayout';
import { useOutletContext } from 'react-router-dom';
import QRScanner from '../components/QRScanner';

const { Title } = Typography;

export default function PanitiaScanPage() {
  const { activeKey, onMenuClick } = useOutletContext() || {};
  const [tahunAktif, setTahunAktif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kupons, setKupons] = useState([]);
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '', show: false });
  const [scanning, setScanning] = useState(true);
  const [stat, setStat] = useState({
    totalPanitia: 0, totalPeserta: 0,
    diambilPanitia: 0, diambilPeserta: 0,
    belumDiambilPanitia: 0, belumDiambilPeserta: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const tahunList = await getAllTahunAktif();
      const aktif = tahunList.find(t => t.aktif);
      setTahunAktif(aktif);
      const kuponList = await getAllKupons();
      setKupons(kuponList);
      if (aktif) {
        const statusList = await getAllStatusKuponByTahun(aktif.tahun);
        const panitia = kuponList.filter(k => k.jenis === 'panitia');
        const peserta = kuponList.filter(k => k.jenis === 'peserta');
        const diambilPanitia = statusList.filter(s => s.status === 'diambil' && panitia.some(k => k.uuid === s.uuid)).length;
        const diambilPeserta = statusList.filter(s => s.status === 'diambil' && peserta.some(k => k.uuid === s.uuid)).length;
        setStat({
          totalPanitia: aktif.jumlahPanitia || panitia.length,
          totalPeserta: aktif.jumlahPeserta || peserta.length,
          diambilPanitia,
          diambilPeserta,
          belumDiambilPanitia: (aktif.jumlahPanitia || panitia.length) - diambilPanitia,
          belumDiambilPeserta: (aktif.jumlahPeserta || peserta.length) - diambilPeserta,
        });
      }
      setLoading(false);
    };
    fetchData();
    PanitiaScanPage.fetchData = fetchData;
  }, []);

  const handleScan = async (data) => {
    if (!data) return;
    setScanning(false);
    setAlertInfo({ type: '', message: '', show: false });
    if (!tahunAktif) {
      setAlertInfo({ type: 'error', message: 'Tahun aktif belum di-set.', show: true });
      setTimeout(() => { setAlertInfo({ ...alertInfo, show: false }); setScanning(true); }, 2000);
      return;
    }
    const uuid = data.trim();
    const kupon = kupons.find(k => k.uuid === uuid);
    if (!kupon) {
      setAlertInfo({ type: 'error', message: 'QR code tidak terdaftar di master data!', show: true });
      setTimeout(() => { setAlertInfo({ ...alertInfo, show: false }); setScanning(true); }, 2000);
      return;
    }
    const status = await getStatusKupon(uuid, tahunAktif.tahun);
    if (!status || status.status !== 'aktif') {
      setAlertInfo({ type: 'error', message: 'Kupon belum diaktivasi atau tidak berlaku tahun ini!', show: true });
      setTimeout(() => { setAlertInfo({ ...alertInfo, show: false }); setScanning(true); }, 2000);
      return;
    }
    if (status.status === 'diambil') {
      setAlertInfo({ type: 'warning', message: `Kupon ${uuid} (${kupon.jenis}) sudah pernah diambil tahun ini!`, show: true });
      setTimeout(() => { setAlertInfo({ ...alertInfo, show: false }); setScanning(true); }, 2000);
      return;
    }
    // Update status jadi diambil
    await setStatusKuponDiambil(uuid, tahunAktif.tahun);
    setAlertInfo({ type: 'success', message: `Kupon ${uuid} (${kupon.jenis}) berhasil di-scan & diambil!`, show: true });
    if (typeof PanitiaScanPage.fetchData === 'function') {
      await PanitiaScanPage.fetchData();
    }
    setTimeout(() => { setAlertInfo({ ...alertInfo, show: false }); setScanning(true); }, 2000);
  };

  return (
    <SidebarLayout activeKey={activeKey || 'scan'} onMenuClick={onMenuClick}>
      <div style={{ maxWidth: 500, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 8 }}>
        <Title level={3}>Scan Pengambilan Daging</Title>
        {alertInfo.show && (
          <Alert
            type={alertInfo.type}
            message={alertInfo.message}
            showIcon
            style={{ marginBottom: 16, position: 'sticky', top: 0, zIndex: 1000 }}
            closable
            onClose={() => setAlertInfo({ ...alertInfo, show: false })}
          />
        )}
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={
            <div>
              <div><b>Statistik Pengambilan Tahun {tahunAktif ? tahunAktif.tahun : '-'}</b></div>
              <div>Panitia: {stat.diambilPanitia} / {stat.totalPanitia} sudah diambil</div>
              <div>Peserta: {stat.diambilPeserta} / {stat.totalPeserta} sudah diambil</div>
              <div style={{ marginTop: 8, fontWeight: 'bold' }}>
                Total sisa kupon yang belum diambil: {stat.belumDiambilPanitia + stat.belumDiambilPeserta}
              </div>
            </div>
          }
        />
        {loading ? <Spin /> : tahunAktif ? (
          <>
            {!scanning && (
              <Button type="primary" block style={{ marginBottom: 16 }} onClick={() => setScanning(true)}>
                Mulai Scan
              </Button>
            )}
            {scanning && (
              <>
                <Button type="default" block style={{ marginBottom: 8 }} onClick={() => setScanning(false)}>
                  Stop Scan
                </Button>
                <QRScanner onScan={handleScan} onError={() => {}} />
              </>
            )}
          </>
        ) : (
          <Alert type="warning" showIcon message="Belum ada tahun aktif. Silakan set tahun aktif terlebih dahulu." />
        )}
      </div>
    </SidebarLayout>
  );
} 
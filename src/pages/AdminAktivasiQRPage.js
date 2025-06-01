import React, { useEffect, useState } from 'react';
import { Typography, Alert, Button, Spin } from 'antd';
import { getAllTahunAktif } from '../services/tahunQurbanService';
import { getAllKupons } from '../services/kuponService';
import { getStatusKupon, setStatusKuponAktif, getAllStatusKuponByTahun } from '../services/kuponStatusService';
import SidebarLayout from '../components/SidebarLayout';
import { useOutletContext } from 'react-router-dom';
import QRScanner from '../components/QRScanner';

const { Title } = Typography;

export default function AdminAktivasiQRPage() {
  const { activeKey, onMenuClick } = useOutletContext() || {};
  const [tahunAktif, setTahunAktif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kupons, setKupons] = useState([]);
  const [result, setResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '', show: false });
  const [jumlahBelumAktif, setJumlahBelumAktif] = useState(null);
  const [jumlahBelumAktifPanitia, setJumlahBelumAktifPanitia] = useState(null);
  const [jumlahBelumAktifPeserta, setJumlahBelumAktifPeserta] = useState(null);

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
        const aktifUuids = statusList.filter(s => s.status === 'aktif').map(s => s.uuid);
        const kuponAktifPanitia = kuponList.filter(k => aktifUuids.includes(k.uuid) && k.jenis === 'panitia').length;
        const kuponAktifPeserta = kuponList.filter(k => aktifUuids.includes(k.uuid) && k.jenis === 'peserta').length;
        const jumlahPanitiaDialokasikan = aktif.jumlahPanitia || 0;
        const jumlahPesertaDialokasikan = aktif.jumlahPeserta || 0;
        setJumlahBelumAktifPanitia(Math.max(jumlahPanitiaDialokasikan - kuponAktifPanitia, 0));
        setJumlahBelumAktifPeserta(Math.max(jumlahPesertaDialokasikan - kuponAktifPeserta, 0));
        setJumlahBelumAktif(Math.max((jumlahPanitiaDialokasikan - kuponAktifPanitia) + (jumlahPesertaDialokasikan - kuponAktifPeserta), 0));
      } else {
        setJumlahBelumAktif(null);
        setJumlahBelumAktifPanitia(null);
        setJumlahBelumAktifPeserta(null);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleScan = async (data) => {
    if (!data) return;
    setScanning(false);
    setResult(null);
    setScanError(null);
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
    if (status && status.status === 'aktif') {
      setResult({ uuid, status: 'sudah_aktif', jenis: kupon.jenis });
      setAlertInfo({ type: 'info', message: `QR code ${uuid} (${kupon.jenis}) sudah diaktivasi untuk tahun ini.`, show: true });
      setTimeout(() => { setAlertInfo({ ...alertInfo, show: false }); setScanning(true); }, 2000);
      return;
    }
    await setStatusKuponAktif(uuid, tahunAktif.tahun);
    setResult({ uuid, status: 'berhasil', jenis: kupon.jenis });
    setAlertInfo({ type: 'success', message: `QR code ${uuid} (${kupon.jenis}) berhasil diaktivasi!`, show: true });
    setTimeout(() => { setAlertInfo({ ...alertInfo, show: false }); setScanning(true); }, 2000);
  };

  const handleError = (err) => {
    if (typeof err === 'string' && err.toLowerCase().includes('notallowederror')) {
      setScanError('Izin kamera ditolak. Silakan izinkan akses kamera.');
    } else if (typeof err === 'string' && err.toLowerCase().includes('notfounderror')) {
      setScanError('Tidak ada kamera yang ditemukan di perangkat.');
    } else if (typeof err === 'string' && err.toLowerCase().includes('notreadableerror')) {
      setScanError('Kamera sedang digunakan aplikasi lain.');
    } else {
      setScanError(null); // error scan frame biasa tidak ditampilkan
    }
  };

  return (
    <SidebarLayout activeKey={activeKey || 'aktivasi'} onMenuClick={onMenuClick}>
      <div style={{ maxWidth: 500, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 8 }}>
        <Title level={3}>Aktivasi QR Code Kupon</Title>
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
        {jumlahBelumAktifPanitia !== null && jumlahBelumAktifPeserta !== null && tahunAktif && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message={
              <div>
                <div><b>Jumlah kupon yang belum diaktivasi tahun {tahunAktif.tahun}:</b></div>
                <div>Panitia: <b>{jumlahBelumAktifPanitia}</b></div>
                <div>Peserta: <b>{jumlahBelumAktifPeserta}</b></div>
              </div>
            }
          />
        )}
        {loading ? <Spin /> : tahunAktif ? (
          <>
            <Alert type="info" showIcon style={{ marginBottom: 16 }} message={`Tahun aktif: ${tahunAktif.tahun}`} />
            {scanning && <QRScanner onScan={handleScan} onError={handleError} />}
          </>
        ) : (
          <Alert type="warning" showIcon message="Belum ada tahun aktif. Silakan set tahun aktif terlebih dahulu." />
        )}
      </div>
    </SidebarLayout>
  );
} 
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScan, onError, id = 'qr-scanner' }) {
  const scannerRef = useRef(null);
  const html5Qr = useRef(null);
  const scannerStatus = useRef('idle'); // 'idle' | 'starting' | 'running' | 'stopping' | 'transition'
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [backCameras, setBackCameras] = useState([]);
  const [backCamIndex, setBackCamIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      const backs = devices.filter(d => d.label.toLowerCase().includes('back'));
      setBackCameras(backs);
      setCameras(devices);
      if (backs.length > 0) {
        setSelectedCamera(backs[0].id);
        setBackCamIndex(0);
      } else {
        setSelectedCamera(devices[0]?.id);
        setBackCamIndex(-1);
      }
    });
    return () => {
      const cleanup = async () => {
        if (html5Qr.current && scannerStatus.current === 'running') {
          scannerStatus.current = 'stopping';
          try {
            if (typeof html5Qr.current.stop === 'function') {
              await html5Qr.current.stop();
            }
          } catch {}
          try {
            if (typeof html5Qr.current.clear === 'function') {
              await html5Qr.current.clear();
            }
          } catch {}
          scannerStatus.current = 'idle';
        }
      };
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (!scannerRef.current || !selectedCamera) return;
    if (scannerStatus.current === 'transition' || scannerStatus.current === 'starting' || scannerStatus.current === 'stopping') return;

    const startScanner = async () => {
      if (html5Qr.current && scannerStatus.current === 'running') {
        scannerStatus.current = 'stopping';
        try {
          if (typeof html5Qr.current.stop === 'function') {
            await html5Qr.current.stop();
          }
        } catch {}
        try {
          if (typeof html5Qr.current.clear === 'function') {
            await html5Qr.current.clear();
          }
        } catch {}
        scannerStatus.current = 'idle';
      }
      html5Qr.current = new Html5Qrcode(id);
      const rootWidth = scannerRef.current.offsetWidth || window.innerWidth;
      const qrboxSize = Math.min(250, rootWidth - 20);

      scannerStatus.current = 'starting';
      html5Qr.current.start(
        { deviceId: { exact: selectedCamera } },
        {
          fps: 10,
          qrbox: qrboxSize,
          aspectRatio: 1,
        },
        (decodedText) => { onScan && onScan(decodedText); },
        (error) => { onError && onError(error); }
      ).then(() => {
        scannerStatus.current = 'running';
      }).catch((err) => {
        scannerStatus.current = 'idle';
        setErrorMsg('');
        if (backCameras.length > 1 && backCamIndex >= 0 && backCamIndex < backCameras.length - 1) {
          setTimeout(() => {
            setBackCamIndex(idx => {
              const nextIdx = idx + 1;
              setSelectedCamera(backCameras[nextIdx].id);
              return nextIdx;
            });
          }, 500);
        } else if (backCameras.length === 0 && cameras.length > 1) {
          const currentIdx = cameras.findIndex(cam => cam.id === selectedCamera);
          if (currentIdx >= 0 && currentIdx < cameras.length - 1) {
            setTimeout(() => {
              setSelectedCamera(cameras[currentIdx + 1].id);
            }, 500);
          } else {
            setErrorMsg('Tidak dapat mengakses kamera. Silakan cek izin kamera di perangkat Anda, atau refresh halaman.');
            onError && onError(err);
          }
        } else {
          setErrorMsg('Tidak dapat mengakses kamera. Silakan cek izin kamera di perangkat Anda, atau refresh halaman.');
          onError && onError(err);
        }
      });
    };

    scannerStatus.current = 'transition';
    startScanner().finally(() => {
      if (scannerStatus.current === 'transition') {
        scannerStatus.current = 'idle';
      }
    });

    return () => {
      const cleanup = async () => {
        if (html5Qr.current && scannerStatus.current === 'running') {
          scannerStatus.current = 'stopping';
          try {
            if (typeof html5Qr.current.stop === 'function') {
              await html5Qr.current.stop();
            }
          } catch {}
          try {
            if (typeof html5Qr.current.clear === 'function') {
              await html5Qr.current.clear();
            }
          } catch {}
          scannerStatus.current = 'idle';
        }
      };
      cleanup();
    };
  }, [selectedCamera, id, onScan, onError]);

  return (
    <div>
      {errorMsg && (
        <div style={{ color: 'red', marginBottom: 8, fontWeight: 'bold' }}>{errorMsg}</div>
      )}
      {backCameras.length > 1 && (
        <select
          value={selectedCamera}
          onChange={e => {
            setSelectedCamera(e.target.value);
            setBackCamIndex(backCameras.findIndex(cam => cam.id === e.target.value));
          }}
          style={{ marginBottom: 8 }}
        >
          {backCameras.map(cam => (
            <option key={cam.id} value={cam.id}>{cam.label}</option>
          ))}
        </select>
      )}
      <div id={id} ref={scannerRef} style={{ width: '100%' }} />
    </div>
  );
} 
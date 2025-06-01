import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScan, onError, id = 'qr-scanner' }) {
  const scannerRef = useRef(null);
  const html5Qr = useRef(null);
  const scannerStatus = useRef('idle'); // 'idle' | 'starting' | 'running' | 'stopping' | 'transition'
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);

  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      setCameras(devices);
      const backCam = devices.find(d => d.label.toLowerCase().includes('back'));
      setSelectedCamera(backCam ? backCam.id : devices[0]?.id);
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
        onError && onError(err);
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
      {cameras.length > 1 && (
        <select
          value={selectedCamera}
          onChange={e => setSelectedCamera(e.target.value)}
          style={{ marginBottom: 8 }}
        >
          {cameras.map(cam => (
            <option key={cam.id} value={cam.id}>{cam.label}</option>
          ))}
        </select>
      )}
      <div id={id} ref={scannerRef} style={{ width: '100%' }} />
    </div>
  );
} 
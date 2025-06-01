import { v4 as uuidv4 } from 'uuid';

/**
 * Generate array of UUIDs beserta tipe kupon.
 * @param {number} jumlahPanitia - Jumlah kupon panitia (maks 50)
 * @param {number} jumlahPeserta - Jumlah kupon peserta (maks 500)
 * @returns {Array<{ uuid: string, jenis: 'panitia' | 'peserta' }>} Array data kupon
 */
export function generateKuponUUID(jumlahPanitia, jumlahPeserta) {
  const maxPanitia = 50;
  const maxPeserta = 500;
  const panitia = Array.from({ length: Math.min(jumlahPanitia, maxPanitia) }, () => ({
    uuid: uuidv4(),
    jenis: 'panitia',
  }));
  const peserta = Array.from({ length: Math.min(jumlahPeserta, maxPeserta) }, () => ({
    uuid: uuidv4(),
    jenis: 'peserta',
  }));
  return [...panitia, ...peserta];
} 
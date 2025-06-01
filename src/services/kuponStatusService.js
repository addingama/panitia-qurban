import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

const KUPON_STATUS_COLLECTION = 'kupon_status';

// Ambil status kupon untuk uuid & tahun tertentu
export async function getStatusKupon(uuid, tahun) {
  const q = query(collection(db, KUPON_STATUS_COLLECTION), where('uuid', '==', uuid), where('tahun', '==', tahun));
  const snapshot = await getDocs(q);
  return snapshot.docs.length > 0 ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null;
}

// Set status kupon menjadi aktif untuk tahun tertentu
export async function setStatusKuponAktif(uuid, tahun) {
  // Gunakan kombinasi uuid-tahun sebagai id dokumen agar unik
  const docId = `${uuid}_${tahun}`;
  await setDoc(doc(db, KUPON_STATUS_COLLECTION, docId), {
    uuid,
    tahun,
    status: 'aktif',
  });
}

// Set status kupon menjadi diambil untuk tahun tertentu
export async function setStatusKuponDiambil(uuid, tahun) {
  const docId = `${uuid}_${tahun}`;
  await setDoc(doc(db, KUPON_STATUS_COLLECTION, docId), {
    uuid,
    tahun,
    status: 'diambil',
  });
}

// Ambil semua status kupon untuk tahun tertentu
export async function getAllStatusKuponByTahun(tahun) {
  const q = query(collection(db, KUPON_STATUS_COLLECTION), where('tahun', '==', tahun));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

// Hapus status kupon untuk uuid & tahun tertentu
export async function deleteStatusKupon(uuid, tahun) {
  const docId = `${uuid}_${tahun}`;
  await deleteDoc(doc(db, KUPON_STATUS_COLLECTION, docId));
} 
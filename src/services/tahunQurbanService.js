import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

const TAHUN_QURBAN_COLLECTION = 'tahun_qurban';

// Ambil semua data tahun aktif
export async function getAllTahunAktif() {
  const snapshot = await getDocs(collection(db, TAHUN_QURBAN_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Tambah tahun aktif baru
export async function addTahunAktif(data) {
  return addDoc(collection(db, TAHUN_QURBAN_COLLECTION), data);
}

// Update tahun aktif
export async function updateTahunAktif(id, data) {
  return updateDoc(doc(db, TAHUN_QURBAN_COLLECTION, id), data);
}

// Hapus tahun aktif
export async function deleteTahunAktif(id) {
  return deleteDoc(doc(db, TAHUN_QURBAN_COLLECTION, id));
}

// Set satu tahun sebagai aktif, nonaktifkan yang lain
export async function setTahunAktif(id) {
  const snapshot = await getDocs(collection(db, TAHUN_QURBAN_COLLECTION));
  const batch = writeBatch(db);
  snapshot.docs.forEach(docSnap => {
    const aktif = docSnap.id === id;
    batch.update(doc(db, TAHUN_QURBAN_COLLECTION, docSnap.id), { aktif });
  });
  await batch.commit();
} 
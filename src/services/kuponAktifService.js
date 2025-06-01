import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const KUPON_AKTIF_COLLECTION = 'kupon_aktif';

// Ambil semua data tahun aktif
export async function getAllTahunAktif() {
  const snapshot = await getDocs(collection(db, KUPON_AKTIF_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Tambah tahun aktif baru
export async function addTahunAktif(data) {
  return addDoc(collection(db, KUPON_AKTIF_COLLECTION), data);
}

// Update tahun aktif
export async function updateTahunAktif(id, data) {
  return updateDoc(doc(db, KUPON_AKTIF_COLLECTION, id), data);
}

// Hapus tahun aktif
export async function deleteTahunAktif(id) {
  return deleteDoc(doc(db, KUPON_AKTIF_COLLECTION, id));
} 
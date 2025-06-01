import { collection, getDocs, addDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

const KUPON_COLLECTION = 'kupons';

// Ambil semua kupon (master data)
export async function getAllKupons() {
  const snapshot = await getDocs(collection(db, KUPON_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Tambah banyak kupon sekaligus (batch)
export async function addKupons(kuponArray) {
  const batch = writeBatch(db);
  kuponArray.forEach(kupon => {
    const docRef = doc(collection(db, KUPON_COLLECTION));
    batch.set(docRef, kupon);
  });
  await batch.commit();
}

// Hapus satu kupon berdasarkan id (UUID)
export async function deleteKupon(id) {
  await deleteDoc(doc(db, KUPON_COLLECTION, id));
}

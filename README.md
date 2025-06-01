# Aplikasi Manajemen Kupon Qurban

Aplikasi ini digunakan untuk mengelola, mengaktivasi, dan mendistribusikan kupon qurban berbasis QR code untuk panitia dan peserta. Sistem ini terdiri dari dua role utama: **admin** dan **panitia**.

---

## Cara Menjalankan di Lokal

1. **Clone repository ini**
   ```bash
   git clone <repo-url>
   cd panitia-qurban
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Konfigurasi Firebase**
   - Pastikan file konfigurasi Firebase sudah benar di `src/services/firebase.js`.
   - Jika menggunakan .env, pastikan variabel environment sudah di-set sesuai kebutuhan.
4. **Jalankan aplikasi**
   ```bash
   npm start
   ```
   Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000), bisa juga di test melalui HP yang menggunakan 1 wifi dengan PC dengan memasukkan IP address PC beserta port 3000

---

## Cara Penggunaan Sistem

### 1. Login
- Masuk ke aplikasi menggunakan email dan password yang telah didaftarkan.
- Role (admin/panitia) akan otomatis terdeteksi dari email.

### 2. Fitur Admin
#### a. Master Data QR
- Generate kupon QR (panitia/peserta) sesuai kebutuhan. Ini hanya dilakukan 1 x saja, tidak setiap tahun agar kupon yang lama tetap 
- Hapus kupon yang tidak diperlukan.
- Pilih beberapa kupon (checkbox) lalu klik **Print Terpilih** untuk mencetak QR code yang dipilih saja.
- Print massal seluruh QR code jika diperlukan.
- Preview QR code besar dengan klik pada QR di tabel.

#### b. Tahun Qurban
- Tambah tahun qurban baru, tentukan kuota panitia & peserta.
- Edit/hapus data tahun qurban.
- Set salah satu tahun sebagai tahun aktif (hanya satu yang aktif).
- Lihat daftar kupon yang diaktifkan pada tahun tertentu.

#### c. Aktivasi Kupon
- Pilih menu Aktivasi QR.
- Klik **Mulai Scan** untuk mengaktifkan kamera.
- Scan QR code satu per satu untuk mengaktivasi kupon pada tahun berjalan.
- Sistem otomatis mencegah aktivasi melebihi kuota.
- Setelah scan, kamera otomatis mati. Klik **Mulai Scan** lagi untuk scan berikutnya.
- Statistik jumlah kupon yang belum diaktivasi tampil di atas scanner.

#### d. Daftar Kupon Aktif Tahun Ini
- Lihat semua kupon yang statusnya aktif/diambil pada tahun berjalan.
- Filter/search berdasarkan UUID, jenis, atau status.
- Hapus status aktif kupon jika diperlukan.
- Statistik jumlah kupon aktif dan warning jika jumlah tidak sesuai kuota.

### 3. Fitur Panitia
#### a. Scan Pengambilan Daging
- Pilih menu Scan Pengambilan.
- Klik **Mulai Scan** untuk mengaktifkan kamera.
- Scan QR code peserta/panitia saat pengambilan daging.
- Hanya kupon yang sudah diaktivasi tahun berjalan yang bisa digunakan.
- Jika valid, status kupon diupdate menjadi "diambil".
- Statistik jumlah kupon yang sudah diambil & sisa tampil di atas scanner.
- Klik **Stop Scan** untuk menonaktifkan kamera.

### 4. Penggunaan di Mobile
- Menu otomatis berubah menjadi top navigation di perangkat mobile.
- Scanner hanya menampilkan pilihan kamera belakang.
- Jika terjadi error kamera, sistem otomatis mencoba kamera belakang lain.

---

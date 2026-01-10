# 🚀 Frontend SIKoperasi: Sistem Informasi Koperasi Karyawan

Frontend SIKoperasi adalah antarmuka web modern yang dibangun untuk mendigitalisasi dan mengoptimalkan operasional koperasi karyawan secara efisien. Proyek ini menggunakan basis **TailAdmin Vue** yang telah dimodifikasi dan disesuaikan untuk mendukung fitur-fitur keuangan yang kompleks.

![TailAdmin Vue.js Dashboard Preview](./banner.png)

## 📋 Tentang Proyek Ini

Proyek ini bertujuan untuk mentransformasi proses administrasi koperasi konvensional menjadi sistem digital yang terintegrasi. Mulai dari pengajuan pinjaman mandiri oleh karyawan hingga pengelolaan simpanan massal oleh admin, sistem ini dirancang untuk memberikan transparansi, kecepatan akses data, dan kemudahan pelaporan keuangan anggota.

## 🛠️ Dasar Teknologi (Tech Stack)

Sistem ini dibangun dengan teknologi terkini untuk menjamin performa dan skalabilitas:

* **Framework**: [Vue.js 3](https://vuejs.org/) (Vite) dengan Composition API.
* **Styling**: [Tailwind CSS 4.x](https://tailwindcss.com/) untuk desain UI yang fleksibel dan responsif.
* **State Management**: [Pinia](https://pinia.vuejs.org/) untuk pengelolaan data aplikasi yang terpusat.
* **Routing**: [Vue Router 4](https://router.vuejs.org/) untuk navigasi antar halaman yang mulus.
* **Charts**: [ApexCharts](https://apexcharts.com/) untuk visualisasi statistik arus kas yang adaptif.
* **HTTP Client**: [Axios](https://axios-http.com/) untuk integrasi data dengan Backend API.

## ✨ Fitur Utama

Fitur-fitur yang telah diimplementasikan dalam sistem ini meliputi:

* **Manajemen Karyawan**: Pengelolaan data induk anggota koperasi dengan fitur sinkronisasi real-time.
* **Rekapitulasi Simpanan**: Monitoring saldo simpanan wajib, sukarela, dan total akumulasi secara transparan.
* **Import Excel**: Fitur penginputan simpanan massal menggunakan template Excel untuk efisiensi kerja admin.
* **Sistem Pinjaman & Angsuran**: 
    * Alur pengajuan pinjaman mandiri dengan validasi limit saldo otomatis.
    * Manajemen pembayaran angsuran urut (sequential) untuk mencegah kesalahan pencatatan.
* **Penarikan Dana**: Validasi saldo otomatis dan sistem konfirmasi dua tahap untuk menjamin keamanan transaksi pencairan.
* **Dashboard Statistik**: Grafik perbandingan pemasukan dan pengeluaran bulanan yang mendukung sinkronisasi Dark/Light Mode.

## 🚀 Panduan Instalasi

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek di lingkungan lokal Anda:

### Prasyarat
* **Node.js** versi 18.x atau yang terbaru.
* **Vite** sebagai build tool utama.

### Langkah-langkah

1.  **Clone Repositori:**
    ```bash
    git clone [https://github.com/MichaelAlbertYulianto/Frontend-SIKoperasi.git](https://github.com/MichaelAlbertYulianto/Frontend-SIKoperasi.git)
    ```

2.  **Masuk ke Direktori Proyek:**
    ```bash
    cd Frontend-SIKoperasi
    ```

3.  **Instal Dependensi:**
    ```bash
    npm install
    # atau jika menggunakan yarn
    yarn install
    ```

4.  **Konfigurasi Environment:**
    Buat file `.env` di direktori root dan sesuaikan URL API Anda:
    ```env
    VITE_API_BASE_URL=[https://alamat-api-anda.com/api](https://alamat-api-anda.com/api)
    ```

5.  **Jalankan Server Pengembangan:**
    ```bash
    npm run dev
    ```

---

### Tautan Penting
* **Repositori Utama**: [MichaelAlbertYulianto/Frontend-SIKoperasi](https://github.com/MichaelAlbertYulianto/Frontend-SIKoperasi)
* **Dokumentasi UI Dasar**: [TailAdmin Documentation](https://tailadmin.com/docs)
* **Dokumentasi Framework**: [Vue.js Guide](https://vuejs.org/guide/introduction.html)

---
© 2025 Michael Albert Yulianto. Built with passion for better cooperative management.
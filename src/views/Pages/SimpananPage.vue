<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div
      class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
      <div class="mb-6 flex flex-col gap-2">
        <h3 class="font-semibold text-gray-800 text-xl dark:text-white/90">
          Rekapitulasi Simpanan Karyawan
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Total: {{ simpananList.length }} Data Tercatat
        </p>
      </div>

      <div v-if="isLoading" class="text-center py-10">
        <div class="animate-spin inline-block w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mb-2">
        </div>
        <p class="text-brand-500 font-medium">Memuat data simpanan...</p>
      </div>

      <div v-else-if="error" class="text-center py-10 text-error-500 bg-error-50 dark:bg-error-500/10 rounded-xl">
        <p class="font-medium">Gagal memuat data: {{ error }}</p>
        <button @click="fetchSimpanan" class="mt-4 text-sm underline hover:text-error-600">Coba Lagi</button>
      </div>

      <div v-else>
        <div class="mb-6 flex flex-wrap gap-3">
          <button @click="downloadTemplate"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Template
          </button>

          <label
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg cursor-pointer hover:bg-brand-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import Excel
            <input type="file" class="hidden" accept=".xlsx, .xls" @change="handleImport" />
          </label>
        </div>
        <vue-good-table :theme="isDarkMode ? 'nocturnal' : 'polar-bear'" :columns="columns" :rows="simpananList"
          :search-options="{
            enabled: true,
            placeholder: 'Cari nama karyawan atau jenis simpanan...',
          }" :pagination-options="{
            enabled: true,
            mode: 'records',
            perPage: 10,
            perPageDropdown: [10, 20, 50],
            rowsPerPageLabel: 'Baris per halaman',
            ofLabel: 'dari',
          }" :initial-sort="{
            field: 'tanggal_simpan',
            type: 'desc',
          }">
          <template #table-row="props">
            <span v-if="props.column.field === 'nama_karyawan'" class="font-medium text-gray-800 dark:text-white/90">
              {{ props.row.nama_karyawan }}
            </span>

            <span v-else-if="props.column.field === 'jenis_simpanan'">
              <span :class="jenisSimpananClass(props.row.jenis_simpanan)">
                {{ props.row.jenis_simpanan ? props.row.jenis_simpanan.toUpperCase() : '-' }}
              </span>
            </span>

            <span v-else-if="props.column.field === 'jumlah'" :class="[
              'font-semibold',
              parseFloat(props.row.jumlah) < 0 || props.row.jenis_simpanan === 'penarikan'
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            ]">
              {{ parseFloat(props.row.jumlah) < 0 ? '' : '+' }} {{ formatCurrency(props.row.jumlah) }} </span>

                <span v-else-if="props.column.field === 'tanggal_simpan'">
                  {{ formatDate(props.row.tanggal_simpan) }}
                </span>

                <span v-else-if="props.column.field === 'bulan_ke'">
                  {{ props.row.bulan_ke ? `Bulan ke-${props.row.bulan_ke}` : '-' }}
                </span>

                <span v-else>
                  {{ props.formattedRow[props.column.field] }}
                </span>
          </template>
        </vue-good-table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import axios from "axios";
import { VueGoodTable } from "vue-good-table-next";
import * as XLSX from 'xlsx';
import Swal from "sweetalert2";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const currentPageTitle = ref("Daftar Simpanan");
const simpananList = ref([]);
const isLoading = ref(true);
const error = ref(null);

const columns = ref([
  { label: "Nama Karyawan", field: "nama_karyawan", sortable: true },
  { label: "Jenis", field: "jenis_simpanan", sortable: true },
  { label: "Jumlah", field: "jumlah", type: "number", sortable: true },
  { label: "Bulan Ke", field: "bulan_ke", type: "number", sortable: true },
  { label: "Tanggal Transaksi", field: "tanggal_simpan", sortable: true },
]);

const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(parseFloat(value));
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const jenisSimpananClass = (jenis) => {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ";
  if (jenis === "wajib") return base + "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
  if (jenis === "penarikan") return base + "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400";
  return base + "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400"; // sukarela
};

const fetchSimpanan = async () => {
  isLoading.value = true;
  error.value = null;
  const token = localStorage.getItem("user_token");

  try {
    const response = await axios.get(`${API_BASE_URL}/simpanan/`, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      simpananList.value = response.data.data;
    } else {
      throw new Error("Gagal mengambil data simpanan.");
    }
  } catch (err) {
    console.error("Fetch Error:", err);
    error.value = err.response?.data?.message || "Terjadi kesalahan jaringan.";
  } finally {
    isLoading.value = false;
  }
};


const downloadTemplate = async () => {
  const token = localStorage.getItem("user_token");

  try {
    const response = await axios.get(`${API_BASE_URL}/karyawan/?page=1&limit=1000`, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
        Authorization: `Bearer ${token}`,
      },
    });

    const daftarKaryawan = response.data.data || [];
    const karyawanTanpaPengurus = daftarKaryawan.filter(k => k.jabatan !== 'Sekretaris' && k.jabatan !== 'Bendahara' && k.jabatan !== 'Ketua' && k.jabatan !== 'Admin');

    if (karyawanTanpaPengurus.length === 0) {
      Swal.fire("Peringatan", "Tidak ada data karyawan ditemukan.", "warning");
      return;
    }

    const templateData = [];
    karyawanTanpaPengurus.forEach((karyawan) => {
      const gaji = parseFloat(karyawan.gaji) || 0;
      const simpananWajibDefault = gaji * 0.05;

      templateData.push({
        id_karyawan: karyawan.id_karyawan,
        nama_karyawan: karyawan.nama_karyawan,
        jenis_simpanan: "wajib",
        jumlah_simpanan: simpananWajibDefault,
      });

      templateData.push({
        id_karyawan: karyawan.id_karyawan,
        nama_karyawan: karyawan.nama_karyawan,
        jenis_simpanan: "sukarela",
        jumlah_simpanan: 0,
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    worksheet['!cols'] = [
      { wch: 40 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Import");

    XLSX.writeFile(workbook, `Template_Simpanan_${new Date().toISOString().split('T')[0]}.xlsx`);

    Swal.fire("Berhasil", "Template berhasil dibuat tanpa kolom bulan.", "success");

  } catch (err) {
    console.error("Template Error:", err);
    Swal.fire("Gagal", "Tidak bisa mengambil data karyawan untuk template.", "error");
  }
};

const handleImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      Swal.fire("Error", "File Excel kosong!", "error");
      return;
    }
    if (!jsonData[0].hasOwnProperty('id_karyawan') || !jsonData[0].hasOwnProperty('jenis_simpanan') || !jsonData[0].hasOwnProperty('jumlah_simpanan')) {
      Swal.fire("Error", "Format file tidak sesuai. Pastikan kolom 'id_karyawan', 'jenis_simpanan', dan 'jumlah_simpanan' ada.", "error");
      return;
    }

    confirmImport(jsonData);
  };
  reader.readAsArrayBuffer(file);
  event.target.value = '';
};

const confirmImport = async (data) => {

  const mappedData = data
    .filter(item => parseFloat(item.jumlah_simpanan) > 0)
    .map(item => ({
      id_karyawan: item.id_karyawan,
      jenis_simpanan: item.jenis_simpanan,
      jumlah_simpanan: parseFloat(item.jumlah_simpanan),
      tanggal_simpanan: null
    }));

  if (mappedData.length === 0) {
    Swal.fire("Info", "Tidak ada data simpanan valid yang ditemukan untuk diimport.", "info");
    return;
  }

  const result = await Swal.fire({
    title: 'Konfirmasi Import',
    text: `Ditemukan ${mappedData.length} data simpanan valid. Lanjutkan kirim ke server?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Import!',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
  });

  if (result.isConfirmed) {
    isLoading.value = true;
    const token = localStorage.getItem("user_token");

    try {
      await axios.post(`${API_BASE_URL}/simpanan/bulk`, mappedData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420"
        }
      });

      Swal.fire({
        title: "Berhasil!",
        text: "Data simpanan massal berhasil disimpan.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });

      fetchSimpanan();
    } catch (err) {
      console.error("Import Error:", err);
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Terjadi kesalahan saat memproses data di server.",
        "error"
      );
    } finally {
      isLoading.value = false;
    }
  }
};

const isDarkMode = ref(false);

const updateTheme = () => {
  isDarkMode.value = document.documentElement.classList.contains("dark");
};

let themeObserver;

onMounted(() => {
  fetchSimpanan();
  updateTheme();

  themeObserver = new MutationObserver(() => {
    updateTheme();
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onUnmounted(() => {
  if (themeObserver) themeObserver.disconnect();
});
</script>

<style scoped>
/* :deep(.vgt-table) {
  background-color: transparent;
  border-color: rgba(156, 163, 175, 0.2);
}

:deep(.vgt-wrap__footer) {
  background: transparent;
  border-color: rgba(156, 163, 175, 0.2);
}

:deep(.vgt-input),
:deep(.vgt-select) {
  background-color: transparent !important;
  color: inherit !important;
  border: 1px solid rgba(156, 163, 175, 0.3) !important;
} */
</style>
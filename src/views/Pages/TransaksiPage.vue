<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div
      class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
      <div class="mb-6 flex flex-col gap-2">
        <h3 class="font-semibold text-gray-800 text-xl dark:text-white/90">
          Riwayat Transaksi Keuangan
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Memantau arus kas masuk dan keluar koperasi secara real-time.
        </p>
      </div>
      <div v-if="currentRole === 'bendahara'" class="mb-4 justify-end flex">
        <button @click="openAddExpenseModal"
          class="flex items-center justify-center gap-2 rounded-lg bg-error-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-error-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd" />
          </svg>
          Catat Pengeluaran Dana
        </button>
      </div>

      <div v-if="isLoading" class="text-center py-10">
        <div class="animate-spin inline-block w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mb-2">
        </div>
        <p class="text-brand-500 font-medium">Memuat data transaksi...</p>
      </div>

      <div v-else-if="error" class="text-center py-10 text-error-500 bg-error-50 dark:bg-error-500/10 rounded-xl">
        <p class="font-medium">Gagal memuat data: {{ error }}</p>
        <button @click="fetchTransaksi" class="mt-4 text-sm underline hover:text-error-600">Coba Lagi</button>
      </div>

      <div v-else>
        <vue-good-table :theme="isDarkMode ? 'nocturnal' : 'polar-bear'" :columns="columns" :rows="transaksiList"
          :search-options="{
            enabled: true,
            placeholder: 'Cari karyawan, tipe, atau keterangan...',
          }" :pagination-options="{
            enabled: true,
            mode: 'records',
            perPage: 10,
            perPageDropdown: [10, 25, 50],
            rowsPerPageLabel: 'Baris per halaman',
            ofLabel: 'dari',
          }" :sort-options="{
            enabled: true,
            initialSortBy: { field: 'tanggal', type: 'desc' }
          }">
          <template #table-row="props">
            <span v-if="props.column.field === 'tipe_transaksi'" class="flex items-center gap-3">
              <div :class="[
                'flex h-8 w-8 items-center justify-center rounded-full',
                props.row.jenis === 'masuk' ? 'bg-success-100 text-success-600 dark:bg-success-500/10' : 'bg-error-100 text-error-600 dark:bg-error-500/10'
              ]">
                <svg v-if="props.row.jenis === 'masuk'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <span class="font-medium text-gray-800 dark:text-white/90">
                {{ formatTipe(props.row.tipe_transaksi) }}
              </span>
            </span>

            <span v-else-if="props.column.field === 'jumlah'"
              :class="['font-bold', props.row.jenis === 'masuk' ? 'text-success-600' : 'text-error-600']">
              {{ props.row.jenis === 'masuk' ? '+' : '-' }} {{ formatCurrency(props.row.jumlah) }}
            </span>

            <span v-else-if="props.column.field === 'tanggal'">
              {{ formatDate(props.row.tanggal) }}
            </span>

            <span v-else-if="props.column.field === 'keterangan'" class="italic text-gray-500 dark:text-gray-400">
              {{ props.row.keterangan || '-' }}
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
import Swal from "sweetalert2";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const currentPageTitle = ref("Transaksi");
const transaksiList = ref([]);
const isLoading = ref(true);
const error = ref(null);
const isDarkMode = ref(false);
const currentRole = localStorage.getItem("user_role");

const columns = ref([
  { label: "Tanggal", field: "tanggal", sortable: true },
  { label: "Tipe Transaksi", field: "tipe_transaksi", sortable: true },
  { label: "Karyawan / Pelaku", field: "nama_karyawan", sortable: true },
  { label: "Jumlah", field: "jumlah", type: "number", sortable: true },
  { label: "Keterangan", field: "keterangan", sortable: false },
]);

const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTipe = (tipe) => {
  return tipe.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const fetchTransaksi = async () => {
  isLoading.value = true;
  error.value = null;
  const token = localStorage.getItem("user_token");

  try {
    const response = await axios.get(`${API_BASE_URL}/transaksi/table`, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.success) {
      transaksiList.value = response.data.data;
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Koneksi API terputus.";
  } finally {
    isLoading.value = false;
  }
};

const openAddExpenseModal = async (initialData = null) => {
  const isDark = document.documentElement.classList.contains("dark");

  const valJumlah = initialData ? initialData.jumlah : '';
  const valKeterangan = initialData ? initialData.keterangan : '';

  const { value: formValues } = await Swal.fire({
    title: '<span class="text-xl font-bold dark:text-white/90 text-gray-800">Catat Pengeluaran Dana</span>',
    background: isDark ? '#1f2937' : '#ffffff',
    color: isDark ? '#f3f4f6' : '#1f2937',
    html: `
      <div class="text-left mt-4 space-y-4">
        <div>
          <label class="block text-sm font-semibold dark:text-gray-300 text-gray-700 mb-1">Jumlah (Rp)</label>
          <input id="swal-input-jumlah" 
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-error-500 focus:border-error-500 outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                 type="text" 
                 ${valJumlah ? `value="${valJumlah}"` : ''}
                 placeholder="Contoh: 100.000">
        </div>
        <div>
          <label class="block text-sm font-semibold dark:text-gray-300 text-gray-700 mb-1">Keterangan</label>
          <textarea id="swal-input-keterangan" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-error-500 focus:border-error-500 outline-none transition h-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    placeholder="Contoh: Uang makan siang">${valKeterangan ? valKeterangan : ''}</textarea>
        </div>
      </div>
    `,
    customClass: {
      popup: 'rounded-2xl p-6 border dark:border-gray-700 shadow-xl',
      confirmButton: 'bg-error-600 hover:bg-error-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg transition-all',
      cancelButton: 'bg-gray-400 hover:bg-gray-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-md transition-all ml-3'
    },
    buttonsStyling: false,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Lanjut Konfirmasi',
    cancelButtonText: 'Batal',
    didOpen: () => {
      const inputJumlah = document.getElementById('swal-input-jumlah');

      if (inputJumlah.value) {
        let clean = inputJumlah.value.replace(/[^0-9]/g, '');
        inputJumlah.value = new Intl.NumberFormat('id-ID').format(clean);
      }

      inputJumlah.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        e.target.value = value ? new Intl.NumberFormat('id-ID').format(value) : '';
      });
    },
    preConfirm: () => {
      const inputJumlah = document.getElementById('swal-input-jumlah');
      const keterangan = document.getElementById('swal-input-keterangan').value;
      const rawJumlah = inputJumlah.value.replace(/\./g, '');
      const jumlah = parseInt(rawJumlah);

      if (!jumlah || jumlah <= 0) {
        Swal.showValidationMessage('Jumlah harus diisi dan lebih dari 0');
        return false;
      }
      if (!keterangan) {
        Swal.showValidationMessage('Keterangan wajib diisi');
        return false;
      }

      return { jumlah: jumlah, keterangan: keterangan, rawString: inputJumlah.value };
    }
  });

  if (formValues) {
    submitExpense(formValues);
  }
};

const submitExpense = async (payload) => {
  const isDark = document.documentElement.classList.contains("dark");

  const confirmResult = await Swal.fire({
    title: 'Konfirmasi Transaksi',
    html: `
      <div class="text-left p-2 space-y-2">
        <p class="text-sm text-gray-600 dark:text-gray-400">Apakah Anda yakin data pengeluaran berikut sudah benar?</p>
        <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
          <p class="text-xs font-bold uppercase text-gray-500">Jumlah:</p>
          <p class="text-lg font-bold text-error-600">${formatCurrency(payload.jumlah)}</p>
          <p class="text-xs font-bold uppercase text-gray-500 mt-2">Keterangan:</p>
          <p class="text-sm text-gray-800 dark:text-gray-200">${payload.keterangan}</p>
        </div>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Simpan Sekarang',
    cancelButtonText: 'Cek Kembali',
    confirmButtonColor: '#d33',
    background: isDark ? '#1f2937' : '#ffffff',
    color: isDark ? '#f3f4f6' : '#1f2937',
  });

  if (confirmResult.dismiss === Swal.DismissReason.cancel) {
    openAddExpenseModal({
      jumlah: payload.jumlah.toString(),
      keterangan: payload.keterangan
    });
    return;
  }

  if (!confirmResult.isConfirmed) return;

  isLoading.value = true;
  const token = localStorage.getItem("user_token");

  try {
    const response = await axios.post(`${API_BASE_URL}/transaksi/pengeluaran_dana`, {
      jumlah: payload.jumlah,
      keterangan: payload.keterangan
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      await Swal.fire({
        title: 'Berhasil!',
        text: 'Pengeluaran dana telah berhasil dicatat dalam riwayat.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      });
      fetchTransaksi();
    }
  } catch (err) {
    Swal.fire('Gagal!', err.response?.data?.message || 'Terjadi kesalahan saat menyimpan.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const updateTheme = () => {
  isDarkMode.value = document.documentElement.classList.contains("dark");
};

let themeObserver;

onMounted(() => {
  fetchTransaksi();
  updateTheme();
  themeObserver = new MutationObserver(updateTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});

onUnmounted(() => {
  if (themeObserver) themeObserver.disconnect();
});
</script>
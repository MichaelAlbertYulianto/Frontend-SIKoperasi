<template>
  <admin-layout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="p-6 bg-white dark:bg-gray-800 shadow rounded-lg">
      <h1 class="text-3xl font-semibold text-gray-900 dark:text-white mb-6">Daftar Pinjaman yang Sedang Berjalan</h1>

      <div v-if="isLoading" class="text-center py-10">
        <svg class="animate-spin h-8 w-8 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Memuat data pinjaman aktif...</p>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert">
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline ml-2">{{ error }}</span>
      </div>

      <div v-else>
        <div v-if="pinjamanList.length === 0"
          class="text-center py-10 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-700">
          <p class="text-gray-600 dark:text-gray-400">Tidak ada pinjaman dengan status DICAIKAN saat ini.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <vue-good-table :columns="columns" :rows="pinjamanList" :theme="isDarkMode ? 'nocturnal' : 'polar-bear'"
            :search-options="{ enabled: true, placeholder: 'Cari nama atau tujuan...' }" :pagination-options="{
              enabled: true,
              mode: 'records',
              perPage: 10,
              perPageDropdown: [10, 20, 50],
              rowsPerPageLabel: 'Baris per halaman',
              ofLabel: 'dari',
            }" :sort-options="{
              enabled: true,
              initialSortBy: { field: 'updated_at', type: 'desc' }
            }">

            <template #table-row="props">
              <span v-if="props.column.field === 'nama_karyawan'" class="font-medium text-gray-900 dark:text-white">
                {{ props.row.nama_karyawan || 'N/A' }}
              </span>

              <span v-else-if="props.column.field === 'jumlah_pinjaman'"
                class="text-green-600 dark:text-green-400 font-semibold">
                {{ formatCurrency(props.row.jumlah_pinjaman) }}
              </span>

              <span v-else-if="props.column.field === 'updated_at'">
                {{ props.formattedRow[props.column.field] }}
              </span>

              <span v-else-if="props.column.field === 'aksi'">
                <button @click="viewDetail(props.row)"
                  class="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium">
                  Lihat Angsuran
                </button>
              </span>

              <span v-else>
                {{ props.formattedRow[props.column.field] }}
              </span>
            </template>
          </vue-good-table>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup>
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { VueGoodTable } from 'vue-good-table-next';
import { useRouter } from 'vue-router';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const userToken = localStorage.getItem('user_token');
const router = useRouter();

const columns = ref([
  { label: 'Nama Karyawan', field: 'nama_karyawan', sortable: true },
  { label: 'Jumlah Pinjaman', field: 'jumlah_pinjaman', sortable: true, type: 'number' },
  { label: 'Tenor', field: 'tenor', sortable: true, type: 'number' },
  { label: 'Tujuan', field: 'tujuan_pinjaman', sortable: true },
  {
    label: 'Tanggal Pencairan',
    field: 'updated_at',
    sortable: true,
    type: 'date',
    dateInputFormat: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'',
    dateOutputFormat: 'dd MMM yyyy'
  },
  { label: 'Aksi', field: 'aksi', sortable: false },
]);

const viewDetail = (pinjaman) => {
  router.push({
    name: 'Detail Angsuran',
    params: { id: pinjaman.id_pinjaman }
  });
};

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return 'N/A';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(parseFloat(amount));
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const pinjamanList = ref([]);
const isLoading = ref(false);
const error = ref(null);


const fetchActivePinjaman = async () => {
  isLoading.value = true;
  error.value = null;

  if (!userToken) {
    error.value = "Pengguna tidak terautentikasi.";
    isLoading.value = false;
    return;
  }

  try {

    const response = await axios.get(`${API_BASE_URL}/pinjaman/aktif`, {
      headers: {
        'ngrok-skip-browser-warning': '69420',
        'Authorization': `Bearer ${userToken}`
      }
    });

    const rawPinjamanData = response.data.data;

    const disbursedPinjaman = rawPinjamanData.filter(
      p => p.status_pinjaman === 'dicairkan'
    );

    const processedPinjamanPromises = disbursedPinjaman.map(async pinjaman => {

      const id_karyawan = pinjaman.id_karyawan;
      let nama_karyawan = 'N/A';

      if (id_karyawan) {
        try {
          const karyawanRes = await axios.get(`${API_BASE_URL}/karyawan/${id_karyawan}`, {
            headers: {
              'ngrok-skip-browser-warning': '69420',
              'Authorization': `Bearer ${userToken}`
            }
          });
          nama_karyawan = karyawanRes.data.data.nama_karyawan;
        } catch (e) {
          console.error(`User detail lookup failed for ID ${id_karyawan}`, e);
        }
      }

      return {
        ...pinjaman,
        nama_karyawan: nama_karyawan,
      };
    });

    pinjamanList.value = await Promise.all(processedPinjamanPromises);

  } catch (err) {
    const axiosError = err;
    error.value = `Gagal memuat data pinjaman aktif: ${axiosError.response?.statusText || err.message}`;
    console.error('Fetch Active Loan Error:', err);
  } finally {
    isLoading.value = false;
  }
};
const currentPageTitle = ref("Pinjaman Aktif");


const isDarkMode = ref(false);

const updateTheme = () => {
  isDarkMode.value = document.documentElement.classList.contains("dark");
};

let themeObserver;

onMounted(() => {
  fetchActivePinjaman();
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

<style scoped></style>
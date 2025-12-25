<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div
      class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8"
    >
      <div class="mb-6">
        <h3 class="font-semibold text-gray-800 text-xl dark:text-white/90">
          Riwayat Semua Pengajuan Pinjaman
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Total: {{ pinjamanList.length }} Pengajuan Tercatat
        </p>
      </div>

      <div v-if="isLoading" class="text-center py-10">
        <p class="text-brand-500">Memuat data riwayat pinjaman...</p>
      </div>

      <div v-else-if="error" class="text-center py-10 text-error-500">
        <p>Gagal memuat data: {{ error }}</p>
      </div>

      <div v-else class="history-pinjaman-table">
        <vue-good-table
          :columns="columns"
          :rows="pinjamanList"
          :theme="isDarkMode ? 'nocturnal' : 'polar-bear'"
          :search-options="{ 
            enabled: true, 
            placeholder: 'Cari pinjaman berdasarkan nama atau tujuan...',
          }"
          :sort-options="{
            enabled: true,
            initialSortBy: { field: 'tanggal_pengajuan', type: 'desc' },
          }"
          :pagination-options="{
            enabled: true,
            mode: 'records',
            perPage: 10,
            perPageDropdown: [10, 20, 50],
            nextLabel: 'Next',
            prevLabel: 'Prev',
            rowsPerPageLabel: 'Baris per halaman',
            ofLabel: 'dari',
            pageLabel: 'halaman', 
          }"
        >
          <template #table-row="props">
            <span v-if="props.column.field === 'jumlah_pinjaman'">
              {{ formatCurrency(props.row.jumlah_pinjaman) }}
            </span>
            <span v-else-if="props.column.field === 'status_pinjaman'">
              <span :class="statusClass(props.row.status_pinjaman)">
                {{ formatStatus(props.row.status_pinjaman) }}
              </span>
            </span>
            <span v-else-if="props.column.field === 'tanggal_pengajuan'">
              {{ formatDate(props.row.tanggal_pengajuan) }}
            </span>
            <span v-else-if="props.column.field === 'aksi'">
              <button
                @click="viewDetail(props.row)"
                class="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
              >
                Lihat Detail
              </button>
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
import axios from 'axios';
import { VueGoodTable } from 'vue-good-table-next'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = '/pinjaman';

const currentPageTitle = ref("Riwayat Pinjaman");
const pinjamanList = ref([]);
const isLoading = ref(true);
const error = ref(null);

const columns = ref([
//   { label: 'Nama Karyawan', field: 'nama_karyawan', sortable: true, filterOptions: { enabled: true } },
  { label: 'Nama Karyawan', field: 'nama_karyawan', sortable: true },
  { label: 'Jumlah', field: 'jumlah_pinjaman', sortable: true, type: 'number' },
  { label: 'Tenor', field: 'tenor', sortable: true, type: 'number' },
  { label: 'Tujuan', field: 'tujuan_pinjaman', sortable: true },
  { label: 'Pengajuan', field: 'tanggal_pengajuan', sortable: true },
//   { label: 'Status', field: 'status_pinjaman', sortable: true, filterOptions: { enabled: true } },
  { label: 'Status', field: 'status_pinjaman', sortable: true},
  { label: 'Aksi', field: 'aksi', sortable: false },
]);


const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(parseFloat(value));
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const statusClass = (status) => {
    switch (status) {
        case 'dicairkan':
        case 'disetujui':
            return 'inline-flex items-center rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-800 dark:bg-success-800/20 dark:text-success-500';
        case 'ditolak':
            return 'inline-flex items-center rounded-full bg-error-100 px-2 py-0.5 text-xs font-medium text-error-800 dark:bg-error-800/20 dark:text-error-500';
        case 'menunggu_persetujuan':
        default:
            return 'inline-flex items-center rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-800 dark:bg-warning-800/20 dark:text-warning-500';
    }
};

const viewDetail = (pinjaman) => {
    const pinjamanId = pinjaman.id_pinjaman;
    if (pinjamanId) {
        window.location.href = `/detail-pinjaman/${pinjamanId}`; 
    } else {
        alert('ID Pinjaman tidak tersedia.');
    }
};

// --- Logika Pengambilan Data API ---
const fetchHistoryPinjaman = async () => {
    isLoading.value = true;
    error.value = null;
    const userToken = localStorage.getItem('user_token');

    if (!userToken) {
        error.value = "Pengguna tidak terautentikasi. Silakan login kembali.";
        isLoading.value = false;
        return;
    }

    try {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINT}`, {
            headers: { 
                'ngrok-skip-browser-warning': '69420',
                'Authorization': `Bearer ${userToken}` 
            }
        });

        let rawPinjamanData = response.data.data;

        const uniqueKaryawanIds = [...new Set(rawPinjamanData.map(p => p.id_karyawan))];
        const karyawanMap = {};

        const karyawanLookups = uniqueKaryawanIds.map(karyawanId =>
            axios.get(`${API_BASE_URL}/karyawan/${karyawanId}`, {
            headers: { 
                'ngrok-skip-browser-warning': '69420',
                'Authorization': `Bearer ${userToken}` 
            }
            })
            .then(res => {
                karyawanMap[karyawanId] = res.data.data.nama_karyawan || 'N/A';
            })
            .catch(() => {
                karyawanMap[karyawanId] = 'Unknown Employee';
            })
        );
        await Promise.all(karyawanLookups);


        const enrichedPinjamanList = rawPinjamanData.map(pinjaman => {
             let tanggalPengajuanDate = pinjaman.tanggal_pengajuan ? new Date(pinjaman.tanggal_pengajuan) : null;

             return {
                ...pinjaman,
                nama_karyawan: karyawanMap[pinjaman.id_karyawan] || 'N/A',
                tanggal_pengajuan: tanggalPengajuanDate, 
             };
        });
        
        pinjamanList.value = enrichedPinjamanList;

    } catch (err) {
        const axiosError = err;
        if (axios.isAxiosError(axiosError) && axiosError.response) {
            error.value = `API Error: Status ${axiosError.response.status}. ${axiosError.response.data.message || axiosError.response.statusText}`;
            console.error('API Error:', axiosError.response.data);
        } else {
            error.value = "Terjadi kesalahan jaringan.";
            console.error('Network Error:', err);
        }
    } finally {
        isLoading.value = false;
    }
};

const isDarkMode = ref(false);

const updateTheme = () => {
  isDarkMode.value = document.documentElement.classList.contains("dark");
};

let themeObserver;

onMounted(() => {
    fetchHistoryPinjaman();
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
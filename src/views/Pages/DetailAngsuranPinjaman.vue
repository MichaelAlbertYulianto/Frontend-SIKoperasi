<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div
      class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12"
    >
      <div class="mx-auto w-full max-w-4xl">
        <h3 class="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Detail Angsuran Pinjaman
        </h3>

        <div v-if="isLoading" class="text-center py-10">
          <p class="text-brand-500">Memuat detail angsuran...</p>
        </div>

        <div v-else-if="error" class="text-center py-10 text-error-500">
          <p>Gagal memuat data: {{ error }}</p>
          <button @click="router.back()" class="mt-4 text-brand-500 hover:underline">
            Kembali
          </button>
        </div>

        <div v-else class="space-y-8">
          
          <div class="p-6 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <h4 class="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Informasi Pinjaman</h4>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
              <DetailItem label="Nama Karyawan" :value="pinjamanDetail.nama_karyawan" />
              <DetailItem label="Tanggal Pencairan" :value="formatDate(pinjamanDetail.updated_at)" />
              <DetailItem label="Jumlah Pokok" :value="formatCurrency(pinjamanDetail.jumlah_pinjaman)" />
              <DetailItem label="Tenor" :value="pinjamanDetail.tenor + ' bulan'" />
              <DetailItem label="Status Pinjaman">
                <template #value>
                  <span :class="statusClass(pinjamanDetail.status_pinjaman)">
                    {{ formatStatus(pinjamanDetail.status_pinjaman) }}
                  </span>
                </template>
              </DetailItem>
              <DetailItem label="Total Kewajiban" :value="formatCurrency(pinjamanDetail.total_kewajiban)" />
            </div>
          </div>
          
          <div class="p-6 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800">
            <h4 class="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Jadwal & Riwayat Pembayaran</h4>

            <div v-if="angsuranList.length === 0" class="text-center py-5 text-gray-500 dark:text-gray-400">
                <p>Jadwal angsuran belum tersedia atau pinjaman belum dicairkan.</p>
            </div>
            <vue-good-table 
                v-else
                :columns="angsuranColumns" 
                :rows="angsuranList"
                :pagination-options="{ enabled: false }"
                :sort-options="{ initialSortBy: [{field: 'angsuran_ke', type: 'asc'}] }"
                style-class="vgt-table striped bordered">
                
                <template #table-row="props">
                    <span v-if="props.column.field === 'angsuran_ke'">
                        Bulan ke-{{ props.row.angsuran_ke }}
                    </span>

                    <span v-else-if="props.column.field === 'tanggal_jatuh_tempo'">
                        {{ formatDate(props.row.tanggal_jatuh_tempo) }}
                    </span>

                    <span v-else-if="['jumlah_tertagih', 'jumlah_terbayar', 'sisa_tagihan'].includes(props.column.field)">
                        {{ formatCurrency(props.row[props.column.field]) }}
                    </span>
                    
                    <span v-else-if="props.column.field === 'status_angsuran'">
                        <span :class="statusAngsuranClass(props.row.status_angsuran)">
                            {{ formatStatusAngsuran(props.row.status_angsuran) }}
                        </span>
                    </span>

                    <span v-else>
                        {{ props.formattedRow[props.column.field] }}
                    </span>
                </template>
            </vue-good-table>
          </div>

          <button @click="router.back()"
            class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700">
            Kembali ke Daftar Pinjaman Aktif
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, h } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import { VueGoodTable } from "vue-good-table-next";
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();
const router = useRouter();

const pinjamanId = ref(route.params.id);
const currentPageTitle = ref(`Detail Angsuran: ${pinjamanId.value.substring(0, 8)}...`);

const pinjamanDetail = ref({});
const angsuranList = ref([]);
const isLoading = ref(true);
const error = ref(null);
const userToken = localStorage.getItem('user_token');

const DetailItem = {
    props: ['label', 'value'],
    setup(props, { slots }) {
        return () => h('div', { 
            class: 'flex justify-between py-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0' 
        }, [
            h('span', { 
                class: 'text-sm font-medium text-gray-600 dark:text-gray-400' 
            }, props.label),
            
            h('span', { 
                class: 'text-sm font-semibold text-gray-900 dark:text-white' 
            }, 
              slots.value ? slots.value() : props.value 
            )
        ]);
    }
};

const angsuranColumns = ref([
    { label: 'Bulan Ke', field: 'angsuran_ke', sortable: true, type: 'number' },
    { label: 'Jatuh Tempo', field: 'tanggal_jatuh_tempo', sortable: true, type: 'date', dateInputFormat: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'', dateOutputFormat: 'dd MMM yyyy' },
    { label: 'Tagihan', field: 'jumlah_tertagih', sortable: true, type: 'number' },
    { label: 'Terbayar', field: 'jumlah_terbayar', sortable: true, type: 'number' },
    { label: 'Sisa Tagihan', field: 'sisa_tagihan', sortable: true, type: 'number' },
    { label: 'Status', field: 'status_angsuran', sortable: true },
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

const formatStatusAngsuran = (status) => {
    if (!status) return 'N/A';
    const formatted = status.replace(/_/g, ' ');
    if (formatted.toLowerCase() === 'belum lunas') {
        return 'Belum Bayar';
    }
    return formatted.replace(/\b\w/g, (l) => l.toUpperCase());
};

const statusClass = (status) => {
    switch (status) {
        case 'dicairkan':
            return 'inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-800/20 dark:text-primary-500';
        default: 
            return 'inline-flex items-center rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-800 dark:bg-warning-800/20 dark:text-warning-500';
    }
};

const statusAngsuranClass = (status) => {
    switch (status) {
        case 'lunas':
            return 'inline-flex items-center rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-800 dark:bg-success-800/20 dark:text-success-500';
        case 'terlambat':
            return 'inline-flex items-center rounded-full bg-error-100 px-2 py-0.5 text-xs font-medium text-error-800 dark:bg-error-800/20 dark:text-error-500';
        case 'belum_lunas':
        default:
            return 'inline-flex items-center rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-800 dark:bg-warning-800/20 dark:text-warning-500';
    }
};


const fetchAngsuranDetails = async () => {
    isLoading.value = true;
    error.value = null;

    if (!pinjamanId.value || !userToken) {
        error.value = "ID Pinjaman atau Token tidak ditemukan.";
        isLoading.value = false;
        return;
    }
    
    const promises = {};

    try {
        promises.pinjaman = axios.get(`${API_BASE_URL}/pinjaman/pinjaman/${pinjamanId.value}`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });

        promises.angsuran = axios.get(`${API_BASE_URL}/angsuran/pinjaman/${pinjamanId.value}`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        const [pinjamanRes, angsuranRes] = await Promise.all([
            promises.pinjaman, 
            promises.angsuran
        ]);
        
        const pDetail = pinjamanRes.data.data;
        
        const karyawanRes = await axios.get(`${API_BASE_URL}/karyawan/${pDetail.id_karyawan}`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const nama_karyawan = karyawanRes.data.data.nama_karyawan;

        pinjamanDetail.value = {
            ...pDetail,
            nama_karyawan: nama_karyawan || 'N/A',
            total_kewajiban: parseFloat(angsuranRes.data.data.belum_lunas[0]?.jumlah_tertagih || angsuranRes.data.data.lunas[0]?.jumlah_tertagih || pDetail.jumlah_pinjaman / pDetail.tenor) * pDetail.tenor,
        };
        
        const lunas = angsuranRes.data.data.lunas || [];
        const belumLunas = angsuranRes.data.data.belum_lunas || [];
        
        angsuranList.value = [...lunas, ...belumLunas].sort((a, b) => a.angsuran_ke - b.angsuran_ke);


    } catch (err) {
        error.value = `Gagal memuat: ${err.response?.statusText || err.message}`;
        console.error('Fetch Detail Angsuran Error:', err);
    } finally {
        isLoading.value = false;
    }
};


onMounted(() => {
    fetchAngsuranDetails();
});
</script>

<style scoped>
.vgt-table {
    @apply w-full;
}
</style>
<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div
            class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
            <div class="space-y-6">
                <h3 class="mb-4 font-semibold text-gray-800 text-xl dark:text-white/90">
                    Total Simpanan Karyawan
                </h3>

                <div
                    class="p-6 border rounded-lg dark:border-gray-700 bg-brand-500/10 dark:bg-brand-900/20 text-center">
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Saldo Simpanan</p>
                    <h1 v-if="!isLoading" class="text-3xl font-bold text-brand-600 dark:text-brand-400 mt-2">
                        {{ formatCurrency(totalSimpanan) }}
                    </h1>
                    <div v-else class="h-8 w-3/4 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
                </div>

                <h4 class="mt-8 font-semibold text-gray-800 text-lg dark:text-white/90">Riwayat Detail Simpanan</h4>


                <div v-if="isLoading" class="text-center py-10">
                    <p class="text-brand-500">Memuat data simpanan...</p>
                </div>

                <div v-else-if="error" class="text-center py-10 text-error-500">
                    <p>Gagal memuat data: {{ error }}</p>
                </div>

                <div v-else class="simpanan-history-table">
                    <!-- <div v-if="simpananList.length === 0" class="text-sm text-gray-500 py-4"> -->
                    <!-- Belum ada riwayat simpanan. -->
                    <!-- </div> -->
                    <!-- <div v-else> -->
                    <vue-good-table :theme="isDarkMode ? 'nocturnal' : 'polar-bear'":columns="columns" :rows="simpananList"
                    
                        :search-options="{ enabled: true, placeholder: 'Cari jenis simpanan...' }" :pagination-options="{
                            enabled: true,
                            mode: 'records',
                            perPage: 10,
                            perPageDropdown: [10, 20],
                        }">
                        <template #table-row="props">
                            <span v-if="props.column.field === 'jumlah'">
                                {{ formatCurrency(props.row.jumlah) }}
                            </span>
                            <span v-else-if="props.column.field === 'tanggal_simpan'">
                                {{ formatDate(props.row.tanggal_simpan) }}
                            </span>
                            <span v-else-if="props.column.field === 'jenis_simpanan'">
                                <span :class="simpananTypeClass(props.row.jenis_simpanan)">
                                    {{ formatStatus(props.row.jenis_simpanan) }}
                                </span>
                            </span>
                            <span v-else>
                                {{ props.formattedRow[props.column.field] }}
                            </span>
                        </template>
                    </vue-good-table>
                    <!-- </div> -->
                </div>

                <h4 class="mt-8 font-semibold text-gray-800 text-lg dark:text-white/90">Riwayat Pinjaman Saya</h4>
                <!-- <div v-if="riwayatPinjaman.length > 0" class="pinjaman-history-table"> -->
                <vue-good-table :theme="isDarkMode ? 'nocturnal' : 'polar-bear'" :columns="columnsPinjaman" :rows="riwayatPinjaman"
                    :search-options="{ enabled: true, placeholder: 'Cari tujuan pinjaman...' }" :pagination-options="{
                        enabled: true,
                        mode: 'records',
                        perPage: 5,
                        perPageDropdown: [5, 10, 20],
                    }">
                    <template #table-row="props">
                        <span v-if="props.column.field === 'jumlah_pinjaman'">
                            {{ formatCurrency(props.row.jumlah_pinjaman) }}
                        </span>
                        <span v-else-if="props.column.field === 'tanggal_pengajuan'">
                            {{ formatDate(props.row.tanggal_pengajuan) }}
                        </span>
                        <span v-else-if="props.column.field === 'status_pinjaman'">
                            <span :class="pinjamanStatusClass(props.row.status_pinjaman)">
                                {{ formatStatus(props.row.status_pinjaman) }}
                            </span>
                        </span>
                        <span v-else-if="props.column.field === 'aksi'">
                            <button @click="viewDetail(props.row)"
                                class="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium">
                                Detail
                            </button>
                        </span>
                        <span v-else>
                            {{ props.formattedRow[props.column.field] }}
                        </span>
                    </template>
                </vue-good-table>
                <!-- </div> -->
                <!-- <div v-else class="text-sm text-gray-500 py-4">
                    Belum ada riwayat pengajuan pinjaman.
                </div> -->
            </div>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import axios from 'axios';
import { VueGoodTable } from 'vue-good-table-next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const currentPageTitle = ref("Simpanan Saya");
const simpananList = ref([]);
const totalSimpanan = ref(0);
const isLoading = ref(true);
const error = ref(null);
const riwayatPinjaman = ref([]);

const columns = ref([
    { label: 'ID Transaksi', field: 'id_simpanan', hidden: true },
    { label: 'Tanggal Simpan', field: 'tanggal_simpan', sortable: true },
    { label: 'Jenis Simpanan', field: 'jenis_simpanan', sortable: true },
    { label: 'Jumlah', field: 'jumlah', sortable: true, type: 'number' },
    // { label: 'Bulan Ke-', field: 'bulan_ke', sortable: true, type: 'number' },
]);
const columnsPinjaman = ref([
    { label: 'Pengajuan', field: 'tanggal_pengajuan', sortable: true },
    { label: 'ID Pinjaman', field: 'id_pinjaman', hidden: true },
    { label: 'Jumlah', field: 'jumlah_pinjaman', sortable: true, type: 'number' },
    { label: 'Tenor', field: 'tenor', sortable: true, type: 'number' },
    { label: 'Tujuan', field: 'tujuan_pinjaman', sortable: true },
    { label: 'Status', field: 'status_pinjaman', sortable: true },
]);

const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(parseFloat(value));
};

const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1);
};

const simpananTypeClass = (type) => {
    switch (type) {
        case 'wajib':
            return 'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-brand-100 text-brand-800';
        case 'sukarela':
            return 'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-success-100 text-success-800';
        default:
            return 'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800';
    }
};

const pinjamanStatusClass = (status) => {
    switch (status) {
        case 'disetujui':
            return 'inline-flex items-center rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-800';
        case 'ditolak':
            return 'inline-flex items-center rounded-full bg-error-100 px-2 py-0.5 text-xs font-medium text-error-800';
        case 'menunggu_persetujuan':
            return 'inline-flex items-center rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-800';
        case 'dicairkan':
            return 'inline-flex items-center rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-info-800';
        default:
            return 'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800';
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};


const fetchSimpananData = async () => {
    isLoading.value = true;
    error.value = null;

    const currentUserId = localStorage.getItem('current_user_id');
    const userToken = localStorage.getItem('user_token');

    if (!currentUserId || !userToken) {
        error.value = "ID Karyawan atau Token tidak ditemukan. Silakan login kembali.";
        isLoading.value = false;
        return;
    }

    try {
        const responseKaryawanId = await axios.get(`${API_BASE_URL}/user/${currentUserId}`, {
            headers: {
                'ngrok-skip-browser-warning': '69420',
                'Authorization': `Bearer ${userToken}`
            }
        });

        const idKaryawan = responseKaryawanId.data.data.id_karyawan;
        const response = await axios.get(`${API_BASE_URL}/simpanan/karyawan/${idKaryawan}`, {
            headers: {
                'ngrok-skip-browser-warning': '69420',
                'Authorization': `Bearer ${userToken}`
            }
        });
        const responsePinjaman = await axios.get(`${API_BASE_URL}/pinjaman/user/${idKaryawan}`, {
            headers: {
                'ngrok-skip-browser-warning': '69420',
                'Authorization': `Bearer ${userToken}`
            }
        });

        let rawSimpananData = response.data.data;
        let runningTotal = 0;

        const processedList = rawSimpananData.map(simpanan => {
            let tanggalSimpanDate = simpanan.tanggal_simpan ? new Date(simpanan.tanggal_simpan) : null;

            runningTotal += parseFloat(simpanan.jumlah);

            return {
                ...simpanan,
                jumlah: parseFloat(simpanan.jumlah),
                tanggal_simpan: tanggalSimpanDate,
            };
        });

        simpananList.value = processedList;
        totalSimpanan.value = runningTotal;

        const processedPinjaman = responsePinjaman.data.data.map(pinjaman => {
            let tanggalPengajuanDate = pinjaman.tanggal_pengajuan ? new Date(pinjaman.tanggal_pengajuan) : null;
            return {
                ...pinjaman,
                jumlah_pinjaman: parseFloat(pinjaman.jumlah_pinjaman),
                tanggal_pengajuan: tanggalPengajuanDate,
            };
        });
        riwayatPinjaman.value = processedPinjaman;

    } catch (err) {
        const axiosError = err;
        if (axios.isAxiosError(axiosError) && axiosError.response) {
            error.value = `API Error: Status ${axiosError.response.status}. ${axiosError.response.data.message || axiosError.response.statusText}`;
        } else {
            error.value = "Terjadi kesalahan jaringan.";
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
    fetchSimpananData();
    updateTheme();
    themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});

onUnmounted(() => {
    if (themeObserver) {
        themeObserver.disconnect();
    }
});
</script>
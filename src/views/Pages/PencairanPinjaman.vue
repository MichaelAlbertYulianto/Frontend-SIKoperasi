<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div
            class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
            <div class="mb-6">
                <h3 class="font-semibold text-gray-800 text-xl dark:text-white/90">
                    Daftar Pinjaman Siap Cair
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Pinjaman yang telah disetujui penuh oleh semua pengurus.
                </p>
            </div>

            <div v-if="isLoading" class="text-center py-10">
                <p class="text-brand-500">Memuat data pinjaman...</p>
            </div>

            <div v-else-if="error" class="text-center py-10 text-error-500">
                <p>Gagal memuat data: {{ error }}</p>
            </div>

            <div v-else class="overflow-x-auto">
                <div v-if="pinjamanList.length > 0">
                    <vue-good-table :columns="columns" :rows="pinjamanList" :theme="isDarkMode ? 'nocturnal' : 'polar-bear'"
                        :search-options="{ enabled: true, placeholder: 'Cari nama atau tujuan pinjaman...' }"
                        :pagination-options="{
                            enabled: true,
                            mode: 'records',
                            perPage: 10,
                            perPageDropdown: [10, 20, 50],
                            rowsPerPageLabel: 'Baris per halaman',
                            ofLabel: 'dari',
                        }" :sort-options="{
                            enabled: true,
                            initialSortBy: { field: 'tanggal_persetujuan', type: 'desc' }
                        }">

                        <template #table-row="props">
                            <span v-if="props.column.field === 'nama_karyawan'">
                                {{ props.row.nama_karyawan || 'N/A' }}
                            </span>

                            <span v-else-if="props.column.field === 'jumlah_pinjaman'">
                                {{ formatCurrency(props.row.jumlah_pinjaman) }}
                            </span>

                            <span v-else-if="props.column.field === 'tanggal_persetujuan'">
                                {{ formatDate(props.row.tanggal_persetujuan) }}
                            </span>

                            <span v-else-if="props.column.field === 'status_pinjaman'">
                                <span :class="statusClass(props.row.status_pinjaman)">
                                    {{ formatStatus(props.row.status_pinjaman) }}
                                </span>
                            </span>

                            <span v-else-if="props.column.field === 'aksi'">
                                <button v-if="canDisburse" @click="openDisburseModal(props.row)"
                                    class="px-3 py-1 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600">
                                    Cairkan Sekarang
                                </button>
                                <span v-else class="text-xs text-gray-500 dark:text-gray-400">
                                    Lihat Detail
                                </span>
                            </span>

                            <span v-else>
                                {{ props.formattedRow[props.column.field] }}
                            </span>
                        </template>
                    </vue-good-table>
                </div>

                <div v-else class="text-center py-10 text-gray-500 dark:text-gray-400">
                    Tidak ada pinjaman yang siap dicairkan.
                </div>
            </div>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import axios from 'axios';
import Swal from "sweetalert2";
import { VueGoodTable } from "vue-good-table-next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const currentPageTitle = ref("Pencairan Pinjaman");
const pinjamanList = ref([]);
const isLoading = ref(true);
const error = ref(null);

const userToken = localStorage.getItem('user_token');
const currentUserRole = ref(localStorage.getItem('user_role')?.toLowerCase());


const canDisburse = computed(() => {
    const roles = ['bendahara'];
    return roles.includes(currentUserRole.value);
});

const columns = ref([
    { label: 'Nama Karyawan', field: 'nama_karyawan', sortable: true },
    { label: 'Jumlah', field: 'jumlah_pinjaman', sortable: true, type: 'number' },
    { label: 'Tenor', field: 'tenor', sortable: true, type: 'number' },
    { label: 'Tujuan', field: 'tujuan_pinjaman', sortable: true },
    { label: 'Disetujui', field: 'updated_at', sortable: true, type: 'date', dateInputFormat: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'', dateOutputFormat: 'dd MMM yyyy' },
    { label: 'Status', field: 'status_pinjaman', sortable: true },
    { label: 'Aksi', field: 'aksi', sortable: false },
]);



const formatCurrency = (value) => {
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
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const statusClass = (status) => {
    switch (status) {
        case 'disetujui':
            return 'inline-flex items-center rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-800 dark:bg-success-800/20 dark:text-success-500';
        case 'dicairkan':
            return 'inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-800/20 dark:text-primary-500';
        default:
            return 'inline-flex items-center rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-800 dark:bg-warning-800/20 dark:text-warning-500';
    }
};
const fetchUserDetail = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/user/${userId}`, {
            headers: {
                'ngrok-skip-browser-warning': '69420',
                'Authorization': `Bearer ${userToken}`
            }
        });
        return {
            rekening_bank: response.data.data.rekening_bank || 'N/A',
            nama_bank: response.data.data.nama_bank || 'N/A',
        };
    } catch (err) {
        console.error(`Failed to fetch user detail for ${userId}:`, err);
        return { rekening_bank: 'N/A', nama_bank: 'N/A' };
    }
}



const openDisburseModal = async (pinjaman) => {
    await navigator.clipboard.writeText(pinjaman.rekening_bank);
    const result = await Swal.fire({
        title: 'Verifikasi Pencairan',
        html: `
            <p class="mb-4 text-gray-700 dark:text-gray-300">Detail penerima pinjaman:</p>
            <div class="space-y-2 text-left p-3 border rounded-lg bg-gray-50 dark:bg-gray-700">
                <p class="text-sm"><strong>Nama Karyawan:</strong> ${pinjaman.nama_karyawan}</p>
                <p class="text-sm"><strong>Jumlah Cair:</strong> <span class="text-xl font-bold text-brand-600">${formatCurrency(pinjaman.jumlah_pinjaman)}</span></p>
                <p class="text-sm"><strong>Nama Bank:</strong> ${pinjaman.nama_bank}</p>
                <p class="text-sm">
                    <strong>Nomor Rekening:</strong>
                    <span class="font-mono bg-yellow-100 p-1 rounded">${pinjaman.rekening_bank}</span>                    
                <span class="ml-2 text-xs text-gray-500">
                    Nomor rekening telah disalin ke clipboard.
                </span>
                </p> 
            </div>
            <p class="text-sm text-gray-500 mt-4">Klik 'Lanjutkan Pencairan' setelah memverifikasi detail rekening dan melakukan transfer dana.</p>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Lanjutkan Pencairan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#dc3545',
    });

    if (result.isConfirmed) {
        await finalConfirmDisburse(pinjaman);
    }
};
const disburseLoan = async (pinjamanId) => {
    try {

        const response = await axios.put(`${API_BASE_URL}/pinjaman/pencairan/${pinjamanId}`, {}, {
            headers: {
                'ngrok-skip-browser-warning': '69420',
                'Authorization': `Bearer ${userToken}`
            }
        });

        Swal.fire('Berhasil!', 'Pinjaman berhasil dicairkan. Status telah diperbarui.', 'success');

        await fetchDisbursablePinjaman();

    } catch (err) {
        const message = err.response?.data?.message || 'Gagal mencairkan pinjaman. Silakan coba lagi.';
        Swal.fire('Gagal!', message, 'error');
        console.error('Disbursement Error:', err);
    }
};

const fetchDisbursablePinjaman = async () => {
    isLoading.value = true;
    error.value = null;

    if (!userToken) {
        error.value = "Pengguna tidak terautentikasi.";
        isLoading.value = false;
        return;
    }

    try {

        const response = await axios.get(`${API_BASE_URL}/pinjaman/approved`, {
            headers: {
                'ngrok-skip-browser-warning': '69420',
                'Authorization': `Bearer ${userToken}`
            }
        });

        const rawPinjamanData = response.data.data;

        const processedPinjamanPromises = rawPinjamanData.map(async pinjaman => {

            const userId = pinjaman.id_user;

            let userDetails = {
                rekening_bank: 'N/A',
                nama_bank: 'N/A',
                nama_karyawan: 'N/A'
            };

            if (userId) {
                try {
                    const userRes = await axios.get(`${API_BASE_URL}/user/${userId}`, {
                        headers: {
                            'ngrok-skip-browser-warning': '69420',
                            'Authorization': `Bearer ${userToken}`
                        }
                    });
                    const userData = userRes.data.data;

                    userDetails = {
                        rekening_bank: userData.rekening_bank || 'N/A',
                        nama_bank: userData.nama_bank || 'N/A',
                        nama_karyawan: userData.nama_karyawan || 'N/A'
                    };
                } catch (e) {
                    console.error(`User detail lookup failed for ID ${userId}`, e);
                }
            }

            return {
                ...pinjaman,
                ...userDetails,
            };
        });

        const enrichedPinjamanList = await Promise.all(processedPinjamanPromises);

        pinjamanList.value = enrichedPinjamanList.filter(p => p.status_pinjaman === 'disetujui');

    } catch (err) {
        const axiosError = err;
        error.value = `Gagal memuat data: ${axiosError.response?.statusText || err.message}`;
        console.error('Fetch Approved Error:', err);
    } finally {
        isLoading.value = false;
    }
};

const finalConfirmDisburse = async (pinjaman) => {
    const finalResult = await Swal.fire({
        title: 'Konfirmasi Terakhir',
        text: 'Apakah Anda yakin dana sudah ditransfer dan Anda ingin mengubah status pinjaman menjadi dicairkan?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Status Dicairkan!',
        cancelButtonText: 'Tinjau Lagi',
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#3085d6',
    });

    if (finalResult.isConfirmed) {
        await disburseLoan(pinjaman.id_pinjaman);
    } else if (finalResult.dismiss === Swal.DismissReason.cancel) {
        await openDisburseModal(pinjaman);
    }
}

const isDarkMode = ref(false);

const updateTheme = () => {
  isDarkMode.value = document.documentElement.classList.contains("dark");
};

let themeObserver;

onMounted(() => {
    fetchDisbursablePinjaman();
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

<style></style>
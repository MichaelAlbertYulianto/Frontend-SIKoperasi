<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="'Pendingan Pinjaman'" />
        <div
            class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
            <div class="mb-6">
                <h3 class="font-semibold text-gray-800 text-xl dark:text-white/90">
                    Daftar Pengajuan Pinjaman yang Menunggu Persetujuan
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Total: {{ pinjamanList.length }} Pengajuan
                </p>
            </div>

            <div v-if="isLoading" class="text-center py-10">
                <p class="text-brand-500">Memuat data pinjaman...</p>
            </div>

            <div v-else-if="error" class="text-center py-10 text-error-500">
                <p>Gagal memuat data: {{ error }}</p>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                Nama Karyawan
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                Jumlah
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                Tenor
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                Tujuan
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                Pengajuan
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                Status
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                Aksi
                            </th>
                            <th v-if="showApprovalColumn"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                Persetujuan Saya
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr v-for="pinjaman in pinjamanList" :key="pinjaman.id_pinjaman">
                            <td
                                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white/90">
                                {{ pinjaman.nama_karyawan || 'N/A' }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {{ formatCurrency(pinjaman.jumlah_pinjaman) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {{ pinjaman.tenor }} bulan
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                {{ pinjaman.tujuan_pinjaman }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {{ formatDate(pinjaman.tanggal_pengajuan) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span v-if="pinjaman.status_pinjaman === 'menunggu_persetujuan'"
                                    :class="statusClass('menunggu_persetujuan')">
                                    Menunggu Persetujuan Pengurus Lain
                                </span>

                                <span v-else :class="statusClass(pinjaman.status_pinjaman)">
                                    {{ formatStatus(pinjaman.status_pinjaman) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button @click="viewDetail(pinjaman)"
                                    class="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                                    Lihat Detail
                                </button>
                            </td>
                            <td v-if="showApprovalColumn" class="px-6 py-4 whitespace-nowrap">
                                <span v-if="pinjaman.my_approval_status === 'disetujui'"
                                    :class="statusClass('disetujui')">
                                    DISETUJUI
                                </span>
                                <span v-else-if="pinjaman.my_approval_status === 'ditolak'"
                                    :class="statusClass('ditolak')">
                                    DITOLAK
                                </span>
                                <span v-else-if="pinjaman.is_my_turn" class="flex gap-2"
                                    :class="statusClass('menunggu_persetujuan')">
                                    Menunggu Persetujuan
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="pinjamanList.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
                    Tidak ada pinjaman yang menunggu persetujuan.
                </div>
            </div>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const pinjamanList = ref([]);
const isLoading = ref(true);
const error = ref(null);

const currentUserRole = ref(localStorage.getItem('user_role')?.toLowerCase());
const currentUserId = ref(localStorage.getItem('current_user_id'));

console.log(currentUserRole.value, currentUserId.value);

const getMyApprovalStatus = (persetujuanList, userRole, userId) => {
    if (!persetujuanList || !userRole) {
        return { status: 'N/A', myTurn: false };

    }

    const myApproval = persetujuanList.find(p => p.tahap_persetujuan.toLowerCase() === userRole);
    console.log('My Approval:', myApproval);

    if (myApproval) {
        return {
            status: myApproval.status,
            myTurn: myApproval.status === 'menunggu' && myApproval.id_user === userId,
        };
    }

    return { status: 'N/A', myTurn: false };
};

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
        case 'ditolak':
            return 'inline-flex items-center rounded-full bg-error-100 px-2 py-0.5 text-xs font-medium text-error-800 dark:bg-error-800/20 dark:text-error-500';
        case 'menunggu_persetujuan':
        default:
            return 'inline-flex items-center rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-800 dark:bg-warning-800/20 dark:text-warning-500';
    }
};

const viewDetail = (pinjaman) => {
    console.log("Lihat Detail Pinjaman:", pinjaman.id_pinjaman);
    alert(`Detail Pinjaman ${pinjaman.id_pinjaman.substring(0, 8)}: ${pinjaman.tujuan_pinjaman}`);
};

const fetchPendingPinjaman = async () => {
    isLoading.value = true;
    error.value = null;
    const userToken = localStorage.getItem('user_token');

    if (!userToken) {
        error.value = "Pengguna tidak terautentikasi. Silakan login kembali.";
        isLoading.value = false;
        return;
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/pinjaman/pending`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });

        let pendingPinjaman = response.data.data;
        const userLooksups = pendingPinjaman.map(async pinjaman => {

            const employeePromise = axios.get(`${API_BASE_URL}/karyawan/${pinjaman.id_karyawan}`, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            }).then(res => res.data.data.nama_karyawan).catch(() => 'N/A');

            const employeeName = await employeePromise;

            const myApproval = getMyApprovalStatus(
                pinjaman.persetujuan,
                currentUserRole.value,
                currentUserId.value
            );

            return {
                ...pinjaman,
                nama_karyawan: employeeName,
                my_approval_status: myApproval.status,
                is_my_turn: myApproval.myTurn
            };
        });

        const enrichedPinjamanList = await Promise.all(userLooksups);

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

const showApprovalColumn = computed(() => {
    const roles = ['ketua', 'bendahara', 'sekretaris'];
    return roles.includes(currentUserRole.value);
});



onMounted(() => {
    fetchPendingPinjaman();
});
</script>
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
                <div v-if="pinjamanList.length > 0" class="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    <p>
                        <strong>Catatan:</strong> "Menunggu Persetujuan Anda" berarti pengajuan pinjaman ini
                        menunggu persetujuan Anda sebagai {{ currentUserRole.charAt(0).toUpperCase() +
                            currentUserRole.slice(1) }}.
                    </p>
                    <vue-good-table :columns="columns" :rows="pinjamanList"
                        :search-options="{ enabled: true, placeholder: 'Cari nama, jumlah, atau tujuan...' }"
                        :sort-options="{
                            enabled: true,
                            initialSortBy: { field: 'tanggal_pengajuan', type: 'desc' },
                        }"
                        :pagination-options="{
                            enabled: true,
                            mode: 'records',
                            perPage: 10,
                            perPageDropdown: [10, 20, 50],
                        }">
                        <template #table-row="props">
                            <span v-if="props.column.field === 'nama_karyawan'">
                                {{ props.row.nama_karyawan || 'N/A' }}
                            </span>

                            <span v-else-if="props.column.field === 'jumlah_pinjaman'">
                                {{ formatCurrency(props.row.jumlah_pinjaman) }}
                            </span>

                            <span v-else-if="props.column.field === 'tenor'">
                                {{ props.row.tenor }} bulan
                            </span>

                            <span v-else-if="props.column.field === 'tanggal_pengajuan'">
                                {{ formatDate(props.row.tanggal_pengajuan) }}
                            </span>

                            <span v-else-if="props.column.field === 'status_pinjaman'">
                                <span
                                    v-if="props.row.status_pinjaman === 'menunggu_persetujuan' && props.row.is_my_turn"
                                    :class="statusClass('menunggu_persetujuan_anda')">
                                    Menunggu Persetujuan Anda
                                </span>
                                <span v-else-if="props.row.status_pinjaman === 'menunggu_persetujuan'"
                                    :class="statusClass('menunggu_persetujuan')">

                                    Menunggu {{
                                        props.row.next_role && props.row.next_role !== 'N/A'
                                            ? (props.row.next_role.charAt(0).toUpperCase() + props.row.next_role.slice(1))
                                    : 'Pengurus Lain'
                                    }}
                                </span>
                                <span v-else :class="statusClass(props.row.status_pinjaman)">
                                    {{ formatStatus(props.row.status_pinjaman) }}
                                </span>
                            </span>

                            <span v-else-if="props.column.field === 'aksi'">
                                <button @click="viewDetail(props.row)"
                                    class="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium">
                                    Lihat Detail
                                </button>
                            </span>

                            <span v-else>
                                {{ props.formattedRow[props.column.field] }}
                            </span>
                        </template>
                    </vue-good-table>
                </div>

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
import Swal from "sweetalert2";
import { VueGoodTable } from "vue-good-table-next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const pinjamanList = ref([]);
const isLoading = ref(true);
const error = ref(null);

const currentUserRole = ref(localStorage.getItem('user_role')?.toLowerCase());
const currentUserId = ref(localStorage.getItem('current_user_id'));

const APPROVAL_ORDER = ['sekretaris', 'bendahara', 'ketua'];

const columns = ref([
    { label: 'Nama Karyawan', field: 'nama_karyawan', sortable: true },
    { label: 'Jumlah', field: 'jumlah_pinjaman', sortable: true, type: 'number' },
    { label: 'Tenor', field: 'tenor', sortable: true, type: 'number' },
    { label: 'Tujuan', field: 'tujuan_pinjaman', sortable: true },
    { label: 'Pengajuan', field: 'tanggal_pengajuan', sortable: true },
    { label: 'Status', field: 'status_pinjaman', sortable: true },
    { label: 'Aksi', field: 'aksi', sortable: false },
]);


const getMyApprovalStatus = (persetujuanList, userRole, userId) => {
    if (!persetujuanList || !userRole) {
        return { status: 'N/A', myTurn: false, nextRole: 'N/A' };
    }

    let nextRoleToApprove = 'N/A';
    let myApproval = null;
    let isMyTurn = false;


for (const role of APPROVAL_ORDER) {
        const approvalEntry = persetujuanList.find(p => p.tahap_persetujuan.toLowerCase() === role);
        
        if (approvalEntry) {
            
            if (approvalEntry.status === 'menunggu') {
                nextRoleToApprove = role; 

                if (role === userRole && approvalEntry.id_user === userId) {
                    isMyTurn = true;
                }
                break; 
            }
            
            if (approvalEntry.status === 'ditolak') {
                nextRoleToApprove = 'DITOLAK_FINAL'; 
                break; 
            }
        }
    }

    myApproval = persetujuanList.find(p => p.tahap_persetujuan.toLowerCase() === userRole);
    const myStatus = myApproval ? myApproval.status : 'N/A';


    return {
        status: myStatus,
        myTurn: isMyTurn,
        nextRole: nextRoleToApprove
    };
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
        case 'menunggu_persetujuan_anda':
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
        Swal.fire('Error', 'ID Pinjaman tidak tersedia.', 'error');
    }
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

            const approvalDetails = getMyApprovalStatus(
                pinjaman.persetujuan,
                currentUserRole.value,
                currentUserId.value
            );

            return {
                ...pinjaman,
                nama_karyawan: employeeName,
                my_approval_status: approvalDetails.status,
                is_my_turn: approvalDetails.myTurn,
                next_role: approvalDetails.nextRole
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
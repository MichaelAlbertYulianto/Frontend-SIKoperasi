<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div
            class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
            <div class="mb-6">
                <h3 class="font-semibold text-gray-800 text-xl dark:text-white/90">
                    Daftar Log Aktivitas Sistem
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Total: {{ logList.length }} Log Tercatat
                </p>
            </div>

            <div v-if="isLoading" class="text-center py-10">
                <p class="text-brand-500">Memuat data log...</p>
            </div>

            <div v-else-if="error" class="text-center py-10 text-error-500">
                <p>Gagal memuat data: {{ error }}</p>
            </div>

            <div v-else class="audit-log-table">
                <vue-good-table :columns="columns" :rows="logList" :search-options="{
                    enabled: true,
                    placeholder: 'Cari berdasarkan aksi atau detail...',
                }" :pagination-options="{
                    enabled: true,
                    mode: 'records',
                    perPage: 10,
                    perPageDropdown: [10, 20, 50],
                    setCurrentPage: 1,
                    nextLabel: 'Next',
                    prevLabel: 'Prev',
                    rowsPerPageLabel: 'Baris per halaman',
                    ofLabel: 'dari',
                    pageLabel: 'halaman',
                }">
                    <template #table-row="props">
                        <span v-if="props.column.field === 'action'">
                            <span :class="actionClass(props.row.action)">
                                {{ props.row.action || 'N/A' }}
                            </span>
                        </span>
                        <span v-else-if="props.column.field === 'timestamp'">
                            {{ formatDateTime(props.row.timestamp) }}
                        </span>
                        <span v-else-if="props.column.field === 'actor_name'">
                            {{ props.row.actor_name }}
                        </span>
                        <span v-else-if="props.column.field === 'entity_id'">
                            {{ props.row.entity_id ? props.row.entity_id.substring(0, 8) + '...' : 'N/A' }}
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
import { ref, onMounted } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import axios from 'axios';
import { VueGoodTable } from 'vue-good-table-next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const currentPageTitle = ref("Daftar Audit Log");
const logList = ref([]);
const isLoading = ref(true);
const error = ref(null);

const columns = ref([
    { label: 'Timestamp', field: 'timestamp', sortable: true },
    { label: 'Aktor', field: 'actor_name', sortable: true },
    // { label: 'Aksi', field: 'action', sortable: true, filterOptions: { enabled: true } },
    { label: 'Aksi', field: 'action', sortable: true },
    { label: 'Entitas', field: 'entity', sortable: true },
    { label: 'ID Entitas', field: 'entity_id', sortable: false },
    { label: 'ID Aktor', field: 'id_user', sortable: false, hidden: true },
    { label: 'Detail', field: 'detail', sortable: false },
]);


const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const actionClass = (action) => {
    const map = {
        'CREATE': 'bg-success-100 text-success-800',
        'UPDATE': 'bg-warning-100 text-warning-800',
        'DELETE': 'bg-error-100 text-error-800',
    };
    const baseClass = 'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium';
    return `${baseClass} ${map[action] || 'bg-gray-100 text-gray-800'}`;
};

const fetchLogList = async () => {
    isLoading.value = true;
    error.value = null;

    const userToken = localStorage.getItem('user_token');

    if (!userToken) {
        error.value = "Pengguna tidak terautentikasi.";
        isLoading.value = false;
        return;
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/log`, {
            headers: {
                'ngrok-skip-browser-warning': '69420',
                'Authorization': `Bearer ${userToken}`
            }
        });
        let rawLogData = response.data.data;
        const uniqueUserIds = [...new Set(rawLogData.map(log => log.id_user))];
        const userMap = {};
        const userLookups = uniqueUserIds.map(userId =>
            axios.get(`${API_BASE_URL}/user/${userId}`, {
                headers: {
                    'ngrok-skip-browser-warning': '69420',
                    'Authorization': `Bearer ${userToken}`
                }
            })
                .then(res => {
                    const namaKaryawan = res.data.data.nama_karyawan;
                    userMap[userId] = namaKaryawan;
                })
                .catch(() => {
                    userMap[userId] = 'Unknown User';
                })
        );
        await Promise.all(userLookups);
        const enrichedLogData = rawLogData.map(log => ({
            ...log,
            actor_name: userMap[log.id_user] || 'Unknown User',
        }));
        logList.value = enrichedLogData;

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

onMounted(() => {
    fetchLogList();
});
</script>
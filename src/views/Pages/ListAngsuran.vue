<template>
    <admin-layout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="p-6 bg-white dark:bg-gray-800 shadow rounded-lg">
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Pinjaman Aktif Saya</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400">Pantau jadwal dan sisa tagihan angsuran Anda di
                    sini.</p>
            </div>

            <div v-if="isLoading" class="text-center py-10">
                <div
                    class="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-2">
                </div>
                <p class="text-gray-600 dark:text-gray-400">Mengambil data pinjaman...</p>
            </div>

            <div v-else-if="error"
                class="bg-red-50 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
                {{ error }}
            </div>

            <div v-else>
                <div v-if="pinjamanList.length === 0"
                    class="text-center py-12 border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-700">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="mt-4 text-gray-600 dark:text-gray-400">Anda belum memiliki pinjaman yang dicairkan.</p>
                </div>

                <div v-else class="overflow-x-auto">
                    <vue-good-table :columns="columns" :rows="pinjamanList"
                        :theme="isDarkMode ? 'nocturnal' : 'polar-bear'"
                        :search-options="{ enabled: true, placeholder: 'Cari tujuan pinjaman...' }" :pagination-options="{
                            enabled: true,
                            perPage: 5,
                            rowsPerPageLabel: 'Baris per halaman',
                            ofLabel: 'dari',
                        }">
                        <template #table-row="props">
                            <span v-if="props.column.field === 'jumlah_pinjaman'"
                                class="text-indigo-600 dark:text-indigo-400 font-bold">
                                {{ formatCurrency(props.row.jumlah_pinjaman) }}
                            </span>

                            <span v-else-if="props.column.field === 'updated_at'">
                                {{ formatDate(props.row.updated_at) }}
                            </span>

                            <span v-else-if="props.column.field === 'aksi'">
                                <button @click="goToDetail(props.row.id_pinjaman)"
                                    class="bg-brand-500 hover:bg-brand-600 text-white text-xs py-1.5 px-3 rounded-md transition-colors font-medium shadow-sm">
                                    Detail Angsuran
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
const currentUserId = localStorage.getItem('current_user_id');
const router = useRouter();

const currentPageTitle = ref("Angsuran Saya");
const pinjamanList = ref([]);
const isLoading = ref(false);
const error = ref(null);
const isDarkMode = ref(false);

const columns = ref([
    { label: 'Tujuan Pinjaman', field: 'tujuan_pinjaman', sortable: true },
    { label: 'Jumlah Pokok', field: 'jumlah_pinjaman', sortable: true, type: 'number' },
    { label: 'Tenor', field: 'tenor', sortable: true, type: 'number' },
    { label: 'Tanggal Pencairan', field: 'updated_at', sortable: true },
    { label: 'Aksi', field: 'aksi', sortable: false },
]);

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const goToDetail = (id) => {
    router.push({ name: 'Detail Angsuran', params: { id } });
};

const fetchMyPinjaman = async () => {
    isLoading.value = true;
    error.value = null;

    try {
        const userRes = await axios.get(`${API_BASE_URL}/user/${currentUserId}`, {
            headers: {
                'ngrok-skip-browser-warning': '69420',
                'Authorization': `Bearer ${userToken}`
            }
        });
        const id_karyawan = userRes.data.data.id_karyawan;

        const pinjamanRes = await axios.get(`${API_BASE_URL}/pinjaman/aktif/user/${id_karyawan}`, {
            headers: {
                'ngrok-skip-browser-warning': '69420',
                'Authorization': `Bearer ${userToken}`
            }
        });

        pinjamanList.value = pinjamanRes.data.data.filter(p => p.status_pinjaman === 'dicairkan');

    } catch (err) {
        error.value = "Gagal mengambil data angsuran. Silakan coba beberapa saat lagi.";
        console.error(err);
    } finally {
        isLoading.value = false;
    }
};

const updateTheme = () => {
    isDarkMode.value = document.documentElement.classList.contains("dark");
};

let themeObserver;

onMounted(() => {
    fetchMyPinjaman();
    updateTheme();
    themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});

onUnmounted(() => {
    if (themeObserver) themeObserver.disconnect();
});
</script>
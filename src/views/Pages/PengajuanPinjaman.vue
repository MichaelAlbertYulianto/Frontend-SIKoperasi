<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div
            class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
            <div class="space-y-6">

                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-semibold text-gray-800 text-xl dark:text-white/90">
                        Pinjaman Yang Sedang Diproses/Berjalan
                    </h3>
                    <button @click="openLoanModal"
                        class="px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600">
                        + Ajukan Pinjaman Baru
                    </button>
                </div>

                <div v-if="isLoading" class="text-center py-10">
                    <p class="text-brand-500">Memuat data pinjaman...</p>
                </div>

                <div v-else-if="error" class="text-center py-10 text-error-500">
                    <p>Gagal memuat data: {{ error }}</p>
                </div>

                <div v-else class="pinjaman-history-table">
                    <div v-if="pinjamanList.length > 0">
                        <vue-good-table :theme="isDarkMode ? 'nocturnal' : 'polar-bear'" :columns="columns" :rows="pinjamanList"
                            :search-options="{ enabled: true, placeholder: 'Cari tujuan pinjaman...' }"
                            :pagination-options="{
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
                                    <span :class="statusClass(props.row.status_pinjaman)">
                                        {{ formatStatus(props.row.status_pinjaman) }}
                                    </span>
                                </span>
                                <span v-else-if="props.column.field === 'aksi'">
                                    <button @click="viewDetail(props.row)"
                                        class="bg-brand-500 hover:bg-brand-600 text-white text-xs py-1.5 px-3 rounded-md transition-colors font-medium shadow-sm">
                                        Detail
                                    </button>
                                </span>
                                <span v-else>
                                    {{ props.formattedRow[props.column.field] }}
                                </span>
                            </template>
                        </vue-good-table>
                    </div>
                    <div v-else class="text-center py-4 text-gray-500">
                        Belum ada riwayat pinjaman tercatat.
                    </div>
                </div>

            </div>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import axios from 'axios';
import Swal from 'sweetalert2';
import { VueGoodTable } from 'vue-good-table-next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = '/pinjaman/user';

const currentPageTitle = ref("Pengajuan Pinjaman");
const pinjamanList = ref([]);
const isLoading = ref(true);
const error = ref(null);

const currentUserId = ref(localStorage.getItem('current_user_id'));
const userToken = localStorage.getItem('user_token');

const columns = ref([
    { label: 'Jumlah', field: 'jumlah_pinjaman', sortable: true, type: 'number' },
    { label: 'Tenor', field: 'tenor', sortable: true, type: 'number' },
    { label: 'Tujuan', field: 'tujuan_pinjaman', sortable: true },
    { label: 'Pengajuan', field: 'tanggal_pengajuan', sortable: true },
    { label: 'Status', field: 'status_pinjaman', sortable: true },
    { label: 'Aksi', field: 'aksi', sortable: false },
]);

const formatNumberInput = (value) => {
    let cleanValue = value.replace(/\D/g, '');
    return cleanValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(value));
};
const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
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
    window.location.href = `/detail-pinjaman/${pinjaman.id_pinjaman}`;
};


const submitLoan = async (loanData) => {
    try {
        const userDetails = await axios.get(`${API_BASE_URL}/user/${currentUserId.value}`, {
            headers: { 
                'ngrok-skip-browser-warning': '69420',
                'Authorization': `Bearer ${userToken}` 
            }
        });
        const idKaryawan = userDetails.data.data.id_karyawan;

        const requestBody = {
            id_karyawan: idKaryawan,
            jumlah_pinjaman: parseFloat(loanData.jumlah_pinjaman),
            tenor: parseInt(loanData.tenor),
            tanggal_pengajuan: null,
            tujuan_pinjaman: loanData.tujuan_pinjaman,
        };

        const response = await axios.post(`${API_BASE_URL}/pinjaman`, requestBody, {
            headers: { 
                'ngrok-skip-browser-warning': '69420',
                'Authorization': `Bearer ${userToken}` 
            }
        });

        Swal.fire('Berhasil!', 'Pengajuan pinjaman Anda telah berhasil dikirim.', 'success');
        await fetchPinjamanList();

    } catch (err) {
        const message = err.response?.data?.message || 'Gagal mengajukan pinjaman. Silakan coba lagi.';
        Swal.fire('Gagal!', message, 'error');
        console.error('Loan Submission Error:', err);
    }
};


const openLoanModal = async () => {
    const isDark = document.documentElement.classList.contains("dark");
    
    Swal.fire({
        title: 'Menyiapkan Formulir...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    const maxLoanLimit = await fetchMaxLoan();
    Swal.close();

    const { value: formValues } = await Swal.fire({
        title: 'Ajukan Pinjaman Baru',
        width: 500, 
        background: isDark ? '#1e1e2f' : '#ffffff',
        color: isDark ? '#ffffff' : '#000000',
        html: `
            <style>
                .swal2-container .swal2-input, .swal2-container .swal2-textarea, .swal2-container .swal2-select {
                    width: 100% !important; margin: 5px 0 10px 0 !important; border: 1px solid #d1d9e6 !important; border-radius: 8px !important;
                }
                .input-group { display: flex; align-items: center; margin-bottom: 10px; }
                .input-group label { width: 130px; text-align: left; font-weight: 500; font-size: 14px; }
                .input-group input, .input-group select { flex-grow: 1; margin-left: 10px; }
                .limit-info { background: ${isDark ? '#2d2d44' : '#f0f4f8'}; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 13px; border-left: 4px solid #465fff; }
            </style>
            
            <div style="text-align: left; margin-top: 15px;">
                <div class="limit-info">
                    <strong>Batas Maksimal Pinjaman:</strong><br>
                    <span style="color: #465fff; font-size: 16px; font-weight: bold;">${formatCurrency(maxLoanLimit)}</span>
                </div>

                <div class="input-group">
                    <label for="swal-jumlah">Jumlah (Rp):</label>
                    <input id="swal-jumlah" class="swal2-input" type="text" placeholder="Masukkan jumlah"> 
                </div>

                <div class="input-group">
                    <label for="swal-tenor">Tenor:</label>
                    <select id="swal-tenor" class="swal2-select swal2-input">
                        <option value="" disabled selected>Pilih Tenor</option>
                        <option value="3">3 Bulan</option>
                        <option value="6">6 Bulan</option>
                        <option value="12">12 Bulan</option>
                    </select>
                </div>
                
                <div style="margin-top: 15px;">
                    <label for="swal-tujuan" style="display: block; font-weight: 500; margin-bottom: 5px;">Tujuan Pinjaman:</label>
                    <textarea id="swal-tujuan" class="swal2-textarea" style="height: 80px;"></textarea>
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Ajukan Sekarang',
        didOpen: () => {
            const jumlahInput = document.getElementById('swal-jumlah');
            jumlahInput.addEventListener('input', (event) => {
                event.target.value = formatNumberInput(event.target.value);
            });
        },
        preConfirm: () => {
            const jumlahInput = document.getElementById('swal-jumlah');
            const tenor = document.getElementById('swal-tenor').value;
            const tujuan = document.getElementById('swal-tujuan').value;
            
            const cleanJumlah = jumlahInput.value.replace(/\./g, '').replace(/,/g, '');
            const cleanJumlahFloat = parseFloat(cleanJumlah);

            if (!cleanJumlah || !tenor || !tujuan) {
                Swal.showValidationMessage('Semua bidang wajib diisi');
                return false;
            }
            if (cleanJumlahFloat > maxLoanLimit) {
                Swal.showValidationMessage(`Jumlah melebihi batas maksimal (${formatCurrency(maxLoanLimit)})`);
                return false;
            }
            if (cleanJumlahFloat < 300000) {
                Swal.showValidationMessage('Jumlah pinjaman minimal adalah Rp 300.000');
                return false;
            }
            return {
                jumlah_pinjaman: cleanJumlah,
                tenor: tenor,
                tujuan_pinjaman: tujuan
            };
        }
    });

    if (formValues) {
        await submitLoan(formValues);
    }
};

const fetchPinjamanList = async () => {
    isLoading.value = true;
    error.value = null;

    if (!currentUserId.value || !userToken) {
        error.value = "Sesi tidak valid.";
        isLoading.value = false;
        return;
    }

    try {
        const responseUser = await axios.get(`${API_BASE_URL}/user/${currentUserId.value}`, {
            headers: { 
                'ngrok-skip-browser-warning': '69420',
                'Authorization': `Bearer ${userToken}` 
            }
        });
        const idKaryawan = responseUser.data.data.id_karyawan;

        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINT}/${idKaryawan}`, {
            headers: { 
                'ngrok-skip-browser-warning': '69420',
                'Authorization': `Bearer ${userToken}` 
            }
        });

        const rawPinjamanData = response.data.data;

        const relevantPinjaman = rawPinjamanData.filter(p =>
            p.status_pinjaman === 'menunggu_persetujuan' ||
            p.status_pinjaman === 'disetujui' ||
            p.status_pinjaman === 'dicairkan'
        );

        const processedList = relevantPinjaman.map(pinjaman => {
            let tanggalPengajuanDate = pinjaman.tanggal_pengajuan ? new Date(pinjaman.tanggal_pengajuan) : null;
            return {
                ...pinjaman,
                jumlah_pinjaman: parseFloat(pinjaman.jumlah_pinjaman),
                tanggal_pengajuan: tanggalPengajuanDate,
            };
        });

        pinjamanList.value = processedList;

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

const fetchMaxLoan = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/pinjaman/max-loan/`, {
            headers: { 
                'ngrok-skip-browser-warning': '69420',
                'Authorization': `Bearer ${userToken}` 
            }
        });
        return parseFloat(response.data.data.max_loan_amount);
    } catch (err) {
        console.error('Error fetching max loan:', err);
        return 0;
    }
};

const isDarkMode = ref(false);

const updateTheme = () => {
  isDarkMode.value = document.documentElement.classList.contains("dark");
};

let themeObserver;

onMounted(() => {
    fetchPinjamanList();
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
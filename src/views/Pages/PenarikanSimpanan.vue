<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div
            class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
            <div class="mb-6 flex flex-col gap-2">
                <h3 class="font-semibold text-gray-800 text-xl dark:text-white/90">
                    Penarikan Simpanan Karyawan
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Kelola penarikan dana simpanan wajib dan sukarela anggota koperasi.
                </p>
            </div>

            <div v-if="isLoading" class="text-center py-10">
                <div
                    class="animate-spin inline-block w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mb-2">
                </div>
                <p class="text-brand-500 font-medium">Memuat rekap simpanan...</p>
            </div>

            <div v-else-if="error" class="text-center py-10 text-error-500 bg-error-50 dark:bg-error-500/10 rounded-xl">
                <p class="font-medium">Gagal memuat data: {{ error }}</p>
                <button @click="fetchRekap" class="mt-4 text-sm underline hover:text-error-600">Coba Lagi</button>
            </div>

            <div v-else>
                <vue-good-table :theme="isDarkMode ? 'nocturnal' : 'polar-bear'" :columns="columns"
                    :rows="rekapSimpanan" :search-options="{
                        enabled: true,
                        placeholder: 'Cari nama karyawan atau jabatan...',
                    }" :pagination-options="{
                        enabled: true,
                        mode: 'records',
                        perPage: 10,
                        perPageDropdown: [10, 25, 50],
                        rowsPerPageLabel: 'Baris per halaman',
                        ofLabel: 'dari',
                    }">
                    <template #table-row="props">
                        <span v-if="props.column.field === 'nama_karyawan'">
                            <div class="font-bold text-gray-800 dark:text-white/90">{{ props.row.nama_karyawan }}</div>
                            <div class="text-xs text-gray-500">{{ props.row.jabatan }}</div>
                        </span>

                        <span
                            v-else-if="['total_simpanan_wajib', 'total_simpanan_sukarela'].includes(props.column.field)">
                            <span :class="[
                                'font-semibold',
                                parseFloat(props.row[props.column.field]) > 0
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-400 dark:text-gray-600'
                            ]">
                                {{ parseFloat(props.row[props.column.field]) > 0 ? '+ ' : '' }}{{
                                    formatCurrency(props.row[props.column.field]) }}
                            </span>
                        </span>

                        <span v-else-if="props.column.field === 'total_penarikan'">
                            <span :class="[
                                'font-semibold',
                                parseFloat(props.row.total_penarikan) < 0
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-gray-400 dark:text-gray-600'
                            ]">
                                {{ parseFloat(props.row.total_penarikan) > 0 ? '- ' : '' }}{{
                                    formatCurrency(props.row.total_penarikan) }}
                            </span>
                        </span>

                        <span v-else-if="props.column.field === 'total_keseluruhan'">
                            <span :class="[
                                'font-bold',
                                parseFloat(props.row.total_keseluruhan || 0) > 0
                                    ? 'text-brand-500'
                                    : 'text-gray-400 dark:text-gray-600'
                            ]">
                                {{ formatCurrency(props.row.total_keseluruhan) }}
                            </span>
                        </span>

                        <span v-else-if="props.column.field === 'actions'">
                            <button @click="openWithdrawModal(props.row)"
                                class="flex items-center gap-2 rounded-lg bg-error-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-error-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                :disabled="parseFloat(props.row.total_keseluruhan || 0) <= 0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                                </svg>
                                Tarik Dana
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
import axios from "axios";
import { VueGoodTable } from "vue-good-table-next";
import Swal from "sweetalert2";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const currentPageTitle = ref("Penarikan Simpanan");
const rekapSimpanan = ref([]);
const isLoading = ref(true);
const error = ref(null);
const isDarkMode = ref(false);

const columns = ref([
    { label: "Karyawan", field: "nama_karyawan", sortable: true },
    { label: "Simp. Wajib", field: "total_simpanan_wajib", type: "number", sortable: true },
    { label: "Simp. Sukarela", field: "total_simpanan_sukarela", type: "number", sortable: true },
    { label: "Penarikan Simpanan", field: "total_penarikan", type: "number", sortable: true },
    { label: "Total Saldo", field: "total_keseluruhan", type: "number", sortable: true },
    { label: "Aksi", field: "actions", sortable: false, width: '120px' },
]);

const formatCurrency = (value) => {
    if (!value) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(parseFloat(value));
};

const fetchRekap = async () => {
    isLoading.value = true;
    error.value = null;
    const token = localStorage.getItem("user_token");

    try {
        const response = await axios.get(`${API_BASE_URL}/simpanan/rekap`, {
            headers: {
                "ngrok-skip-browser-warning": "69420",
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.data.success) {
            rekapSimpanan.value = response.data.data;
        }
    } catch (err) {
        error.value = err.response?.data?.message || "Koneksi ke server terputus.";
    } finally {
        isLoading.value = false;
    }
};

const openWithdrawModal = async (karyawan, initialData = null) => {
    const isDark = document.documentElement.classList.contains("dark");

    const valJumlah = initialData ? initialData.jumlah.toString() : '';
    const valKeterangan = initialData ? initialData.keterangan : '';

    const { value: formValues } = await Swal.fire({
        title: `<span class="text-xl font-bold dark:text-white">Form Penarikan Simpanan</span>`,
        background: isDark ? '#1f2937' : '#ffffff',
        color: isDark ? '#f3f4f6' : '#1f2937',
        html: `
      <div class="text-left mt-4 space-y-4">
        <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
           <p class="text-xs text-gray-500 uppercase font-bold">Pemilik Simpanan</p>
           <p class="text-sm font-semibold">${karyawan.nama_karyawan}</p>
           <div class="mt-2 pt-2 border-t dark:border-gray-700 flex justify-between">
              <span class="text-xs text-gray-500">Total Saldo:</span>
              <span class="text-xs font-bold text-brand-500">${formatCurrency(karyawan.total_keseluruhan)}</span>
           </div>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Jumlah Penarikan (Rp)</label>
          <input id="withdraw-amount" type="text" 
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-error-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                 ${valJumlah ? `value="${new Intl.NumberFormat('id-ID').format(valJumlah)}"` : ''}
                 placeholder="Contoh: 100.000">
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Keterangan</label>
          <textarea id="withdraw-keterangan" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-error-500 outline-none h-20 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    placeholder="Contoh: Kebutuhan mendesak / Uang saku">${valKeterangan}</textarea>
        </div>
      </div>
    `,
        showCancelButton: true,
        confirmButtonText: 'Lanjut Konfirmasi',
        cancelButtonText: 'Batal',
        customClass: {
            confirmButton: 'bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all',
            cancelButton: 'bg-gray-400 hover:bg-gray-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all ml-3'
        },
        buttonsStyling: false,
        didOpen: () => {
            const amountInput = document.getElementById('withdraw-amount');
            amountInput.addEventListener('input', (e) => {
                let val = e.target.value.replace(/[^0-9]/g, '');
                e.target.value = val ? new Intl.NumberFormat('id-ID').format(val) : '';
            });
        },
        preConfirm: () => {
            const amountRaw = document.getElementById('withdraw-amount').value.replace(/\./g, '');
            const keterangan = document.getElementById('withdraw-keterangan').value;
            const amount = parseInt(amountRaw);
            const maxAvailable = parseFloat(karyawan.total_keseluruhan || 0);

            if (!amount || amount <= 0) {
                Swal.showValidationMessage('Masukkan jumlah penarikan yang valid');
                return false;
            }
            if (amount > maxAvailable) {
                Swal.showValidationMessage(`Saldo tidak mencukupi (Maks: ${formatCurrency(maxAvailable)})`);
                return false;
            }
            if (!keterangan) {
                Swal.showValidationMessage('Keterangan wajib diisi');
                return false;
            }

            return { id_karyawan: karyawan.id_karyawan, jumlah: amount, keterangan: keterangan };
        }
    });

    if (formValues) {
        executeWithdraw(formValues, karyawan);
    }
};

const executeWithdraw = async (payload, karyawan) => {
    const isDark = document.documentElement.classList.contains("dark");

    const confirmResult = await Swal.fire({
        title: 'Konfirmasi Akhir',
        icon: 'warning',
        background: isDark ? '#1f2937' : '#ffffff',
        color: isDark ? '#f3f4f6' : '#1f2937',
        html: `
            <div class="text-left p-2 space-y-2">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Apakah Anda yakin ingin mencairkan dana simpanan berikut?</p>
                <div class="bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-100 dark:border-red-500/20 space-y-3">
                    <div>
                        <p class="text-[10px] font-bold uppercase text-red-400">Penerima Dana</p>
                        <p class="font-semibold text-gray-800 dark:text-white">${karyawan.nama_karyawan}</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold uppercase text-red-400">Jumlah Penarikan</p>
                        <p class="text-xl font-bold text-red-600 dark:text-red-400">${formatCurrency(payload.jumlah)}</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold uppercase text-red-400">Keterangan</p>
                        <p class="text-sm text-gray-700 dark:text-gray-200 italic">"${payload.keterangan}"</p>
                    </div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Ya, Cairkan Sekarang',
        cancelButtonText: 'Cek Kembali',
        customClass: {
            confirmButton: 'bg-error-600 hover:bg-error-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg',
            cancelButton: 'bg-gray-400 hover:bg-gray-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all ml-3'
        },
        buttonsStyling: false,
    });

    if (confirmResult.dismiss === Swal.DismissReason.cancel) {
        openWithdrawModal(karyawan, payload);
        return;
    }

    if (!confirmResult.isConfirmed) return;

    const token = localStorage.getItem("user_token");
    isLoading.value = true;

    try {
        const response = await axios.post(`${API_BASE_URL}/simpanan/penarikan`, {
            id_karyawan: payload.id_karyawan,
            jumlah: payload.jumlah,
            keterangan: payload.keterangan
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
            await Swal.fire({
                title: 'Berhasil!',
                text: 'Penarikan dana telah resmi dicatat.',
                icon: 'success',
                confirmButtonColor: '#10b981'
            });
            fetchRekap();
        }
    } catch (err) {
        Swal.fire('Gagal!', err.response?.data?.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
        isLoading.value = false;
    }
};

const updateTheme = () => {
    isDarkMode.value = document.documentElement.classList.contains("dark");
};

let themeObserver;

onMounted(() => {
    fetchRekap();
    updateTheme();
    themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});

onUnmounted(() => {
    if (themeObserver) themeObserver.disconnect();
});
</script>
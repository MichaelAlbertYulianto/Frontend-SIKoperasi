<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div
            class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
            <div class="mb-6 flex flex-col gap-2">
                <h3 class="font-semibold text-gray-800 text-xl dark:text-white/90">
                    Data Induk Karyawan
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Menampilkan seluruh daftar karyawan yang terdaftar dalam sistem.
                </p>
            </div>

            <div class="mb-4 flex justify-end">
                <button @click="openAddKaryawanModal"
                    class="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clip-rule="evenodd" />
                    </svg>
                    Tambah Karyawan
                </button>
            </div>

            <div v-if="isLoading" class="text-center py-10">
                <div
                    class="animate-spin inline-block w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mb-2">
                </div>
                <p class="text-brand-500 font-medium">Memuat data karyawan...</p>
            </div>

            <div v-else-if="error" class="text-center py-10 text-error-500 bg-error-50 dark:bg-error-500/10 rounded-xl">
                <p class="font-medium">Gagal memuat data: {{ error }}</p>
                <button @click="fetchKaryawan" class="mt-4 text-sm underline hover:text-error-600">Coba Lagi</button>
            </div>

            <div v-else>
                <vue-good-table :theme="isDarkMode ? 'nocturnal' : 'polar-bear'" :columns="columns" :rows="karyawanList"
                    :search-options="{
                        enabled: true,
                        placeholder: 'Cari nama, jabatan, atau nomor telp...',
                    }" :pagination-options="{
                        enabled: true,
                        mode: 'records',
                        perPage: 10,
                        perPageDropdown: [10, 25, 50],
                        rowsPerPageLabel: 'Baris per halaman',
                        ofLabel: 'dari',
                    }">
                    <template #table-row="props">
                        <span v-if="props.column.field === 'id_karyawan'" class="flex items-center gap-2 group">
                            <span class="font-mono text-xs text-gray-500 dark:text-gray-400">
                                {{ props.row.id_karyawan }}
                            </span>
                            <button @click="copyToClipboard(props.row.id_karyawan)"
                                class="p-1.5 rounded-md bg-gray-100 hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition dark:bg-gray-800 dark:hover:bg-brand-900/30 opacity-0 group-hover:opacity-100"
                                title="Salin ID">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </span>
                        <span v-else-if="props.column.field === 'nama_karyawan'">
                            <div class="font-bold text-gray-800 dark:text-white/90">{{ props.row.nama_karyawan }}</div>
                            <div class="text-xs text-gray-500">{{ props.row.jabatan }}</div>
                        </span>

                        <span v-else-if="props.column.field === 'gaji'"
                            class="font-medium text-gray-700 dark:text-gray-300">
                            {{ formatCurrency(props.row.gaji) }}
                        </span>

                        <span v-else-if="props.column.field === 'nomor_telp'">
                            <a :href="'https://wa.me/' + formatWhatsApp(props.row.nomor_telp)" target="_blank"
                                class="flex items-center gap-2 text-brand-500 hover:underline">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {{ props.row.nomor_telp }}
                            </a>
                        </span>

                        <span v-else-if="props.column.field === 'alamat'" class="block max-w-[200px] truncate"
                            :title="props.row.alamat">
                            {{ props.row.alamat }}
                        </span>

                        <span v-else-if="props.column.field === 'actions'" class="flex gap-2">
                            <button @click="openEditKaryawanModal(props.row)"
                                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition dark:text-blue-400 dark:hover:bg-blue-900/30">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button @click="confirmDeleteKaryawan(props.row)"
                                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition dark:text-red-400 dark:hover:bg-red-900/30">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
const currentPageTitle = ref("Daftar Karyawan");
const karyawanList = ref([]);
const isLoading = ref(true);
const error = ref(null);
const isDarkMode = ref(false);

const columns = ref([
    { label: "ID", field: "id_karyawan", sortable: true, width: '380px' },
    { label: "Karyawan", field: "nama_karyawan", sortable: true },
    { label: "Alamat", field: "alamat", sortable: true },
    { label: "No. Telp", field: "nomor_telp", sortable: false },
    { label: "Aksi", field: "actions", sortable: false, width: '150px' }
]);

const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(parseFloat(value));
};

const formatWhatsApp = (num) => {
    let cleaned = num.replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
    return cleaned;
};

const fetchKaryawan = async () => {
    isLoading.value = true;
    error.value = null;
    const token = localStorage.getItem("user_token");

    try {
        const response = await axios.get(`${API_BASE_URL}/karyawan/?page=1&limit=100`, {
            headers: {
                "ngrok-skip-browser-warning": "69420",
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.data.success) {
            karyawanList.value = response.data.data;
        }
    } catch (err) {
        console.error(err);
        error.value = err.response?.data?.message || "Gagal menghubungi server.";
    } finally {
        isLoading.value = false;
    }
};

const openAddKaryawanModal = async (initialData = null) => {
    const isDark = document.documentElement.classList.contains("dark");

    const isEdit = !!initialData?.id_karyawan;

    const valNama = initialData?.nama || initialData?.nama_karyawan || '';
    const valJabatan = initialData?.jabatan || '';
    const valTelp = initialData?.no_telp || initialData?.nomor_telp || '';
    const valGaji = initialData?.gaji ? Math.floor(parseFloat(initialData.gaji)).toString() : '';
    const valAlamat = initialData?.alamat || '';

    const { value: formValues } = await Swal.fire({
        title: `<span class="text-xl font-bold dark:text-white/90 text-gray-800">${isEdit ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}</span>`,
        background: isDark ? '#1f2937' : '#ffffff',
        color: isDark ? '#f3f4f6' : '#1f2937',
        html: `
            <div class="text-left mt-4 space-y-4">
                <div>
                    <label class="block text-sm font-semibold dark:text-gray-300 text-gray-700 mb-1">Nama Lengkap</label>
                    <input id="swal-nama" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                           ${valNama ? `value="${valNama}"` : ''} placeholder="Nama Karyawan">
                </div>
                <div>
                    <label class="block text-sm font-semibold dark:text-gray-300 text-gray-700 mb-1">Jabatan</label>
                    <input id="swal-jabatan" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                           ${valJabatan ? `value="${valJabatan}"` : ''} placeholder="Contoh: Admin">
                </div>
                <div>
                    <label class="block text-sm font-semibold dark:text-gray-300 text-gray-700 mb-1">Nomor Telepon</label>
                    <input id="swal-telp" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                           ${valTelp ? `value="${valTelp}"` : ''} placeholder="08xxxxxxxxxx">
                </div>
                <div>
                    <label class="block text-sm font-semibold dark:text-gray-300 text-gray-700 mb-1">Gaji Pokok (Rp)</label>
                    <input id="swal-gaji" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                           ${valGaji ? `value="${valGaji}"` : ''} placeholder="Contoh: 5.000.000">
                </div>
                <div>
                    <label class="block text-sm font-semibold dark:text-gray-300 text-gray-700 mb-1">Alamat</label>
                    <textarea id="swal-alamat" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-20 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                              placeholder="Alamat lengkap">${valAlamat ? valAlamat : ''}</textarea>
                </div>
            </div>
        `,
        customClass: {
            popup: 'rounded-2xl p-6 border dark:border-gray-700 shadow-xl',
            confirmButton: 'bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all',
            cancelButton: 'bg-gray-400 hover:bg-gray-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all ml-3'
        },
        buttonsStyling: false,
        showCancelButton: true,
        confirmButtonText: 'Lanjut Konfirmasi',
        cancelButtonText: 'Batal',
        didOpen: () => {
            const gajiInput = document.getElementById('swal-gaji');

            if (gajiInput.value) {
                let clean = gajiInput.value.replace(/[^0-9]/g, '');
                gajiInput.value = new Intl.NumberFormat('id-ID').format(clean);
            }

            gajiInput.addEventListener('input', (e) => {
                let val = e.target.value.replace(/[^0-9]/g, '');
                e.target.value = val ? new Intl.NumberFormat('id-ID').format(val) : '';
            });
        },
        preConfirm: () => {
            const nama = document.getElementById('swal-nama').value;
            const jabatan = document.getElementById('swal-jabatan').value;
            const telp = document.getElementById('swal-telp').value;
            const gajiRaw = document.getElementById('swal-gaji').value.replace(/\./g, '');
            const alamat = document.getElementById('swal-alamat').value;

            if (!nama || !jabatan || !telp || !gajiRaw || !alamat) {
                Swal.showValidationMessage('Semua kolom wajib diisi');
                return false;
            }

            return {
                id_karyawan: initialData?.id_karyawan || null,
                nama: nama,
                jabatan: jabatan,
                alamat: alamat,
                no_telp: telp,
                gaji: parseInt(gajiRaw)
            };
        }
    });

    if (formValues) {
        submitKaryawan(formValues);
    }
};

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        
        const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: isDarkMode.value ? '#1f2937' : '#ffffff',
            color: isDarkMode.value ? '#f3f4f6' : '#1f2937',
        });

        Toast.fire({
            icon: 'success',
            title: 'ID disalin ke clipboard'
        });
    } catch (err) {
        console.error('Gagal menyalin teks: ', err);
    }
};

// const submitKaryawan = async (payload) => {
//     const isDark = document.documentElement.classList.contains("dark");

//     const confirmResult = await Swal.fire({
//         title: 'Konfirmasi Data Karyawan',
//         background: isDark ? '#1f2937' : '#ffffff',
//         color: isDark ? '#f3f4f6' : '#1f2937',
//         html: `
//             <div class="text-left p-2 space-y-2">
//                 <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Pastikan data berikut sudah sesuai sebelum disimpan ke sistem:</p>
//                 <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 space-y-3">
//                     <div>
//                         <p class="text-[10px] font-bold uppercase text-gray-400">Nama Lengkap</p>
//                         <p class="font-semibold text-gray-800 dark:text-white">${payload.nama}</p>
//                     </div>
//                     <div class="grid grid-cols-2 gap-4">
//                         <div>
//                             <p class="text-[10px] font-bold uppercase text-gray-400">Jabatan</p>
//                             <p class="text-sm text-gray-700 dark:text-gray-200">${payload.jabatan}</p>
//                         </div>
//                         <div>
//                             <p class="text-[10px] font-bold uppercase text-gray-400">No. Telepon</p>
//                             <p class="text-sm text-gray-700 dark:text-gray-200">${payload.no_telp}</p>
//                         </div>
//                     </div>
//                     <div>
//                         <p class="text-[10px] font-bold uppercase text-gray-400">Gaji Pokok</p>
//                         <p class="text-md font-bold text-brand-500">${formatCurrency(payload.gaji)}</p>
//                     </div>
//                     <div>
//                         <p class="text-[10px] font-bold uppercase text-gray-400">Alamat</p>
//                         <p class="text-sm text-gray-700 dark:text-gray-200 italic">"${payload.alamat}"</p>
//                     </div>
//                 </div>
//             </div>
//         `,
//         icon: 'question',
//         showCancelButton: true,
//         confirmButtonText: 'Ya, Simpan Data',
//         cancelButtonText: 'Cek Kembali',
//         customClass: {
//             confirmButton: 'bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all',
//             cancelButton: 'bg-gray-400 hover:bg-gray-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all ml-3'
//         },
//         buttonsStyling: false,
//     });

//     if (confirmResult.dismiss === Swal.DismissReason.cancel) {
//         openAddKaryawanModal(payload);
//         return;
//     }

//     if (confirmResult.isConfirmed) {
//         isLoading.value = true;
//         const token = localStorage.getItem("user_token");

//         try {
//             const response = await axios.post(`${API_BASE_URL}/karyawan`, payload, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             if (response.data.success) {
//                 await Swal.fire({
//                     title: 'Berhasil!',
//                     text: 'Karyawan baru telah resmi terdaftar.',
//                     icon: 'success',
//                     confirmButtonColor: '#10b981'
//                 });
//                 fetchKaryawan();
//             }
//         } catch (err) {
//             Swal.fire('Gagal!', err.response?.data?.message || 'Terjadi kesalahan sistem.', 'error');
//         } finally {
//             isLoading.value = false;
//         }
//     }
// };

const openEditKaryawanModal = (karyawan) => {
    const dataToEdit = {
        id_karyawan: karyawan.id_karyawan,
        nama: karyawan.nama_karyawan,
        jabatan: karyawan.jabatan,
        no_telp: karyawan.nomor_telp,
        gaji: karyawan.gaji,
        alamat: karyawan.alamat,
        isEdit: true
    };
    openAddKaryawanModal(dataToEdit);
};

const submitKaryawan = async (payload) => {
    const isDark = document.documentElement.classList.contains("dark");
    const isEdit = !!payload.id_karyawan;

    const finalPayload = {
        nama: payload.nama,
        jabatan: payload.jabatan,
        alamat: payload.alamat,
        nomor_telp: payload.no_telp || payload.nomor_telp,
        gaji: payload.gaji.toString()
    };

    const confirmResult = await Swal.fire({
        title: isEdit ? 'Konfirmasi Perubahan' : 'Konfirmasi Data Karyawan',
        background: isDark ? '#1f2937' : '#ffffff',
        color: isDark ? '#f3f4f6' : '#1f2937',
        html: `
            <div class="text-left p-2 space-y-2">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Pastikan data berikut sudah sesuai sebelum disimpan ke sistem:</p>
                <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 space-y-3">
                    <div>
                        <p class="text-[10px] font-bold uppercase text-gray-400">Nama Lengkap</p>
                        <p class="font-semibold text-gray-800 dark:text-white">${payload.nama}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-[10px] font-bold uppercase text-gray-400">Jabatan</p>
                            <p class="text-sm text-gray-700 dark:text-gray-200">${payload.jabatan}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold uppercase text-gray-400">No. Telepon</p>
                            <p class="text-sm text-gray-700 dark:text-gray-200">${payload.no_telp}</p>
                        </div>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold uppercase text-gray-400">Gaji Pokok</p>
                        <p class="text-md font-bold text-brand-500">${formatCurrency(payload.gaji)}</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold uppercase text-gray-400">Alamat</p>
                        <p class="text-sm text-gray-700 dark:text-gray-200 italic">"${payload.alamat}"</p>
                    </div>
                </div>
            </div>
        `,
        confirmButtonText: isEdit ? 'Ya, Perbarui' : 'Ya, Simpan',
        showCancelButton: true,
        cancelButtonText: 'Cek Kembali',
        buttonsStyling: false,
        customClass: {
            confirmButton: 'bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all',
            cancelButton: 'bg-gray-400 hover:bg-gray-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all ml-3'
        }
    });

    if (confirmResult.dismiss === Swal.DismissReason.cancel) {
        openAddKaryawanModal(payload);
        return;
    }

    if (confirmResult.isConfirmed) {
        isLoading.value = true;
        const token = localStorage.getItem("user_token");
        const url = isEdit ? `${API_BASE_URL}/karyawan/${payload.id_karyawan}` : `${API_BASE_URL}/karyawan`;
        const method = isEdit ? 'put' : 'post';

        try {
            const response = await axios[method](url, finalPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "69420"
                }
            });

            if (response.data.success) {
                await Swal.fire({
                    title: 'Berhasil!',
                    text: isEdit ? 'Data diperbarui.' : 'Karyawan terdaftar.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchKaryawan();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Terjadi kesalahan sistem.';
            Swal.fire('Gagal!', msg, 'error');
        } finally {
            isLoading.value = false;
        }
    }
};

const confirmDeleteKaryawan = async (karyawan) => {
    const isDark = document.documentElement.classList.contains("dark");

    const result = await Swal.fire({
        title: 'Hapus Karyawan?',
        text: `Apakah Anda yakin ingin menghapus ${karyawan.nama_karyawan}? Data yang dihapus tidak dapat dikembalikan.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        background: isDark ? '#1f2937' : '#ffffff',
        color: isDark ? '#f3f4f6' : '#1f2937',
    });

    if (result.isConfirmed) {
        isLoading.value = true;
        const token = localStorage.getItem("user_token");

        try {
            const response = await axios.delete(`${API_BASE_URL}/karyawan/${karyawan.id_karyawan}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                Swal.fire('Dihapus!', 'Karyawan telah dihapus dari sistem.', 'success');
                fetchKaryawan();
            }
        } catch (err) {
            Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus data.', 'error');
        } finally {
            isLoading.value = false;
        }
    }
};

const updateTheme = () => {
    isDarkMode.value = document.documentElement.classList.contains("dark");
};

let themeObserver;

onMounted(() => {
    fetchKaryawan();
    updateTheme();
    themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});

onUnmounted(() => {
    if (themeObserver) themeObserver.disconnect();
});
</script>
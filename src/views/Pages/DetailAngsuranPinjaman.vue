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
              :sort-options="{ initialSortBy: [{ field: 'angsuran_ke', type: 'asc' }] }"
              style-class="vgt-table striped bordered"
            >
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

                <span v-else-if="props.column.field === 'actions'">
                  <div v-if="isBarisAktif(props.row)" class="flex gap-2">
                    <button @click="prosesAngsuran(props.row, 'bayar')"
                      class="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-success-600 rounded hover:bg-success-700 transition shadow-sm">
                      Bayar
                    </button>

                    <button v-if="props.row.angsuran_ke < pinjamanDetail.tenor"
                      @click="prosesAngsuran(props.row, 'tunda')"
                      class="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-warning-600 rounded hover:bg-warning-700 transition shadow-sm">
                      Tunda
                    </button>
                  </div>
                  
                  <div v-else>
                    <span v-if="props.row.status_angsuran === 'lunas'" class="text-xs text-success-600 font-medium">Selesai</span>
                    <span v-else-if="props.row.status_angsuran === 'ditunda'" class="text-xs text-error-500 font-medium italic">Ditunda</span>
                    <span v-else class="text-xs text-gray-400 italic">Menunggu</span>
                  </div>
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
import Swal from "sweetalert2";

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

// Component DetailItem manual
const DetailItem = {
  props: ['label', 'value'],
  setup(props, { slots }) {
    return () => h('div', {
      class: 'flex justify-between py-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0'
    }, [
      h('span', { class: 'text-sm font-medium text-gray-600 dark:text-gray-400' }, props.label),
      h('span', { class: 'text-sm font-semibold text-gray-900 dark:text-white' }, 
        slots.value ? slots.value() : props.value
      )
    ]);
  }
};

const angsuranColumns = ref([
  { label: 'Bulan Ke', field: 'angsuran_ke', type: 'number' },
  { label: 'Jatuh Tempo', field: 'tanggal_jatuh_tempo' },
  { label: 'Tagihan', field: 'jumlah_tertagih', type: 'number' },
  { label: 'Terbayar', field: 'jumlah_terbayar', type: 'number' },
  { label: 'Sisa Tagihan', field: 'sisa_tagihan', type: 'number' },
  { label: 'Status', field: 'status_angsuran' },
  { label: 'Aksi', field: 'actions', sortable: false },
]);

// Helper: Cek baris mana yang boleh memunculkan tombol (Antrean Pertama)
const isBarisAktif = (row) => {
  const barisTarget = angsuranList.value.find(item => 
    item.status_angsuran !== 'lunas' && item.status_angsuran !== 'ditunda'
  );
  return barisTarget && barisTarget.id_jadwal === row.id_jadwal;
};

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
  return formatted.toLowerCase() === 'belum lunas' ? 'Belum Bayar' : formatted.replace(/\b\w/g, (l) => l.toUpperCase());
};

const statusClass = (status) => {
  return status === 'dicairkan' 
    ? 'inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800' 
    : 'inline-flex items-center rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-800';
};

const statusAngsuranClass = (status) => {
  if (status === 'lunas') return 'inline-flex items-center rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-800';
  if (status === 'ditunda') return 'inline-flex items-center rounded-full bg-error-100 px-2 py-0.5 text-xs font-medium text-error-800';
  return 'inline-flex items-center rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-800';
};

const fetchAngsuranDetails = async () => {
  isLoading.value = true;
  try {
    const headers = { 'ngrok-skip-browser-warning': '69420', 'Authorization': `Bearer ${userToken}` };
    
    const [pinjamanRes, angsuranRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/pinjaman/pinjaman/${pinjamanId.value}`, { headers }),
      axios.get(`${API_BASE_URL}/angsuran/pinjaman/${pinjamanId.value}`, { headers })
    ]);

    const pDetail = pinjamanRes.data.data;
    const karyawanRes = await axios.get(`${API_BASE_URL}/karyawan/${pDetail.id_karyawan}`, { headers });

    pinjamanDetail.value = {
      ...pDetail,
      nama_karyawan: karyawanRes.data.data.nama_karyawan || 'N/A',
      total_kewajiban: (parseFloat(angsuranRes.data.data.belum_lunas[0]?.jumlah_tertagih || angsuranRes.data.data.lunas[0]?.jumlah_tertagih || 0)) * pDetail.tenor
    };

    const lunas = angsuranRes.data.data.lunas || [];
    const belumLunas = angsuranRes.data.data.belum_lunas || [];
    angsuranList.value = [...lunas, ...belumLunas].sort((a, b) => a.angsuran_ke - b.angsuran_ke);

  } catch (err) {
    error.value = `Gagal memuat: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
};

const prosesAngsuran = async (row, tipe) => {
  const isBayar = tipe === 'bayar';
  const result = await Swal.fire({
    title: isBayar ? 'Konfirmasi Bayar' : 'Konfirmasi Tunda',
    text: isBayar ? `Bayar angsuran ke-${row.angsuran_ke}?` : `Tunda angsuran ke-${row.angsuran_ke} ke periode berikutnya?`,
    icon: isBayar ? 'question' : 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Lanjutkan',
    cancelButtonText: 'Batal'
  });

  if (result.isConfirmed) {
    isLoading.value = true;
    try {
      const endpoint = isBayar ? '/angsuran/bayar' : '/angsuran/tunda';
      await axios.post(`${API_BASE_URL}${endpoint}`, 
        { id_jadwal: row.id_jadwal },
        { headers: { 'Authorization': `Bearer ${userToken}` } }
      );
      
      Swal.fire('Berhasil!', `Angsuran telah ${isBayar ? 'dibayar' : 'ditunda'}.`, 'success');
      fetchAngsuranDetails();
    } catch (err) {
      Swal.fire('Gagal!', err.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      isLoading.value = false;
    }
  }
};

onMounted(fetchAngsuranDetails);
</script>
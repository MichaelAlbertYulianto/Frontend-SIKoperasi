<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div
      class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
      <div class="mx-auto w-full max-w-4xl">

        <div v-if="isLoading" class="text-center py-10">
          <p class="text-brand-500">Memuat detail pinjaman...</p>
        </div>

        <div v-else-if="error" class="text-center py-10 text-error-500">
          <p>Gagal memuat data: {{ error }}</p>
          <button @click="router.back()" class="mt-4 text-brand-500 hover:underline">
            Kembali
          </button>
        </div>

        <div v-else class="space-y-6">

          <div class="p-6 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <h4 class="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Informasi Utama</h4>

            <div class="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Nama Karyawan</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ employeeName }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Tanggal Pengajuan</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">{{
                formatDate(pinjamanDetail.tanggal_pengajuan) }}</span>
            </div>

            <div class="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Tujuan Pinjaman</span>
              <span :class="statusClass(pinjamanDetail.tujuan_pinjaman)" class="text-sm font-semibold">{{
                formatStatus(pinjamanDetail.tujuan_pinjaman) }}</span>
            </div>

            <div class="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Tenor</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">{{
                pinjamanDetail.tenor }} bulan</span>
            </div>

            <div class="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Suku Bunga/bulan</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">{{
                pinjamanDetail.suku_bunga * 100 }}%</span>
            </div>


            <div class="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Jumlah Pinjaman</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">{{
                formatCurrency(pinjamanDetail.jumlah_pinjaman) }}</span>
            </div>

            <div class="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Angsuran/bulan</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">{{
                formatCurrency(pinjamanDetail.perhitungan?.totalKewajiban / pinjamanDetail.tenor) }}</span>
            </div>

            <div class="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Estimasi Total Pengembalian</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">{{
                formatCurrency(pinjamanDetail.perhitungan?.totalKewajiban) }}</span>
            </div>

          </div>

          <div v-if="canApprove && getMyApproval.myTurn"
            class="p-6 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800 text-center">
            <h4 class="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Aksi Persetujuan</h4>
            <div class="flex justify-center gap-4">
              <button @click="handleApprovalAction('disetujui')"
                class="px-6 py-2 text-sm font-medium text-white transition rounded-lg bg-success-600 hover:bg-success-700">
                ✅ Setujui Pinjaman
              </button>
              <button @click="handleApprovalAction('ditolak')"
                class="px-6 py-2 text-sm font-medium text-white transition rounded-lg bg-error-600 hover:bg-error-700">
                ❌ Tolak Pinjaman
              </button>
            </div>
          </div>

          <div v-if="!isKaryawan && isWaitingApproval"
            class="p-6 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800">
            <h4 class="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Riwayat Peminjaman Karyawan</h4>


            <div v-if="riwayatPinjaman.length > 0">
              <p>
                <strong>Catatan:</strong> "Pastikan karyawan ini tidak sedang mengajukan pinjaman lain/memiliki pinjaman
                aktif."
              </p>
              <p class="mb-4 text-sm text-gray-500">Total: {{ riwayatPinjaman.length }} Pengajuan Tercatat</p>
              <vue-good-table :columns="historyColumns" :rows="riwayatPinjaman" :pagination-options="{
                enabled: true,
                perPage: 3,
                perPageDropdown: [3, 5, 10],
              }" :sort-options="{
                enabled: true,
                initialSortBy: { field: 'tanggal_pengajuan', type: 'desc' } // Default sort
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

                  <span v-else-if="props.column.field === 'persetujuan_detail'">
                    <div class="flex flex-wrap gap-1">
                      <span v-for="role in ['sekretaris', 'bendahara', 'ketua']" :key="props.row.id_pinjaman + role"
                        class="text-xs font-medium px-2 py-0.5 rounded-full"
                        :class="statusClass(props.row['status_' + role] || 'N/A')">
                        {{ role.charAt(0).toUpperCase() + role.slice(1).substring(0, 3) }}: {{
                          formatStatus(props.row['status_' + role] || 'N/A') }}
                      </span>
                    </div>
                  </span>

                  <span v-else>
                    {{ props.formattedRow[props.column.field] }}
                  </span>
                </template>
              </vue-good-table>
            </div>
            <p v-else class="text-sm text-gray-500">Karyawan ini belum memiliki riwayat peminjaman lain.</p>
          </div>

          <div class="p-6 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800">
            <h4 class="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Riwayat Persetujuan</h4>
            <div v-if="orderedPersetujuan.length" class="space-y-3">
              <div v-for="p in orderedPersetujuan" :key="p.id_persetujuan"
                class="p-3 border rounded-md dark:border-gray-700"
                :class="{ 'bg-success-50/50 dark:bg-success-900/20': p.status === 'disetujui', 'bg-error-50/50 dark:bg-error-900/20': p.status === 'ditolak', 'bg-warning-50/50 dark:bg-warning-900/20': p.status === 'menunggu' }">
                <p class="text-sm font-medium dark:text-white">
                  Tahap: <span class="uppercase">{{ p.tahap_persetujuan }}</span>
                  <span :class="statusClass(p.status)" class="ml-3">
                    {{ formatStatus(p.status) }}
                  </span>
                </p>
                <p v-if="p.catatan" class="mt-1 text-xs text-gray-600 dark:text-gray-400">Catatan: "{{ p.catatan }}"</p>
                <p class="text-xs text-gray-500 dark:text-gray-500">
                  Tanggal Aksi: {{ p.tanggal_persetujuan ? formatDateTime(p.tanggal_persetujuan) : 'Belum Ada Aksi' }}
                </p>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500">Belum ada riwayat persetujuan tercatat.</p>
          </div>

          <button @click="router.back()"
            class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700">
            <p v-if=isKaryawan>Kembali ke Pengajuan Pinjaman</p>
            <p v-else>Kembali ke Daftar Pending</p>
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import axios from 'axios';
import Swal from 'sweetalert2';
import { VueGoodTable } from 'vue-good-table-next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();
const router = useRouter();

const pinjamanId = ref(route.params.id);
const currentPageTitle = ref("Detail Pinjaman");

const pinjamanDetail = ref({});
const isLoading = ref(true);
const error = ref(null);
const employeeName = ref('');
const riwayatPinjaman = ref([]);

const currentUserRole = ref(localStorage.getItem('user_role')?.toLowerCase());
const currentUserId = ref(localStorage.getItem('current_user_id'));
const myApprovalId = ref(null);
const APPROVAL_ORDER = ['sekretaris', 'bendahara', 'ketua'];

const historyColumns = ref([
  { label: 'Jumlah', field: 'jumlah_pinjaman', sortable: true, type: 'number' },
  { label: 'Tenor', field: 'tenor', sortable: true, type: 'number' },
  { label: 'Tujuan', field: 'tujuan_pinjaman', sortable: true },
  { label: 'Pengajuan', field: 'tanggal_pengajuan', sortable: true, type: 'date', dateInputFormat: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'', dateOutputFormat: 'dd MMM yyyy', },
  { label: 'Status Saat Ini', field: 'status_pinjaman', sortable: true },
  { label: 'Persetujuan', field: 'persetujuan_detail', sortable: false },
]);

const getApprovalStatusByRole = (persetujuanList, role) => {
  const entry = persetujuanList.find(p => p.tahap_persetujuan.toLowerCase() === role);
  return entry ? entry.status : 'N/A';
};

const canApprove = computed(() => {
  const roles = ['ketua', 'sekretaris', 'bendahara'];
  return roles.includes(currentUserRole.value);
});

const isWaitingApproval = computed(() => {
  return pinjamanDetail.value.status_pinjaman === 'menunggu_persetujuan';
});

const isKaryawan = computed(() => {
  return currentUserRole.value === 'karyawan';
});

const getMyApproval = computed(() => {
  const persetujuanList = pinjamanDetail.value.persetujuan;
  const userRole = currentUserRole.value;
  const userId = currentUserId.value;

  if (!persetujuanList || !userRole || !userId || pinjamanDetail.value.status_pinjaman !== 'menunggu_persetujuan') {
    return { status: 'N/A', myApproval: null, myTurn: false };
  }

  const myApprovalEntry = persetujuanList.find(
    p => p.tahap_persetujuan.toLowerCase() === userRole
  );

  if (!myApprovalEntry || myApprovalEntry.status !== 'menunggu') {
    return { status: myApprovalEntry?.status || 'N/A', myApproval: myApprovalEntry || null, myTurn: false };
  }

  const myIndex = APPROVAL_ORDER.indexOf(userRole);

  if (myIndex === 0) {
    return {
      status: myApprovalEntry.status,
      myApproval: myApprovalEntry,
      myTurn: myApprovalEntry.status === 'menunggu' && myApprovalEntry.id_user === userId
    };
  }

  if (myIndex > 0) {
    const previousRole = APPROVAL_ORDER[myIndex - 1];

    const previousApprovalEntry = persetujuanList.find(
      p => p.tahap_persetujuan.toLowerCase() === previousRole
    );

    const isPreviousApproved = previousApprovalEntry && previousApprovalEntry.status === 'disetujui';

    if (isPreviousApproved) {
      return {
        status: myApprovalEntry.status,
        myApproval: myApprovalEntry,
        myTurn: myApprovalEntry.status === 'menunggu' && myApprovalEntry.id_user === userId
      };
    }
  }

  return { status: 'N/A', myApproval: null, myTurn: false };
});


const handleApprovalAction = async (actionType) => {
  const userToken = localStorage.getItem('user_token');
  if (!userToken || !pinjamanId.value) return;

  const actionText = actionType === 'disetujui' ? 'Setujui' : 'Tolak';
  const icon = actionType === 'disetujui' ? 'success' : 'error';

  const { value: catatan } = await Swal.fire({
    title: `${actionText} Pinjaman`,
    text: `Masukkan catatan untuk ${actionText.toLowerCase()} pinjaman ini:`,
    input: 'textarea',
    inputPlaceholder: `Opsional: Catatan ${actionText}...`,
    icon: icon,
    showCancelButton: true,
    confirmButtonText: `${actionText} Sekarang`,
    cancelButtonText: 'Batal',
    confirmButtonColor: actionType === 'disetujui' ? '#10B981' : '#EF4444',
  });

  if (catatan === undefined) return;

  const updateBody = {
    status: actionType,
    catatan: catatan || `[Tanpa Catatan]`,
  };

  try {
    const response = await axios.put(`${API_BASE_URL}/pinjaman/persetujuan/${myApprovalId.value}/status`, updateBody, {
      headers: {
        'ngrok-skip-browser-warning': '69420',
        'Authorization': `Bearer ${userToken}`
      }
    });

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `Pinjaman berhasil di${actionType} oleh ${currentUserRole.value}.`,
      confirmButtonColor: '#3085d6',
    });

    await fetchPinjamanDetail();

  } catch (err) {
    const message = err.response?.data?.message || `Gagal ${actionText.toLowerCase()} pinjaman.`;
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: message,
      confirmButtonColor: '#d33',
    });
    console.error('Approval Error:', err);
  }
};

const DetailItem = {
  props: ['label', 'value', 'class'],
  template: `
        <div class="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ label }}</span>
            <span class="text-sm font-semibold text-gray-900 dark:text-white" :class="class">{{ value }}</span>
        </div>
    `
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

const formatStatus = (status) => {
  if (!status) return 'N/A';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const statusClass = (status) => {
  switch (status) {
    case 'disetujui':
    case 'approved':
      return 'inline-flex items-center rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-800 dark:bg-success-800/20 dark:text-success-500';
    case 'ditolak':
    case 'rejected':
      return 'inline-flex items-center rounded-full bg-error-100 px-2 py-0.5 text-xs font-medium text-error-800 dark:bg-error-800/20 dark:text-error-500';
    case 'menunggu_persetujuan':
    case 'menunggu':
    default:
      return 'inline-flex items-center rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-800 dark:bg-warning-800/20 dark:text-warning-500';
  }
};

const fetchPinjamanDetail = async () => {
  isLoading.value = true;
  error.value = null;
  const userToken = localStorage.getItem('user_token');

  if (!pinjamanId.value || !userToken) {
    error.value = "ID Pinjaman atau Token tidak ditemukan.";
    isLoading.value = false;
    return;
  }

  try {
    const pinjamanResponse = await axios.get(`${API_BASE_URL}/pinjaman/pinjaman/${pinjamanId.value}`, {
      headers: {
        'ngrok-skip-browser-warning': '69420',
        'Authorization': `Bearer ${userToken}`
      }
    });

    pinjamanDetail.value = pinjamanResponse.data.data;

    const currentUserIdValue = currentUserId.value;

    if (pinjamanDetail.value.persetujuan && currentUserIdValue) {

      const myApprovalEntry = pinjamanDetail.value.persetujuan.find(
        p => p.id_user === currentUserIdValue
      );

      if (myApprovalEntry) {
        myApprovalId.value = myApprovalEntry.id_persetujuan;
      }
    }

    const karyawanId = pinjamanDetail.value.id_karyawan;
    const employeeResponse = await axios.get(`${API_BASE_URL}/karyawan/${karyawanId}`, {
      headers: {
        'ngrok-skip-browser-warning': '69420',
        'Authorization': `Bearer ${userToken}`
      }
    });

    employeeName.value = employeeResponse.data.data.nama_karyawan || 'Nama Tidak Ditemukan';

    const historyResponse = await axios.get(`${API_BASE_URL}/pinjaman/user/${karyawanId}`, {
      headers: {
        'ngrok-skip-browser-warning': '69420',
        'Authorization': `Bearer ${userToken}`
      }
    });

    let rawHistory = historyResponse.data.data.filter(
      p => p.id_pinjaman !== pinjamanId.value
    );

    const historyWithDetailsPromises = rawHistory.map(async (pinjaman) => {
      try {
        const detailRes = await axios.get(`${API_BASE_URL}/pinjaman/pinjaman/${pinjaman.id_pinjaman}`, {
          headers: {
            'ngrok-skip-browser-warning': '69420',
            'Authorization': `Bearer ${userToken}`
          }
        });
        const persetujuanList = detailRes.data.data.persetujuan || [];

        return {
          ...pinjaman,
          persetujuan_detail: persetujuanList,
          status_sekretaris: getApprovalStatusByRole(persetujuanList, 'sekretaris'),
          status_bendahara: getApprovalStatusByRole(persetujuanList, 'bendahara'),
          status_ketua: getApprovalStatusByRole(persetujuanList, 'ketua'),
        };
      } catch (err) {
        return { ...pinjaman, persetujuan_detail: [], error: true };
      }
    });
    riwayatPinjaman.value = await Promise.all(historyWithDetailsPromises);
  } catch (err) {
    error.value = `Gagal memuat detail pinjaman: ${err.response?.statusText || err.message}`;
    console.error('Fetch Pinjaman Error:', err);
  } finally {
    isLoading.value = false;
  }
};
const orderedPersetujuan = computed(() => {
  const persetujuanList = pinjamanDetail.value.persetujuan;

  if (!persetujuanList || persetujuanList.length === 0) {
    return [];
  }

  const roleOrderMap = new Map();
  APPROVAL_ORDER.forEach((role, index) => {
    roleOrderMap.set(role, index);
  });

  const sortedList = [...persetujuanList].sort((a, b) => {
    const indexA = roleOrderMap.get(a.tahap_persetujuan.toLowerCase()) ?? Infinity;
    const indexB = roleOrderMap.get(b.tahap_persetujuan.toLowerCase()) ?? Infinity;
    return indexA - indexB;
  });

  return sortedList;
});

onMounted(() => {
  fetchPinjamanDetail();
});
</script>

<style></style>

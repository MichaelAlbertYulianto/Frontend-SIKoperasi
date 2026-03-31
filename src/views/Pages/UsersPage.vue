<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div
      class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
      <div class="mb-6">
        <h3 class="font-semibold text-gray-800 text-xl dark:text-white/90">
          Daftar Akun Pengguna (Users)
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Total: {{ userList.length }} Akun Terdaftar
        </p>
      </div>

      <div v-if="isLoading" class="text-center py-10">
        <p class="text-brand-500">Memuat data pengguna...</p>
      </div>

      <div v-else-if="error" class="text-center py-10 text-error-500">
        <p>Gagal memuat data: {{ error }}</p>
      </div>

      <div v-else class="user-management-table">
        <vue-good-table :columns="columns" :rows="userList"
          :theme="isDarkMode ? 'nocturnal' : 'polar-bear'"
          :search-options="{
          enabled: true,
          placeholder: 'Cari pengguna...',
        }" :pagination-options="{
          enabled: true,
          mode: 'records',
          perPage: 5,
          perPageDropdown: [5, 10, 20, 50],
          dropdownAllowAll: false,
          setCurrentPage: 1,
          nextLabel: 'Next',
          prevLabel: 'Prev',
          rowsPerPageLabel: 'Baris per halaman',
          ofLabel: 'dari',
          pageLabel: 'halaman',
        }">
          <template #table-row="props">
            <span v-if="props.column.field === 'role'">
              <span :class="roleClass(props.row.role)">
                {{ props.row.role || 'Tidak Diketahui' }}
              </span>
            </span>
            <span v-else-if="props.column.field === 'id_user'">
                {{ props.row.id_user || 'N/A' }}
            </span>
            <span v-else-if="props.column.field === 'status'">
              <span :class="statusClass(props.row.status)">
                {{ formatStatus(props.row.status) }}
              </span>
            </span>
            <span v-else-if="props.column.field === 'tanggal_join'">
              {{ formatDate(props.row.tanggal_join) }}
            </span>
            <span v-else-if="props.column.field === 'nama_karyawan'">
              {{ props.formattedRow['nama_karyawan'] }}
            </span>
            <span v-else-if="props.column.field === 'aksi'">
              <button  @click="viewDetail(props.row)"
                class="bg-brand-500 hover:bg-brand-600 text-white text-xs py-1.5 px-3 rounded-md transition-colors font-medium shadow-sm">
                Edit
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
import axios from 'axios';
import { VueGoodTable } from 'vue-good-table-next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const currentPageTitle = ref("Daftar Pengguna");
const userList = ref([]);
const isLoading = ref(true);
const error = ref(null);


const columns = ref([
  { label: 'ID User', field: 'id_user', width: '300px', sortable: true, hidden: false },
  // { label: 'Nama Karyawan', field: 'nama_karyawan', sortable: true, filterOptions: { enabled: true } },
  // { label: 'Role', field: 'role', sortable: true, filterOptions: { enabled: true } },
  { label: 'Nama Karyawan', field: 'nama_karyawan', width: '250px', sortable: true },
  { label: 'Role', field: 'role', sortable: true },
  { label: 'Status', field: 'status', sortable: true },
  { label: 'Tanggal Join', field: 'tanggal_join', sortable: true },
  { label: 'Aksi', field: 'aksi', sortable: false },
]);


const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const statusClass = (status) => {
  switch (status) {
    case 'active':
      return 'inline-flex items-center rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-800 dark:bg-success-800/20 dark:text-success-500';
    case 'inactive':
    default:
      return 'inline-flex items-center rounded-full bg-error-100 px-2 py-0.5 text-xs font-medium text-error-800 dark:bg-error-800/20 dark:text-error-500';
  }
};

const roleClass = (role) => {
  const roleMap = {
    'ketua': 'bg-red-800/20 text-red-700',
    'bendahara': 'bg-yellow-800/20 text-yellow-700',
    'sekretaris': 'bg-cyan-800/20 text-cyan-700',
    'karyawan': 'bg-gray-700 text-gray-200',
    'admin': 'bg-indigo-800/20 text-indigo-700',
  };
  const baseClass = 'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium';
  return `${baseClass} ${roleMap[role.toLowerCase()] || 'bg-gray-100 text-gray-800'}`;
}

const viewDetail = (user) => {
  const userId = user.id_user;
  if (userId) {
    window.location.href = `/user-edit/${userId}`;
  } else {
    alert('ID User tidak tersedia.');
  }
};

const fetchUserList = async () => {
  isLoading.value = true;
  error.value = null;

  const userToken = localStorage.getItem('user_token');

  if (!userToken) {
    error.value = "Pengguna tidak terautentikasi. Silakan login kembali.";
    isLoading.value = false;
    return;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/user/`, {
      headers: {
        'ngrok-skip-browser-warning': '69420',
        'Authorization': `Bearer ${userToken}`
      },
    });

    let userData = response.data.data;

    const userDetailsPromises = userData.map(user =>
      axios.get(`${API_BASE_URL}/karyawan/${user.id_karyawan}`, {
        headers: {
          'ngrok-skip-browser-warning': '69420',
          'Authorization': `Bearer ${userToken}`
        }
      })
        .then(res => {
          const namaKaryawan = res.data.data.nama_karyawan || 'N/A';
          let tanggalJoinDate = user.tanggal_join ? new Date(user.tanggal_join) : null;
          return { ...user, nama_karyawan: namaKaryawan, tanggal_join: tanggalJoinDate };
        }).catch(() => {
          return { ...user, nama_karyawan: 'N/A' };
        })
    );

    userList.value = await Promise.all(userDetailsPromises);

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

const isDarkMode = ref(false);

const updateTheme = () => {
  isDarkMode.value = document.documentElement.classList.contains("dark");
};

let themeObserver;

onMounted(() => {
  fetchUserList();
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
<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div
      class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8"
    >
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

      <div v-else class="overflow-x-auto shadow-md sm:rounded-lg">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
              >
                ID User
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Nama Karyawan
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
              >
                Role
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
              >
                Tanggal Join
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in userList" :key="user.id_user">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white/90">
                {{ user.id_user || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ user.nama_karyawan || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <span :class="roleClass(user.role)">
                    {{ user.role || 'Tidak Diketahui' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <span :class="statusClass(user.status)">
                    {{ formatStatus(user.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(user.tanggal_join) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="viewDetail(user)"
                  class="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="userList.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
            Tidak ada data pengguna.
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const currentPageTitle = ref("Daftar Pengguna");
const userList = ref([]);
const isLoading = ref(true);
const error = ref(null);


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
        'ketua': 'bg-primary-100 text-primary-800',
        'bendahara': 'bg-warning-100 text-warning-800',
        'sekretaris': 'bg-info-100 text-info-800',
        'karyawan': 'bg-gray-100 text-gray-800',
    };
    const baseClass = 'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium';
    return `${baseClass} ${roleMap[role.toLowerCase()] || 'bg-gray-100 text-gray-800'}`;
}

const viewDetail = (user) => {
  console.log("Edit User:", user.id_user);
  alert(`Mengedit User: ${user.id_user.substring(0, 8)} (${user.role})`);
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
        'Authorization': `Bearer ${userToken}`
      }
    });

    let userData = response.data.data;

    const userDetailsPromises = userData.map(user =>
      axios.get(`${API_BASE_URL}/karyawan/${user.id_karyawan}`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      })
      .then(res => {
        const namaKaryawan = res.data.data.nama_karyawan || 'N/A';
        return { ...user, nama_karyawan: namaKaryawan };
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

onMounted(() => {
  fetchUserList();
});
</script>

<style></style>
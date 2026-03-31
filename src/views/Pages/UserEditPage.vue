<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div
      class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
      <div class="mx-auto w-full max-w-2xl">
        <h3 class="mb-6 text-center font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
          Edit User: {{ userName || 'Loading...' }}
        </h3>

        <div v-if="isLoading" class="text-center py-10">
          <p class="text-brand-500">Memuat data pengguna...</p>
        </div>

        <div v-else-if="error" class="text-center py-10 text-error-500">
          <p>Gagal memuat data: {{ error }}</p>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
          <div class="border-b border-gray-200 pb-4 dark:border-gray-700">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-400">
              Nama Karyawan: <span class="font-normal">{{ employeeName || 'Tidak Ditemukan' }}</span>
            </p>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-400 mt-2">
              Role Saat Ini: <span class="font-normal uppercase">{{ userData.role || 'N/A' }}</span>
            </p>
          </div>

          <div>
            <label for="username" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Username
            </label>
            <input id="username" v-model="formData.username" type="text" required
              class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              placeholder="Masukkan username baru" />
          </div>

          <div>
            <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Password (Kosongkan jika tidak ingin diubah)
            </label>
            <input id="password" v-model="formData.password" type="password"
              class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              placeholder="Masukkan password baru" />
          </div>

          <div v-if="userData.role === 'karyawan'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="nama_bank" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Nama Bank
              </label>
              <select id="nama_bank" v-model="formData.nama_bank"
                class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 appearance-none">
                <option value="" disabled>{{ isLoadingBanks ? 'Memuat...' : 'Pilih Bank' }}</option>
                <option v-for="bank in bankList" :key="bank.id" :value="bank.name">
                  {{ bank.name }}
                </option>
              </select>
            </div>

            <div>
              <label for="rekening_bank" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Nomor Rekening
              </label>
              <input id="rekening_bank" v-model="formData.rekening_bank" type="text"
                @input="formData.rekening_bank = formData.rekening_bank.replace(/\D/g, '')"
                class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="Hanya angka" />
            </div>
          </div>

          <div v-if="userData.role === 'karyawan'">
            <label for="status" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Status Akun
            </label>
            <select id="status" v-model="formData.status" required
              class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="submit" :disabled="isSubmitting"
              class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:bg-gray-400">
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>

            <button type="button" @click="router.back()"
              class="mt-3 flex items-center justify-center w-full px-4 py-3 text-sm font-medium transition rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700">
              Batal
            </button>
          </div>

          <div v-if="userData.role === 'karyawan'" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" @click="handleDelete"
              class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 disabled:bg-gray-400">
              Hapus Pengguna Secara Permanen
            </button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();
const router = useRouter();

const userId = ref(route.params.id);
const currentPageTitle = ref("Edit Pengguna");
const isLoading = ref(true);
const isSubmitting = ref(false);
const isLoadingBanks = ref(false);
const error = ref(null);

const userData = ref({});
const employeeName = ref('');
const bankList = ref([]);
const userName = ref('');

const formData = ref({
  username: '',
  password: '',
  status: '',
  nama_bank: '',
  rekening_bank: '',
});

const fetchBanks = async () => {
  isLoadingBanks.value = true;
  try {
    const response = await axios.get('https://gist.githubusercontent.com/muhammadyana/6abf8480799637b4082359b509410018/raw/dc4aae6808285aea032a3971b3e78c497881aa23/indonesia-bank.json');
    bankList.value = response.data;
  } catch (err) {
    console.error('Gagal memuat daftar bank:', err);
  } finally {
    isLoadingBanks.value = false;
  }
};

const fetchUserData = async () => {
  isLoading.value = true;
  error.value = null;
  const userToken = localStorage.getItem('user_token');

  if (!userToken) {
    error.value = "Token tidak ditemukan.";
    isLoading.value = false;
    return;
  }

  try {
    const userResponse = await axios.get(`${API_BASE_URL}/user/${userId.value}`, {
      headers: {
        'ngrok-skip-browser-warning': '69420',
        'Authorization': `Bearer ${userToken}`
      }
    });

    const user = userResponse.data.data;
    userData.value = user;

    formData.value.status = user.status;
    formData.value.username = user.username;
    formData.value.nama_bank = user.nama_bank || '';
    formData.value.rekening_bank = user.rekening_bank || '';
    userName.value = user.username;

    const employeeResponse = await axios.get(`${API_BASE_URL}/karyawan/${user.id_karyawan}`, {
      headers: {
        'ngrok-skip-browser-warning': '69420',
        'Authorization': `Bearer ${userToken}`
      }
    });

    employeeName.value = employeeResponse.data.data.nama_karyawan;

  } catch (err) {
    error.value = `Gagal memuat data: ${err.response?.statusText || err.message}`;
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  const confirmation = await Swal.fire({
    title: 'Konfirmasi Perubahan',
    text: 'Simpan perubahan data pengguna?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#465fff',
    confirmButtonText: 'Ya, Simpan',
  });

  if (!confirmation.isConfirmed) return;

  isSubmitting.value = true;
  const userToken = localStorage.getItem('user_token');

  const updateBody = {
    username: formData.value.username,
    ...(formData.value.password && { password: formData.value.password }),
  };

  if (userData.value.role === 'karyawan') {
    updateBody.status = formData.value.status;
    updateBody.nama_bank = formData.value.nama_bank;
    updateBody.rekening_bank = formData.value.rekening_bank;
  }

  try {
    await axios.put(`${API_BASE_URL}/user/${userId.value}`, updateBody, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    let logDetail = `Updated User: ${formData.value.username}`;
    if (userData.value.role === 'karyawan') {
        logDetail += ` | Status: ${updateBody.status} | Bank: ${updateBody.nama_bank}`;
    }

    await axios.post(`${API_BASE_URL}/log`, {
      action: `UPDATE`,
      entity: `USER`,
      entityId: userId.value,
      detail: logDetail,
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    await Swal.fire('Berhasil!', 'Data pengguna telah diperbarui.', 'success');
    router.push({ name: 'Users Management' });

  } catch (err) {
    Swal.fire('Gagal!', err.response?.data?.message || 'Terjadi kesalahan sistem.', 'error');
    console.error('Error updating user:', err);
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async () => {
  const confirmation = await Swal.fire({
    title: 'Hapus Pengguna?',
    text: 'Tindakan ini permanen dan tidak dapat dibatalkan.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Ya, Hapus',
  });

  if (!confirmation.isConfirmed) return;

  isSubmitting.value = true;
  const userToken = localStorage.getItem('user_token');

  try {
    await axios.delete(`${API_BASE_URL}/user/${userId.value}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    await Swal.fire('Terhapus!', 'Pengguna telah dihapus.', 'success');
    router.push({ name: 'users-management' });
  } catch (err) {
    Swal.fire('Gagal!', 'Gagal menghapus pengguna.', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchBanks();
  if (userId.value) {
    fetchUserData();
  }
});
</script>

<style scoped>
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>
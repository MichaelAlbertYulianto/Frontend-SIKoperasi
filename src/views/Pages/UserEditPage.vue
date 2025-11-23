<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div
      class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12"
    >
      <div class="mx-auto w-full max-w-2xl">
        <h3
          class="mb-6 text-center font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl"
        >
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
            <input
              id="username"
              v-model="formData.username"
              type="text"
              required
              class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              placeholder="Masukkan username baru"
            />
          </div>

          <div>
            <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Password (Kosongkan jika tidak ingin diubah)
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              placeholder="Masukkan password baru"
            />
          </div>

          <div>
            <label for="status" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Status
            </label>
            <select
              id="status"
              v-model="formData.status"
              required
              class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

<div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:bg-gray-400"
            >
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
            
            <button
              type="button"
              @click="router.back()"
              class="mt-3 flex items-center justify-center w-full px-4 py-3 text-sm font-medium transition rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Batal
            </button>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="handleDelete"
              class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 disabled:bg-gray-400"
            >
              Hapus Pengguna Secara Permanen
            </button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();
const router = useRouter();

let userId = ref(route.params.id);
const currentPageTitle = ref("Edit Pengguna");
const isLoading = ref(true);
const isSubmitting = ref(false);
const error = ref(null);

const userData = ref({}); 

const employeeName = ref('');

const formData = ref({
    username: '',
    password: '', 
    status: '',
});
const userName = ref(''); 

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
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        console.log('Fetched User Data:', userResponse);
        
        const user = userResponse.data.data;
        userData.value = user;

        formData.value.status = user.status;
        formData.value.username = user.username; 
        userName.value = user.username;

        const employeeResponse = await axios.get(`${API_BASE_URL}/karyawan/${user.id_karyawan}`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        employeeName.value = employeeResponse.data.data.nama_karyawan;
        
    } catch (err) {
        error.value = `Gagal memuat data pengguna: ${err.response?.statusText || err.message}`;
        console.error('Fetch User Error:', err);
    } finally {
        isLoading.value = false;
    }
};

const handleSubmit = async () => {
    const confirmation = await Swal.fire({
        title: 'Konfirmasi Perubahan',
        text: 'Anda yakin ingin menyimpan perubahan pada data pengguna ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor : '#3085d6',
        cancelButtonColor : '#d33',
        confirmButtonText: 'Ya, Simpan',
        cancelButtonText: 'Batal'
    });

    if (!confirmation.isConfirmed) {
        return; 
    }

    isSubmitting.value = true;
    error.value = null;
    const userToken = localStorage.getItem('user_token');


    const updateBody = {
        username: formData.value.username,
        status: formData.value.status,
        ...(formData.value.password && { password: formData.value.password }), 
    };

    try {
        const response = await axios.put(`${API_BASE_URL}/user/${userId.value}`, updateBody, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });

        let logDetail = `Updated Status: ${updateBody.status}`;
        
        if (updateBody.password) {
             logDetail += `, Password was changed.`;
        }
        if (updateBody.username !== userData.value.username) {
             logDetail += `, Username changed from ${userData.value.username} to ${updateBody.username}.`;
        }

        const auditLog = await axios.post(`${API_BASE_URL}/log`, {
            action: `UPDATE`,
            entity : `USER`,
            entityId : userId.value,
            detail: logDetail,
        }, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        }); 

        console.log('Audit Log Created:', {
            action: `UPDATE`,
            entity : `USER`,
            entityId : userId.value,
            detail: logDetail,
        });
        
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Perubahan pengguna dan log audit berhasil disimpan.',
            confirmButtonColor: '#3085d6',
        });
        
        router.push({ name: 'Users Management' }); 
        
    } catch (err) {
        const message = err.response?.data?.message || 'Gagal menyimpan perubahan.';
        error.value = message;
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menyimpan!',
            text: `Terjadi kesalahan: ${message}`,
            confirmButtonColor: '#d33',
        });
        console.error('Update User Error:', err);
    } finally {
        isSubmitting.value = false;
    }
};

const handleDelete = async () => {
    const confirmation = await Swal.fire({
        title: 'Konfirmasi Penghapusan',
        text: 'Apakah Anda yakin ingin menghapus pengguna ini secara permanen? Tindakan ini tidak dapat dibatalkan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor : '#3085d6',
        cancelButtonColor : '#d33',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
    });

    if (!confirmation.isConfirmed) {
        return; 
    }

    isSubmitting.value = true;
    error.value = null;
    const userToken = localStorage.getItem('user_token');

    try {
        await axios.delete(`${API_BASE_URL}/user/${userId.value}`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });

        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Pengguna berhasil dihapus.',
            confirmButtonColor: '#3085d6',
        });

        router.push({ name: 'Users Management' }); 

    } catch (err) {
        const message = err.response?.data?.message || 'Gagal menghapus pengguna.';
        error.value = message;
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: `Terjadi kesalahan: ${message}`,
            confirmButtonColor: '#d33',
        });
        console.error('Delete User Error:', err);
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(() => {
    if (userId.value) {
        fetchUserData();
    } else {
        error.value = "ID Pengguna tidak ditemukan di URL.";
        isLoading.value = false;
    }
});
</script>
<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-10">
      <div class="max-w-xl mx-auto">
        <div class="mb-8">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white/90">Ubah Kata Sandi</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Perbarui kata sandi Anda secara berkala untuk menjaga keamanan akun.
          </p>
        </div>

        <form @submit.prevent="handleUpdatePassword" class="space-y-6">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Kata Sandi Baru
            </label>
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="Minimal 8 karakter" 
              required
              class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white" 
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Konfirmasi Kata Sandi Baru
            </label>
            <input 
              v-model="confirm_password" 
              type="password" 
              placeholder="Ulangi kata sandi baru" 
              required
              class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white" 
            />
          </div>

          <div class="flex justify-end pt-4">
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="w-full sm:w-auto rounded-lg bg-brand-500 px-8 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:bg-gray-400 shadow-md"
            >
              {{ isSubmitting ? 'Memproses...' : 'Perbarui Kata Sandi' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const userToken = localStorage.getItem("user_token");
const currentUserId = localStorage.getItem("current_user_id"); 
const currentPageTitle = ref("Pengaturan Keamanan");

const form = ref({
  password: "", 
});

const confirm_password = ref("");
const isSubmitting = ref(false);

const handleUpdatePassword = async () => {
  if (form.value.password !== confirm_password.value) {
    return Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Konfirmasi kata sandi baru tidak cocok!",
    });
  }

  if (form.value.password.length < 8) {
    return Swal.fire({
      icon: "warning",
      title: "Perhatian",
      text: "Kata sandi minimal 8 karakter.",
    });
  }

  isSubmitting.value = true;
  try {
    const response = await axios.put(`${API_BASE_URL}/user/${currentUserId}`, form.value, {
      headers: { 
        Authorization: `Bearer ${userToken}`,
        'ngrok-skip-browser-warning': '69420'
      }
    });

    if (response.data.success) {
      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Kata sandi Anda telah diperbarui.",
        confirmButtonColor: "#465fff",
      });
      
      form.value.password = "";
      confirm_password.value = "";
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: err.response?.data?.message || "Terjadi kesalahan saat menghubungi server.",
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>
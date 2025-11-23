<template>
  <FullScreenLayout>
    <div class="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div
        class="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900"
      >
        <div class="flex flex-col flex-1 w-full lg:w-1/2">
          <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div class="mb-5 sm:mb-8">
              <h1
                class="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md"
              >
                Sign Up
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Enter your username, password and ID Karyawan to sign up!
              </p>
            </div>
            <div>
              <form @submit.prevent="handleSubmit">
                <div class="space-y-5">
                  <!-- Username -->
                  <div>
                    <label
                      for="username"
                      class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                    >
                      Username<span class="text-error-500">*</span>
                    </label>
                    <input
                      v-model="username"
                      type="text"
                      id="username"
                      name="username"
                      placeholder="Enter your username"
                      required
                      class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>
                  <!-- Password -->
                  <div>
                    <label
                      for="password"
                      class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                    >
                      Password<span class="text-error-500">*</span>
                    </label>
                    <div class="relative">
                      <input
                        v-model="password"
                        :type="showPassword ? 'text' : 'password'"
                        id="password"
                        placeholder="Enter your password"
                        required
                        class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      />
                      <span
                        @click="togglePasswordVisibility"
                        class="absolute z-30 text-gray-500 -translate-y-1/2 cursor-pointer right-4 top-1/2 dark:text-gray-400"
                      >
                        <!-- SVG ICONS HERE -->
                      </span>
                    </div>
                  </div>
                  <!-- ID Karyawan -->
                  <div>
                    <label
                      for="id_karyawan"
                      class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                    >
                      ID Karyawan<span class="text-error-500">*</span>
                    </label>
                    <input
                      v-model="id_karyawan"
                      type="text"
                      id="id_karyawan"
                      name="id_karyawan"
                      placeholder="Enter your ID Karyawan (Ask Team IT if you don't have it)"
                      required
                      class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>
                  <!-- Button -->
                  <div>
                    <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:bg-gray-400"
                    >
                      {{ isSubmitting ? 'Mendaftar...' : 'Sign Up' }}
                    </button>
                  </div>
                </div>
              </form>
              <div class="mt-5">
                <p
                  class="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start"
                >
                  Already have an account?
                  <router-link
                    to="/"
                    class="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    >Sign In</router-link
                  >
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios, { AxiosError } from 'axios'
import Swal from 'sweetalert2' // Import SweetAlert2

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const router = useRouter()

const username = ref('')
const password = ref('')
const id_karyawan = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  if (!API_BASE_URL) {
    console.error('VITE_API_BASE_URL is not defined.')
    Swal.fire({ icon: 'error', title: 'Error', text: 'Konfigurasi API tidak ditemukan.' })
    return
  }

  isSubmitting.value = true

  const requestBody = {
    username: username.value,
    password: password.value,
    id_karyawan: id_karyawan.value,
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/user/register`, requestBody)

    console.log('Registration successful:', response.data)

    await Swal.fire({
      icon: 'success',
      title: 'Pendaftaran Berhasil!',
      text: 'Akun Anda berhasil dibuat. Silakan login sekarang.',
      confirmButtonColor: '#3085d6',
    })

    router.push('/')

  } catch (error) {
    let errorMessage = 'Gagal mendaftar. Terjadi kesalahan pada server.'

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      
      const responseData = axiosError.response?.data as { message?: string } | undefined
      
      if (responseData && responseData.message) {
        errorMessage = responseData.message
      } else if (axiosError.response) {
        errorMessage = `Pendaftaran Gagal. Status: ${axiosError.response.status}`
      }
      
      console.error('Registration Error:', axiosError.response?.data || axiosError.message)

      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: errorMessage,
        confirmButtonColor: '#d33',
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error Jaringan',
        text: 'Tidak dapat terhubung ke server.',
        confirmButtonColor: '#d33',
      })
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
<template>
  <FullScreenLayout>
    <div class="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div class="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900">
        <div class="flex flex-col flex-1 w-full lg:w-1/2 overflow-y-auto custom-scrollbar">
          <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto py-10">
            <div class="mb-5 sm:mb-8">
              <h1 class="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Sign Up
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Lengkapi data diri Anda untuk mendaftar akun SIKoperasi.
              </p>
            </div>

            <div>
              <form @submit.prevent="handleSubmit">
                <div class="space-y-5">
                  <div>
                    <label for="username" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Username<span class="text-error-500">*</span>
                    </label>
                    <input v-model="username" type="text" id="username" placeholder="Masukkan username" required
                      class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                  </div>

                  <div>
                    <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Password<span class="text-error-500">*</span>
                    </label>
                    <div class="relative">
                      <input v-model="password" :type="showPassword ? 'text' : 'password'" id="password"
                        placeholder="Masukkan password" required
                        class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                      <span @click="togglePasswordVisibility"
                        class="absolute z-30 text-gray-500 -translate-y-1/2 cursor-pointer right-4 top-1/2 dark:text-gray-400">
                        <span v-if="!showPassword">👁️</span>
                        <span v-else>🔒</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <label for="id_karyawan" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      ID Karyawan<span class="text-error-500">*</span>
                    </label>
                    <input v-model="id_karyawan" type="text" id="id_karyawan" placeholder="Contoh: KRY001" required
                      class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                  </div>

                  <div>
                    <label for="nama_bank" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Nama Bank<span class="text-error-500">*</span>
                    </label>
                    <select v-model="selectedBank" id="nama_bank" required
                      class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 appearance-none">
                      <option value="" disabled>{{ isLoadingBanks ? 'Memuat daftar bank...' : 'Pilih Bank' }}</option>
                      <option v-for="bank in bankList" :key="bank.id" :value="bank.name">
                        {{ bank.name }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label for="nomor_rekening" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Nomor Rekening<span class="text-error-500">*</span>
                    </label>
                    <input v-model="nomor_rekening" type="text" id="nomor_rekening" placeholder="Masukkan nomor rekening" required
                      @input="validateAccountNumber"
                      class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                  </div>

                  <div>
                    <button type="submit" :disabled="isSubmitting"
                      class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:bg-gray-400">
                      {{ isSubmitting ? 'Memproses...' : 'Daftar Sekarang' }}
                    </button>
                  </div>
                </div>
              </form>

              <div class="mt-5 flex flex-col gap-3">
                <p class="text-sm font-normal text-gray-700 dark:text-gray-400">
                  Sudah punya akun?
                  <router-link to="/" class="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium">Sign In</router-link>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios, { AxiosError } from 'axios'
import Swal from 'sweetalert2'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const router = useRouter()

const username = ref('')
const password = ref('')
const id_karyawan = ref('')
const selectedBank = ref('')
const nomor_rekening = ref('')

const showPassword = ref(false)
const isSubmitting = ref(false)
const isLoadingBanks = ref(false)
const bankList = ref<any[]>([])

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}


const validateAccountNumber = (event: Event) => {
  const input = event.target as HTMLInputElement
  nomor_rekening.value = input.value.replace(/\D/g, '')
}

const fetchBanks = async () => {
  isLoadingBanks.value = true
  try {
    const response = await axios.get('https://gist.githubusercontent.com/muhammadyana/6abf8480799637b4082359b509410018/raw/dc4aae6808285aea032a3971b3e78c497881aa23/indonesia-bank.json')
    bankList.value = response.data
  } catch (error) {
    console.error('Gagal memuat daftar bank:', error)
  } finally {
    isLoadingBanks.value = false
  }
}

onMounted(() => {
  fetchBanks()
})


const handleSubmit = async () => {
  if (!API_BASE_URL) {
    Swal.fire({ icon: 'error', title: 'Konfigurasi Error', text: 'VITE_API_BASE_URL belum disetel.' })
    return
  }

  isSubmitting.value = true

  const requestBody = {
    username: username.value,
    password: password.value,
    id_karyawan: id_karyawan.value,
    nama_bank: selectedBank.value,
    nomor_rekening: nomor_rekening.value,
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/user/register`, requestBody)
    
    await Swal.fire({
      icon: 'success',
      title: 'Registrasi Berhasil!',
      text: 'Akun Anda telah dibuat. Silakan gunakan untuk login.',
      confirmButtonColor: '#465fff',
    })

    router.push('/')
  } catch (error) {
    let errorMessage = 'Terjadi kesalahan pada server saat mendaftar.'
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      const responseData = axiosError.response?.data as { message?: string } | undefined
      errorMessage = responseData?.message || errorMessage
      
      Swal.fire({
        icon: 'error',
        title: 'Pendaftaran Gagal',
        text: errorMessage,
        confirmButtonColor: '#ef4444',
      })
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>
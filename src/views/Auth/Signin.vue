<template>
  <FullScreenLayout>
    <div class="flex h-screen items-center justify-center">

      <div class="w-full max-w-lg mx-4 sm:mx-auto">
        <div class="card shadow-xl border-0 rounded-lg p-8 bg-white dark:bg-gray-800">

          <div class="card-header text-center mb-6">
            <img src="/images/logo/Central_Logo.png" alt="Central Sakti Agratama" class="img-fluid mx-auto d-block"
              style="width: 150px; height: 150px;" />

            <h3 class="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h3>
          </div>

          <div class="card-body">
            <div>
              <div class="mb-5">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Enter your username and password to sign in!
                </p>
              </div>
              <div>
                <form @submit.prevent="handleSubmit">
                  <div class="space-y-5">
                    <div>
                      <label for="username" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Username<span class="text-error-500">*</span>
                      </label>
                      <input v-model="username" type="text" id="username" name="username"
                        placeholder="Enter your username"
                        class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                    </div>
                    <div>
                      <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Password<span class="text-error-500">*</span>
                      </label>
                      <div class="relative">
                        <input v-model="password" :type="showPassword ? 'text' : 'password'" id="password"
                          placeholder="Enter your password"
                          class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />

                        <span @click="togglePasswordVisibility"
                          class="absolute z-30 text-gray-500 -translate-y-1/2 cursor-pointer right-3 top-1/2 dark:text-gray-400">

                          <svg v-if="!showPassword" class="fill-current" width="20" height="20" viewBox="0 0 20 20"
                            fill="none" xmlns="http://www.w3.org/2000/svg">
                          </svg>
                          <svg v-else class="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                          </svg>
                        </span>
                      </div>
                    </div>
                    <div class="flex items-center justify-between">
                      <div>
                        <label for="keepLoggedIn"
                          class="flex items-center text-sm font-normal text-gray-700 cursor-pointer select-none dark:text-gray-400">
                          <div class="relative">
                            <input v-model="keepLoggedIn" type="checkbox" id="keepLoggedIn" class="sr-only" />
                            <div :class="keepLoggedIn
                              ? 'border-brand-500 bg-brand-500'
                              : 'bg-transparent border-gray-300 dark:border-gray-700'
                              " class="mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px]">
                            </div>
                          </div>
                          Keep me logged in
                        </label>
                      </div>
                      <a href="https://wa.me/6285843203226?text=Halo%20Admin%2C%20saya%20lupa%20password%20akun%20SIKoperasi%20saya.%20Mohon%20bantuannya."
                        target="_blank"
                        class="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 transition-colors">
                        Forgot password?
                      </a>
                    </div>
                    <div>
                      <button type="submit"
                        class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                        Sign In
                      </button>
                    </div>
                  </div>
                </form>
                <div class="mt-5">
                  <p class="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                    Don't have an account?
                    <router-link to="/signup" class="text-brand-500 hover:text-brand-600 dark:text-brand-400">Sign
                      Up</router-link>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios, { AxiosError } from 'axios'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
import Swal from 'sweetalert2'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const router = useRouter()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const keepLoggedIn = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  if (!API_BASE_URL) {
    console.log('VITE_API_BASE_URL is not defined in .env file.')
    return
  }

  try {
    const requestBody = {
      username: username.value,
      password: password.value,
      keep_sign: keepLoggedIn.value,
    }

    const response = await axios.post(`${API_BASE_URL}/auth/login`, requestBody)
    const getNama = await axios.get(`${API_BASE_URL}/user/profile`, {
      headers: {
        'ngrok-skip-browser-warning': '69420',
        'Authorization': `Bearer ${response.data.user_token}`
      }
    })
    const userToken = response.data.user_token
    const userName = username.value
    const userRole = response.data.role
    const nama_karyawan = getNama.data.data.nama_karyawan
    const id_user = getNama.data.data.id_user

    localStorage.setItem('nama_karyawan', nama_karyawan)
    localStorage.setItem('user_token', userToken)
    localStorage.setItem('user_name', userName)
    localStorage.setItem('user_role', userRole)
    localStorage.setItem('current_user_id', id_user)


    if (userRole === 'ketua' || userRole === 'sekretaris' || userRole === 'bendahara') {
      router.push('/dashboard')
      return
    } else if (userRole === 'admin') {
      router.push('/users-management')
      return
    } else {
      router.push('/homepage')
      return
    }

  } catch (error) {
    let errorMessage = 'Terjadi kesalahan jaringan atau server.'

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      const responseData = axiosError.response?.data as { message?: string } | undefined;

      if (responseData && responseData.message) {
        errorMessage = responseData.message;
      } else if (axiosError.response) {
        errorMessage = `Gagal Login. Status: ${axiosError.response.status}`;
      } else if (axiosError.request) {
        errorMessage = 'Tidak ada respons dari server.';
      } else {
        errorMessage = axiosError.message;
      }

      console.error('Login Gagal (Axios):', axiosError.response?.data || axiosError.message)

    } else if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Login Gagal (JS Error):', error.message)

    } else {
      console.error('Login Gagal (Unknown Error):', error)
    }

    Swal.fire({
      icon: 'error',
      title: 'Login Gagal',
      text: errorMessage,
    })
  }
}
</script>
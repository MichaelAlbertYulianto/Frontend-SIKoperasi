<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <span v-if="isLoading" class="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></span>
      </div>

      <div>
        <h4 class="text-gray-500 text-theme-sm font-medium dark:text-gray-400">Total Aset (Kas Bruto)</h4>
        <div class="flex flex-col mt-1">
          <h2 class="text-3xl font-bold leading-tight text-gray-800 dark:text-white/90">
            {{ formatCurrency(totalCash) }}
          </h2>
          
          <div class="mt-4 flex items-center gap-2">
            <span class="flex h-2 w-2 rounded-full bg-indigo-500"></span>
            <p class="text-theme-xs text-gray-500 dark:text-gray-400">
              Akumulasi saldo total ketika pinjaman sudah dikembalikan
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="mt-3 text-[10px] text-error-500 italic">
      * {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const userToken = localStorage.getItem('user_token')

const isLoading = ref(false)
const error = ref<string | null>(null)
const totalCash = ref(0)

const formatCurrency = (value: any) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(parseFloat(value || 0))
}

const fetchAssetSummary = async () => {
  isLoading.value = true
  error.value = null
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/cash-summary`, {
      headers: {
        'ngrok-skip-browser-warning': '69420',
        'Authorization': `Bearer ${userToken}`
      }
    })
    
    if (response.data.success) {
      totalCash.value = response.data.data.total_cash
    }
  } catch (err: any) {
    error.value = 'Gagal memuat total aset'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchAssetSummary()
})
</script>
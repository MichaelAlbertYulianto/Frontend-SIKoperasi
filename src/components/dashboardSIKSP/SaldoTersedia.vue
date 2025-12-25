<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-success-500/10 text-success-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <span v-if="isLoading" class="animate-spin h-4 w-4 border-2 border-brand-500 border-t-transparent rounded-full"></span>
      </div>

      <div>
        <h4 class="text-gray-500 text-theme-sm font-medium dark:text-gray-400">Kas Tersedia (Sisa Saldo)</h4>
        <div class="flex flex-col mt-1">
          <h2 :class="['text-3xl font-bold leading-tight', cashData.net_cash_available < 0 ? 'text-error-500' : 'text-gray-800 dark:text-white/90']">
            {{ formatCurrency(cashData.net_cash_available) }}
          </h2>
          
          <div class="mt-4">
            <div class="flex justify-between items-center mb-1">
              <span class="text-theme-xs text-gray-400">Rasio Likuiditas</span>
              <span class="text-theme-xs font-medium text-gray-700 dark:text-gray-300">{{ cashRatio }}%</span>
            </div>
            <div class="relative h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div 
                class="absolute left-0 top-0 h-full bg-success-500 transition-all duration-1000"
                :style="{ width: cashRatio + '%' }"
              ></div>
            </div>
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
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const userToken = localStorage.getItem('user_token')

const isLoading = ref(false)
const error = ref<string | null>(null)
const cashData = ref({
  total_cash: 0,
  loaned_out_value: 0,
  net_cash_available: 0
})

const formatCurrency = (value: any) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(parseFloat(value || 0))
}

const cashRatio = computed(() => {
  if (!cashData.value.total_cash || cashData.value.total_cash <= 0 || cashData.value.net_cash_available <= 0) return 0
  const ratio = (cashData.value.net_cash_available / cashData.value.total_cash) * 100
  return Math.max(0, Math.min(100, Math.round(ratio)))
})

const fetchCashSummary = async () => {
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
      cashData.value = response.data.data
    }
  } catch (err: any) {
    error.value = 'Gagal sinkronisasi saldo'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchCashSummary()
})
</script>
<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
  >
    <div class="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between sm:items-center">
      <div class="w-full">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Statistik Arus Kas</h3>
        <p class="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Visualisasi arus dana masuk dan keluar bulanan
        </p>
      </div>

      <div class="flex items-center z-10">
        <div class="relative w-full sm:w-auto">
          <select 
            v-model="selectedYear" 
            @change="fetchMonthlyStats"
            class="min-w-[150px] appearance-none cursor-pointer rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-brand-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option v-for="year in dynamicYears" :key="year" :value="year">
              Tahun {{ year }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 border-l border-gray-100 dark:border-gray-700 my-2">
            <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <div v-if="isLoading" class="flex flex-col items-center justify-center h-[310px] gap-3">
        <div class="animate-spin rounded-full h-8 w-8 border-4 border-brand-500 border-t-transparent"></div>
        <span class="text-xs text-gray-500 font-medium">Sinkronisasi data...</span>
      </div>
      <div v-else id="chartThree" class="-ml-4 min-w-[1000px] xl:min-w-full pl-2">
        <VueApexCharts type="area" height="310" :options="chartOptions" :series="series" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const selectedYear = ref(new Date().getFullYear());
const isLoading = ref(true);
const isDarkMode = ref(false);

// Deteksi mode gelap/terang dashboard
const checkTheme = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark');
};

const dynamicYears = computed(() => {
  const current = new Date().getFullYear();
  return [current, current - 1, current - 2];
});

const series = ref([
  { name: 'Pemasukan', data: [] },
  { name: 'Pengeluaran', data: [] },
])

// Konsep: Hilangkan properti 'theme' statis dari tooltip agar mengikuti global chart theme
const chartOptions = computed(() => ({
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'right',
    fontFamily: 'Outfit',
    fontWeight: 500,
    markers: { radius: 12, width: 10, height: 10 }
  },
  colors: ['#10B981', '#EF4444'], 
  chart: {
    fontFamily: 'Outfit, sans-serif',
    type: 'area',
    toolbar: { show: false },
    animations: { enabled: true, easing: 'easeinout', speed: 800 },
    // 🚀 Sync theme dengan mode dashboard agar teks tooltip otomatis kontras
    theme: {
      mode: isDarkMode.value ? 'dark' : 'light'
    }
  },
  fill: {
    type: 'gradient',
    gradient: {
      enabled: true,
      opacityFrom: 0.4,
      opacityTo: 0,
    },
  },
  stroke: { curve: 'smooth', width: 3 },
  dataLabels: { enabled: false },
  tooltip: {
    shared: true,
    intersect: false,
    // Kita biarkan ApexCharts mengatur warna background berdasarkan chart.theme.mode
    y: {
      formatter: (value: number) => {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0
        }).format(value);
      }
    }
  },
  xaxis: {
    type: 'category',
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
    labels: {
        style: { colors: isDarkMode.value ? '#9CA3AF' : '#6B7280' }
    }
  },
  yaxis: {
    labels: {
      style: { colors: isDarkMode.value ? '#9CA3AF' : '#6B7280', fontSize: '12px' },
      formatter: (value: number) => {
        if (value >= 1000000) return (value / 1000000).toFixed(1) + ' Jt';
        if (value === 0) return '0';
        return value.toLocaleString('id-ID');
      }
    }
  },
  grid: {
    borderColor: isDarkMode.value ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    strokeDashArray: 4,
  }
}));

const fetchMonthlyStats = async () => {
  isLoading.value = true;
  const token = localStorage.getItem('user_token');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/monthly-stats/`, {
      params: { year: selectedYear.value },
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "69420",
      }
    });

    if (response.data.success) {
      const stats = response.data.data;
      series.value = [
        { name: 'Pemasukan', data: stats.pemasukan },
        { name: 'Pengeluaran', data: stats.pengeluaran }
      ];
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
  } finally {
    setTimeout(() => { isLoading.value = false; }, 300); 
  }
}

onMounted(() => {
  checkTheme();
  fetchMonthlyStats();
  
  const observer = new MutationObserver(checkTheme);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
});
</script>
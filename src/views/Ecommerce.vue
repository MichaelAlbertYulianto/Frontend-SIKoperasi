<template>
  <admin-layout>
    <div class="grid grid-cols-12 gap-4 md:gap-6">
      
      <div class="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <saldo-tersedia />
        <total-asset />
        <saldo-dipinjamn />
        <pinjaman-aktif />
      </div>

      <div class="col-span-12">
        <chart-pengeluaran-pemasukan />
      </div>

      <!-- <div class="col-span-12 xl:col-span-5">
        <customer-demographic />
      </div>

      <div class="col-span-12 xl:col-span-7">
        <recent-orders />
      </div> -->
      
    </div>
  </admin-layout>
</template>

<script>
import AdminLayout from '../components/layout/AdminLayout.vue'
import EcommerceMetrics from '../components/ecommerce/EcommerceMetrics.vue'
import MonthlyTarget from '../components/ecommerce/MonthlySale.vue'
import MonthlySale from '../components/ecommerce/MonthlyTarget.vue'
import CustomerDemographic from '../components/ecommerce/CustomerDemographic.vue'
import StatisticsChart from '../components/ecommerce/StatisticsChart.vue'
import RecentOrders from '../components/ecommerce/RecentOrders.vue'
import SaldoTersedia from '@/components/dashboardSIKSP/SaldoTersedia.vue'
import PinjamanAktif from '@/components/dashboardSIKSP/PinjamanAktif.vue'
import SaldoDipinjamn from '@/components/dashboardSIKSP/SaldoDipinjamn.vue'
import TotalAsset from '@/components/dashboardSIKSP/TotalAsset.vue'
import ChartPengeluaranPemasukan from '@/components/dashboardSIKSP/ChartPengeluaranPemasukan.vue'

export default {
  components: {
    SaldoTersedia,
    ChartPengeluaranPemasukan,
    PinjamanAktif,
    SaldoDipinjamn,
    TotalAsset,
    AdminLayout,
    EcommerceMetrics,
    MonthlyTarget,
    MonthlySale,
    CustomerDemographic,
    StatisticsChart,
    RecentOrders,
  },
  name: 'Ecommerce',
}
</script>

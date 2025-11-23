import './assets/main.css'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import VueGoodTable from 'vue-good-table-next'; 
import 'vue-good-table-next/dist/vue-good-table-next.css';

const app = createApp(App)

app.use(router)
app.use(VueApexCharts)
app.use(VueGoodTable)
app.config.globalProperties.$swal = Swal;

app.mount('#app')

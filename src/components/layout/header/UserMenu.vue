<template>
  <div class="relative" ref="dropdownRef">
    <button class="flex items-center text-gray-700 dark:text-gray-400" @click.prevent="toggleDropdown">
      <span class="mr-3 overflow-hidden rounded-full h-11 w-11">
        <img src="/images/user/default.png" alt="/images/user/default.png" />
      </span>

      <span class="block mr-1 font-medium text-theme-sm">{{ currentUsername }}</span>

      <ChevronDownIcon :class="{ 'rotate-180': dropdownOpen }" />
    </button>

    <!-- Dropdown Start -->
    <div v-if="dropdownOpen"
      class="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark">
      <div>
        <span class="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
          {{ currentFullname }}
        </span>
        <span class="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
          {{ currentUsername }}
        </span>
      </div>

      <ul class="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
        <li v-for="item in menuItems" :key="item.href">
          <router-link :to="item.href"
            class="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">
            <!-- SVG icon would go here -->
            <component :is="item.icon" class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
            {{ item.text }}
          </router-link>
        </li>
      </ul>
      <router-link to="/signin" @click="signOut"
        class="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">
        <LogoutIcon class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
        Sign out
      </router-link>
    </div>
    <!-- Dropdown End -->
  </div>
</template>

<script setup>
import { UserCircleIcon, ChevronDownIcon, LogoutIcon, SettingsIcon, InfoCircleIcon } from '@/icons'
import { RouterLink } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import router from '@/router'
import axios from 'axios'

const dropdownOpen = ref(false)
const dropdownRef = ref(null)
const currentUsername = ref(localStorage.getItem('user_name') || 'Guest')
const currentFullname = ref(localStorage.getItem('nama_karyawan') || 'Guest User')
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL



const menuItems = [
  { href: '/profile', icon: UserCircleIcon, text: 'Edit profile' },
  { href: '/chat', icon: SettingsIcon, text: 'Account settings' },
  { href: '/profile', icon: InfoCircleIcon, text: 'Support' },
]

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const signOut = () => {
  localStorage.removeItem('user_token')
  localStorage.removeItem('user_name')
  localStorage.removeItem('user_role')
  localStorage.removeItem('nama_karyawan')
  localStorage.removeItem('current_user_id')

  router.push('/signin')
  closeDropdown()
}

const fetchUserProfile = async () => {
  const userToken = localStorage.getItem('user_token')
  if (!userToken) {
    console.warn('No user token found.')
    return
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })

    const profile = response.data.data

    currentFullname.value = profile.nama_karyawan
    localStorage.setItem('nama_karyawan', profile.nama_karyawan)
  } catch (error) {
    const status = error.response?.status
    if (status === 401 || status === 403) {
      console.warn('Unauthorized access. Redirecting to sign-in page.')
      signOut()
    } else {
      console.error('Error fetching user profile:', error)
    }
  }
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  fetchUserProfile()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

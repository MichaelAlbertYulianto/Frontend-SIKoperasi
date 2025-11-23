import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/signin',
      name: 'SignIn',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'SignIn',
        requiresAuth: false,
      },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Ecommerce.vue'),
      meta: {
        title: 'Dashboard',
        requiresAuth: true,
        roles: ['admin', 'ketua', 'sekretaris', 'bendahara', 'karyawan'],
      },
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: {
        title: 'Calendar',
        requiresAuth: true,
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: {
        title: 'Profile',
        requiresAuth: true,
      },
    },
    {
      path: '/form-elements',
      name: 'Form Elements',
      component: () => import('../views/Forms/FormElements.vue'),
      meta: {
        title: 'Form Elements',
        requiresAuth: true,
      },
    },
    {
      path: '/basic-tables',
      name: 'Basic Tables',
      component: () => import('../views/Tables/BasicTables.vue'),
      meta: {
        title: 'Basic Tables',
        requiresAuth: true,
      },
    },
    {
      path: '/line-chart',
      name: 'Line Chart',
      component: () => import('../views/Chart/LineChart/LineChart.vue'),
      meta: {
        title: 'Line Chart',
        requiresAuth: true,
      },
    },
    {
      path: '/bar-chart',
      name: 'Bar Chart',
      component: () => import('../views/Chart/BarChart/BarChart.vue'),
      meta: {
        title: 'Bar Chart',
        requiresAuth: true,
      },
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/UiElements/Alerts.vue'),
      meta: {
        title: 'Alerts',
        requiresAuth: true,
      },
    },
    {
      path: '/avatars',
      name: 'Avatars',
      component: () => import('../views/UiElements/Avatars.vue'),
      meta: {
        title: 'Avatars',
        requiresAuth: true,
      },
    },
    {
      path: '/badge',
      name: 'Badge',
      component: () => import('../views/UiElements/Badges.vue'),
      meta: {
        title: 'Badge',
        requiresAuth: true,
      },
    },

    {
      path: '/buttons',
      name: 'Buttons',
      component: () => import('../views/UiElements/Buttons.vue'),
      meta: {
        title: 'Buttons',
        requiresAuth: true,
      },
    },

    {
      path: '/images',
      name: 'Images',
      component: () => import('../views/UiElements/Images.vue'),
      meta: {
        title: 'Images',
        requiresAuth: true,
      },
    },
    {
      path: '/videos',
      name: 'Videos',
      component: () => import('../views/UiElements/Videos.vue'),
      meta: {
        title: 'Videos',
        requiresAuth: true,
      },
    },
    {
      path: '/blank',
      name: 'Blank',
      component: () => import('../views/Pages/BlankPage.vue'),
      meta: {
        title: 'Blank',
        requiresAuth: true,
      },
    },

    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
        requiresAuth: false,
      },
    },

    {
      path: '/pendingan-pinjaman',
      name: 'Pendingan Pinjaman',
      component: () => import('../views/Pages/PendingPage.vue'),
      meta: {
        title: 'Pendingan Pinjaman',
        requiresAuth: true,
        roles: ['admin', 'ketua', 'sekretaris', 'bendahara'],
      },
    },
    {
      path: '/users-management',
      name: 'Users Management',
      component: () => import('../views/Pages/UsersPage.vue'),
      meta: {
        title: 'Users Management',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/user-edit/:id',
      name: 'User Edit',
      component: () => import('../views/Pages/UserEditPage.vue'),
      meta: {
        title: 'User Edit',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/log',
      name: 'Log',
      component: () => import('../views/Pages/Log.vue'),
      meta: {
        title: 'Log',
        requiresAuth: true,
        roles: ['admin'],
      },
    },

    // {
    //   path: '/signin',
    //   name: 'Signin',
    //   component: () => import('../views/Auth/Signin.vue'),
    //   meta: {
    //     title: 'Signin',
    //   },
    // },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/Auth/Signup.vue'),
      meta: {
        title: 'Signup',
      },
    },
  ],
})

export default router

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | Sistem Informasi Koperasi Simpanan dan Pinjaman Central Sakti`

  const isAuthenticated = !!localStorage.getItem('user_token')
  const userRole = localStorage.getItem('user_role')
  const requiredAuth = to.meta.requiresAuth
  const requiredRoles = to.meta.roles

  if (requiredAuth && !isAuthenticated) {
    next({ name: 'SignIn' })
    return
  }

  if (requiredAuth && Array.isArray(requiredRoles) && requiredRoles.length > 0) {
    if (userRole && !requiredRoles.includes(userRole)) {

      next({ name: 'Dashboard' })
      return
    }
  }

  if (!requiredAuth && isAuthenticated) {
        next({ name: 'Dashboard' })
        return
    }

  next()
})

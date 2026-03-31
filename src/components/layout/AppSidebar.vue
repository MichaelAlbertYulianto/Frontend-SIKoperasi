<template>
  <aside
    :class="[
      'fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-99999 border-r border-gray-200',
      {
        'lg:w-[290px]': isExpanded || isMobileOpen || isHovered,
        'lg:w-[90px]': !isExpanded && !isHovered,
        'translate-x-0 w-[290px]': isMobileOpen,
        '-translate-x-full': !isMobileOpen,
        'lg:translate-x-0': true,
      },
    ]"
    @mouseenter="!isExpanded && (isHovered = true)"
    @mouseleave="isHovered = false"
  >
    <div
      :class="[
        'py-8 flex',
        !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
      ]"
    >
      <router-link to="/">
        <img
          v-if="isExpanded || isHovered || isMobileOpen"
          class="dark:hidden"
          src="/images/logo/Home_Logo.png"
          alt="Logo"
          width="200"
          height="20"
        />
        <img
          v-if="isExpanded || isHovered || isMobileOpen"
          class="hidden dark:block"
          src="/images/logo/Home_Logo.png"
          alt="Logo"
          width="200"
          height="20"
        />
        <img
          v-else
          src="/images/logo/Central_Logo.png"
          alt="Logo"
          width="32"
          height="32"
        />
      </router-link>
    </div>
    <div
      class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar"
    >
      <nav class="mb-6">
        <div class="flex flex-col gap-4">
          <div v-for="(menuGroup, groupIndex) in filteredMenuGroups" :key="groupIndex">
            <h2
              :class="[
                'mb-4 text-xs uppercase flex leading-[20px] text-gray-400',
                !isExpanded && !isHovered
                  ? 'lg:justify-center'
                  : 'justify-start',
              ]"
            >
              <template v-if="isExpanded || isHovered || isMobileOpen">
                {{ menuGroup.title }}
              </template>
              <HorizontalDots v-else />
            </h2>
            <ul class="flex flex-col gap-4">
              <li v-for="(item, index) in menuGroup.items" :key="item.name">
                <button
                  v-if="item.subItems"
                  @click="toggleSubmenu(groupIndex, index)"
                  :class="[
                    'menu-item group w-full',
                    {
                      'menu-item-active': isSubmenuOpen(groupIndex, index),
                      'menu-item-inactive': !isSubmenuOpen(groupIndex, index),
                    },
                    !isExpanded && !isHovered
                      ? 'lg:justify-center'
                      : 'lg:justify-start',
                  ]"
                >
                  <span
                    :class="[
                      isSubmenuOpen(groupIndex, index)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text"
                    >{{ item.name }}</span
                  >
                  <ChevronDownIcon
                    v-if="isExpanded || isHovered || isMobileOpen"
                    :class="[
                      'ml-auto w-5 h-5 transition-transform duration-200',
                      {
                        'rotate-180 text-brand-500': isSubmenuOpen(
                          groupIndex,
                          index
                        ),
                      },
                    ]"
                  />
                </button>
                <router-link
                  v-else-if="item.path"
                  :to="item.path"
                  :class="[
                    'menu-item group',
                    {
                      'menu-item-active': isActive(item.path),
                      'menu-item-inactive': !isActive(item.path),
                    },
                  ]"
                >
                  <span
                    :class="[
                      isActive(item.path)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text"
                    >{{ item.name }}</span
                  >
                </router-link>
                <transition
                  @enter="startTransition"
                  @after-enter="endTransition"
                  @before-leave="startTransition"
                  @after-leave="endTransition"
                >
                  <div
                    v-show="
                      isSubmenuOpen(groupIndex, index) &&
                      (isExpanded || isHovered || isMobileOpen)
                    "
                  >
                    <ul class="mt-2 space-y-1 ml-9">
                      <li v-for="subItem in item.subItems" :key="subItem.name">
                        <router-link
                          :to="subItem.path"
                          :class="[
                            'menu-dropdown-item',
                            {
                              'menu-dropdown-item-active': isActive(
                                subItem.path
                              ),
                              'menu-dropdown-item-inactive': !isActive(
                                subItem.path
                              ),
                            },
                          ]"
                        >
                          {{ subItem.name }}
                          <span class="flex items-center gap-1 ml-auto">
                            <span
                              v-if="subItem.new"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(
                                    subItem.path
                                  ),
                                  'menu-dropdown-badge-inactive': !isActive(
                                    subItem.path
                                  ),
                                },
                              ]"
                            >
                              new
                            </span>
                            <span
                              v-if="subItem.pro"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(
                                    subItem.path
                                  ),
                                  'menu-dropdown-badge-inactive': !isActive(
                                    subItem.path
                                  ),
                                },
                              ]"
                            >
                              pro
                            </span>
                          </span>
                        </router-link>
                      </li>
                    </ul>
                  </div>
                </transition>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <!-- <SidebarWidget v-if="isExpanded || isHovered || isMobileOpen" /> -->
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";

import {
  GridIcon,
  CalenderIcon,
  UserCircleIcon,
  ChatIcon,
  MailIcon,
  DocsIcon,
  PieChartIcon,
  ChevronDownIcon,
  HorizontalDots,
  PageIcon,
  TableIcon,
  ListIcon,
  PlugInIcon,
  UserGroupIcon
} from "../../icons";
import SidebarWidget from "./SidebarWidget.vue";
import BoxCubeIcon from "@/icons/BoxCubeIcon.vue";
import { useSidebar } from "@/composables/useSidebar";
import MenuIcon from "@/icons/MenuIcon.vue";
import ArchiveIcon from "@/icons/ArchiveIcon.vue";
import HomePageIcon from "@/icons/HomePageIcon.vue";
import AjukanPinjamanIcon from "@/icons/AjukanPinjamanIcon.vue";
import PinjamanAktifIcon from "@/icons/PinjamanAktifIcon.vue";
import TransaksiIcon from "@/icons/TransaksiIcon.vue";


const route = useRoute();
const userRole = computed(() => {
    const role = localStorage.getItem('user_role');
    return role ? role.toLowerCase() : 'guest';
});

const { isExpanded, isMobileOpen, isHovered, openSubmenu } = useSidebar();

const menuGroups = [
  {
    title: "Menu Pengurus",
    items: [
      {
        icon: GridIcon,
        name: "Dashboard",
        path: "/dashboard",
      },
      {
        icon: MailIcon,
        name: "Pendingan Pinjaman",
        path: "/pendingan-pinjaman",
      },
      {
        icon: CalenderIcon,
        name: "History Pinjaman",
        path: "/history-pinjaman",
      }
    ],
  },
  {
    title: "Pencairan & Pelunasan",
    items: [
      {
        icon: ArchiveIcon,
        name: "Pencairan Pinjaman",
        path: "/pencairan-pinjaman",
      },
      {
        icon: PinjamanAktifIcon,
        name: "Pembayaran Angsuran",
        path: "/pinjaman-aktif",
      }
    ]
  },
  {
    title: "Iuran Anggota",
    items: [
      {
        icon: BoxCubeIcon,
        name: "Simpanan",
        path: "/simpanan",
      },
      {
        icon: PlugInIcon,
        name: "Penarikan Simpanan",
        path: "/penarikan-simpanan",
      }
    ]
  },
  {
    title: "Transaksi",
    items: [
      {
        icon: TransaksiIcon,
        name: "Transaksi",
        path: "/transaksi",
      },
    ]
  },
  {
    title: "Administration",
    items: [
      {
        icon: UserGroupIcon,
        name: "Users Management",
        path: "/users-management",
      },
      {
        icon: DocsIcon,
        name: "Log",
        path: "/log",
      },
      {
        icon: PageIcon,
        name: "Karyawan Management",
        path: "/karyawan",
      }
    ]
  },
  {
    title: "Karyawan Menu",
    items: [
      {
        icon: HomePageIcon,
        name: "Homepage",
        path: "/homepage",
      },
      {
        icon: AjukanPinjamanIcon,
        name: "Ajukan Pinjaman",
        path: "/pengajuan-pinjaman",
      },
      {
        icon: ListIcon,
        name: "List Angsuran",
        path: "/ListAngsuran",
      },
    ]
  }
];

const isAllowed = (role, allowedRoles) => allowedRoles.includes(role);
const filteredMenuGroups = computed(() => {
    return menuGroups
        .map(group => {
            let isGroupVisible = false;

            if (group.title === "Menu Pengurus"|| group.title === "Transaksi") {
                const allowed = ['ketua', 'bendahara', 'sekretaris', 'admin'];
                isGroupVisible = isAllowed(userRole.value, allowed);
            } else if (group.title === "Administration") {
                const allowed = ['admin'];
                isGroupVisible = isAllowed(userRole.value, allowed);
            } else if (group.title === "Karyawan Menu") {
                const allowed = ['karyawan'];
                isGroupVisible = isAllowed(userRole.value, allowed);
            } else if (group.title === "Pencairan & Pelunasan" || group.title === "Iuran Anggota") {
                const allowed = ['bendahara'];
                isGroupVisible = isAllowed(userRole.value, allowed);
            }

            if (!isGroupVisible) {
                return null;
            }

            return group;
        })
        .filter(group => group !== null);
});

const isActive = (path) => route.path === path;

const toggleSubmenu = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`;
  openSubmenu.value = openSubmenu.value === key ? null : key;
};

const isAnySubmenuRouteActive = computed(() => {
  return menuGroups.some((group) =>
    group.items.some(
      (item) =>
        item.subItems && item.subItems.some((subItem) => isActive(subItem.path))
    )
  );
});


const isSubmenuOpen = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`;
  return (
    openSubmenu.value === key ||
    (isAnySubmenuRouteActive.value &&
      menuGroups[groupIndex].items[itemIndex].subItems?.some((subItem) =>
        isActive(subItem.path)
      ))
  );
};

const startTransition = (el) => {
  el.style.height = "auto";
  const height = el.scrollHeight;
  el.style.height = "0px";
  el.offsetHeight; // force reflow
  el.style.height = height + "px";
};

const endTransition = (el) => {
  el.style.height = "";
};
</script>

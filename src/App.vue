<script setup>
import { computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useAppStore } from './stores/app'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const showNav = computed(() => route.meta?.requiresAuth)

async function loadData() {
  if (authStore.user) {
    await appStore.loadChildren()
    await appStore.loadChildData()
  }
}

onMounted(loadData)

watch(() => authStore.user, async (user) => {
  if (user) {
    await loadData()
  } else {
    appStore.reset()
    router.push('/login')
  }
})
</script>

<template>
  <div class="min-h-svh bg-amber-50">
    <router-view />
    <BottomNav v-if="showNav" />
  </div>
</template>

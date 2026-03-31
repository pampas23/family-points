<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { path: '/', icon: '🏠', label: '首頁' },
  { path: '/calendar', icon: '📅', label: '月曆' },
  { path: '/goals', icon: '🎯', label: '目標' },
  { path: '/settings', icon: '⚙️', label: '設定' },
]
</script>

<template>
  <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t-2 border-orange-100 shadow-lg">
    <div class="flex">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="flex-1 flex flex-col items-center py-2 text-gray-400 transition-colors"
        :class="route.path === tab.path ? 'text-orange-500' : 'hover:text-orange-300'"
      >
        <span class="text-2xl leading-none">{{ tab.icon }}</span>
        <span class="text-xs mt-1 font-medium">{{ tab.label }}</span>
      </router-link>
    </div>
  </nav>
  <!-- spacer -->
  <div class="h-16" />
</template>

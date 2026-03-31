<script setup>
import { computed } from 'vue'
import { useAppStore } from '../stores/app'

const props = defineProps({
  date: String, // 'YYYY-MM-DD'
})
const emit = defineEmits(['close'])
const appStore = useAppStore()

const records = computed(() => {
  if (!props.date) return []
  return (appStore.recordsByDate[props.date] || []).slice().sort((a, b) =>
    new Date(b.created_at) - new Date(a.created_at)
  )
})

const displayDate = computed(() => {
  if (!props.date) return ''
  const [y, m, d] = props.date.split('-')
  return `${y} 年 ${parseInt(m)} 月 ${parseInt(d)} 日`
})

const netPoints = computed(() =>
  records.value.reduce((s, r) => s + r.points, 0)
)
</script>

<template>
  <div
    class="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-[480px] bg-white rounded-t-3xl p-6 max-h-[70vh] flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="font-bold text-gray-800">📅 {{ displayDate }}</h3>
          <p class="text-sm" :class="netPoints >= 0 ? 'text-green-600' : 'text-red-500'">
            當日合計：{{ netPoints > 0 ? '+' : '' }}{{ netPoints }} 點
          </p>
        </div>
        <button @click="emit('close')" class="text-gray-400 text-xl">✕</button>
      </div>

      <div class="overflow-y-auto flex-1">
        <div v-if="records.length === 0" class="text-center text-gray-400 py-8">
          這天沒有記錄
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="record in records"
            :key="record.id"
            class="flex items-center justify-between bg-gray-50 rounded-xl p-3"
          >
            <span class="text-gray-700 text-sm">{{ record.item_name }}</span>
            <span
              class="font-bold text-sm px-2 py-0.5 rounded-full"
              :class="record.points > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'"
            >
              {{ record.points > 0 ? '+' : '' }}{{ record.points }} 點
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

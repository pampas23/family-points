<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import DayDetailModal from '../components/DayDetailModal.vue'

const appStore = useAppStore()

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth()) // 0-indexed

const selectedDate = ref(null)

const monthLabel = computed(() => {
  return `${currentYear.value} 年 ${currentMonth.value + 1} 月`
})

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// Generate calendar grid (days array, null = empty cell)
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
})

function dateKey(day) {
  const m = String(currentMonth.value + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${currentYear.value}-${m}-${d}`
}

function dayPoints(day) {
  const key = dateKey(day)
  const records = appStore.recordsByDate[key] || []
  return records.reduce((s, r) => s + r.points, 0)
}

function isToday(day) {
  const t = new Date()
  return (
    day === t.getDate() &&
    currentMonth.value === t.getMonth() &&
    currentYear.value === t.getFullYear()
  )
}

function selectDay(day) {
  if (!day) return
  selectedDate.value = dateKey(day)
}

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']
</script>

<template>
  <div class="pb-4">
    <!-- Header -->
    <div class="bg-gradient-to-r from-purple-500 to-pink-400 px-4 pt-10 pb-6 rounded-b-3xl shadow-md">
      <h1 class="text-white font-bold text-lg mb-4">📅 月曆記錄</h1>

      <!-- Month navigation -->
      <div class="flex items-center justify-between bg-white/20 rounded-2xl px-4 py-2">
        <button @click="prevMonth" class="text-white text-xl font-bold px-2">‹</button>
        <span class="text-white font-bold">{{ monthLabel }}</span>
        <button @click="nextMonth" class="text-white text-xl font-bold px-2">›</button>
      </div>
    </div>

    <div class="mx-4 mt-5 bg-white rounded-3xl shadow-sm p-4">
      <!-- Week headers -->
      <div class="grid grid-cols-7 mb-2">
        <div
          v-for="w in weekLabels"
          :key="w"
          class="text-center text-xs font-bold py-1"
          :class="w === '日' ? 'text-red-400' : w === '六' ? 'text-blue-400' : 'text-gray-400'"
        >{{ w }}</div>
      </div>

      <!-- Days grid -->
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="(day, idx) in calendarDays"
          :key="idx"
          class="aspect-square flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all"
          :class="[
            day ? 'hover:bg-orange-50 active:scale-95' : '',
            isToday(day) ? 'ring-2 ring-orange-400' : '',
          ]"
          @click="selectDay(day)"
        >
          <template v-if="day">
            <span
              class="text-xs font-bold leading-none"
              :class="(idx % 7 === 0) ? 'text-red-400' : (idx % 7 === 6) ? 'text-blue-400' : 'text-gray-700'"
            >{{ day }}</span>
            <span
              v-if="dayPoints(day) !== 0"
              class="text-[10px] font-bold mt-0.5 leading-none"
              :class="dayPoints(day) > 0 ? 'text-green-500' : 'text-red-400'"
            >{{ dayPoints(day) > 0 ? '+' : '' }}{{ dayPoints(day) }}</span>
          </template>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="mx-4 mt-3 flex gap-4 text-xs text-gray-500">
      <span class="flex items-center gap-1"><span class="text-green-500 font-bold">+數字</span> 加點</span>
      <span class="flex items-center gap-1"><span class="text-red-400 font-bold">-數字</span> 扣點</span>
      <span class="flex items-center gap-1"><span class="ring-2 ring-orange-400 rounded px-1">今天</span></span>
    </div>

    <!-- Day Detail Modal -->
    <DayDetailModal
      v-if="selectedDate"
      :date="selectedDate"
      @close="selectedDate = null"
    />
  </div>
</template>

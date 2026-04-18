<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useAppStore } from '../stores/app'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const actionLoading = ref(null) // item id being toggled
const errorMsg = ref('')

// 快速新增手動記錄
const showQuickAdd = ref(false)
const quickName = ref('')
const quickPoints = ref(1)
const quickLoading = ref(false)

async function submitQuickAdd() {
  if (!quickName.value.trim() || !quickPoints.value) return
  quickLoading.value = true
  try {
    await appStore.addPointRecord(null, quickName.value.trim(), Number(quickPoints.value), null)
    quickName.value = ''
    quickPoints.value = 1
    showQuickAdd.value = false
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    quickLoading.value = false
  }
}

const childColors = {
  orange: 'bg-orange-400',
  pink: 'bg-pink-400',
  purple: 'bg-purple-400',
  green: 'bg-green-400',
  blue: 'bg-blue-400',
  teal: 'bg-teal-400',
}

const dailyItems = computed(() =>
  appStore.pointItems.filter(i => i.item_type === 'daily')
)
const manualItems = computed(() =>
  appStore.pointItems.filter(i => i.item_type === 'manual')
)

const today = computed(() => {
  const d = new Date()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日（週${weekdays[d.getDay()]}）`
})

async function toggleDaily(item) {
  actionLoading.value = item.id
  try {
    await appStore.toggleDailyItem(item)
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    actionLoading.value = null
  }
}

async function addManual(item) {
  actionLoading.value = item.id
  showManualModal.value = false
  try {
    await appStore.addPointRecord(item.id, item.name, item.points, null)
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    actionLoading.value = null
  }
}

async function logout() {
  await authStore.signOut()
  router.push('/login')
}
</script>

<template>
  <div class="pb-4">
    <!-- Header -->
    <div class="bg-gradient-to-r from-orange-500 to-amber-400 px-4 pt-10 pb-6 rounded-b-3xl shadow-md">
      <div class="flex justify-between items-start mb-4">
        <h1 class="text-white font-bold text-lg">🌟 集點大冒險</h1>
        <button @click="logout" class="text-orange-100 text-sm hover:text-white">登出</button>
      </div>

      <!-- Child Selector -->
      <div v-if="appStore.children.length > 0" class="flex gap-2 flex-wrap mb-4">
        <button
          v-for="child in appStore.children"
          :key="child.id"
          @click="appStore.switchChild(child.id)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all"
          :class="appStore.currentChildId === child.id
            ? 'bg-white text-orange-600 shadow-md scale-105'
            : 'bg-orange-400/50 text-white'"
        >
          <span
            class="w-5 h-5 rounded-full inline-block"
            :class="childColors[child.color] || 'bg-orange-300'"
          ></span>
          {{ child.name }}
        </button>
        <button
          @click="router.push('/settings')"
          class="px-3 py-1.5 rounded-full text-sm font-bold bg-orange-400/50 text-white"
        >+ 新增</button>
      </div>

      <!-- Points Display -->
      <div v-if="appStore.currentChild" class="bg-white/20 rounded-2xl p-4 text-center">
        <p class="text-orange-100 text-sm">目前點數</p>
        <p class="text-5xl font-bold text-white mt-1">
          ⭐ {{ appStore.totalPoints }}
        </p>
        <p class="text-orange-100 text-xs mt-1">{{ today }}</p>
      </div>

      <!-- No children yet -->
      <div v-else class="bg-white/20 rounded-2xl p-4 text-center">
        <p class="text-white text-sm">還沒有小孩資料</p>
        <button
          @click="router.push('/settings')"
          class="mt-2 bg-white text-orange-600 font-bold text-sm px-4 py-2 rounded-full"
        >前往設定新增</button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="mx-4 mt-3 bg-red-100 text-red-600 text-sm rounded-xl p-3 flex justify-between">
      <span>⚠️ {{ errorMsg }}</span>
      <button @click="errorMsg = ''" class="ml-2 font-bold">✕</button>
    </div>

    <!-- Loading -->
    <div v-if="appStore.loading" class="text-center py-8 text-orange-400">
      載入中...
    </div>

    <template v-else-if="appStore.currentChild">
      <!-- Daily Checklist -->
      <div class="mx-4 mt-5">
        <h2 class="font-bold text-gray-700 mb-3">📋 今日打卡</h2>

        <div v-if="dailyItems.length === 0" class="text-gray-400 text-sm text-center py-4 bg-white rounded-2xl">
          還沒有日常項目，前往設定新增吧！
        </div>

        <div v-else class="space-y-2">
          <button
            v-for="item in dailyItems"
            :key="item.id"
            @click="toggleDaily(item)"
            :disabled="actionLoading === item.id"
            class="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm active:scale-98 transition-all"
            :class="appStore.todayCheckedItemIds.has(item.id) ? 'border-2 border-green-400' : 'border-2 border-transparent'"
          >
            <span class="text-2xl">
              {{ appStore.todayCheckedItemIds.has(item.id) ? '✅' : '⬜' }}
            </span>
            <span class="flex-1 text-left font-medium text-gray-700">{{ item.name }}</span>
            <span
              class="font-bold text-sm px-2 py-1 rounded-full"
              :class="item.points > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'"
            >
              {{ item.points > 0 ? '+' : '' }}{{ item.points }} 點
            </span>
          </button>
        </div>
      </div>

      <!-- Manual Items -->
      <div class="mx-4 mt-5">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-bold text-gray-700">✨ 手動記錄</h2>
          <button
            @click="showQuickAdd = !showQuickAdd"
            class="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            :class="showQuickAdd ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'"
          >{{ showQuickAdd ? '✕ 關閉' : '＋ 快速新增' }}</button>
        </div>

        <!-- 快速新增表單 -->
        <div v-if="showQuickAdd" class="bg-white rounded-2xl p-4 shadow-sm mb-3 border-2 border-orange-200">
          <p class="text-xs font-bold text-orange-500 mb-3">⚡ 快速新增記錄</p>
          <input
            v-model="quickName"
            placeholder="記錄名稱，例如：表現很棒"
            class="w-full border-2 border-orange-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:border-orange-400"
            @keyup.enter="submitQuickAdd"
          />
          <div class="flex gap-2 mb-3">
            <div class="flex-1">
              <p class="text-xs text-gray-500 mb-1">點數（負數為扣點）</p>
              <input
                v-model="quickPoints"
                type="number"
                class="w-full border-2 border-orange-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
            <div class="flex items-end">
              <span
                class="px-3 py-2 rounded-xl text-sm font-bold"
                :class="Number(quickPoints) >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'"
              >{{ Number(quickPoints) > 0 ? '+' : '' }}{{ quickPoints }} 點</span>
            </div>
          </div>
          <button
            @click="submitQuickAdd"
            :disabled="quickLoading || !quickName.trim()"
            class="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold text-sm disabled:opacity-50"
          >{{ quickLoading ? '新增中...' : '✅ 確認新增' }}</button>
        </div>

        <div v-if="manualItems.length === 0 && !showQuickAdd" class="text-gray-400 text-sm text-center py-4 bg-white rounded-2xl">
          點上方「快速新增」直接記錄，或前往設定建立固定項目
        </div>

        <div v-if="manualItems.length > 0" class="space-y-2">
          <div
            v-for="item in manualItems"
            :key="item.id"
            class="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm"
          >
            <span class="flex-1 font-medium text-gray-700">{{ item.name }}</span>
            <span
              class="font-bold text-sm px-2 py-1 rounded-full mr-2"
              :class="item.points > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'"
            >
              {{ item.points > 0 ? '+' : '' }}{{ item.points }} 點
            </span>
            <button
              @click="addManual(item)"
              :disabled="actionLoading === item.id"
              class="w-9 h-9 rounded-full font-bold text-white flex items-center justify-center shadow active:scale-90 transition-transform disabled:opacity-50"
              :class="item.points > 0 ? 'bg-green-500' : 'bg-red-400'"
            >
              {{ item.points > 0 ? '+' : '−' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

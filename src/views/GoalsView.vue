<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import { useRouter } from 'vue-router'

const appStore = useAppStore()
const router = useRouter()

const redeemingId = ref(null)
const successMsg = ref('')
const errorMsg = ref('')

const today = new Date().toISOString().split('T')[0]

function isExpired(goal) {
  return goal.expires_at && goal.expires_at < today
}

function isLimitReached(goal) {
  return goal.quantity_limit !== null && goal.quantity_used >= goal.quantity_limit
}

function canRedeem(goal) {
  return (
    appStore.totalPoints >= goal.required_points &&
    !isExpired(goal) &&
    !isLimitReached(goal)
  )
}

function remaining(goal) {
  return Math.max(0, goal.required_points - appStore.totalPoints)
}

function daysUntilExpiry(goal) {
  if (!goal.expires_at) return null
  const diff = Math.ceil((new Date(goal.expires_at) - new Date(today)) / 86400000)
  return diff
}

async function redeem(goal) {
  errorMsg.value = ''
  successMsg.value = ''
  redeemingId.value = goal.id
  try {
    await appStore.redeemGoal(goal)
    successMsg.value = `🎉 兌換「${goal.name}」成功！`
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    redeemingId.value = null
  }
}

const progressPercent = (goal) => {
  if (appStore.totalPoints >= goal.required_points) return 100
  return Math.round((appStore.totalPoints / goal.required_points) * 100)
}
</script>

<template>
  <div class="pb-4">
    <!-- Header -->
    <div class="bg-gradient-to-r from-purple-500 to-indigo-400 px-4 pt-10 pb-6 rounded-b-3xl shadow-md">
      <h1 class="text-white font-bold text-lg mb-1">🎯 我的目標</h1>
      <p class="text-purple-200 text-sm">目前點數：⭐ {{ appStore.totalPoints }} 點</p>
    </div>

    <!-- Messages -->
    <div v-if="successMsg" class="mx-4 mt-3 bg-green-100 text-green-700 text-sm rounded-xl p-3 text-center font-bold">
      {{ successMsg }}
    </div>
    <div v-if="errorMsg" class="mx-4 mt-3 bg-red-100 text-red-600 text-sm rounded-xl p-3 flex justify-between">
      <span>⚠️ {{ errorMsg }}</span>
      <button @click="errorMsg = ''" class="ml-2 font-bold">✕</button>
    </div>

    <!-- No child selected -->
    <div v-if="!appStore.currentChild" class="text-center py-12 text-gray-400">
      <p>請先在設定中新增小孩</p>
      <button @click="router.push('/settings')" class="mt-3 bg-purple-500 text-white px-5 py-2 rounded-full text-sm font-bold">前往設定</button>
    </div>

    <template v-else>
      <div v-if="appStore.loading" class="text-center py-8 text-purple-400">載入中...</div>

      <div v-else-if="appStore.goals.length === 0" class="text-center py-12 text-gray-400">
        <div class="text-5xl mb-3">🎁</div>
        <p class="text-gray-500">還沒有目標，前往設定新增吧！</p>
        <button @click="router.push('/settings')" class="mt-4 bg-purple-500 text-white px-5 py-2 rounded-full text-sm font-bold">前往設定</button>
      </div>

      <div v-else class="mx-4 mt-5 space-y-4">
        <div
          v-for="goal in appStore.goals"
          :key="goal.id"
          class="bg-white rounded-3xl shadow-sm p-5"
          :class="isExpired(goal) || isLimitReached(goal) ? 'opacity-60' : ''"
        >
          <!-- Goal name & status badges -->
          <div class="flex items-start justify-between mb-3">
            <h3 class="font-bold text-gray-800 text-base">🎁 {{ goal.name }}</h3>
            <div class="flex flex-col items-end gap-1">
              <span v-if="isExpired(goal)" class="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">已過期</span>
              <span v-else-if="isLimitReached(goal)" class="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">已達上限</span>
              <span v-else-if="daysUntilExpiry(goal) !== null && daysUntilExpiry(goal) <= 7" class="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full">
                剩 {{ daysUntilExpiry(goal) }} 天
              </span>
            </div>
          </div>

          <!-- Points info -->
          <div class="flex items-center gap-3 mb-3">
            <div class="text-sm text-gray-500">需要 <span class="font-bold text-purple-600">{{ goal.required_points }}</span> 點</div>
            <div v-if="remaining(goal) > 0" class="text-sm text-orange-500 font-bold">還差 {{ remaining(goal) }} 點</div>
            <div v-else class="text-sm text-green-600 font-bold">✓ 點數足夠！</div>
          </div>

          <!-- Progress bar -->
          <div class="w-full bg-gray-100 rounded-full h-3 mb-3 overflow-hidden">
            <div
              class="h-3 rounded-full transition-all duration-500"
              :class="progressPercent(goal) >= 100 ? 'bg-green-400' : 'bg-purple-400'"
              :style="{ width: progressPercent(goal) + '%' }"
            ></div>
          </div>

          <!-- Meta info -->
          <div class="flex gap-3 text-xs text-gray-400 mb-4">
            <span v-if="goal.quantity_limit !== null">
              🔢 剩餘 {{ goal.quantity_limit - goal.quantity_used }} / {{ goal.quantity_limit }} 次
            </span>
            <span v-if="goal.expires_at">
              📅 到期 {{ goal.expires_at }}
            </span>
          </div>

          <!-- Redeem button -->
          <button
            @click="redeem(goal)"
            :disabled="!canRedeem(goal) || redeemingId === goal.id"
            class="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:cursor-not-allowed"
            :class="canRedeem(goal)
              ? 'bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-md'
              : 'bg-gray-100 text-gray-400'"
          >
            {{ redeemingId === goal.id ? '兌換中...' : (canRedeem(goal) ? '🎉 立刻兌換！' : '點數不足') }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

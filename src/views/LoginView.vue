<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function submit() {
  errorMsg.value = ''
  loading.value = true
  try {
    if (isLogin.value) {
      await authStore.signIn(email.value, password.value)
    } else {
      await authStore.signUp(email.value, password.value)
    }
    router.push('/')
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-svh bg-gradient-to-b from-orange-400 to-amber-300 flex flex-col items-center justify-center p-6">
    <!-- Logo -->
    <div class="text-center mb-8">
      <div class="text-7xl mb-3">🧙</div>
      <h1 class="text-3xl font-bold text-white drop-shadow">哈利波特集點卡</h1>
      <p class="text-orange-100 mt-1">努力就有獎勵！</p>
    </div>

    <!-- Card -->
    <div class="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6">
      <!-- Toggle -->
      <div class="flex bg-orange-100 rounded-2xl p-1 mb-6">
        <button
          class="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
          :class="isLogin ? 'bg-orange-500 text-white shadow' : 'text-orange-400'"
          @click="isLogin = true"
        >登入</button>
        <button
          class="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
          :class="!isLogin ? 'bg-orange-500 text-white shadow' : 'text-orange-400'"
          @click="isLogin = false"
        >註冊</button>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-gray-600 mb-1">📧 電子郵件</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="parent@example.com"
            class="w-full border-2 border-orange-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-orange-400 text-gray-700"
          />
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-600 mb-1">🔒 密碼</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="至少 6 個字元"
            minlength="6"
            class="w-full border-2 border-orange-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-orange-400 text-gray-700"
          />
        </div>

        <p v-if="errorMsg" class="text-red-500 text-sm text-center bg-red-50 rounded-xl py-2 px-3">
          ⚠️ {{ errorMsg }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold py-3 rounded-2xl shadow-md active:scale-95 transition-transform disabled:opacity-60"
        >
          {{ loading ? '處理中...' : (isLogin ? '🚀 登入' : '🎉 註冊帳號') }}
        </button>
      </form>
    </div>
  </div>
</template>

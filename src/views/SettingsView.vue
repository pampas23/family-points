<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()
const activeTab = ref('children') // 'children' | 'items' | 'goals'

// ── Children ─────────────────────────────────────────────
const showAddChild = ref(false)
const newChildName = ref('')
const newChildColor = ref('orange')
const childLoading = ref(false)
const childError = ref('')

// 編輯小孩
const editingChildId = ref(null)
const editingChildName = ref('')
const editingChildColor = ref('orange')

function startEdit(child) {
  editingChildId.value = child.id
  editingChildName.value = child.name
  editingChildColor.value = child.color
}

function cancelEdit() {
  editingChildId.value = null
}

async function saveEdit() {
  if (!editingChildName.value.trim()) return
  childLoading.value = true
  childError.value = ''
  try {
    await appStore.updateChild(editingChildId.value, editingChildName.value.trim(), editingChildColor.value)
    editingChildId.value = null
  } catch (e) {
    childError.value = e.message
  } finally {
    childLoading.value = false
  }
}

const colorOptions = [
  { value: 'orange', label: '橘色', cls: 'bg-orange-400' },
  { value: 'pink', label: '粉紅', cls: 'bg-pink-400' },
  { value: 'purple', label: '紫色', cls: 'bg-purple-400' },
  { value: 'green', label: '綠色', cls: 'bg-green-400' },
  { value: 'blue', label: '藍色', cls: 'bg-blue-400' },
  { value: 'teal', label: '青色', cls: 'bg-teal-400' },
]

const colorMap = Object.fromEntries(colorOptions.map(c => [c.value, c.cls]))

async function addChild() {
  if (!newChildName.value.trim()) return
  childLoading.value = true
  childError.value = ''
  try {
    await appStore.addChild(newChildName.value.trim(), newChildColor.value)
    newChildName.value = ''
    newChildColor.value = 'orange'
    showAddChild.value = false
  } catch (e) {
    childError.value = e.message
  } finally {
    childLoading.value = false
  }
}

async function deleteChild(id, name) {
  if (!confirm(`確定要刪除「${name}」嗎？所有記錄也會一起刪除。`)) return
  try {
    await appStore.deleteChild(id)
  } catch (e) {
    childError.value = e.message
  }
}

// ── Point Items ───────────────────────────────────────────
const showAddItem = ref(false)
const newItemName = ref('')
const newItemPoints = ref(1)
const newItemType = ref('daily')
const itemLoading = ref(false)
const itemError = ref('')

const dailyItems = computed(() => appStore.pointItems.filter(i => i.item_type === 'daily'))
const manualItems = computed(() => appStore.pointItems.filter(i => i.item_type === 'manual'))

// 編輯項目
const editingItemId = ref(null)
const editingItemName = ref('')
const editingItemPoints = ref(1)
const editingItemType = ref('daily')

function startEditItem(item) {
  editingItemId.value = item.id
  editingItemName.value = item.name
  editingItemPoints.value = item.points
  editingItemType.value = item.item_type
}

function cancelEditItem() {
  editingItemId.value = null
}

async function saveEditItem() {
  if (!editingItemName.value.trim() || !editingItemPoints.value) return
  itemLoading.value = true
  itemError.value = ''
  try {
    await appStore.updatePointItem(
      editingItemId.value,
      editingItemName.value.trim(),
      Number(editingItemPoints.value),
      editingItemType.value,
    )
    editingItemId.value = null
  } catch (e) {
    itemError.value = e.message
  } finally {
    itemLoading.value = false
  }
}

async function addItem() {
  if (!newItemName.value.trim() || !newItemPoints.value) return
  itemLoading.value = true
  itemError.value = ''
  try {
    await appStore.addPointItem(newItemName.value.trim(), Number(newItemPoints.value), newItemType.value)
    newItemName.value = ''
    newItemPoints.value = 1
    newItemType.value = 'daily'
    showAddItem.value = false
  } catch (e) {
    itemError.value = e.message
  } finally {
    itemLoading.value = false
  }
}

async function deleteItem(id, name) {
  if (!confirm(`確定要刪除「${name}」嗎？`)) return
  try {
    await appStore.deletePointItem(id)
  } catch (e) {
    itemError.value = e.message
  }
}

// ── Goals ─────────────────────────────────────────────────
const showAddGoal = ref(false)
const newGoalName = ref('')

// 編輯目標
const editingGoalId = ref(null)
const editingGoalName = ref('')
const editingGoalPoints = ref(10)
const editingGoalLimit = ref('')
const editingGoalExpiry = ref('')

function startEditGoal(goal) {
  editingGoalId.value = goal.id
  editingGoalName.value = goal.name
  editingGoalPoints.value = goal.required_points
  editingGoalLimit.value = goal.quantity_limit ?? ''
  editingGoalExpiry.value = goal.expires_at ?? ''
}

function cancelEditGoal() {
  editingGoalId.value = null
}

async function saveEditGoal() {
  if (!editingGoalName.value.trim() || !editingGoalPoints.value) return
  goalLoading.value = true
  goalError.value = ''
  try {
    await appStore.updateGoal(
      editingGoalId.value,
      editingGoalName.value.trim(),
      Number(editingGoalPoints.value),
      editingGoalLimit.value ? Number(editingGoalLimit.value) : null,
      editingGoalExpiry.value || null,
    )
    editingGoalId.value = null
  } catch (e) {
    goalError.value = e.message
  } finally {
    goalLoading.value = false
  }
}
const newGoalPoints = ref(10)
const newGoalLimit = ref('')
const newGoalExpiry = ref('')
const goalLoading = ref(false)
const goalError = ref('')

async function addGoal() {
  if (!newGoalName.value.trim() || !newGoalPoints.value) return
  goalLoading.value = true
  goalError.value = ''
  try {
    await appStore.addGoal(
      newGoalName.value.trim(),
      Number(newGoalPoints.value),
      newGoalLimit.value ? Number(newGoalLimit.value) : null,
      newGoalExpiry.value || null,
    )
    newGoalName.value = ''
    newGoalPoints.value = 10
    newGoalLimit.value = ''
    newGoalExpiry.value = ''
    showAddGoal.value = false
  } catch (e) {
    goalError.value = e.message
  } finally {
    goalLoading.value = false
  }
}

async function deleteGoal(id, name) {
  if (!confirm(`確定要刪除目標「${name}」嗎？`)) return
  try {
    await appStore.deleteGoal(id)
  } catch (e) {
    goalError.value = e.message
  }
}
</script>

<template>
  <div class="pb-4">
    <!-- Header -->
    <div class="bg-gradient-to-r from-teal-500 to-cyan-400 px-4 pt-10 pb-6 rounded-b-3xl shadow-md">
      <h1 class="text-white font-bold text-lg">⚙️ 設定</h1>
    </div>

    <!-- Tabs -->
    <div class="mx-4 mt-4 flex bg-gray-100 rounded-2xl p-1">
      <button
        v-for="tab in [['children','👶 小孩'],['items','📋 項目'],['goals','🎯 目標']]"
        :key="tab[0]"
        @click="activeTab = tab[0]"
        class="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
        :class="activeTab === tab[0] ? 'bg-white shadow text-teal-600' : 'text-gray-500'"
      >{{ tab[1] }}</button>
    </div>

    <!-- ── Children Tab ── -->
    <div v-if="activeTab === 'children'" class="mx-4 mt-4">
      <div v-if="childError" class="mb-3 bg-red-100 text-red-600 text-sm rounded-xl p-3">⚠️ {{ childError }}</div>

      <div class="space-y-2 mb-4">
        <div
          v-for="child in appStore.children"
          :key="child.id"
          class="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <!-- 一般顯示 -->
          <div v-if="editingChildId !== child.id" class="flex items-center gap-3 p-4">
            <span class="w-8 h-8 rounded-full flex-shrink-0" :class="colorMap[child.color] || 'bg-orange-400'"></span>
            <span class="flex-1 font-bold text-gray-700">{{ child.name }}</span>
            <button
              @click="startEdit(child)"
              class="text-teal-500 hover:text-teal-700 text-sm px-2"
            >編輯</button>
            <button
              @click="deleteChild(child.id, child.name)"
              class="text-red-400 hover:text-red-600 text-sm px-2"
            >刪除</button>
          </div>

          <!-- 編輯模式 -->
          <div v-else class="p-4">
            <p class="text-xs font-bold text-teal-600 mb-2">✏️ 編輯小孩資料</p>
            <input
              v-model="editingChildName"
              class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:border-teal-400"
              placeholder="小孩名字"
              @keyup.enter="saveEdit"
            />
            <p class="text-xs text-gray-500 mb-2">選擇顏色</p>
            <div class="flex gap-2 mb-3">
              <button
                v-for="c in colorOptions"
                :key="c.value"
                @click="editingChildColor = c.value"
                class="w-8 h-8 rounded-full transition-all"
                :class="[c.cls, editingChildColor === c.value ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : '']"
              ></button>
            </div>
            <div class="flex gap-2">
              <button @click="cancelEdit" class="flex-1 py-2 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-bold">取消</button>
              <button
                @click="saveEdit"
                :disabled="childLoading || !editingChildName.trim()"
                class="flex-1 py-2 rounded-xl bg-teal-500 text-white text-sm font-bold disabled:opacity-50"
              >{{ childLoading ? '儲存中...' : '儲存' }}</button>
            </div>
          </div>
        </div>
        <div v-if="appStore.children.length === 0" class="text-center text-gray-400 text-sm py-4">
          還沒有小孩，點下方新增吧！
        </div>
      </div>

      <!-- Add child form -->
      <div v-if="showAddChild" class="bg-white rounded-2xl p-4 shadow-sm mb-3">
        <p class="font-bold text-gray-700 mb-3">新增小孩</p>
        <input
          v-model="newChildName"
          placeholder="小孩名字"
          class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:border-teal-400"
        />
        <p class="text-xs text-gray-500 mb-2">選擇顏色</p>
        <div class="flex gap-2 mb-3">
          <button
            v-for="c in colorOptions"
            :key="c.value"
            @click="newChildColor = c.value"
            class="w-8 h-8 rounded-full transition-all"
            :class="[c.cls, newChildColor === c.value ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : '']"
          ></button>
        </div>
        <div class="flex gap-2">
          <button @click="showAddChild = false" class="flex-1 py-2 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-bold">取消</button>
          <button
            @click="addChild"
            :disabled="childLoading || !newChildName.trim()"
            class="flex-1 py-2 rounded-xl bg-teal-500 text-white text-sm font-bold disabled:opacity-50"
          >{{ childLoading ? '新增中...' : '新增' }}</button>
        </div>
      </div>

      <button
        v-if="!showAddChild"
        @click="showAddChild = true"
        class="w-full py-3 rounded-2xl border-2 border-dashed border-teal-300 text-teal-500 font-bold text-sm"
      >+ 新增小孩</button>
    </div>

    <!-- ── Items Tab ── -->
    <div v-if="activeTab === 'items'" class="mx-4 mt-4">
      <div v-if="!appStore.currentChild" class="text-center text-gray-400 text-sm py-8">
        請先在「小孩」頁面新增小孩
      </div>
      <template v-else>
        <div v-if="itemError" class="mb-3 bg-red-100 text-red-600 text-sm rounded-xl p-3">⚠️ {{ itemError }}</div>

        <!-- Child selector for items -->
        <div class="flex gap-2 flex-wrap mb-4">
          <button
            v-for="child in appStore.children"
            :key="child.id"
            @click="appStore.switchChild(child.id)"
            class="px-3 py-1 rounded-full text-xs font-bold border-2 transition-all"
            :class="appStore.currentChildId === child.id
              ? 'border-teal-500 bg-teal-50 text-teal-600'
              : 'border-gray-200 text-gray-500'"
          >{{ child.name }}</button>
        </div>

        <!-- Daily items -->
        <p class="text-xs font-bold text-gray-500 mb-2">📋 日常打卡</p>
        <div class="space-y-2 mb-3">
          <div
            v-for="item in dailyItems"
            :key="item.id"
            class="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <!-- 一般顯示 -->
            <div v-if="editingItemId !== item.id" class="flex items-center gap-3 p-3">
              <span class="flex-1 text-sm text-gray-700">{{ item.name }}</span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                :class="item.points > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'">
                {{ item.points > 0 ? '+' : '' }}{{ item.points }}
              </span>
              <button @click="startEditItem(item)" class="text-teal-500 text-xs px-1">編輯</button>
              <button @click="deleteItem(item.id, item.name)" class="text-red-400 text-xs px-1">刪除</button>
            </div>
            <!-- 編輯模式 -->
            <div v-else class="p-3">
              <p class="text-xs font-bold text-teal-600 mb-2">✏️ 編輯項目</p>
              <input
                v-model="editingItemName"
                class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:border-teal-400"
                placeholder="項目名稱"
                @keyup.enter="saveEditItem"
              />
              <div class="flex gap-2 mb-2">
                <div class="flex-1">
                  <p class="text-xs text-gray-500 mb-1">點數</p>
                  <input v-model="editingItemPoints" type="number"
                    class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
                </div>
                <div class="flex-1">
                  <p class="text-xs text-gray-500 mb-1">類型</p>
                  <select v-model="editingItemType"
                    class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400 bg-white">
                    <option value="daily">日常打卡</option>
                    <option value="manual">手動記錄</option>
                  </select>
                </div>
              </div>
              <div class="flex gap-2">
                <button @click="cancelEditItem" class="flex-1 py-1.5 rounded-xl border-2 border-gray-200 text-gray-500 text-xs font-bold">取消</button>
                <button @click="saveEditItem" :disabled="itemLoading"
                  class="flex-1 py-1.5 rounded-xl bg-teal-500 text-white text-xs font-bold disabled:opacity-50">
                  {{ itemLoading ? '儲存中...' : '儲存' }}
                </button>
              </div>
            </div>
          </div>
          <div v-if="dailyItems.length === 0" class="text-center text-gray-400 text-xs py-2">（無）</div>
        </div>

        <!-- Manual items -->
        <p class="text-xs font-bold text-gray-500 mb-2">✨ 手動記錄</p>
        <div class="space-y-2 mb-4">
          <div
            v-for="item in manualItems"
            :key="item.id"
            class="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <!-- 一般顯示 -->
            <div v-if="editingItemId !== item.id" class="flex items-center gap-3 p-3">
              <span class="flex-1 text-sm text-gray-700">{{ item.name }}</span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                :class="item.points > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'">
                {{ item.points > 0 ? '+' : '' }}{{ item.points }}
              </span>
              <button @click="startEditItem(item)" class="text-teal-500 text-xs px-1">編輯</button>
              <button @click="deleteItem(item.id, item.name)" class="text-red-400 text-xs px-1">刪除</button>
            </div>
            <!-- 編輯模式 -->
            <div v-else class="p-3">
              <p class="text-xs font-bold text-teal-600 mb-2">✏️ 編輯項目</p>
              <input
                v-model="editingItemName"
                class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:border-teal-400"
                placeholder="項目名稱"
                @keyup.enter="saveEditItem"
              />
              <div class="flex gap-2 mb-2">
                <div class="flex-1">
                  <p class="text-xs text-gray-500 mb-1">點數</p>
                  <input v-model="editingItemPoints" type="number"
                    class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
                </div>
                <div class="flex-1">
                  <p class="text-xs text-gray-500 mb-1">類型</p>
                  <select v-model="editingItemType"
                    class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400 bg-white">
                    <option value="daily">日常打卡</option>
                    <option value="manual">手動記錄</option>
                  </select>
                </div>
              </div>
              <div class="flex gap-2">
                <button @click="cancelEditItem" class="flex-1 py-1.5 rounded-xl border-2 border-gray-200 text-gray-500 text-xs font-bold">取消</button>
                <button @click="saveEditItem" :disabled="itemLoading"
                  class="flex-1 py-1.5 rounded-xl bg-teal-500 text-white text-xs font-bold disabled:opacity-50">
                  {{ itemLoading ? '儲存中...' : '儲存' }}
                </button>
              </div>
            </div>
          </div>
          <div v-if="manualItems.length === 0" class="text-center text-gray-400 text-xs py-2">（無）</div>
        </div>

        <!-- Add item form -->
        <div v-if="showAddItem" class="bg-white rounded-2xl p-4 shadow-sm mb-3">
          <p class="font-bold text-gray-700 mb-3">新增項目</p>
          <input
            v-model="newItemName"
            placeholder="項目名稱，例如：沒遲到"
            class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:border-teal-400"
          />
          <div class="flex gap-2 mb-3">
            <div class="flex-1">
              <p class="text-xs text-gray-500 mb-1">點數（負數為扣點）</p>
              <input
                v-model="newItemPoints"
                type="number"
                placeholder="1"
                class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
            <div class="flex-1">
              <p class="text-xs text-gray-500 mb-1">類型</p>
              <select
                v-model="newItemType"
                class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400 bg-white"
              >
                <option value="daily">日常打卡</option>
                <option value="manual">手動記錄</option>
              </select>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="showAddItem = false" class="flex-1 py-2 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-bold">取消</button>
            <button
              @click="addItem"
              :disabled="itemLoading || !newItemName.trim()"
              class="flex-1 py-2 rounded-xl bg-teal-500 text-white text-sm font-bold disabled:opacity-50"
            >{{ itemLoading ? '新增中...' : '新增' }}</button>
          </div>
        </div>

        <button
          v-if="!showAddItem"
          @click="showAddItem = true"
          class="w-full py-3 rounded-2xl border-2 border-dashed border-teal-300 text-teal-500 font-bold text-sm"
        >+ 新增項目</button>
      </template>
    </div>

    <!-- ── Goals Tab ── -->
    <div v-if="activeTab === 'goals'" class="mx-4 mt-4">
      <div v-if="!appStore.currentChild" class="text-center text-gray-400 text-sm py-8">
        請先在「小孩」頁面新增小孩
      </div>
      <template v-else>
        <div v-if="goalError" class="mb-3 bg-red-100 text-red-600 text-sm rounded-xl p-3">⚠️ {{ goalError }}</div>

        <!-- Child selector for goals -->
        <div class="flex gap-2 flex-wrap mb-4">
          <button
            v-for="child in appStore.children"
            :key="child.id"
            @click="appStore.switchChild(child.id)"
            class="px-3 py-1 rounded-full text-xs font-bold border-2 transition-all"
            :class="appStore.currentChildId === child.id
              ? 'border-teal-500 bg-teal-50 text-teal-600'
              : 'border-gray-200 text-gray-500'"
          >{{ child.name }}</button>
        </div>

        <div class="space-y-2 mb-4">
          <div
            v-for="goal in appStore.goals"
            :key="goal.id"
            class="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <!-- 一般顯示 -->
            <div v-if="editingGoalId !== goal.id" class="flex items-center gap-3 p-3">
              <div class="flex-1">
                <p class="text-sm font-bold text-gray-700">{{ goal.name }}</p>
                <p class="text-xs text-gray-400">
                  {{ goal.required_points }} 點
                  <span v-if="goal.quantity_limit !== null">・上限 {{ goal.quantity_limit }} 次</span>
                  <span v-if="goal.expires_at">・到期 {{ goal.expires_at }}</span>
                </p>
              </div>
              <button @click="startEditGoal(goal)" class="text-teal-500 text-xs px-1">編輯</button>
              <button @click="deleteGoal(goal.id, goal.name)" class="text-red-400 text-xs px-1">刪除</button>
            </div>
            <!-- 編輯模式 -->
            <div v-else class="p-3">
              <p class="text-xs font-bold text-teal-600 mb-2">✏️ 編輯目標</p>
              <input
                v-model="editingGoalName"
                class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:border-teal-400"
                placeholder="目標名稱"
                @keyup.enter="saveEditGoal"
              />
              <div class="flex gap-2 mb-2">
                <div class="flex-1">
                  <p class="text-xs text-gray-500 mb-1">需要點數</p>
                  <input v-model="editingGoalPoints" type="number" min="1"
                    class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
                </div>
                <div class="flex-1">
                  <p class="text-xs text-gray-500 mb-1">數量上限（選填）</p>
                  <input v-model="editingGoalLimit" type="number" min="1" placeholder="無限"
                    class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
                </div>
              </div>
              <div class="mb-2">
                <p class="text-xs text-gray-500 mb-1">截止日期（選填）</p>
                <input v-model="editingGoalExpiry" type="date"
                  class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
              </div>
              <div class="flex gap-2">
                <button @click="cancelEditGoal" class="flex-1 py-1.5 rounded-xl border-2 border-gray-200 text-gray-500 text-xs font-bold">取消</button>
                <button @click="saveEditGoal" :disabled="goalLoading"
                  class="flex-1 py-1.5 rounded-xl bg-teal-500 text-white text-xs font-bold disabled:opacity-50">
                  {{ goalLoading ? '儲存中...' : '儲存' }}
                </button>
              </div>
            </div>
          </div>
          <div v-if="appStore.goals.length === 0" class="text-center text-gray-400 text-xs py-3">（無目標）</div>
        </div>

        <!-- Add goal form -->
        <div v-if="showAddGoal" class="bg-white rounded-2xl p-4 shadow-sm mb-3">
          <p class="font-bold text-gray-700 mb-3">新增目標</p>
          <input
            v-model="newGoalName"
            placeholder="目標名稱，例如：看一部電影"
            class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:border-teal-400"
          />
          <div class="flex gap-2 mb-3">
            <div class="flex-1">
              <p class="text-xs text-gray-500 mb-1">需要點數 *</p>
              <input
                v-model="newGoalPoints"
                type="number"
                min="1"
                class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
            <div class="flex-1">
              <p class="text-xs text-gray-500 mb-1">數量上限（選填）</p>
              <input
                v-model="newGoalLimit"
                type="number"
                min="1"
                placeholder="無限"
                class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>
          <div class="mb-3">
            <p class="text-xs text-gray-500 mb-1">截止日期（選填）</p>
            <input
              v-model="newGoalExpiry"
              type="date"
              class="w-full border-2 border-teal-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
            />
          </div>
          <div class="flex gap-2">
            <button @click="showAddGoal = false" class="flex-1 py-2 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-bold">取消</button>
            <button
              @click="addGoal"
              :disabled="goalLoading || !newGoalName.trim()"
              class="flex-1 py-2 rounded-xl bg-teal-500 text-white text-sm font-bold disabled:opacity-50"
            >{{ goalLoading ? '新增中...' : '新增' }}</button>
          </div>
        </div>

        <button
          v-if="!showAddGoal"
          @click="showAddGoal = true"
          class="w-full py-3 rounded-2xl border-2 border-dashed border-teal-300 text-teal-500 font-bold text-sm"
        >+ 新增目標</button>
      </template>
    </div>
  </div>
</template>

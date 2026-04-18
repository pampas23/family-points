import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'

export const useAppStore = defineStore('app', () => {
  const children = ref([])
  const currentChildId = ref(null)
  const pointItems = ref([])
  const pointRecords = ref([])
  const goals = ref([])
  const loading = ref(false)

  const currentChild = computed(() =>
    children.value.find(c => c.id === currentChildId.value)
  )

  const totalPoints = computed(() =>
    pointRecords.value.reduce((sum, r) => sum + r.points, 0)
  )

  const recordsByDate = computed(() => {
    const map = {}
    for (const record of pointRecords.value) {
      const date = record.recorded_at
      if (!map[date]) map[date] = []
      map[date].push(record)
    }
    return map
  })

  const todayCheckedItemIds = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayRecords = recordsByDate.value[today] || []
    return new Set(todayRecords.filter(r => r.item_id).map(r => r.item_id))
  })

  // ── Children ──────────────────────────────────────────────
  async function loadChildren() {
    const authStore = useAuthStore()
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', authStore.user.id)
      .order('created_at')
    if (error) throw error
    children.value = data
    if (data.length > 0 && !currentChildId.value) {
      currentChildId.value = data[0].id
    }
  }

  async function addChild(name, color) {
    const authStore = useAuthStore()
    const { data, error } = await supabase
      .from('children')
      .insert({ parent_id: authStore.user.id, name, color })
      .select()
      .single()
    if (error) throw error
    children.value.push(data)
    if (children.value.length === 1) {
      currentChildId.value = data.id
      await loadChildData()
    }
  }

  async function updateChild(id, name, color) {
    const { data, error } = await supabase
      .from('children')
      .update({ name, color })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    const idx = children.value.findIndex(c => c.id === id)
    if (idx !== -1) children.value[idx] = data
  }

  async function deleteChild(id) {
    const { error } = await supabase.from('children').delete().eq('id', id)
    if (error) throw error
    children.value = children.value.filter(c => c.id !== id)
    if (currentChildId.value === id) {
      currentChildId.value = children.value[0]?.id ?? null
      await loadChildData()
    }
  }

  async function switchChild(id) {
    currentChildId.value = id
    await loadChildData()
  }

  async function loadChildData() {
    if (!currentChildId.value) {
      pointItems.value = []
      pointRecords.value = []
      goals.value = []
      return
    }
    loading.value = true
    try {
      await Promise.all([loadPointItems(), loadPointRecords(), loadGoals()])
    } finally {
      loading.value = false
    }
  }

  // ── Point Items ───────────────────────────────────────────
  async function loadPointItems() {
    const { data, error } = await supabase
      .from('point_items')
      .select('*')
      .eq('child_id', currentChildId.value)
      .order('created_at')
    if (error) throw error
    pointItems.value = data
  }

  async function addPointItem(name, points, itemType) {
    const { data, error } = await supabase
      .from('point_items')
      .insert({ child_id: currentChildId.value, name, points, item_type: itemType })
      .select()
      .single()
    if (error) throw error
    pointItems.value.push(data)
  }

  async function updatePointItem(id, name, points, itemType) {
    const { data, error } = await supabase
      .from('point_items')
      .update({ name, points, item_type: itemType })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    const idx = pointItems.value.findIndex(i => i.id === id)
    if (idx !== -1) pointItems.value[idx] = data
  }

  async function deletePointItem(id) {
    const { error } = await supabase.from('point_items').delete().eq('id', id)
    if (error) throw error
    pointItems.value = pointItems.value.filter(i => i.id !== id)
  }

  // ── Point Records ─────────────────────────────────────────
  async function loadPointRecords() {
    const { data, error } = await supabase
      .from('point_records')
      .select('*')
      .eq('child_id', currentChildId.value)
      .order('recorded_at', { ascending: false })
    if (error) throw error
    pointRecords.value = data
  }

  async function addPointRecord(itemId, itemName, points, date) {
    const recordedAt = date || new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('point_records')
      .insert({
        child_id: currentChildId.value,
        item_id: itemId || null,
        item_name: itemName,
        points,
        recorded_at: recordedAt,
      })
      .select()
      .single()
    if (error) throw error
    pointRecords.value.unshift(data)
  }

  async function removePointRecord(id) {
    const { error } = await supabase.from('point_records').delete().eq('id', id)
    if (error) throw error
    pointRecords.value = pointRecords.value.filter(r => r.id !== id)
  }

  async function updatePointRecord(id, itemName, points) {
    const { data, error } = await supabase
      .from('point_records')
      .update({ item_name: itemName, points })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    const idx = pointRecords.value.findIndex(r => r.id === id)
    if (idx !== -1) pointRecords.value[idx] = data
  }

  async function toggleDailyItem(item) {
    const today = new Date().toISOString().split('T')[0]
    const existing = pointRecords.value.find(
      r => r.item_id === item.id && r.recorded_at === today
    )
    if (existing) {
      await removePointRecord(existing.id)
    } else {
      await addPointRecord(item.id, item.name, item.points, today)
    }
  }

  // ── Goals ─────────────────────────────────────────────────
  async function loadGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('child_id', currentChildId.value)
      .order('created_at')
    if (error) throw error
    goals.value = data
  }

  async function addGoal(name, requiredPoints, quantityLimit, expiresAt) {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        child_id: currentChildId.value,
        name,
        required_points: requiredPoints,
        quantity_limit: quantityLimit || null,
        quantity_used: 0,
        expires_at: expiresAt || null,
      })
      .select()
      .single()
    if (error) throw error
    goals.value.push(data)
  }

  async function updateGoal(id, name, requiredPoints, quantityLimit, expiresAt) {
    const { data, error } = await supabase
      .from('goals')
      .update({
        name,
        required_points: requiredPoints,
        quantity_limit: quantityLimit || null,
        expires_at: expiresAt || null,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    const idx = goals.value.findIndex(g => g.id === id)
    if (idx !== -1) goals.value[idx] = data
  }

  async function deleteGoal(id) {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) throw error
    goals.value = goals.value.filter(g => g.id !== id)
  }

  async function redeemGoal(goal) {
    if (totalPoints.value < goal.required_points) throw new Error('點數不足')
    if (goal.quantity_limit !== null && goal.quantity_used >= goal.quantity_limit) {
      throw new Error('已達兌換上限')
    }
    const today = new Date().toISOString().split('T')[0]
    if (goal.expires_at && goal.expires_at < today) throw new Error('目標已過期')

    await addPointRecord(null, `兌換：${goal.name}`, -goal.required_points, null)

    const { data, error } = await supabase
      .from('goals')
      .update({ quantity_used: goal.quantity_used + 1 })
      .eq('id', goal.id)
      .select()
      .single()
    if (error) throw error
    const idx = goals.value.findIndex(g => g.id === goal.id)
    if (idx !== -1) goals.value[idx] = data
  }

  function reset() {
    children.value = []
    currentChildId.value = null
    pointItems.value = []
    pointRecords.value = []
    goals.value = []
  }

  return {
    children, currentChildId, currentChild,
    pointItems, pointRecords, goals, loading,
    totalPoints, recordsByDate, todayCheckedItemIds,
    loadChildren, addChild, updateChild, deleteChild, switchChild, loadChildData,
    loadPointItems, addPointItem, updatePointItem, deletePointItem,
    loadPointRecords, addPointRecord, removePointRecord, updatePointRecord, toggleDailyItem,
    loadGoals, addGoal, updateGoal, deleteGoal, redeemGoal,
    reset,
  }
})

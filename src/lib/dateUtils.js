/**
 * 回傳本地時區的今日日期字串 YYYY-MM-DD
 * 避免 toISOString() 使用 UTC 導致跨日問題
 */
export function localToday(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

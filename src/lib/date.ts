/** 日期与时间工具，全部按本地时区处理 */

const pad = (n: number) => String(n).padStart(2, '0')

/** Date → YYYY-MM-DD（本地时区） */
export function dateKey(d: Date | number = new Date()): string {
  const dt = d instanceof Date ? d : new Date(d)
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
}

/** YYYY-MM-DD → 本地 Date（当天 00:00） */
export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key)
  d.setDate(d.getDate() + n)
  return dateKey(d)
}

export function addMonths(year: number, month: number, n: number): { year: number; month: number } {
  const total = year * 12 + month + n
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 }
}

export function monthKey(year: number, month: number): string {
  return `${year}-${pad(month + 1)}`
}

export function startOfMonthKey(year: number, month: number): string {
  return `${year}-${pad(month + 1)}-01`
}

/** 某年某月的天数 */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** 某月 1 号是星期几（0=周日） */
export function firstWeekday(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

/** 生成从 start 到 end 的连续日期序列（含两端） */
export function dateRange(startKey: string, endKey: string): string[] {
  const out: string[] = []
  let cur = startKey
  let guard = 0
  while (cur <= endKey && guard < 2000) {
    out.push(cur)
    cur = addDays(cur, 1)
    guard++
  }
  return out
}

/** 把 date + HH:mm 组装成本地时间戳 */
export function toTimestamp(dateStr: string, timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  const d = fromKey(dateStr)
  d.setHours(h || 0, m || 0, 0, 0)
  return d.getTime()
}

export function timeOfDay(ts: number): string {
  const d = new Date(ts)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function dateTimeOfDay(ts: number): string {
  const d = new Date(ts)
  return `${dateKey(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const WEEK_CN = ['日', '一', '二', '三', '四', '五', '六']
export const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日']

export function weekdayCN(d: Date | string): string {
  const dt = typeof d === 'string' ? fromKey(d) : d
  return WEEK_CN[dt.getDay()]
}

/** 时长秒 → 「3 分 20 秒」/「1 小时 5 分」 */
export function formatDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0
  const s = Math.round(sec)
  if (s < 60) return `${s} 秒`
  const m = Math.floor(s / 60)
  const rs = s % 60
  if (m < 60) return rs ? `${m} 分 ${rs} 秒` : `${m} 分`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return rm ? `${h} 小时 ${rm} 分` : `${h} 小时`
}

/** 时长秒 → 计时器显示 00:00 / 1:02:03 */
export function formatClock(sec: number): string {
  const s = Math.max(0, Math.round(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${pad(m)}:${pad(ss)}`
}

/** 相对描述：今天 / 昨天 / 前天 / M月D日 */
export function relativeDay(key: string): string {
  const today = dateKey()
  if (key === today) return '今天'
  if (key === addDays(today, -1)) return '昨天'
  if (key === addDays(today, -2)) return '前天'
  const d = fromKey(key)
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`
}

/** 时段归属，用于「你通常在什么时候拉」统计 */
export function daySegment(ts: number): string {
  const h = new Date(ts).getHours()
  if (h < 5) return '凌晨'
  if (h < 9) return '清晨'
  if (h < 12) return '上午'
  if (h < 14) return '午间'
  if (h < 18) return '下午'
  if (h < 22) return '晚间'
  return '深夜'
}

export const DAY_SEGMENTS = ['凌晨', '清晨', '上午', '午间', '下午', '晚间', '深夜']

export function isToday(key: string): boolean {
  return key === dateKey()
}

export function diffDays(a: string, b: string): number {
  return Math.round((fromKey(a).getTime() - fromKey(b).getTime()) / 86400000)
}

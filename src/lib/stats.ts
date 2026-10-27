import type { PooRecord, OptionMeta } from '../types'
import {
  BRISTOL_OPTIONS,
  COLOR_OPTIONS,
  AMOUNT_OPTIONS,
  EFFORT_OPTIONS,
  BELLY_OPTIONS,
  MOOD_OPTIONS,
} from '../types'
import { DAY_SEGMENTS, daySegment, fromKey } from './date'

export interface DistItem {
  value: string
  label: string
  emoji: string
  color: string
  count: number
  pct: number
}

export interface TrendPoint {
  date: string
  count: number
  avgDuration: number
  totalDuration: number
}

export interface StatsSummary {
  total: number
  produced: number
  daysWithRecord: number
  spanDays: number
  avgPerDay: number
  avgDuration: number
  totalDuration: number
  maxDuration: number
  medianDuration: number
  longestRecord: PooRecord | null
  shapeDist: DistItem[]
  colorDist: DistItem[]
  amountDist: DistItem[]
  effortDist: DistItem[]
  bellyDist: DistItem[]
  moodDist: DistItem[]
  segmentDist: DistItem[]
  weekdayDist: DistItem[]
  trend: TrendPoint[]
  morningRate: number
  clockStdMin: number
  avgIntervalH: number
}

function dist<T extends string>(
  records: PooRecord[],
  getVal: (r: PooRecord) => T | undefined,
  opts: OptionMeta<T>[]
): DistItem[] {
  const counts = new Map<string, number>()
  records.forEach((r) => {
    const v = getVal(r)
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1)
  })
  const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1
  return opts
    .filter((o) => counts.has(o.value))
    .map((o) => {
      const c = counts.get(o.value) ?? 0
      return { value: o.value, label: o.label, emoji: o.emoji, color: o.color, count: c, pct: c / total }
    })
    .sort((a, b) => b.count - a.count)
}

function median(nums: number[]): number {
  if (!nums.length) return 0
  const s = [...nums].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

function std(nums: number[]): number {
  if (nums.length < 2) return 0
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length
  return Math.sqrt(nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length)
}

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] // 周一 → 周日
const WEEKDAY_LABELS: Record<number, string> = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
}

/** 计算统计摘要。传入的 records 已被调用方按日期范围过滤过。 */
export function computeStats(records: PooRecord[]): StatsSummary {
  const total = records.length
  const produced = records.filter((r) => r.produced)
  const durations = records.map((r) => r.durationSec)
  const totalDuration = durations.reduce((a, b) => a + b, 0)
  const avgDuration = total ? totalDuration / total : 0
  const maxDuration = durations.length ? Math.max(...durations) : 0
  const medianDuration = median(durations)

  const daysSet = new Set(records.map((r) => r.date))
  const daysWithRecord = daysSet.size
  const dates = records.map((r) => r.date).sort()
  const spanDays = dates.length
    ? Math.round((fromKey(dates[dates.length - 1]).getTime() - fromKey(dates[0]).getTime()) / 86400000) + 1
    : 0
  const avgPerDay = spanDays ? daysWithRecord / spanDays : 0

  const longestRecord = records.reduce<PooRecord | null>(
    (best, r) => (!best || r.durationSec > best.durationSec ? r : best),
    null
  )

  const segCounts = new Map<string, number>()
  DAY_SEGMENTS.forEach((s) => segCounts.set(s, 0))
  records.forEach((r) => {
    const s = daySegment(r.startAt)
    segCounts.set(s, (segCounts.get(s) ?? 0) + 1)
  })
  const segmentDist: DistItem[] = DAY_SEGMENTS.map((s) => {
    const c = segCounts.get(s) ?? 0
    return { value: s, label: s, emoji: '', color: '#C98A4B', count: c, pct: c / (total || 1) }
  })

  const wdCounts = new Map<number, number>()
  WEEKDAY_ORDER.forEach((d) => wdCounts.set(d, 0))
  records.forEach((r) => {
    const d = new Date(r.startAt).getDay()
    wdCounts.set(d, (wdCounts.get(d) ?? 0) + 1)
  })
  const weekdayDist: DistItem[] = WEEKDAY_ORDER.map((d) => {
    const c = wdCounts.get(d) ?? 0
    return { value: String(d), label: WEEKDAY_LABELS[d], emoji: '', color: '#8C6239', count: c, pct: c / (total || 1) }
  })

  const byDate = new Map<string, number[]>()
  records.forEach((r) => {
    if (!byDate.has(r.date)) byDate.set(r.date, [])
    byDate.get(r.date)!.push(r.durationSec)
  })
  const trend: TrendPoint[] = [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, ds]) => ({
      date,
      count: ds.length,
      totalDuration: ds.reduce((a, b) => a + b, 0),
      avgDuration: ds.reduce((a, b) => a + b, 0) / ds.length,
    }))

  const morning = records.filter((r) => {
    const h = new Date(r.startAt).getHours()
    return h >= 6 && h < 10
  }).length
  const morningRate = total ? morning / total : 0

  const minutes = records.map((r) => {
    const d = new Date(r.startAt)
    return d.getHours() * 60 + d.getMinutes()
  })
  const clockStdMin = std(minutes)

  const starts = records.map((r) => r.startAt).sort((a, b) => a - b)
  const gaps: number[] = []
  for (let i = 1; i < starts.length; i++) gaps.push((starts[i] - starts[i - 1]) / 3600000)
  const avgIntervalH = median(gaps)

  return {
    total,
    produced: produced.length,
    daysWithRecord,
    spanDays,
    avgPerDay,
    avgDuration,
    totalDuration,
    maxDuration,
    medianDuration,
    longestRecord,
    shapeDist: dist(produced, (r) => r.shape, BRISTOL_OPTIONS),
    colorDist: dist(produced, (r) => r.color, COLOR_OPTIONS),
    amountDist: dist(produced, (r) => r.amount, AMOUNT_OPTIONS),
    effortDist: dist(produced, (r) => r.effort, EFFORT_OPTIONS),
    bellyDist: dist(produced, (r) => r.belly, BELLY_OPTIONS),
    moodDist: dist(produced, (r) => r.mood, MOOD_OPTIONS),
    segmentDist,
    weekdayDist,
    trend,
    morningRate,
    clockStdMin,
    avgIntervalH,
  }
}

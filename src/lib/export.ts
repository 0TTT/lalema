import type { PooRecord } from '../types'
import { bulkPut } from './db'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { toastStore } from '../components/ui'
import {
  BRISTOL_OPTIONS,
  COLOR_OPTIONS,
  AMOUNT_OPTIONS,
  EFFORT_OPTIONS,
  SMELL_OPTIONS,
  BLOOD_OPTIONS,
  BELLY_OPTIONS,
  MOOD_OPTIONS,
  labelOf,
} from '../types'

const EXPORT_VERSION = 1

export function toJSON(records: PooRecord[]): string {
  return JSON.stringify(
    { app: 'lalema', version: EXPORT_VERSION, exportedAt: Date.now(), count: records.length, records },
    null,
    2
  )
}

function csvCell(s: string | number | undefined): string {
  if (s === undefined || s === null) return ''
  const str = String(s)
  return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str
}

export function toCSV(records: PooRecord[]): string {
  const headers = [
    '日期',
    '开始时间',
    '时长(秒)',
    '是否排便',
    '形状',
    '颜色',
    '分量',
    '排便感觉',
    '气味',
    '出血',
    '粘马桶',
    '腹部感受',
    '心情',
    '备注',
  ]
  const rows = records.map((r) => [
    r.date,
    new Date(r.startAt).toLocaleString('zh-CN'),
    Math.round(r.durationSec),
    r.produced ? '是' : '否',
    labelOf(BRISTOL_OPTIONS, r.shape),
    labelOf(COLOR_OPTIONS, r.color),
    labelOf(AMOUNT_OPTIONS, r.amount),
    labelOf(EFFORT_OPTIONS, r.effort),
    labelOf(SMELL_OPTIONS, r.smell),
    labelOf(BLOOD_OPTIONS, r.blood),
    r.sticky ? '是' : '否',
    labelOf(BELLY_OPTIONS, r.belly),
    labelOf(MOOD_OPTIONS, r.mood),
    r.note ?? '',
  ])
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
}

function safeRecords(data: unknown): PooRecord[] {
  if (Array.isArray(data)) return data as PooRecord[]
  if (data && typeof data === 'object' && Array.isArray((data as { records?: unknown }).records)) {
    return (data as { records: PooRecord[] }).records
  }
  throw new Error('文件格式无法识别')
}

export async function importJSON(text: string): Promise<number> {
  const data = JSON.parse(text)
  const records = safeRecords(data)
  if (!records.length) return 0
  await bulkPut(records)
  return records.length
}

/**
 * 浏览器 / 安卓通用的导出：优先用系统分享（安卓上可直接存到文件管理器），
 * 不支持时回退到传统下载（Web/桌面端）。
 */
export async function shareOrDownload(filename: string, content: string, mime: string): Promise<void> {
  // 安卓原生环境：直接写入「文档 / lalema」，用户可在文件管理器找到，比 WebView 下载更稳
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      await Filesystem.writeFile({
        path: `lalema/${filename}`,
        data: content,
        directory: Directory.Documents,
        recursive: true,
      })
      toastStore.show('已保存到「文档 / lalema」文件夹')
      return
    } catch {
      // 落到下方通用逻辑
    }
  }
  const blob = new Blob([content], { type: mime })
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean
    share?: (data?: ShareData) => Promise<void>
  }
  if (nav.canShare && nav.share) {
    try {
      const file = new File([blob], filename, { type: mime })
      if (nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: '拉了吗导出', text: filename })
        return
      }
    } catch {
      // 用户取消或不支持，继续回退
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

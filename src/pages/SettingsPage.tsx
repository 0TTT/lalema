import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { useRecords, recordsStore } from '../lib/store'
import { toJSON, toCSV, importJSON, shareOrDownload } from '../lib/export'
import { dateKey } from '../lib/date'
import { toastStore, Banner } from '../components/ui'

export function SettingsPage() {
  const records = useRecords()
  const fileRef = useRef<HTMLInputElement>(null)

  function exportJSON() {
    shareOrDownload(`lalema-${dateKey()}.json`, toJSON(records), 'application/json')
  }
  function exportCSV() {
    // 加 BOM 防止 Excel 打开中文乱码
    shareOrDownload(`lalema-${dateKey()}.csv`, '﻿' + toCSV(records), 'text/csv;charset=utf-8')
  }

  async function onImport(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const text = await f.text()
      const n = await importJSON(text)
      toastStore.show(`已导入 ${n} 条`)
    } catch {
      toastStore.show('导入失败：文件格式不正确')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  async function clearAll() {
    if (window.confirm('确定清空全部记录？此操作不可恢复。')) {
      await recordsStore.clear()
      toastStore.show('已清空全部记录')
    }
  }

  return (
    <div className="page">
      <Banner tone="info">
        ⚕️ 「拉了吗」仅用于个人记录与自我观察，<b>不构成任何医疗建议</b>。如有便血、持续腹泻或便秘等异常，请及时就医（消化内科）。
      </Banner>

      <div className="section-title">数据（完全保存在你的设备上）</div>
      <div className="card stack">
        <button className="btn btn-block" onClick={exportJSON}>
          导出 JSON（完整备份 / 迁移）
        </button>
        <button className="btn btn-block" onClick={exportCSV}>
          导出 CSV（表格 · 可给医生看）
        </button>
        <button className="btn btn-block" onClick={() => fileRef.current?.click()}>
          导入 JSON 备份
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={onImport}
        />
      </div>

      <div className="section-title">危险区</div>
      <div className="card">
        <button className="btn btn-danger btn-block" onClick={clearAll}>
          清空全部记录
        </button>
      </div>

      <div className="section-title">关于</div>
      <div
        className="card"
        style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.8 }}
      >
        「拉了吗」v0.1 · 开源 MIT 协议
        <br />
        本地优先的如厕记录与肠道分析工具。
        <br />
        数据只存你的设备，不上传、不埋点。
      </div>

      <div style={{ height: 20 }} />
    </div>
  )
}

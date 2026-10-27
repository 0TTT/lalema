import { useState } from 'react'
import type { PooRecord } from '../types'
import { Timer, type TimerResult } from '../components/Timer'
import { RecordForm } from '../components/RecordForm'
import { RecordRow } from '../components/RecordRow'
import { useRecords } from '../lib/store'
import { dateKey } from '../lib/date'
import { EmptyHint } from '../components/ui'

export function Today() {
  const records = useRecords()
  const [formOpen, setFormOpen] = useState(false)
  const [preFill, setPreFill] = useState<TimerResult | undefined>()
  const [duplicate, setDuplicate] = useState<PooRecord | undefined>()
  const [edit, setEdit] = useState<PooRecord | undefined>()

  const today = dateKey()
  const todayRecords = records
    .filter((r) => r.date === today)
    .sort((a, b) => b.startAt - a.startAt)
  const latest = records[0]

  function openTimerResult(r: TimerResult) {
    setPreFill(r)
    setDuplicate(undefined)
    setEdit(undefined)
    setFormOpen(true)
  }
  function openBackfill() {
    setPreFill(undefined)
    setDuplicate(undefined)
    setEdit(undefined)
    setFormOpen(true)
  }
  function openDuplicate() {
    if (!latest) return
    setDuplicate(latest)
    setPreFill(undefined)
    setEdit(undefined)
    setFormOpen(true)
  }
  function openEdit(rec: PooRecord) {
    setEdit(rec)
    setPreFill(undefined)
    setDuplicate(undefined)
    setFormOpen(true)
  }

  return (
    <div className="page">
      <Timer onFinish={openTimerResult} />

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-block" onClick={openBackfill}>
          ＋ 补记
        </button>
        <button className="btn btn-block" onClick={openDuplicate} disabled={!latest}>
          ↺ 重复上次
        </button>
      </div>

      <div className="section-title">今天的记录 · {todayRecords.length} 次</div>
      {todayRecords.length === 0 ? (
        <EmptyHint icon="🚽" text="今天还没记录，坐下点「开始记录」吧" />
      ) : (
        todayRecords.map((r) => <RecordRow key={r.id} rec={r} onEdit={openEdit} />)
      )}

      <RecordForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        preFill={preFill}
        duplicate={duplicate}
        editRecord={edit}
      />
    </div>
  )
}

import { useState } from 'react'
import type { PooRecord } from '../types'
import { BRISTOL_OPTIONS, optionOf } from '../types'
import { useRecords } from '../lib/store'
import {
  addMonths,
  daysInMonth,
  firstWeekday,
  startOfMonthKey,
  dateKey,
  relativeDay,
  formatDuration,
  timeOfDay,
  toTimestamp,
  WEEK_LABELS,
} from '../lib/date'
import { RecordForm } from '../components/RecordForm'
import { RecordRow } from '../components/RecordRow'

function dayColor(recs: PooRecord[]): string | undefined {
  const produced = recs.filter((r) => r.produced && r.shape)
  if (!produced.length) return undefined
  return optionOf(BRISTOL_OPTIONS, produced[0].shape)?.color
}

export function CalendarPage() {
  const records = useRecords()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [sel, setSel] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [edit, setEdit] = useState<PooRecord | undefined>()
  const [initialStartAt, setInitialStartAt] = useState<number | undefined>()

  const dim = daysInMonth(year, month)
  const fw = firstWeekday(year, month)
  const cells: (string | null)[] = []
  for (let i = 0; i < fw; i++) cells.push(null)
  for (let d = 1; d <= dim; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }

  const byDate = new Map<string, PooRecord[]>()
  records.forEach((r) => {
    if (!byDate.has(r.date)) byDate.set(r.date, [])
    byDate.get(r.date)!.push(r)
  })

  const monthStart = startOfMonthKey(year, month)
  const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(dim).padStart(2, '0')}`
  const monthRecords = records.filter((r) => r.date >= monthStart && r.date <= monthEnd)
  const avgDur = monthRecords.length
    ? monthRecords.reduce((a, r) => a + r.durationSec, 0) / monthRecords.length
    : 0

  function prev() {
    const p = addMonths(year, month, -1)
    setYear(p.year)
    setMonth(p.month)
    setSel(null)
  }
  function next() {
    const n = addMonths(year, month, 1)
    setYear(n.year)
    setMonth(n.month)
    setSel(null)
  }

  const selRecords = sel
    ? (byDate.get(sel) ?? []).slice().sort((a, b) => b.startAt - a.startAt)
    : []

  function openEditRec(r: PooRecord) {
    setEdit(r)
    setInitialStartAt(undefined)
    setFormOpen(true)
  }
  function backfillSel() {
    if (!sel) return
    setEdit(undefined)
    setInitialStartAt(toTimestamp(sel, timeOfDay(Date.now())))
    setFormOpen(true)
  }

  const today = dateKey()

  return (
    <div className="page">
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-ghost" onClick={prev}>
            ‹
          </button>
          <strong>
            {year} 年 {month + 1} 月
          </strong>
          <button className="btn btn-ghost" onClick={next}>
            ›
          </button>
        </div>
        <div className="cal-grid" style={{ marginTop: 12 }}>
          {WEEK_LABELS.map((w) => (
            <div key={w} style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-soft)' }}>
              {w}
            </div>
          ))}
          {cells.map((c, idx) => {
            if (!c) return <div key={'e' + idx} className="cal-cell muted" style={{ opacity: 0 }} />
            const recs = byDate.get(c) ?? []
            const col = dayColor(recs)
            return (
              <button
                key={c}
                className={'cal-cell' + (c === today ? ' today' : '')}
                onClick={() => setSel(c)}
              >
                <span style={{ fontWeight: 600 }}>{Number(c.slice(8, 10))}</span>
                {recs.length > 0 && <span className="cnt">{recs.length}</span>}
                {col && <span className="dot" style={{ background: col }} />}
              </button>
            )
          })}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'var(--ink-soft)',
            marginTop: 10,
          }}
        >
          <span>本月 {monthRecords.length} 次</span>
          <span>平均时长 {formatDuration(avgDur)}</span>
        </div>
      </div>

      {sel && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="section-title" style={{ marginTop: 0 }}>
            {relativeDay(sel)} · {selRecords.length} 次
          </div>
          {selRecords.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>这天没有记录</div>
          ) : (
            selRecords.map((r) => <RecordRow key={r.id} rec={r} onEdit={openEditRec} />)
          )}
          <button className="btn btn-accent btn-block" style={{ marginTop: 10 }} onClick={backfillSel}>
            ＋ 在 {sel} 补记
          </button>
        </div>
      )}

      <div className="section-title" style={{ marginTop: 18 }}>
        全部记录 · {records.length} 条
      </div>
      {records.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', padding: '0 4px' }}>
          还没有任何记录，点「今天」开始第一条吧
        </div>
      ) : (
        records.map((r) => <RecordRow key={r.id} rec={r} onEdit={openEditRec} />)
      )}

      <RecordForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editRecord={edit}
        initialStartAt={initialStartAt}
      />
    </div>
  )
}

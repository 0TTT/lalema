import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  PooRecord,
  RecordDraft,
  BristolType,
  StoolColor,
  Amount,
  Effort,
  Smell,
  Blood,
  Belly,
  Mood,
} from '../types'
import {
  BRISTOL_OPTIONS,
  COLOR_OPTIONS,
  AMOUNT_OPTIONS,
  EFFORT_OPTIONS,
  SMELL_OPTIONS,
  BLOOD_OPTIONS,
  BELLY_OPTIONS,
  MOOD_OPTIONS,
} from '../types'
import { dateKey, timeOfDay, toTimestamp, formatDuration } from '../lib/date'
import { recordsStore } from '../lib/store'
import { Sheet, OptionPicker, Switch, toastStore } from './ui'
import type { TimerResult } from './Timer'

interface Props {
  open: boolean
  onClose: () => void
  preFill?: TimerResult
  editRecord?: PooRecord
  duplicate?: PooRecord
  initialStartAt?: number
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="field">
      <label>
        {label}
        {hint && <span className="hint">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export function RecordForm({ open, onClose, preFill, editRecord, duplicate, initialStartAt }: Props) {
  const [startAt, setStartAt] = useState(Date.now())
  const [durationSec, setDurationSec] = useState(0)
  const [produced, setProduced] = useState(true)
  const [shape, setShape] = useState<BristolType>('t4')
  const [color, setColor] = useState<StoolColor>('brown')
  const [amount, setAmount] = useState<Amount>('normal')
  const [effort, setEffort] = useState<Effort>('normal')
  const [smell, setSmell] = useState<Smell>('normal')
  const [blood, setBlood] = useState<Blood>('none')
  const [sticky, setSticky] = useState(false)
  const [belly, setBelly] = useState<Belly>('normal')
  const [mood, setMood] = useState<Mood>('good')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) return
    const base = editRecord ?? duplicate
    const s =
      editRecord?.startAt ??
      (duplicate ? Date.now() : (preFill?.startAt ?? initialStartAt ?? Date.now()))
    setStartAt(s)
    setDurationSec(editRecord?.durationSec ?? duplicate?.durationSec ?? preFill?.durationSec ?? 0)
    setProduced(base?.produced ?? true)
    setShape(base?.shape ?? 't4')
    setColor(base?.color ?? 'brown')
    setAmount(base?.amount ?? 'normal')
    setEffort(base?.effort ?? 'normal')
    setSmell(base?.smell ?? 'normal')
    setBlood(base?.blood ?? 'none')
    setSticky(base?.sticky ?? false)
    setBelly(base?.belly ?? 'normal')
    setMood(base?.mood ?? 'good')
    setNote(base?.note ?? '')
  }, [open, preFill, editRecord, duplicate, initialStartAt])

  const dateStr = dateKey(startAt)
  const timeStr = timeOfDay(startAt)

  function onDateChange(v: string) {
    if (v) setStartAt(toTimestamp(v, timeStr))
  }
  function onTimeChange(v: string) {
    if (v) setStartAt(toTimestamp(dateStr, v))
  }

  async function save() {
    const draft: RecordDraft = {
      date: dateKey(startAt),
      startAt,
      endAt: startAt + durationSec * 1000,
      durationSec,
      produced,
      note: note.trim() || undefined,
    }
    if (produced) {
      draft.shape = shape
      draft.color = color
      draft.amount = amount
      draft.effort = effort
      draft.smell = smell
      draft.blood = blood
      draft.sticky = sticky
      draft.belly = belly
      draft.mood = mood
    }
    if (editRecord) {
      await recordsStore.edit(editRecord.id, draft)
      toastStore.show('已更新记录')
    } else {
      await recordsStore.add(draft)
      toastStore.show('已记录 💩')
    }
    onClose()
  }

  async function del() {
    if (!editRecord) return
    await recordsStore.remove(editRecord.id)
    toastStore.show('已删除')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={editRecord ? '编辑记录' : '记录这一次'}>
      <div className="field row">
        <div style={{ flex: 1.2 }}>
          <label>开始日期</label>
          <input
            type="date"
            className="input"
            value={dateStr}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>时间</label>
          <input
            type="time"
            className="input"
            value={timeStr}
            onChange={(e) => onTimeChange(e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label>时长（分 / 秒）</label>
        <div className="row">
          <input
            type="number"
            min={0}
            className="input"
            value={Math.floor(durationSec / 60)}
            onChange={(e) => setDurationSec(Math.max(0, Number(e.target.value)) * 60 + (durationSec % 60))}
          />
          <input
            type="number"
            min={0}
            max={59}
            className="input"
            value={durationSec % 60}
            onChange={(e) =>
              setDurationSec(
                Math.floor(durationSec / 60) * 60 + Math.min(59, Math.max(0, Number(e.target.value)))
              )
            }
          />
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
          合计 {formatDuration(durationSec)}
        </div>
      </div>

      <div
        className="field"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <label style={{ margin: 0 }}>这次排便了吗？</label>
        <Switch on={produced} onChange={setProduced} label={produced ? '排了' : '没排出来'} />
      </div>

      {produced && (
        <>
          <Field label="形状" hint="布里斯托分型">
            <OptionPicker options={BRISTOL_OPTIONS} value={shape} onChange={(v) => { if (v) setShape(v) }} />
          </Field>
          <Field label="颜色">
            <OptionPicker swatch options={COLOR_OPTIONS} value={color} onChange={(v) => { if (v) setColor(v) }} />
          </Field>
          <Field label="分量">
            <OptionPicker options={AMOUNT_OPTIONS} value={amount} onChange={(v) => { if (v) setAmount(v) }} />
          </Field>
          <Field label="排便感觉">
            <OptionPicker options={EFFORT_OPTIONS} value={effort} onChange={(v) => { if (v) setEffort(v) }} />
          </Field>
          <Field label="气味">
            <OptionPicker options={SMELL_OPTIONS} value={smell} onChange={(v) => { if (v) setSmell(v) }} />
          </Field>
          <Field label="出血情况">
            <OptionPicker options={BLOOD_OPTIONS} value={blood} onChange={(v) => { if (v) setBlood(v) }} />
          </Field>
          <div
            className="field"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <label style={{ margin: 0 }}>粘马桶吗？</label>
            <Switch on={sticky} onChange={setSticky} label={sticky ? '有点粘' : '不粘'} />
          </div>
          <Field label="拉完腹部">
            <OptionPicker options={BELLY_OPTIONS} value={belly} onChange={(v) => { if (v) setBelly(v) }} />
          </Field>
          <Field label="心情">
            <OptionPicker options={MOOD_OPTIONS} value={mood} onChange={(v) => { if (v) setMood(v) }} />
          </Field>
        </>
      )}

      <div className="field">
        <label>备注（可选）</label>
        <textarea
          className="textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="比如：昨晚吃了火锅、今天有点紧张…"
        />
      </div>

      <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
        {editRecord && (
          <button className="btn btn-danger" style={{ flex: '0 0 auto' }} onClick={del}>
            删除
          </button>
        )}
        <button className="btn btn-primary btn-block" onClick={save}>
          {editRecord ? '保存修改' : '完成记录'}
        </button>
      </div>
    </Sheet>
  )
}

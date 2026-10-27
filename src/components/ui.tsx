import { useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import type { OptionMeta } from '../types'

/* ---------------- 分段选择 ---------------- */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button
          key={o.value}
          className={o.value === value ? 'active' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ---------------- 图形化选项网格 ---------------- */
export function OptionPicker<T extends string>({
  options,
  value,
  onChange,
  swatch = false,
}: {
  options: OptionMeta<T>[]
  value?: T
  onChange: (v: T | undefined) => void
  swatch?: boolean
}) {
  return (
    <div className="opt-grid">
      {options.map((o) => (
        <button
          key={o.value}
          className={'opt' + (value === o.value ? ' selected' : '')}
          onClick={() => onChange(value === o.value ? undefined : o.value)}
          title={o.hint}
        >
          {swatch ? (
            <span className="dot" style={{ background: o.color }} />
          ) : (
            <span className="emoji">{o.emoji}</span>
          )}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  )
}

/* ---------------- 底部弹层 ---------------- */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="sheet-mask" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <div className="sheet-head">
          <h3>{title}</h3>
          <button className="btn btn-ghost" onClick={onClose}>
            关闭
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ---------------- 横幅提示 ---------------- */
export function Banner({
  tone,
  children,
}: {
  tone: 'info' | 'warn' | 'danger' | 'good'
  children: ReactNode
}) {
  return <div className={'banner ' + tone}>{children}</div>
}

/* ---------------- 统计卡 ---------------- */
export function Stat({
  value,
  unit,
  label,
}: {
  value: ReactNode
  unit?: string
  label: string
}) {
  return (
    <div className="stat">
      <div className="v">
        {value}
        {unit && <small> {unit}</small>}
      </div>
      <div className="k">{label}</div>
    </div>
  )
}

/* ---------------- 开关 ---------------- */
export function Switch({
  on,
  onChange,
  label,
}: {
  on: boolean
  onChange: (v: boolean) => void
  label?: string
}) {
  return (
    <button
      type="button"
      className={'switch' + (on ? ' on' : '')}
      onClick={() => onChange(!on)}
    >
      <span className="track">
        <span className="knob" />
      </span>
      {label && <span>{label}</span>}
    </button>
  )
}

/* ---------------- 空状态 ---------------- */
export function EmptyHint({ icon = '📭', text }: { icon?: string; text: string }) {
  return (
    <div className="empty">
      <div className="big">{icon}</div>
      {text}
    </div>
  )
}

/* ---------------- Toast ---------------- */
let toastMsg: string | null = null
const toastListeners = new Set<() => void>()

export const toastStore = {
  subscribe(l: () => void) {
    toastListeners.add(l)
    return () => {
      toastListeners.delete(l)
    }
  },
  get() {
    return toastMsg
  },
  show(msg: string) {
    toastMsg = msg
    toastListeners.forEach((l) => l())
    window.setTimeout(() => {
      if (toastMsg === msg) {
        toastMsg = null
        toastListeners.forEach((l) => l())
      }
    }, 2200)
  },
}

export function useToast() {
  return useSyncExternalStore(toastStore.subscribe, toastStore.get)
}

export function ToastHost() {
  const msg = useToast()
  if (!msg) return null
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 104,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(40,30,20,0.92)',
        color: '#fff',
        padding: '10px 16px',
        borderRadius: 12,
        fontSize: 13,
        zIndex: 80,
        maxWidth: 300,
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      {msg}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { formatClock } from '../lib/date'

export interface TimerResult {
  startAt: number
  endAt: number
  durationSec: number
}

export function Timer({ onFinish }: { onFinish: (r: TimerResult) => void }) {
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number>(0)
  const baseRef = useRef<number>(0)

  useEffect(() => {
    if (!running || paused) return
    const id = window.setInterval(() => {
      setElapsed(baseRef.current + (Date.now() - startRef.current) / 1000)
    }, 250)
    return () => window.clearInterval(id)
  }, [running, paused])

  function start() {
    startRef.current = Date.now()
    baseRef.current = 0
    setElapsed(0)
    setPaused(false)
    setRunning(true)
  }

  function togglePause() {
    if (paused) {
      startRef.current = Date.now()
      setPaused(false)
    } else {
      baseRef.current += (Date.now() - startRef.current) / 1000
      setPaused(true)
    }
  }

  function finish() {
    const dur = paused
      ? baseRef.current
      : baseRef.current + (Date.now() - startRef.current) / 1000
    const end = Date.now()
    const start = end - Math.round(dur * 1000)
    setRunning(false)
    setPaused(false)
    onFinish({ startAt: start, endAt: end, durationSec: Math.max(1, Math.round(dur)) })
  }

  function cancel() {
    setRunning(false)
    setPaused(false)
    setElapsed(0)
  }

  if (!running) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 24 }}>
        <button className="timer-btn" onClick={start}>
          <span className="clock">🚽</span>
          开始记录
        </button>
        <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 14 }}>
          坐下那一刻点开始，起来点结束
        </p>
      </div>
    )
  }

  return (
    <div className="card" style={{ textAlign: 'center', padding: 24 }}>
      <button className="timer-btn running" onClick={finish}>
        <span className="clock">{formatClock(elapsed)}</span>
        {paused ? '已暂停' : '结束'}
      </button>
      <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button className="btn" onClick={togglePause}>
          {paused ? '继续' : '暂停'}
        </button>
        <button className="btn btn-danger" onClick={cancel}>
          取消
        </button>
      </div>
    </div>
  )
}

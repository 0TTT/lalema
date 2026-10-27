import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useRecords } from '../lib/store'
import { computeStats } from '../lib/stats'
import { Segmented, Stat, EmptyHint } from '../components/ui'
import { DistBars, TrendChart } from '../components/charts'
import { dateKey, addDays, formatDuration } from '../lib/date'

const RANGES = [
  { value: '7', label: '近7天' },
  { value: '30', label: '近30天' },
  { value: '90', label: '近90天' },
  { value: 'all', label: '全部' },
]

function Sub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  )
}

function RegLine({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
      <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{label}</span>
      <span style={{ fontWeight: 700 }}>
        {value}
        {hint && (
          <small style={{ color: 'var(--ink-soft)', fontWeight: 400, marginLeft: 6 }}>({hint})</small>
        )}
      </span>
    </div>
  )
}

export function StatsPage() {
  const records = useRecords()
  const [range, setRange] = useState('30')

  const filtered = useMemo(() => {
    if (range === 'all') return records
    const start = addDays(dateKey(), -(Number(range) - 1))
    return records.filter((r) => r.date >= start)
  }, [records, range])

  const s = useMemo(() => computeStats(filtered), [filtered])

  if (records.length === 0) {
    return (
      <div className="page">
        <EmptyHint icon="📊" text="还没有数据，先去「今天」记录几次吧" />
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Segmented options={RANGES} value={range} onChange={setRange} />
      </div>

      <div className="section-title">概览</div>
      <div className="stat-grid">
        <Stat value={s.total} label="总记录次数" />
        <Stat value={s.daysWithRecord} label="有记录天数" />
        <Stat value={s.avgPerDay.toFixed(1)} label="日均次数" />
        <Stat value={formatDuration(s.avgDuration)} label="平均时长" />
        <Stat value={formatDuration(s.medianDuration)} label="时长中位数" />
        <Stat value={s.maxDuration ? formatDuration(s.maxDuration) : '—'} label="最长一次" />
      </div>

      <div className="section-title">排便形状分布</div>
      <div className="card">
        {s.shapeDist.length ? <DistBars items={s.shapeDist} /> : <EmptyHint text="这一时期暂无排便记录" />}
      </div>

      <div className="section-title">颜色分布</div>
      <div className="card">
        {s.colorDist.length ? <DistBars items={s.colorDist} /> : <EmptyHint text="暂无记录" />}
      </div>

      <div className="section-title">分量 / 感觉 / 腹部 / 心情</div>
      <div className="card stack">
        <Sub title="分量">
          {s.amountDist.length ? <DistBars items={s.amountDist} /> : <EmptyHint text="暂无" />}
        </Sub>
        <Sub title="排便感觉">
          {s.effortDist.length ? <DistBars items={s.effortDist} /> : <EmptyHint text="暂无" />}
        </Sub>
        <Sub title="拉完腹部">
          {s.bellyDist.length ? <DistBars items={s.bellyDist} /> : <EmptyHint text="暂无" />}
        </Sub>
        <Sub title="心情">
          {s.moodDist.length ? <DistBars items={s.moodDist} /> : <EmptyHint text="暂无" />}
        </Sub>
      </div>

      <div className="section-title">时段分布（你通常什么时候拉）</div>
      <div className="card">
        <DistBars items={s.segmentDist} />
      </div>

      <div className="section-title">周内分布</div>
      <div className="card">
        <DistBars items={s.weekdayDist} />
      </div>

      <div className="section-title">趋势（每日次数 + 平均时长）</div>
      <div className="card">
        <TrendChart data={s.trend} />
      </div>

      <div className="section-title">规律性</div>
      <div className="card stack">
        <RegLine label="晨便率（6–10 点）" value={`${(s.morningRate * 100).toFixed(0)}%`} />
        <RegLine
          label="相邻间隔中位数"
          value={s.avgIntervalH ? `${s.avgIntervalH.toFixed(1)} 小时` : '—'}
        />
        <RegLine
          label="排便时刻波动"
          value={s.clockStdMin ? `${s.clockStdMin.toFixed(0)} 分钟` : '—'}
          hint={s.clockStdMin < 60 ? '很规律' : s.clockStdMin < 120 ? '一般' : '较分散'}
        />
      </div>

      <div style={{ height: 20 }} />
    </div>
  )
}

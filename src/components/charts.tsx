import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { DistItem, TrendPoint } from '../lib/stats'
import { EmptyHint } from './ui'

export function DistBars({ items }: { items: DistItem[] }) {
  const max = Math.max(1, ...items.map((i) => i.count))
  return (
    <div>
      {items.map((i) => (
        <div className="bar-row" key={i.value}>
          <span className="bar-label">
            {i.emoji} {i.label}
          </span>
          <span className="bar-track">
            <span
              className="bar-fill"
              style={{ width: `${(i.count / max) * 100}%`, background: i.color }}
            />
          </span>
          <span className="bar-num">{i.count}</span>
        </div>
      ))}
    </div>
  )
}

function fmtDate(d: string) {
  return d.length >= 10 ? d.slice(5) : d
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) return <EmptyHint text="这段时间还没有记录" />
  return (
    <div style={{ width: '100%', height: 224 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EADFD0" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fontSize: 10, fill: '#7A6A5E' }}
            interval="preserveStartEnd"
            minTickGap={18}
          />
          <YAxis
            yAxisId="l"
            tick={{ fontSize: 10, fill: '#7A6A5E' }}
            allowDecimals={false}
            width={28}
          />
          <YAxis
            yAxisId="r"
            orientation="right"
            tick={{ fontSize: 10, fill: '#7A6A5E' }}
            width={28}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #EADFD0',
              fontSize: 12,
            }}
            formatter={(value: number, name: string) =>
              name === '平均时长(分)' ? (value / 60).toFixed(1) + ' 分' : value
            }
            labelFormatter={(l) => String(l)}
          />
          <Bar yAxisId="l" dataKey="count" name="次数" fill="#C98A4B" radius={[4, 4, 0, 0]} barSize={10} />
          <Line
            yAxisId="r"
            type="monotone"
            dataKey="avgDuration"
            name="平均时长(分)"
            stroke="#8C6239"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

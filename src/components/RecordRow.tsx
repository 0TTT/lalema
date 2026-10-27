import type { PooRecord } from '../types'
import {
  emojiOf,
  BRISTOL_OPTIONS,
  EFFORT_OPTIONS,
  MOOD_OPTIONS,
  BLOOD_OPTIONS,
  labelOf,
} from '../types'
import { timeOfDay, formatDuration } from '../lib/date'

export function RecordRow({
  rec,
  onEdit,
}: {
  rec: PooRecord
  onEdit: (r: PooRecord) => void
}) {
  const main = rec.produced ? emojiOf(BRISTOL_OPTIONS, rec.shape) : '🚽'
  const tags: string[] = []
  if (rec.produced) {
    if (rec.effort) tags.push(labelOf(EFFORT_OPTIONS, rec.effort))
    if (rec.mood) tags.push(labelOf(MOOD_OPTIONS, rec.mood))
    if (rec.blood && rec.blood !== 'none') tags.push(labelOf(BLOOD_OPTIONS, rec.blood))
  }
  return (
    <div className="rec-item" onClick={() => onEdit(rec)}>
      <span className="emoji">{main}</span>
      <div className="meta">
        <div className="t1">
          {timeOfDay(rec.startAt)} · {formatDuration(rec.durationSec)}
        </div>
        <div className="t2">
          {rec.produced
            ? tags.map((t, i) => (
                <span className="tag" key={i}>
                  {t}
                </span>
              ))
            : '蹲了但没排出来'}
        </div>
      </div>
      <span style={{ color: 'var(--ink-soft)', fontSize: 20 }}>›</span>
    </div>
  )
}

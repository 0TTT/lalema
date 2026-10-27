import { useState } from 'react'
import type { PooRecord } from '../types'
import { useRecords } from '../lib/store'
import { RecordForm } from '../components/RecordForm'
import { RecordRow } from '../components/RecordRow'
import { Segmented, EmptyHint } from '../components/ui'

export function HistoryPage() {
  const records = useRecords()
  const [filter, setFilter] = useState<'all' | 'produced' | 'empty'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [edit, setEdit] = useState<PooRecord | undefined>()

  const list = records.filter((r) =>
    filter === 'all' ? true : filter === 'produced' ? r.produced : !r.produced
  )

  function openEdit(r: PooRecord) {
    setEdit(r)
    setFormOpen(true)
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Segmented
          options={[
            { value: 'all', label: '全部' },
            { value: 'produced', label: '排便' },
            { value: 'empty', label: '未排' },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>

      <div className="section-title">共 {list.length} 条</div>
      {list.length === 0 ? (
        <EmptyHint icon="📜" text="没有符合条件的记录" />
      ) : (
        list.map((r) => <RecordRow key={r.id} rec={r} onEdit={openEdit} />)
      )}

      <RecordForm open={formOpen} onClose={() => setFormOpen(false)} editRecord={edit} />
    </div>
  )
}

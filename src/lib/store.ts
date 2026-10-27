import { useSyncExternalStore } from 'react'
import type { PooRecord, RecordDraft } from '../types'
import { listRecords, createRecord, updateRecord, removeRecord, clearAll } from './storage'

let records: PooRecord[] = []
const listeners = new Set<() => void>()
let loaded = false

export async function initStore(): Promise<void> {
  if (loaded) return
  records = await listRecords()
  loaded = true
}

function emit() {
  listeners.forEach((l) => l())
}

export const recordsStore = {
  subscribe(l: () => void) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
  get() {
    return records
  },
  async reload() {
    records = await listRecords()
    emit()
  },
  async add(draft: RecordDraft) {
    const r = await createRecord(draft)
    records = [r, ...records]
    emit()
    return r
  },
  async edit(id: string, patch: Partial<RecordDraft>) {
    const r = await updateRecord(id, patch)
    records = records.map((x) => (x.id === id ? r : x))
    emit()
    return r
  },
  async remove(id: string) {
    await removeRecord(id)
    records = records.filter((x) => x.id !== id)
    emit()
  },
  async clear() {
    await clearAll()
    records = []
    emit()
  },
}

export function useRecords(): PooRecord[] {
  return useSyncExternalStore(recordsStore.subscribe, recordsStore.get)
}

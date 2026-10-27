import type { PooRecord, RecordDraft } from '../types'
import { dateKey, fromKey } from './date'
import { getAllRecords, putRecord, deleteRecord, clearRecords } from './db'

export function uid(): string {
  const c = globalThis.crypto as Crypto | undefined
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()
  return 'r-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

export async function listRecords(): Promise<PooRecord[]> {
  return getAllRecords()
}

export async function getById(id: string): Promise<PooRecord | undefined> {
  const all = await getAllRecords()
  return all.find((r) => r.id === id)
}

export async function createRecord(draft: RecordDraft): Promise<PooRecord> {
  const now = Date.now()
  const rec: PooRecord = { ...draft, id: uid(), createdAt: now, updatedAt: now }
  await putRecord(rec)
  return rec
}

export async function updateRecord(id: string, patch: Partial<RecordDraft>): Promise<PooRecord> {
  const all = await getAllRecords()
  const cur = all.find((r) => r.id === id)
  if (!cur) throw new Error('记录不存在: ' + id)
  const next: PooRecord = { ...cur, ...patch, updatedAt: Date.now() }
  await putRecord(next)
  return next
}

export async function removeRecord(id: string): Promise<void> {
  await deleteRecord(id)
}

export async function clearAll(): Promise<void> {
  await clearRecords()
}

export async function recordsBetween(startKey: string, endKey: string): Promise<PooRecord[]> {
  const all = await getAllRecords()
  return all.filter((r) => r.date >= startKey && r.date <= endKey)
}

export async function recordsInMonth(year: number, month: number): Promise<PooRecord[]> {
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const d = fromKey(start)
  d.setMonth(d.getMonth() + 1)
  const end = dateKey(d.getTime() - 86400000)
  return recordsBetween(start, end)
}

export async function latestRecord(): Promise<PooRecord | undefined> {
  const all = await getAllRecords()
  return all[0]
}

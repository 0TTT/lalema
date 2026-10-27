import type { PooRecord } from '../types'

const DB_NAME = 'lalema-db'
const DB_VERSION = 1
const STORE = 'records'
const META = 'meta'

let dbp: Promise<IDBDatabase> | null = null

function open(): Promise<IDBDatabase> {
  if (dbp) return dbp
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    // 防止极端情况下 IndexedDB 打开永久卡住
    const timer = setTimeout(() => reject(new Error('IndexedDB 打开超时')), 8000)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const s = db.createObjectStore(STORE, { keyPath: 'id' })
        s.createIndex('date', 'date', { unique: false })
        s.createIndex('startAt', 'startAt', { unique: false })
      }
      if (!db.objectStoreNames.contains(META)) {
        db.createObjectStore(META, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => {
      clearTimeout(timer)
      resolve(req.result)
    }
    req.onerror = () => {
      clearTimeout(timer)
      reject(req.error)
    }
    req.onblocked = () => {
      clearTimeout(timer)
      reject(new Error('IndexedDB 被阻塞'))
    }
  })
  return dbp
}

function run<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<any>
): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode)
        const r = fn(t.objectStore(store))
        r.onsuccess = () => resolve(r.result)
        r.onerror = () => reject(r.error)
      })
  )
}

export async function getAllRecords(): Promise<PooRecord[]> {
  const all = await run<unknown>(STORE, 'readonly', (s) => s.getAll())
  return (all as PooRecord[]).sort((a, b) => b.startAt - a.startAt)
}

export async function putRecord(r: PooRecord): Promise<void> {
  await run(STORE, 'readwrite', (s) => s.put(r))
}

export async function bulkPut(records: PooRecord[]): Promise<void> {
  const db = await open()
  await new Promise<void>((resolve, reject) => {
    const t = db.transaction(STORE, 'readwrite')
    const s = t.objectStore(STORE)
    records.forEach((r) => s.put(r))
    t.oncomplete = () => resolve()
    t.onerror = () => reject(t.error)
  })
}

export async function deleteRecord(id: string): Promise<void> {
  await run(STORE, 'readwrite', (s) => s.delete(id))
}

export async function clearRecords(): Promise<void> {
  await run(STORE, 'readwrite', (s) => s.clear())
}

export async function getMeta<T = unknown>(key: string): Promise<T | null> {
  const row = await run<{ key: string; value: T } | undefined>(META, 'readonly', (s) => s.get(key))
  return row ? row.value : null
}

export async function setMeta<T = unknown>(key: string, value: T): Promise<void> {
  await run(META, 'readwrite', (s) => s.put({ key, value }))
}

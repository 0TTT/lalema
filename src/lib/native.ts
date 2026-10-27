import { Capacitor } from '@capacitor/core'

export interface NativeTimerPlugin {
  start: (opts: { startAt: number }) => Promise<void>
  stop: () => Promise<void>
  requestPermissions: () => Promise<void>
  addListener: (
    event: 'finished',
    cb: (data: { startAt: number }) => void
  ) => Promise<{ remove: () => void }>
}

export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

export function nativeTimer(): NativeTimerPlugin | null {
  if (!isNativeAndroid()) return null
  const p = (Capacitor as unknown as { Plugins?: { NativeTimer?: NativeTimerPlugin } }).Plugins
    ?.NativeTimer
  return p ?? null
}

import { registerPlugin, Capacitor } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'

export interface NativeTimerPlugin {
  start: (opts: { startAt: number }) => Promise<void>
  stop: () => Promise<void>
  requestPermissions: () => Promise<void>
  addListener: (
    event: 'finished',
    cb: (data: { startAt: number }) => void
  ) => Promise<PluginListenerHandle>
}

const NativeTimer = registerPlugin<NativeTimerPlugin>('NativeTimer', {
  web: () => ({
    start: async () => {},
    stop: async () => {},
    requestPermissions: async () => {},
    addListener: async () => ({ remove: async () => {} }),
  }),
})

export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

export function nativeTimer(): NativeTimerPlugin | null {
  if (!isNativeAndroid()) return null
  return NativeTimer
}

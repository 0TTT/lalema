import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.lalema.app',
  appName: '拉了吗',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config

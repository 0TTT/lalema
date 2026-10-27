import { useState, useEffect } from 'react'
import { Today } from './pages/Today'
import { CalendarPage } from './pages/CalendarPage'
import { StatsPage } from './pages/StatsPage'
import { SettingsPage } from './pages/SettingsPage'
import { Sheet, Banner, ToastHost } from './components/ui'
import { getMeta, setMeta } from './lib/db'
import { isNativeAndroid } from './lib/native'

type Tab = 'today' | 'calendar' | 'stats' | 'settings'

const TABS: { key: Tab; ic: string; label: string }[] = [
  { key: 'today', ic: '🚽', label: '今天' },
  { key: 'calendar', ic: '📅', label: '日历' },
  { key: 'stats', ic: '📊', label: '统计' },
  { key: 'settings', ic: '👤', label: '我的' },
]

const TAB_TITLE: Record<Tab, string> = {
  today: '今天',
  calendar: '日历',
  stats: '统计',
  settings: '我的',
}

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [showDisc, setShowDisc] = useState(false)

  useEffect(() => {
    getMeta<boolean>('disclaimer').then((v) => {
      if (!v) setShowDisc(true)
    })
  }, [])

  // 安卓原生：状态栏不覆盖内容，避免标题顶到状态栏
  useEffect(() => {
    if (!isNativeAndroid()) return
    import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {})
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
    })
  }, [])

  function accept() {
    setMeta('disclaimer', true)
    setShowDisc(false)
  }

  const Page = {
    today: Today,
    calendar: CalendarPage,
    stats: StatsPage,
    settings: SettingsPage,
  }[tab]

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>拉了吗</h1>
        <span className="sub">{TAB_TITLE[tab]}</span>
      </header>

      <Page />

      <nav className="bottom-nav">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={t.key === tab ? 'active' : ''}
            onClick={() => setTab(t.key)}
          >
            <span className="ic">{t.ic}</span>
            {t.label}
          </button>
        ))}
      </nav>

      <Sheet open={showDisc} onClose={accept} title="开始之前">
        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--ink)' }}>
          <p>
            「拉了吗」帮你记录如厕时长与便便状态，用日历和趋势看见自己的肠道规律。
          </p>
          <Banner tone="info">
            ⚕️ 本工具仅用于个人记录与自我观察，<b>不构成任何医疗建议</b>。如有便血、持续腹泻或便秘等异常，请及时就医（消化内科）。
          </Banner>
          <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>
            你的全部数据只保存在本机，不会上传任何服务器。
          </p>
        </div>
        <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={accept}>
          我已知晓，开始使用
        </button>
      </Sheet>

      <ToastHost />
    </div>
  )
}

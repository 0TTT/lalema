import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initStore } from './lib/store'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error) {
    console.error('[拉了吗] 渲染崩溃:', error)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif', color: '#3b2f2a', maxWidth: 560, margin: '0 auto' }}>
          <h3 style={{ marginTop: 0 }}>应用出错了</h3>
          <p style={{ fontSize: 13, color: '#7a6a5e' }}>请把下面这行截图反馈：</p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontSize: 12,
              background: '#f4ece0',
              padding: 12,
              borderRadius: 8,
              lineHeight: 1.6,
            }}
          >
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

const el = document.getElementById('root')
if (el) {
  // 先立即渲染界面，不等待数据加载，避免 IndexedDB 阻塞导致白屏
  createRoot(el).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  )
  // 数据在后台异步加载，加载完成后会自动刷新界面
  initStore().catch((e) => console.error('[拉了吗] 加载数据失败:', e))
}

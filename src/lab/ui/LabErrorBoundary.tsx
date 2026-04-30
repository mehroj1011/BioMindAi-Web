import { Component, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  err: Error | null
}

export class LabErrorBoundary extends Component<Props, State> {
  state: State = { err: null }

  static getDerivedStateFromError(err: Error): State {
    return { err }
  }

  componentDidCatch(err: Error) {
    console.error('[Lab] Uncaught error', err)
  }

  render() {
    if (!this.state.err) return this.props.children

    const msg = this.state.err?.message || String(this.state.err)
    return (
      <div className="mx-auto grid max-w-3xl gap-4 p-6">
        <div className="glass-premium-strong rounded-[32px] p-6">
          <div className="text-sm font-semibold text-bm-text">Лаборатория: хато</div>
          <div className="mt-2 whitespace-pre-wrap rounded-2xl border border-red-400/25 bg-red-500/10 p-4 font-mono text-[12px] leading-relaxed text-red-100">
            {msg}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => this.setState({ err: null })}
              className="rounded-2xl border border-white/12 bg-white/6 px-4 py-2 text-xs font-semibold text-bm-text transition hover:bg-white/10"
            >
              Кӯшиши дубора
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded-2xl border border-white/12 bg-white/6 px-4 py-2 text-xs font-semibold text-bm-text transition hover:bg-white/10"
            >
              Навсозӣ
            </button>
          </div>
          <div className="mt-3 text-xs text-bm-muted">
            Агар ин такрор шавад, хатои боло сабабро нишон медиҳад (консоль ҳам маълумоти бештар дорад).
          </div>
        </div>
      </div>
    )
  }
}


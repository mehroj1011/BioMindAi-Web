import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLocalStorageString, setLocalStorageString, storageKeys } from '../lib/storage'

type OnboardingState = { completed: boolean; displayName: string; goal: string }

function loadOnboarding(): OnboardingState {
  const raw = getLocalStorageString(storageKeys.onboarding)
  if (raw) {
    try {
      const j = JSON.parse(raw) as Partial<OnboardingState>
      return {
        completed: Boolean(j.completed),
        displayName: String(j.displayName || '').trim(),
        goal: String(j.goal || '').trim(),
      }
    } catch {
      // ignore
    }
  }
  return { completed: false, displayName: '', goal: 'Омодагӣ ба имтиҳон' }
}

function saveOnboarding(s: OnboardingState) {
  setLocalStorageString(storageKeys.onboarding, JSON.stringify(s))
}

export function OnboardingPage() {
  const nav = useNavigate()
  const initial = useMemo(() => loadOnboarding(), [])
  const [name, setName] = useState(initial.displayName)
  const [goal, setGoal] = useState(initial.goal)

  return (
    <section className="glass rounded-3xl p-6 sm:p-10">
      <h2 className="text-2xl font-semibold tracking-tight">Хуш омадед!</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bm-muted sm:text-base">
        Ин 30 сония мегирад. Мо танҳо чанд чизро медонем, то таҷрибаи омӯзиш беҳтар шавад.
      </p>

      <div className="mt-6 grid gap-3">
        <label className="text-sm text-bm-muted">Номи шумо</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Масалан: Меҳрҷон"
          className="w-full rounded-2xl border border-bm-border bg-black/20 px-4 py-3 text-sm text-bm-text outline-none ring-0 focus:border-white/30"
        />

        <label className="mt-3 text-sm text-bm-muted">Ҳадаф</label>
        <select
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="w-full rounded-2xl border border-bm-border bg-black/20 px-4 py-3 text-sm text-bm-text outline-none ring-0 focus:border-white/30"
        >
          <option>Омодагӣ ба имтиҳон</option>
          <option>Такрори мавзӯъҳо</option>
          <option>Омӯзиши қадам‑ба‑қадам</option>
          <option>Шавқ/сайд: биология барои ҳаёт</option>
        </select>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => {
              saveOnboarding({ completed: true, displayName: name.trim(), goal })
              // Also pre-fill profile (optional convenience).
              setLocalStorageString(
                storageKeys.profile,
                JSON.stringify({ displayName: name.trim() }),
              )
              window.dispatchEvent(new Event('biomind:onboarding'))
              nav('/')
            }}
            className="rounded-2xl bg-gradient-to-r from-bm-emerald to-bm-cyan px-5 py-3 text-sm font-semibold text-black shadow-glass transition hover:opacity-95"
          >
            Оғоз мекунем
          </button>
          <button
            onClick={() => nav('/tutor')}
            className="rounded-2xl border border-bm-border bg-white/5 px-5 py-3 text-sm font-semibold text-bm-text transition hover:bg-white/8"
          >
            Бевосита ба AI
          </button>
        </div>
      </div>
    </section>
  )
}


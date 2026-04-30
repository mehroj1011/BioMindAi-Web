import { useMemo, useState } from 'react'
import { applyDailyStreak, loadProgress, nextLevelXp, resetProgress } from '../lib/progress'
import { getLocalStorageString, removeLocalStorage, setLocalStorageString, storageKeys } from '../lib/storage'

type ProfileState = { displayName: string }

function loadProfile(): ProfileState {
  const raw = getLocalStorageString(storageKeys.profile)
  if (raw) {
    try {
      const j = JSON.parse(raw) as Partial<ProfileState>
      return { displayName: String(j.displayName || '').trim() }
    } catch {
      // ignore
    }
  }
  return { displayName: '' }
}

function saveProfile(p: ProfileState) {
  setLocalStorageString(storageKeys.profile, JSON.stringify(p))
}

export function ProfilePage() {
  const initial = useMemo(() => loadProfile(), [])
  const [name, setName] = useState(initial.displayName)
  const [saved, setSaved] = useState(false)

  const p = useMemo(() => applyDailyStreak(loadProgress()), [])
  const cap = nextLevelXp(p.level)

  return (
    <section className="glass rounded-3xl p-6 sm:p-10">
      <h2 className="text-2xl font-semibold tracking-tight">Профил</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bm-muted sm:text-base">
        Ном ва маълумоти пешрафт (локалӣ). Баъдтар мо синхронизация илова мекунем.
      </p>

      <div className="mt-6 grid gap-3">
        <label className="text-sm text-bm-muted">Номи шумо</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Масалан: Меҳрҷон"
          className="w-full rounded-2xl border border-bm-border bg-black/20 px-4 py-3 text-sm text-bm-text outline-none ring-0 focus:border-white/30"
        />
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={() => {
              const v = name.trim()
              saveProfile({ displayName: v })
              setSaved(true)
              setTimeout(() => setSaved(false), 1200)
            }}
            className="rounded-2xl bg-gradient-to-r from-bm-emerald to-bm-cyan px-5 py-3 text-sm font-semibold text-black shadow-glass transition hover:opacity-95"
          >
            Нигоҳ доштан
          </button>
          <button
            onClick={() => {
              setName('')
              removeLocalStorage(storageKeys.profile)
              setSaved(true)
              setTimeout(() => setSaved(false), 1200)
            }}
            className="rounded-2xl border border-bm-border bg-white/5 px-5 py-3 text-sm font-semibold text-bm-text transition hover:bg-white/8"
          >
            Тоза кардан
          </button>
          {saved && <span className="self-center text-sm text-bm-muted">Омода</span>}
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Stat title="Сатҳ" value={`Lv ${p.level}`} hint="Геймификатсия" />
        <Stat title="XP" value={`${p.xp}/${cap}`} hint="То сатҳи нав" />
        <Stat title="Силсила" value={`${p.streakDays} рӯз`} hint="Ҳар рӯз омӯзиш" />
      </div>

      <div className="mt-8 rounded-3xl border border-bm-border bg-black/20 p-5">
        <div className="text-sm font-semibold">Идоракунии маълумот</div>
        <div className="mt-2 text-sm text-bm-muted">Агар хоҳед, метавонед пешрафтро аз нав оғоз кунед (нигоҳдории маҳаллӣ дар браузер).</div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => {
              resetProgress()
              window.location.reload()
            }}
            className="rounded-2xl border border-red-400/40 bg-white/5 px-5 py-3 text-sm font-semibold text-bm-text transition hover:bg-white/8"
          >
            Тоза кардани пешрафт
          </button>
        </div>
      </div>
    </section>
  )
}

function Stat({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-bm-border bg-white/5 p-5">
      <div className="text-xs text-bm-muted">{title}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-2 text-xs text-bm-muted">{hint}</div>
    </div>
  )
}


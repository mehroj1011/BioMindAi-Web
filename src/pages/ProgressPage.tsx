import { useMemo } from 'react'
import { applyDailyStreak, loadProgress, nextLevelXp } from '../lib/progress'

export function ProgressPage() {
  const p = useMemo(() => {
    return applyDailyStreak(loadProgress())
  }, [])

  const cap = nextLevelXp(p.level)
  const pct = Math.min(100, Math.round((p.xp / cap) * 100))

  return (
    <section className="glass rounded-3xl p-6 sm:p-10">
      <h2 className="text-2xl font-semibold tracking-tight">Пешрафт</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bm-muted sm:text-base">
        Ин ҷо ҳоло пешрафт дар нигоҳдории маҳаллӣ (дар браузер) нигоҳ дошта мешавад. Баъд онро бо сервер ҳамоҳанг мекунем.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Stat title="Сатҳ" value={`Lv ${p.level}`} hint="Геймификатсия" />
        <Stat title="XP" value={`${p.xp}/${cap}`} hint="То сатҳи нав" />
        <Stat title="Силсила" value={`${p.streakDays} рӯз`} hint="Ҳар рӯз омӯзиш" />
      </div>

      <div className="mt-6 rounded-3xl border border-bm-border bg-black/20 p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Пешрафт то сатҳи нав</div>
            <div className="mt-1 text-xs text-bm-muted">{pct}%</div>
          </div>
          <div className="text-xs text-bm-muted">Ҳадаф: {cap} XP</div>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/10 bg-black/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-bm-emerald to-bm-cyan"
            style={{ width: `${pct}%` }}
          />
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


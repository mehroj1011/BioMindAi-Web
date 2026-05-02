import { Link } from 'react-router-dom'

export function HomeScreen() {
  return (
    <div className="grid gap-6">
      <section className="glass rounded-3xl p-6 sm:p-10">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-bm-muted border border-bm-border">
              <span className="h-2 w-2 rounded-full bg-bm-emerald" />
              Платформаи нав барои омӯзиши биология
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Омӯзиш, таҷриба ва анатомияи 3D — ҳамааш дар як ҷо
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-bm-muted sm:text-base">
              БиоДониш — маҳсулоти таълимӣ бо интерфейси зебо ва равон. Ин веб-версия барои кор дар браузер тарҳрезӣ шудааст.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/tutor"
                className="rounded-2xl bg-gradient-to-r from-bm-emerald to-bm-cyan px-5 py-3 text-sm font-semibold text-black shadow-glass transition hover:opacity-95"
              >
                Оғоз кардан
              </Link>
              <Link
                to="/anatomy"
                className="rounded-2xl border border-bm-border bg-white/5 px-5 py-3 text-sm font-semibold text-bm-text transition hover:bg-white/8"
              >
                Анатомия 3D
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-bm-purple/20 via-bm-cyan/10 to-bm-emerald/10 blur-2xl" />
            <div className="glass-strong relative rounded-3xl p-6">
              <div className="grid gap-4">
                <Metric label="Дарс" value="1200+" hint="Мавзӯъҳои биология" />
                <Metric label="Лаб" value="3D" hint="Симулятсияҳои премиум" />
                <Metric label="Анатомия" value="3D" hint="Намоиши интерактивӣ" />
              </div>
              <div className="mt-6 rounded-2xl border border-bm-border bg-black/20 p-4 text-xs text-bm-muted">
                Ҳадаф: версияи веб бо тарҳи сатҳи премиум ва дастрасӣ аз ҳама браузерҳо.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickCard title="Дарс" desc="Хондан + квиз + XP" to="/lessons" accent="from-bm-emerald to-bm-cyan" />
        <QuickCard title="Мураббӣ (AI)" desc="Савол диҳед, ҷавоби тоҷикӣ гиред" to="/tutor" accent="from-bm-purple to-bm-cyan" />
        <QuickCard title="Лаборатория" desc="Симулятсияҳои 3D" to="/lab" accent="from-bm-amber to-bm-purple" />
        <QuickCard title="БиоСкан" desc="Камера + AI таҳлил" to="/bioscan" accent="from-bm-purple to-bm-emerald" />
        <QuickCard title="Анатомия 3D" desc="BioDigital дар браузер" to="/anatomy" accent="from-bm-cyan to-bm-emerald" />
        <QuickCard title="Android" desc="Зеркашии APK ва насб" to="/android" accent="from-bm-emerald to-bm-amber" />
        <QuickCard title="Пешрафт" desc="Сатҳ, XP, streak" to="/progress" accent="from-bm-emerald to-bm-purple" />
      </section>
    </div>
  )
}

function QuickCard({
  title,
  desc,
  to,
  accent,
}: {
  title: string
  desc: string
  to: string
  accent: string
}) {
  return (
    <Link to={to} className="glass group rounded-3xl p-6 transition hover:bg-white/10">
      <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${accent} opacity-90`} />
      <div className="mt-4 text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-bm-muted">{desc}</div>
      <div className="mt-5 text-xs text-bm-muted transition group-hover:text-bm-text">Кушодан →</div>
    </Link>
  )
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 rounded-2xl border border-bm-border bg-white/5 px-4 py-3">
      <div>
        <div className="text-xs text-bm-muted">{label}</div>
        <div className="text-xl font-semibold tracking-tight">{value}</div>
      </div>
      <div className="text-right text-xs text-bm-muted">{hint}</div>
    </div>
  )
}


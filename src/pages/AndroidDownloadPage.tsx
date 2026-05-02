import { useMemo, useState } from 'react'

const APK_PUBLIC_PATH = 'https://github.com/mehroj1011/BioMindAi/releases/latest/download/biomindai-android-latest.apk'
const APK_FILENAME = 'biomindai-android-latest.apk'
const BUILD_ID = '450901f'

export function AndroidDownloadPage() {
  const isAndroid = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    return /Android/i.test(navigator.userAgent)
  }, [])
  const [dlToken, setDlToken] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const [dlErr, setDlErr] = useState<string | null>(null)

  async function startDownload() {
    setDlErr(null)
    // Best UX: fetch → blob → download without leaving the page.
    try {
      setDownloading(true)
      const res = await fetch(APK_PUBLIC_PATH, { mode: 'cors' })
      if (!res.ok) throw new Error(`Код ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = APK_FILENAME
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
      return
    } catch (e) {
      // Fallback: trigger a download request without leaving the page (may still be blocked by some browsers).
      setDlErr('Агар зеркашӣ оғоз нашуд, аз “Линки захиравӣ” истифода баред.')
      setDlToken((x) => x + 1)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <section className="glass rounded-3xl p-6 sm:p-10">
        <h2 className="text-2xl font-semibold tracking-tight">Android (APK)</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bm-muted sm:text-base">
          Дар ин ҷо шумо метавонед APK‑и барномаро зеркашӣ кунед ва дар телефони Android насб кунед.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startDownload}
            disabled={downloading}
            className="rounded-2xl bg-gradient-to-r from-bm-emerald to-bm-cyan px-5 py-3 text-sm font-semibold text-black shadow-glass transition hover:opacity-95"
          >
            {downloading ? 'Зеркашӣ оғоз мешавад…' : 'Зеркашии APK'}
          </button>
          <a
            href={APK_PUBLIC_PATH}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-bm-border bg-white/5 px-5 py-3 text-sm font-semibold text-bm-text transition hover:bg-white/8"
          >
            Линки захиравӣ
          </a>
        </div>

        {/* Trigger download without leaving the page */}
        {dlToken > 0 && (
          <iframe
            key={dlToken}
            src={APK_PUBLIC_PATH}
            title="apk-download"
            className="hidden"
          />
        )}
        {dlErr && <div className="mt-3 text-xs text-bm-muted">{dlErr}</div>}

        <div className="mt-6 rounded-3xl border border-bm-border bg-black/20 p-5">
          <div className="text-sm font-semibold">Чӣ тавр насб кардан</div>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-bm-muted">
            <li>Тугмаи “Зеркашии APK”‑ро пахш кунед ва файлро гиред.</li>
            <li>Файлро аз “Downloads/Зеркашиҳо” кушоед.</li>
            <li>
              Агар Android иҷозат напурсад ё насбро манъ кунад, ба <span className="font-semibold">Settings → Security</span> (ё{' '}
              <span className="font-semibold">Privacy</span>) дароед ва иҷозати “Install unknown apps/Насб аз манбаи номаълум”‑ро барои браузер фаъол кунед.
            </li>
            <li>Боз ба файл баргардед ва “Install/Насб”‑ро пахш кунед.</li>
          </ol>
          {!isAndroid && (
            <div className="mt-4 text-xs text-bm-muted">
              Эзоҳ: шумо ҳоло дар Android нестед. Барои насб кардан, саҳифаро дар телефони Android кушоед.
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-bm-muted">
          <div className="font-semibold text-bm-text">Муҳим</div>
          <div className="mt-2 leading-relaxed">
            Ин тугма танҳо зеркашии файлро оғоз мекунад. Насбкунии худкор аз браузер имкон надорад — Android бояд тасдиқи корбарро гирад.
          </div>
          <div className="mt-3 text-[11px] font-mono text-bm-muted/80">Build: {BUILD_ID}</div>
        </div>
      </section>
    </div>
  )
}


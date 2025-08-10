import React, { useMemo, useState, useEffect } from 'react'
import { motion, animate, useMotionValue, useTransform } from 'framer-motion'

// ---------- CONFIG ----------
const CONFIG = {
  token: {
    name: 'YourMamaFat',
    ticker: 'MAMA',
    address: 'So1anaMintAddressGoesHere', // TODO: replace after launch
    pumpLink: 'https://pump.fun/create',   // TODO: replace with your token page
  },
  marketCap: {
    symbol: '$',
    decimals: 0,
    min: 0,
    max: 10_000_000,
    start: 25_000,
  },
  socials: [
    { label: 'X (Twitter)', href: 'https://x.com/yourmamafat' },
    { label: 'Telegram', href: 'https://t.me/yourmamafat' },
  ],
  // Evolution thresholds (USD). 35k = Candy Bars
  evolution: [
    { at: 0, label: 'Torn Armchair Mom', img: 'https://placehold.co/1000x1000.gif?text=Torn+Armchair+0$' },
    { at: 25_000, label: 'Snack Teaser', img: 'https://placehold.co/1000x1000.gif?text=Snack+Teaser+25k$' },
    { at: 35_000, label: 'Candy Bars', img: 'https://placehold.co/1000x1000.gif?text=Candy+Bars+35k$' },
    { at: 75_000, label: 'Snack Hoarder', img: 'https://placehold.co/1000x1000.gif?text=Snack+Hoarder+75k$' },
    { at: 150_000, label: 'Couch Queen', img: 'https://placehold.co/1000x1000.gif?text=Couch+Queen+150k$' },
    { at: 300_000, label: 'Buffet Boss', img: 'https://placehold.co/1000x1000.gif?text=Buffet+Boss+300k$' },
    { at: 1_000_000, label: 'VIP Lounge', img: 'https://placehold.co/1000x1000.gif?text=VIP+Lounge+1M$' },
    { at: 3_000_000, label: 'Deluxe Diva', img: 'https://placehold.co/1000x1000.gif?text=Deluxe+Diva+3M$' },
    { at: 5_000_000, label: 'Luxury Thick MOM', img: 'https://placehold.co/1000x1000.gif?text=Luxury+Thick+5M$' },
    { at: 10_000_000, label: 'Diamond Throne Goddess', img: 'https://placehold.co/1000x1000.gif?text=Diamond+Throne+10M$' },
  ],
}

// ---------- UTILS ----------
const classNames = (...xs) => xs.filter(Boolean).join(' ')
const formatMoney = (n, { symbol = '$', decimals = 0 } = {}) => symbol + Number(n).toLocaleString(undefined, { maximumFractionDigits: decimals })
const pickEvolutionStageByValue = (evolution, value) => {
  const sorted = [...evolution].sort((a, b) => a.at - b.at)
  let current = sorted[0]
  for (const stage of sorted) if (value >= stage.at) current = stage
  return current
}
const useEvolutionByCap = (cap) => useMemo(() => pickEvolutionStageByValue(CONFIG.evolution, cap), [cap])

// ---------- Widgets ----------
function MarketCapMeter({ cap, max }) {
  const mv = useMotionValue(cap)
  useEffect(() => { const controls = animate(mv, cap, { duration: 0.4 }); return controls.stop }, [cap])
  const display = useTransform(mv, (v) => formatMoney(v, CONFIG.marketCap))
  const pct = Math.max(0, Math.min(100, (cap / max) * 100))
  return (
    <div className="relative w-full">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/20 via-fuchsia-500/20 to-yellow-400/20 blur-2xl" />
      <div className="relative z-10 w-full rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest opacity-60">Market Cap</div>
            <motion.div className="text-4xl md:text-5xl font-extrabold leading-none">{display}</motion.div>
          </div>
          <div className="text-right text-xs opacity-60">
            <div>Next evolution at</div>
            <div className="font-mono">
              {(() => { const stages = [...CONFIG.evolution].sort((a, b) => a.at - b.at); const next = stages.find(s => s.at > cap); return next ? formatMoney(next.at, CONFIG.marketCap) : 'MAX' })()}
            </div>
          </div>
        </div>
        <div className="mt-4 w-full h-4 rounded-full bg-neutral-800 overflow-hidden">
          <motion.div className="h-full rounded-full bg-white" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
        </div>
      </div>
    </div>
  )
}

function Milestones({ cap }) {
  const milestones = [
    { cap: 25_000, title: '🥯 25k: Warm-up snacks' },
    { cap: 35_000, title: '🍫 35k: Candy Bars' },
    { cap: 75_000, title: '🍟 75k: Snack Hoarder' },
    { cap: 150_000, title: '🍔 150k: Couch Queen' },
    { cap: 300_000, title: '🍱 300k: Buffet Boss' },
    { cap: 1_000_000, title: '🥂 1M: VIP Lounge' },
    { cap: 3_000_000, title: '💎 3M: Deluxe Diva' },
    { cap: 5_000_000, title: '👑 5M: Luxury Thick MOM' },
    { cap: 10_000_000, title: '🎉 10M: Diamond Throne' },
  ]
  return (
    <ul className="flex flex-wrap gap-2 mt-4">
      {milestones.map(m => (
        <li key={m.cap} className={classNames('px-3 py-1 rounded-2xl text-xs border', cap >= m.cap ? 'bg-white text-black border-white' : 'border-neutral-700 text-neutral-300')}>{m.title}</li>
      ))}
    </ul>
  )
}

// ---------- Page ----------
export default function App() {
  const { min, max, start } = CONFIG.marketCap
  const [cap, setCap] = useState(start)
  const [manualMode, setManualMode] = useState(false)
  const evo = useEvolutionByCap(cap)

  useEffect(() => {
    if (manualMode) return
    const id = setInterval(() => { setCap(v => (v < max ? Math.min(v + Math.max(500, v * 0.02), max) : v)) }, 1100)
    return () => clearInterval(id)
  }, [manualMode, max])

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_60%_at_50%_0%,#1f2937,transparent),linear-gradient(180deg,#0a0a0a,#0b0b0b)] text-neutral-100 font-sans">
      <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div initial={{ rotate: -8 }} animate={{ rotate: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 14 }} className="w-10 h-10 rounded-2xl bg-neutral-100 text-black grid place-items-center text-sm font-extrabold">M</motion.div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">{CONFIG.token.name} <span className="opacity-70">({CONFIG.token.ticker})</span></h1>
            <p className="text-xs md:text-sm opacity-70">Fair‑launch Solana memecoin. No presale. No team allocation.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {CONFIG.socials.map(s => (
            <a key={s.label} className="text-sm md:text-base hover:opacity-80 underline underline-offset-4" href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-24">
        <section className="grid md:grid-cols-2 gap-8 items-center">
          <motion.img key={evo.img} src={evo.img} alt={evo.label} className="w-full rounded-3xl shadow-2xl" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} />

          <div>
            <h2 className="text-3xl font-extrabold mb-4">From torn armchair to luxury & thicker. 📈🍰</h2>
            <p className="opacity-85 mb-6">As <span className="font-semibold">market cap</span> climbs, MOM gets <span className="font-semibold">richer</span> and <span className="font-semibold">thicker</span>. Pump the cap, unlock evolutions, and watch {CONFIG.token.ticker} become <span className="font-bold">LUXURY THICK MOM</span>.</p>

            <div className="mb-3 flex items-center gap-2 text-xs opacity-70"><span>Market‑Cap Meter</span><span className="px-2 py-0.5 rounded-full border border-neutral-700">demo</span></div>
            <MarketCapMeter cap={cap} max={CONFIG.marketCap.max} />

            <Milestones cap={cap} />

            <div className="mt-5">
              <a href={CONFIG.token.pumpLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-extrabold hover:opacity-90 active:opacity-80 w-full md:w-auto">FEED MAMA <span aria-hidden>🍔</span></a>
              <div className="mt-2 text-xs opacity-60">Opens the official MAMA page on Pump.fun</div>
            </div>

            <div className="mt-6 rounded-2xl border border-neutral-800 p-3 bg-neutral-900/60">
              <div className="text-xs opacity-70 mb-2">Preview ⚙️ – move market cap locally</div>
              <div className="flex items-center gap-3">
                <label className="text-xs opacity-80"><input type="checkbox" className="mr-2" checked={manualMode} onChange={(e) => setManualMode(e.target.checked)} />Manual mode</label>
                <input type="range" min={min} max={max} step={100} value={cap} onChange={(e) => setCap(Math.max(min, Math.min(max, Number(e.target.value))))} className="flex-1" />
                <button type="button" className="px-3 py-1 rounded-xl border border-neutral-700 text-xs hover:bg-neutral-800" onClick={() => setCap(CONFIG.marketCap.start)}>Reset</button>
                <div className="text-xs opacity-70 font-mono min-w-[8ch] text-right">{formatMoney(cap, CONFIG.marketCap)}</div>
              </div>
            </div>

            <div className="mt-6 text-xs opacity-60">Disclaimer: Meme project. No promises. Not financial advice.</div>
          </div>
        </section>

        <footer className="mt-20 text-center opacity-60 text-xs">© {new Date().getFullYear()} {CONFIG.token.name}. Meme only. Built with ❤️.</footer>
      </main>
    </div>
  )
}
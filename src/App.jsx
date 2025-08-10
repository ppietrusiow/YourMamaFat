import React, { useMemo, useState, useEffect, useRef } from 'react'
import { motion, animate, useMotionValue, useTransform } from 'framer-motion'

// ---------- CONFIG ----------
const VIDEO_0K_WEBM = `${import.meta.env.BASE_URL}video/0_vp9.webm`;
const VIDEO_25K_WEBM = `${import.meta.env.BASE_URL}video/1_vp9.webm`;
const VIDEO_35K_WEBM = `${import.meta.env.BASE_URL}video/2_c_vp9.webm`;
const VIDEO_75K_WEBM = `${import.meta.env.BASE_URL}video/3_vp9.webm`;

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
    start: 0,
  },
  marketCapFeed: {
    provider: 'dexscreener',
    chain: 'solana',
    tokenAddress: 'So11111111111111111111111111111111111111112', // Twój przykładowy SOL
    supply: 340, // PRZYKŁAD! Podaj realną circulating supply dla testowanego tokena
    refreshMs: 10_000,
  },
  socials: [
    { label: 'X (Twitter)', href: 'https://x.com/yourmamafat' },
    { label: 'Telegram', href: 'https://t.me/yourmamafat' },
  ],
  // Evolution thresholds (USD). 35k = Candy Bars
  evolution: [
    { at: 0, label: 'Torn Armchair Mom', video: { webm: VIDEO_0K_WEBM} },
    { at: 25_000, label: 'Snack Teaser', video: { webm: VIDEO_25K_WEBM } },
    { at: 35_000, label: 'Candy Bars', video: { webm: VIDEO_35K_WEBM } },
    { at: 75_000, label: 'Snack Hoarder', video: { webm: VIDEO_75K_WEBM } },
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

function BadgeDot({ color = 'bg-white', children }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
      {children}
    </span>
  );
}

function Card({ children, className = '' }) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (+1 * y / (rect.height / 2)) * 6; // max 6deg
    const rotateY = (-1 * x / (rect.width / 2)) * 6;

    el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'rotateX(0) rotateY(0) scale(1)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out ${className}`}
      style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}


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

function EvolutionMedia({ evo }) {
  if (evo?.video) {
    const { mp4, webm } = typeof evo.video === 'string'
      ? { mp4: evo.video, webm: null }
      : evo.video;

    return (
      <motion.video
        key={webm || mp4} // 🔹 wymusza ponowne renderowanie przy zmianie źródła
        className="w-full rounded-3xl shadow-2xl"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        onError={(e) => console.warn('[MAMA] video error', e?.currentTarget?.error)}
      >
        {webm && <source src={webm} type="video/webm" />}
        {mp4 && <source src={mp4} type="video/mp4" />}
        Your browser does not support the video tag.
      </motion.video>
    );
  }

  return (
    <motion.img
      key={evo?.img}
      src={evo?.img}
      alt={evo?.label}
      className="w-full rounded-3xl shadow-2xl"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      onError={() => console.warn('[MAMA] image error', evo?.img)}
    />
  );
}
async function fetchDexScreenerMcapFromTokensV1({ chain, tokenAddress, supply }) {
  const url = `https://api.dexscreener.com/tokens/v1/${chain}/${tokenAddress}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`DexScreener ${res.status}`);
  const data = await res.json();

  // twoja zwrotka = tablica z obiektami, a w środku para(e)
  const first = Array.isArray(data) ? data[0] : null;
  const pair = first?.priceUsd ? first : first?.pairs?.[0];

  const price = Number(pair?.priceUsd);
  if (!isFinite(price) || !supply) throw new Error('Brak priceUsd albo supply');

  const mcap = price * Number(supply);
  return Math.max(0, Math.floor(mcap));
}


// ---------- Page ----------
export default function App() {
  const { min, max, start } = CONFIG.marketCap
  const [cap, setCap] = useState(start)
  const [manualMode, setManualMode] = useState(false)
  const evo = useEvolutionByCap(cap)

useEffect(() => {
  let id;
  const run = async () => {
    try {
      const next = await fetchDexScreenerMcapFromTokensV1({
        chain: CONFIG.marketCapFeed.chain,
        tokenAddress: CONFIG.marketCapFeed.tokenAddress,
        supply: CONFIG.marketCapFeed.supply,
      });
      setCap((prev) => (Number.isFinite(next) ? next : prev));
    } catch (e) {
      console.warn('[MAMA] mcap feed error, fallback to last value', e);
    }
  };

  // pierwszy strzał od razu:
  run();
  // potem co refreshMs:
  id = setInterval(run, CONFIG.marketCapFeed.refreshMs || 10000);

  return () => clearInterval(id);
}, []);

  // useEffect(() => {
  //   if (manualMode) return
  //   const id = setInterval(() => { setCap(v => (v < max ? Math.min(v + Math.max(500, v * 0.02), max) : v)) }, 1100)
  //   return () => clearInterval(id)
  // }, [manualMode, max])

const spawnFallingFood = () => {
  const foods = ['🍔', '🍕', '🍫', '🍩', '🍖', '🌮'];
  const emoji = document.createElement('div');
  emoji.textContent = foods[Math.floor(Math.random() * foods.length)];
  emoji.style.position = 'absolute';
  emoji.style.left = Math.random() * 100 + 'vw';
  emoji.style.top = '-50px';
  emoji.style.fontSize = 24 + Math.random() * 24 + 'px';
  emoji.style.transform = `rotate(${Math.random() * 360}deg)`;
  emoji.style.transition = 'transform 0.3s';
  emoji.style.zIndex = 9999;

  document.getElementById('falling-food-container').appendChild(emoji);

  // Animacja spadania
  const duration = 3000 + Math.random() * 2000;
  emoji.animate(
    [
      { transform: emoji.style.transform + ' translateY(0)', opacity: 1 },
      { transform: emoji.style.transform + ' translateY(110vh)', opacity: 0.8 }
    ],
    { duration, easing: 'linear' }
  );

  setTimeout(() => emoji.remove(), duration);
};

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_60%_at_50%_0%,#1f2937,transparent),linear-gradient(180deg,#0a0a0a,#0b0b0b)] text-neutral-100 font-sans">
      
      {/* Falling food emoji */}
      <div id="falling-food-container" className="pointer-events-none fixed inset-0 overflow-hidden z-50"></div>

      <header className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.img
            src="/YourMamaFat/mama.gif"
            alt="M"
            initial={{ rotate: -8, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            className="w-10 h-10 rounded-2xl object-cover"
          />
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
              {CONFIG.token.name} <span className="opacity-70">({CONFIG.token.ticker})</span>
            </h1>
            <p className="text-xs md:text-sm opacity-70">
              Fair-launch Solana memecoin. No presale. No team allocation.
            </p>
          </div>
        </div>

        {/* Socials — on mobile will stack below logo/title */}
        <div className="flex flex-wrap items-center gap-3">
          {CONFIG.socials.map(s => (
            <a
              key={s.label}
              className="text-sm md:text-base hover:opacity-80 underline underline-offset-4"
              href={s.href}
              target="_blank"
              rel="noreferrer"
            >
              {s.label}
            </a>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-24">
        <section className="grid md:grid-cols-2 gap-8 items-center">
          <EvolutionMedia evo={evo} />

          <div>
            <h2 className="text-3xl font-extrabold mb-4">From torn armchair to luxury & thicker. 📈🍰</h2>
            <p className="opacity-85 mb-6">As <span className="font-semibold">market cap</span> climbs, MOM gets <span className="font-semibold">richer</span> and <span className="font-semibold">thicker</span>. Pump the cap, unlock evolutions, and watch {CONFIG.token.ticker} become <span className="font-bold">LUXURY THICK MOM</span>.</p>

            <div className="mb-3 flex items-center gap-2 text-xs opacity-70"><span>Market‑Cap Meter</span></div>
            <MarketCapMeter cap={cap} max={CONFIG.marketCap.max} />

            <Milestones cap={cap} />

            <div className="mt-5">
              <a
                href={CONFIG.token.pumpLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-3xl 
                          bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 
                          text-black font-extrabold text-lg shadow-lg 
                          hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-400 
                          hover:shadow-yellow-400/50 
                          active:scale-95 transition-all duration-200 w-full md:w-auto"
              onMouseEnter={() => {
              // co 200ms spawn emoji, przestań po opuszczeniu
              window.foodInterval = setInterval(spawnFallingFood, 200);
              }}
              onMouseLeave={() => {
              clearInterval(window.foodInterval);
              }}
              >
                <span aria-hidden>🍩</span> FEED MAMA <span aria-hidden>🍖</span> 
              </a>
              <div className="mt-2 text-xs opacity-60 text-center md:text-left">
                Opens the official MAMA page on Pump.fun
              </div>
            </div>
           

            <div className="mt-6 text-xs opacity-60">Disclaimer: Meme project. No promises. Not financial advice.</div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 mt-16">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>

        {/* ===== About + Tokenomics ===== */}
        <section className="max-w-6xl mx-auto px-4 mt-20 space-y-10">
          {/* Title */}
          <div className="text-center">
            <h3 className="text-3xl md:text-4xl font-extrabold">About {CONFIG.token.name}</h3>
            <p className="mt-2 text-sm md:text-base opacity-70">
              More than a coin — it’s a meme metamorphosis fueled by market cap and community.
            </p>
          </div>

          {/* About cards */}
          <div className="grid md:grid-cols-3 gap-5">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-fuchsia-500/10 via-pink-500/5 to-amber-400/10" />
              <div className="flex items-start gap-3">
                <div className="shrink-0 grid place-items-center w-10 h-10 rounded-2xl bg-white text-black text-xl">💎</div>
                <div>
                  <h4 className="font-bold text-lg">Token Concept</h4>
                  <p className="opacity-80 text-sm mt-1">
                    {CONFIG.token.name} ({CONFIG.token.ticker}) is pure meme magic on Solana. No utility — just maximal fun.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-500/10 via-sky-500/5 to-lime-400/10" />
              <div className="flex items-start gap-3">
                <div className="shrink-0 grid place-items-center w-10 h-10 rounded-2xl bg-white text-black text-xl">🚀</div>
                <div>
                  <h4 className="font-bold text-lg">Fair Launch</h4>
                  <p className="opacity-80 text-sm mt-1">
                    Fair on pump.fun. No presale. No team tokens. No BS. Community-driven degeneracy only.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-rose-500/10 via-purple-500/5 to-cyan-400/10" />
              <div className="flex items-start gap-3">
                <div className="shrink-0 grid place-items-center w-10 h-10 rounded-2xl bg-white text-black text-xl">😂</div>
                <div>
                  <h4 className="font-bold text-lg">Meme Culture</h4>
                  <p className="opacity-80 text-sm mt-1">
                    Crypto should be fun. Your mama so fat, she broke the blockchain — let’s keep it that way.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tokenomics */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
            <div className="text-center mb-6">
              <h3 className="text-3xl font-extrabold">Tokenomics</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Distribution */}
              <div>
                <div className="text-xs uppercase tracking-widest opacity-60 mb-2">Distribution</div>
                <div className="space-y-2">
                  <BadgeDot color="bg-pink-500">100% Fair Launch</BadgeDot><br />
                  <BadgeDot color="bg-violet-500">0% Team Tokens</BadgeDot><br />
                  <BadgeDot color="bg-sky-500">0% Presale</BadgeDot>
                </div>
              </div>

              {/* Taxes */}
              <div>
                <div className="text-xs uppercase tracking-widest opacity-60 mb-2">Taxes</div>
                <div className="space-y-2">
                  <BadgeDot color="bg-emerald-500">0% Buy Tax</BadgeDot><br />
                  <BadgeDot color="bg-amber-500">0% Sell Tax</BadgeDot><br />
                  <BadgeDot color="bg-red-500">100% of your mama’s love</BadgeDot>
                </div>
              </div>
            </div>

            {/* Contract box */}
            <div className="mt-8">
              <div className="text-xs uppercase tracking-widest opacity-60 mb-2 text-center md:text-left">Contract Address</div>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <code className="font-mono text-sm break-all rounded-2xl bg-white/5 border border-white/10 px-4 py-3 flex-1">
                  {CONFIG.token.address}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(CONFIG.token.address)
                      .then(() => {
                        // prosty toastek bez biblioteki
                        const el = document.createElement('div');
                        el.textContent = 'Copied!';
                        el.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-white text-black text-sm shadow';
                        document.body.appendChild(el);
                        setTimeout(() => el.remove(), 1200);
                      })
                      .catch(() => console.warn('[MAMA] copy failed'));
                  }}
                  className="px-4 py-3 rounded-2xl bg-white text-black font-bold hover:opacity-90 active:opacity-80"
                >
                  Copy
                </button>
              </div>
            </div>
          </Card>
        </section>


        <footer className="mt-20 text-center opacity-60 text-xs">© {new Date().getFullYear()} {CONFIG.token.name}. Meme only. Built with ❤️.</footer>
      </main>
    </div>
  )
}
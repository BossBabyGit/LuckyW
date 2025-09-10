import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Sparkles, Gift, Trophy, ShieldCheck, Twitter, MessageCircle, Play, Copy, ExternalLink, Crown, Medal, Timer, Users } from "lucide-react";

// —— Brand Tokens ——
const KICK_GREEN = "#00e701"; // exact green

// —— Very light hash-based router (no extra deps) ——
function useHashRoute() {
  const [path, setPath] = useState(() => window.location.hash.replace("#", "") || "/");
  useEffect(() => {
    const onHash = () => setPath(window.location.hash.replace("#", "") || "/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const navigate = (to) => {
    if (!to.startsWith("#/")) to = `#${to.startsWith("/") ? to : "/" + to}`;
    if (window.location.hash !== to) window.location.hash = to;
  };
  return { path, navigate };
}

export default function App() {
  const { path } = useHashRoute();

  // Map hash path → page
  let Page = HomePage;
  if (path.startsWith("/bonuses")) Page = BonusesPage;
  if (path.startsWith("/leaderboards")) Page = LeaderboardsPage;

  return (
    <Layout>
      <Page />
    </Layout>
  );
}

// —— Shared Layout: background, particles, navbar, footer ——
function Layout({ children }) {
  return (
    <div className="relative min-h-screen text-white overflow-hidden selection:bg-[#00e701]/40 selection:text-white" style={{ backgroundColor: "black" }}>
      {/* BACKGROUND LAYERS */}
      <Noise />
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#030604] to-black" />
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(rgba(0,231,1,0.16) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
      </div>

      {/* PARTICLES */}
      <Particles />

      {/* NAVBAR */}
      <Navbar />

      {/* PAGE CONTENT */}
      <main className="relative z-20">{children}</main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

function Particles() {
  useEffect(() => {
    const canvas = document.getElementById("particles");
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let particlesArray = [];

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    function Particle(startBottom) {
      this.reset = function (sb) {
        const startFromBottom = typeof sb === "boolean" ? sb : false;
        this.x = Math.random() * canvas.width;
        this.y = startFromBottom ? canvas.height + Math.random() * canvas.height : canvas.height + Math.random() * 160;
        this.size = Math.random() * 1.6 + 0.7;
        this.speedY = -(Math.random() * 0.7 + 0.35);
        this.speedX = Math.random() * 0.3 - 0.15;
        this.alpha = Math.random() * 0.5 + 0.3;
        this.wobble = Math.random() * Math.PI * 2;
      };
      this.update = function () {
        this.y += this.speedY;
        this.x += Math.sin((this.wobble += 0.03)) * 0.15 + this.speedX;
        if (this.y < -20) this.reset(true);
      };
      this.draw = function () {
        ctx.save();
        ctx.beginPath();
        ctx.shadowBlur = 18;
        ctx.shadowColor = `rgba(0,231,1,${this.alpha})`;
        ctx.fillStyle = `rgba(0,231,1,${this.alpha})`;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      this.reset(typeof startBottom === "boolean" ? startBottom : true);
    }

    function init() {
      particlesArray = [];
      for (let i = 0; i < 200; i++) particlesArray.push(new Particle(true));
    }
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particlesArray) {
        p.update();
        p.draw();
      }
      raf = requestAnimationFrame(animate);
    }

    init();
    animate();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return <canvas id="particles" className="fixed top-0 left-0 w-full h-full z-10 pointer-events-none" />;
}

// —— Navbar & Footer (shared everywhere) ——
function Navbar() {
  const [open, setOpen] = useState(false);
  const link = (to, label) => (
    <a href={`#${to}`} className="hover:text-white">
      {label}
    </a>
  );
  return (
    <nav className="relative z-30">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between rounded-b-2xl border-b border-white/10 backdrop-blur supports-[backdrop-filter]:bg-black/40" style={{ boxShadow: "0 10px 40px -20px rgba(0,231,1,0.35)" }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `radial-gradient(ellipse at center, ${KICK_GREEN}, #007d00)`, boxShadow: "0 0 30px rgba(0,231,1,0.6)" }}>LW</div>
          <span className="text-2xl font-extrabold tracking-tight" style={{ color: KICK_GREEN }}>LuckyW</span>
        </div>
        <ul className="hidden md:flex items-center gap-8 text-sm md:text-base text-gray-300">
          <li>{link("/", "Home")}</li>
          <li>{link("/bonuses", "Bonuses")}</li>
          <li>{link("/leaderboards", "Leaderboards")}</li>
          <li><a href="#/rules" className="hover:text-white">Rules</a></li>
        </ul>
        <button aria-label="menu" className="md:hidden border rounded-xl px-3 py-2 text-sm" style={{ borderColor: KICK_GREEN, color: KICK_GREEN }} onClick={() => setOpen((v) => !v)}>
          Menu
        </button>
      </div>
      {open && (
        <div className="md:hidden mx-auto max-w-7xl px-6 py-3 grid gap-2 text-gray-200">
          {link("/", "Home")}
          {link("/bonuses", "Bonuses")}
          {link("/leaderboards", "Leaderboards")}
          <a href="#/rules">Rules</a>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="relative z-20 mt-10 border-t bg-black/70 backdrop-blur" style={{ borderColor: "rgba(0,231,1,0.2)" }}>
      <div className="mx-auto max-w-7xl px-6 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="text-2xl font-extrabold" style={{ color: KICK_GREEN }}>LuckyW</div>
          <p className="mt-3 text-sm text-gray-400">Live leaderboards and curated bonuses.</p>
        </div>
        <FooterCol title="Pages" links={["Home", "Bonuses", "Leaderboards"]} />
        <FooterCol title="Socials" links={["Kick", "Discord", "X"]} />
        <FooterCol title="Legal" links={["Terms", "Privacy", "Responsible Gaming"]} />
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-10 text-xs text-gray-500">© {new Date().getFullYear()} LuckyW — All rights reserved.</div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <div className="font-semibold mb-3" style={{ color: KICK_GREEN }}>{title}</div>
      <ul className="space-y-2 text-gray-300">
        {links.map((l) => (
          <li key={l} className="hover:text-white/90 cursor-pointer"><a href="#">{l}</a></li>
        ))}
      </ul>
    </div>
  );
}

function Noise() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 mix-blend-soft-light opacity-[0.06]"
      style={{
        backgroundImage:
          "url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 200 200\\'><filter id=\\'n\\'><feTurbulence type=\\'fractalNoise\\' baseFrequency=\\'.8\\' numOctaves=\\'2\\' stitchTiles=\\'stitch\\'/></filter><rect width=\\'100%\\' height=\\'100%\\' filter=\\'url(%23n)\\'/></svg>')",
        backgroundSize: "auto",
      }}
    />
  );
}

// =========================================================
// Pages
// =========================================================

// —— Home (based on LuckyW hero/sections) ——
function HomePage() {
  const heroRef = useRef(null);
  const scrollObj = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const orbOpacity = useTransform(scrollObj.scrollYProgress || 0, [0, 1], [0.35, 0]);

  const gradientRing = {
    boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 25px 60px -25px rgba(0,231,1,0.2)",
    border: "1px solid rgba(0,231,1,0.25)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))",
  };

  return (
    <>
      {/* HERO */}
      <section ref={heroRef} className="relative z-20 h-[92vh] flex items-center justify-center text-center px-6">
        <motion.div style={{ opacity: orbOpacity }} className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[62vmin] w-[62vmin] rounded-full blur-2xl" style={{ background: "radial-gradient(circle at center, rgba(0,231,1,0.28), transparent 60%)" }} />
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <motion.h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight" style={{ textShadow: "0 0 25px rgba(0,231,1,0.45)", color: "#fff" }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            Welcome to the <span style={{ color: KICK_GREEN }}>LuckyW Hub</span>
          </motion.h1>

          <motion.p className="mx-auto max-w-2xl text-base md:text-lg text-gray-300/90 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }}>
            Premium bonuses, live leaderboards, and a community built around good vibes (and better prizes).
          </motion.p>

          {/* Quick stats */}
          <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-3 mb-10" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.8 }}>
            {[
              { label: "Community", value: "1.000+" },
              { label: "Prizes Paid", value: "$5.000+" },
              { label: "Partners", value: "1" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-3 md:p-4 text-left" style={gradientRing}>
                <div className="text-xs uppercase tracking-wider text-gray-400">{s.label}</div>
                <div className="text-xl md:text-2xl font-extrabold" style={{ color: KICK_GREEN }}>{s.value}</div>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
            <a href="#/bonuses" className="relative overflow-hidden px-8 py-4 text-base md:text-lg rounded-2xl font-semibold inline-flex items-center justify-center" style={{ backgroundColor: KICK_GREEN, color: "#0a0a0a", boxShadow: "0 10px 35px rgba(0,231,1,0.35)" }}>
              <Gift className="mr-2" size={20} /> Bonuses
            </a>
            <a href="#/leaderboards" className="relative group px-8 py-4 text-base md:text-lg rounded-2xl font-semibold inline-flex items-center justify-center" style={{ border: `2px solid ${KICK_GREEN}`, boxShadow: "0 8px 30px rgba(0,231,1,0.18)" }}>
              <span className="relative z-10" style={{ color: KICK_GREEN }}><Trophy className="inline mr-2" size={20}/>Leaderboards</span>
              <span className="absolute inset-0 rounded-2xl -z-0 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300" style={{ backgroundColor: "rgba(0,231,1,0.12)" }} />
            </a>
          </motion.div>

          {/* Scroll cue */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 text-sm" style={{ color: KICK_GREEN }}>
            <div className="relative h-8 w-5 rounded-full border" style={{ borderColor: KICK_GREEN }}>
              <span className="absolute left-1/2 top-1 -translate-x-1/2 h-2 w-[2px] rounded-full" style={{ backgroundColor: KICK_GREEN, animation: "scrollDot 1.6s infinite" }} />
            </div>
            <ChevronDown className="animate-bounce" size={20} color={KICK_GREEN} />
          </div>
        </div>

        <style>{`@keyframes scrollDot {0%{opacity:1; transform:translate(-50%,0)}60%{opacity:0; transform:translate(-50%,10px)}100%{opacity:0}}`}</style>
      </section>

      {/* LEADERBOARD EXPLAINER */}
      <section className="relative z-20 py-24 px-6">
        <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ color: KICK_GREEN }}>How Leaderboards Work</h2>
            <p className="text-gray-300 mb-6">Wager on partnered sites, collect points, and climb the ranks. Monthly resets keep races fresh and competitive.</p>
            <ul className="space-y-3 text-gray-200">
              <li><span style={{ color: KICK_GREEN }}>•</span> Earn points by wagering on <b>Roobet</b></li>
              <li><span style={{ color: KICK_GREEN }}>•</span> Top ranks receive <b>CASH Prizes</b></li>
              <li><span style={{ color: KICK_GREEN }}>•</span> Anti-wager abuse & real-time updates</li>
            </ul>
            <div className="mt-8 flex gap-4">
              <a className="px-6 py-3 rounded-xl font-semibold" href="#/rules" style={{ border: `2px solid ${KICK_GREEN}`, color: KICK_GREEN }}>View Rules</a>
              <a className="px-6 py-3 rounded-xl font-semibold" href="#/leaderboards" style={{ backgroundColor: KICK_GREEN, color: "#0a0a0a" }}>Open Leaderboards</a>
            </div>
          </div>
          <div>
            <div className="w-full rounded-2xl overflow-hidden backdrop-blur" style={gradientRing}>
              <LeaderboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL STRIP */}
      <section className="relative z-20 px-6 pb-10">
        <div className="mx-auto max-w-7xl grid sm:grid-cols-3 gap-4">
          <a href="#" className="rounded-2xl p-4 flex items-center justify-between" style={gradientRing}>
            <div className="flex items-center gap-3"><Play /><span className="font-semibold">Watch Streams</span></div>
            <span style={{ color: KICK_GREEN }} className="text-sm">Kick</span>
          </a>
          <a href="#" className="rounded-2xl p-4 flex items-center justify-between" style={gradientRing}>
            <div className="flex items-center gap-3"><MessageCircle /><span className="font-semibold">Join the Chat</span></div>
            <span style={{ color: KICK_GREEN }} className="text-sm">Discord</span>
          </a>
          <a href="#" className="rounded-2xl p-4 flex items-center justify-between" style={gradientRing}>
            <div className="flex items-center gap-3"><Twitter /><span className="font-semibold">Follow Updates</span></div>
            <span style={{ color: KICK_GREEN }} className="text-sm">X</span>
          </a>
        </div>
      </section>

      {/* FAQ / Rules preview */}
      <section id="rules" className="relative z-20 py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <h3 className="text-3xl md:text-4xl font-extrabold mb-8" style={{ color: KICK_GREEN }}>FAQ & Rules</h3>
          <div className="space-y-3">
            {faqItems.map((f, i) => (
              <Accordion key={f.q} defaultOpen={i === 0} question={f.q} answer={f.a} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// —— Bonuses (adapted from your BonusesPage) ——
function BonusesPage() {
  const [copied, setCopied] = useState(false);
  const steps = [
    {
      id: 1,
      title: "Visit Roobet & Sign Up",
      desc: (
        <>
          Head to Roobet using our tracked link and create your account. When prompted, enter the promo code <b style={{ color: KICK_GREEN }}>LUCKYW</b> so every $1 you wager counts toward LuckyW bonuses and the leaderboard.
        </>
      ),
      img: "/roobet.png",
      ctaText: "Open Roobet (tracked)",
      ctaHref: "https://roo.bet/?ref=LUCKYW",
      external: true,
    },
    {
      id: 2,
      title: "Verify Your Account",
      desc: <>Complete KYC (identity verification) and secure your profile. Verified accounts unlock all promos and leaderboard prizes.</>,
      img: "/verify.png",
      ctaText: "Verify Account",
      ctaHref: "https://roo.bet/account/verify",
      external: true,
    },
    {
      id: 3,
      title: "Enjoy Bonuses & Auto-Entry",
      desc: <>
        Claim exclusive bonuses, weekly drops, and reloads. Your wagers are <i>automatically</i> tracked toward the LuckyW monthly race.
      </>,
      img: "/leaderboar2d.png",
      ctaText: "View Leaderboards",
      ctaHref: "#/leaderboards",
      external: false,
    },
  ];

  return (
    <>
      {/* HEADER */}
      <header className="relative z-20 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Bonuses</h1>
          <p className="mt-3 text-gray-300">How to register, claim perks, and get auto-entered into the LuckyW leaderboard.</p>

          {/* Promo Code */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm" style={{ borderColor: "rgba(0,231,1,0.3)", boxShadow: "0 0 0 1px rgba(255,255,255,0.04)" }}>
            <span className="opacity-80">Promo code:</span>
            <code className="font-bold tracking-wider" style={{ color: KICK_GREEN }}>LUCKYW</code>
            <button
              onClick={() => { navigator.clipboard.writeText("LUCKYW"); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
              className="ml-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border"
              style={{ borderColor: "rgba(255,255,255,0.15)" }}
            >
              <Copy size={14} />{copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </header>

      {/* STEPS */}
      <section className="relative z-20 px-6 py-14">
        <div className="mx-auto max-w-6xl space-y-12">
          {steps.map((s, i) => (
            <div key={s.id} className={`grid md:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""}`}>
              {/* Text */}
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Step {s.id}</div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-3" style={{ color: KICK_GREEN }}>{s.title}</h2>
                <p className="text-gray-300 mb-5">{s.desc}</p>

                <a href={s.ctaHref} {...(s.external ? { target: "_blank", rel: "noreferrer" } : {})} className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-semibold" style={{ backgroundColor: KICK_GREEN, color: "#0a0a0a" }}>
                  {s.ctaText}
                  {s.external ? <ExternalLink size={16} /> : <Trophy size={16} />}
                </a>

                {/* Slim tips */}
                {s.id === 2 && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                    <ShieldCheck size={14} /> Secure your account for full bonuses.
                  </div>
                )}
                {s.id === 3 && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                    <Sparkles size={14} /> Weekly drops for active players.
                  </div>
                )}
              </div>

              {/* Image */}
              <div>
                <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden border backdrop-blur flex items-center justify-center" style={{ borderColor: "rgba(0,231,1,0.25)", borderWidth: 1, boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 25px 60px -25px rgba(0,231,1,0.18)" }}>
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function LeaderboardsPage() {
  // --- 1) Hardcoded fallback (what you already had) ---
  const FALLBACK = React.useMemo(
    () => ([
      { rank: 1, name: "BossBaby", wagered: 342130.32, prize: 1000 },
      { rank: 2, name: "BossBaby", wagered: 298220.18, prize: 500 },
      { rank: 3, name: "BossBaby", wagered: 251980.55, prize: 250 },
      { rank: 4, name: "BossBaby", wagered: 203140.0,  prize: 150 },
      { rank: 5, name: "BossBaby", wagered: 181120.45, prize: 100 },
      { rank: 6, name: "BossBaby", wagered: 166780.12, prize: 75 },
      { rank: 7, name: "BossBaby", wagered: 154210.0,  prize: 50 },
      { rank: 8, name: "BossBaby", wagered: 141033.47, prize: 40 },
      { rank: 9, name: "BossBaby", wagered: 132440.87, prize: 30 },
      { rank: 10, name: "BossBaby", wagered: 120008.03, prize: 20 },
      { rank: 11, name: "BossBaby", wagered: 110000.00, prize: 0 },
      { rank: 12, name: "BossBaby", wagered: 100000.00, prize: 0 },
      { rank: 13, name: "BossBaby", wagered:  90000.00, prize: 0 },
      { rank: 14, name: "BossBaby", wagered:  80000.00, prize: 0 },
      { rank: 15, name: "BossBaby", wagered:  70000.00, prize: 0 },
    ]),
    []
  );

  // --- 2) Live state fed by the API (or fallback) ---
  const [rows, setRows] = React.useState(FALLBACK);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  // --- 3) Prize mapping (adjust as you need) ---
  const prizeByRank = React.useMemo(() => ({
    1: 1000, 2: 500, 3: 250, 4: 150, 5: 100,
    6: 75, 7: 50, 8: 40, 9: 30, 10: 20,
    11: 0, 12: 0, 13: 0, 14: 0, 15: 0
  }), []);

  // --- 4) Where to fetch from ---
  // If the UI is on the same Vercel domain as your API, leave as relative.
  // If your UI is on GitHub Pages but API is on Vercel, set API_BASE to your full Vercel URL.
  const API_BASE = ""; // e.g. "https://your-app.vercel.app" for GH Pages
  const API_URL = `${API_BASE}/api/leaderboard/top`;

  // --- 5) Feature toggle: keep fallback while you test ---
  // Add #mock to the URL (your hash router) to force fallback.
  const forceMock = (typeof window !== "undefined") && window.location.hash.includes("mock");

  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (forceMock) {
        setLoading(false);
        return; // keep FALLBACK visible
      }
      try {
        const r = await fetch(API_URL, { headers: { "Accept": "application/json" } });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        const items = (j.items ?? []).map((x) => ({
          rank: x.rank,
          name: x.username,
          wagered: Number(x.wagered || 0),
          prize: prizeByRank[x.rank] ?? 0,
        }));

        if (!alive) return;

        // If the API returns nothing yet, keep FALLBACK so the page doesn’t look empty
        setRows(items.length ? items : FALLBACK);
        setError(items.length ? "" : "No live data yet – showing sample data.");
      } catch (e) {
        if (!alive) return;
        console.error(e);
        setRows(FALLBACK);
        setError("Couldn’t load live data – showing sample data.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [API_URL, prizeByRank, forceMock, FALLBACK]);

  // --- 6) Your existing layout logic still works ---
  const top3  = rows.slice(0, 3);
  const rest  = rows.slice(3, 15); // or 3..15 if your UI shows all 15
  const { days, hours, minutes, seconds } = useMonthEndCountdown();

  return (
    <section className="relative z-20 py-16 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        {/* (keep your original header/content below) */}
        {error && (
          <div className="mb-4 text-sm text-yellow-300 opacity-80">
            {error}
          </div>
        )}

        {/* Example: show a tiny loading state */}
        {loading ? (
          <div className="text-white/70">Loading leaderboard…</div>
        ) : (
<>
  {/* Heading */}
  <header className="mb-6">
    <h1 className="text-3xl md:text-4xl font-extrabold" style={{ color: KICK_GREEN }}>
      Monthly Leaderboard
    </h1>
    <p className="text-gray-300 mt-1">
      Updates automatically. Race ends in&nbsp;
      <span className="font-semibold" style={{ color: KICK_GREEN }}>
        {days}d {hours}h {minutes}m {seconds}s
      </span>
      .
    </p>
  </header>

  {/* Podium (Top 3) */}
  <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8">
    {top3[1] && (
      <PodiumCard
        placement={2}
        item={top3[1]}
        className=""
        height="h-[220px]"
        tint="rgba(0, 255, 255, 0.10)"
        edgeColor="#22d3ee"
        badge={<MedalRibbon n={2} color="#22d3ee" />}
        highlight={false}
      />
    )}
    {top3[0] && (
      <PodiumCard
        placement={1}
        item={top3[0]}
        className=""
        height="h-[260px]"
        tint="rgba(0,231,1,0.12)"
        edgeColor={KICK_GREEN}
        badge={<Crown size={18} color={KICK_GREEN} />}
        highlight
      />
    )}
    {top3[2] && (
      <PodiumCard
        placement={3}
        item={top3[2]}
        className=""
        height="h-[200px]"
        tint="rgba(250,204,21,0.10)"
        edgeColor="#facc15"
        badge={<MedalRibbon n={3} color="#facc15" />}
        highlight={false}
      />
    )}
  </div>

  {/* Ranks 4–15 */}
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
    <div className="grid grid-cols-12 text-[11px] uppercase tracking-wider text-gray-400 px-3 py-2">
      <div className="col-span-2">Rank</div>
      <div className="col-span-6">Player</div>
      <div className="col-span-4 text-right">Wagered</div>
    </div>
    <div className="divide-y divide-white/5">
      {rows.slice(3, 15).map((r) => (
        <div key={r.rank} className="grid grid-cols-12 items-center px-3 py-3">
          <div className="col-span-2 font-black" style={{ color: "white" }}>#{r.rank}</div>
          <div className="col-span-6">{r.name}</div>
          <div className="col-span-4 text-right font-semibold text-gray-200">{formatMoney(r.wagered)}</div>
        </div>
      ))}
      {rows.length <= 3 && (
        <div className="px-3 py-6 text-sm text-gray-400">No more players yet.</div>
      )}
    </div>
  </div>
</>

        )}
      </div>
    </section>
  );
}


function PodiumCard({ placement, item, className, height, tint, edgeColor, badge, highlight }) {
  const edge = { boxShadow: `inset 0 0 0 1px ${edgeColor}22, 0 30px 80px -40px ${edgeColor}66` };
  const ribbon = placement === 1 ? "bg-[rgba(0,231,1,0.12)]" : placement === 2 ? "bg-cyan-400/10" : "bg-yellow-400/10";
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: placement * 0.05 }}
    >
      <div
        className={`rounded-3xl ${height} p-5 md:p-6 flex flex-col justify-end`}
        style={{
          background: `linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2)), radial-gradient(120% 160% at 50% 0%, ${tint}, transparent 60%)`,
          border: `1px solid ${edgeColor}40`,
          transform: "perspective(800px) rotateX(4deg)",
          ...edge,
        }}
      >
        <div className={`absolute -top-3 left-5 px-3 py-1 rounded-xl text-xs tracking-wide ${ribbon}`} style={{ border: `1px solid ${edgeColor}55` }}>
          {placement === 1 ? "Champion" : placement === 2 ? "Runner-up" : "Third"}
        </div>
        <div className="absolute -top-5 right-5 bg-black/70 rounded-2xl p-2 border border-white/10" style={{ boxShadow: `0 10px 40px -20px ${edgeColor}88` }}>
          {badge}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-5xl font-black" style={{ color: highlight ? KICK_GREEN : "white" }}>#{item.rank}</div>
            <div className="text-lg font-semibold">{item.name}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Wagered</div>
            <div className="text-lg font-extrabold">{formatMoney(item.wagered)}</div>
            <div className="text-xs text-gray-400 mt-1">Prize</div>
            <div className="text-base font-bold" style={{ color: KICK_GREEN }}>{formatMoney(item.prize)}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MedalRibbon({ n, color }) {
  return (
    <div className="flex items-center gap-1">
      <Medal size={16} color={color} />
      <span className="text-xs" style={{ color }}>{n}nd</span>
    </div>
  );
}

function TimeTile({ label, value }) {
  return (
    <div className="rounded-xl px-2 py-2 md:px-2 md:py-2 text-center border border-white/10 bg-black/20">
      <div className="text-2xl md:text-3xl font-black" style={{ color: KICK_GREEN }}>{String(value).padStart(2, "0")}</div>
      <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">{label}</div>
    </div>
  );
}

function BadgeCard({ icon, title, desc }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-black/50" style={{ color: KICK_GREEN, boxShadow: "0 0 20px rgba(0,231,1,0.25)" }}>{icon}</div>
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-gray-400 text-xs">{desc}</div>
      </div>
    </div>
  );
}

function useMonthEndCountdown() {
  const target = useMemo(() => {
    const now = new Date();
    const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
    return nextMonth;
  }, []);
  const [tick, setTick] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - tick);
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { days: d, hours: h, minutes: m, seconds: s };
}

function formatMoney(n) {
  const isIntPrize = Number.isInteger(n);
  const value = isIntPrize ? n : Math.round(n * 100) / 100;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: isIntPrize ? 0 : 2, maximumFractionDigits: 2 })}`;
}

// =========================================================
// Reusable bits from your original files
// =========================================================
function LeaderboardPreview() {
  const rows = useMemo(
    () => [
      { rank: 1, user: "BossBaby", points: 128430, prize: "$1,000" },
      { rank: 2, user: "BossBaby", points: 117210, prize: "$500" },
      { rank: 3, user: "BossBaby", points: 109980, prize: "$250" },
      { rank: 4, user: "BossBaby", points: 89340, prize: "$150" },
      { rank: 5, user: "BossBaby", points: 81120, prize: "$100" },
    ],
    []
  );

  return (
    <div className="p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-extrabold">August Race</div>
        <a href="#/leaderboards" className="text-sm" style={{ color: KICK_GREEN }}>
          View all
        </a>
      </div>
      <div className="grid grid-cols-12 text-xs uppercase tracking-wider text-gray-400 px-3 py-2">
        <div className="col-span-2">Rank</div>
        <div className="col-span-5">Player</div>
        <div className="col-span-3">Wagered</div>
        <div className="col-span-2 text-right">Prize</div>
      </div>
      <div className="divide-y divide-white/5">
        {rows.map((r) => (
          <div key={r.rank} className="grid grid-cols-12 items-center px-3 py-3">
            <div className="col-span-2 font-black" style={{ color: r.rank <= 3 ? KICK_GREEN : "white" }}>#{r.rank}</div>
            <div className="col-span-5">{r.user}</div>
            <div className="col-span-3 text-gray-300">{r.points.toLocaleString()}</div>
            <div className="col-span-2 text-right font-semibold">{r.prize}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Accordion({ question, answer, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 10px 30px -20px rgba(0,231,1,0.18)" }}>
      <button className="w-full text-left px-5 py-4 font-semibold flex items-center justify-between" onClick={() => setOpen((v) => !v)}>
        <span>{question}</span>
        <ChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} size={18} color={KICK_GREEN} />
      </button>
      <div className={`grid transition-all duration-300 px-5 ${open ? "grid-rows-[1fr] py-0 pb-5" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden text-gray-300 text-sm">{answer}</div>
      </div>
    </div>
  );
}

const faqItems = [
  { q: "How do I earn points?", a: "Connect your casino account via our partner links and wager on supported games. Points scale with total wagered — check the Rules for the exact formula." },
  { q: "When are prizes paid?", a: "Payouts for monthly races occur within 72 hours after the leaderboard locks. Instant drops and weekly promos are credited as advertised." },
  { q: "Is there an entry fee?", a: "No entry fees. Participation is free — just play on partnered sites via LuckyW to track your points." },
  { q: "How do you prevent abuse?", a: "We flag suspicious wager patterns, collusion, and risk-free loops. Violations may lead to point removal or disqualification." },
];

"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Constants ───────────────────────────────────────────────
const TOKEN_CA = "AbmWpqgZRii6B5Y1z9ABJNig9iAsKoVHqFBQz3vopump";
const TWITTER_URL = "https://x.com/Sporepump";
const PUMP_FUN_URL = `https://pump.fun/coin/${TOKEN_CA}`;
const NODE_CAP = 800;
const RIPPLE_LIFE_MS = 1500;

// ─── Utilities ───────────────────────────────────────────────
function shortAddr(s: string) {
  if (!s || s.length < 12) return s || "—";
  return s.slice(0, 4) + "…" + s.slice(-4);
}

function fmtNum(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.round(n).toLocaleString();
}

function fmtAge(ts: number) {
  const d = Math.max(0, (Date.now() - ts) / 1000);
  if (d < 60) return Math.floor(d) + "s";
  if (d < 3600) return Math.floor(d / 60) + "m";
  if (d < 86400) return Math.floor(d / 3600) + "h";
  return Math.floor(d / 86400) + "d";
}

// FNV-1a hash for deterministic node placement
function hashPubkey(pk: string): number {
  let h = 2166136261;
  for (let i = 0; i < pk.length; i++) {
    h ^= pk.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

// ─── Types ───────────────────────────────────────────────────
interface MapNode {
  x: number;
  y: number;
  r: number;
  pubkey: string;
  born_ms: number;
}

interface Ripple {
  x: number;
  y: number;
  born_ms: number;
}

interface InfectionRow {
  pubkey: string;
  amount: number;
  timestamp: number;
}

// ─── Main Page Component ─────────────────────────────────────
export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<MapNode[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const seenRef = useRef<Set<string>>(new Set());
  const viewRef = useRef({ x: 0, y: 0, scale: 1 });
  const dragRef = useRef({ active: false, startX: 0, startY: 0, dist: 0 });
  const hoveredRef = useRef<MapNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const canvasWRef = useRef(0);

  const [infected, setInfected] = useState(0);
  const [distributed, setDistributed] = useState(0);
  const [activeTargets, setActiveTargets] = useState(0);
  const [nodeCount, setNodeCount] = useState(0);
  const [recentList, setRecentList] = useState<InfectionRow[]>([]);
  const [virusFlash, setVirusFlash] = useState(false);

  // ─── Canvas: place node deterministically ──────────────────
  const placeNode = useCallback((pubkey: string, animate: boolean): MapNode | null => {
    if (seenRef.current.has(pubkey)) return null;
    seenRef.current.add(pubkey);

    const w = canvasWRef.current || 900;
    const h = 500;
    const cx = w / 2, cy = h / 2;
    const hash = hashPubkey(pubkey);

    const angle = ((hash & 0xffff) / 0xffff) * Math.PI * 2;
    const rNorm = ((hash >>> 16) & 0xffff) / 0xffff;
    const baseR = Math.min(w, h) * 0.42;
    const growth = 1 + Math.log10(Math.max(1, nodesRef.current.length / 5));
    const maxR = baseR * growth;
    const radius = 35 + Math.sqrt(rNorm) * maxR;

    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const r = 3 + ((hash >>> 8) & 0x3) * 0.5;

    const node: MapNode = {
      x, y, r, pubkey,
      born_ms: animate ? performance.now() : 0,
    };

    nodesRef.current.push(node);
    if (animate) {
      ripplesRef.current.push({ x, y, born_ms: performance.now() });
      setVirusFlash(true);
      setTimeout(() => setVirusFlash(false), 600);
    }

    // Cap nodes
    while (nodesRef.current.length > NODE_CAP) {
      const dropped = nodesRef.current.shift()!;
      seenRef.current.delete(dropped.pubkey);
    }

    setNodeCount(nodesRef.current.length);
    return node;
  }, []);

  // ─── Fetch real on-chain data from API route ────────────────
  const fetchInfections = useCallback(async () => {
    try {
      const res = await fetch("/api/infections");
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();

      if (data.infections && data.infections.length > 0) {
        // Place nodes for each unique wallet
        const rows: InfectionRow[] = [];
        for (const inf of data.infections) {
          placeNode(inf.pubkey, false);
          rows.push({
            pubkey: inf.pubkey,
            amount: inf.amount || 0,
            timestamp: inf.timestamp,
          });
        }
        setRecentList(rows.sort((a, b) => b.timestamp - a.timestamp).slice(0, 25));
        setInfected(data.total);
        setDistributed(rows.reduce((sum, r) => sum + r.amount, 0));
        setActiveTargets(data.total);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [placeNode]);

  useEffect(() => {
    // Initial fetch
    fetchInfections();

    // Poll for new data every 30 seconds
    const interval = setInterval(async () => {
      const res = await fetch("/api/infections").catch(() => null);
      if (!res || !res.ok) return;
      const data = await res.json();
      if (data.infections) {
        for (const inf of data.infections) {
          const node = placeNode(inf.pubkey, true);
          if (node) {
            setRecentList(prev => [{
              pubkey: inf.pubkey,
              amount: inf.amount || 0,
              timestamp: inf.timestamp,
            }, ...prev.slice(0, 24)]);
            setInfected(prev => prev + 1);
            setDistributed(prev => prev + (inf.amount || 0));
          }
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [placeNode, fetchInfections]);

  // ─── Canvas rendering ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvasWRef.current = rect.width;
      canvas.width = rect.width * DPR;
      canvas.height = 500 * DPR;
    };
    resize();
    window.addEventListener("resize", resize);

    // Seeded PRNG for background pattern
    function mulberry32(seed: number) {
      return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    // Generate background cells
    const rand = mulberry32(42);
    const bgCells: Array<{ x: number; y: number; r: number; alpha: number }> = [];
    for (let i = 0; i < 14; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = 80 + rand() * 320;
      const cx = (canvasWRef.current || 900) / 2;
      const cy = 250;
      bgCells.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist * 0.5,
        r: 60 + rand() * 110,
        alpha: 0.06 + rand() * 0.10,
      });
    }

    const paint = () => {
      const w = canvasWRef.current || 900;
      const h = 500;
      const cx = w / 2, cy = h / 2;
      const view = viewRef.current;
      const nodes = nodesRef.current;
      const ripples = ripplesRef.current;
      const now = performance.now();

      // Clear
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.fillStyle = "rgba(8, 12, 13, 0.22)";
      ctx.fillRect(0, 0, w, h);

      // Apply pan/zoom
      ctx.setTransform(
        DPR * view.scale, 0, 0, DPR * view.scale,
        DPR * view.x, DPR * view.y
      );

      // Background cells
      for (const c of bgCells) {
        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        grad.addColorStop(0, `rgba(34, 197, 94, ${c.alpha * 0.55})`);
        grad.addColorStop(0.55, `rgba(21, 128, 61, ${c.alpha * 0.30})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bezier spokes from center to each node
      for (const n of nodes) {
        const age = now - n.born_ms;
        const recent = n.born_ms > 0 && age < 1500;
        const dx = n.x - cx, dy = n.y - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const hash = hashPubkey(n.pubkey);
        const sign = (hash & 1) ? 1 : -1;
        const offsetMag = Math.min(50, dist * 0.22);
        const midX = cx + dx * 0.5 - (dy / dist) * sign * offsetMag;
        const midY = cy + dy * 0.5 + (dx / dist) * sign * offsetMag;

        // Spoke line
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(midX, midY, n.x, n.y);
        ctx.strokeStyle = recent
          ? `rgba(0, 168, 56, ${0.45 + (1 - age / 1500) * 0.5})`
          : "rgba(0, 168, 56, 0.35)";
        ctx.lineWidth = recent ? 1.6 : 1.0;
        ctx.stroke();

        // Traveling pulse along bezier
        const tPhase = (((now + hash * 13) / 3500) % 1);
        const t = tPhase;
        const omt = 1 - t;
        const px = omt * omt * cx + 2 * omt * t * midX + t * t * n.x;
        const py = omt * omt * cy + 2 * omt * t * midY + t * t * n.y;
        const fade = Math.sin(tPhase * Math.PI);
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 220, 70, ${fade * 0.95})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 220, 70, ${fade * 0.25})`;
        ctx.fill();
      }

      // Nodes
      const hovered = hoveredRef.current;
      for (const n of nodes) {
        const age = now - n.born_ms;
        const glow = n.born_ms > 0 && age < 800 ? (1 - age / 800) : 0;
        const isHover = n === hovered;

        if (glow > 0) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 8 * glow, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34, 197, 94, ${0.3 * glow})`;
          ctx.fill();
        }
        if (isHover) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(74, 222, 128, 0.95)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, isHover ? n.r + 1.5 : n.r, 0, Math.PI * 2);
        ctx.fillStyle = isHover ? "#4ade80" : "#22c55e";
        ctx.fill();
      }

      // Node labels (only when zoomed in enough)
      if (view.scale >= 0.55) {
        ctx.textAlign = "center";
        for (const n of nodes) {
          const isHover = n === hovered;
          ctx.font = isHover
            ? "bold 11px 'JetBrains Mono', monospace"
            : "10px 'JetBrains Mono', monospace";
          ctx.fillStyle = isHover
            ? "rgba(74, 222, 128, 1)"
            : "rgba(232, 234, 237, 0.55)";
          ctx.fillText(shortAddr(n.pubkey), n.x, n.y + n.r + 12);
        }
        ctx.textAlign = "left";
      }

      // Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = now - r.born_ms;
        if (age > RIPPLE_LIFE_MS) { ripples.splice(i, 1); continue; }
        const t = age / RIPPLE_LIFE_MS;
        const radius = 4 + t * 60;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 168, 56, ${(1 - t) * 0.7})`;
        ctx.lineWidth = 2 - t * 1.5;
        ctx.stroke();
      }

      // Patient Zero marker at center
      const pzPhase = (now / 800) % (Math.PI * 2);
      const pzPulse = 1 + Math.sin(pzPhase) * 0.18;
      ctx.beginPath();
      ctx.arc(cx, cy, 22 * pzPulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 168, 56, 0.18)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 14 * pzPulse, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#00a838";
      ctx.fill();

      // Patient Zero label
      if (view.scale > 0.5) {
        ctx.font = "bold 11px 'Orbitron', monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.textAlign = "left";
        ctx.fillText("PATIENT ZERO", cx + 28, cy - 8);
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(110, 231, 163, 0.7)";
        ctx.fillText(shortAddr(TOKEN_CA), cx + 28, cy + 6);
      }

      animFrameRef.current = requestAnimationFrame(paint);
    };

    animFrameRef.current = requestAnimationFrame(paint);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ─── Canvas interaction handlers ───────────────────────────
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const view = viewRef.current;
    dragRef.current = {
      active: true,
      startX: e.clientX - view.x,
      startY: e.clientY - view.y,
      dist: 0,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (drag.active) {
      viewRef.current.x = e.clientX - drag.startX;
      viewRef.current.y = e.clientY - drag.startY;
      drag.dist = Math.hypot(e.clientX - (drag.startX + viewRef.current.x), 0);
      return;
    }
    // Hover detection
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const view = viewRef.current;
    const wx = (e.clientX - rect.left - view.x) / view.scale;
    const wy = (e.clientY - rect.top - view.y) / view.scale;
    const hitR = Math.max(8 / view.scale, 0);
    let found: MapNode | null = null;
    for (let i = nodesRef.current.length - 1; i >= 0; i--) {
      const n = nodesRef.current[i];
      if (Math.hypot(n.x - wx, n.y - wy) < Math.max(hitR, n.r + 4)) {
        found = n;
        break;
      }
    }
    hoveredRef.current = found;
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (drag.active && drag.dist < 5) {
      // Click - open solscan for hovered node
      if (hoveredRef.current) {
        window.open(`https://solscan.io/account/${hoveredRef.current.pubkey}`, "_blank");
      }
    }
    dragRef.current.active = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const view = viewRef.current;
    const oldScale = view.scale;
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    view.scale = Math.max(0.25, Math.min(8, view.scale * factor));
    view.x = mx - (mx - view.x) * (view.scale / oldScale);
    view.y = my - (my - view.y) * (view.scale / oldScale);
  };

  const handleDblClick = () => {
    viewRef.current = { x: 0, y: 0, scale: 1 };
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <>
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />

      {/* Topbar */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-7 py-3.5 border-b"
        style={{
          borderColor: "var(--hairline)",
          background: "rgba(15, 18, 19, 0.80)",
          backdropFilter: "blur(14px) saturate(160%)",
        }}
      >
        <span
          className="font-black text-lg tracking-[0.18em]"
          style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)" }}
        >
          <span className="text-[var(--green)]" style={{ textShadow: "0 0 10px rgba(34,197,94,0.6)" }}>● </span>
          Sporepump
        </span>

        <div className="flex items-center gap-3">
          <a
            href={TWITTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded text-xs font-medium transition-all hover:opacity-80"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "var(--green-bright)",
              border: "1px solid var(--green-deep)",
              background: "rgba(34, 197, 94, 0.07)",
            }}
          >
            Twitter
          </a>
          <a
            href={PUMP_FUN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded text-xs font-medium transition-all hover:opacity-80 whitespace-nowrap"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "var(--green-bright)",
              border: "1px solid var(--green-deep)",
              background: "rgba(34, 197, 94, 0.07)",
            }}
          >
            {shortAddr(TOKEN_CA)}
          </a>
        </div>
      </header>

      <main className="relative z-[2] max-w-[1900px] mx-auto px-7 py-9 flex flex-col gap-9">
        {/* ─── HERO: virus image + stats ─── */}
        <section className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-12 items-center min-h-[420px]">
          {/* Virus stage */}
          <div className="relative w-[320px] h-[320px] lg:w-[480px] lg:h-[480px] mx-auto lg:mx-0 flex items-center justify-center">
            {/* Radiating rings */}
            <span
              className="absolute rounded-full border-2 opacity-0"
              style={{
                width: "280px", height: "280px",
                borderColor: "var(--green)",
                animation: "ring-radiate 4s ease-out infinite",
              }}
            />
            <span
              className="absolute rounded-full border-2 opacity-0"
              style={{
                width: "280px", height: "280px",
                borderColor: "var(--green)",
                animation: "ring-radiate 4s ease-out infinite 1.3s",
              }}
            />
            <span
              className="absolute rounded-full border-2 opacity-0"
              style={{
                width: "280px", height: "280px",
                borderColor: "var(--green)",
                animation: "ring-radiate 4s ease-out infinite 2.6s",
              }}
            />
            {/* Virus image */}
            <img
              src="/images/logo_nobg.png"
              alt="$SPOREPUMP"
              className={`relative z-10 w-[240px] h-[240px] lg:w-[380px] lg:h-[380px] object-contain pointer-events-none ${virusFlash ? "animate-flash" : "animate-breathe"}`}
            />
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col leading-none">
              <span
                className="text-[60px] sm:text-[80px] lg:text-[110px] font-black tabular-nums tracking-tight"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  textShadow: "0 0 30px rgba(34,197,94,0.55), 0 0 70px rgba(34,197,94,0.25)",
                }}
              >
                {fmtNum(infected)}
              </span>
              <span
                className="text-base lg:text-lg font-bold tracking-[0.36em] mt-4"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  color: "var(--green)",
                  textShadow: "0 0 12px rgba(34,197,94,0.45)",
                }}
              >
                INFECTED
              </span>
            </div>

            <div
              className="grid grid-cols-2 gap-x-7 gap-y-3.5 py-4 border-t border-b"
              style={{ borderColor: "var(--hairline)" }}
            >
              <StatItem label="$SPOREPUMP SPREAD" value={fmtNum(distributed)} />
              <StatItem label="SPREAD RATE" value="5/min" note="depends on volume" />
              <StatItem label="ACTIVE TARGETS" value={fmtNum(activeTargets)} />
              <StatItem label="NODES MAPPED" value={String(nodeCount)} />
            </div>
          </div>
        </section>

        {/* ─── MAP ROW: 3-column layout ─── */}
        <section className="grid grid-cols-1 xl:grid-cols-[280px_1fr_280px] gap-5 items-start">
          {/* Recent Infections panel */}
          <aside
            className="rounded-xl p-5 flex flex-col xl:h-[568px] overflow-hidden"
            style={{
              background: "var(--bg-1)",
              border: "1px solid var(--hairline)",
              boxShadow: "var(--shadow)",
            }}
          >
            <SectionTitle>RECENT INFECTIONS</SectionTitle>
            <div
              className="mt-3 flex-1 min-h-0 overflow-y-auto space-y-0"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}
            >
              {recentList.length === 0 ? (
                <p className="text-center italic py-5" style={{ color: "var(--ink-3)" }}>
                  Waiting for first infection…
                </p>
              ) : (
                recentList.map((row, i) => (
                  <div
                    key={`${row.pubkey}-${i}`}
                    className="grid grid-cols-[1fr_auto_auto] gap-2.5 py-2 border-b border-dashed"
                    style={{
                      borderColor: "var(--hairline)",
                      animation: i === 0 ? "recent-pop 0.5s ease-out" : undefined,
                    }}
                  >
                    <a
                      href={`https://solscan.io/account/${row.pubkey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                      style={{ color: "var(--green-bright)" }}
                    >
                      {shortAddr(row.pubkey)}
                    </a>
                    <span style={{ color: "var(--ink)", fontWeight: 500 }}>
                      {fmtNum(row.amount)}
                    </span>
                    <span style={{ color: "var(--ink-3)", fontSize: "10px" }}>
                      {fmtAge(row.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Infection Map (Canvas) */}
          <div
            className="rounded-xl p-4 lg:p-5"
            style={{
              background: "var(--bg-1)",
              border: "1px solid var(--hairline)",
              boxShadow: "var(--shadow)",
            }}
          >
            <div className="flex justify-between items-center mb-2.5">
              <SectionTitle>INFECTION MAP</SectionTitle>
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--ink-3)" }}>
                  {nodeCount} nodes
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--ink-3)" }}>
                  drag · scroll · dblclick
                </span>
              </div>
            </div>
            <canvas
              ref={canvasRef}
              className="w-full rounded-lg cursor-grab active:cursor-grabbing"
              style={{
                height: "500px",
                background: "radial-gradient(ellipse at center, #0e1314 0%, #060a0b 80%)",
                border: "1px solid var(--hairline)",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => { dragRef.current.active = false; hoveredRef.current = null; }}
              onWheel={handleWheel}
              onDoubleClick={handleDblClick}
            />
          </div>

          {/* How It Spreads panel */}
          <aside
            className="rounded-xl p-5 flex flex-col xl:h-[568px]"
            style={{
              background: "var(--bg-1)",
              border: "1px solid var(--hairline)",
              boxShadow: "var(--shadow)",
            }}
          >
            <SectionTitle>HOW IT SPREADS</SectionTitle>
            <p className="mt-3.5 text-[13px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              $SPOREPUMP spreads on its own.
            </p>
            <p className="mt-2.5 text-[13px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              Active pump.fun traders are randomly infected — no signup, no claim, no farming. If you&apos;re trading, you&apos;re a target.
            </p>
            <p className="mt-2.5 text-[13px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              The spores are self-replicating. Every transaction releases a new wave across the Solana network.
            </p>
            <div className="mt-auto pt-5 border-t" style={{ borderColor: "var(--hairline)" }}>
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--ink-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                There is no cure.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-sm font-bold tracking-[0.22em] m-0"
      style={{ fontFamily: "'Orbitron', sans-serif", color: "var(--ink)" }}
    >
      <span style={{ color: "var(--green)" }}>▮ </span>
      {children}
    </h2>
  );
}

function StatItem({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-xl lg:text-[22px] font-bold tabular-nums"
        style={{ fontFamily: "'Orbitron', sans-serif", color: "var(--ink)" }}
      >
        {value}
      </span>
      <span
        className="text-[9px] font-medium tracking-[0.22em]"
        style={{ fontFamily: "'Orbitron', sans-serif", color: "var(--ink-3)" }}
      >
        {label}
      </span>
      {note && (
        <span
          className="text-[9px] italic mt-0.5 opacity-70"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--ink-3)" }}
        >
          {note}
        </span>
      )}
    </div>
  );
}

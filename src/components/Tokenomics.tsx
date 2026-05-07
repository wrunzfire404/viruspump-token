"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const tokenomicsData = [
  { label: "Total Supply", value: "1,000,000,000", sublabel: "1 Billion Tokens" },
  { label: "Liquidity", value: "100%", sublabel: "Burned Forever" },
  { label: "Tax", value: "0%", sublabel: "No Buy/Sell Tax" },
  { label: "Team Tokens", value: "0%", sublabel: "Fair Launch" },
];

const phases = [
  {
    phase: "Phase 1",
    title: "Patient Zero",
    items: ["Token launch on pump.fun", "Website deployment", "Community building", "Initial spread"],
    status: "active",
  },
  {
    phase: "Phase 2",
    title: "Outbreak",
    items: ["1000+ holders", "DEX listings", "Infection map live", "Marketing push"],
    status: "upcoming",
  },
  {
    phase: "Phase 3",
    title: "Pandemic",
    items: ["10,000+ holders", "CEX listings", "Partnerships", "Global contagion"],
    status: "upcoming",
  },
  {
    phase: "Phase 4",
    title: "No Cure",
    items: ["100,000+ holders", "Ecosystem expansion", "Virus mutations (V2)", "World domination"],
    status: "upcoming",
  },
];

export default function Tokenomics() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="tokenomics" className="relative py-24 sm:py-32" ref={ref}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.03)_0%,transparent_60%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-xs sm:text-sm uppercase tracking-[0.3em] text-virus-green/50 mb-4 font-mono">
            // VIRAL STRUCTURE
          </h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Token<span className="text-virus-green text-glow">omics</span>
          </h3>
        </motion.div>

        {/* Tokenomics grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-20">
          {tokenomicsData.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i, duration: 0.6 }}
              className="relative p-5 sm:p-6 rounded-2xl bg-card-bg border border-card-border text-center group hover:border-virus-green/30 transition-all duration-300"
            >
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-virus-green text-glow mb-1 font-mono">
                {item.value}
              </p>
              <p className="text-sm text-white font-semibold mb-1">{item.label}</p>
              <p className="text-xs text-gray-600">{item.sublabel}</p>

              {/* Decorative corner */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-virus-green/10 rounded-tl-2xl group-hover:border-virus-green/30 transition-colors" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-virus-green/10 rounded-br-2xl group-hover:border-virus-green/30 transition-colors" />
            </motion.div>
          ))}
        </div>

        {/* Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Infection <span className="text-virus-green text-glow">Roadmap</span>
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {phases.map((phase, i) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 + 0.15 * i, duration: 0.6 }}
              className={`relative p-5 sm:p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                phase.status === "active"
                  ? "bg-virus-green/5 border-virus-green/30 box-glow"
                  : "bg-card-bg border-card-border hover:border-virus-green/20"
              }`}
            >
              {/* Phase label */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    phase.status === "active"
                      ? "bg-virus-green/20 text-virus-green border border-virus-green/30"
                      : "bg-gray-800 text-gray-500 border border-gray-700"
                  }`}
                >
                  {phase.phase}
                </span>
                {phase.status === "active" && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-virus-green opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-virus-green" />
                  </span>
                )}
              </div>

              <h4 className="text-lg font-bold text-white mb-3">{phase.title}</h4>

              <ul className="space-y-2">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
                    <span className="text-virus-green/50 mt-0.5 text-xs">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { InfectionRecord, shortenAddress, timeAgo, generateMockInfections } from "@/lib/solana";
import { SOLSCAN_URL } from "@/lib/constants";

export default function RecentInfections() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [infections, setInfections] = useState<InfectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    // Load initial mock data (replace with real API call)
    const data = generateMockInfections(25);
    setInfections(data);
    setLoading(false);
    setLiveCount(data.length);

    // Simulate new infections coming in
    const interval = setInterval(() => {
      const newInfection = generateMockInfections(1)[0];
      newInfection.timestamp = Math.floor(Date.now() / 1000);
      setInfections((prev) => [newInfection, ...prev.slice(0, 24)]);
      setLiveCount((c) => c + 1);
    }, 5000 + Math.random() * 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="infections" className="relative py-24 sm:py-32" ref={ref}>
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(57,255,20,0.04)_0%,transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-xs sm:text-sm uppercase tracking-[0.3em] text-virus-green/50 mb-4 font-mono">
            // LIVE FEED
          </h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Recent <span className="text-virus-green text-glow">Infections</span>
          </h3>
          <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base mb-6">
            Watch the virus spread in real-time. Every buy is a new infection.
          </p>

          {/* Live indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-virus-dark/50 border border-virus-green/20 rounded-full">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-virus-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-virus-green" />
            </span>
            <span className="text-xs text-virus-green font-mono">
              {liveCount} infections detected
            </span>
          </div>
        </motion.div>

        {/* Infections table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-card-border bg-card-bg backdrop-blur-sm overflow-hidden box-glow">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 border-b border-virus-green/10 text-xs text-gray-600 uppercase tracking-wider font-mono">
              <div className="col-span-1">Status</div>
              <div className="col-span-4 sm:col-span-3">Wallet</div>
              <div className="col-span-3 sm:col-span-3 text-right">Amount</div>
              <div className="col-span-2 sm:col-span-3 text-right hidden sm:block">Type</div>
              <div className="col-span-4 sm:col-span-2 text-right">Time</div>
            </div>

            {/* Table body */}
            <div className="max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-virus-green/20 border-t-virus-green rounded-full"
                  />
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {infections.map((infection, i) => (
                    <motion.div
                      key={`${infection.txSignature}-${i}`}
                      initial={{ opacity: 0, x: -20, backgroundColor: "rgba(57,255,20,0.1)" }}
                      animate={{ opacity: 1, x: 0, backgroundColor: "rgba(57,255,20,0)" }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.5 }}
                      className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 border-b border-white/[0.02] hover:bg-virus-green/[0.03] transition-colors group cursor-pointer"
                      onClick={() =>
                        window.open(
                          `https://solscan.io/tx/${infection.txSignature}`,
                          "_blank"
                        )
                      }
                    >
                      {/* Status dot */}
                      <div className="col-span-1 flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            infection.type === "buy"
                              ? "bg-virus-green shadow-[0_0_6px_rgba(57,255,20,0.5)]"
                              : "bg-red-500 shadow-[0_0_6px_rgba(255,0,0,0.5)]"
                          }`}
                        />
                      </div>

                      {/* Wallet */}
                      <div className="col-span-4 sm:col-span-3 flex items-center">
                        <span className="text-sm font-mono text-gray-300 group-hover:text-virus-green transition-colors">
                          {shortenAddress(infection.wallet, 6)}
                        </span>
                      </div>

                      {/* Amount */}
                      <div className="col-span-3 sm:col-span-3 flex items-center justify-end">
                        <span className="text-sm font-mono text-gray-400">
                          {(infection.amount / 1000000).toFixed(2)}M
                        </span>
                      </div>

                      {/* Type */}
                      <div className="col-span-2 sm:col-span-3 hidden sm:flex items-center justify-end">
                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                            infection.type === "buy"
                              ? "text-virus-green bg-virus-green/10 border border-virus-green/20"
                              : "text-red-400 bg-red-500/10 border border-red-500/20"
                          }`}
                        >
                          {infection.type === "buy" ? "INFECTED" : "CURED"}
                        </span>
                      </div>

                      {/* Time */}
                      <div className="col-span-4 sm:col-span-2 flex items-center justify-end">
                        <span className="text-xs font-mono text-gray-600">
                          {timeAgo(infection.timestamp)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-virus-green/10 flex items-center justify-between">
              <span className="text-xs text-gray-600 font-mono">
                Showing latest {infections.length} infections
              </span>
              <a
                href={SOLSCAN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-virus-green/50 hover:text-virus-green font-mono transition-colors"
              >
                View on Solscan →
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { SITE_CONFIG, TWITTER_URL, PUMP_FUN_URL, SOLSCAN_URL, TOKEN_ADDRESS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="relative border-t border-virus-green/10 py-12 sm:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(57,255,20,0.03)_0%,transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/images/logo.jpg"
                alt="Viruspump"
                className="w-8 h-8 drop-shadow-[0_0_6px_rgba(57,255,20,0.5)]"
              />
              <span className="text-virus-green font-bold text-lg text-glow">
                {SITE_CONFIG.ticker}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              {SITE_CONFIG.description}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Links</h4>
            <ul className="space-y-2">
              {[
                { label: "Pump.fun", href: PUMP_FUN_URL },
                { label: "Solscan", href: SOLSCAN_URL },
                { label: "Twitter / X", href: TWITTER_URL },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-virus-green transition-colors"
                  >
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contract */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contract</h4>
            <div className="p-3 bg-virus-dark/30 border border-virus-green/10 rounded-lg">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Token Address</p>
              <p className="text-xs font-mono text-gray-400 break-all">{TOKEN_ADDRESS}</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.03] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-700 font-mono">
            © 2024 {SITE_CONFIG.name}. There is no cure.
          </p>

          <div className="flex items-center gap-4">
            <motion.a
              href={TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, color: "#39ff14" }}
              className="text-gray-600 hover:text-virus-green transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}

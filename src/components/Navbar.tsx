"use client";

import { motion } from "framer-motion";
import { SITE_CONFIG, TWITTER_URL, PUMP_FUN_URL } from "@/lib/constants";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-virus-green/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative w-8 h-8 sm:w-10 sm:h-10">
              <img
                src="/images/logo.jpg"
                alt="Viruspump"
                className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]"
              />
            </div>
            <span className="text-virus-green font-bold text-lg sm:text-xl tracking-wider text-glow">
              {SITE_CONFIG.ticker}
            </span>
          </motion.div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {["About", "Infections", "Map", "Tokenomics"].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}
                className="text-sm text-gray-400 hover:text-virus-green transition-colors duration-300 tracking-widest uppercase"
              >
                {item}
              </motion.a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <motion.a
              href={TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-virus-green/20 hover:border-virus-green/50 hover:bg-virus-green/5 transition-all"
            >
              <svg className="w-4 h-4 text-virus-green" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </motion.a>

            <motion.a
              href={PUMP_FUN_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-virus-green/10 border border-virus-green/30 rounded-lg text-virus-green text-sm font-semibold hover:bg-virus-green/20 hover:border-virus-green/50 transition-all duration-300 box-glow"
            >
              Buy Now
            </motion.a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

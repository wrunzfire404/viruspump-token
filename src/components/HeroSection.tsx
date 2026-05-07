"use client";

import { motion } from "framer-motion";
import { SITE_CONFIG, PUMP_FUN_URL, TOKEN_ADDRESS } from "@/lib/constants";
import { useState } from "react";

export default function HeroSection() {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(TOKEN_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.08)_0%,transparent_70%)]" />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Virus logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", type: "spring", stiffness: 100 }}
          className="relative mx-auto mb-8 w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52"
        >
          {/* Outer glow rings */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.05, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[-30%] rounded-full border border-virus-green/20"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0.03, 0.15] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute inset-[-50%] rounded-full border border-virus-green/10"
          />

          {/* Logo image */}
          <motion.img
            src="/images/logo.jpg"
            alt="Viruspump Token"
            className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_30px_rgba(57,255,20,0.5)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          />

          {/* Glow behind logo */}
          <div className="absolute inset-0 bg-virus-green/10 rounded-full blur-3xl" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4"
        >
          <span className="text-virus-green text-glow-strong">{SITE_CONFIG.name.split(" ")[0]}</span>
          <br />
          <span className="text-white/90">{SITE_CONFIG.name.split(" ").slice(1).join(" ")}</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-lg sm:text-xl md:text-2xl text-virus-green/70 font-mono tracking-widest mb-3"
        >
          {SITE_CONFIG.tagline}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {SITE_CONFIG.description}
        </motion.p>

        {/* Contract Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mb-8"
        >
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Contract Address</p>
          <button
            onClick={copyAddress}
            className="group inline-flex items-center gap-2 px-4 py-2.5 bg-virus-dark/50 border border-virus-green/15 rounded-xl hover:border-virus-green/30 transition-all duration-300 cursor-pointer"
          >
            <span className="text-xs sm:text-sm font-mono text-gray-400 group-hover:text-virus-green transition-colors">
              {TOKEN_ADDRESS.slice(0, 12)}...{TOKEN_ADDRESS.slice(-8)}
            </span>
            <span className="text-virus-green/50 group-hover:text-virus-green transition-colors">
              {copied ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </span>
          </button>
          {copied && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-virus-green mt-2"
            >
              Copied to clipboard!
            </motion.p>
          )}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href={PUMP_FUN_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(57,255,20,0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3.5 bg-virus-green text-black font-bold rounded-xl text-sm sm:text-base tracking-wider uppercase hover:bg-virus-green/90 transition-all duration-300"
          >
            Get Infected
          </motion.a>

          <motion.a
            href="#infections"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3.5 border border-virus-green/30 text-virus-green font-semibold rounded-xl text-sm sm:text-base tracking-wider hover:bg-virus-green/5 hover:border-virus-green/50 transition-all duration-300"
          >
            View Infections
          </motion.a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 border border-virus-green/30 rounded-full flex items-start justify-center p-1"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-2 bg-virus-green/50 rounded-full"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

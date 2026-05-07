"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "On-Chain Tracking",
    description: "Real-time monitoring of every infection. Watch the virus spread across the Solana blockchain.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Global Infection Map",
    description: "Visualize the pandemic. See infected wallets spread across the network in real-time.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Pump.fun Native",
    description: "Born on pump.fun. Fair launch. No presale. No team tokens. Pure viral spread.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "No Cure",
    description: "Liquidity burned. Contract renounced. Once infected, there is no going back.",
  },
];

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-xs sm:text-sm uppercase tracking-[0.3em] text-virus-green/50 mb-4 font-mono">
            // PATHOGEN ANALYSIS
          </h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            What is <span className="text-virus-green text-glow">Viruspump</span>?
          </h3>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">
            A memecoin engineered for maximum contagion. Every transaction is a vector.
            Every holder is a host. The blockchain is our petri dish.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 * i, duration: 0.6 }}
              whileHover={{ y: -5, borderColor: "rgba(57,255,20,0.3)" }}
              className="relative group p-6 rounded-2xl bg-card-bg border border-card-border backdrop-blur-sm transition-all duration-300 hover:box-glow"
            >
              <div className="text-virus-green mb-4 group-hover:text-glow transition-all">
                {feature.icon}
              </div>
              <h4 className="text-white font-bold text-lg mb-2">{feature.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-virus-green/10 rounded-tr-2xl group-hover:border-virus-green/30 transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

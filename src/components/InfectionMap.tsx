"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";

interface MapNode {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  wallet: string;
  connections: number[];
  infected: boolean;
}

function generateNodes(count: number): MapNode[] {
  const nodes: MapNode[] = [];
  for (let i = 0; i < count; i++) {
    const wallet = Array.from({ length: 8 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[
        Math.floor(Math.random() * 62)
      ]
    ).join("");

    // Create connections to nearby nodes
    const connections: number[] = [];
    for (let j = 0; j < Math.min(i, 3); j++) {
      const target = Math.floor(Math.random() * i);
      if (!connections.includes(target)) connections.push(target);
    }

    nodes.push({
      id: i,
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 3,
      wallet: `${wallet.slice(0, 4)}...${wallet.slice(-4)}`,
      connections,
      infected: Math.random() > 0.2,
    });
  }
  return nodes;
}

export default function InfectionMap() {
  const ref = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [nodes] = useState(() => generateNodes(80));
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);
  const [totalInfected, setTotalInfected] = useState(0);
  const nodesRef = useRef(nodes);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    // Animate infection count
    const target = nodes.filter((n) => n.infected).length;
    let current = 0;
    const step = Math.ceil(target / 40);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setTotalInfected(current);
      if (current >= target) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [nodes]);

  // Canvas animation for connections
  const animateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    let frame: number;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      time += 0.005;

      const currentNodes = nodesRef.current;

      // Draw connections
      currentNodes.forEach((node) => {
        node.connections.forEach((targetIdx) => {
          const target = currentNodes[targetIdx];
          if (!target) return;

          const x1 = (node.x / 100) * rect.width;
          const y1 = (node.y / 100) * rect.height;
          const x2 = (target.x / 100) * rect.width;
          const y2 = (target.y / 100) * rect.height;

          const pulse = Math.sin(time * 2 + node.delay) * 0.5 + 0.5;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(57, 255, 20, ${0.03 + pulse * 0.05})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // Traveling particle along connection
          const t = (time * 0.5 + node.delay) % 1;
          const px = x1 + (x2 - x1) * t;
          const py = y1 + (y2 - y1) * t;
          ctx.beginPath();
          ctx.arc(px, py, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(57, 255, 20, ${pulse * 0.3})`;
          ctx.fill();
        });
      });

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isInView) return;
    const cleanup = animateCanvas();
    return cleanup;
  }, [isInView, animateCanvas]);

  return (
    <section id="map" className="relative py-24 sm:py-32" ref={ref}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(57,255,20,0.04)_0%,transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-xs sm:text-sm uppercase tracking-[0.3em] text-virus-green/50 mb-4 font-mono">
            // OUTBREAK VISUALIZATION
          </h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Infection <span className="text-virus-green text-glow">Map</span>
          </h3>
          <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
            Each node represents an infected wallet. Watch the pathogen spread through the network.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-10"
        >
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-black text-virus-green text-glow font-mono">
              {totalInfected}
            </p>
            <p className="text-xs text-gray-600 uppercase tracking-wider mt-1">Infected Nodes</p>
          </div>
          <div className="w-px h-8 bg-virus-green/10" />
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-black text-virus-green text-glow font-mono">
              {nodes.length}
            </p>
            <p className="text-xs text-gray-600 uppercase tracking-wider mt-1">Total Nodes</p>
          </div>
          <div className="w-px h-8 bg-virus-green/10" />
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-black text-virus-green text-glow font-mono">
              {Math.round((totalInfected / nodes.length) * 100)}%
            </p>
            <p className="text-xs text-gray-600 uppercase tracking-wider mt-1">Infection Rate</p>
          </div>
        </motion.div>

        {/* Map visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative rounded-2xl border border-card-border bg-card-bg backdrop-blur-sm overflow-hidden box-glow"
          style={{ aspectRatio: "16/9" }}
        >
          {/* Canvas for connections */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />

          {/* Grid overlay */}
          <div className="absolute inset-0 grid-bg opacity-30" />

          {/* Nodes */}
          {nodes.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.5 + i * 0.01, duration: 0.3 }}
              className="absolute group cursor-pointer"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Ping effect for infected */}
              {node.infected && (
                <motion.div
                  animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: node.delay,
                    ease: "easeOut",
                  }}
                  className="absolute inset-0 rounded-full bg-virus-green"
                  style={{
                    width: node.size * 2,
                    height: node.size * 2,
                    marginLeft: -node.size / 2,
                    marginTop: -node.size / 2,
                  }}
                />
              )}

              {/* Node dot */}
              <div
                className={`rounded-full transition-all duration-300 ${
                  node.infected
                    ? "bg-virus-green shadow-[0_0_8px_rgba(57,255,20,0.6)]"
                    : "bg-gray-700 shadow-[0_0_4px_rgba(100,100,100,0.3)]"
                } group-hover:scale-150`}
                style={{
                  width: node.size * 2,
                  height: node.size * 2,
                }}
              />
            </motion.div>
          ))}

          {/* Hover tooltip */}
          <AnimatePresence>
            {hoveredNode && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute z-20 px-3 py-2 bg-black/90 border border-virus-green/30 rounded-lg text-xs font-mono pointer-events-none"
                style={{
                  left: `${hoveredNode.x}%`,
                  top: `${hoveredNode.y - 5}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <p className="text-virus-green">{hoveredNode.wallet}</p>
                <p className="text-gray-500">
                  {hoveredNode.infected ? "🟢 Infected" : "⚪ Clean"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Corner labels */}
          <div className="absolute top-3 left-3 text-[10px] font-mono text-virus-green/30 uppercase tracking-wider">
            Network Topology
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-virus-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-virus-green" />
            </span>
            <span className="text-[10px] font-mono text-virus-green/50">LIVE</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}



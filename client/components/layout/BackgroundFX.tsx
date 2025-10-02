"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function BackgroundFX() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Large radial gradients */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.65, 0.05, 0.36, 1] }}
        className="absolute top-[-20%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_60%)] blur-3xl" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: 1.8, delay: 0.3, ease: [0.65, 0.05, 0.36, 1] }}
        className="absolute bottom-[-25%] right-[-5%] w-[55vw] h-[55vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_65%)] blur-[140px]" />
      {/* Fine grain overlay (extra subtle) */}
      {mounted && (
        <div className="absolute inset-0 mix-blend-overlay opacity-[0.04]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27140%27 height=%27140%27 viewBox=%270 0 140 140%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.75%27 numOctaves=%273%27/%3E%3C/filter%3E%3Crect width=%27140%27 height=%27140%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')" }} />
      )}
    </div>
  );
}

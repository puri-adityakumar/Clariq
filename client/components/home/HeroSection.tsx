'use client';

import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-12">
      <div className="absolute inset-0 blur-bg" />
      <div className="container relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.65, 0.05, 0.36, 1] }}
            className="mb-6"
          >
            <span className="eyebrow tracking-widest">AI Sales Intelligence Platform</span>
          </motion.div>
          <motion.h1
            className="heading-1 font-heading mb-8"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.65, 0.05, 0.36, 1] }}
          >
            Precision Intelligence for High-Velocity Sales Teams
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-body text-muted"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.75, ease: [0.65, 0.05, 0.36, 1] }}
          >
            CLARIQ unifies deep prospect research, intelligent briefing generation and AI voice agent enablement into one minimalist platform engineered for focus and speed.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <motion.a
              href="#demo"
              className="btn btn-primary btn-lg w-full sm:w-auto"
              whileHover={{ y: -3 }}
              whileTap={{ y: 0, scale: 0.97 }}
            >
              Request Demo
            </motion.a>
            <motion.a
              href="#features"
              className="btn btn-secondary btn-lg w-full sm:w-auto"
              whileHover={{ y: -3 }}
              whileTap={{ y: 0, scale: 0.97 }}
            >
              View Documentation
            </motion.a>
          </motion.div>
          <motion.div
            className="mt-20"
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.9, ease: [0.65, 0.05, 0.36, 1] }}
          >
            <div className="relative max-w-4xl mx-auto">
              <div className="aspect-video rounded-2xl glass flex items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(circle_at_25%_20%,#ffffff33,transparent_60%),radial-gradient(circle_at_75%_70%,#ffffff22,transparent_55%)]" />
                <div className="relative text-center p-10">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white via-neutral-300 to-neutral-600 flex items-center justify-center shadow-lg shadow-black/40 ring-1 ring-white/30">
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-brand tracking-wide text-xl">Q</div>
                  </div>
                  <p className="font-heading text-xl text-foreground mb-2">CLARIQ Intelligence Canvas</p>
                  <p className="text-sm text-muted max-w-md mx-auto">Unified research, analysis & conversational enablement — rendered in a frictionless, hyper-minimal interface.</p>
                </div>
              </div>
              <div className="pointer-events-none absolute -top-6 -left-8 w-24 h-24 rounded-full bg-white/5 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-10 -right-12 w-40 h-40 rounded-full bg-white/5 blur-3xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
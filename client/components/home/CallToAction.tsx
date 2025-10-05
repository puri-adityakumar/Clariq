'use client';

import { motion } from 'framer-motion';

export default function CallToAction() {
  return (
    <section id="demo" className="section relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.05),transparent_70%)]" />
      </div>

      <div className="container relative z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            className="heading-2 mb-6 font-heading"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Ready to Revolutionize Your Sales Research?
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-muted mb-10 max-w-2xl mx-auto leading-relaxed font-body"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Experience AI-powered insights that help you close smarter, faster, and with confidence. Automate research and empower your team with Clariq.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.a
              href="mailto:demo@clariq.ai"
              className="btn btn-primary btn-lg w-full sm:w-auto"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              Request Demo
            </motion.a>

            <motion.a
              href="mailto:info@clariq.ai"
              className="btn btn-secondary btn-lg w-full sm:w-auto"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              Contact Sales
            </motion.a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">24/7</div>
              <div className="text-muted">AI-Powered Research</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">10x</div>
              <div className="text-muted">Faster Preparation</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">95%</div>
              <div className="text-muted">Accuracy Rate</div>
            </div>
          </motion.div>

          {/* Contact alternatives */}
          <motion.div
            className="mt-12 pt-8 border-t border-gray-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-muted mb-4">Prefer to reach out directly?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
              <a
                href="mailto:hello@clariq.ai"
                className="text-muted hover:text-foreground transition-colors"
              >
                hello@clariq.ai
              </a>
              <div className="hidden sm:block text-muted/40">•</div>
              <a
                href="#documentation"
                className="text-muted hover:text-foreground transition-colors"
              >
                View Documentation
              </a>
              <div className="hidden sm:block text-muted/40">•</div>
              <a
                href="#support"
                className="text-muted hover:text-foreground transition-colors"
              >
                Get Support
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
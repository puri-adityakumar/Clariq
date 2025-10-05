'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative pt-24 pb-12 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.05),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.04),transparent_55%)]" />
      <div className="container">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <motion.div
              className="md:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="font-brand text-3xl mb-4 tracking-wide">clariq</div>
              <p className="text-muted text-sm leading-relaxed">
                Your AI-powered partner for sales research, delivering actionable insights on prospects, markets, and opportunities.
              </p>
            </motion.div>

            {/* Product Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4 text-foreground">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-muted hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#use-cases" className="text-muted hover:text-foreground transition-colors">Use Cases</a></li>
                <li><a href="#pricing" className="text-muted hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#integrations" className="text-muted hover:text-foreground transition-colors">Integrations</a></li>
                <li><a href="#api" className="text-muted hover:text-foreground transition-colors">API</a></li>
              </ul>
            </motion.div>

            {/* Company Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4 text-foreground">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="text-muted hover:text-foreground transition-colors">About</a></li>
                <li><a href="#blog" className="text-muted hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#careers" className="text-muted hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#press" className="text-muted hover:text-foreground transition-colors">Press</a></li>
                <li><a href="#contact" className="text-muted hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </motion.div>

            {/* Resources Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#documentation" className="text-muted hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#help" className="text-muted hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#community" className="text-muted hover:text-foreground transition-colors">Community</a></li>
                <li><a href="#status" className="text-muted hover:text-foreground transition-colors">Status</a></li>
                <li><a href="#changelog" className="text-muted hover:text-foreground transition-colors">Changelog</a></li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom section */}
        <motion.div
          className="py-8 border-t border-white/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted">© {currentYear} CLARIQ. All rights reserved.</div>

            <div className="flex items-center gap-6 text-sm">
              <a href="#privacy" className="text-muted hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-muted hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="text-muted hover:text-foreground transition-colors">
                Cookie Policy
              </a>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/clariq"
                className="text-muted hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://linkedin.com/company/clariq"
                className="text-muted hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>

              <a
                href="https://github.com/clariq"
                className="text-muted hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
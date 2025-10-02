'use client';

import { motion } from 'framer-motion';

export default function CallToAction() {
  return (
    <section id="demo" className="section bg-black text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
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
            className="heading-2 mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Ready to Transform Your Sales Process?
          </motion.h2>
          
          <motion.p 
            className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join forward-thinking sales teams who are already using CLARIQ to close more deals 
            with intelligent research and AI-powered sales enablement.
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
              className="btn btn-lg bg-white text-black hover:bg-gray-100"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Request Demo
            </motion.a>
            
            <motion.a
              href="mailto:info@clariq.ai"
              className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-black"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
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
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">AI-Powered Research</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">10x</div>
              <div className="text-gray-400">Faster Preparation</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-gray-400">Accuracy Rate</div>
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
            <p className="text-gray-400 mb-4">Prefer to reach out directly?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
              <a 
                href="mailto:hello@clariq.ai" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                hello@clariq.ai
              </a>
              <div className="hidden sm:block text-gray-600">•</div>
              <a 
                href="#documentation" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                View Documentation
              </a>
              <div className="hidden sm:block text-gray-600">•</div>
              <a 
                href="#support" 
                className="text-gray-300 hover:text-white transition-colors"
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
'use client';

import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center blur-bg">
      <div className="container">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1 
            className="heading-1 mb-6"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            AI-Powered Sales Intelligence
          </motion.h1>
          
          <motion.p 
            className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            Revolutionize your sales preparation and execution with deep research, intelligent reports, 
            and voice agent integration that empowers both AI and human sales teams.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <motion.a
              href="#demo"
              className="btn btn-primary btn-lg"
              initial={{ scale: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ duration: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              Request Demo
            </motion.a>
            
            <motion.a
              href="#features"
              className="btn btn-secondary btn-lg"
              initial={{ scale: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ duration: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              View Documentation
            </motion.a>
          </motion.div>
          
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <div className="relative max-w-3xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl border border-gray-200 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-full"></div>
                  </div>
                  <p className="text-gray-600 font-medium">CLARIQ Demo Interface</p>
                  <p className="text-sm text-gray-500 mt-2">Interactive sales intelligence platform</p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-black rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-gray-300 rounded-full opacity-30"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
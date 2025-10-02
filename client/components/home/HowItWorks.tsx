'use client';

import { motion } from 'framer-motion';
import { InboxIcon, Brain, Sparkles, Rocket } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Input & Discovery',
    description: 'Provide prospect information and sales objectives. CLARIQ begins comprehensive data collection and analysis.',
    icon: InboxIcon,
    details: 'Our system ingests prospect data, company information, and your specific sales goals to begin the intelligence gathering process.'
  },
  {
    number: '02',
    title: 'AI Research Engine',
    description: 'Advanced AI algorithms conduct deep research across multiple data sources to build comprehensive prospect profiles.',
    icon: Brain,
    details: 'Machine learning models analyze public data, social signals, company information, and industry trends to create detailed insights.'
  },
  {
    number: '03',
    title: 'Intelligent Analysis',
    description: 'Generate actionable insights, identify pain points, and create personalized conversation strategies.',
    icon: Sparkles,
    details: 'Our analysis engine identifies key opportunities, potential objections, and creates tailored messaging for maximum impact.'
  },
  {
    number: '04',
    title: 'Delivery & Execution',
    description: 'Receive detailed reports and conversation guides, ready for human reps or AI voice agent integration.',
    icon: Rocket,
    details: 'Get comprehensive briefings, conversation scripts, and strategic recommendations delivered in your preferred format.'
  }
];

export default function HowItWorks() {
  return (
    <section className="section">
      <div className="container">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="heading-2 mb-5 font-heading">How CLARIQ Works</h2>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto font-body leading-relaxed">
            A tightly orchestrated intelligence pipeline turning raw signals into precision sales execution.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-0.5 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                {/* Content */}
                <div className="flex-1 max-w-lg">
                  <motion.div
                    className="card"
                    whileHover={{ 
                      scale: 1.02, 
                      y: -4,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                      </div>
                      <div className="text-2xl font-bold text-muted">{step.number}</div>
                    </div>
                    
                    <h3 className="heading-4 mb-3 font-heading tracking-tight">{step.title}</h3>
                    <p className="text-muted mb-4 leading-relaxed font-body">{step.description}</p>
                    <p className="text-sm text-muted leading-relaxed">{step.details}</p>
                  </motion.div>
                </div>

                {/* Timeline dot */}
                <div className="hidden md:block">
                  <motion.div
                    className="w-4 h-4 rounded-full relative z-10 bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.15)]"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.2 + 0.3 }}
                    viewport={{ once: true }}
                  >
                    <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-white"></div>
                  </motion.div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 max-w-lg hidden md:block"></div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.a
            href="#demo"
            className="btn btn-primary btn-lg"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            Start Your Sales Intelligence Journey
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
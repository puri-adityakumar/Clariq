'use client';

import { motion } from 'framer-motion';
import { Search, FileText, Mic, Users } from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Search,
    title: 'Deep Research Engine',
    description: 'Conducts comprehensive research on products and specific prospects using advanced AI algorithms.',
    details: 'Our AI-powered research engine analyzes thousands of data points to provide you with actionable insights about your prospects and their businesses.'
  },
  {
    icon: FileText,
    title: 'Intelligent Report Generation',
    description: 'Produces detailed, actionable research reports that empower sales teams with critical insights.',
    details: 'Generate comprehensive reports that include prospect analysis, pain point identification, and tailored talking points for your sales conversations.'
  },
  {
    icon: Mic,
    title: 'Voice Agent Integration',
    description: 'Creates customized conversation documents that power AI voice agents for autonomous sales.',
    details: 'Seamlessly integrate with AI voice platforms to enable autonomous sales conversations powered by deep research and intelligent scripting.'
  },
  {
    icon: Users,
    title: 'Human Sales Enablement',
    description: 'Generates pre-meeting reports that provide human sales representatives with strategic advantages.',
    details: 'Equip your human sales team with detailed pre-call intelligence, conversation starters, and strategic recommendations for every meeting.'
  }
];

export default function FeaturesSection() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <section id="features" className="section">
      <div className="container">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="heading-2 mb-5 font-heading">Powerful Features</h2>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto font-body leading-relaxed">
            Focused, modular capabilities engineered to compress research time, sharpen messaging and scale intelligent execution.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="card group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              onHoverStart={() => setHoveredFeature(index)}
              onHoverEnd={() => setHoveredFeature(null)}
              whileHover={{ 
                scale: 1.02, 
                y: -8,
                transition: { duration: 0.3 }
              }}
            >
              <div className="mb-5 drop-shadow-sm select-none w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 ring-1 ring-white/10">
                <feature.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="heading-5 mb-3 font-heading tracking-tight text-foreground">{feature.title}</h3>
              <p className="text-muted mb-4 font-body leading-relaxed">{feature.description}</p>
              
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: hoveredFeature === index ? 'auto' : 0,
                  opacity: hoveredFeature === index ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-muted leading-relaxed">{feature.details}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.a
            href="#use-cases"
            className="btn btn-secondary btn-lg"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            Explore Use Cases
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
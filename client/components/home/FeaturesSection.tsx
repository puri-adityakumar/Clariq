'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const features = [
  {
    icon: '🔍',
    title: 'Deep Research Engine',
    description: 'Conducts comprehensive research on products and specific prospects using advanced AI algorithms.',
    details: 'Our AI-powered research engine analyzes thousands of data points to provide you with actionable insights about your prospects and their businesses.'
  },
  {
    icon: '📊',
    title: 'Intelligent Report Generation',
    description: 'Produces detailed, actionable research reports that empower sales teams with critical insights.',
    details: 'Generate comprehensive reports that include prospect analysis, pain point identification, and tailored talking points for your sales conversations.'
  },
  {
    icon: '🎤',
    title: 'Voice Agent Integration',
    description: 'Creates customized conversation documents that power AI voice agents for autonomous sales.',
    details: 'Seamlessly integrate with AI voice platforms to enable autonomous sales conversations powered by deep research and intelligent scripting.'
  },
  {
    icon: '👥',
    title: 'Human Sales Enablement',
    description: 'Generates pre-meeting reports that provide human sales representatives with strategic advantages.',
    details: 'Equip your human sales team with detailed pre-call intelligence, conversation starters, and strategic recommendations for every meeting.'
  }
];

export default function FeaturesSection() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <section id="features" className="section bg-gray-50">
      <div className="container">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="heading-2 mb-4">Powerful Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            CLARIQ combines cutting-edge AI technology with practical sales intelligence 
            to revolutionize how teams prepare for and execute sales conversations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="card"
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
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="heading-5 mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: hoveredFeature === index ? 'auto' : 0,
                  opacity: hoveredFeature === index ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">{feature.details}</p>
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
            className="btn btn-primary"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Explore Use Cases
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
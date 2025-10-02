'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const useCases = [
  {
    title: 'AI Voice Agents',
    description: 'Autonomous sales conversations powered by research',
    icon: '🤖',
    benefits: [
      '24/7 sales availability',
      'Consistent messaging and positioning',
      'Scalable prospect engagement',
      'Data-driven conversation optimization'
    ],
    scenario: 'Your AI voice agent calls prospects armed with comprehensive research, personalized talking points, and strategic conversation flows tailored to each individual prospect.'
  },
  {
    title: 'Human Sales Rep Support',
    description: 'Pre-call intelligence and meeting preparation',
    icon: '👨‍💼',
    benefits: [
      'Detailed prospect background research',
      'Pain point identification and validation',
      'Personalized conversation starters',
      'Strategic recommendations and next steps'
    ],
    scenario: 'Sales reps receive detailed pre-meeting briefings with prospect insights, conversation recommendations, and strategic guidance to maximize meeting effectiveness.'
  },
  {
    title: 'Lead Qualification',
    description: 'Automated prospect scoring and insights',
    icon: '🎯',
    benefits: [
      'Intelligent lead scoring and prioritization',
      'Automated qualification workflows',
      'Decision-maker identification',
      'Buying intent analysis'
    ],
    scenario: 'Automatically analyze and score incoming leads based on comprehensive research, helping sales teams focus their efforts on the highest-value opportunities.'
  },
  {
    title: 'Account Research',
    description: 'Deep-dive analysis for key accounts',
    icon: '🔬',
    benefits: [
      'Comprehensive company analysis',
      'Competitive landscape mapping',
      'Stakeholder identification and mapping',
      'Strategic account planning insights'
    ],
    scenario: 'Conduct thorough research on target accounts to identify decision makers, understand organizational challenges, and develop targeted sales strategies.'
  }
];

export default function UseCasesSection() {
  const [activeUseCase, setActiveUseCase] = useState(0);

  return (
    <section id="use-cases" className="section">
      <div className="container">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="heading-2 mb-4">Powerful Use Cases</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From autonomous AI voice agents to human sales enablement, 
            CLARIQ adapts to your team&apos;s needs and sales methodology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Use Case Tabs */}
          <div className="space-y-4">
            {useCases.map((useCase, index) => (
              <motion.button
                key={index}
                className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                  activeUseCase === index 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setActiveUseCase(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{useCase.icon}</div>
                  <div>
                    <h3 className="heading-5 mb-2">{useCase.title}</h3>
                    <p className={`text-sm ${
                      activeUseCase === index ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {useCase.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Use Case Details */}
          <div className="lg:sticky lg:top-8">
            <motion.div
              key={activeUseCase}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="card"
            >
              <div className="text-4xl mb-6">{useCases[activeUseCase].icon}</div>
              
              <h3 className="heading-4 mb-4">{useCases[activeUseCase].title}</h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {useCases[activeUseCase].scenario}
              </p>

              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-gray-900">Key Benefits:</h4>
                <ul className="space-y-3">
                  {useCases[activeUseCase].benefits.map((benefit, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <motion.a
                href="#demo"
                className="btn btn-primary"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                See This in Action
              </motion.a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
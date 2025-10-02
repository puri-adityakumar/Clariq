'use client';

import { motion } from 'framer-motion';
import { Bot, UserRound, Target, Microscope } from 'lucide-react';
import { useState } from 'react';

const useCases = [
  {
    title: 'AI Voice Agents',
    description: 'Autonomous sales conversations powered by research',
    icon: Bot,
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
    icon: UserRound,
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
    icon: Target,
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
    icon: Microscope,
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
          <h2 className="heading-2 mb-5 font-heading">Powerful Use Cases</h2>
          <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed font-body">
            Autonomous AI execution and human augmentation — orchestrated from a unified intelligence layer.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Use Case Tabs */}
          <div className="space-y-4">
            {useCases.map((useCase, index) => (
              <motion.button
                key={index}
                className={`w-full text-left p-5 rounded-lg transition-all duration-400 relative overflow-hidden ${
                  activeUseCase === index 
                    ? 'bg-white text-black shadow-[0_0_0_1px_rgba(255,255,255,0.25)]' 
                    : 'glass text-foreground hover:bg-white/10'
                }`}
                onClick={() => setActiveUseCase(index)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-white/5 ring-1 ring-white/10">
                    <useCase.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className={`heading-5 mb-1 font-heading tracking-tight ${activeUseCase === index ? 'text-black' : 'text-foreground'}`}>{useCase.title}</h3>
                    <p className={`text-sm leading-relaxed font-body ${
                      activeUseCase === index ? 'text-neutral-600' : 'text-muted'
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
              {(() => {
                const ActiveIcon = useCases[activeUseCase].icon as React.ComponentType<{ className?: string; strokeWidth?: number }>;
                return (
                  <div className="mb-6 w-14 h-14 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                    <ActiveIcon className="w-7 h-7 text-white" strokeWidth={1.5} />
                  </div>
                );
              })()}
              
              <h3 className="heading-4 mb-4 font-heading tracking-tight">{useCases[activeUseCase].title}</h3>
              
              <p className="text-muted mb-6 leading-relaxed font-body">{useCases[activeUseCase].scenario}</p>

              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-foreground font-heading tracking-tight">Key Benefits:</h4>
                <ul className="space-y-3">
                  {useCases[activeUseCase].benefits.map((benefit, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0 shadow shadow-black/50"></div>
                      <span className="text-muted">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <motion.a
                href="#demo"
                className="btn btn-primary btn-lg"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
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
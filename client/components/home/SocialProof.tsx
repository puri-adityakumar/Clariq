'use client';

import { motion } from 'framer-motion';

const stats = [
  {
    number: "500+",
    label: "Sales Teams",
    description: "Trust CLARIQ for their sales intelligence"
  },
  {
    number: "10M+",
    label: "Research Reports",
    description: "Generated with 95% accuracy rate"
  },
  {
    number: "3x",
    label: "Faster Prep",
    description: "Average time reduction in sales preparation"
  },
  {
    number: "40%",
    label: "Higher Close Rate",
    description: "Teams using CLARIQ vs traditional methods"
  }
];

const testimonials = [
  {
    quote: "CLARIQ has transformed how our sales team prepares for calls. The AI-generated research reports are incredibly detailed and actionable.",
    author: "Sarah Chen",
    role: "VP of Sales",
    company: "TechFlow Solutions"
  },
  {
    quote: "The voice agent integration is game-changing. Our AI agents now have the intelligence they need for meaningful sales conversations.",
    author: "Marcus Rodriguez",
    role: "Revenue Operations",
    company: "CloudScale Inc."
  },
  {
    quote: "We've seen a 40% increase in qualified meetings since implementing CLARIQ's research engine. It's like having a research team for every sales call.",
    author: "Emily Johnson",
    role: "Sales Director",
    company: "GrowthTech"
  }
];

export default function SocialProof() {
  return (
    <section className="section">
      <div className="container">
        {/* Stats Section */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="heading-3 mb-6 font-heading">Trusted by Sales Teams Worldwide</h2>
          <p className="text-lg md:text-xl text-muted mb-14 max-w-2xl mx-auto font-body leading-relaxed">
            Leading teams choose CLARIQ to compress research cycles, unlock conversational precision and win more consistently.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-foreground mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-foreground mb-1">{stat.label}</div>
                <div className="text-sm text-muted">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h3 className="heading-4 text-center mb-12 font-heading">What Our Customers Say</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -4,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="mb-6 relative">
                  <div className="text-2xl text-muted mb-4 select-none">&ldquo;</div>
                  <p className="text-muted leading-relaxed">{testimonial.quote}</p>
                </div>
                
                <div className="border-t border-white/10 pt-4">
                  <div className="font-semibold text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted">{testimonial.role}</div>
                  <div className="text-sm text-muted/80">{testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-muted mb-6 tracking-wide uppercase">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-10 opacity-40">
            <div className="h-8 w-20 bg-white/10 rounded"></div>
            <div className="h-8 w-24 bg-white/10 rounded"></div>
            <div className="h-8 w-16 bg-white/10 rounded"></div>
            <div className="h-8 w-28 bg-white/10 rounded"></div>
            <div className="h-8 w-20 bg-white/10 rounded"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
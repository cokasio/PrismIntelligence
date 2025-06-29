// src/components/landing/TestimonialsSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Marquee } from '@/components/magicui/marquee';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'VP of Operations',
    company: 'Stellar Properties Inc.',
    content: 'Prism Intelligence transformed how we manage our 200+ property portfolio. The AI insights have helped us reduce operational costs by 30% in just 6 months.',
    avatar: 'SJ',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'CEO',
    company: 'Urban Living REIT',
    content: 'The predictive analytics feature is a game-changer. We can now anticipate maintenance issues before they become costly problems.',
    avatar: 'MC',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Property Manager',
    company: 'Sunrise Apartments',
    content: 'I save at least 10 hours every week on reporting. The automated analysis is incredibly accurate and the insights are actionable.',
    avatar: 'ER',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'CFO',
    company: 'Premier Property Group',
    content: 'The financial insights and variance analysis have made board reporting so much easier. Our investors love the detailed analytics.',
    avatar: 'DK',
    rating: 5,
  },
  {
    name: 'Lisa Thompson',
    role: 'Regional Manager',
    company: 'Nationwide Properties',
    content: 'Managing properties across different states is now seamless. The platform scales beautifully with our growth.',
    avatar: 'LT',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'Asset Manager',
    company: 'Capital Real Estate',
    content: 'The ROI on this platform is incredible. We\'ve optimized our portfolio performance and increased NOI by 25%.',
    avatar: 'JW',
    rating: 5,
  },
];

const firstRow = testimonials.slice(0, testimonials.length / 2);
const secondRow = testimonials.slice(testimonials.length / 2);

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => {
  return (
    <Card className="w-[400px] mx-4 hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-1 mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        
        <Quote className="h-8 w-8 text-gray-300 dark:text-gray-700 mb-2" />
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
          "{testimonial.content}"
        </p>
        
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{testimonial.avatar}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{testimonial.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {testimonial.role} at {testimonial.company}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const TestimonialsSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Trusted by Property Managers Everywhere
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of property professionals who've transformed their operations with Prism Intelligence.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 dark:from-gray-900/50 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 dark:from-gray-900/50 to-transparent z-10" />
          
          <Marquee pauseOnHover className="[--duration:40s] mb-8">
            {firstRow.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </Marquee>
          
          <Marquee reverse pauseOnHover className="[--duration:40s]">
            {secondRow.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </Marquee>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-gray-600 dark:text-gray-400">Properties Managed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <div className="text-gray-600 dark:text-gray-400">Customer Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">$50M+</div>
            <div className="text-gray-600 dark:text-gray-400">Revenue Optimized</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">24/7</div>
            <div className="text-gray-600 dark:text-gray-400">Support Available</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
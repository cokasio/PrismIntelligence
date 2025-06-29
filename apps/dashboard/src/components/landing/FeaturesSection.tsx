// src/components/landing/FeaturesSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  LineChart, 
  Zap, 
  Shield, 
  Clock, 
  Users,
  FileText,
  TrendingUp,
  Bell,
  Layers,
  Globe,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Advanced machine learning algorithms analyze your property data to uncover hidden insights and patterns.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: LineChart,
    title: 'Predictive Analytics',
    description: 'Forecast trends, occupancy rates, and maintenance needs before they impact your bottom line.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Instant Processing',
    description: 'Upload reports and get comprehensive analysis in seconds, not hours or days.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'Your data is encrypted and protected with enterprise-grade security measures.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Clock,
    title: '24/7 Monitoring',
    description: 'Continuous monitoring of your properties with real-time alerts for critical issues.',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share insights, assign tasks, and collaborate with your team in real-time.',
    gradient: 'from-pink-500 to-rose-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const FeaturesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Powerful features designed specifically for modern property management teams.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-800 group hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 relative">
                    <div className={cn(
                      "absolute inset-0 rounded-lg bg-gradient-to-r opacity-20 blur-xl group-hover:opacity-30 transition-opacity",
                      feature.gradient
                    )} />
                    <div className={cn(
                      "relative w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center text-white",
                      feature.gradient
                    )}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-24"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Built for Scale, Designed for Growth
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Multi-Format Support</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Process PDFs, Excel files, and even scanned documents with our advanced OCR technology.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Performance Tracking</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Monitor KPIs across your entire portfolio with customizable dashboards and reports.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Smart Alerts</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Get notified about important changes, anomalies, and opportunities in real-time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl" />
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-2xl" />
                <CardContent className="p-8 relative z-10">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Uptime SLA</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">&lt;2s</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">256-bit</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Encryption</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
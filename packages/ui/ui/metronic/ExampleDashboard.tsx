// src/components/ui/metronic/ExampleDashboard.tsx
import React from 'react';
import { MetronicButton } from './MetronicButton';
import { useMetronicClasses } from '../../../theme/hooks/useMetronicClasses';

export const ExampleDashboard = () => {
  const { card, input } = useMetronicClasses();
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8">
        <h1 className="text-2xl font-semibold text-dark">Property Intelligence Platform</h1>
      </header>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={card.wrapper}>
            <div className={card.body}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Properties</p>
                  <h3 className="text-2xl font-bold text-primary">248</h3>
                </div>
                <div className="bg-primary-50 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
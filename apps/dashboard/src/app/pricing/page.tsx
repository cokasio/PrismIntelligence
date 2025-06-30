'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, DollarSign, Clock, TrendingUp } from 'lucide-react';

export default function ROICalculatorPage() {
  const [properties, setProperties] = useState([25]);
  const [analystHours, setAnalystHours] = useState([40]);
  const [currentBICost, setCurrentBICost] = useState([200000]);

  // Calculate savings
  const prismCost = properties[0] <= 10 ? 299 * 12 : 
                   properties[0] <= 50 ? 999 * 12 : 2999 * 12;
  const timeSavings = analystHours[0] * 50 * 52; // hours saved per year
  const costSavings = currentBICost[0] - prismCost;
  const roi = ((costSavings / prismCost) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Calculate Your <span className="text-green-600">ROI</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See exactly how much you'll save by replacing traditional BI with Prism Intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Panel */}
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Your Current Situation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Properties: {properties[0]}
                  </label>
                  <Slider
                    value={properties}
                    onValueChange={setProperties}
                    max={500}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Analyst Hours/Week: {analystHours[0]}
                  </label>
                  <Slider
                    value={analystHours}
                    onValueChange={setAnalystHours}
                    max={80}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current BI Cost/Year: ${currentBICost[0].toLocaleString()}
                  </label>
                  <Slider
                    value={currentBICost}
                    onValueChange={setCurrentBICost}
                    max={1000000}
                    min={50000}
                    step={10000}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-green-700">Your Savings with Prism Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Annual Cost Savings</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      ${costSavings.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Prism: ${prismCost.toLocaleString()} vs Current: ${currentBICost[0].toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Time Savings</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {timeSavings.toLocaleString()} hours/year
                    </div>
                    <div className="text-sm text-gray-600">
                      95% reduction in analysis time
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">ROI</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {roi}%
                    </div>
                    <div className="text-sm text-gray-600">
                      First year return on investment
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-700 mb-4">
                    <strong>5-Year Savings: ${(costSavings * 5).toLocaleString()}</strong>
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Section */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold mb-6">Why Prism Intelligence Delivers Better ROI</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-2">99%</div>
                <div className="font-medium mb-2">Cost Reduction</div>
                <div className="text-sm text-gray-600">vs traditional BI implementations</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-2">15s</div>
                <div className="font-medium mb-2">Processing Time</div>
                <div className="text-sm text-gray-600">From document to insights</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-purple-600 mb-2">100x</div>
                <div className="font-medium mb-2">Faster Analysis</div>
                <div className="text-sm text-gray-600">Hours to seconds</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

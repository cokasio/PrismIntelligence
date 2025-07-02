export default function ROIDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              📊 ROI Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Track the return on investment from AI-powered property management automation</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Export
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Refresh
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Time Saved</h3>
              <span className="text-gray-400">⏰</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">24.5h</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              <span className="text-green-600">📈 +35%</span>
              <span className="text-gray-500">from last month</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Tasks Completed</h3>
              <span className="text-gray-400">✅</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">12 of 18</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-1 text-xs bg-gray-100 rounded">67%</span>
              <span className="text-xs text-gray-500">this month</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Value Identified</h3>
              <span className="text-gray-400">💰</span>
            </div>
            <div className="text-2xl font-bold text-green-600">$15,750</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              <span className="text-green-600">📈 +28%</span>
              <span className="text-gray-500">potential savings</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Properties</h3>
              <span className="text-gray-400">🏢</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">8</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-1 text-xs bg-gray-100 rounded">6 with tasks</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Time Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">📈 Time Saved Over Time</h3>
              <div className="flex gap-1">
                <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded">7d</button>
                <button className="px-3 py-1 text-xs border border-gray-300 rounded">30d</button>
                <button className="px-3 py-1 text-xs border border-gray-300 rounded">90d</button>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-600">Interactive Time Chart</p>
                <p className="text-sm text-gray-500">Daily productivity gains visualization</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">78.2h</div>
                <div className="text-xs text-gray-500">Total Saved</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">2.6h</div>
                <div className="text-xs text-gray-500">Avg Per Day</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">45</div>
                <div className="text-xs text-gray-500">Tasks Done</div>
              </div>
            </div>
          </div>

          {/* Value Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">💰 Value Analysis</h3>
              <div className="flex gap-1">
                <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded">Property</button>
                <button className="px-3 py-1 text-xs border border-gray-300 rounded">Month</button>
                <button className="px-3 py-1 text-xs border border-gray-300 rounded">Category</button>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-600">Value Analysis Chart</p>
                <p className="text-sm text-gray-500">ROI tracking by property</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">$89K</div>
                <div className="text-xs text-gray-500">Potential</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">$72K</div>
                <div className="text-xs text-gray-500">Realized</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">81%</div>
                <div className="text-xs text-gray-500">ROI</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">🔔 Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {[
              {
                icon: "⚡",
                title: "Document Analysis Complete",
                description: "Financial report processed with 3 new insights identified",
                property: "Sunset Plaza",
                value: "$8,500",
                time: "5m ago"
              },
              {
                icon: "✅",
                title: "Task Completed",
                description: "Review maintenance budget variance resolved",
                property: "Oak Ridge Apartments",
                value: "$2,300",
                time: "15m ago"
              },
              {
                icon: "🎯",
                title: "Monthly Goal Achieved",
                description: "20 hours saved this month - target exceeded!",
                property: null,
                value: "20h",
                time: "45m ago"
              }
            ].map((activity, i) => (
              <div key={i} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    {activity.property && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 rounded">{activity.property}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">{activity.value}</div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

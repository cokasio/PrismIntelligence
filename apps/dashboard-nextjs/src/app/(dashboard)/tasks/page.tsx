export default function TasksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">Manage property management tasks generated from your documents</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              New Task
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">47</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">23</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-sm text-gray-600">Completed This Week</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">$125K</div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {[
              {
                title: "Review Q4 Financial Variance",
                property: "Sunset Plaza",
                priority: "High",
                dueDate: "Today",
                value: "$8,500",
                status: "pending"
              },
              {
                title: "Update Lease Agreement",
                property: "Oak Ridge Apartments", 
                priority: "Medium",
                dueDate: "Tomorrow",
                value: "$2,300",
                status: "in-progress"
              },
              {
                title: "Schedule Maintenance Inspection",
                property: "Downtown Loft",
                priority: "Low", 
                dueDate: "Next Week",
                value: "$1,200",
                status: "pending"
              },
              {
                title: "Process Tenant Application", 
                property: "Maple Gardens",
                priority: "High",
                dueDate: "2 days ago",
                value: "$3,400",
                status: "overdue"
              }
            ].map((task, i) => (
              <div key={i} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{task.property}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'High' ? 'bg-red-100 text-red-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-sm text-gray-600 min-w-[80px]">{task.dueDate}</span>
                    <span className="text-sm font-medium text-green-600 min-w-[60px]">{task.value}</span>
                    <span className={`px-2 py-1 text-xs rounded-full min-w-[80px] text-center ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
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

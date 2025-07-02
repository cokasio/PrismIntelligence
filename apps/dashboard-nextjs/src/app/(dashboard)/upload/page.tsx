export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Documents</h1>
          <p className="text-gray-600">Upload your property management documents for AI analysis and task generation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div>
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload documents</h3>
              <p className="text-gray-600 mb-4">Drag and drop files here, or click to browse</p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Choose Files
              </button>
              <p className="text-xs text-gray-500 mt-4">PDF, Excel, CSV, Images • Max 10MB • Up to 5 files</p>
            </div>

            {/* Sample Upload */}
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Sample Upload</h4>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl">📄</div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Q4_Financial_Report.pdf</p>
                  <p className="text-xs text-gray-600">2.3 MB</p>
                </div>
                <div className="text-green-600 text-xl">✓</div>
              </div>
              <div className="mt-3 pl-4 border-l-2 border-blue-200 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Upload Complete</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>AI Analysis Complete</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>3 Tasks Generated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Supported Files */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Documents</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-red-500 text-xl">📄</span>
                  <div>
                    <p className="font-medium text-sm">PDF Documents</p>
                    <p className="text-xs text-gray-600">Financial reports, lease agreements, maintenance logs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-500 text-xl">📊</span>
                  <div>
                    <p className="font-medium text-sm">Excel & CSV</p>
                    <p className="text-xs text-gray-600">Budget spreadsheets, expense reports, tenant data</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-500 text-xl">🖼️</span>
                  <div>
                    <p className="font-medium text-sm">Images</p>
                    <p className="text-xs text-gray-600">Property photos, inspection reports, receipts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Flow */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What Happens Next</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">1</div>
                  <div>
                    <p className="font-medium text-sm">AI Analysis</p>
                    <p className="text-xs text-gray-600">Claude analyzes your document for insights</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">2</div>
                  <div>
                    <p className="font-medium text-sm">Task Generation</p>
                    <p className="text-xs text-gray-600">Actionable tasks are created automatically</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-600">3</div>
                  <div>
                    <p className="font-medium text-sm">ROI Tracking</p>
                    <p className="text-xs text-gray-600">Time and cost savings are calculated</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Uploads */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Uploads</h3>
              <div className="space-y-2">
                {[
                  { name: "December_Expenses.xlsx", time: "2h ago" },
                  { name: "Lease_Amendment_2025.pdf", time: "1d ago" },
                  { name: "Maintenance_Report.pdf", time: "2d ago" }
                ].map((file, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900">{file.name}</span>
                    <span className="text-gray-500">{file.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

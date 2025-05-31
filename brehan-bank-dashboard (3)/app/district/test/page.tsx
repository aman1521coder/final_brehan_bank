import TestDistrictApi from "../test-api"

export default function TestPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">District API Testing Page</h1>
      <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md mb-6">
        <h2 className="text-xl font-semibold text-yellow-800 mb-2">Connection Troubleshooting</h2>
        <p className="mb-3 text-yellow-700">
          This page helps identify why your API calls to the district endpoints are failing. Try each method:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-yellow-700">
          <li><strong>Test with Fetch</strong> - Standard fetch API with credentials</li>
          <li><strong>Test with XHR</strong> - Uses XMLHttpRequest instead of fetch</li>
          <li><strong>Direct (No Credentials)</strong> - Skips sending credentials/cookies</li>
          <li><strong>No-CORS Mode</strong> - Uses no-cors mode to bypass CORS restrictions</li>
          <li><strong>Direct with Query Params</strong> - Adds district as URL parameter</li>
          <li><strong>No Content-Type</strong> - Sends minimal headers</li>
          <li><strong>Direct Backend</strong> - Most basic approach with extra debugging</li>
        </ol>
        <p className="mt-3 text-yellow-700">
          Watch the browser console for additional logs and check your Go backend logs after each test.
        </p>
      </div>
      
      <TestDistrictApi />
    </div>
  )
} 
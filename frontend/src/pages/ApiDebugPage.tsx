import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';

export default function ApiDebugPage() {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [endpoints, setEndpoints] = useState([
    '/login',
    '/register',
    '/profiles/',
    '/profiles/me',
    '/listings/me'
  ]);
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testEndpoint = async (endpoint: string) => {
    setLoading(prev => ({ ...prev, [endpoint]: true }));
    try {
      const response = await axios.get(`${apiUrl}${endpoint}`, { validateStatus: () => true });
      setResults(prev => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          headers: response.headers
        }
      }));
    } catch (error) {
      console.error(`Error testing ${endpoint}:`, error);
      setResults(prev => ({
        ...prev,
        [endpoint]: { error: (error as Error).message }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [endpoint]: false }));
    }
  };

  const testAllEndpoints = () => {
    endpoints.forEach(endpoint => testEndpoint(endpoint));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">API Connectivity Debug</h1>
      
      <div className="mb-6">
        <label className="block mb-2">API Base URL:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="p-2 border rounded flex-1 dark:bg-gray-800 dark:border-gray-700"
          />
          <Button onClick={testAllEndpoints}>Test All Endpoints</Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {endpoints.map(endpoint => (
          <div key={endpoint} className="border rounded-lg p-4 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">{endpoint}</div>
              <Button 
                size="sm" 
                onClick={() => testEndpoint(endpoint)}
                disabled={loading[endpoint]}
              >
                {loading[endpoint] ? 'Testing...' : 'Test'}
              </Button>
            </div>
            
            {results[endpoint] && (
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-60">
                <pre className="text-xs">{JSON.stringify(results[endpoint], null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

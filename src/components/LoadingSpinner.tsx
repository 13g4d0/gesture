import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  error?: string | null;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ error }) => {
  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-xl space-y-4 max-w-md text-center">
          <div className="text-red-500 flex justify-center">
            <RefreshCw size={32} />
          </div>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-3">
        <Loader2 className="animate-spin" size={24} />
        <span className="text-lg font-medium">Loading AI models...</span>
      </div>
    </div>
  );
};
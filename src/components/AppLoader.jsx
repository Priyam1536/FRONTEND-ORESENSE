import React from 'react';

const AppLoader = ({ message = 'Loading your workspace...' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-emerald-500 to-cyan-400 animate-spin" />
          <div className="absolute inset-1 rounded-full bg-white" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
          </div>
        </div>
        <div className="text-sm font-semibold text-gray-900">OreSense AI</div>
        <div className="mt-1 text-xs text-gray-600 text-center max-w-xs">{message}</div>
      </div>
    </div>
  );
};

export default AppLoader;

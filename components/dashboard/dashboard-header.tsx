import React from 'react';
import { Box } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <nav className="relative z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Box className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-white">PlanAI</span>
            <p className="text-xs text-gray-500">Text → 2D → 3D</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-8">
          <a href="#" className="text-white font-medium">Dashboard</a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors">Gallery</a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors">Settings</a>
        </nav>
      </div>
    </nav>
  );
}
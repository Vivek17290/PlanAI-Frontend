"use client"

import React, { useState, useEffect } from 'react';
import { Sparkles, Image, Box } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import ConversionCard from '@/components/dashboard/conversion-card';
import RecentActivity from '@/components/dashboard/recent-activity';

export default function Dashboard() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Subtle Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-950/10 to-black" />
        
        {/* Radial gradient spotlight effect */}
        <div 
          className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl transition-all duration-500 ease-out"
          style={{
            left: `${mousePosition.x - 192}px`,
            top: `${mousePosition.y - 192}px`,
          }}
        />
      </div>

      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300">AI-Powered Conversion Platform</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Convert Your Creativity
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Transform text into stunning 2D designs, then elevate them to immersive 3D experiences
          </p>
        </div>

        {/* Conversion Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <ConversionCard
            title="Text to 2D"
            description="Transform your text into beautiful 2D vector designs"
            icon={Sparkles}
            action="Create Text to 2D"
            gradient="from-indigo-500 to-purple-600"
            href="/text2D"
          />
          
          <ConversionCard
            title="Image and Edit"
            description="Visualize and edit your images "
            icon={Image}
            action="Create Image to 2D"
            gradient="from-purple-500 to-pink-600"
            href="/2dEditor"
          />

          <ConversionCard
            title="2D to 3D"
            description="Bring your 2D designs to life by converting them into interactive 3D objects"
            icon={Box}
            action="Create 2D to 3D"
            gradient="from-pink-500 to-red-600"
            href="/3dEditor"
          />
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  );
}
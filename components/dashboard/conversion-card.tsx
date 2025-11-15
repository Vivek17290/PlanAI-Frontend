"use client"

import React, { useState } from 'react';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface ConversionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action: string;
  gradient: string;
  href: string;
}

export default function ConversionCard({ 
  title, 
  description, 
  icon: Icon, 
  action, 
  gradient, 
  href 
}: ConversionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => window.location.href = href}
    >
      {/* Decorative Background */}
      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${gradient} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity`} />
      
      <div className="relative h-full flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
          <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>

        {/* Button */}
        <button
          className={`mt-8 w-full py-3 px-4 bg-gradient-to-r ${gradient} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group/btn`}
        >
          {action}
          <ArrowRight className={`w-5 h-5 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
        </button>
      </div>
    </div>
  );
}
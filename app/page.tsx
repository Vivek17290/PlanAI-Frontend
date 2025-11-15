"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Zap, Layers, Eye, CheckCircle, Sparkles, Box, Move3d } from 'lucide-react';

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    const handleScroll = () => setScrollY(window.scrollY);
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated Background Beams */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-beam"
            style={{
              top: `${(i * 5)}%`,
              left: `-100%`,
              width: '200%',
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + i * 0.5}s`,
              opacity: 0.3
            }}
          />
        ))}
        
        {/* Radial gradient spotlight effect */}
        <div 
          className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl transition-all duration-300 ease-out"
          style={{
            left: `${mousePosition.x - 192}px`,
            top: `${mousePosition.y - 192}px`,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
              <Box className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">3D Builder</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
              How It Works
            </a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
              Pricing
            </a>
          </div>
          <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 flex items-center gap-2 group">
            Get Started 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300">AI-Powered 3D Design Platform</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
              Text to 3D
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              in Seconds
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Transform your ideas into stunning 2D floor plans and immersive 3D visualizations. 
            Describe your space, and let AI bring it to life.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <button className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 flex items-center gap-2 group hover:scale-105">
              Start Creating Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
              Watch Demo
            </button>
          </div>

          <div className="flex flex-wrap gap-8 mt-16 justify-center text-sm animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-indigo-400" />
              <span className="text-gray-400">10,000+ Designs Created</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-indigo-400" />
              <span className="text-gray-400">AI-Powered Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-indigo-400" />
              <span className="text-gray-400">No Credit Card Required</span>
            </div>
          </div>
        </div>

        {/* 3D Preview Mockup */}
        <div className="relative max-w-5xl mx-auto mt-20 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-8 backdrop-blur-xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/5 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-500" />
            
            {/* Animated grid */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />
            </div>

            <div className="relative z-10 aspect-video bg-slate-900/50 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 via-transparent to-transparent" />
              
              {/* Floating 3D shapes */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-white/20 flex items-center justify-center animate-float backdrop-blur-sm">
                  <Move3d className="w-16 h-16 text-indigo-400" />
                </div>
              </div>

              <div className="absolute top-8 right-8 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-white/20 backdrop-blur-sm animate-float" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-8 left-8 w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-lg border border-white/20 backdrop-blur-sm animate-float" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="how-it-works" className="relative py-32 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Three Steps to
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Your 3D Space
              </span>
            </h2>
            <p className="text-xl text-gray-400">Simple, intuitive, and powerful</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Describe Your Space",
                description: "Tell the AI about your room - dimensions, layout, and what you want to include",
                icon: <Sparkles className="w-8 h-8" />,
                color: "from-indigo-500 to-blue-500"
              },
              {
                step: "02",
                title: "Generate 2D Plan",
                description: "Get a professional 2D floor plan instantly. Edit and refine as needed",
                icon: <Layers className="w-8 h-8" />,
                color: "from-purple-500 to-pink-500"
              },
              {
                step: "03",
                title: "Explore 3D",
                description: "Convert to stunning 3D visualization and explore every angle of your design",
                icon: <Eye className="w-8 h-8" />,
                color: "from-pink-500 to-red-500"
              }
            ].map((item, i) => (
              <div key={item.step} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-500" />
                <div className="relative p-8 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm hover:border-white/20 transition-all duration-300 h-full">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${item.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <div className="text-sm font-semibold text-indigo-400 mb-3">Step {item.step}</div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to create professional designs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <Zap className="w-7 h-7" />,
                title: "AI-Powered Generation",
                description: "Advanced AI understands your vision and creates accurate layouts instantly",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: <Layers className="w-7 h-7" />,
                title: "Real-Time Editing",
                description: "Edit and customize your designs in real-time with intuitive controls",
                color: "from-indigo-500 to-purple-500"
              },
              {
                icon: <Eye className="w-7 h-7" />,
                title: "Immersive 3D View",
                description: "Walk through your space in stunning 3D and explore every detail",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: <ArrowRight className="w-7 h-7" />,
                title: "Export & Share",
                description: "Download your designs in multiple formats or share with your team",
                color: "from-pink-500 to-rose-500"
              }
            ].map((feature, i) => (
              <div key={i} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" 
                     style={{ background: `linear-gradient(to bottom right, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))` }} />
                <div className="relative p-8 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 h-full">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-12 md:p-16 text-center overflow-hidden backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
            
            {/* Animated rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-indigo-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-purple-500/20 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Transform Your Ideas?
              </h2>
              <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
                Join thousands of designers, architects, and creatives using 3D Builder to bring their visions to life.
              </p>
              <button className="px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 flex items-center gap-3 mx-auto group hover:scale-105">
                Start Creating Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-900/50 backdrop-blur-xl py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
                  <Box className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl">3D Builder</span>
              </div>
              <p className="text-sm text-gray-400">Transform ideas into stunning 3D spaces</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">© 2025 3D Builder. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes beam {
          0% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-beam {
          animation: beam linear infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
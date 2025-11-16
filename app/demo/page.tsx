"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { redirectTo3DEditor, redirectTo3DEditorWithFile, generateSampleRoom } from "@/utils/3dEditorUtils";
import { ExternalLink, FileText, Home, Cube } from 'lucide-react';

export default function DemoPage() {
    // Sample floor plan data
    const sampleFloorPlan = [
        { name: "Living Room Wall", position: { x: 0, y: 1.25, z: -3 }, size: { width: 6, height: 2.5, depth: 0.2 }, color: "#E2E8F0" },
        { name: "Kitchen Wall", position: { x: 3, y: 1.25, z: 0 }, size: { width: 0.2, height: 2.5, depth: 6 }, color: "#E2E8F0" },
        { name: "Floor", position: { x: 0, y: 0, z: 0 }, size: { width: 6, height: 0.1, depth: 6 }, color: "#F7FAFC" },
        { name: "Sofa", position: { x: -1, y: 0, z: 1 }, size: { width: 2, height: 0.8, depth: 1 }, color: "#4A5568" },
        { name: "Coffee Table", position: { x: -1, y: 0, z: -0.5 }, size: { width: 1, height: 0.4, depth: 0.6 }, color: "#8B4513" },
    ];

    const handleOpenWith3DEditor = () => {
        redirectTo3DEditor(sampleFloorPlan);
    };

    const handleOpenInNewTab = () => {
        redirectTo3DEditor(sampleFloorPlan, true);
    };

    const handleLoadFromFile = () => {
        redirectTo3DEditorWithFile('p1.json');
    };

    const handleLoadSampleRoom = () => {
        const sampleRoom = generateSampleRoom();
        redirectTo3DEditor(sampleRoom);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        3D Editor Integration Demo
                    </h1>
                    <p className="text-xl text-gray-300">
                        Demonstrate how to redirect to the 3D editor with different data sources
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Direct JSON Data */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Cube className="w-6 h-6 text-blue-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Direct JSON Data</h2>
                        </div>
                        <p className="text-gray-300 mb-6">
                            Pass JSON data directly to the 3D editor. Perfect for dynamically generated floor plans.
                        </p>
                        <div className="space-y-3">
                            <Button 
                                onClick={handleOpenWith3DEditor}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open Sample Floor Plan
                            </Button>
                            <Button 
                                onClick={handleOpenInNewTab}
                                variant="outline"
                                className="w-full border-blue-400 text-blue-400 hover:bg-blue-400/10"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open in New Tab
                            </Button>
                        </div>
                    </div>

                    {/* File-based Loading */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <FileText className="w-6 h-6 text-green-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">File-based Loading</h2>
                        </div>
                        <p className="text-gray-300 mb-6">
                            Load JSON data from a file. Great for pre-designed floor plans and templates.
                        </p>
                        <Button 
                            onClick={handleLoadFromFile}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Load p1.json File
                        </Button>
                    </div>

                    {/* Sample Room Generator */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Home className="w-6 h-6 text-purple-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Sample Room</h2>
                        </div>
                        <p className="text-gray-300 mb-6">
                            Generate a complete sample room with walls, floor, and furniture automatically.
                        </p>
                        <Button 
                            onClick={handleLoadSampleRoom}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Generate Sample Room
                        </Button>
                    </div>

                    {/* Code Example */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <h2 className="text-xl font-semibold text-white mb-4">Code Example</h2>
                        <div className="bg-black/30 rounded-lg p-4 text-sm font-mono text-gray-300 overflow-x-auto">
                            <pre>{`import { redirectTo3DEditor } from '@/utils/3dEditorUtils';

const floorPlan = [
  {
    name: "Living Room Wall",
    position: { x: 0, y: 1.25, z: -3 },
    size: { width: 6, height: 2.5, depth: 0.2 },
    color: "#E2E8F0"
  },
  // ... more objects
];

// Redirect to 3D editor
redirectTo3DEditor(floorPlan);

// Or open in new tab
redirectTo3DEditor(floorPlan, true);`}</pre>
                        </div>
                    </div>
                </div>

                {/* URL Examples */}
                <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <h2 className="text-xl font-semibold text-white mb-4">URL Parameter Examples</h2>
                    <div className="space-y-4 text-sm">
                        <div>
                            <h3 className="font-semibold text-gray-200 mb-2">Direct JSON Data:</h3>
                            <code className="bg-black/30 p-2 rounded text-gray-300 block overflow-x-auto">
                                /3dEditor?data=%5B%7B%22name%22%3A%22Wall%22...%7D%5D
                            </code>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-200 mb-2">External URL:</h3>
                            <code className="bg-black/30 p-2 rounded text-gray-300 block overflow-x-auto">
                                /3dEditor?url=https%3A//api.example.com/floorplan.json
                            </code>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-200 mb-2">Local File:</h3>
                            <code className="bg-black/30 p-2 rounded text-gray-300 block overflow-x-auto">
                                /3dEditor?file=p1.json
                            </code>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="mt-12 text-center">
                    <h2 className="text-2xl font-semibold text-white mb-6">3D Editor Features</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="font-semibold text-white mb-2">Smart Object Detection</h3>
                            <p className="text-gray-300 text-sm">Automatically detects object types from names</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="font-semibold text-white mb-2">Realistic 3D Models</h3>
                            <p className="text-gray-300 text-sm">Detailed representations for furniture and architecture</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="font-semibold text-white mb-2">Interactive Controls</h3>
                            <p className="text-gray-300 text-sm">Drag, select, and modify objects in real-time</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
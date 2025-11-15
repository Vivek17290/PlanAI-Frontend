"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Canvas3D } from "@/components/Canvas3D";
import { ObjectsList } from "@/components/ObjectList";
import { ObjectProperties } from "@/components/ObjectProperties";
import { Button } from "@/components/ui/button";
import { Download, Upload, Cloud, Plus, Home } from 'lucide-react';

interface Object3D {
    name: string;
    position: { x: number; y: number; z: number };
    size: { width?: number; height?: number; depth?: number; radius?: number };
    color?: string;
    id?: string;
    type?: string; // optional
}

const PRESET_OBJECTS: Object3D[] = [
    // Living Room Furniture
    { name: "Modern Sofa", type: "sofa", position: { x: 0, y: 0, z: 0 }, size: { width: 2.5, height: 0.8, depth: 1.2 }, color: "#4A5568" },
    { name: "Coffee Table", type: "table", position: { x: 0, y: 0, z: 2 }, size: { width: 1.2, height: 0.4, depth: 0.8 }, color: "#8B4513" },
    { name: "Armchair", type: "chair", position: { x: 3, y: 0, z: 0 }, size: { width: 0.8, height: 0.9, depth: 0.8 }, color: "#2D3748" },
    { name: "TV Stand", type: "tv", position: { x: 0, y: 0, z: -2 }, size: { width: 1.8, height: 1.0, depth: 0.15 }, color: "#000000" },

    // Bedroom Furniture
    { name: "Queen Bed", type: "bed", position: { x: 0, y: 0, z: 0 }, size: { width: 2.0, height: 0.6, depth: 2.2 }, color: "#8B4513" },
    { name: "Nightstand", type: "table", position: { x: 1.5, y: 0, z: 0 }, size: { width: 0.5, height: 0.6, depth: 0.4 }, color: "#A0522D" },
    { name: "Wardrobe", type: "cabinet", position: { x: -2, y: 0, z: 0 }, size: { width: 1.2, height: 2.0, depth: 0.6 }, color: "#654321" },

    // Dining Room
    { name: "Dining Table", type: "table", position: { x: 0, y: 0, z: 0 }, size: { width: 1.8, height: 0.75, depth: 1.0 }, color: "#D2B48C" },
    { name: "Dining Chair", type: "chair", position: { x: 1, y: 0, z: 0 }, size: { width: 0.45, height: 0.85, depth: 0.45 }, color: "#8B4513" },

    // Kitchen Appliances
    { name: "Refrigerator", type: "fridge", position: { x: 0, y: 0, z: 0 }, size: { width: 0.7, height: 1.8, depth: 0.7 }, color: "#F7FAFC" },
    { name: "Kitchen Counter", type: "counter", position: { x: 0, y: 0, z: 0 }, size: { width: 2.0, height: 0.9, depth: 0.6 }, color: "#E2E8F0" },
    { name: "Kitchen Sink", type: "sink", position: { x: 0, y: 0, z: 0 }, size: { width: 0.8, height: 0.2, depth: 0.5 }, color: "#CBD5E0" },

    // Electronics & Lighting
    { name: "Wall AC Unit", type: "ac", position: { x: 0, y: 2.2, z: 0 }, size: { width: 1.0, height: 0.3, depth: 0.25 }, color: "#FFFFFF" },
    { name: "Ceiling Fan", type: "fan", position: { x: 0, y: 2.5, z: 0 }, size: { radius: 0.6, height: 0.3 }, color: "#4A5568" },
    { name: "Floor Lamp", type: "lamp", position: { x: 0, y: 0, z: 0 }, size: { radius: 0.2, height: 1.6 }, color: "#B7791F" },
    { name: "Table Lamp", type: "lamp", position: { x: 0, y: 0, z: 0 }, size: { radius: 0.15, height: 0.5 }, color: "#D69E2E" },

    // Bathroom Fixtures
    { name: "Toilet", type: "toilet", position: { x: 0, y: 0, z: 0 }, size: { width: 0.4, height: 0.8, depth: 0.7 }, color: "#FFFFFF" },
    { name: "Bathtub", type: "bathtub", position: { x: 0, y: 0, z: 0 }, size: { width: 1.7, height: 0.6, depth: 0.8 }, color: "#F7FAFC" },

    // Office Furniture
    { name: "Office Desk", type: "desk", position: { x: 0, y: 0, z: 0 }, size: { width: 1.4, height: 0.75, depth: 0.7 }, color: "#2D3748" },
    { name: "Office Chair", type: "chair", position: { x: 0, y: 0, z: 0.5 }, size: { width: 0.6, height: 1.1, depth: 0.6 }, color: "#1A202C" },

    // Decorative & Storage
    { name: "Bookshelf", type: "shelf", position: { x: 0, y: 0, z: 0 }, size: { width: 0.8, height: 2.0, depth: 0.3 }, color: "#8B4513" },
    { name: "Plant Pot", type: "cylinder", position: { x: 0, y: 0, z: 0 }, size: { radius: 0.2, height: 0.3 }, color: "#38A169" },
];

export default function ThreeDEditor() {
    const searchParams = useSearchParams();
    const [objects, setObjects] = useState<Object3D[]>([]);
    const [selectedId, setSelectedId] = useState<string | undefined>();
    const [showPresets, setShowPresets] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const selectedObject = objects.find((obj) => obj.id === selectedId);

    // Load JSON data from session storage, URL parameters, or external sources
    useEffect(() => {
        const loadDataFromParams = async () => {
            try {
                // First, check for existing floor plan in session storage
                const sessionFloorPlan = sessionStorage.getItem('floorplan-json');

                if (sessionFloorPlan && sessionFloorPlan !== 'null') {
                    console.log('Loading floor plan from session storage');
                    const parsedData = JSON.parse(sessionFloorPlan);
                    loadObjectsFromData(parsedData);
                    return; // Exit early if session storage has data
                }

                // Check for JSON data in URL parameters
                const jsonData = searchParams.get('data');
                const jsonUrl = searchParams.get('url');
                const jsonFile = searchParams.get('file');

                if (jsonData) {
                    // Direct JSON data passed as parameter
                    const parsedData = JSON.parse(decodeURIComponent(jsonData));
                    loadObjectsFromData(parsedData);
                    // Save to session storage for future use
                    sessionStorage.setItem('floorplan-json', JSON.stringify(parsedData));
                } else if (jsonUrl) {
                    // Load from external URL
                    const response = await fetch(decodeURIComponent(jsonUrl));
                    const data = await response.json();
                    loadObjectsFromData(data);
                    // Save to session storage for future use
                    sessionStorage.setItem('floorplan-json', JSON.stringify(data));
                } else if (jsonFile) {
                    // Load from local file path
                    const response = await fetch(`/${jsonFile}`);
                    const data = await response.json();
                    loadObjectsFromData(data);
                    // Save to session storage for future use
                    sessionStorage.setItem('floorplan-json', JSON.stringify(data));
                } else {
                    // No URL parameters and no session storage - try loading default detailed mall
                    console.log('No existing data found, loading default detailed mall design');
                    const response = await fetch('/detailed_mall_design.json');
                    const data = await response.json();
                    loadObjectsFromData(data);
                    // Save to session storage for future use
                    sessionStorage.setItem('floorplan-json', JSON.stringify(data));
                }
            } catch (error) {
                console.error('Failed to load data:', error);
                // If all else fails, start with empty scene
                setObjects([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadDataFromParams();
    }, [searchParams]);

    const loadObjectsFromData = (data: any[]) => {
        const withIds = data.map((obj: Object3D) => ({
            ...obj,
            id: obj.id || Math.random().toString(36).substr(2, 9),
            type: obj.type || detectObjectTypeFromName(obj.name),
        }));
        setObjects(withIds);
        setSelectedId(undefined);
    };

    const addObject = (type?: string) => {
        const newId = Math.random().toString(36).substr(2, 9);
        const newObject: Object3D = {
            id: newId,
            name: `${type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Object'} ${objects.length + 1}`,
            type: type || "cuboid",
            position: { x: 0, y: 0, z: 0 },
            size: { width: 1, height: 1, depth: 1 },
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        };
        setObjects([...objects, newObject]);
        setSelectedId(newId);
    };

    const addPresetObject = (preset: Object3D) => {
        const newId = Math.random().toString(36).substr(2, 9);
        setObjects([...objects, { ...preset, id: newId }]);
        setSelectedId(newId);
    };

    const updateObject = (updated: Object3D) => {
        const updatedObjects = objects.map((obj) => (obj.id === updated.id ? updated : obj));
        setObjects(updatedObjects);
        // Update session storage with modified objects
        const objectsWithoutIds = updatedObjects.map(({ id, ...obj }) => obj);
        sessionStorage.setItem('floorplan-json', JSON.stringify(objectsWithoutIds));
    };

    const deleteObject = () => {
        if (selectedId) {
            const filteredObjects = objects.filter((obj) => obj.id !== selectedId);
            setObjects(filteredObjects);
            setSelectedId(undefined);
            // Update session storage after deletion
            const objectsWithoutIds = filteredObjects.map(({ id, ...obj }) => obj);
            sessionStorage.setItem('floorplan-json', JSON.stringify(objectsWithoutIds));
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                const withIds = json.map((obj: Object3D) => ({
                    ...obj,
                    id: obj.id || Math.random().toString(36).substr(2, 9),
                    type: obj.type || "cuboid",
                }));
                setObjects(withIds);
                setSelectedId(undefined);
                // Save to session storage
                sessionStorage.setItem('floorplan-json', JSON.stringify(json));
            } catch (err) {
                alert("Invalid JSON file");
            }
        };
        reader.readAsText(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    };

    const handleDropFile = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file || !file.name.endsWith(".json")) return alert("Please drop a JSON file");

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                const withIds = json.map((obj: Object3D) => ({
                    ...obj,
                    id: obj.id || Math.random().toString(36).substr(2, 9),
                    type: obj.type || "cuboid",
                }));
                setObjects(withIds);
                setSelectedId(undefined);
                // Save to session storage
                sessionStorage.setItem('floorplan-json', JSON.stringify(json));
            } catch (err) {
                alert("Invalid JSON file");
            }
        };
        reader.readAsText(file);
    };

    const handleDragObjectInCanvas = (id: string, position: { x: number; y: number; z: number }) => {
        setObjects(objects.map((obj) => (obj.id === id ? { ...obj, position } : obj)));
    };

    const handleReorderObjects = (reorderedObjects: Object3D[]) => {
        setObjects(reorderedObjects);
    };

    const loadSampleFloorPlan = async () => {
        try {
            const response = await fetch('/p1.json');
            const json = await response.json();
            const withIds = json.map((obj: Object3D) => ({
                ...obj,
                id: obj.id || Math.random().toString(36).substr(2, 9),
                type: obj.type || detectObjectTypeFromName(obj.name),
            }));
            setObjects(withIds);
            setSelectedId(undefined);
        } catch (err) {
            console.error('Failed to load sample floor plan:', err);
            alert("Failed to load sample floor plan");
        }
    };

    const loadMallDesign = async () => {
        try {
            const response = await fetch('/mall_design.json');
            const json = await response.json();
            const withIds = json.map((obj: Object3D) => ({
                ...obj,
                id: obj.id || Math.random().toString(36).substr(2, 9),
                type: obj.type || detectObjectTypeFromName(obj.name),
            }));
            setObjects(withIds);
            setSelectedId(undefined);
        } catch (err) {
            console.error('Failed to load mall design:', err);
            alert("Failed to load mall design");
        }
    };

    const loadSmallMall = async () => {
        try {
            const response = await fetch('/small_mall.json');
            const json = await response.json();
            const withIds = json.map((obj: Object3D) => ({
                ...obj,
                id: obj.id || Math.random().toString(36).substr(2, 9),
                type: obj.type || detectObjectTypeFromName(obj.name),
            }));
            setObjects(withIds);
            setSelectedId(undefined);
        } catch (err) {
            console.error('Failed to load small mall:', err);
            alert("Failed to load small mall");
        }
    };

    const loadDetailedMall = async () => {
        try {
            const response = await fetch('/detailed_mall_design.json');
            const json = await response.json();
            const withIds = json.map((obj: Object3D) => ({
                ...obj,
                id: obj.id || Math.random().toString(36).substr(2, 9),
                type: obj.type || detectObjectTypeFromName(obj.name),
            }));
            setObjects(withIds);
            setSelectedId(undefined);
            // Save to session storage
            sessionStorage.setItem('floorplan-json', JSON.stringify(json));
        } catch (err) {
            console.error('Failed to load detailed mall:', err);
            alert("Failed to load detailed mall");
        }
    };

    const detectObjectTypeFromName = (name: string): string => {
        const lowerName = name.toLowerCase();

        // Architectural elements
        if (lowerName.includes('wall')) return 'wall';
        if (lowerName.includes('floor')) return 'floor';
        if (lowerName.includes('ceiling')) return 'ceiling';
        if (lowerName.includes('door')) return 'door';
        if (lowerName.includes('window')) return 'window';

        // Furniture
        if (lowerName.includes('sofa') || lowerName.includes('couch')) return 'sofa';
        if (lowerName.includes('bed')) return 'bed';
        if (lowerName.includes('table')) return 'table';
        if (lowerName.includes('chair')) return 'chair';
        if (lowerName.includes('desk')) return 'desk';
        if (lowerName.includes('cabinet') || lowerName.includes('wardrobe')) return 'cabinet';
        if (lowerName.includes('shelf') || lowerName.includes('bookshelf')) return 'shelf';

        // Electronics
        if (lowerName.includes('tv') || lowerName.includes('television')) return 'tv';
        if (lowerName.includes('ac') || lowerName.includes('air_conditioner')) return 'ac';
        if (lowerName.includes('fan')) return 'fan';
        if (lowerName.includes('lamp') || lowerName.includes('light')) return 'lamp';
        if (lowerName.includes('refrigerator') || lowerName.includes('fridge')) return 'fridge';

        // Kitchen & Bathroom
        if (lowerName.includes('stove') || lowerName.includes('cooktop')) return 'stove';
        if (lowerName.includes('sink')) return 'sink';
        if (lowerName.includes('counter')) return 'counter';
        if (lowerName.includes('toilet')) return 'toilet';
        if (lowerName.includes('bathtub') || lowerName.includes('bath')) return 'bathtub';
        if (lowerName.includes('shower')) return 'shower';

        return 'cuboid';
    };

    const exportScene = () => {
        const json = JSON.stringify(objects.map(({ id, ...obj }) => obj), null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "scene.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div
            className="flex h-screen bg-background text-foreground"
            onDragOver={handleDragOver}
            onDrop={handleDropFile}
        >
            <div className="w-72 bg-card border-r border-border flex flex-col">
                <div className="p-4 border-b border-border">
                    <h1 className="text-lg font-bold">3D Scene Editor</h1>
                    <p className="text-xs text-muted-foreground mt-1">Build & manage your 3D scene</p>
                </div>
                <div className="p-4 border-t border-border space-y-2">
                    <label className="block">
                        <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                            <span>
                                <Upload size={16} />
                                Import JSON
                                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                            </span>
                        </Button>
                    </label>
                    <Button onClick={exportScene} variant="default" size="sm" className="w-full gap-2">
                        <Download size={16} />
                        Export JSON
                    </Button>
                    <Button onClick={loadDetailedMall} variant="outline" size="sm" className="w-full gap-2">
                        <Home size={16} />
                        Load Detailed Mall
                    </Button>
                    <div className="text-xs text-muted-foreground p-2 rounded bg-secondary/50">
                        <Cloud size={14} className="inline mr-1" />
                        Drop JSON files here to import
                    </div>
                </div>

                <div className="border-t border-border p-4">
                    <button
                        onClick={() => setShowPresets(!showPresets)}
                        className="w-full flex items-center justify-between text-sm font-semibold text-foreground hover:text-primary"
                    >
                        <span className="flex items-center gap-2">
                            <Plus size={16} />
                            Add Preset Objects
                        </span>
                        <span className="text-xs">{showPresets ? '−' : '+'}</span>
                    </button>
                    {showPresets && (
                        <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
                            {PRESET_OBJECTS.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => addPresetObject(preset)}
                                    className="w-full px-2 py-1.5 text-xs text-left rounded hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-colors"
                                >
                                    <div className="font-medium text-foreground">{preset.name}</div>
                                    <div className="text-muted-foreground text-xs">
                                        {preset.position.x}, {preset.position.y}, {preset.position.z}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <ObjectsList
                    objects={objects}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onAdd={addObject}
                    onDelete={deleteObject}
                    onReorder={handleReorderObjects}
                />
            </div>

            <div className="flex-1 flex flex-col">
                {/* Scene Info Bar */}
                {objects.length > 0 && (
                    <div className="bg-slate-800 border-b border-border px-4 py-2 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">Objects: {objects.length}</span>
                            {selectedId && (
                                <span className="text-primary">
                                    Selected: {objects.find(obj => obj.id === selectedId)?.name}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Controls: Mouse to orbit • Scroll to zoom • WASD to move selected</span>
                        </div>
                    </div>
                )}

                <div className="flex-1 bg-slate-950 relative">
                    {isLoading ? (
                        <div className="w-full h-full flex items-center justify-center flex-col gap-4">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                                <p className="text-muted-foreground">Loading 3D scene...</p>
                            </div>
                        </div>
                    ) : objects.length > 0 ? (
                        <Canvas3D
                            objects={objects}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            onDragObject={handleDragObjectInCanvas}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center flex-col gap-4">
                            <div className="text-center">
                                <p className="text-muted-foreground mb-4">No objects in scene</p>
                                <Button onClick={() => addObject()} size="lg">
                                    Create First Object
                                </Button>
                                <p className="text-xs text-muted-foreground mt-4">
                                    Try loading the sample floor plan or import a JSON file
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-72 bg-card border-l border-border flex flex-col overflow-hidden">
                <div className="p-4 border-b border-border">
                    <h2 className="text-sm font-bold">Properties</h2>
                </div>
                <ObjectProperties object={selectedObject || null} onChange={updateObject} onDelete={deleteObject} />
            </div>
        </div>
    );
}

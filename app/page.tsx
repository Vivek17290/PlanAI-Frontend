"use client";

import React, { useState } from "react";
import { Canvas3D } from "@/components/Canvas3D";
import { ObjectsList } from "@/components/ObjectList";
import { ObjectProperties } from "@/components/ObjectProperties";
import { Button } from "@/components/ui/button";
import { Download, Upload, Cloud } from 'lucide-react';

interface Object3D {
  name: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  color?: string;
  id?: string;
}

export default function Home() {
  const [objects, setObjects] = useState<Object3D[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const selectedObject = objects.find((obj) => obj.id === selectedId);

  const addObject = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newObject: Object3D = {
      id: newId,
      name: `Object ${objects.length + 1}`,
      position: { x: 0, y: 0, z: 0 },
      size: { width: 1, height: 1, depth: 1 },
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    };
    const updated = [...objects, newObject];
    setObjects(updated);
    setSelectedId(newId);
  };

  const updateObject = (updated: Object3D) => {
    setObjects(objects.map((obj) => (obj.id === updated.id ? updated : obj)));
  };

  const deleteObject = () => {
    if (selectedId) {
      setObjects(objects.filter((obj) => obj.id !== selectedId));
      setSelectedId(undefined);
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
        }));
        setObjects(withIds);
        setSelectedId(undefined);
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
    if (!file || !file.name.endsWith(".json")) {
      alert("Please drop a JSON file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const withIds = json.map((obj: Object3D) => ({
          ...obj,
          id: obj.id || Math.random().toString(36).substr(2, 9),
        }));
        setObjects(withIds);
        setSelectedId(undefined);
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

  const exportScene = () => {
    const json = JSON.stringify(
      objects.map(({ id, ...obj }) => obj),
      null,
      2
    );
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
      {/* Left Sidebar - Objects List */}
      <div className="w-72 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-bold">3D Scene Editor</h1>
          <p className="text-xs text-muted-foreground mt-1">Build & manage your 3D scene</p>
        </div>

        <ObjectsList
          objects={objects}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={addObject}
          onDelete={deleteObject}
          onReorder={handleReorderObjects}
        />

        <div className="p-4 border-t border-border space-y-2">
          <label className="block">
            <Button variant="outline" size="sm" className="w-full gap-2" asChild>
              <span>
                <Upload size={16} />
                Import JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </span>
            </Button>
          </label>
          <Button onClick={exportScene} variant="default" size="sm" className="w-full gap-2">
            <Download size={16} />
            Export JSON
          </Button>
          <div className="text-xs text-muted-foreground p-2 rounded bg-secondary/50">
            <Cloud size={14} className="inline mr-1" />
            Drop JSON files here to import
          </div>
        </div>
      </div>

      {/* Center - 3D Viewport */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-slate-950">
          {objects.length > 0 ? (
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
                <Button onClick={addObject} size="lg">
                  Create First Object
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div className="w-72 bg-card border-l border-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold">Properties</h2>
        </div>
        <ObjectProperties
          object={selectedObject || null}
          onChange={updateObject}
          onDelete={deleteObject}
        />
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Object3D {
    name: string;
    position: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    size: { width?: number; height?: number; depth?: number; radius?: number };
    color?: string;
    id?: string;
    type?: string;
}


interface ObjectPropertiesProps {
  object: Object3D | null;
  onChange: (object: Object3D) => void;
  onDelete: () => void;
}

const PRESET_COLORS = [
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Green", value: "#22C55E" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#4F46E5" },
  { name: "Purple", value: "#A855F7" },
  { name: "Pink", value: "#EC4899" },
  { name: "White", value: "#FFFFFF" },
  { name: "Gray", value: "#808080" },
  { name: "Black", value: "#000000" },
  { name: "Brown", value: "#8B4513" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Lime", value: "#84CC16" },
  { name: "Fuchsia", value: "#D946EF" },
  { name: "Slate", value: "#64748B" },
  { name: "Stone", value: "#78716C" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Emerald", value: "#10B981" },
];

const OBJECT_TYPES = [
  "cuboid",
  "cube",
  "sphere",
  "cylinder",
  "cone",
  "pyramid",
  "torus",
  "capsule",
  "thin-cuboid",
  "flat-cylinder",
  "L-shape",
  "T-shape",
  "irregular",
];

export const ObjectProperties: React.FC<ObjectPropertiesProps> = ({
  object,
  onChange,
  onDelete,
}) => {
  const [localObject, setLocalObject] = useState<Object3D | null>(object);

  useEffect(() => {
    setLocalObject(object);
  }, [object]);

  if (!localObject) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">Select an object to edit properties</p>
      </div>
    );
  }

  const updateProperty = (key: string, value: any) => {
    const updated = { ...localObject, [key]: value };
    setLocalObject(updated);
    onChange(updated);
  };

  const updateNested = (parent: string, key: string, value: number) => {
    const updated = {
      ...localObject,
      [parent]: { ...localObject[parent as keyof Object3D], [key]: value },
    };
    setLocalObject(updated);
    onChange(updated);
  };

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full">
      <div>
        <Label className="text-sm font-semibold text-foreground mb-2 block">Name</Label>
        <Input
          value={localObject.name}
          onChange={(e) => updateProperty("name", e.target.value)}
          className="bg-input text-foreground"
        />
      </div>

      <div>
        <Label className="text-sm font-semibold text-foreground mb-2 block">Object Type</Label>
        <select
          value={localObject.type || "cuboid"}
          onChange={(e) => updateProperty("type", e.target.value)}
          className="w-full px-3 py-2 rounded border border-border bg-input text-foreground text-sm"
        >
          {OBJECT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label className="text-sm font-semibold text-foreground mb-3 block">Position</Label>
        <div className="space-y-2">
          {["x", "y", "z"].map((axis) => (
            <div key={axis} className="flex items-center gap-2">
              <label className="w-8 text-xs font-medium text-muted-foreground">{axis.toUpperCase()}</label>
              <Input
                type="number"
                value={localObject.position[axis as keyof typeof localObject.position]}
                onChange={(e) => updateNested("position", axis, parseFloat(e.target.value))}
                step="0.1"
                className="bg-input text-foreground"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-foreground mb-3 block">Rotation (degrees)</Label>
        <div className="space-y-2">
          {["x", "y", "z"].map((axis) => (
            <div key={axis} className="flex items-center gap-2">
              <label className="w-8 text-xs font-medium text-muted-foreground">{axis.toUpperCase()}</label>
              <Input
                type="number"
                value={Math.round((localObject.rotation?.[axis as keyof typeof localObject.rotation] || 0) * 180 / Math.PI)}
                onChange={(e) => {
                  const degrees = parseFloat(e.target.value) || 0;
                  const radians = degrees * Math.PI / 180;
                  const currentRotation = localObject.rotation || { x: 0, y: 0, z: 0 };
                  updateProperty("rotation", { ...currentRotation, [axis]: radians });
                }}
                step="15"
                className="bg-input text-foreground"
              />
              <span className="text-xs text-muted-foreground">°</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateProperty("rotation", { x: 0, y: 0, z: 0 })}
            className="text-xs"
          >
            Reset
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const currentRotation = localObject.rotation || { x: 0, y: 0, z: 0 };
              updateProperty("rotation", { ...currentRotation, y: currentRotation.y + Math.PI / 2 });
            }}
            className="text-xs"
          >
            +90° Y
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-foreground mb-3 block">Size</Label>
        <div className="space-y-2">
          {["width", "height", "depth"].map((dim) => (
            <div key={dim} className="flex items-center gap-2">
              <label className="w-12 text-xs font-medium text-muted-foreground">{dim.charAt(0).toUpperCase()}</label>
              <Input
                type="number"
                value={localObject.size?.[dim as keyof typeof localObject.size] || 1}
                onChange={(e) => updateNested("size", dim, parseFloat(e.target.value) || 1)}
                step="0.1"
                min="0.1"
                className="bg-input text-foreground"
              />
            </div>
          ))}
          {/* Add radius field for spheres, cylinders, etc. */}
          {(localObject.type === 'sphere' || localObject.type === 'cylinder' || localObject.type === 'cone' || localObject.type === 'fan' || localObject.type === 'lamp') && (
            <div className="flex items-center gap-2">
              <label className="w-12 text-xs font-medium text-muted-foreground">Radius</label>
              <Input
                type="number"
                value={localObject.size?.radius || 0.5}
                onChange={(e) => updateNested("size", "radius", parseFloat(e.target.value) || 0.5)}
                step="0.1"
                min="0.1"
                className="bg-input text-foreground"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-foreground mb-3 block">Color</Label>
        <div className="flex gap-2 mb-3">
          <input
            type="color"
            value={localObject.color || "#ff9500"}
            onChange={(e) => updateProperty("color", e.target.value)}
            className="w-12 h-10 rounded cursor-pointer border border-border"
          />
          <Input
            value={localObject.color || "#ff9500"}
            onChange={(e) => updateProperty("color", e.target.value)}
            className="bg-input text-foreground flex-1 text-xs"
          />
        </div>
        
        <div className="text-xs font-semibold text-muted-foreground mb-2">Preset Colors:</div>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => updateProperty("color", color.value)}
              title={color.name}
              className={`w-full aspect-square rounded border-2 transition-all ${
                localObject.color === color.value
                  ? "border-primary shadow-lg scale-110"
                  : "border-border hover:border-primary/50"
              }`}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>
      </div>

      <Button
        onClick={onDelete}
        variant="destructive"
        className="w-full mt-auto"
      >
        Delete Object
      </Button>
    </div>
  );
};

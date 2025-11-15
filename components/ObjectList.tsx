"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, Plus } from 'lucide-react';

interface Object3D {
    name: string;
    position: { x: number; y: number; z: number };
    size: { width: number; height: number; depth: number };
    color?: string;
    id?: string;
    type?: string; // must be optional
}


interface ObjectsListProps {
    objects: Object3D[];
    selectedId?: string;
    onSelect: (id: string) => void;
    onAdd: (type?: string) => void;
    onDelete: () => void;
    onReorder?: (objects: Object3D[]) => void;
}

const QUICK_ADD_TYPES = ["cube", "sphere", "cylinder", "cone", "pyramid"];

export const ObjectsList: React.FC<ObjectsListProps> = ({
    objects,
    selectedId,
    onSelect,
    onAdd,
    onDelete,
    onReorder,
}) => {
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [showQuickAdd, setShowQuickAdd] = useState(false);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedId || draggedId === targetId || !onReorder) return;

        const draggedIndex = objects.findIndex((o) => o.id === draggedId);
        const targetIndex = objects.findIndex((o) => o.id === targetId);

        const newObjects = [...objects];
        const [draggedObject] = newObjects.splice(draggedIndex, 1);
        newObjects.splice(targetIndex, 0, draggedObject);

        onReorder(newObjects);
        setDraggedId(null);
    };

    const handleDragEnd = () => {
        setDraggedId(null);
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border space-y-2">
                <Button onClick={() => onAdd()} variant="default" size="sm" className="w-full">
                    <Plus size={14} className="mr-1" />
                    Add Object
                </Button>
                
                <button
                    onClick={() => setShowQuickAdd(!showQuickAdd)}
                    className="w-full text-xs text-muted-foreground hover:text-foreground text-left py-1"
                >
                    {showQuickAdd ? "Hide Quick Add" : "Show Quick Add"}
                </button>
                
                {showQuickAdd && (
                    <div className="grid grid-cols-2 gap-1">
                        {QUICK_ADD_TYPES.map((type) => (
                            <Button
                                key={type}
                                onClick={() => onAdd(type)}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {objects.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No objects yet</p>
                ) : (
                    <div className="space-y-1">
                        {objects.map((obj) => (
                            <div
                                key={obj.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, obj.id || "")}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, obj.id || "")}
                                onDragEnd={handleDragEnd}
                                onClick={() => onSelect(obj.id || "")}
                                className={`p-2 rounded cursor-move transition-colors ${
                                    selectedId === obj.id
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary hover:bg-secondary/80"
                                } ${draggedId === obj.id ? "opacity-50" : ""}`}
                            >
                                <div className="flex items-center gap-2">
                                    <GripVertical size={14} className="flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{obj.name}</p>
                                        <p className="text-xs opacity-75">
                                            {obj.type ? `${obj.type} • ` : ""}{obj.position.x.toFixed(1)}, {obj.position.y.toFixed(1)}, {obj.position.z.toFixed(1)}
                                        </p>
                                    </div>
                                    {obj.color && (
                                        <div
                                            className="w-4 h-4 rounded border border-border flex-shrink-0"
                                            style={{ backgroundColor: obj.color }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedId && (
                <div className="p-4 border-t border-border">
                    <Button
                        onClick={onDelete}
                        variant="destructive"
                        size="sm"
                        className="w-full gap-2"
                    >
                        <Trash2 size={14} />
                        Delete Selected
                    </Button>
                </div>
            )}
        </div>
    );
};

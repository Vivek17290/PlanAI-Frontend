"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Home,
  Square,
  DoorOpen,
  Maximize2,
  Trash2,
  Move,
  MousePointer,
} from "lucide-react";

type Point = { x: number; y: number };

interface Wall {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Item {
  id: number;
  type: "door" | "window";
  x: number;
  y: number;
  wallId: number;
}

const FloorPlanner: React.FC = () => {
  const [mode, setMode] = useState<"select" | "wall" | "door" | "window">(
    "select"
  );
  const [walls, setWalls] = useState<Wall[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [gridSize] = useState(20);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const snapToGrid = (point: Point): Point => ({
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  });

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const point = snapToGrid(getCanvasPoint(e));

    if (mode === "wall") {
      setDrawing(true);
      setStartPoint(point);
      setCurrentPoint(point);
    } else if (mode === "select") {
      const clickedWall = walls.find((w) => isPointNearLine(point, w));
      const clickedItem = items.find(
        (item) =>
          point.x >= item.x - 15 &&
          point.x <= item.x + 15 &&
          point.y >= item.y - 15 &&
          point.y <= item.y + 15
      );
      setSelectedId(clickedWall?.id || clickedItem?.id || null);
    } else if (mode === "door" || mode === "window") {
      const nearWall = walls.find((w) => isPointNearLine(point, w));
      if (nearWall) {
        const newItem: Item = {
          id: Date.now(),
          type: mode,
          x: point.x,
          y: point.y,
          wallId: nearWall.id,
        };
        setItems([...items, newItem]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (drawing && mode === "wall") {
      setCurrentPoint(snapToGrid(getCanvasPoint(e)));
    }
  };

  const handleMouseUp = () => {
    if (drawing && startPoint && currentPoint) {
      if (startPoint.x !== currentPoint.x || startPoint.y !== currentPoint.y) {
        const newWall: Wall = {
          id: Date.now(),
          x1: startPoint.x,
          y1: startPoint.y,
          x2: currentPoint.x,
          y2: currentPoint.y,
        };
        setWalls([...walls, newWall]);
      }
      setDrawing(false);
      setStartPoint(null);
      setCurrentPoint(null);
    }
  };

  const isPointNearLine = (point: Point, wall: Wall, threshold = 10): boolean => {
    const { x1, y1, x2, y2 } = wall;
    const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const distance =
      Math.abs((y2 - y1) * point.x - (x2 - x1) * point.y + x2 * y1 - y2 * x1) /
      lineLength;

    const withinSegment =
      point.x >= Math.min(x1, x2) - threshold &&
      point.x <= Math.max(x1, x2) + threshold &&
      point.y >= Math.min(y1, y2) - threshold &&
      point.y <= Math.max(y1, y2) + threshold;

    return distance < threshold && withinSegment;
  };

  const deleteSelected = () => {
    if (selectedId) {
      setWalls(walls.filter((w) => w.id !== selectedId));
      setItems(items.filter((i) => i.id !== selectedId));
      setSelectedId(null);
    }
  };

  const clearAll = () => {
    setWalls([]);
    setItems([]);
    setSelectedId(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw grid
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width / zoom; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height / zoom);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height / zoom; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width / zoom, y);
      ctx.stroke();
    }

    // Draw walls
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 6;
    walls.forEach((wall) => {
      ctx.beginPath();
      ctx.moveTo(wall.x1, wall.y1);
      ctx.lineTo(wall.x2, wall.y2);
      ctx.stroke();

      if (wall.id === selectedId) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(wall.x1, wall.y1);
        ctx.lineTo(wall.x2, wall.y2);
        ctx.stroke();
        ctx.strokeStyle = "#1f2937";
        ctx.lineWidth = 6;
      }
    });

    // Draw current wall
    if (drawing && startPoint && currentPoint) {
      ctx.strokeStyle = "#6b7280";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw items
    items.forEach((item) => {
      if (item.type === "door") {
        ctx.fillStyle = item.id === selectedId ? "#3b82f6" : "#8b5cf6";
        ctx.fillRect(item.x - 15, item.y - 3, 30, 6);
        ctx.fillRect(item.x - 3, item.y - 15, 6, 15);
      } else if (item.type === "window") {
        ctx.fillStyle = item.id === selectedId ? "#3b82f6" : "#06b6d4";
        ctx.fillRect(item.x - 15, item.y - 2, 30, 4);
        ctx.strokeStyle = item.id === selectedId ? "#3b82f6" : "#06b6d4";
        ctx.strokeRect(item.x - 15, item.y - 8, 30, 16);
      }
    });

    ctx.restore();
  }, [walls, items, selectedId, drawing, startPoint, currentPoint, zoom, pan, gridSize]);

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white shadow-md p-4 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setMode("select")}
          className={`p-2 rounded ${mode === "select" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          title="Select"
        >
          <MousePointer size={20} />
        </button>
        <button
          onClick={() => setMode("wall")}
          className={`p-2 rounded ${mode === "wall" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          title="Draw Wall"
        >
          <Square size={20} />
        </button>
        <button
          onClick={() => setMode("door")}
          className={`p-2 rounded ${mode === "door" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          title="Add Door"
        >
          <DoorOpen size={20} />
        </button>
        <button
          onClick={() => setMode("window")}
          className={`p-2 rounded ${mode === "window" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          title="Add Window"
        >
          <Maximize2 size={20} />
        </button>

        <div className="border-l border-gray-300 h-8 mx-2"></div>

        <button
          onClick={deleteSelected}
          disabled={!selectedId}
          className={`p-2 rounded ${selectedId ? "bg-red-500 text-white" : "bg-gray-200 text-gray-400"}`}
          title="Delete Selected"
        >
          <Trash2 size={20} />
        </button>
        <button
          onClick={clearAll}
          className="p-2 rounded bg-gray-200 hover:bg-gray-300"
          title="Clear All"
        >
          Clear All
        </button>

        <div className="border-l border-gray-300 h-8 mx-2"></div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Zoom:</span>
          <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="px-2 py-1 bg-gray-200 rounded">
            -
          </button>
          <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="px-2 py-1 bg-gray-200 rounded">
            +
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={2000}
          height={1200}
          className="absolute inset-0 cursor-crosshair bg-white"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Instructions */}
      <div className="bg-gray-800 text-white p-2 text-sm">
        {mode === "wall" && "Click and drag to draw walls"}
        {mode === "door" && "Click on a wall to add a door"}
        {mode === "window" && "Click on a wall to add a window"}
        {mode === "select" && "Click on items to select them"}
        <span className="ml-4">Walls: {walls.length}</span>
        <span className="ml-4">Items: {items.length}</span>
      </div>
    </div>
  );
};

export default FloorPlanner;

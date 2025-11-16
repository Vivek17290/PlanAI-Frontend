'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Square, DoorOpen, Maximize2, Trash2, MousePointer, Download, Sofa, Image } from 'lucide-react';
import { Preview3DModal } from "./prev";

interface Point {
  x: number;
  y: number;
}

interface Wall {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Item {
  id: number;
  type: 'door' | 'window';
  x: number;
  y: number;
  wallId: number | null;
}

interface JSONObject {
  name: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  color: string;
}

interface PlottedObject {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  color: string;
  type: 'wall' | 'furniture' | 'fixture';
}

interface FurnitureItem {
  id: string;
  name: string;
  width: number;
  depth: number;
  color: string;
  icon: string; // Changed from JSX.Element to string (emoji)
}

type Mode = 'select' | 'wall' | 'door' | 'window' | 'furniture';

const FURNITURE_CATALOG: FurnitureItem[] = [
  { id: 'sofa', name: 'Sofa', width: 200, depth: 100, color: '#8b4513', icon: '🛋️' },
  { id: 'bed', name: 'Bed', width: 180, depth: 200, color: '#d4a574', icon: '🛏️' },
  { id: 'table', name: 'Table', width: 120, depth: 120, color: '#a0826d', icon: '🪑' },
  { id: 'chair', name: 'Chair', width: 80, depth: 80, color: '#8b7355', icon: '🪑' },
  { id: 'desk', name: 'Desk', width: 150, depth: 80, color: '#654321', icon: '🖥️' },
  { id: 'cabinet', name: 'Cabinet', width: 100, depth: 60, color: '#7a5c3d', icon: '🗄️' },
];

const FloorPlanner: React.FC = () => {
  const [mode, setMode] = useState<Mode>('select');
  const [walls, setWalls] = useState<Wall[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [plottedObjects, setPlottedObjects] = useState<PlottedObject[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [resizing, setResizing] = useState<{ id: number; corner: string } | null>(null);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [gridSize] = useState<number>(20);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [] = useState<boolean>(false);
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureItem | null>(null);
  const [showFurniturePanel, setShowFurniturePanel] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const dragOffset = useRef<Point>({ x: 0, y: 0 });
  const [is3DOpen, setIs3DOpen] = useState(false);

  const snapToGrid = (point: Point): Point => ({
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize
  });

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
  };

  const isPointInObject = (point: Point, obj: PlottedObject, threshold: number = 8): boolean => {
    const left = obj.x - obj.width / 2;
    const right = obj.x + obj.width / 2;
    const top = obj.y - obj.depth / 2;
    const bottom = obj.y + obj.depth / 2;
    
    return point.x >= left - threshold && point.x <= right + threshold &&
           point.y >= top - threshold && point.y <= bottom + threshold;
  };

  const getResizeHandle = (point: Point, obj: PlottedObject, threshold: number = 15): string | null => {
    const left = obj.x - obj.width / 2;
    const right = obj.x + obj.width / 2;
    const top = obj.y - obj.depth / 2;
    const bottom = obj.y + obj.depth / 2;
    
    const corners = [
      { name: 'nw', x: left, y: top },
      { name: 'ne', x: right, y: top },
      { name: 'sw', x: left, y: bottom },
      { name: 'se', x: right, y: bottom }
    ];
    
    for (const corner of corners) {
      if (Math.abs(point.x - corner.x) < threshold && Math.abs(point.y - corner.y) < threshold) {
        return corner.name;
      }
    }
    return null;
  };

  const categorizeObject = (name: string): 'wall' | 'furniture' | 'fixture' => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('wall')) return 'wall';
    if (lowerName.includes('window') || lowerName.includes('door')) return 'fixture';
    if (lowerName.includes('counter') || lowerName.includes('shelves')) return 'furniture';
    return 'fixture';
  };

  const mergeWalls = (walls: Wall[]): Wall[] => {
    if (walls.length === 0) return walls;
    
    const merged: Wall[] = [];
    const used = new Set<number>();
    const tolerance = 20; // Increased tolerance for better merging
    
    walls.forEach((wall, idx) => {
      if (used.has(idx)) return;
      
      const isHorizontal = Math.abs(wall.y2 - wall.y1) < tolerance;
      const isVertical = Math.abs(wall.x2 - wall.x1) < tolerance;
      
      if (!isHorizontal && !isVertical) {
        merged.push(wall);
        used.add(idx);
        return;
      }
      
      let minStart = isHorizontal ? Math.min(wall.x1, wall.x2) : Math.min(wall.y1, wall.y2);
      let maxEnd = isHorizontal ? Math.max(wall.x1, wall.x2) : Math.max(wall.y1, wall.y2);
      const fixedCoord = isHorizontal ? wall.y1 : wall.x1;
      const wallsToMerge = [idx];
      
      // Find all walls that can be merged with this one
      walls.forEach((otherWall, otherIdx) => {
        if (used.has(otherIdx) || otherIdx === idx) return;
        
        const otherIsHorizontal = Math.abs(otherWall.y2 - otherWall.y1) < tolerance;
        const otherIsVertical = Math.abs(otherWall.x2 - otherWall.x1) < tolerance;
        
        // Check if same orientation and aligned
        if (isHorizontal && otherIsHorizontal && Math.abs(otherWall.y1 - fixedCoord) < tolerance) {
          const otherMinStart = Math.min(otherWall.x1, otherWall.x2);
          const otherMaxEnd = Math.max(otherWall.x1, otherWall.x2);
          
          // Check if adjacent or overlapping with tolerance
          if (otherMaxEnd + tolerance >= minStart && otherMinStart - tolerance <= maxEnd) {
            minStart = Math.min(minStart, otherMinStart);
            maxEnd = Math.max(maxEnd, otherMaxEnd);
            wallsToMerge.push(otherIdx);
          }
        } else if (isVertical && otherIsVertical && Math.abs(otherWall.x1 - fixedCoord) < tolerance) {
          const otherMinStart = Math.min(otherWall.y1, otherWall.y2);
          const otherMaxEnd = Math.max(otherWall.y1, otherWall.y2);
          
          // Check if adjacent or overlapping with tolerance
          if (otherMaxEnd + tolerance >= minStart && otherMinStart - tolerance <= maxEnd) {
            minStart = Math.min(minStart, otherMinStart);
            maxEnd = Math.max(maxEnd, otherMaxEnd);
            wallsToMerge.push(otherIdx);
          }
        }
      });
      
      // Create merged wall
      if (isHorizontal) {
        merged.push({
          id: Date.now(),
          x1: minStart,
          y1: fixedCoord,
          x2: maxEnd,
          y2: fixedCoord
        });
      } else {
        merged.push({
          id: Date.now(),
          x1: fixedCoord,
          y1: minStart,
          x2: fixedCoord,
          y2: maxEnd
        });
      }
      
      wallsToMerge.forEach(wIdx => used.add(wIdx));
    });
    
    return merged;
  };


  const loadJSONData = (jsonData: JSONObject[]) => {
    const scale = 50;
    const wallObjects: PlottedObject[] = [];
    const otherObjects: PlottedObject[] = [];
    
    jsonData.forEach((obj, idx) => {
      const plotted: PlottedObject = {
        id: Date.now() + idx,
        name: obj.name,
        x: obj.position.x * scale + 500,
        y: obj.position.z * scale + 400,
        width: obj.size.width * scale,
        depth: obj.size.depth * scale,
        color: obj.color,
        type: categorizeObject(obj.name)
      };
      
      if (plotted.type === 'wall') {
        wallObjects.push(plotted);
      } else {
        otherObjects.push(plotted);
      }
    });
    
    const newWalls: Wall[] = [];
    wallObjects.forEach((wall, idx) => {
      const left = wall.x - wall.width / 2;
      const right = wall.x + wall.width / 2;
      const top = wall.y - wall.depth / 2;
      const bottom = wall.y + wall.depth / 2;
      
      if (wall.width > wall.depth) {
        newWalls.push({
          id: Date.now() + idx,
          x1: left,
          y1: wall.y,
          x2: right,
          y2: wall.y
        });
      } else {
        newWalls.push({
          id: Date.now() + idx,
          x1: wall.x,
          y1: top,
          x2: wall.x,
          y2: bottom
        });
      }
    });
    
    const mergedWalls = mergeWalls(newWalls);
    setWalls(mergedWalls);
    setPlottedObjects(otherObjects);
    
    calculateAndSetPan(mergedWalls, otherObjects);
  };

  const calculateAndSetPan = (wallsData: Wall[], objectsData: PlottedObject[]) => {
    requestAnimationFrame(() => {
      if (wallsData.length === 0 && objectsData.length === 0) return;

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

      wallsData.forEach(wall => {
        minX = Math.min(minX, wall.x1, wall.x2);
        maxX = Math.max(maxX, wall.x1, wall.x2);
        minY = Math.min(minY, wall.y1, wall.y2);
        maxY = Math.max(maxY, wall.y1, wall.y2);
      });

      objectsData.forEach(obj => {
        minX = Math.min(minX, obj.x - obj.width / 2);
        maxX = Math.max(maxX, obj.x + obj.width / 2);
        minY = Math.min(minY, obj.y - obj.depth / 2);
        maxY = Math.max(maxY, obj.y + obj.depth / 2);
      });

      const canvas = canvasRef.current;
      if (!canvas) return;

      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      const padding = 50;

      const zoomX = (canvas.width - padding * 2) / contentWidth;
      const zoomY = (canvas.height - padding * 2) / contentHeight;
      const newZoom = Math.min(zoomX, zoomY, 0.5);

      setPan({
        x: padding - minX * newZoom,
        y: padding - minY * newZoom
      });
      setZoom(newZoom);
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    if (mode === 'select') {
      const clickedObject = plottedObjects.find(obj => isPointInObject(point, obj));
      if (clickedObject) {
        const resizeHandle = getResizeHandle(point, clickedObject);
        if (resizeHandle) {
          setResizing({ id: clickedObject.id, corner: resizeHandle });
        } else {
          setDraggingId(clickedObject.id);
          dragOffset.current = {
            x: point.x - clickedObject.x,
            y: point.y - clickedObject.y
          };
        }
        setSelectedId(clickedObject.id);
        return;
      }

      const clickedWall = walls.find(w => isPointNearLine(point, w));
      const clickedItem = items.find(item => 
        point.x >= item.x - 15 && point.x <= item.x + 15 &&
        point.y >= item.y - 15 && point.y <= item.y + 15
      );
      setSelectedId(clickedWall?.id || clickedItem?.id || null);
    } else if (mode === 'wall') {
      setDrawing(true);
      setStartPoint(snapToGrid(point));
      setCurrentPoint(snapToGrid(point));
    } else if (mode === 'door' || mode === 'window') {
      const snapPoint = snapToGrid(point);
      const nearWall = walls.find(w => isPointNearLine(snapPoint, w));
      if (nearWall) {
        const newItem: Item = {
          id: Date.now(),
          type: mode,
          x: snapPoint.x,
          y: snapPoint.y,
          wallId: nearWall.id
        };
        setItems([...items, newItem]);
      }
    } else if (mode === 'furniture' && selectedFurniture) {
      const newObject: PlottedObject = {
        id: Date.now(),
        name: selectedFurniture.name,
        x: snapToGrid(point).x,
        y: snapToGrid(point).y,
        width: selectedFurniture.width,
        depth: selectedFurniture.depth,
        color: selectedFurniture.color,
        type: 'furniture'
      };
      setPlottedObjects([...plottedObjects, newObject]);
      setSelectedFurniture(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    if (draggingId !== null) {
      setPlottedObjects(plottedObjects.map(obj => {
        if (obj.id === draggingId) {
          return {
            ...obj,
            x: snapToGrid({ x: point.x - dragOffset.current.x, y: 0 }).x,
            y: snapToGrid({ x: 0, y: point.y - dragOffset.current.y }).y
          };
        }
        return obj;
      }));
    } else if (resizing) {
      setPlottedObjects(plottedObjects.map(obj => {
        if (obj.id === resizing.id) {
          const corner = resizing.corner;
          const centerX = obj.x;
          const centerY = obj.y;
          const left = centerX - obj.width / 2;
          const right = centerX + obj.width / 2;
          const top = centerY - obj.depth / 2;
          const bottom = centerY + obj.depth / 2;

          let newLeft = left, newRight = right, newTop = top, newBottom = bottom;

          if (corner.includes('w')) newLeft = point.x;
          if (corner.includes('e')) newRight = point.x;
          if (corner.includes('n')) newTop = point.y;
          if (corner.includes('s')) newBottom = point.y;

          const newWidth = Math.max(20, newRight - newLeft);
          const newDepth = Math.max(20, newBottom - newTop);
          const newX = newLeft + newWidth / 2;
          const newY = newTop + newDepth / 2;

          return { ...obj, x: newX, y: newY, width: newWidth, depth: newDepth };
        }
        return obj;
      }));
    } else if (drawing && mode === 'wall') {
      setCurrentPoint(snapToGrid(point));
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
          y2: currentPoint.y
        };
        setWalls([...walls, newWall]);
      }
      setDrawing(false);
      setStartPoint(null);
      setCurrentPoint(null);
    }
    setDraggingId(null);
    setResizing(null);
  };

  const isPointNearLine = (point: Point, wall: Wall, threshold: number = 10): boolean => {
    const { x1, y1, x2, y2 } = wall;
    const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const distance = Math.abs((y2 - y1) * point.x - (x2 - x1) * point.y + x2 * y1 - y2 * x1) / lineLength;
    
    const withinSegment = 
      point.x >= Math.min(x1, x2) - threshold &&
      point.x <= Math.max(x1, x2) + threshold &&
      point.y >= Math.min(y1, y2) - threshold &&
      point.y <= Math.max(y1, y2) + threshold;
    
    return distance < threshold && withinSegment;
  };

  const deleteSelected = () => {
    if (selectedId) {
      setWalls(walls.filter(w => w.id !== selectedId));
      setItems(items.filter(i => i.id !== selectedId));
      setPlottedObjects(plottedObjects.filter(o => o.id !== selectedId));
      setSelectedId(null);
    }
  };

  const clearAll = () => {
    setWalls([]);
    setItems([]);
    setPlottedObjects([]);
    setSelectedId(null);
  };

  const handleJSONUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          if (Array.isArray(jsonData)) {
            loadJSONData(jsonData);
          }
        } catch (err) {
          console.error('Error parsing JSON:', err);
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const exportToJSON = () => {
    // Map walls back to JSON format
    const wallObjects = walls.map((wall) => {
      const isHorizontal = Math.abs(wall.y2 - wall.y1) < 5;
      const scale = 50;
      
      if (isHorizontal) {
        const width = Math.abs(wall.x2 - wall.x1) / scale;
        const x = (Math.min(wall.x1, wall.x2) + width * scale / 2 - 500) / scale;
        const z = (wall.y1 - 400) / scale;
        
        return {
          name: `interior_wall_${walls.indexOf(wall)}`,
          position: { x, y: 0, z },
          size: { width, height: 2.5, depth: 0.2 },
          color: '#f2f3f5'
        };
      } else {
        const depth = Math.abs(wall.y2 - wall.y1) / scale;
        const x = (wall.x1 - 500) / scale;
        const z = (Math.min(wall.y1, wall.y2) + depth * scale / 2 - 400) / scale;
        
        return {
          name: `interior_wall_${walls.indexOf(wall)}`,
          position: { x, y: 0, z },
          size: { width: 0.2, height: 2.5, depth },
          color: '#f2f3f5'
        };
      }
    });

    // Map doors and windows
    const doorWindowObjects = items.map((item) => {
      const scale = 50;
      return {
        name: `${item.type}_${items.indexOf(item)}`,
        position: {
          x: (item.x - 500) / scale,
          y: 0,
          z: (item.y - 400) / scale
        },
        size: { width: item.type === 'door' ? 0.9 : 1.2, height: 2.1, depth: 0.1 },
        color: item.type === 'door' ? '#8b5cf6' : '#06b6d4'
      };
    });

    // Map furniture objects
    const furnitureObjects = plottedObjects.map((obj) => {
      const scale = 50;
      return {
        name: obj.name,
        position: {
          x: (obj.x - 500) / scale,
          y: 0,
          z: (obj.y - 400) / scale
        },
        size: {
          width: obj.width / scale,
          height: 1,
          depth: obj.depth / scale
        },
        color: obj.color
      };
    });

    const combinedData = [...wallObjects, ...doorWindowObjects, ...furnitureObjects];
    
    const jsonString = JSON.stringify(combinedData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `floorplan_${new Date().getTime()}.json`;
    link.click();
    localStorage.setItem("floorplan-json", jsonString);
    URL.revokeObjectURL(url);
  };

  const exportAsImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas with white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Fill with white background
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the current canvas content
    tempCtx.drawImage(canvas, 0, 0);

    // Download as PNG
    const link = document.createElement('a');
    link.href = tempCanvas.toDataURL('image/png');
    link.download = `floorplan_${new Date().getTime()}.png`;
    link.click();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
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

    plottedObjects.forEach(obj => {
      const furniture = FURNITURE_CATALOG.find(f => f.name === obj.name);
      
      if (furniture) {
        // Draw only the icon, enlarged
        ctx.font = `bold ${Math.max(40, obj.width * 0.6)}px Arial`;
        ctx.fillStyle = obj.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(furniture.icon, obj.x, obj.y);
      }

      // Draw selection border when selected
      const isSelected = obj.id === selectedId;
      if (isSelected) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.strokeRect(obj.x - obj.width / 2, obj.y - obj.depth / 2, obj.width, obj.depth);

        const size = 6;
        const left = obj.x - obj.width / 2;
        const right = obj.x + obj.width / 2;
        const top = obj.y - obj.depth / 2;
        const bottom = obj.y + obj.depth / 2;
        
        ctx.fillStyle = '#3b82f6';
        [[left, top], [right, top], [left, bottom], [right, bottom]].forEach(([px, py]) => {
          ctx.fillRect(px - size / 2, py - size / 2, size, size);
        });
      }
    });

    walls.forEach(wall => {
      const isSelected = wall.id === selectedId;
      
      ctx.strokeStyle = '#8b8b8b';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(wall.x1, wall.y1);
      ctx.lineTo(wall.x2, wall.y2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      
      ctx.strokeStyle = isSelected ? '#3b82f6' : '#1f2937';
      ctx.lineWidth = isSelected ? 8 : 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(wall.x1, wall.y1);
      ctx.lineTo(wall.x2, wall.y2);
      ctx.stroke();
    });

    if (drawing && startPoint && currentPoint) {
      ctx.strokeStyle = '#6b7280';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    items.forEach(item => {
      if (item.type === 'door') {
        ctx.fillStyle = item.id === selectedId ? '#3b82f6' : '#8b5cf6';
        ctx.fillRect(item.x - 15, item.y - 3, 30, 6);
        ctx.fillRect(item.x - 3, item.y - 15, 6, 15);
      } else if (item.type === 'window') {
        ctx.fillStyle = item.id === selectedId ? '#3b82f6' : '#06b6d4';
        ctx.fillRect(item.x - 15, item.y - 2, 30, 4);
        ctx.strokeStyle = item.id === selectedId ? '#3b82f6' : '#06b6d4';
        ctx.strokeRect(item.x - 15, item.y - 8, 30, 16);
      }
    });

    ctx.restore();
  }, [walls, items, plottedObjects, selectedId, drawing, startPoint, currentPoint, zoom, pan, gridSize]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("floorplan-json");
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log(parsed);
        if (Array.isArray(parsed)) {
          loadJSONData(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load floorplan from localStorage", e);
    }
  }, []);

  useEffect(() => {
    const combinedData = [...walls, ...items, ...plottedObjects];
    localStorage.setItem("floorplan-json", JSON.stringify(combinedData));
  }, [walls, items, plottedObjects]);


  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-md p-4 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => { setMode('select'); setShowFurniturePanel(false); }}
          className={`p-2 rounded ${mode === 'select' ? 'bg-blue-500 text-white' : 'bg-black'}`}
          title="Select & Drag Objects"
        >
          <MousePointer size={20} />
        </button>
        <button
          onClick={() => { setMode('wall'); setShowFurniturePanel(false); }}
          className={`p-2 rounded ${mode === 'wall' ? 'bg-blue-500 text-white' : 'bg-black'}`}
          title="Draw Wall"
        >
          <Square size={20} />
        </button>
        <button
          onClick={() => { setMode('door'); setShowFurniturePanel(false); }}
          className={`p-2 rounded ${mode === 'door' ? 'bg-blue-500 text-white' : 'bg-black'}`}
          title="Add Door"
        >
          <DoorOpen size={20} />
        </button>
        <button
          onClick={() => { setMode('window'); setShowFurniturePanel(false); }}
          className={`p-2 rounded ${mode === 'window' ? 'bg-blue-500 text-white' : 'bg-black'}`}
          title="Add Window"
        >
          <Maximize2 size={20} />
        </button>

        <button
          onClick={() => { setMode('furniture'); setShowFurniturePanel(!showFurniturePanel); }}
          className={`p-2 rounded ${mode === 'furniture' ? 'bg-blue-500 text-white' : 'bg-black'}`}
          title="Add Furniture"
        >
          <Sofa size={20} />
        </button>
        
        <div className="border-l border-gray-300 h-8 mx-2"></div>
        
        <button
          onClick={deleteSelected}
          disabled={!selectedId}
          className={`p-2 rounded ${selectedId ? 'bg-red-500 text-white' : 'bg-black text-gray-400'}`}
          title="Delete Selected"
        >
          <Trash2 size={20} />
        </button>
        <button
          onClick={clearAll}
          className="p-2 rounded bg-black"
          title="Clear All"
        >
          Clear All
        </button>

        <button
          onClick={() => setIs3DOpen(true)}
          className="p-2 rounded bg-indigo-500 text-white hover:bg-indigo-600 flex items-center gap-2"
          title="Open 3D Preview"
        >
          3D Preview
        </button>

        <div className="border-l border-gray-300 h-8 mx-2"></div>

        <input
          ref={jsonFileInputRef}
          type="file"
          accept=".json"
          onChange={handleJSONUpload}
          className="hidden"
        />
        <button
          onClick={() => jsonFileInputRef.current?.click()}
          className="p-2 rounded bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-2"
          title="Load JSON Objects"
        >
          <Download size={20} />
          Load JSON
        </button>

        <button
          onClick={exportToJSON}
          className="p-2 rounded bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
          title="Export Current Floor Plan as JSON"
        >
          <Download size={20} />
          Export JSON
        </button>

        <button
          onClick={exportAsImage}
          className="p-2 rounded bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-2"
          title="Export Floor Plan as Image"
        >
          <Image size={20} />
          Export Image
        </button>
        
        <div className="border-l border-gray-300 h-8 mx-2"></div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-black">Zoom:</span>
          <button onClick={() => setZoom(Math.max(0.8, zoom - 0.1))} className="px-2 py-1 bg-black rounded">-</button>
          <span className="text-sm text-black w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="px-2 py-1 bg-black rounded">+</button>
        </div>
      </div>

      {showFurniturePanel && (
        <div className="bg-white border-b border-gray-300 p-4 overflow-x-auto flex gap-3 animate-in slide-in-from-top-2 duration-300">
          {FURNITURE_CATALOG.map((furniture) => (
            <button
              key={furniture.id}
              onClick={() => setSelectedFurniture(furniture)}
              className={`px-4 py-3 rounded border-2 transition-all duration-200 transform hover:scale-105 ${
                selectedFurniture?.id === furniture.id
                  ? 'border-blue-500 bg-blue-50 scale-105'
                  : 'border-gray-300 bg-white hover:border-blue-300'
              }`}
            >
              <div className="text-3xl">{furniture.icon}</div>
              <div className="text-xs font-semibold text-gray-700">{furniture.name}</div>
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 relative overflow-auto bg-white">
        <canvas
          ref={canvasRef}
          width={2000}
          height={1200}
          className="cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <Preview3DModal
        isOpen={is3DOpen}
        onClose={() => setIs3DOpen(false)}
        walls={walls}
        items={items}
        plottedObjects={plottedObjects}
      />

      <div className="bg-gray-800 text-white p-2 text-sm">
        {mode === 'wall' && "Click and drag to draw walls"}
        {mode === 'door' && "Click on a wall to add a door"}
        {mode === 'window' && "Click on a wall to add a window"}
        {mode === 'furniture' && selectedFurniture && `Click on canvas to place ${selectedFurniture.name}`}
        {mode === 'select' && "Drag to move objects, drag corners to resize"}
        <span className="ml-4">Walls: {walls.length}</span>
        <span className="ml-4">Items: {items.length}</span>
        <span className="ml-4">Objects: {plottedObjects.length}</span>
      </div>
    </div>
  );
};

export default FloorPlanner;
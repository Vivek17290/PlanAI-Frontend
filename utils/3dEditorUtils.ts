// Utility functions for 3D Editor integration

export interface Object3D {
  name: string;
  position: { x: number; y: number; z: number };
  size: { width?: number; height?: number; depth?: number; radius?: number };
  color?: string;
  id?: string;
  type?: string;
}

/**
 * Redirect to 3D Editor with JSON data
 * @param data - Array of 3D objects to load
 * @param newTab - Whether to open in a new tab (default: false)
 */
export const redirectTo3DEditor = (data: Object3D[], newTab: boolean = false) => {
  const encodedData = encodeURIComponent(JSON.stringify(data));
  const url = `/3dEditor?data=${encodedData}`;
  
  if (newTab) {
    window.open(url, '_blank');
  } else {
    window.location.href = url;
  }
};

/**
 * Redirect to 3D Editor with a URL to fetch JSON data
 * @param url - URL to fetch JSON data from
 * @param newTab - Whether to open in a new tab (default: false)
 */
export const redirectTo3DEditorWithUrl = (url: string, newTab: boolean = false) => {
  const encodedUrl = encodeURIComponent(url);
  const editorUrl = `/3dEditor?url=${encodedUrl}`;
  
  if (newTab) {
    window.open(editorUrl, '_blank');
  } else {
    window.location.href = editorUrl;
  }
};

/**
 * Redirect to 3D Editor with a local file path
 * @param filePath - Path to local JSON file (relative to public folder)
 * @param newTab - Whether to open in a new tab (default: false)
 */
export const redirectTo3DEditorWithFile = (filePath: string, newTab: boolean = false) => {
  const encodedFile = encodeURIComponent(filePath);
  const url = `/3dEditor?file=${encodedFile}`;
  
  if (newTab) {
    window.open(url, '_blank');
  } else {
    window.location.href = url;
  }
};

/**
 * Convert 2D floor plan data to 3D objects
 * @param floorPlanData - 2D floor plan data
 * @returns Array of 3D objects
 */
export const convertFloorPlanTo3D = (floorPlanData: any[]): Object3D[] => {
  return floorPlanData.map((item, index) => ({
    id: item.id || `object_${index}`,
    name: item.name || `Object ${index + 1}`,
    position: {
      x: item.position?.x || item.x || 0,
      y: item.position?.y || item.y || 0,
      z: item.position?.z || item.z || 0,
    },
    size: {
      width: item.size?.width || item.width || 1,
      height: item.size?.height || item.height || 1,
      depth: item.size?.depth || item.depth || 1,
      radius: item.size?.radius || item.radius,
    },
    color: item.color || '#888888',
    type: item.type || detectObjectTypeFromName(item.name || ''),
  }));
};

/**
 * Detect object type from name
 * @param name - Object name
 * @returns Detected object type
 */
export const detectObjectTypeFromName = (name: string): string => {
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

/**
 * Generate sample room data for testing
 * @returns Array of sample 3D objects
 */
export const generateSampleRoom = (): Object3D[] => {
  return [
    // Walls
    { name: "North Wall", type: "wall", position: { x: 0, y: 1.25, z: -5 }, size: { width: 10, height: 2.5, depth: 0.2 }, color: "#E2E8F0" },
    { name: "South Wall", type: "wall", position: { x: 0, y: 1.25, z: 5 }, size: { width: 10, height: 2.5, depth: 0.2 }, color: "#E2E8F0" },
    { name: "East Wall", type: "wall", position: { x: 5, y: 1.25, z: 0 }, size: { width: 0.2, height: 2.5, depth: 10 }, color: "#E2E8F0" },
    { name: "West Wall", type: "wall", position: { x: -5, y: 1.25, z: 0 }, size: { width: 0.2, height: 2.5, depth: 10 }, color: "#E2E8F0" },
    
    // Floor
    { name: "Floor", type: "floor", position: { x: 0, y: 0, z: 0 }, size: { width: 10, height: 0.1, depth: 10 }, color: "#F7FAFC" },
    
    // Furniture
    { name: "Living Room Sofa", type: "sofa", position: { x: 0, y: 0, z: 2 }, size: { width: 2.5, height: 0.8, depth: 1.2 }, color: "#4A5568" },
    { name: "Coffee Table", type: "table", position: { x: 0, y: 0, z: 0 }, size: { width: 1.2, height: 0.4, depth: 0.8 }, color: "#8B4513" },
    { name: "TV", type: "tv", position: { x: 0, y: 0.5, z: -4 }, size: { width: 1.5, height: 1.0, depth: 0.1 }, color: "#000000" },
    { name: "Floor Lamp", type: "lamp", position: { x: 3, y: 0, z: 3 }, size: { radius: 0.2, height: 1.6 }, color: "#D69E2E" },
  ];
};
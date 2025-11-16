"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

interface Object3D {
    name: string;
    position: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    size: { width?: number; height?: number; depth?: number; radius?: number };
    color?: string;
    id?: string;
    type?: string;
}

interface Canvas3DProps {
  objects: Object3D[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onDragObject?: (id: string, position: { x: number; y: number; z: number }) => void;
}

// Enhanced object type detection based on name and properties
const detectObjectType = (obj: Object3D): string => {
  const name = obj.name.toLowerCase();
  
  // Architectural elements
  if (name.includes('wall')) return 'wall';
  if (name.includes('floor')) return 'floor';
  if (name.includes('ceiling')) return 'ceiling';
  if (name.includes('door')) return 'door';
  if (name.includes('window')) return 'window';
  
  // Furniture
  if (name.includes('sofa') || name.includes('couch')) return 'sofa';
  if (name.includes('bed')) return 'bed';
  if (name.includes('table')) return 'table';
  if (name.includes('chair')) return 'chair';
  if (name.includes('desk')) return 'desk';
  if (name.includes('cabinet') || name.includes('wardrobe')) return 'cabinet';
  if (name.includes('shelf') || name.includes('bookshelf')) return 'shelf';
  
  // Electronics
  if (name.includes('tv') || name.includes('television')) return 'tv';
  if (name.includes('ac') || name.includes('air_conditioner')) return 'ac';
  if (name.includes('fan')) return 'fan';
  if (name.includes('lamp') || name.includes('light')) return 'lamp';
  if (name.includes('refrigerator') || name.includes('fridge')) return 'fridge';
  if (name.includes('microwave')) return 'microwave';
  if (name.includes('washing_machine')) return 'washing_machine';
  
  // Kitchen
  if (name.includes('stove') || name.includes('cooktop')) return 'stove';
  if (name.includes('sink')) return 'sink';
  if (name.includes('counter')) return 'counter';
  
  // Bathroom
  if (name.includes('toilet')) return 'toilet';
  if (name.includes('bathtub') || name.includes('bath')) return 'bathtub';
  if (name.includes('shower')) return 'shower';
  
  // Default based on existing type or fallback
  return obj.type || 'cuboid';
};

// Enhanced geometry creation with realistic object representations
const ObjectGeometry: React.FC<{ obj: Object3D; materialProps: any; isSelected: boolean; objectType: string }> = ({ 
  obj, materialProps, isSelected, objectType 
}) => {
  const size = {
    width: obj.size?.width || 1,
    height: obj.size?.height || 1,
    depth: obj.size?.depth || 1,
    radius: obj.size?.radius || 0.5
  };

  const material = (
    <meshStandardMaterial
      {...materialProps}
      emissive={isSelected ? "#4f46e5" : materialProps.emissive || "#000000"}
      emissiveIntensity={isSelected ? 0.3 : materialProps.emissiveIntensity || 0}
      transparent={objectType === 'window'}
      opacity={objectType === 'window' ? 0.3 : 1}
    />
  );

  switch (objectType) {
    case 'wall':
    case 'floor':
    case 'ceiling':
    case 'door':
    case 'window':
      return (
        <mesh>
          <boxGeometry args={[size.width, size.height, size.depth]} />
          {material}
        </mesh>
      );
    
    case 'sofa':
      return (
        <group>
          {/* Main seat */}
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[size.width, size.height * 0.4, size.depth * 0.8]} />
            {material}
          </mesh>
          {/* Backrest */}
          <mesh position={[0, 0.1, -size.depth * 0.3]}>
            <boxGeometry args={[size.width, size.height * 0.6, size.depth * 0.2]} />
            {material}
          </mesh>
          {/* Armrests */}
          <mesh position={[-size.width * 0.4, 0, 0]}>
            <boxGeometry args={[size.width * 0.2, size.height * 0.5, size.depth * 0.6]} />
            {material}
          </mesh>
          <mesh position={[size.width * 0.4, 0, 0]}>
            <boxGeometry args={[size.width * 0.2, size.height * 0.5, size.depth * 0.6]} />
            {material}
          </mesh>
        </group>
      );
    
    case 'bed':
      return (
        <group>
          {/* Mattress */}
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[size.width, size.height * 0.3, size.depth]} />
            {material}
          </mesh>
          {/* Headboard */}
          <mesh position={[0, 0.2, -size.depth * 0.4]}>
            <boxGeometry args={[size.width, size.height * 0.8, size.depth * 0.1]} />
            {material}
          </mesh>
        </group>
      );
    
    case 'table':
      return (
        <group>
          {/* Tabletop */}
          <mesh position={[0, size.height * 0.4, 0]}>
            <boxGeometry args={[size.width, size.height * 0.1, size.depth]} />
            {material}
          </mesh>
          {/* Legs */}
          <mesh position={[-size.width * 0.35, 0, -size.depth * 0.35]}>
            <boxGeometry args={[0.1, size.height * 0.8, 0.1]} />
            {material}
          </mesh>
          <mesh position={[size.width * 0.35, 0, -size.depth * 0.35]}>
            <boxGeometry args={[0.1, size.height * 0.8, 0.1]} />
            {material}
          </mesh>
          <mesh position={[-size.width * 0.35, 0, size.depth * 0.35]}>
            <boxGeometry args={[0.1, size.height * 0.8, 0.1]} />
            {material}
          </mesh>
          <mesh position={[size.width * 0.35, 0, size.depth * 0.35]}>
            <boxGeometry args={[0.1, size.height * 0.8, 0.1]} />
            {material}
          </mesh>
        </group>
      );
    
    case 'chair':
      return (
        <group>
          {/* Seat */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[size.width, size.height * 0.1, size.depth]} />
            {material}
          </mesh>
          {/* Backrest */}
          <mesh position={[0, size.height * 0.3, -size.depth * 0.4]}>
            <boxGeometry args={[size.width, size.height * 0.6, size.depth * 0.1]} />
            {material}
          </mesh>
          {/* Legs */}
          <mesh position={[-size.width * 0.35, -size.height * 0.3, -size.depth * 0.35]}>
            <boxGeometry args={[0.05, size.height * 0.6, 0.05]} />
            {material}
          </mesh>
          <mesh position={[size.width * 0.35, -size.height * 0.3, -size.depth * 0.35]}>
            <boxGeometry args={[0.05, size.height * 0.6, 0.05]} />
            {material}
          </mesh>
          <mesh position={[-size.width * 0.35, -size.height * 0.3, size.depth * 0.35]}>
            <boxGeometry args={[0.05, size.height * 0.6, 0.05]} />
            {material}
          </mesh>
          <mesh position={[size.width * 0.35, -size.height * 0.3, size.depth * 0.35]}>
            <boxGeometry args={[0.05, size.height * 0.6, 0.05]} />
            {material}
          </mesh>
        </group>
      );
    
    case 'tv':
      return (
        <group>
          {/* Screen */}
          <mesh>
            <boxGeometry args={[size.width, size.height, size.depth]} />
            <meshStandardMaterial color="#000000" roughness={0.1} metalness={0.8} />
          </mesh>
          {/* Stand */}
          <mesh position={[0, -size.height * 0.6, 0]}>
            <boxGeometry args={[size.width * 0.3, size.height * 0.2, size.depth * 2]} />
            {material}
          </mesh>
        </group>
      );
    
    case 'lamp':
      return (
        <group>
          {/* Base */}
          <mesh position={[0, -size.height * 0.4, 0]}>
            <cylinderGeometry args={[size.radius * 0.5, size.radius * 0.5, size.height * 0.2, 16]} />
            {material}
          </mesh>
          {/* Pole */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, size.height * 0.6, 8]} />
            {material}
          </mesh>
          {/* Shade */}
          <mesh position={[0, size.height * 0.3, 0]}>
            <cylinderGeometry args={[size.radius, size.radius * 0.7, size.height * 0.2, 16]} />
            <meshStandardMaterial 
              color="#ffffcc" 
              roughness={0.2} 
              metalness={0.1}
              emissive="#ffff88"
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>
      );
    
    case 'sphere':
      return (
        <mesh>
          <sphereGeometry args={[size.radius, 32, 32]} />
          {material}
        </mesh>
      );
    
    case 'cylinder':
      return (
        <mesh>
          <cylinderGeometry args={[size.radius, size.radius, size.height, 32]} />
          {material}
        </mesh>
      );
    
    case 'cone':
      return (
        <mesh>
          <coneGeometry args={[size.radius, size.height, 32]} />
          {material}
        </mesh>
      );
    
    default:
      return (
        <mesh>
          <boxGeometry args={[size.width, size.height, size.depth]} />
          {material}
        </mesh>
      );
  }
};

// Enhanced material selection based on object type
const getMaterialProps = (obj: Object3D) => {
  const type = detectObjectType(obj);
  const baseColor = obj.color || '#888888';
  
  switch (type) {
    case 'wall':
      return {
        color: baseColor,
        roughness: 0.8,
        metalness: 0.1,
      };
    case 'floor':
      return {
        color: baseColor,
        roughness: 0.6,
        metalness: 0.0,
      };
    case 'sofa':
      return {
        color: baseColor,
        roughness: 0.9,
        metalness: 0.0,
      };
    case 'table':
      return {
        color: baseColor,
        roughness: 0.3,
        metalness: 0.1,
      };
    case 'tv':
      return {
        color: baseColor,
        roughness: 0.1,
        metalness: 0.8,
      };
    case 'lamp':
      return {
        color: baseColor,
        roughness: 0.2,
        metalness: 0.7,
        emissive: '#ffff88',
        emissiveIntensity: 0.1,
      };
    default:
      return {
        color: baseColor,
        roughness: 0.6,
        metalness: 0.2,
      };
  }
};

// Enhanced 3D Object Component with realistic representations
const RealisticObject3D: React.FC<{
  obj: Object3D;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragEnd?: (id: string, position: { x: number; y: number; z: number }) => void;
  orbitControlsRef?: React.MutableRefObject<any>;
}> = ({ obj, isSelected, onSelect, onDragEnd, orbitControlsRef }) => {
  const meshRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const dragPlane = useRef(new THREE.Plane());
  const dragPoint = useRef(new THREE.Vector3());
  const startPos = useRef(new THREE.Vector3());

  const objectType = detectObjectType(obj);
  const materialProps = getMaterialProps(obj);
  const height = obj.size?.height || 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSelected || !meshRef.current) return;
      
      const moveDistance = 0.5;
      
      switch (e.key.toLowerCase()) {
        case "w":
          e.preventDefault();
          meshRef.current.position.y += moveDistance;
          break;
        case "s":
          e.preventDefault();
          meshRef.current.position.y -= moveDistance;
          break;
        case "d":
          e.preventDefault();
          meshRef.current.position.x += moveDistance;
          break;
        case "a":
          e.preventDefault();
          meshRef.current.position.x -= moveDistance;
          break;
        case "e":
          e.preventDefault();
          meshRef.current.position.z += moveDistance;
          break;
        case "q":
          e.preventDefault();
          meshRef.current.position.z -= moveDistance;
          break;
      }
      
      if (onDragEnd && meshRef.current) {
        const pos = meshRef.current.position;
        onDragEnd(obj.id || "", {
          x: pos.x,
          y: pos.y - height / 2,
          z: pos.z,
        });
      }
    };

    if (isSelected) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isSelected, onDragEnd, obj.id, height]);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    
    onSelect(obj.id || "");
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
    
    // Disable orbit controls when dragging objects
    if (orbitControlsRef?.current) {
      orbitControlsRef.current.enabled = false;
    }
    
    if (meshRef.current) {
      startPos.current.copy(meshRef.current.position);
      
      const cameraDir = new THREE.Vector3();
      camera.getWorldDirection(cameraDir);
      dragPlane.current.setFromNormalAndCoplanarPoint(
        cameraDir,
        meshRef.current.position
      );
    }
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging || !meshRef.current) return;
    
    e.stopPropagation();
    
    // Get the canvas element to calculate proper mouse coordinates
    const canvas = e.target.closest('canvas');
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    
    // Create a horizontal plane at the object's Y position for dragging
    const horizontalPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -meshRef.current.position.y);
    const intersectionPoint = new THREE.Vector3();
    
    if (raycaster.current.ray.intersectPlane(horizontalPlane, intersectionPoint)) {
      meshRef.current.position.x = intersectionPoint.x;
      meshRef.current.position.z = intersectionPoint.z;
    }
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    setIsDragging(false);
    document.body.style.cursor = hovered ? 'pointer' : 'default';
    
    if (orbitControlsRef?.current) {
      orbitControlsRef.current.enabled = true;
    }
    
    if (onDragEnd && meshRef.current) {
      const pos = meshRef.current.position;
      onDragEnd(obj.id || "", {
        x: pos.x,
        y: pos.y - height / 2,
        z: pos.z,
      });
    }
  };

  // Calculate position - floors should be at ground level
  const yPosition = objectType === 'floor' ? obj.position.y : obj.position.y + height / 2;
  
  // Get rotation values (default to 0 if not specified)
  const rotation = obj.rotation || { x: 0, y: 0, z: 0 };

  return (
    <group
      ref={meshRef}
      position={[obj.position.x, yPosition, obj.position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={(e) => {
        e.stopPropagation();
        handlePointerUp(e);
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
      scale={hovered && !isDragging ? [1.02, 1.02, 1.02] : [1, 1, 1]}
    >
      {/* Render the realistic geometry */}
      <ObjectGeometry 
        obj={obj}
        materialProps={materialProps}
        isSelected={isSelected}
        objectType={objectType}
      />
      
      {/* Object label for better identification */}
      {(isSelected || hovered) && (
        <Text
          position={[0, height + 0.5, 0]}
          fontSize={0.3}
          color={isSelected ? "#4f46e5" : "#ffffff"}
          anchorX="center"
          anchorY="middle"
        >
          {obj.name}
        </Text>
      )}
      
      {/* Selection outline */}
      {isSelected && (
        <ObjectGeometry 
          obj={obj}
          materialProps={{
            color: "#4f46e5",
            wireframe: true,
            transparent: true,
            opacity: 0.5
          }}
          isSelected={false}
          objectType={objectType}
        />
      )}
    </group>
  );
};

// Calculate scene bounds and optimal camera position
const calculateSceneBounds = (objects: Object3D[]) => {
  if (objects.length === 0) return { center: [0, 0, 0], size: 50 };
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  objects.forEach(obj => {
    const width = obj.size?.width || 1;
    const height = obj.size?.height || 1;
    const depth = obj.size?.depth || 1;
    
    minX = Math.min(minX, obj.position.x - width / 2);
    maxX = Math.max(maxX, obj.position.x + width / 2);
    minY = Math.min(minY, obj.position.y - height / 2);
    maxY = Math.max(maxY, obj.position.y + height / 2);
    minZ = Math.min(minZ, obj.position.z - depth / 2);
    maxZ = Math.max(maxZ, obj.position.z + depth / 2);
  });
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;
  
  const sizeX = maxX - minX;
  const sizeY = maxY - minY;
  const sizeZ = maxZ - minZ;
  const maxSize = Math.max(sizeX, sizeY, sizeZ);
  
  return {
    center: [centerX, centerY, centerZ],
    size: Math.max(maxSize, 20), // Minimum size for small scenes
    bounds: { minX, maxX, minY, maxY, minZ, maxZ }
  };
};

export const Canvas3D: React.FC<Canvas3DProps> = ({ objects, selectedId, onSelect, onDragObject }) => {
  const orbitControlsRef = useRef<any>(null);
  
  // Calculate optimal camera position based on scene size
  const sceneBounds = calculateSceneBounds(objects);
  const optimalDistance = sceneBounds.size * 1.5; // 1.5x the scene size for good overview
  const cameraPosition: [number, number, number] = [
    sceneBounds.center[0] + optimalDistance * 0.7,
    sceneBounds.center[1] + optimalDistance * 0.7,
    sceneBounds.center[2] + optimalDistance * 0.7
  ];

  return (
    <div className="w-full h-full relative" style={{ cursor: 'default' }}>
      {/* Camera Controls */}
      <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
        <div className="text-xs mb-2 font-semibold">Camera Controls</div>
        <div className="space-y-2">
          <button
            onClick={() => {
              if (orbitControlsRef.current) {
                orbitControlsRef.current.reset();
              }
            }}
            className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
          >
            Reset View
          </button>
          <button
            onClick={() => {
              if (orbitControlsRef.current) {
                orbitControlsRef.current.object.position.set(...cameraPosition);
                orbitControlsRef.current.target.set(...sceneBounds.center);
                orbitControlsRef.current.update();
              }
            }}
            className="w-full px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
          >
            Fit Scene
          </button>
          <div className="text-xs text-gray-300">
            Scene Size: {Math.round(sceneBounds.size)}
          </div>
        </div>
      </div>

      <Canvas 
        camera={{ 
          position: cameraPosition, 
          fov: 60,
          near: 0.1,
          far: sceneBounds.size * 10 // Adjust far plane based on scene size
        }}
        shadows
        gl={{ antialias: true }}
        style={{ cursor: 'grab' }}
        onPointerMissed={() => {
          // Deselect when clicking on empty space
          if (onSelect) onSelect('');
        }}
      >
        {/* Enhanced Lighting Setup */}
        <ambientLight intensity={0.4} color="#ffffff" />
        <directionalLight 
          position={[10, 20, 5]} 
          intensity={1.0}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.3} color="#4f46e5" />
        <pointLight position={[10, 5, 10]} intensity={0.2} color="#f59e0b" />

        {/* Dynamic Grid and Floor based on scene size */}
        <gridHelper args={[sceneBounds.size * 2, Math.max(20, sceneBounds.size / 5), "#444444", "#666666"]} />
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[sceneBounds.center[0], -0.05, sceneBounds.center[2]]}
          receiveShadow
        >
          <planeGeometry args={[sceneBounds.size * 2.5, sceneBounds.size * 2.5]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Render objects */}
        {objects.map((obj) => (
          <RealisticObject3D
            key={obj.id}
            obj={obj}
            isSelected={selectedId === obj.id}
            onSelect={onSelect || (() => {})}
            onDragEnd={onDragObject}
            orbitControlsRef={orbitControlsRef}
          />
        ))}

        <OrbitControls 
          ref={orbitControlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={sceneBounds.size * 0.1}
          maxDistance={sceneBounds.size * 5}
          maxPolarAngle={Math.PI / 2.1}
          target={sceneBounds.center}
        />
      </Canvas>
    </div>
  );
};
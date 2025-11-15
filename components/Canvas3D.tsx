"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface Object3D {
    name: string;
    position: { x: number; y: number; z: number };
    size: { width: number; height: number; depth: number };
    color?: string;
    id?: string;
    type?: string; // must be optional
}


interface Canvas3DProps {
  objects: Object3D[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onDragObject?: (id: string, position: { x: number; y: number; z: number }) => void;
}

const createGeometry = (type: string = "cube", size: { width: number; height: number; depth: number }) => {
  switch (type) {
    case "cube":
      return <boxGeometry args={[size.width, size.height, size.depth]} />;
    case "sphere":
      return <sphereGeometry args={[size.width / 2, 32, 32]} />;
    case "cylinder":
      return <cylinderGeometry args={[size.width / 2, size.width / 2, size.height, 32]} />;
    case "cone":
      return <coneGeometry args={[size.width / 2, size.height, 32]} />;
    case "torus":
      return <torusGeometry args={[size.width / 2, size.width / 4, 16, 100]} />;
    case "capsule":
      return <capsuleGeometry args={[size.width / 2, size.height, 16, 32]} />;
    case "pyramid":
      return <coneGeometry args={[size.width / 2, size.height, 4]} />;
    case "thin-cuboid":
      return <boxGeometry args={[size.width, size.height * 0.3, size.depth]} />;
    case "flat-cylinder":
      return <cylinderGeometry args={[size.width / 2, size.width / 2, size.height * 0.2, 32]} />;
    case "cuboid":
    default:
      return <boxGeometry args={[size.width, size.height, size.depth]} />;
  }
};

const DraggableBox: React.FC<{
  obj: Object3D;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragEnd?: (id: string, position: { x: number; y: number; z: number }) => void;
  orbitControlsRef?: React.MutableRefObject<any>;
}> = ({ obj, isSelected, onSelect, onDragEnd, orbitControlsRef }) => {
  const meshRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const dragPlane = useRef(new THREE.Plane());
  const dragPoint = useRef(new THREE.Vector3());
  const startPos = useRef(new THREE.Vector3());

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
      
      // Update parent state with new position
      if (onDragEnd && meshRef.current) {
        const pos = meshRef.current.position;
        onDragEnd(obj.id || "", {
          x: pos.x,
          y: pos.y - obj.size.height / 2,
          z: pos.z,
        });
      }
    };

    if (isSelected) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isSelected, onDragEnd, obj.id, obj.size.height]);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    
    onSelect(obj.id || "");
    setIsDragging(true);
    
    if (orbitControlsRef?.current) {
      orbitControlsRef.current.enabled = false;
    }
    
    if (meshRef.current) {
      startPos.current.copy(meshRef.current.position);
      
      // Setup drag plane perpendicular to camera
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
    
    mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    raycaster.current.ray.intersectPlane(dragPlane.current, dragPoint.current);

    const offset = dragPoint.current.sub(startPos.current);
    meshRef.current.position.copy(startPos.current.clone().add(offset));
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    setIsDragging(false);
    
    if (orbitControlsRef?.current) {
      orbitControlsRef.current.enabled = true;
    }
    
    if (onDragEnd && meshRef.current) {
      const pos = meshRef.current.position;
      onDragEnd(obj.id || "", {
        x: pos.x,
        y: pos.y - obj.size.height / 2,
        z: pos.z,
      });
    }
  };

  return (
    <group
      ref={meshRef}
      position={[obj.position.x, obj.position.y + obj.size.height / 2, obj.position.z]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerOver={(e) => {
        e.stopPropagation();
        e.object.scale.set(1.02, 1.02, 1.02);
      }}
      onPointerOut={(e) => {
        e.object.scale.set(1, 1, 1);
      }}
    >
      <mesh>
        {createGeometry(obj.type || "cube", obj.size)}
        <meshStandardMaterial
          color={obj.color || "#ff9500"}
          roughness={0.6}
          metalness={0.2}
          emissive={isSelected ? "#ff6600" : "#000000"}
          emissiveIntensity={isSelected ? 0.8 : 0}
        />
      </mesh>
    </group>
  );
};

export const Canvas3D: React.FC<Canvas3DProps> = ({ objects, selectedId, onSelect, onDragObject }) => {
  const orbitControlsRef = useRef<any>(null);

  return (
    <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Grid and Floor */}
      <gridHelper args={[30, 30]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Render objects */}
      {objects.map((obj) => (
        <DraggableBox
          key={obj.id}
          obj={obj}
          isSelected={selectedId === obj.id}
          onSelect={onSelect || (() => {})}
          onDragEnd={onDragObject}
          orbitControlsRef={orbitControlsRef}
        />
      ))}

      <OrbitControls ref={orbitControlsRef} />
    </Canvas>
  );
};

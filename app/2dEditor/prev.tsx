'use client';

import { Canvas} from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';

interface Object3D {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  color: string;
  type: 'wall' | 'furniture' | 'fixture';
}

interface Item {
  id: number;
  type: 'door' | 'window';
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

interface Preview3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  walls: Wall[];
  items: Item[];
  plottedObjects: Object3D[];
}

const WallMesh: React.FC<{ wall: Wall }> = ({ wall }) => {
  const scale = 50;
  const isHorizontal = Math.abs(wall.y2 - wall.y1) < 5;
  
  let x, z, width, depth;
  
  if (isHorizontal) {
    width = Math.abs(wall.x2 - wall.x1) / scale;
    x = (Math.min(wall.x1, wall.x2) + width * scale / 2) / scale;
    z = wall.y1 / scale;
    depth = 0.2;
  } else {
    depth = Math.abs(wall.y2 - wall.y1) / scale;
    x = wall.x1 / scale;
    z = (Math.min(wall.y1, wall.y2) + depth * scale / 2) / scale;
    width = 0.2;
  }
  
  return (
    <mesh position={[x, 1.25, z]} castShadow receiveShadow>
      <boxGeometry args={[width, 2.5, depth]} />
      <meshStandardMaterial 
        color="#e8e8eb" 
        metalness={0.1} 
        roughness={0.7}
      />
    </mesh>
  );
};

const FurnitureMesh: React.FC<{ obj: Object3D }> = ({ obj }) => {
  const scale = 50;
  return (
    <mesh position={[obj.x / scale, 0.5, obj.y / scale]} castShadow receiveShadow>
      <boxGeometry args={[obj.width / scale, 1, obj.depth / scale]} />
      <meshStandardMaterial 
        color={obj.color}
        metalness={0.2}
        roughness={0.6}
      />
    </mesh>
  );
};

const DoorWindowMesh: React.FC<{ item: Item; isDoor: boolean }> = ({ item, isDoor }) => {
  const scale = 50;
  return (
    <mesh position={[item.x / scale, 1, item.y / scale]} castShadow receiveShadow>
      <boxGeometry args={[isDoor ? 0.9 : 1.2, 2.1, 0.1]} />
      <meshStandardMaterial 
        color={isDoor ? '#7c5cfa' : '#06b6d4'}
        metalness={isDoor ? 0.3 : 0.4}
        roughness={isDoor ? 0.4 : 0.3}
        transparent={!isDoor}
        opacity={isDoor ? 1 : 0.7}
      />
    </mesh>
  );
};

const FloorPlane: React.FC<{ size: number }> = ({ size }) => {
  return (
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial 
        color="#f5f5f5" 
        metalness={0.05}
        roughness={0.8}
      />
    </mesh>
  );
};

const LightingSetup: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight 
        position={[15, 20, 15]} 
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      <pointLight position={[-10, 8, -10]} intensity={0.4} color="#fff" />
      <pointLight position={[10, 8, 10]} intensity={0.3} color="#e0e0e0" />
    </>
  );
};

const SceneContent: React.FC<Preview3DModalProps> = ({ walls, items, plottedObjects }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[18, 16, 18]} fov={60} />
      <OrbitControls 
        autoRotate={false}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={100}
        panSpeed={1}
        rotateSpeed={0.5}
        zoomSpeed={1}
        makeDefault
      />
      
      <LightingSetup />
      
      {/* Modern grid */}
      <Grid 
        args={[120, 120]} 
        cellSize={1} 
        cellColor="#e5e7eb" 
        sectionSize={10} 
        sectionColor="#bfdbfe" 
        fadeDistance={120}
        fadeStrength={0.5}
      />
      
      {/* Floor reference */}
      <FloorPlane size={120} />

      {/* Walls */}
      {walls.map((wall) => (
        <WallMesh key={wall.id} wall={wall} />
      ))}

      {/* Furniture */}
      {plottedObjects.map((obj) => (
        <FurnitureMesh key={obj.id} obj={obj} />
      ))}

      {/* Doors and Windows */}
      {items.map((item) => (
        <DoorWindowMesh key={item.id} item={item} isDoor={item.type === 'door'} />
      ))}
    </>
  );
};

export const Preview3DModal: React.FC<Preview3DModalProps> = ({ 
  isOpen, 
  onClose, 
  walls, 
  items, 
  plottedObjects 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-11/12 h-5/6 max-w-6xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">3D Visualization</h2>
            <p className="text-sm text-gray-500 mt-1">Interactive room preview with 360° view</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg p-2 transition-colors"
            aria-label="Close preview"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          <Canvas 
            style={{ width: '100%', height: '100%' }}
            shadows
            gl={{ antialias: true, alpha: true }}
          >
            <SceneContent walls={walls} items={items} plottedObjects={plottedObjects} />
          </Canvas>
        </div>

        {/* Controls Guide */}
        <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">↔️ Pan:</span>
              <span>Right click + drag</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">🔍 Zoom:</span>
              <span>Scroll wheel</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">🔄 Rotate:</span>
              <span>Left click + drag</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

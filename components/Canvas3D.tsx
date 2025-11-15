"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

interface Object3D {
  name: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  color?: string;
}

interface Canvas3DProps {
  objects: Object3D[];
}

export const Canvas3D: React.FC<Canvas3DProps> = ({ objects }) => {
  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Grid and Floor */}
      <gridHelper args={[20, 20]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="lightgrey" />
      </mesh>

      {/* Render objects */}
      {objects.map((obj, index) => (
        <mesh
          key={index}
          position={[obj.position.x, obj.position.y + obj.size.height / 2, obj.position.z]}
        >
          <boxGeometry args={[obj.size.width, obj.size.height, obj.size.depth]} />
          <meshStandardMaterial
            color={obj.color || "orange"} // Use color from JSON if exists
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
      ))}

      {/* Orbit controls for camera */}
      <OrbitControls />
    </Canvas>
  );
};











// "use client";

// import React, { useEffect, useState } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls } from "@react-three/drei";

// interface Object3D {
//   name: string;
//   position: { x: number; y: number; z: number };
//   size: { width: number; height: number; depth: number };
// }

// interface Canvas3DProps {
//   objects: Object3D[];
// }

// export const Canvas3D: React.FC<Canvas3DProps> = ({ objects }) => {
//   return (
//     <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
//       {/* Lights */}
//       <ambientLight intensity={0.5} />
//       <directionalLight position={[10, 10, 5]} intensity={1} />
      
//       {/* Grid and Floor */}
//       <gridHelper args={[20, 20]} />
//       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
//         <planeGeometry args={[20, 20]} />
//         <meshStandardMaterial color="lightgrey" />
//       </mesh>

//       {/* Render objects */}
//       {objects.map((obj, index) => (
//         <mesh
//           key={index}
//           position={[obj.position.x, obj.position.y + obj.size.height / 2, obj.position.z]}
//         >
//           <boxGeometry
//             args={[obj.size.width, obj.size.height, obj.size.depth]}
//           />
//           <meshStandardMaterial color="orange" />
//         </mesh>
//       ))}

//       {/* Orbit controls for camera */}
//       <OrbitControls />
//     </Canvas>
//   );
// };

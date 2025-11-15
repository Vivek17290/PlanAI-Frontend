"use client";

import React, { useState } from "react";
import { Canvas3D } from "@/components/Canvas3D";

interface Object3D {
  name: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  color?: string; // Added color property
}

export default function Home() {
  const [objects, setObjects] = useState<Object3D[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setObjects(json);
      } catch (err) {
        console.error("Invalid JSON file", err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <div style={{ position: "absolute", zIndex: 10, padding: "10px" }}>
        <input type="file" accept=".json" onChange={handleFileUpload} />
      </div>
      {objects.length > 0 && <Canvas3D objects={objects} />}
    </div>
  );
}







// "use client";

// import React, { useState } from "react";
// import { Canvas3D } from "@/components/Canvas3D";

// interface Object3D {
//   name: string;
//   position: { x: number; y: number; z: number };
//   size: { width: number; height: number; depth: number };
// }

// export default function Home() {
//   const [objects, setObjects] = useState<Object3D[]>([]);

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       try {
//         const json = JSON.parse(e.target?.result as string);
//         setObjects(json);
//       } catch (err) {
//         console.error("Invalid JSON file", err);
//       }
//     };
//     reader.readAsText(file);
//   };

//   return (
//     <div style={{ height: "100vh", width: "100vw" }}>
//       <div style={{ position: "absolute", zIndex: 10, padding: "10px" }}>
//         <input type="file" accept=".json" onChange={handleFileUpload} />
//       </div>
//       {objects.length > 0 && <Canvas3D objects={objects} />}
//     </div>
//   );
// }

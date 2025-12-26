"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import { core } from "@/constants/theme";

interface Tesseract3DProps {
  rotation: [number, number, number];
  onRotationChange: (rotation: [number, number, number]) => void;
  categories: Category[];
  activeCategoryIndex: number;
}

import type { Quote } from "@/app/(portfolio)/quotes/config";

export interface Category {
  id: string;
  name: string;
  color: string;
  position: [number, number, number];
  quotes: Quote[];
}

/**
 * Tesseract (4D Hypercube) wireframe visualization
 * Projects a 4D hypercube into 3D space with planetary nodes
 */
export function Tesseract3D({
  rotation,
  onRotationChange,
  categories,
  activeCategoryIndex,
}: Tesseract3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);

  // Tesseract vertices (16 vertices of a 4D hypercube projected to 3D)
  const vertices = useMemo(() => {
    const scale = 2;
    return [
      [-1, -1, -1, -1].map((v) => v * scale),
      [1, -1, -1, -1].map((v) => v * scale),
      [-1, 1, -1, -1].map((v) => v * scale),
      [1, 1, -1, -1].map((v) => v * scale),
      [-1, -1, 1, -1].map((v) => v * scale),
      [1, -1, 1, -1].map((v) => v * scale),
      [-1, 1, 1, -1].map((v) => v * scale),
      [1, 1, 1, -1].map((v) => v * scale),
      [-1, -1, -1, 1].map((v) => v * scale),
      [1, -1, -1, 1].map((v) => v * scale),
      [-1, 1, -1, 1].map((v) => v * scale),
      [1, 1, -1, 1].map((v) => v * scale),
      [-1, -1, 1, 1].map((v) => v * scale),
      [1, -1, 1, 1].map((v) => v * scale),
      [-1, 1, 1, 1].map((v) => v * scale),
      [1, 1, 1, 1].map((v) => v * scale),
    ];
  }, []);

  // Project 4D to 3D (simple projection, can be enhanced with rotation)
  const projectTo3D = (vertex: number[], _wRotation: number = 0) => {
    const [x, y, z, w] = vertex;
    // Simple perspective projection
    const distance = 5;
    const factor = distance / (distance - w * 0.3);
    return [x * factor, y * factor, z * factor] as [number, number, number];
  };

  // Edges of the tesseract (simplified - showing key edges)
  const edges = useMemo(() => {
    const edgeList: number[][] = [];
    // Connect vertices that differ by one coordinate
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        let diff = 0;
        for (let k = 0; k < 4; k++) {
          if (vertices[i][k] !== vertices[j][k]) diff++;
        }
        if (diff === 1) {
          edgeList.push([i, j]);
        }
      }
    }
    return edgeList;
  }, [vertices]);

  // Update rotation from external changes
  useFrame(() => {
    if (groupRef.current && controlsRef.current) {
      // Smoothly interpolate to target rotation
      const targetRotation = rotation;
      const currentRotation = groupRef.current.rotation;

      currentRotation.x = THREE.MathUtils.lerp(
        currentRotation.x,
        targetRotation[0],
        0.1
      );
      currentRotation.y = THREE.MathUtils.lerp(
        currentRotation.y,
        targetRotation[1],
        0.1
      );
      currentRotation.z = THREE.MathUtils.lerp(
        currentRotation.z,
        targetRotation[2],
        0.1
      );
    }
  });

  // Handle rotation changes from controls
  const handleChange = () => {
    if (groupRef.current) {
      const rot = groupRef.current.rotation;
      onRotationChange([rot.x, rot.y, rot.z]);
    }
  };

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        autoRotate={false}
        onChange={handleChange}
        minDistance={8}
        maxDistance={15}
      />
      <group ref={groupRef} rotation={rotation}>
        {/* Wireframe edges */}
        {edges.map((edge, idx) => {
          const start = projectTo3D(vertices[edge[0]]);
          const end = projectTo3D(vertices[edge[1]]);
          return (
            <Line
              key={idx}
              points={[start, end]}
              color={core.border.muted}
              lineWidth={1}
            />
          );
        })}

        {/* Planetary nodes at tesseract vertices */}
        {categories.map((category, idx) => {
          const vertex = vertices[idx % vertices.length];
          const pos3D = projectTo3D(vertex);
          const isActive = idx === activeCategoryIndex;

          return (
            <PlanetaryNode
              key={category.id}
              position={pos3D}
              color={category.color}
              isActive={isActive}
            />
          );
        })}
      </group>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </>
  );
}

/**
 * Planetary Node - Shader-based sphere representing a category
 */
function PlanetaryNode({
  position,
  color,
  isActive,
}: {
  position: [number, number, number];
  color: string;
  isActive: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;

      // Active node pulses
      if (isActive) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.scale.setScalar(scale);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  // Convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255,
        ]
      : [1, 1, 1];
  };

  const rgb = hexToRgb(color);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial
        color={rgb}
        emissive={rgb}
        emissiveIntensity={isActive ? 0.8 : 0.4}
        metalness={0.7}
        roughness={0.3}
      />
      {isActive && (
        <mesh>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </mesh>
  );
}

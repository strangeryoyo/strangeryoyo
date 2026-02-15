
import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { COLORS } from '../constants';

export const RhinoModel: React.FC<{ speed: number }> = ({ speed }) => {
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (headRef.current) {
      // Subtle head bobbing based on speed
      headRef.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 10 * (speed / 10 + 1)) * 0.05;
    }
  });

  return (
    <group scale={0.8} position={[0, 0.4, 0]}>
      {/* Kart Base */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[1.5, 0.4, 2]} />
        <meshStandardMaterial color={COLORS.KART_BODY} />
      </mesh>

      {/* Rhino Body */}
      <mesh ref={bodyRef} position={[0, 0.4, 0]}>
        <boxGeometry args={[1.2, 1, 1.6]} />
        <meshStandardMaterial color={COLORS.RHINO_PRIMARY} roughness={0.9} />
      </mesh>

      {/* Rhino Head */}
      <group ref={headRef} position={[0, 0.8, 0.8]}>
        <mesh>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color={COLORS.RHINO_SECONDARY} />
        </mesh>
        {/* Large Horn */}
        <mesh position={[0, 0.2, 0.4]} rotation={[Math.PI / 4, 0, 0]}>
          <coneGeometry args={[0.15, 0.6, 8]} />
          <meshStandardMaterial color="#eeeeee" />
        </mesh>
        {/* Small Horn */}
        <mesh position={[0, 0.0, 0.6]} rotation={[Math.PI / 4, 0, 0]}>
          <coneGeometry args={[0.08, 0.3, 8]} />
          <meshStandardMaterial color="#dddddd" />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.25, 0.2, 0.4]}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color="white" emissive="#ff0000" emissiveIntensity={2} />
        </mesh>
        <mesh position={[-0.25, 0.2, 0.4]}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color="white" emissive="#ff0000" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* Wheels */}
      {[[-0.8, -0.4, 0.7], [0.8, -0.4, 0.7], [-0.8, -0.4, -0.7], [0.8, -0.4, -0.7]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </group>
  );
};

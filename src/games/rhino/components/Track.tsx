
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TRACK_PATH, COLORS, GAME_CONFIG } from '../constants';

export const Track: React.FC = () => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const points = TRACK_PATH.map(p => new THREE.Vector2(p[0], p[2]));
    s.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      s.lineTo(points[i].x, points[i].y);
    }
    s.lineTo(points[0].x, points[0].y);
    return s;
  }, []);

  const extrudeSettings = {
    steps: 1,
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 6, // Base road width
    bevelOffset: 0,
    bevelSegments: 1
  };

  const environment = useMemo(() => {
    const elements = [];
    const points = TRACK_PATH;
    const roadLimit = GAME_CONFIG.ROAD_LIMIT;

    for (let i = 0; i < points.length; i++) {
      const curr = points[i];
      const next = points[(i + 1) % points.length];
      
      const segmentVec = new THREE.Vector3(next[0] - curr[0], 0, next[2] - curr[2]);
      const segmentLen = segmentVec.length();
      const dir = segmentVec.clone().normalize();
      const perp = new THREE.Vector3(-dir.z, 0, dir.x);

      // Fence and Tree generation
      const steps = Math.ceil(segmentLen / 6);
      for (let j = 0; j < steps; j++) {
        const t = j / steps;
        const pos = new THREE.Vector3(
          curr[0] + (next[0] - curr[0]) * t,
          0,
          curr[2] + (next[2] - curr[2]) * t
        );

        // --- Fences ---
        [1, -1].forEach(side => {
          const fencePos = pos.clone().add(perp.clone().multiplyScalar(roadLimit * side));
          elements.push(
            <group key={`fence-${i}-${j}-${side}`} position={[fencePos.x, 0.5, fencePos.z]} rotation={[0, Math.atan2(dir.x, dir.z), 0]}>
              {/* Post */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.3, 1.5, 0.3]} />
                <meshStandardMaterial color="#444" />
              </mesh>
              {/* Rails */}
              <mesh position={[0, 0.4, 3]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.1, 0.2, 6]} />
                <meshStandardMaterial color={COLORS.FENCE} emissive={COLORS.FENCE} emissiveIntensity={0.5} />
              </mesh>
              <mesh position={[0, -0.2, 3]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.1, 0.2, 6]} />
                <meshStandardMaterial color={COLORS.FENCE} />
              </mesh>
            </group>
          );
        });

        // --- Trees (Further away) ---
        if (j % 3 === 0) {
          [1, -1].forEach(side => {
            const treePos = pos.clone().add(perp.clone().multiplyScalar((roadLimit + 10 + Math.random() * 5) * side));
            elements.push(
              <group key={`tree-${i}-${j}-${side}`} position={[treePos.x, 2, treePos.z]}>
                <mesh>
                  <cylinderGeometry args={[0, 1.5 + Math.random(), 4 + Math.random() * 2, 8]} />
                  <meshStandardMaterial color={side > 0 ? "#065f46" : "#064e3b"} />
                </mesh>
                <mesh position={[0, -2, 0]}>
                  <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
                  <meshStandardMaterial color="#3f2b1d" />
                </mesh>
              </group>
            );
          });
        }
      }
    }
    return elements;
  }, []);

  return (
    <group>
      {/* Ground Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color={COLORS.TRACK_GRASS} />
      </mesh>

      {/* The Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial color={COLORS.TRACK_ROAD} />
      </mesh>

      {/* Start / Finish Line Visualization */}
      <group position={[0, 0.05, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[12, 3]} />
            <meshStandardMaterial color="white" />
        </mesh>
        <gridHelper args={[12, 4, 0x000000, 0x000000]} rotation={[0, 0, 0]} position={[0, 0.01, 0]} />
        
        <group position={[0, 0, 0]}>
            <mesh position={[-7, 4, 0]}>
                <boxGeometry args={[1, 8, 1]} />
                <meshStandardMaterial color={COLORS.KART_BODY} />
            </mesh>
            <mesh position={[7, 4, 0]}>
                <boxGeometry args={[1, 8, 1]} />
                <meshStandardMaterial color={COLORS.KART_BODY} />
            </mesh>
            <mesh position={[0, 8, 0]}>
                <boxGeometry args={[15, 1, 1]} />
                <meshStandardMaterial color={COLORS.KART_BODY} />
            </mesh>
            <mesh position={[0, 8.1, 0.6]}>
                <planeGeometry args={[8, 2]} />
                <meshStandardMaterial color="#000" />
            </mesh>
        </group>
      </group>

      {environment}
    </group>
  );
};

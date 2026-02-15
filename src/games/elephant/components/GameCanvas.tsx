import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Cloud, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Bird, Projectile, Predator } from '../types';
import { soundService } from '../services/soundService';

// --- Constants ---
const MAP_SIZE = 40;
const WATER_START_Z = 5;
const GRAVITY = 12; // Reduced slightly for better arc
const PROJECTILE_SPEED = 30; // Increased for better reach
const ELEPHANT_SPEED = 10;
const BIRD_SPAWN_RATE = 1200; // ms
const REFILL_RATE = 25; // Water per second
const LION_SPEED = 5;
const CROC_SPEED = 3.5;
const LION_SPAWN_BASE = 6000; // ms base rate - gets faster with score
const CROC_SPAWN_BASE = 8000; // ms base rate
const LION_MIN_SCORE = 3; // No lions until this score
const CROC_MIN_SCORE = 6; // No crocs until this score
const PREDATOR_HIT_RADIUS = 2.2; // How close before elephant is eaten
const PREDATOR_PROJECTILE_HIT = 1.5; // Hit by water projectile
const JUMP_VELOCITY = 12;
const JUMP_GRAVITY = 28;
const STOMP_RADIUS = 3.5;

// --- Sub-components ---

// Flowing water particle
const WaterParticle: React.FC<{ startX: number, startZ: number, speed: number, size: number }> = ({ startX, startZ, speed, size }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Flow from right to left
      const time = state.clock.elapsedTime * speed;
      meshRef.current.position.x = ((startX - time * 8) % 90) + 45;
      meshRef.current.position.z = startZ + Math.sin(time * 2) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[startX, -0.02, startZ]}>
      <circleGeometry args={[size, 8]} />
      <meshStandardMaterial color="#93c5fd" transparent opacity={0.6} />
    </mesh>
  );
};

// Animated water component with flowing effect
const AnimatedWater: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate random particles for the river flow
  const particles = useMemo(() => {
    const p = [];
    for (let i = 0; i < 30; i++) {
      p.push({
        startX: (Math.random() - 0.5) * 80,
        startZ: 9 + Math.random() * 16,
        speed: 0.3 + Math.random() * 0.4,
        size: 0.2 + Math.random() * 0.25
      });
    }
    return p;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.08 + Math.sin(state.clock.elapsedTime * 0.8) * 0.02;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 18]} receiveShadow>
        <planeGeometry args={[MAP_SIZE * 3, 20]} />
        <meshStandardMaterial
          color="#3b82f6"
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      {/* Flowing particles */}
      {particles.map((p, i) => (
        <WaterParticle key={i} startX={p.startX} startZ={p.startZ} speed={p.speed} size={p.size} />
      ))}
    </group>
  );
};

// Grass patch decoration
const GrassPatch: React.FC<{ position: [number, number, number], scale?: number }> = ({ position, scale = 1 }) => {
  return (
    <group position={position}>
      {[0, 0.4, 0.8, 1.2, 1.6].map((offset, i) => (
        <mesh key={i} position={[Math.sin(i * 2) * 0.3, 0.15 * scale, Math.cos(i * 2) * 0.3]} rotation={[0, offset, 0.1]}>
          <boxGeometry args={[0.05 * scale, 0.3 * scale, 0.02 * scale]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#22c55e' : '#15803d'} />
        </mesh>
      ))}
    </group>
  );
};

// Rock decoration
const Rock: React.FC<{ position: [number, number, number], scale?: number }> = ({ position, scale = 1 }) => {
  return (
    <mesh position={position} castShadow>
      <dodecahedronGeometry args={[0.4 * scale, 0]} />
      <meshStandardMaterial color="#6b7280" roughness={0.9} />
    </mesh>
  );
};

const Ground = () => {
  // Generate random positions for grass patches and rocks
  const decorations = useMemo(() => {
    const patches: { pos: [number, number, number], scale: number }[] = [];
    const rocks: { pos: [number, number, number], scale: number }[] = [];

    // Grass patches on the savannah (keep them on grass area, z < 4)
    for (let i = 0; i < 30; i++) {
      patches.push({
        pos: [
          (Math.random() - 0.5) * 60,
          0,
          -18 + Math.random() * 18
        ],
        scale: 0.8 + Math.random() * 0.6
      });
    }

    // Rocks on the riverbank (z = 4 to 8)
    for (let i = 0; i < 10; i++) {
      rocks.push({
        pos: [
          (Math.random() - 0.5) * 60,
          0.15,
          5 + Math.random() * 2
        ],
        scale: 0.4 + Math.random() * 0.5
      });
    }

    return { patches, rocks };
  }, []);

  return (
    <group>
      {/* Main grass field (z from -30 to +4) - extra wide to fill screen */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -13]} receiveShadow>
        <planeGeometry args={[MAP_SIZE * 3, 40]} />
        <meshStandardMaterial color="#4ade80" roughness={0.85} />
      </mesh>

      {/* Grass variation patches */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, -0.08, -15]} receiveShadow>
        <circleGeometry args={[8, 16]} />
        <meshStandardMaterial color="#22c55e" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, -0.08, -8]} receiveShadow>
        <circleGeometry args={[6, 16]} />
        <meshStandardMaterial color="#86efac" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8, -0.08, -3]} receiveShadow>
        <circleGeometry args={[5, 16]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>

      {/* Sandy riverbank (z from 4 to 8) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 6]} receiveShadow>
        <planeGeometry args={[MAP_SIZE * 3, 4]} />
        <meshStandardMaterial color="#c9a66b" roughness={0.95} />
      </mesh>

      {/* River water - extends to bottom of screen */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 18]} receiveShadow>
        <planeGeometry args={[MAP_SIZE * 3, 20]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>

      {/* Animated water surface */}
      <AnimatedWater />


      {/* Grass patches */}
      {decorations.patches.map((p, i) => (
        <GrassPatch key={`grass-${i}`} position={p.pos} scale={p.scale} />
      ))}

      {/* Rocks */}
      {decorations.rocks.map((r, i) => (
        <Rock key={`rock-${i}`} position={r.pos} scale={r.scale} />
      ))}
    </group>
  );
};

const ElephantModel: React.FC<{ position: [number, number, number], rotation: number, isShooting: boolean }> = ({ position, rotation, isShooting }) => {
  const trunkRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (trunkRef.current) {
      trunkRef.current.rotation.x = isShooting 
        ? -0.6 + Math.sin(state.clock.elapsedTime * 25) * 0.15
        : -0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={position} rotation={[0, rotation, 0]} castShadow>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1.5, 1.4, 2]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, 2, 1.2]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0.8, 2, 1]} rotation={[0, -0.3, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.6]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[-0.8, 2, 1]} rotation={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.6]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <group position={[0, 1.8, 1.7]} ref={trunkRef}>
        <mesh position={[0, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.25, 1.2, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>
      <mesh position={[-0.5, 0.3, -0.8]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.6]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0.5, 0.3, -0.8]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.6]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[-0.5, 0.3, 0.8]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.6]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0.5, 0.3, 0.8]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.6]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
    </group>
  );
};

const BirdModel: React.FC<{ position: [number, number, number], velocity: THREE.Vector3, color: string }> = ({ position, velocity, color }) => {
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);
  const rotationY = velocity.x > 0 ? Math.PI / 2 : -Math.PI / 2;

  // Darker shade for accents
  const darkerColor = color === '#ef4444' ? '#b91c1c' : '#d97706';
  const beakColor = '#f97316';

  useFrame((state) => {
    const wingFlap = Math.sin(state.clock.elapsedTime * 18) * 0.6;
    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = 0.2 + wingFlap;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = -0.2 - wingFlap;
    }
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.35, 12, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.15, 0.4]} castShadow>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Beak */}
      <mesh position={[0, 0.1, 0.65]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.06, 0.2, 6]} />
        <meshStandardMaterial color={beakColor} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.12, 0.22, 0.5]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[-0.12, 0.22, 0.5]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      {/* Left Wing */}
      <mesh ref={leftWingRef} position={[0.3, 0.1, 0]} rotation={[0.1, 0.2, 0.2]} castShadow>
        <boxGeometry args={[0.6, 0.05, 0.35]} />
        <meshStandardMaterial color={darkerColor} />
      </mesh>

      {/* Right Wing */}
      <mesh ref={rightWingRef} position={[-0.3, 0.1, 0]} rotation={[0.1, -0.2, -0.2]} castShadow>
        <boxGeometry args={[0.6, 0.05, 0.35]} />
        <meshStandardMaterial color={darkerColor} />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0.05, -0.45]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.25, 0.04, 0.3]} />
        <meshStandardMaterial color={darkerColor} />
      </mesh>
    </group>
  );
};

const ProjectileMesh: React.FC<{ position: [number, number, number], size: number }> = ({ position, size }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.8} />
    </mesh>
  );
};

const LionModel: React.FC<{ position: [number, number, number], velocity: THREE.Vector3 }> = ({ position, velocity }) => {
  const legRef1 = useRef<THREE.Mesh>(null);
  const legRef2 = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const rotationY = Math.atan2(velocity.x, velocity.z);

  useFrame((state) => {
    const walk = Math.sin(state.clock.elapsedTime * 8) * 0.3;
    if (legRef1.current) legRef1.current.rotation.x = walk;
    if (legRef2.current) legRef2.current.rotation.x = -walk;
    if (tailRef.current) tailRef.current.rotation.x = -0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Body */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.9, 0.7, 1.5]} />
        <meshStandardMaterial color="#d4a04a" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.9, 0.9]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#d4a04a" />
      </mesh>
      {/* Mane */}
      <mesh position={[0, 1.0, 0.75]} castShadow>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 0.75, 1.3]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshStandardMaterial color="#c49340" />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.2, 1.05, 1.15]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[-0.2, 1.05, 1.15]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* Front legs */}
      <mesh ref={legRef1} position={[-0.3, 0.25, 0.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.5]} />
        <meshStandardMaterial color="#c49340" />
      </mesh>
      <mesh ref={legRef1} position={[0.3, 0.25, 0.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.5]} />
        <meshStandardMaterial color="#c49340" />
      </mesh>
      {/* Back legs */}
      <mesh ref={legRef2} position={[-0.3, 0.25, -0.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.5]} />
        <meshStandardMaterial color="#c49340" />
      </mesh>
      <mesh ref={legRef2} position={[0.3, 0.25, -0.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.5]} />
        <meshStandardMaterial color="#c49340" />
      </mesh>
      {/* Tail */}
      <mesh ref={tailRef} position={[0, 0.8, -0.9]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.7]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
    </group>
  );
};

const CrocodileModel: React.FC<{ position: [number, number, number], velocity: THREE.Vector3 }> = ({ position, velocity }) => {
  const tailRef = useRef<THREE.Mesh>(null);
  const rotationY = Math.atan2(velocity.x, velocity.z);

  useFrame((state) => {
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.4;
    }
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Body */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.7, 0.35, 1.8]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
      {/* Bumpy back */}
      {[-0.5, -0.2, 0.1, 0.4].map((z, i) => (
        <mesh key={i} position={[0, 0.48, z]} castShadow>
          <boxGeometry args={[0.5, 0.12, 0.25]} />
          <meshStandardMaterial color="#1e4620" />
        </mesh>
      ))}
      {/* Head / Snout */}
      <mesh position={[0, 0.2, 1.3]} castShadow>
        <boxGeometry args={[0.5, 0.25, 1.0]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
      {/* Upper jaw */}
      <mesh position={[0, 0.25, 1.85]} castShadow>
        <boxGeometry args={[0.35, 0.1, 0.2]} />
        <meshStandardMaterial color="#3a6b34" />
      </mesh>
      {/* Lower jaw */}
      <mesh position={[0, 0.12, 1.85]} castShadow>
        <boxGeometry args={[0.3, 0.08, 0.2]} />
        <meshStandardMaterial color="#c9534a" />
      </mesh>
      {/* Eyes (on top of head) */}
      <mesh position={[0.18, 0.4, 1.15]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#c4cc3a" />
      </mesh>
      <mesh position={[-0.18, 0.4, 1.15]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#c4cc3a" />
      </mesh>
      {/* Eye pupils */}
      <mesh position={[0.18, 0.42, 1.22]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[-0.18, 0.42, 1.22]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* Short legs */}
      <mesh position={[-0.4, 0.08, 0.5]} castShadow>
        <boxGeometry args={[0.15, 0.16, 0.25]} />
        <meshStandardMaterial color="#1e4620" />
      </mesh>
      <mesh position={[0.4, 0.08, 0.5]} castShadow>
        <boxGeometry args={[0.15, 0.16, 0.25]} />
        <meshStandardMaterial color="#1e4620" />
      </mesh>
      <mesh position={[-0.4, 0.08, -0.5]} castShadow>
        <boxGeometry args={[0.15, 0.16, 0.25]} />
        <meshStandardMaterial color="#1e4620" />
      </mesh>
      <mesh position={[0.4, 0.08, -0.5]} castShadow>
        <boxGeometry args={[0.15, 0.16, 0.25]} />
        <meshStandardMaterial color="#1e4620" />
      </mesh>
      {/* Tail */}
      <mesh ref={tailRef} position={[0, 0.2, -1.2]} castShadow>
        <boxGeometry args={[0.35, 0.2, 1.0]} />
        <meshStandardMaterial color="#1e4620" />
      </mesh>
    </group>
  );
};

interface GameLogicProps {
  onScoreUpdate: (newScore: number) => void;
  onWaterUpdate: (newWater: number) => void;
  onGameOver: () => void;
  isPlaying: boolean;
  maxWater: number;
  shootCooldown: number;
  projectileSize: number;
  tripleShot: boolean;
  touchMoveInput?: React.RefObject<{ x: number; z: number }>;
  touchJumpInput?: React.RefObject<boolean>;
}

const GameLogic: React.FC<GameLogicProps> = ({
  onScoreUpdate,
  onWaterUpdate,
  onGameOver,
  isPlaying,
  maxWater,
  shootCooldown,
  projectileSize,
  tripleShot,
  touchMoveInput,
  touchJumpInput
}) => {
  const { camera, raycaster, pointer } = useThree();
  const elephantPos = useRef(new THREE.Vector3(0, 0, 0));
  const elephantRot = useRef(0);
  const birds = useRef<Bird[]>([]);
  const projectiles = useRef<Projectile[]>([]);
  const waterLevel = useRef(maxWater);
  const score = useRef(0);
  const lastShotTime = useRef(0);
  const lastSpawnTime = useRef(0);
  const lastLionSpawn = useRef(0);
  const lastCrocSpawn = useRef(0);
  const predators = useRef<Predator[]>([]);
  const elephantVelY = useRef(0);
  const keys = useRef<{ [key: string]: boolean }>({});
  const isShooting = useRef(false);
  const shootingPointerId = useRef<number | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    const handlePointerDown = (e: PointerEvent) => {
      // Ignore touches in the joystick area (bottom-left corner)
      if (e.clientX < 180 && e.clientY > window.innerHeight - 180) return;
      if (waterLevel.current > 0) {
        isShooting.current = true;
        shootingPointerId.current = e.pointerId;
      }
    };
    const handlePointerUp = (e: PointerEvent) => {
      if (shootingPointerId.current === null || e.pointerId === shootingPointerId.current) {
        isShooting.current = false;
        shootingPointerId.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  // Reset all game refs when a new game starts
  useEffect(() => {
    if (isPlaying) {
      elephantPos.current.set(0, 0, 0);
      elephantRot.current = 0;
      birds.current = [];
      projectiles.current = [];
      predators.current = [];
      waterLevel.current = maxWater;
      score.current = 0;
      lastShotTime.current = 0;
      lastSpawnTime.current = 0;
      lastLionSpawn.current = 0;
      lastCrocSpawn.current = 0;
      isShooting.current = false;
      shootingPointerId.current = null;
      elephantVelY.current = 0;
    }
  }, [isPlaying, maxWater]);

  const getTargetPoint = () => {
    raycaster.setFromCamera(pointer, camera);
    // Intersect at the average height of birds (y=6.5) so player aims "at the sky"
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -6.5);
    const target = new THREE.Vector3();
    const result = raycaster.ray.intersectPlane(plane, target);
    return result ? target : null;
  };

  useFrame((state, delta) => {
    if (!isPlaying) return;
    setTick(t => (t + 1) % 1000);
    const time = state.clock.elapsedTime;

    const moveDir = new THREE.Vector3(0, 0, 0);
    if (keys.current['w'] || keys.current['arrowup']) moveDir.z -= 1;
    if (keys.current['s'] || keys.current['arrowdown']) moveDir.z += 1;
    if (keys.current['a'] || keys.current['arrowleft']) moveDir.x -= 1;
    if (keys.current['d'] || keys.current['arrowright']) moveDir.x += 1;

    // Touch joystick input
    if (touchMoveInput?.current) {
      moveDir.x += touchMoveInput.current.x;
      moveDir.z += touchMoveInput.current.z;
    }

    if (moveDir.length() > 0) {
      moveDir.normalize().multiplyScalar(ELEPHANT_SPEED * delta);
      elephantPos.current.add(moveDir);
      elephantPos.current.x = THREE.MathUtils.clamp(elephantPos.current.x, -22, 22);
      elephantPos.current.z = THREE.MathUtils.clamp(elephantPos.current.z, -18, 22);
    }

    // Jump
    const wantsJump = keys.current[' '] || touchJumpInput?.current;
    if (wantsJump && elephantPos.current.y <= 0) {
      elephantVelY.current = JUMP_VELOCITY;
      elephantPos.current.y = 0.01; // lift off ground
    }

    if (elephantPos.current.y > 0 || elephantVelY.current > 0) {
      elephantVelY.current -= JUMP_GRAVITY * delta;
      elephantPos.current.y += elephantVelY.current * delta;

      // Landing
      if (elephantPos.current.y <= 0) {
        elephantPos.current.y = 0;
        elephantVelY.current = 0;

        // Stomp - kill nearby predators on landing
        for (const pred of predators.current) {
          const dist2D = Math.sqrt(
            (pred.position.x - elephantPos.current.x) ** 2 +
            (pred.position.z - elephantPos.current.z) ** 2
          );
          if (dist2D < STOMP_RADIUS) {
            pred.isHit = true;
            score.current += 1;
            onScoreUpdate(score.current);
            soundService.playHit();
          }
        }
      }
    }

    const targetPoint = getTargetPoint();
    // On mobile with joystick: face movement direction
    const touchActive = touchMoveInput?.current && (Math.abs(touchMoveInput.current.x) > 0.1 || Math.abs(touchMoveInput.current.z) > 0.1);
    if (touchActive) {
      const targetRot = Math.atan2(touchMoveInput!.current.x, touchMoveInput!.current.z);
      let angle = targetRot - elephantRot.current;
      while (angle > Math.PI) angle -= Math.PI * 2;
      while (angle < -Math.PI) angle += Math.PI * 2;
      elephantRot.current += angle * 12 * delta;
    } else if (targetPoint) {
      const aimDir = new THREE.Vector3().subVectors(targetPoint, elephantPos.current);
      const targetRot = Math.atan2(aimDir.x, aimDir.z);
      let angle = targetRot - elephantRot.current;
      while (angle > Math.PI) angle -= Math.PI * 2;
      while (angle < -Math.PI) angle += Math.PI * 2;
      elephantRot.current += angle * 12 * delta;
    }

    const inWater = elephantPos.current.z > WATER_START_Z;
    if (inWater && waterLevel.current < maxWater) {
      const oldW = Math.floor(waterLevel.current);
      waterLevel.current = Math.min(maxWater, waterLevel.current + REFILL_RATE * delta);
      if (oldW !== Math.floor(waterLevel.current)) onWaterUpdate(Math.floor(waterLevel.current));
    }

    // Can't shoot while in water - only refill
    if (isShooting.current && !inWater && waterLevel.current > 0 && time - lastShotTime.current > shootCooldown) {
      // Calculate trunk tip position based on elephant rotation
      // Trunk tip is at local coords (0, 1.8, 2.9) relative to elephant
      const trunkTipLocal = new THREE.Vector3(0, 1.8, 2.9);
      // Rotate by elephant's Y rotation
      trunkTipLocal.applyAxisAngle(new THREE.Vector3(0, 1, 0), elephantRot.current);
      const spawnPos = elephantPos.current.clone().add(trunkTipLocal);

      // Point directly at target point in 3D for perfect aiming, adding a bit of lead
      let shootDir = new THREE.Vector3(0, 0.4, 0); // Default arc
      if (targetPoint) {
        shootDir = new THREE.Vector3().subVectors(targetPoint, spawnPos).normalize();
        // Add a slight vertical boost to compensate for gravity over distance
        const distance = spawnPos.distanceTo(targetPoint);
        shootDir.y += (distance * 0.015);
        shootDir.normalize();
      }

      // Create projectile(s) - triple shot creates 3 projectiles in a spread
      const shotAngles = tripleShot ? [-0.15, 0, 0.15] : [0];
      shotAngles.forEach(angleOffset => {
        const dir = shootDir.clone();
        if (angleOffset !== 0) {
          dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleOffset);
        }
        projectiles.current.push({
          id: Math.random().toString(),
          position: spawnPos.clone(),
          velocity: dir.multiplyScalar(PROJECTILE_SPEED),
          createdAt: time
        });
      });

      soundService.playShoot();

      const oldW = Math.floor(waterLevel.current);
      const waterCost = tripleShot ? 3 : 1.5;
      waterLevel.current = Math.max(0, waterLevel.current - waterCost);
      if (oldW !== Math.floor(waterLevel.current)) onWaterUpdate(Math.floor(waterLevel.current));
      lastShotTime.current = time;
    }

    if (time * 1000 - lastSpawnTime.current > BIRD_SPAWN_RATE) {
      const startX = Math.random() > 0.5 ? -28 : 28;
      const height = 4.5 + Math.random() * 5.5; // Slightly higher
      const targetZ = -12 + Math.random() * 22;
      const velX = startX > 0 ? -6 - Math.random() * 6 : 6 + Math.random() * 6;
      birds.current.push({
        id: Math.random().toString(),
        position: new THREE.Vector3(startX, height, targetZ),
        velocity: new THREE.Vector3(velX, 0, (Math.random() - 0.5) * 3),
        color: Math.random() > 0.5 ? '#ef4444' : '#fbbf24',
        isHit: false
      });
      lastSpawnTime.current = time * 1000;
    }

    projectiles.current.forEach(p => {
      p.velocity.y -= GRAVITY * delta;
      p.position.add(p.velocity.clone().multiplyScalar(delta));
    });
    projectiles.current = projectiles.current.filter(p => p.position.y > -0.5 && p.position.length() < 60);

    birds.current.forEach(b => {
      b.position.add(b.velocity.clone().multiplyScalar(delta));
    });
    birds.current = birds.current.filter(b => Math.abs(b.position.x) < 32 && !b.isHit);

    const hitThreshold = 1.3 + projectileSize; // Bigger projectiles = easier hits
    for (let i = projectiles.current.length - 1; i >= 0; i--) {
      const proj = projectiles.current[i];
      let hit = false;
      for (let j = birds.current.length - 1; j >= 0; j--) {
        const bird = birds.current[j];
        if (bird.position.distanceTo(proj.position) < hitThreshold) {
          bird.isHit = true;
          hit = true;
          score.current += 1;
          onScoreUpdate(score.current);
          soundService.playHit();
          break;
        }
      }
      if (hit) projectiles.current.splice(i, 1);
    }

    // --- Predator spawning (scales with score) ---
    const lionRate = Math.max(2000, LION_SPAWN_BASE - score.current * 200);
    const crocRate = Math.max(3000, CROC_SPAWN_BASE - score.current * 200);

    if (score.current >= LION_MIN_SCORE && time * 1000 - lastLionSpawn.current > lionRate) {
      const startX = Math.random() > 0.5 ? -26 : 26;
      const startZ = -15 + Math.random() * 15; // On land
      predators.current.push({
        id: Math.random().toString(),
        position: new THREE.Vector3(startX, 0, startZ),
        velocity: new THREE.Vector3(0, 0, 0),
        type: 'lion',
        isHit: false,
      });
      lastLionSpawn.current = time * 1000;
    }

    if (score.current >= CROC_MIN_SCORE && time * 1000 - lastCrocSpawn.current > crocRate) {
      const startX = -18 + Math.random() * 36;
      const startZ = 22 + Math.random() * 4; // Far side of river
      predators.current.push({
        id: Math.random().toString(),
        position: new THREE.Vector3(startX, 0, startZ),
        velocity: new THREE.Vector3(0, 0, 0),
        type: 'crocodile',
        isHit: false,
      });
      lastCrocSpawn.current = time * 1000;
    }

    // --- Predator movement (chase elephant) ---
    predators.current.forEach(p => {
      const dir = new THREE.Vector3().subVectors(elephantPos.current, p.position);
      dir.y = 0;
      if (dir.length() > 0.1) {
        dir.normalize();
        const speed = p.type === 'lion' ? LION_SPEED : CROC_SPEED;
        p.velocity.copy(dir.multiplyScalar(speed));
        p.position.add(p.velocity.clone().multiplyScalar(delta));
      }
    });

    // Remove hit predators
    predators.current = predators.current.filter(p => !p.isHit);

    // --- Predator-elephant collision (game over) - only when grounded ---
    if (elephantPos.current.y < 0.5) {
      for (const pred of predators.current) {
        const dist = pred.position.distanceTo(elephantPos.current);
        if (dist < PREDATOR_HIT_RADIUS) {
          onGameOver();
          return;
        }
      }
    }

    // --- Projectile hits on predators ---
    for (let i = projectiles.current.length - 1; i >= 0; i--) {
      const proj = projectiles.current[i];
      let hit = false;
      for (let j = predators.current.length - 1; j >= 0; j--) {
        const pred = predators.current[j];
        if (pred.position.distanceTo(proj.position) < PREDATOR_PROJECTILE_HIT) {
          pred.isHit = true;
          hit = true;
          score.current += 1;
          onScoreUpdate(score.current);
          soundService.playHit();
          break;
        }
      }
      if (hit) projectiles.current.splice(i, 1);
    }
  });

  return (
    <>
      <ElephantModel 
        position={[elephantPos.current.x, elephantPos.current.y, elephantPos.current.z]} 
        rotation={elephantRot.current} 
        isShooting={isShooting.current} 
      />
      <group>
        {projectiles.current.map(p => (
          <ProjectileMesh key={p.id} position={[p.position.x, p.position.y, p.position.z]} size={projectileSize} />
        ))}
      </group>
      <group>
        {birds.current.map(b => (
          <BirdModel
             key={b.id}
             position={[b.position.x, b.position.y, b.position.z]}
             velocity={b.velocity}
             color={b.color}
          />
        ))}
      </group>
      <group>
        {predators.current.map(p => (
          p.type === 'lion' ? (
            <LionModel key={p.id} position={[p.position.x, p.position.y, p.position.z]} velocity={p.velocity} />
          ) : (
            <CrocodileModel key={p.id} position={[p.position.x, p.position.y, p.position.z]} velocity={p.velocity} />
          )
        ))}
      </group>
    </>
  );
};

const GameCanvas = ({
  isPlaying,
  onScore,
  onWater,
  onGameOver,
  maxWater = 100,
  shootCooldown = 0.12,
  projectileSize = 0.3,
  tripleShot = false,
  touchMoveInput,
  touchJumpInput
}: {
  isPlaying: boolean,
  onScore: (n: number) => void,
  onWater: (n: number) => void,
  onGameOver: () => void,
  maxWater?: number,
  shootCooldown?: number,
  projectileSize?: number,
  tripleShot?: boolean,
  touchMoveInput?: React.RefObject<{ x: number; z: number }>,
  touchJumpInput?: React.RefObject<boolean>
}) => {
  return (
    <Canvas shadows camera={{ position: [0, 12, 24], fov: 55 }} style={{ touchAction: 'none' }}>
      {/* Blue sky background */}
      <color attach="background" args={['#87CEEB']} />
      {/* Clouds - lower position, gentle speed, fixed seed */}
      <Cloud position={[-30, 12, -40]} speed={0.15} opacity={0.9} width={15} depth={3} segments={20} color="#ffffff" seed={1} />
      <Cloud position={[25, 14, -45]} speed={0.12} opacity={0.85} width={12} depth={2.5} segments={15} color="#ffffff" seed={2} />
      <Cloud position={[0, 10, -35]} speed={0.14} opacity={0.9} width={18} depth={4} segments={25} color="#ffffff" seed={3} />
      <Cloud position={[-50, 15, -50]} speed={0.1} opacity={0.8} width={14} depth={3} segments={18} color="#ffffff" seed={4} />
      <Cloud position={[45, 11, -38]} speed={0.13} opacity={0.85} width={16} depth={3.5} segments={20} color="#ffffff" seed={5} />
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[50, 50, 50]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <Ground />
      <GameLogic
        isPlaying={isPlaying}
        onScoreUpdate={onScore}
        onWaterUpdate={onWater}
        onGameOver={onGameOver}
        maxWater={maxWater}
        shootCooldown={shootCooldown}
        projectileSize={projectileSize}
        tripleShot={tripleShot}
        touchMoveInput={touchMoveInput}
        touchJumpInput={touchJumpInput}
      />
      <OrbitControls enabled={false} /> 
    </Canvas>
  );
};

export default GameCanvas;

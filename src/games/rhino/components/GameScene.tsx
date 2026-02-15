
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Sky, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { RhinoModel } from './RhinoModel';
import { Track } from './Track';
import { useKeyboard } from '../hooks/useKeyboard';
import { GameState } from '../types';
import { GAME_CONFIG, TRACK_PATH } from '../constants';
import { getRhinoCommentary } from '../services/commentaryService';
import { createEngineSynth, playCollisionSound } from '../services/audioUtils';

// Helper to find the distance from a point to a line segment
function getDistanceToSegment(p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3) {
  const ab = b.clone().sub(a);
  const ap = p.clone().sub(a);
  const t = Math.max(0, Math.min(1, ap.dot(ab) / ab.lengthSq()));
  const closestPoint = a.clone().add(ab.multiplyScalar(t));
  return {
    distance: p.distanceTo(closestPoint),
    closestPoint,
    normal: p.clone().sub(closestPoint).normalize()
  };
}

const PlayerKart: React.FC<{ 
  onStateUpdate: (speed: number, pos: THREE.Vector3) => void;
  gameStatus: string;
}> = ({ onStateUpdate, gameStatus }) => {
  const group = useRef<THREE.Group>(null);
  const controls = useKeyboard();
  const rotation = useRef(0);
  const speed = useRef(0);
  const engineSynth = useRef<any>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  // Initialize engine sound
  useEffect(() => {
    if (gameStatus === 'playing') {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!engineSynth.current) engineSynth.current = createEngineSynth(audioCtx.current);
    }
    return () => {
      // Don't stop oscillator immediately to avoid pops, or just let it be handled by state
    };
  }, [gameStatus]);

  const trackPoints = useMemo(() => TRACK_PATH.map(p => new THREE.Vector3(p[0], 0, p[2])), []);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (gameStatus === 'menu' || gameStatus === 'finished') {
      if (engineSynth.current) engineSynth.current.update(0, false);
      return;
    }

    // Physics
    if (controls.forward) speed.current += GAME_CONFIG.ACCELERATION * delta * 50;
    if (controls.backward) speed.current -= GAME_CONFIG.ACCELERATION * delta * 30;
    
    // Friction
    speed.current *= GAME_CONFIG.FRICTION;
    if (Math.abs(speed.current) < 0.1) speed.current = 0;

    // Steering
    const steeringFactor = Math.min(1, Math.abs(speed.current) / 10);
    if (controls.left) rotation.current += GAME_CONFIG.STEER_SPEED * steeringFactor;
    if (controls.right) rotation.current -= GAME_CONFIG.STEER_SPEED * steeringFactor;

    // Boost
    if (controls.boost) speed.current *= 1.02;
    speed.current = Math.min(speed.current, GAME_CONFIG.MAX_SPEED);

    // Apply rotation
    group.current.rotation.y = rotation.current;

    // Move forward
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation.current);
    const nextPos = group.current.position.clone().add(forward.multiplyScalar(speed.current * delta));

    // --- Boundary Logic (Fences) ---
    let closestInfo = { distance: Infinity, closestPoint: new THREE.Vector3(), normal: new THREE.Vector3() };
    for (let i = 0; i < trackPoints.length; i++) {
      const a = trackPoints[i];
      const b = trackPoints[(i + 1) % trackPoints.length];
      const info = getDistanceToSegment(nextPos, a, b);
      if (info.distance < closestInfo.distance) {
        closestInfo = info;
      }
    }

    if (closestInfo.distance > GAME_CONFIG.ROAD_LIMIT) {
      const correction = closestInfo.normal.multiplyScalar(GAME_CONFIG.ROAD_LIMIT - closestInfo.distance);
      nextPos.add(correction);
      
      // Play collision sound if we hit hard
      if (speed.current > 5 && audioCtx.current) {
        playCollisionSound(audioCtx.current);
      }
      speed.current *= 0.8;
    }

    group.current.position.copy(nextPos);

    // Update Engine Sound
    if (engineSynth.current) {
      engineSynth.current.update(speed.current, true);
    }

    // Camera follow
    const targetCamPos = group.current.position.clone().add(
      new THREE.Vector3(0, 5, -12).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation.current)
    );
    state.camera.position.lerp(targetCamPos, 0.1);
    
    const lookTarget = group.current.position.clone().add(
        new THREE.Vector3(0, 1.5, 5).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation.current)
    );
    state.camera.lookAt(lookTarget);

    onStateUpdate(speed.current, group.current.position);
  });

  return (
    <group ref={group} position={[0, 0, -15]}>
      <RhinoModel speed={speed.current} />
      <pointLight position={[0, 3, 0]} intensity={2} color="#ff3333" />
    </group>
  );
};

export const GameScene: React.FC<{ gameState: GameState, setGameState: React.Dispatch<React.SetStateAction<GameState>> }> = ({ gameState, setGameState }) => {
  const lastCheckTime = useRef(0);
  const checkpointHit = useRef(false);

  const handleStateUpdate = (speed: number, pos: THREE.Vector3) => {
    if (pos.z < -100) {
      checkpointHit.current = true;
    }

    setGameState(prev => {
      let nextLap = prev.lap;
      let nextStatus = prev.status;
      let nextTime = prev.time;

      if (prev.status === 'playing') {
        nextTime += 16.6; 
        
        const isNearLine = Math.abs(pos.z) < 4 && Math.abs(pos.x) < 8;
        if (isNearLine && checkpointHit.current) {
          const now = Date.now();
          if (now - lastCheckTime.current > 5000) { 
            lastCheckTime.current = now;
            checkpointHit.current = false;

            if (prev.lap < prev.totalLaps) {
              nextLap += 1;
              getRhinoCommentary("crossed the start line", speed, nextLap).then(txt => 
                setGameState(s => ({ ...s, commentary: txt }))
              );
            } else {
              nextStatus = 'finished';
              getRhinoCommentary("finished the final lap", speed, nextLap).then(txt => 
                setGameState(s => ({ ...s, commentary: txt }))
              );
            }
          }
        }
      }

      return {
        ...prev,
        speed,
        lap: nextLap,
        status: nextStatus,
        time: nextTime,
      };
    });
  };

  return (
    <Canvas shadows>
      <PerspectiveCamera makeDefault position={[0, 15, -25]} fov={75} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[50, 100, 50]} intensity={2} castShadow shadow-mapSize={[2048, 2048]} />
      <Sky sunPosition={[100, 10, 100]} turbidity={0.1} rayleigh={0.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Track />
      <PlayerKart onStateUpdate={handleStateUpdate} gameStatus={gameState.status} />
      <Environment preset="forest" />
    </Canvas>
  );
};

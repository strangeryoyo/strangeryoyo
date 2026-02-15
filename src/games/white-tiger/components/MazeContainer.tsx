
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { MazeConfig } from '../types';
import { generateMaze } from '../services/mazeGenerator';

interface Props {
  config: MazeConfig;
  onWin: () => void;
}

const MazeContainer: React.FC<Props> = ({ config, onWin }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<PointerLockControls | null>(null);
  const requestRef = useRef<number>(null);
  const winTriggered = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const stepTimer = useRef(0);
  const [isLocked, setIsLocked] = useState(false);

  // --- Audio Synthesis ---
  const setupAudio = () => {
    if (audioContextRef.current) {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      return;
    }
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;
    const createHum = (freq: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, ctx.currentTime);
      filter.Q.setValueAtTime(10, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
    };
    createHum(60, 0.012);
    createHum(62, 0.008);
  };

  const playFootstep = () => {
    if (!audioContextRef.current || audioContextRef.current.state !== 'running') return;
    const ctx = audioContextRef.current;
    const noise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Init ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1810);
    scene.fog = new THREE.Fog(0x1a1810, 1, 15);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const controls = new PointerLockControls(camera, renderer.domElement);
    controlsRef.current = controls;

    camera.position.set(config.cellSize / 2, 1.6, config.cellSize / 2);

    const onLock = () => setIsLocked(true);
    const onUnlock = () => setIsLocked(false);
    controls.addEventListener('lock', onLock);
    controls.addEventListener('unlock', onUnlock);

    // --- Materials ---
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xceb067, roughness: 1.0 });
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x3d3528, roughness: 1.0 });
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x827c66, roughness: 0.9 });

    // --- World Generation ---
    const mazeData = generateMaze(config.width, config.height);
    const collisionObjects: THREE.Mesh[] = [];

    const floorGeo = new THREE.PlaneGeometry(config.width * config.cellSize, config.height * config.cellSize);
    const floor = new THREE.Mesh(floorGeo, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((config.width * config.cellSize) / 2, 0, (config.height * config.cellSize) / 2);
    scene.add(floor);

    const ceiling = new THREE.Mesh(floorGeo, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set((config.width * config.cellSize) / 2, config.wallHeight, (config.height * config.cellSize) / 2);
    scene.add(ceiling);

    const wallGeo = new THREE.BoxGeometry(config.cellSize, config.wallHeight, 0.4);

    mazeData.forEach((row, x) => {
      row.forEach((cell, y) => {
        const posX = x * config.cellSize + config.cellSize / 2;
        const posZ = y * config.cellSize + config.cellSize / 2;
        const addWall = (px: number, py: number, pz: number, ry = 0) => {
          const wall = new THREE.Mesh(wallGeo, wallMaterial);
          wall.position.set(px, py, pz);
          wall.rotation.y = ry;
          scene.add(wall);
          collisionObjects.push(wall);
        };
        if (cell.walls.top) addWall(posX, config.wallHeight / 2, y * config.cellSize);
        if (cell.walls.bottom) addWall(posX, config.wallHeight / 2, (y + 1) * config.cellSize);
        if (cell.walls.left) addWall(x * config.cellSize, config.wallHeight / 2, posZ, Math.PI / 2);
        if (cell.walls.right) addWall((x + 1) * config.cellSize, config.wallHeight / 2, posZ, Math.PI / 2);

        if (Math.random() > 0.9) {
          const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 1.5 }));
          panel.rotation.x = Math.PI / 2;
          panel.position.set(posX, config.wallHeight - 0.05, posZ);
          scene.add(panel);
          const pLight = new THREE.PointLight(0xffffee, 0.4, 10);
          pLight.position.set(posX, config.wallHeight - 0.5, posZ);
          scene.add(pLight);
        }
      });
    });

    const goalX = (config.width - 1) * config.cellSize + config.cellSize / 2;
    const goalZ = (config.height - 1) * config.cellSize + config.cellSize / 2;
    const goal = new THREE.Mesh(new THREE.BoxGeometry(0.8, config.wallHeight, 0.8), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    goal.position.set(goalX, config.wallHeight / 2, goalZ);
    scene.add(goal);

    scene.add(new THREE.AmbientLight(0xffffee, 0.05));
    const flashLight = new THREE.PointLight(0xffffee, 0.2, 5);
    camera.add(flashLight);
    scene.add(camera);

    // --- Input Management ---
    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => { keys[e.code] = true; };
    const onKeyUp = (e: KeyboardEvent) => { keys[e.code] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // --- Animation Loop ---
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    let prevTime = performance.now();

    const animate = () => {
      const time = performance.now();
      const delta = Math.min((time - prevTime) / 1000, 0.1);
      prevTime = time;

      if (controls.isLocked) {
        // Friction
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        // CRITICAL FIX: Ensure we use 0 if key is undefined to prevent NaN
        const forward = (keys['KeyW'] || keys['ArrowUp'] ? 1 : 0) - (keys['KeyS'] || keys['ArrowDown'] ? 1 : 0);
        const right = (keys['KeyD'] || keys['ArrowRight'] ? 1 : 0) - (keys['KeyA'] || keys['ArrowLeft'] ? 1 : 0);

        direction.z = forward;
        direction.x = right;

        if (direction.length() > 0) direction.normalize();

        const accel = 150.0; 
        velocity.z -= direction.z * accel * delta;
        velocity.x -= direction.x * accel * delta;

        const oldPos = camera.position.clone();
        controls.moveForward(-velocity.z * delta);
        controls.moveRight(-velocity.x * delta);

        // Head bobbing
        const currentSpeed = velocity.length();
        if (currentSpeed > 0.5) {
          stepTimer.current += delta * 6;
          camera.position.y = 1.6 + Math.sin(stepTimer.current) * 0.035;
          if (Math.sin(stepTimer.current) < -0.98) {
            playFootstep();
            stepTimer.current += 0.15;
          }
        } else {
          camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.6, 0.1);
        }

        // Collision Check
        const playerRadius = 0.25;
        const moveVec = camera.position.clone().sub(oldPos);
        if (moveVec.length() > 0.001) {
          const raycaster = new THREE.Raycaster();
          raycaster.set(oldPos, moveVec.normalize());
          const intersects = raycaster.intersectObjects(collisionObjects);
          if (intersects.length > 0 && intersects[0].distance < playerRadius) {
            camera.position.copy(oldPos);
            velocity.set(0, 0, 0);
          }
        }

        // Win check
        if (camera.position.distanceTo(new THREE.Vector3(goalX, 1.6, goalZ)) < 1.4 && !winTriggered.current) {
          winTriggered.current = true;
          controls.unlock();
          onWin();
        }
      }

      renderer.render(scene, camera);
      (requestRef as any).current = requestAnimationFrame(animate);
    };

    (requestRef as any).current = requestAnimationFrame(animate);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      controls.removeEventListener('lock', onLock);
      controls.removeEventListener('unlock', onUnlock);
      renderer.dispose();
      audioContextRef.current?.close();
    };
  }, [config, onWin]);

  const handleOverlayClick = () => {
    if (controlsRef.current) {
      controlsRef.current.lock();
      setupAudio();
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {!isLocked && !winTriggered.current && (
        <div 
          onClick={handleOverlayClick}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 cursor-pointer group"
        >
          <div className="text-center p-10 border border-[#ceb067]/20 bg-[#1a1810]/95 backdrop-blur-md shadow-2xl">
            <div className="text-[#ceb067] text-2xl font-bold tracking-[0.5em] uppercase animate-pulse mb-4">
              SIGNAL INTERRUPTED
            </div>
            <div className="text-[10px] text-[#ceb067]/40 tracking-[0.3em] uppercase group-hover:text-[#ceb067] transition-colors font-mono">
              Click to re-establish spatial presence
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MazeContainer;

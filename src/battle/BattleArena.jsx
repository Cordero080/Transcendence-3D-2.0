import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, Html } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';

// Animated character component
function Character({ url, position, color, isWalking, walkDirection = 1, zDirection = 0, scale = 0.00124, rotationY = 0 }) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const fbx = useLoader(FBXLoader, url);
  
  // Use SkeletonUtils.clone for proper skinned mesh cloning
  const model = useMemo(() => {
    const clone = SkeletonUtils.clone(fbx);
    
    // Apply scale
    clone.scale.set(scale, scale, scale);
    
    // Apply color
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.3,
          roughness: 0.7
        });
      }
    });
    
    return clone;
  }, [fbx, color, scale]);
  
  const actionRef = useRef();
  
  useEffect(() => {
    if (fbx.animations?.length > 0 && model) {
      mixerRef.current = new THREE.AnimationMixer(model);
      actionRef.current = mixerRef.current.clipAction(fbx.animations[0]);
      actionRef.current.play();
    }
  }, [fbx, model]);
  
  // Start/stop animation based on walking state
  useEffect(() => {
    if (actionRef.current) {
      if (isWalking) {
        actionRef.current.paused = false;
      } else {
        actionRef.current.paused = true;
      }
    }
  }, [isWalking]);
  
  // Reset position when position prop changes
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
    }
  }, [position]);
  
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    
    // Walk forward/backward (X axis)
    if (isWalking && groupRef.current && walkDirection !== 0) {
      groupRef.current.position.x += 0.02 * walkDirection;
    }
    
    // Walk up/down (Z axis)
    if (isWalking && groupRef.current && zDirection !== 0) {
      groupRef.current.position.z += 0.02 * zDirection;
    }
  });
  
  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      <primitive object={model} />
    </group>
  );
}

// Loading fallback
function Loader() {
  return (
    <Html center>
      <div style={{ color: '#00ff88', fontFamily: 'monospace' }}>
        Loading model...
      </div>
    </Html>
  );
}

export default function BattleArena() {
  const [walking, setWalking] = useState(false);
  const [retreating, setRetreating] = useState(false);
  const [movingUp, setMovingUp] = useState(false);
  const [movingDown, setMovingDown] = useState(false);
  const [charAPos, setCharAPos] = useState([-3, -1, 0]);
  const [charBPos, setCharBPos] = useState([3, -1, 0]);
  
  // Keyboard controls
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.code === 'Space') {
        e.preventDefault();
        setWalking(true);
      }
      if (e.metaKey || e.code === 'MetaLeft' || e.code === 'MetaRight') {
        e.preventDefault();
        setRetreating(true);
      }
      if (e.code === 'KeyD') {
        setMovingUp(true);
      }
      if (e.altKey || e.code === 'AltLeft' || e.code === 'AltRight') {
        e.preventDefault();
        setMovingDown(true);
      }
    }
    
    function handleKeyUp(e) {
      if (e.code === 'Space') {
        setWalking(false);
      }
      if (e.code === 'MetaLeft' || e.code === 'MetaRight' || !e.metaKey) {
        setRetreating(false);
      }
      if (e.code === 'KeyD') {
        setMovingUp(false);
      }
      if (e.code === 'AltLeft' || e.code === 'AltRight' || !e.altKey) {
        setMovingDown(false);
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}>
      <Canvas camera={{ position: [0, 8, 20], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#3d5a80" />
        </mesh>
        
        {/* Grid overlay */}
        <Grid 
          args={[50, 50]} 
          cellSize={1} 
          cellColor="#004400" 
          sectionColor="#00ff00"
          position={[0, -0.99, 0]}
        />
        
        {/* Characters */}
        <Suspense fallback={<Loader />}>
          <Character 
            url="./models/blue_robot.fbx"
            position={charAPos}
            color="#00ff88"
            isWalking={walking || retreating || movingUp || movingDown}
            walkDirection={walking ? 1 : retreating ? -1 : 0}
            zDirection={movingUp ? -1 : movingDown ? 1 : 0}
            scale={0.00124}
            rotationY={Math.PI / 2}
          />
          <Character 
            url="./models/blue_robot.fbx"
            position={charBPos}
            color="#ff6b6b"
            isWalking={walking || retreating || movingUp || movingDown}
            walkDirection={walking ? -1 : retreating ? 1 : 0}
            zDirection={movingUp ? -1 : movingDown ? 1 : 0}
            scale={0.00124}
            rotationY={-Math.PI / 2}
          />
        </Suspense>
        
        <OrbitControls />
      </Canvas>
      
      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: '#00ff88',
        fontFamily: 'monospace',
        fontSize: '16px',
        textShadow: '0 0 10px #00ff88'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>🎮 EXODUS</h1>
        <p style={{ opacity: 0.7 }}>React Three Fiber Battle Test</p>
        
        <div style={{ 
          marginTop: 20, 
          padding: 15, 
          background: 'rgba(0,0,0,0.6)', 
          borderRadius: 8,
          border: '1px solid #00ff88'
        }}>
          <p><strong>Controls:</strong></p>
          <p>SPACE - Walk toward each other</p>
          <p>⌘ CMD - Walk away from each other</p>
          <p>D - Walk up (into screen)</p>
          <p>⌥ OPT - Walk down (toward camera)</p>
          <p>Mouse - Orbit camera</p>
        </div>
      </div>
    </div>
  );
}

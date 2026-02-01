import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import './Scene1.scss';

// Animated character component
function Character({ url, position, color, isWalking, walkDirection = 1, zDirection = 0, scale = 0.00124, rotationY = 0 }) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const fbx = useLoader(FBXLoader, url);
  
  const model = useMemo(() => {
    const clone = SkeletonUtils.clone(fbx);
    clone.scale.set(scale, scale, scale);
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
  
  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.paused = !isWalking;
    }
  }, [isWalking]);
  
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
    }
  }, [position]);
  
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    
    if (isWalking && groupRef.current && walkDirection !== 0) {
      groupRef.current.position.x += 0.02 * walkDirection;
    }
    
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

function Loader() {
  return (
    <Html center>
      <div className="loader">Loading model...</div>
    </Html>
  );
}

export default function Scene1WalkingCats() {
  const [walking, setWalking] = useState(false);
  const [retreating, setRetreating] = useState(false);
  const [movingUp, setMovingUp] = useState(false);
  const [movingDown, setMovingDown] = useState(false);
  const [charAPos] = useState([-3, -1, 0]);
  const [charBPos] = useState([3, -1, 0]);
  
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
    <div className="scene1__container">
      <Canvas camera={{ position: [0, 8, 20], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#3d5a80" />
        </mesh>
        
        <Grid 
          args={[50, 50]} 
          cellSize={1} 
          cellColor="#004400" 
          sectionColor="#00ff00"
          position={[0, -1.01, 0]}
        />
        
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
      
      <h1 className="scene1__title">EXODUS</h1>
      <p className="scene1__subtitle">React Three Fiber Battle Test</p>
      
      <div className="scene1__overlay">
        <div className="scene1__controls">
          <p className="scene1__controls-title">Controls:</p>
          <p className="scene1__controls-item">SPACE - Walk toward each other</p>
          <p className="scene1__controls-item">⌘ CMD - Walk away from each other</p>
          <p className="scene1__controls-item">D - Walk up (into screen)</p>
          <p className="scene1__controls-item">⌥ OPT - Walk down (toward camera)</p>
          <p className="scene1__controls-item">Mouse - Orbit camera</p>
        </div>
      </div>
    </div>
  );
}

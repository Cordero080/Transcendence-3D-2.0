import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Html, Grid, OrbitControls, useTexture } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import * as THREE from 'three';
import './Scene3.scss';

// Panoramic background sphere
function PanoramicBackground() {
  const texture = useTexture('/models/bg/Colors-4.8.1 copy.png');
  
  // Configure texture for spherical mapping
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[150, 64, 64]} />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.BackSide}
        toneMapped={false}
      />
    </mesh>
  );
}

const MODEL_SCALE = 0.00124;

function TrainingCat({ 
  modelPath, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  label,
  colorClass,
  isMoving = false,
  moveDirection = 0,
  autoAnimate = true
}) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const actionRef = useRef();
  const initialPosRef = useRef(null);
  
  const fbx = useLoader(FBXLoader, modelPath);
  
  const clonedModel = useMemo(() => {
    const clone = SkeletonUtils.clone(fbx);
    clone.scale.setScalar(MODEL_SCALE);
    return clone;
  }, [fbx]);
  
  // Setup animation
  useEffect(() => {
    if (clonedModel && clonedModel.animations?.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(clonedModel);
      actionRef.current = mixerRef.current.clipAction(clonedModel.animations[0]);
      actionRef.current.play();
    }
    
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [clonedModel]);
  
  // Set initial position on mount
  useEffect(() => {
    if (groupRef.current && !initialPosRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      initialPosRef.current = true;
    }
  }, []);
  
  // Control animation pause/play based on autoAnimate or isMoving
  useEffect(() => {
    if (actionRef.current) {
      if (autoAnimate) {
        actionRef.current.paused = false;
      } else {
        actionRef.current.paused = !isMoving;
      }
    }
  }, [autoAnimate, isMoving]);
  
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    
    // Movement when not in auto-animate mode
    if (!autoAnimate && isMoving && groupRef.current && moveDirection !== 0) {
      groupRef.current.position.x += 0.02 * moveDirection;
    }
  });
  
  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <primitive object={clonedModel} />
      <Html position={[0, 3.2, 0]} center>
        <div className={`cat-label cat-label--${colorClass}`}>
          {label}
        </div>
      </Html>
    </group>
  );
}

function DojoMat() {
  return (
    <>
      {/* Semi-transparent floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#0a0a12" 
          opacity={0.5} 
          transparent 
        />
      </mesh>
      {/* Dojo circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial 
          color="#8B4513" 
          opacity={0.8} 
          transparent 
        />
      </mesh>
    </>
  );
}

function CenterMarker() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.3, 32]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

export default function Scene3TrainingDojo({ 
  autoAnimate = true,
  greenMoving = false,
  greenDirection = 0,
  redMoving = false,
  redDirection = 0,
  blueMoving = false,
  blueDirection = 0
}) {
  const greenPosition = [-3.3, 0, 2.2];
  const redPosition = [3.3, 1, 2.2];
  const bluePosition = [0, 1, -3.3];
  
  const greenRotation = [0, Math.PI / 4, 0];
  const redRotation = [0, -Math.PI / 4, 0];
  const blueRotation = [0, 0, 0];
  
  return (
    <>
      <PanoramicBackground />
      
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 10, -5]} intensity={0.5} />
      
      <DojoMat />
      <CenterMarker />
      <Grid 
        args={[30, 30]} 
        cellSize={1} 
        cellColor="#00ffff" 
        sectionColor="#ff00ff"
        sectionThickness={1.5}
        fadeDistance={40}
        position={[0, 0, 0]}
      />
      
      <TrainingCat
        modelPath="/models/green_butterfly.fbx"
        position={greenPosition}
        rotation={greenRotation}
        colorClass="green"
        label="Butterfly Kick"
        autoAnimate={autoAnimate}
        isMoving={greenMoving}
        moveDirection={greenDirection}
      />
      
      <TrainingCat
        modelPath="/models/red_fist_elbow.fbx"
        position={redPosition}
        rotation={redRotation}
        colorClass="red"
        label="Kururunfa"
        autoAnimate={autoAnimate}
        isMoving={redMoving}
        moveDirection={redDirection}
      />
      
      <TrainingCat
        modelPath="/models/blue_train_2.fbx"
        position={bluePosition}
        rotation={blueRotation}
        colorClass="blue"
        label="Muay Thai"
        autoAnimate={autoAnimate}
        isMoving={blueMoving}
        moveDirection={blueDirection}
      />
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        minDistance={5}
        maxDistance={20}
        target={[0, 1, 0]}
      />
    </>
  );
}

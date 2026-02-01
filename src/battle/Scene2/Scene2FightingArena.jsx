import React, { useRef, useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import '../shared/shared.scss';
import './Scene2.scss';

// Shockwave particle burst effect
function Shockwave({ trigger, position }) {
  const groupRef = useRef();
  const particlesRef = useRef([]);
  const ringRef = useRef();
  const [active, setActive] = useState(false);
  const timeRef = useRef(0);
  
  const particles = useMemo(() => {
    const count = 30;
    const positions = [];
    const velocities = [];
    
    for (let i = 0; i < count; i++) {
      positions.push(new THREE.Vector3(0, 0, 0));
      const angle = (i / count) * Math.PI * 2;
      const speed = 0.1 + Math.random() * 0.15;
      velocities.push(new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.random() * 0.05,
        Math.sin(angle) * speed
      ));
    }
    
    return { positions, velocities, count };
  }, []);
  
  useEffect(() => {
    if (trigger) {
      setActive(true);
      timeRef.current = 0;
      particlesRef.current.forEach((mesh) => {
        if (mesh) {
          mesh.position.set(0, 0.5, 0);
          mesh.scale.set(1, 1, 1);
          mesh.material.opacity = 1;
        }
      });
      if (ringRef.current) {
        ringRef.current.scale.set(0.1, 0.1, 0.1);
        ringRef.current.material.opacity = 1;
      }
    }
  }, [trigger]);
  
  useFrame((state, delta) => {
    if (!active) return;
    
    timeRef.current += delta;
    
    particlesRef.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.position.x += particles.velocities[i].x;
        mesh.position.y += particles.velocities[i].y;
        mesh.position.z += particles.velocities[i].z;
        mesh.material.opacity -= delta * 2;
        
        if (Math.random() > 0.7) {
          mesh.position.x += (Math.random() - 0.5) * 0.1;
          mesh.position.z += (Math.random() - 0.5) * 0.1;
        }
      }
    });
    
    if (ringRef.current) {
      ringRef.current.scale.x += delta * 8;
      ringRef.current.scale.y += delta * 8;
      ringRef.current.scale.z += delta * 8;
      ringRef.current.material.opacity -= delta * 3;
    }
    
    if (timeRef.current > 0.5) {
      setActive(false);
    }
  });
  
  if (!active) return null;
  
  return (
    <group ref={groupRef} position={position}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial 
          color="#ff3333" 
          transparent 
          opacity={1} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {Array.from({ length: particles.count }).map((_, i) => (
        <mesh 
          key={i} 
          ref={el => particlesRef.current[i] = el}
          position={[0, 0.5, 0]}
        >
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshBasicMaterial 
            color={i % 2 === 0 ? "#ff6b6b" : "#ffffff"} 
            transparent 
            opacity={1}
          />
        </mesh>
      ))}
      
      <pointLight color="#ff3333" intensity={active ? 5 : 0} distance={10} />
    </group>
  );
}

// Green character with multi-animation support
function GreenCharacter({ position, color, isWalking, walkDirection = 1, scale = 0.00124, rotationY = 0, stutter = 0, groupRefCallback, autoAnimate = false }) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const fightFbx = useLoader(FBXLoader, './models/green_back_k.fbx');
  const deathFbx = useLoader(FBXLoader, './models/green_dies.fbx');
  
  const stutterTimeRef = useRef(0);
  const stutterActiveRef = useRef(false);
  const originalPosRef = useRef(null);
  const [isDead, setIsDead] = useState(false);
  const [canRecover, setCanRecover] = useState(false);
  const [hitCount, setHitCount] = useState(0);
  const fightActionRef = useRef();
  const deathActionRef = useRef();
  const deathCompleteRef = useRef(false);
  const HITS_TO_DIE = 3;
  
  useEffect(() => {
    if (groupRefCallback && groupRef.current) {
      groupRefCallback(groupRef);
    }
  }, [groupRefCallback]);
  
  const fightModel = useMemo(() => {
    const clone = SkeletonUtils.clone(fightFbx);
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
  }, [fightFbx, color, scale]);
  
  const deathModel = useMemo(() => {
    const clone = SkeletonUtils.clone(deathFbx);
    clone.scale.set(scale, scale, scale);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.7,
          roughness: 0.7
        });
      }
    });
    clone.visible = false;
    return clone;
  }, [deathFbx, color, scale]);
  
  useEffect(() => {
    mixerRef.current = new THREE.AnimationMixer(fightModel);
    
    if (fightFbx.animations?.length > 0) {
      fightActionRef.current = mixerRef.current.clipAction(fightFbx.animations[0]);
      fightActionRef.current.play();
    }
  }, [fightFbx, fightModel]);
  
  useEffect(() => {
    if (stutter > 0 && groupRef.current && !isDead) {
      stutterActiveRef.current = true;
      stutterTimeRef.current = 0;
      originalPosRef.current = groupRef.current.position.x;
    }
  }, [stutter]);
  
  useEffect(() => {
    if (fightActionRef.current && !isDead) {
      fightActionRef.current.paused = autoAnimate ? false : !isWalking;
    }
    
    if (isWalking && canRecover && isDead) {
      recoverFromDeath();
    }
  }, [isWalking, isDead, canRecover, autoAnimate]);
  
  const initialPosRef = useRef(null);
  useEffect(() => {
    if (groupRef.current && !initialPosRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      initialPosRef.current = true;
    }
  }, []);
  
  const triggerDeath = useCallback(() => {
    if (isDead) return;
    setIsDead(true);
    setCanRecover(false);
    deathCompleteRef.current = false;
    
    fightModel.visible = false;
    deathModel.visible = true;
    
    if (fightActionRef.current) {
      fightActionRef.current.stop();
    }
    
    const deathMixer = new THREE.AnimationMixer(deathModel);
    mixerRef.current = deathMixer;
    
    if (deathFbx.animations?.length > 0) {
      deathActionRef.current = deathMixer.clipAction(deathFbx.animations[0]);
      deathActionRef.current.setLoop(THREE.LoopOnce);
      deathActionRef.current.clampWhenFinished = true;
      deathActionRef.current.time = 0.8;
      deathActionRef.current.play();
      
      deathMixer.addEventListener('finished', () => {
        deathCompleteRef.current = true;
        setCanRecover(true);
      });
    }
  }, [isDead, fightModel, deathModel, deathFbx]);
  
  const recoverFromDeath = useCallback(() => {
    if (!isDead || !canRecover) return;
    
    setIsDead(false);
    setCanRecover(false);
    setHitCount(0);
    
    deathModel.visible = false;
    fightModel.visible = true;
    
    if (deathActionRef.current) {
      deathActionRef.current.stop();
    }
    
    mixerRef.current = new THREE.AnimationMixer(fightModel);
    
    if (fightFbx.animations?.length > 0) {
      fightActionRef.current = mixerRef.current.clipAction(fightFbx.animations[0]);
      fightActionRef.current.play();
    }
  }, [isDead, canRecover, fightModel, deathModel, fightFbx]);
  
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    
    if (stutterActiveRef.current && groupRef.current) {
      stutterTimeRef.current += delta;
      const stutterDuration = 0.3;
      const progress = stutterTimeRef.current / stutterDuration;
      
      if (progress < 1) {
        const shake = Math.sin(progress * Math.PI * 6) * (1 - progress) * 0.15;
        groupRef.current.position.x = originalPosRef.current + shake;
      } else {
        groupRef.current.position.x = originalPosRef.current;
        stutterActiveRef.current = false;
        
        const newHitCount = hitCount + 1;
        setHitCount(newHitCount);
        
        if (newHitCount >= HITS_TO_DIE) {
          triggerDeath();
        }
      }
    } else if (!isDead) {
      if (isWalking && groupRef.current && walkDirection !== 0) {
        groupRef.current.position.x += 0.02 * walkDirection;
      }
    }
  });
  
  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      <primitive object={fightModel} />
      <primitive object={deathModel} />
    </group>
  );
}

// Generic animated character
function Character({ url, position, color, isWalking, walkDirection = 1, zDirection = 0, scale = 0.00124, rotationY = 0, onAnimationLoop, triggerBeforeEnd = 0, stutter = 0, groupRefCallback, autoAnimate = false }) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const fbx = useLoader(FBXLoader, url);
  const triggeredRef = useRef(false);
  const clipDurationRef = useRef(0);
  const stutterTimeRef = useRef(0);
  const stutterActiveRef = useRef(false);
  const originalPosRef = useRef(null);
  
  useEffect(() => {
    if (groupRefCallback && groupRef.current) {
      groupRefCallback(groupRef);
    }
  }, [groupRefCallback]);
  
  useEffect(() => {
    if (stutter > 0 && groupRef.current) {
      stutterActiveRef.current = true;
      stutterTimeRef.current = 0;
      originalPosRef.current = groupRef.current.position.x;
    }
  }, [stutter]);
  
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
      clipDurationRef.current = fbx.animations[0].duration;
    }
  }, [fbx, model]);
  
  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.paused = autoAnimate ? false : !isWalking;
    }
  }, [isWalking, autoAnimate]);
  
  const initialPosRef = useRef(null);
  useEffect(() => {
    if (groupRef.current && !initialPosRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      initialPosRef.current = true;
    }
  }, []);
  
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    
    if (onAnimationLoop && actionRef.current && clipDurationRef.current > 0) {
      const currentTime = actionRef.current.time;
      const triggerTime = clipDurationRef.current - (triggerBeforeEnd / 1000);
      
      if (currentTime >= triggerTime && !triggeredRef.current) {
        triggeredRef.current = true;
        onAnimationLoop();
      }
      
      if (currentTime < triggerTime * 0.5) {
        triggeredRef.current = false;
      }
    }
    
    if (stutterActiveRef.current && groupRef.current) {
      stutterTimeRef.current += delta;
      const stutterDuration = 0.3;
      const progress = stutterTimeRef.current / stutterDuration;
      
      if (progress < 1) {
        const shake = Math.sin(progress * Math.PI * 6) * (1 - progress) * 0.3;
        groupRef.current.position.x = originalPosRef.current + shake - (1 - progress) * 0.5;
      } else {
        groupRef.current.position.x = originalPosRef.current;
        stutterActiveRef.current = false;
      }
    } else {
      if (isWalking && groupRef.current && walkDirection !== 0) {
        groupRef.current.position.x += 0.02 * walkDirection;
      }
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

export default function Scene2FightingArena() {
  const [greenMoving, setGreenMoving] = useState(false);
  const [redMoving, setRedMoving] = useState(false);
  const [greenDirection, setGreenDirection] = useState(0);
  const [redDirection, setRedDirection] = useState(0);
  const [shockwaveTrigger, setShockwaveTrigger] = useState(0);
  const [greenStutter, setGreenStutter] = useState(0);
  const [autoAnimate, setAutoAnimate] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const greenGroupRef = useRef(null);
  
  const handleGreenRef = useCallback((ref) => {
    greenGroupRef.current = ref;
  }, []);
  
  const handleRedAnimationLoop = useCallback(() => {
    setShockwaveTrigger(prev => prev + 1);
    
    if (greenGroupRef.current?.current) {
      const greenX = greenGroupRef.current.current.position.x;
      const shockwaveX = 0;
      const distance = Math.abs(greenX - shockwaveX);
      
      if (distance < 2.5) {
        setGreenStutter(prev => prev + 1);
      }
    }
  }, []);
  
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.code === 'KeyA') {
        setGreenMoving(true);
        setGreenDirection(-1);
      }
      if (e.code === 'KeyD') {
        setGreenMoving(true);
        setGreenDirection(1);
      }
      if (e.code === 'ArrowLeft') {
        setRedMoving(true);
        setRedDirection(-1);
      }
      if (e.code === 'ArrowRight') {
        setRedMoving(true);
        setRedDirection(1);
      }
    }
    
    function handleKeyUp(e) {
      if (e.code === 'KeyA' || e.code === 'KeyD') {
        setGreenMoving(false);
        setGreenDirection(0);
      }
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        setRedMoving(false);
        setRedDirection(0);
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
    <div className="scene2__container">
      <Canvas camera={{ position: [0, 3, 28], fov: 45 }}>
        {/* Atmospheric fog */}
        <fog attach="fog" args={['#0a0a15', 15, 60]} />
        
        {/* Ambient and dramatic lighting */}
        <ambientLight intensity={3.2} color="#4a0080" />
        <directionalLight position={[10, 15, 5]} intensity={1.8} color="#ff00ff" />
        <directionalLight position={[-10, 10, -5]} intensity={1.4} color="#00ffff" />
        <pointLight position={[0, 5, 0]} intensity={1.5} color="#ff3366" distance={20} />
        <pointLight position={[-8, 4, 0]} intensity={1.8} color="#00ffff" distance={15} />
        <pointLight position={[8, 4, 0]} intensity={0.8} color="#ff00ff" distance={15} />
        
        {/* Dark reflective floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial 
            color="#0a0a9d" 
            metalness={0.9} 
            roughness={0.1}
          />
        </mesh>
        
        {/* Neon cyberpunk grid */}
        <Grid 
          args={[60, 60]} 
          cellSize={1} 
          cellColor="#ff00ff" 
          sectionColor="#210af0aa"
          sectionSize={5}
          fadeDistance={50}
          fadeStrength={1}
          position={[0, -0.9, 0]}
        />
        
        {/* Arena boundary ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]}>
          <ringGeometry args={[12, 12.3, 64]} />
          <meshBasicMaterial color="#ff3366" transparent opacity={0.8} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.94, 0]}>
          <ringGeometry args={[14, 14.2, 64]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
        </mesh>
        
        <Suspense fallback={<Loader />}>
          <GreenCharacter 
            position={[-2, -1, 0]}
            color="#00ff88"
            isWalking={greenMoving}
            walkDirection={greenDirection}
            scale={0.00231}
            rotationY={Math.PI / 3}
            stutter={greenStutter}
            groupRefCallback={handleGreenRef}
            autoAnimate={autoAnimate}
          />
          <Character 
            url="./models/red_hadouken.fbx"
            position={[2, -1, 0]}
            color="#ff6b6b"
            isWalking={redMoving}
            walkDirection={redDirection}
            zDirection={0}
            scale={0.00231}
            rotationY={-Math.PI / 3}
            onAnimationLoop={handleRedAnimationLoop}
            triggerBeforeEnd={900}
            autoAnimate={autoAnimate}
          />
          
          <Shockwave trigger={shockwaveTrigger} position={[0, 0, 0]} />
        </Suspense>
        
        <OrbitControls target={[0, 0, 0]} />
      </Canvas>
      
      <div className="scene2__header">
        <h1 className="scene2__title">SCENE 2: FIGHT!</h1>
      </div>
      
      <div className="scene2__controls-wrapper">
        <button
          className={`scene-selector__toggle ${controlsOpen ? 'scene-selector__toggle--open' : ''}`}
          onClick={() => setControlsOpen(!controlsOpen)}
        >
          <span>Controls</span>
          <span className="scene-selector__icon">{controlsOpen ? '▲' : '▼'}</span>
        </button>
        
        {controlsOpen && (
          <div className="scene-selector__dropdown">
            <label className="scene2__toggle-label">
              <input
                type="checkbox"
                checked={autoAnimate}
                onChange={(e) => setAutoAnimate(e.target.checked)}
              />
              <span>Auto-Animate</span>
            </label>
            {!autoAnimate && (
              <>
                <p className="scene2__green-label">Green Controls:</p>
                <p className="scene2__control-item">A - Move away</p>
                <p className="scene2__control-item">D - Move toward red</p>
                <p className="scene2__red-label">Red Controls:</p>
                <p className="scene2__control-item">← Arrow - Move toward green</p>
                <p className="scene2__control-item">→ Arrow - Move away</p>
              </>
            )}
            <p className="scene2__control-footer">Mouse - Orbit camera</p>
          </div>
        )}
      </div>
    </div>
  );
}

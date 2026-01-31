import React, { useRef, useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, Html } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';

// Shockwave particle burst effect
function Shockwave({ trigger, position }) {
  const groupRef = useRef();
  const particlesRef = useRef([]);
  const ringRef = useRef();
  const [active, setActive] = useState(false);
  const timeRef = useRef(0);
  
  // Create particle geometry
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
  
  // Reset and trigger effect
  useEffect(() => {
    if (trigger) {
      setActive(true);
      timeRef.current = 0;
      // Reset particle positions
      particlesRef.current.forEach((mesh, i) => {
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
    
    // Animate particles outward
    particlesRef.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.position.x += particles.velocities[i].x;
        mesh.position.y += particles.velocities[i].y;
        mesh.position.z += particles.velocities[i].z;
        mesh.material.opacity -= delta * 2;
        
        // Glitch effect - random position jitter
        if (Math.random() > 0.7) {
          mesh.position.x += (Math.random() - 0.5) * 0.1;
          mesh.position.z += (Math.random() - 0.5) * 0.1;
        }
      }
    });
    
    // Animate ring expansion
    if (ringRef.current) {
      ringRef.current.scale.x += delta * 8;
      ringRef.current.scale.y += delta * 8;
      ringRef.current.scale.z += delta * 8;
      ringRef.current.material.opacity -= delta * 3;
    }
    
    // End effect after duration
    if (timeRef.current > 0.5) {
      setActive(false);
    }
  });
  
  if (!active) return null;
  
  return (
    <group ref={groupRef} position={position}>
      {/* Shockwave ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial 
          color="#ff3333" 
          transparent 
          opacity={1} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Particles */}
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
      
      {/* Flash */}
      <pointLight color="#ff3333" intensity={active ? 5 : 0} distance={10} />
    </group>
  );
}

// Green character with multi-animation support (fight + death + recover)
function GreenCharacter({ position, color, isWalking, walkDirection = 1, scale = 0.00124, rotationY = 0, stutter = 0, groupRefCallback }) {
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
  
  // Pass ref to parent
  useEffect(() => {
    if (groupRefCallback && groupRef.current) {
      groupRefCallback(groupRef);
    }
  }, [groupRefCallback]);
  
  // Clone fight model
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
  
  // Clone death model
  const deathModel = useMemo(() => {
    const clone = SkeletonUtils.clone(deathFbx);
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
    clone.visible = false;
    return clone;
  }, [deathFbx, color, scale]);
  
  // Setup animations
  useEffect(() => {
    mixerRef.current = new THREE.AnimationMixer(fightModel);
    
    if (fightFbx.animations?.length > 0) {
      fightActionRef.current = mixerRef.current.clipAction(fightFbx.animations[0]);
      fightActionRef.current.play();
    }
  }, [fightFbx, fightModel]);
  
  // Trigger stutter and then death
  useEffect(() => {
    if (stutter > 0 && groupRef.current && !isDead) {
      stutterActiveRef.current = true;
      stutterTimeRef.current = 0;
      originalPosRef.current = groupRef.current.position.x;
    }
  }, [stutter]);
  
  // Control fight animation pause AND handle recovery
  useEffect(() => {
    if (fightActionRef.current && !isDead) {
      fightActionRef.current.paused = !isWalking;
    }
    
    // Recover when user starts moving again after being knocked down
    if (isWalking && canRecover && isDead) {
      recoverFromDeath();
    }
  }, [isWalking, isDead, canRecover]);
  
  // Set initial position
  const initialPosRef = useRef(null);
  useEffect(() => {
    if (groupRef.current && !initialPosRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      initialPosRef.current = true;
    }
  }, []);
  
  // Switch to death animation
  const triggerDeath = useCallback(() => {
    if (isDead) return;
    setIsDead(true);
    setCanRecover(false);
    deathCompleteRef.current = false;
    
    // Hide fight model, show death model
    fightModel.visible = false;
    deathModel.visible = true;
    
    // Stop fight animation
    if (fightActionRef.current) {
      fightActionRef.current.stop();
    }
    
    // Setup and play death animation
    const deathMixer = new THREE.AnimationMixer(deathModel);
    mixerRef.current = deathMixer;
    
    if (deathFbx.animations?.length > 0) {
      deathActionRef.current = deathMixer.clipAction(deathFbx.animations[0]);
      deathActionRef.current.setLoop(THREE.LoopOnce);
      deathActionRef.current.clampWhenFinished = true;
      // Start at 800ms into the animation to skip the movement/transition part
      deathActionRef.current.time = 0.8;
      deathActionRef.current.play();
      
      // Listen for death animation to finish
      deathMixer.addEventListener('finished', () => {
        deathCompleteRef.current = true;
        setCanRecover(true);
      });
    }
  }, [isDead, fightModel, deathModel, deathFbx]);
  
  // Recover from death - get back up
  const recoverFromDeath = useCallback(() => {
    if (!isDead || !canRecover) return;
    
    setIsDead(false);
    setCanRecover(false);
    setHitCount(0); // Reset hit count when recovering
    
    // Hide death model, show fight model
    deathModel.visible = false;
    fightModel.visible = true;
    
    // Stop death animation
    if (deathActionRef.current) {
      deathActionRef.current.stop();
    }
    
    // Setup and restart fight animation
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
    
    // Stutter effect then death (only after 3 hits)
    if (stutterActiveRef.current && groupRef.current) {
      stutterTimeRef.current += delta;
      const stutterDuration = 0.3;
      const progress = stutterTimeRef.current / stutterDuration;
      
      if (progress < 1) {
        // Just shake in place, no position offset
        const shake = Math.sin(progress * Math.PI * 6) * (1 - progress) * 0.15;
        groupRef.current.position.x = originalPosRef.current + shake;
      } else {
        // Stay at original position
        groupRef.current.position.x = originalPosRef.current;
        stutterActiveRef.current = false;
        
        // Increment hit count and only die after HITS_TO_DIE
        const newHitCount = hitCount + 1;
        setHitCount(newHitCount);
        
        if (newHitCount >= HITS_TO_DIE) {
          triggerDeath();
        }
      }
    } else if (!isDead) {
      // Normal movement when not stuttering and not dead
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

// Animated character component with optional onAnimationLoop callback
function Character({ url, position, color, isWalking, walkDirection = 1, zDirection = 0, scale = 0.00124, rotationY = 0, onAnimationLoop, triggerBeforeEnd = 0, stutter = 0, groupRefCallback }) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const fbx = useLoader(FBXLoader, url);
  const triggeredRef = useRef(false);
  const clipDurationRef = useRef(0);
  const stutterTimeRef = useRef(0);
  const stutterActiveRef = useRef(false);
  const originalPosRef = useRef(null);
  
  // Pass ref to parent if callback provided
  useEffect(() => {
    if (groupRefCallback && groupRef.current) {
      groupRefCallback(groupRef);
    }
  }, [groupRefCallback]);
  
  // Trigger stutter effect
  useEffect(() => {
    if (stutter > 0 && groupRef.current) {
      stutterActiveRef.current = true;
      stutterTimeRef.current = 0;
      originalPosRef.current = groupRef.current.position.x;
    }
  }, [stutter]);
  
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
      clipDurationRef.current = fbx.animations[0].duration;
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
  // Only set initial position on mount, not on every render
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
    
    // Trigger callback before end of animation
    if (onAnimationLoop && actionRef.current && clipDurationRef.current > 0) {
      const currentTime = actionRef.current.time;
      const triggerTime = clipDurationRef.current - (triggerBeforeEnd / 1000);
      
      if (currentTime >= triggerTime && !triggeredRef.current) {
        triggeredRef.current = true;
        onAnimationLoop();
      }
      
      // Reset trigger when animation loops back
      if (currentTime < triggerTime * 0.5) {
        triggeredRef.current = false;
      }
    }
    
    // Stutter effect - quick jitter back then recover
    if (stutterActiveRef.current && groupRef.current) {
      stutterTimeRef.current += delta;
      const stutterDuration = 0.3;
      const progress = stutterTimeRef.current / stutterDuration;
      
      if (progress < 1) {
        // Quick knockback then return - shake effect
        const shake = Math.sin(progress * Math.PI * 6) * (1 - progress) * 0.3;
        groupRef.current.position.x = originalPosRef.current + shake - (1 - progress) * 0.5;
      } else {
        // Reset to original position
        groupRef.current.position.x = originalPosRef.current;
        stutterActiveRef.current = false;
      }
    } else {
      // Walk forward/backward (X axis) - only when not stuttering
      if (isWalking && groupRef.current && walkDirection !== 0) {
        groupRef.current.position.x += 0.02 * walkDirection;
      }
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

export default function Scene2FightingArena() {
  const [greenMoving, setGreenMoving] = useState(false);
  const [redMoving, setRedMoving] = useState(false);
  const [greenDirection, setGreenDirection] = useState(0);
  const [redDirection, setRedDirection] = useState(0);
  const [shockwaveTrigger, setShockwaveTrigger] = useState(0);
  const [greenStutter, setGreenStutter] = useState(0);
  const greenGroupRef = useRef(null);
  
  // Callback to get green's group ref
  const handleGreenRef = useCallback((ref) => {
    greenGroupRef.current = ref;
  }, []);
  
  // Callback when red's animation triggers shockwave
  const handleRedAnimationLoop = useCallback(() => {
    setShockwaveTrigger(prev => prev + 1);
    
    // Check if green is close enough to get hit (within ~3 units of center/shockwave)
    if (greenGroupRef.current?.current) {
      const greenX = greenGroupRef.current.current.position.x;
      const shockwaveX = 0; // Shockwave is at center
      const distance = Math.abs(greenX - shockwaveX);
      
      // If green is within 2.5 units of the shockwave, trigger stutter
      if (distance < 2.5) {
        setGreenStutter(prev => prev + 1);
      }
    }
  }, []);
  
  // Keyboard controls
  // Green: A (left/away), D (right/toward red)
  // Red: LEFT arrow (toward green), RIGHT arrow (away)
  useEffect(() => {
    function handleKeyDown(e) {
      // Green controls (A/D)
      if (e.code === 'KeyA') {
        setGreenMoving(true);
        setGreenDirection(-1); // move left (away from red)
      }
      if (e.code === 'KeyD') {
        setGreenMoving(true);
        setGreenDirection(1); // move right (toward red)
      }
      // Red controls (Arrow keys)
      if (e.code === 'ArrowLeft') {
        setRedMoving(true);
        setRedDirection(-1); // move left (toward green)
      }
      if (e.code === 'ArrowRight') {
        setRedMoving(true);
        setRedDirection(1); // move right (away from green)
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
        
        {/* Characters - Fighting Animations */}
        <Suspense fallback={<Loader />}>
          <GreenCharacter 
            position={[-2, -1, 0]}
            color="#00ff88"
            isWalking={greenMoving}
            walkDirection={greenDirection}
            scale={0.00124}
            rotationY={Math.PI / 3}
            stutter={greenStutter}
            groupRefCallback={handleGreenRef}
          />
          <Character 
            url="./models/red_hadouken.fbx"
            position={[2, -1, 0]}
            color="#ff6b6b"
            isWalking={redMoving}
            walkDirection={redDirection}
            zDirection={0}
            scale={0.00124}
            rotationY={-Math.PI / 3}
            onAnimationLoop={handleRedAnimationLoop}
            triggerBeforeEnd={900}
          />
          
          {/* Shockwave effect for Red's hadouken - positioned in front of red, toward green */}
          <Shockwave trigger={shockwaveTrigger} position={[0, 0, 0]} />
        </Suspense>
        
        <OrbitControls />
      </Canvas>
      
      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: '#ff6b6b',
        fontFamily: 'monospace',
        fontSize: '16px',
        textShadow: '0 0 10px #ff6b6b'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>⚔️ SCENE 2: FIGHT!</h1>
        <p style={{ opacity: 0.7 }}>Fighting Animation Test</p>
        
        <div style={{ 
          marginTop: 20, 
          padding: 15, 
          background: 'rgba(0,0,0,0.6)', 
          borderRadius: 8,
          border: '1px solid #ff6b6b'
        }}>
          <p style={{ color: '#00ff88', margin: '4px 0' }}><strong>Green Controls:</strong></p>
          <p style={{ margin: '4px 0' }}>A - Move away</p>
          <p style={{ margin: '4px 0' }}>D - Move toward red</p>
          <p style={{ color: '#ff6b6b', margin: '12px 0 4px 0' }}><strong>Red Controls:</strong></p>
          <p style={{ margin: '4px 0' }}>← Arrow - Move toward green</p>
          <p style={{ margin: '4px 0' }}>→ Arrow - Move away</p>
          <p style={{ marginTop: 12, opacity: 0.7 }}>Mouse - Orbit camera</p>
        </div>
      </div>
    </div>
  );
}

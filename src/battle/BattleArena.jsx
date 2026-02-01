import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Grid, Html, useTexture } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import Scene2FightingArena from './Scene2/Scene2FightingArena';
import Scene3TrainingDojo, { CherryBlossomCanvas } from './Scene3/Scene3TrainingDojo';
import Scene4IndigoClawDojo, { IndigoClawParticlesCanvas } from './Scene4/Scene4IndigoClawDojo';
import './BattleArena.scss';

// Panoramic background for Scene 1
function Scene1PanoramicBackground() {
  const texture = useTexture('/21.png');
  
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[18, 64, 64]} />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.BackSide}
        toneMapped={false}
      />
    </mesh>
  );
}

// Animated glowing circle grid for Scene 1
function AnimatedGrid() {
  const groupRef = useRef();
  const [circles] = useState(() => {
    const arr = [];
    const gridSize = 12;    // Number of circles in each direction from center
    const spacing = 3;      // Distance between circle centers
    const maxRadius = gridSize * spacing;  // Circular boundary radius
    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        const posX = x * spacing;
        const posZ = z * spacing;
        // Only include circles within circular perimeter
        const distFromCenter = Math.sqrt(posX * posX + posZ * posZ);
        if (distFromCenter <= maxRadius) {
          arr.push({ x: posX, z: posZ, dist: distFromCenter });
        }
      }
    }
    return arr;
  });
  
  // Pulsing animation - cycles opacity between 0.4 and 0.9
  useFrame((state) => {
    if (groupRef.current) {
      const pulse = (Math.sin(state.clock.elapsedTime * 2) + 1) / 2;  // Pulse speed: * 2
      groupRef.current.children.forEach((child) => {
        if (child.material) {
          child.material.opacity = 0.4 + pulse * 0.5;  // Min opacity: 0.4, Max: 0.9
        }
      });
    }
  });
  
  return (
    <group ref={groupRef} position={[0, -0.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Circle rings */}
      {circles.map((c, i) => (
        <mesh key={i} position={[c.x, c.z, 0]}>
          {/* ringGeometry args: [innerRadius, outerRadius, segments] */}
          <ringGeometry args={[1.2, 1.4, 32]} />
          <meshBasicMaterial 
            color="#4a90ff"       // Ring color - saturated blue
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {/* Connecting lines between circles (only if neighbor exists within circle) */}
      {circles.map((c, i) => {
        const maxRadius = 12 * 3;
        const hasRightNeighbor = circles.some(n => n.x === c.x + 3 && n.z === c.z);
        const hasBottomNeighbor = circles.some(n => n.x === c.x && n.z === c.z + 3);
        return (
          <group key={`lines-${i}`}>
            {/* Horizontal line (if neighbor exists) */}
            {hasRightNeighbor && (
              <mesh position={[c.x + 1.5, c.z, 0]}>
                <planeGeometry args={[1.2, 0.08]} />  {/* width, height */}
                <meshBasicMaterial color="#4a90ff" transparent opacity={0.5} />
              </mesh>
            )}
            {/* Vertical line (if neighbor exists) */}
            {hasBottomNeighbor && (
              <mesh position={[c.x, c.z + 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
                <planeGeometry args={[1.2, 0.08]} />
                <meshBasicMaterial color="#4a90ff" transparent opacity={0.5} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

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
          metalness: 0.85,
          roughness: 0.15
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

export default function BattleArena() {
  const [currentScene, setCurrentScene] = useState(1);
  const [walking, setWalking] = useState(false);
  const [retreating, setRetreating] = useState(false);
  const [movingUp, setMovingUp] = useState(false);
  const [movingDown, setMovingDown] = useState(false);
  const [charAPos] = useState([-3, -1, 12]);
  const [charBPos] = useState([3, -1, 12]);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [sceneSelectorOpen, setSceneSelectorOpen] = useState(false);
  
  // Scene 3 controls
  const [scene3AutoAnimate, setScene3AutoAnimate] = useState(true);
  const [scene3ResetKey, setScene3ResetKey] = useState(0);
  const [greenMoving, setGreenMoving] = useState(false);
  const [greenDirection, setGreenDirection] = useState(0);
  const [redMoving, setRedMoving] = useState(false);
  const [redDirection, setRedDirection] = useState(0);
  const [blueMoving, setBlueMoving] = useState(false);
  const [blueDirection, setBlueDirection] = useState(0);
  
  // Reset positions when switching back to auto-animate
  const handleAutoAnimateChange = (enabled) => {
    setScene3AutoAnimate(enabled);
    if (enabled) {
      setScene3ResetKey(prev => prev + 1);
    }
  };
  
  useEffect(() => {
    function handleKeyDown(e) {
      // Scene 1 controls
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
      
      // Scene 3 controls (only when not in auto-animate mode)
      if (currentScene === 3 && !scene3AutoAnimate) {
        // Green cat: Q/E
        if (e.code === 'KeyQ') {
          setGreenMoving(true);
          setGreenDirection(-1);
        }
        if (e.code === 'KeyE') {
          setGreenMoving(true);
          setGreenDirection(1);
        }
        // Red cat: Arrow keys
        if (e.code === 'ArrowLeft') {
          e.preventDefault();
          setRedMoving(true);
          setRedDirection(-1);
        }
        if (e.code === 'ArrowRight') {
          e.preventDefault();
          setRedMoving(true);
          setRedDirection(1);
        }
        // Blue cat: Z/C
        if (e.code === 'KeyZ') {
          setBlueMoving(true);
          setBlueDirection(-1);
        }
        if (e.code === 'KeyC') {
          setBlueMoving(true);
          setBlueDirection(1);
        }
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
      
      // Scene 3 controls
      if (e.code === 'KeyQ' || e.code === 'KeyE') {
        setGreenMoving(false);
        setGreenDirection(0);
      }
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        setRedMoving(false);
        setRedDirection(0);
      }
      if (e.code === 'KeyZ' || e.code === 'KeyC') {
        setBlueMoving(false);
        setBlueDirection(0);
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentScene, scene3AutoAnimate]);
  
  // Scene button helper
  const getButtonClass = (sceneNum, activeColor) => {
    if (currentScene === sceneNum) {
      return `scene-btn scene-btn--${activeColor}`;
    }
    return 'scene-btn scene-btn--inactive';
  };
  
  // Scene Selector Component
  const SceneSelector = () => (
    <div className="scene-selector">
      <button 
        className={`scene-selector__toggle ${sceneSelectorOpen ? 'scene-selector__toggle--open' : ''}`}
        onClick={() => setSceneSelectorOpen(!sceneSelectorOpen)}
      >
        <span>Scene {currentScene}</span>
        <span className="scene-selector__icon">{sceneSelectorOpen ? '▲' : '▼'}</span>
      </button>
      {sceneSelectorOpen && (
        <div className="scene-selector__dropdown">
          <button 
            className={getButtonClass(1, 'blue')}
            onClick={() => { setCurrentScene(1); setSceneSelectorOpen(false); }}
          >
            Scene 1
          </button>
          <button 
            className={getButtonClass(2, 'red')}
            onClick={() => { setCurrentScene(2); setSceneSelectorOpen(false); }}
          >
            Scene 2
          </button>
          <button 
            className={getButtonClass(3, 'gold')}
            onClick={() => { setCurrentScene(3); setSceneSelectorOpen(false); }}
          >
            Scene 3
          </button>
          <button 
            className={getButtonClass(4, 'cyan')}
            onClick={() => { setCurrentScene(4); setSceneSelectorOpen(false); }}
          >
            Scene 4
          </button>
          <button 
            className="scene-btn scene-btn--back"
            onClick={() => { window.location.href = 'index.html'; }}
          >
            ← Back to Game
          </button>
        </div>
      )}
    </div>
  );

  // Scene 4 - Indigo Claw Dojo (White Cat Solo)
  if (currentScene === 4) {
    return (
      <div className="scene4__container">
        <IndigoClawParticlesCanvas />
        
        <Canvas camera={{ position: [0, 8, 15], fov: 50 }}>
          <Suspense fallback={<Loader />}>
            <Scene4IndigoClawDojo />
          </Suspense>
        </Canvas>
        
        <div className="scene4__header">
          <h1 className="scene4__title">INDIGO CLAW DOJO</h1>
          <p className="scene4__subtitle">The White Cat Awaits</p>
        </div>
        
        <div className="scene4__vignette"></div>
        
        <SceneSelector />
      </div>
    );
  }

  // Scene 2 - Fighting Arena
  if (currentScene === 2) {
    return (
      <div className="battle-arena__container">
        <Scene2FightingArena />
        <SceneSelector />
      </div>
    );
  }

  // Scene 3 - Training Dojo
  if (currentScene === 3) {
    return (
      <div className="scene3__container">
        <CherryBlossomCanvas />
        
        <Canvas camera={{ position: [0, 8, 15], fov: 50 }}>
          <Suspense fallback={<Loader />}>
            <Scene3TrainingDojo 
              autoAnimate={scene3AutoAnimate}
              greenMoving={greenMoving}
              greenDirection={greenDirection}
              redMoving={redMoving}
              redDirection={redDirection}
              blueMoving={blueMoving}
              blueDirection={blueDirection}
              resetKey={scene3ResetKey}
            />
          </Suspense>
        </Canvas>
        
        <div className="scene3__header">
          <h1 className="scene3__title">TRAINING DOJO</h1>
        </div>
        
        <div className="scene3__controls-wrapper">
          <button
            className={`scene-selector__toggle ${controlsOpen ? 'scene-selector__toggle--open' : ''}`}
            onClick={() => setControlsOpen(!controlsOpen)}
          >
            <span>Controls</span>
            <span className="scene-selector__icon">{controlsOpen ? '▲' : '▼'}</span>
          </button>
          
          {controlsOpen && (
            <div className="scene-selector__dropdown">
              <div className="scene3__mode-toggle">
                <label className="scene3__toggle-label">
                  <input
                    type="checkbox"
                    checked={scene3AutoAnimate}
                    onChange={(e) => handleAutoAnimateChange(e.target.checked)}
                  />
                  <span>Auto-Animate</span>
                </label>
              </div>
              
              {!scene3AutoAnimate && (
                <>
                  <p className="scene3__control-item scene3__control-item--green">
                    <span className="scene3__key">Q</span> / <span className="scene3__key">E</span> - Butterfly Kick (Green)
                  </p>
                  <p className="scene3__control-item scene3__control-item--red">
                    <span className="scene3__key">←</span> / <span className="scene3__key">→</span> - Kururunfa (Red)
                  </p>
                  <p className="scene3__control-item scene3__control-item--blue">
                    <span className="scene3__key">Z</span> / <span className="scene3__key">C</span> - Muay Thai (Blue)
                  </p>
                </>
              )}
              
              <p className="scene3__control-item">Mouse - Orbit camera</p>
            </div>
          )}
        </div>
        
        <SceneSelector />
      </div>
    );
  }

  // Scene 1 - Walking Cats (default)
  return (
    <div className="battle-arena__container">
      <Canvas camera={{ position: [0, 3, 28], fov: 45 }}>
        <Suspense fallback={null}>
          <Scene1PanoramicBackground />
        </Suspense>
        
        <ambientLight intensity={0.7} />
        <spotLight position={[-3, 15, 8]} intensity={80} angle={0.5} penumbra={0.8} color="#ff69b4" />
        <spotLight position={[3, 15, 8]} intensity={80} angle={0.5} penumbra={0.8} color="#ff4444" />
        <spotLight position={[-5, 12, 18]} intensity={60} angle={0.6} penumbra={0.7} color="#4169e1" />
        <spotLight position={[5, 12, 18]} intensity={60} angle={0.6} penumbra={0.7} color="#ff1493" />
        <pointLight position={[0, 10, 14]} intensity={40} color="#00bfff" distance={25} />
        <directionalLight position={[0, 20, 10]} intensity={0.6} />
        {/* Overhead lights */}
        <pointLight position={[0, 15, 12]} intensity={60} color="#ffffff" distance={30} />
        <spotLight position={[0, 20, 12]} intensity={100} angle={0.8} penumbra={1} color="#ffffff" />
        {/* Surrounding fill lights */}
        <pointLight position={[-8, 5, 12]} intensity={30} color="#ff99cc" distance={20} />
        <pointLight position={[8, 5, 12]} intensity={30} color="#99ccff" distance={20} />
        <pointLight position={[0, 5, 20]} intensity={25} color="#ffffff" distance={20} />
        {/* Character spotlights */}
        <spotLight position={[5, 10, 15]} intensity={70} angle={0.3} penumbra={0.5} color="#00ff00" />
        <spotLight position={[1, 10, 10]} intensity={70} angle={0.3} penumbra={0.5} color="#ff69b4" />
        <spotLight position={[-5, 10, 15]} intensity={70} angle={0.3} penumbra={0.5} color="#9932cc" />
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#3d5a80" opacity={0.7} transparent />
        </mesh>
        
        <AnimatedGrid />
        
        <Suspense fallback={<Loader />}>
          <Character 
            url="./models/blue_robot.fbx"
            position={charAPos}
            color="#4169e1"
            isWalking={walking || retreating || movingUp || movingDown}
            walkDirection={walking ? 1 : retreating ? -1 : 0}
            zDirection={movingUp ? -1 : movingDown ? 1 : 0}
            scale={0.00172}
            rotationY={Math.PI / 2}
          />
          <Character 
            url="./models/blue_robot.fbx"
            position={charBPos}
            color="#ff6b6b"
            isWalking={walking || retreating || movingUp || movingDown}
            walkDirection={walking ? -1 : retreating ? 1 : 0}
            zDirection={movingUp ? -1 : movingDown ? 1 : 0}
            scale={0.00172}
            rotationY={-Math.PI / 2}
          />
        </Suspense>
        
        <OrbitControls target={[0, 0, 0]} />
      </Canvas>
      
      <div className="battle-arena__header">
        <h1 className="battle-arena__title">DANCE BATTLE</h1>
      </div>
      
      <div className="battle-arena__controls-wrapper">
        <button
          className={`battle-arena__controls-toggle ${controlsOpen ? 'battle-arena__controls-toggle--open' : 'battle-arena__controls-toggle--closed'}`}
          onClick={() => setControlsOpen(!controlsOpen)}
        >
          <span>Controls</span>
          <span className="battle-arena__toggle-icon">{controlsOpen ? '▲' : '▼'}</span>
        </button>
        
        {controlsOpen && (
          <div className="battle-arena__controls-content">
            <p className="battle-arena__control-item">SPACE - Walk toward each other</p>
            <p className="battle-arena__control-item">⌘ CMD - Walk away from each other</p>
            <p className="battle-arena__control-item">D - Walk up (into screen)</p>
            <p className="battle-arena__control-item">⌥ OPT - Walk down (toward camera)</p>
            <p className="battle-arena__control-item">Mouse - Orbit camera</p>
          </div>
        )}
      </div>
      
      <SceneSelector />
    </div>
  );
}

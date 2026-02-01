import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Html, Grid, OrbitControls, useTexture } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import * as THREE from 'three';
import './Scene3.scss';

// Cherry Blossom Petals Canvas overlay
export function CherryBlossomCanvas() {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Petal class
    class Petal {
      constructor() {
        this.reset(true);
      }
      
      reset(initial = false) {
        this.x = Math.random() * (width + 200) - 100;
        this.y = initial ? Math.random() * height : -20;
        this.size = Math.random() * 8 + 4;
        this.speedX = Math.random() * 1.5 - 0.5;
        this.speedY = Math.random() * 1 + 0.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.oscillationSpeed = Math.random() * 0.02 + 0.01;
        this.oscillationDistance = Math.random() * 30 + 10;
        this.time = Math.random() * Math.PI * 2;
        // Pink color variations - mix of soft and vibrant pinks
        const pinkType = Math.random();
        let pinkHue, saturation, lightness;
        
        if (pinkType < 0.4) {
          // Vibrant hot pink
          pinkHue = Math.random() * 15 + 330; // 330-345
          saturation = Math.random() * 20 + 80; // 80-100%
          lightness = Math.random() * 15 + 55; // 55-70%
        } else if (pinkType < 0.7) {
          // Medium pink
          pinkHue = Math.random() * 20 + 340; // 340-360
          saturation = Math.random() * 25 + 70; // 70-95%
          lightness = Math.random() * 15 + 65; // 65-80%
        } else {
          // Soft pale pink
          pinkHue = Math.random() * 20 + 345; // 345-365
          saturation = Math.random() * 30 + 50; // 50-80%
          lightness = Math.random() * 15 + 80; // 80-95%
        }
        
        this.color = `hsl(${pinkHue}, ${saturation}%, ${lightness}%)`;
        this.opacity = Math.random() * 0.3 + 0.7;
      }
      
      update() {
        this.time += this.oscillationSpeed;
        this.x += this.speedX + Math.sin(this.time) * 0.5;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        
        // Reset when off screen
        if (this.y > height + 20 || this.x < -50 || this.x > width + 50) {
          this.reset();
        }
      }
      
      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        
        // Draw petal shape (elongated ellipse with pointed ends)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.bezierCurveTo(
          this.size * 0.5, -this.size * 0.3,
          this.size * 0.5, this.size * 0.3,
          0, this.size
        );
        ctx.bezierCurveTo(
          -this.size * 0.5, this.size * 0.3,
          -this.size * 0.5, -this.size * 0.3,
          0, -this.size
        );
        ctx.fill();
        
        // Add subtle highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.15, -this.size * 0.2, this.size * 0.15, this.size * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }
    
    // Create petals
    const petals = [];
    const petalCount = 60;
    for (let i = 0; i < petalCount; i++) {
      petals.push(new Petal());
    }
    
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      petals.forEach(petal => {
        petal.update();
        petal.draw(ctx);
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      width={1400}
      height={800}
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 100
      }}
    />
  );
}

// Animated gradient ring component
function GradientRing() {
  const materialRef = useRef();
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
      <ringGeometry args={[8.45, 8.6, 64]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          time: { value: 0 }
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          varying vec2 vUv;
          void main() {
            float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
            float hue = mod((angle + 3.14159) / (2.0 * 3.14159) + time * 0.2, 1.0);
            
            vec3 color;
            float h = hue * 6.0;
            float c = 1.0;
            float x = c * (1.0 - abs(mod(h, 2.0) - 1.0));
            
            if (h < 1.0) color = vec3(c, x, 0.0);
            else if (h < 2.0) color = vec3(x, c, 0.0);
            else if (h < 3.0) color = vec3(0.0, c, x);
            else if (h < 4.0) color = vec3(0.0, x, c);
            else if (h < 5.0) color = vec3(x, 0.0, c);
            else color = vec3(c, 0.0, x);
            
            gl_FragColor = vec4(color * 2.0, 1.0);
          }
        `}
        toneMapped={false}
      />
    </mesh>
  );
}

// Panoramic background sphere
function PanoramicBackground() {
  const texture = useTexture('/models/bg/Colors-4.8.1 copy.png');
  
  // Configure texture for spherical mapping
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[400, 64, 64]} />
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
  autoAnimate = true,
  scale = MODEL_SCALE,
  resetKey = 0
}) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const actionRef = useRef();
  
  const fbx = useLoader(FBXLoader, modelPath);
  
  const clonedModel = useMemo(() => {
    const clone = SkeletonUtils.clone(fbx);
    clone.scale.setScalar(scale);
    return clone;
  }, [fbx, scale]);
  
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
  
  // Reset position when resetKey changes (when switching back to auto-animate)
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
    }
  }, [resetKey, position]);
  
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
      {/* Dojo mat */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[8.5, 8.5, 0.06, 64]} />
        <meshStandardMaterial 
          color="#8B4513" 
          opacity={0.9} 
          transparent 
        />
      </mesh>
      {/* Glowing animated gradient border ring */}
      <GradientRing />
    </>
  );
}

function CenterMarker() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <ringGeometry args={[0.6, 1, 32]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

// Japanese lantern component
function JapaneseLantern({ position }) {
  const lightRef = useRef();
  const bodyRef = useRef();
  const flameRef = useRef();
  
  // Gentle flicker effect like candlelight
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const flicker = Math.sin(time * 2) * 0.15 + 
                    Math.sin(time * 5) * 0.08 +
                    Math.sin(time * 11) * 0.05;
    
    // Pulsing light intensity
    if (lightRef.current) {
      lightRef.current.intensity = 4 + flicker * 2;
    }
    
    // Pulsing emissive glow on lantern body
    if (bodyRef.current) {
      bodyRef.current.emissiveIntensity = 1.2 + flicker;
    }
    
    // Pulsing flame in center
    if (flameRef.current) {
      flameRef.current.emissiveIntensity = 2 + flicker * 1.5;
      const scale = 1 + flicker * 0.2;
      flameRef.current.scale = scale;
    }
  });
  
  return (
    <group position={position}>
      {/* Hanging rope */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
        <meshStandardMaterial color="#3d2817" />
      </mesh>
      
      {/* Top cap */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 0.1, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Inner flame/candle glow - bright yellow */}
      <mesh position={[0, -0.35, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          ref={flameRef}
          color="#ffdd00"
          emissive="#ffaa00"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      
      {/* Lantern body - paper with inner glow */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.6, 8]} />
        <meshStandardMaterial 
          ref={bodyRef}
          color="#fffaf0" 
          emissive="#fffaf0"
          emissiveIntensity={1.2}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      
      {/* Decorative bands */}
      <mesh position={[0, -0.1, 0]}>
        <torusGeometry args={[0.36, 0.02, 8, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, -0.6, 0]}>
        <torusGeometry args={[0.36, 0.02, 8, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Bottom cap */}
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.25, 0.15, 0.1, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Inner point light - the "candle" */}
      <pointLight 
        ref={lightRef}
        position={[0, -0.35, 0]} 
        color="#fffaf0" 
        intensity={4} 
        distance={15}
        decay={2}
      />
    </group>
  );
}

// Training pole component with bamboo-like rings
function TrainingPole({ position }) {
  return (
    <group position={position}>
      {/* Main pole */}
      <mesh position={[0, 2.25, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 4.5, 16]} />
        <meshStandardMaterial 
          color="#c4a574" 
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      
      {/* Bamboo rings/segments */}
      {[0.5, 1.2, 1.9, 2.6, 3.3, 4.0].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.16, 0.02, 8, 16]} />
          <meshStandardMaterial color="#a08050" roughness={0.7} />
        </mesh>
      ))}
      
      {/* Top cap - lantern mount */}
      <mesh position={[0, 4.55, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 0.15, 16]} />
        <meshStandardMaterial 
          color="#8b7355" 
          roughness={0.5}
          metalness={0.15}
        />
      </mesh>
      {/* Lantern hanging from top */}
      <JapaneseLantern position={[0, 4.9, 0]} />
      {/* Base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.1, 16]} />
        <meshStandardMaterial 
          color="#6b5344" 
          roughness={0.8}
          metalness={0.05}
        />
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
  blueDirection = 0,
  resetKey = 0
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
      <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
      <directionalLight position={[-5, 10, -5]} intensity={0.5} />
      
      <DojoMat />
      <CenterMarker />
      
      {/* Training poles in equilateral triangle formation */}
      <TrainingPole position={[0, 0, -7.5]} />       {/* 12 o'clock (north) */}
      <TrainingPole position={[-6.5, 0, 3.75]} />    {/* 8 o'clock (southwest) */}
      <TrainingPole position={[6.5, 0, 3.75]} />     {/* 4 o'clock (southeast) */}
      
      <Grid 
        args={[60, 60]} 
        cellSize={1} 
        cellColor="#00ffff" 
        sectionColor="#ff00ff"
        sectionThickness={1.5}
        fadeDistance={60}
        fadeStrength={4}
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
        resetKey={resetKey}
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
        scale={0.00137}
        resetKey={resetKey}
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
        resetKey={resetKey}
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

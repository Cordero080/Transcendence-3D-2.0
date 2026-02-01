import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Grid, OrbitControls, useTexture } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import * as THREE from 'three';
import './Scene4.scss';

// Floating particles - indigo blue/cyan specks
export function IndigoClawParticlesCanvas() {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Particle class - slow floating specks
    class Particle {
      constructor() {
        this.reset(true);
      }
      
      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 20;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = -(Math.random() * 0.5 + 0.2); // Float upward
        this.opacity = Math.random() * 0.6 + 0.2;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        
        // Blue/cyan color variations
        const colorType = Math.random();
        if (colorType < 0.5) {
          // Deep blue
          this.color = `rgba(0, ${Math.floor(100 + Math.random() * 50)}, ${Math.floor(200 + Math.random() * 55)}, `;
        } else if (colorType < 0.8) {
          // Cyan
          this.color = `rgba(0, ${Math.floor(200 + Math.random() * 55)}, ${Math.floor(220 + Math.random() * 35)}, `;
        } else {
          // White-blue
          this.color = `rgba(${Math.floor(150 + Math.random() * 50)}, ${Math.floor(200 + Math.random() * 55)}, 255, `;
        }
      }
      
      update() {
        this.pulse += this.pulseSpeed;
        this.x += this.speedX + Math.sin(this.pulse) * 0.2;
        this.y += this.speedY;
        
        // Reset when off screen
        if (this.y < -20 || this.x < -20 || this.x > width + 20) {
          this.reset();
        }
      }
      
      draw(ctx) {
        const pulseOpacity = this.opacity * (0.7 + Math.sin(this.pulse) * 0.3);
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color + '1)';
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + pulseOpacity + ')';
        ctx.fill();
        
        ctx.shadowBlur = 0;
      }
    }
    
    // Create particles
    const particles = [];
    const particleCount = 40;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
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

// Indigo pulsing gradient ring - blue/cyan theme
function IndigoClawGradientRing() {
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
            float t = mod((angle + 3.14159) / (2.0 * 3.14159) + time * 0.15, 1.0);
            
            // Blue to cyan gradient with pulse
            float pulse = sin(time * 2.0) * 0.2 + 0.8;
            
            vec3 deepBlue = vec3(0.0, 0.2, 0.6);
            vec3 cyan = vec3(0.0, 0.8, 1.0);
            vec3 darkBlue = vec3(0.0, 0.1, 0.3);
            
            vec3 color;
            if (t < 0.33) {
              color = mix(deepBlue, cyan, t * 3.0);
            } else if (t < 0.66) {
              color = mix(cyan, darkBlue, (t - 0.33) * 3.0);
            } else {
              color = mix(darkBlue, deepBlue, (t - 0.66) * 3.0);
            }
            
            gl_FragColor = vec4(color * pulse * 1.5, 1.0);
          }
        `}
        toneMapped={false}
      />
    </mesh>
  );
}

// Dark panoramic background
function IndigoClawBackground() {
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[400, 64, 64]} />
      <meshBasicMaterial 
        color="#050510"
        side={THREE.BackSide}
      />
    </mesh>
  );
}

const MODEL_SCALE = 0.00124;

function WhiteCat({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = MODEL_SCALE
}) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const actionRef = useRef();
  
  // Use the white cat idle model
  const fbx = useLoader(FBXLoader, '/models/slow-white-qi.fbx');
  
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
  
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });
  
  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <primitive object={clonedModel} />
    </group>
  );
}

function IndigoClawDojoMat() {
  return (
    <>
      {/* Deep dark floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#020208" 
          opacity={0.8} 
          transparent 
        />
      </mesh>
      {/* Dark dojo mat with blue tint */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[8.5, 8.5, 0.06, 64]} />
        <meshStandardMaterial 
          color="#0a1525" 
          opacity={0.95} 
          transparent 
        />
      </mesh>
      {/* Glowing animated gradient border ring */}
      <IndigoClawGradientRing />
    </>
  );
}

function IndigoClawCenterMarker() {
  const ringRef = useRef();
  
  useFrame((state) => {
    if (ringRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
      ringRef.current.material.emissiveIntensity = pulse;
    }
  });
  
  return (
    <group>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <ringGeometry args={[0.6, 1, 32]} />
        <meshStandardMaterial 
          color="#00aaff" 
          emissive="#0066ff"
          emissiveIntensity={0.7}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial color="#050510" />
      </mesh>
    </group>
  );
}

// Indigo blue lantern component
function IndigoClawLantern({ position }) {
  const lightRef = useRef();
  const bodyRef = useRef();
  const flameRef = useRef();
  
  // Slow, eerie flicker effect
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const flicker = Math.sin(time * 1.5) * 0.2 + 
                    Math.sin(time * 3) * 0.1 +
                    Math.sin(time * 7) * 0.05;
    
    // Pulsing light intensity
    if (lightRef.current) {
      lightRef.current.intensity = 3 + flicker * 2;
    }
    
    // Pulsing emissive glow on lantern body
    if (bodyRef.current) {
      bodyRef.current.emissiveIntensity = 1 + flicker;
    }
    
    // Pulsing flame in center
    if (flameRef.current) {
      flameRef.current.emissiveIntensity = 1.5 + flicker * 1.5;
    }
  });
  
  return (
    <group position={position}>
      {/* Hanging rope */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
        <meshStandardMaterial color="#1a1a2a" />
      </mesh>
      
      {/* Top cap */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 0.1, 8]} />
        <meshStandardMaterial color="#0a0a15" metalness={0.4} roughness={0.6} />
      </mesh>
      
      {/* Inner flame/candle glow - blue */}
      <mesh position={[0, -0.35, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          ref={flameRef}
          color="#00ccff"
          emissive="#0088ff"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      
      {/* Lantern body - dark with blue glow */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.6, 8]} />
        <meshStandardMaterial 
          ref={bodyRef}
          color="#1a2a3a" 
          emissive="#0066aa"
          emissiveIntensity={1}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      
      {/* Decorative bands */}
      <mesh position={[0, -0.1, 0]}>
        <torusGeometry args={[0.36, 0.02, 8, 16]} />
        <meshStandardMaterial color="#0a0a15" />
      </mesh>
      <mesh position={[0, -0.6, 0]}>
        <torusGeometry args={[0.36, 0.02, 8, 16]} />
        <meshStandardMaterial color="#0a0a15" />
      </mesh>
      
      {/* Bottom cap */}
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.25, 0.15, 0.1, 8]} />
        <meshStandardMaterial color="#0a0a15" metalness={0.4} roughness={0.6} />
      </mesh>
      
      {/* Inner point light - blue glow */}
      <pointLight 
        ref={lightRef}
        position={[0, -0.35, 0]} 
        color="#00aaff" 
        intensity={3} 
        distance={12}
        decay={2}
      />
    </group>
  );
}

// Dark training pole with blue accents
function IndigoClawTrainingPole({ position }) {
  return (
    <group position={position}>
      {/* Main pole - dark wood */}
      <mesh position={[0, 2.25, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 4.5, 16]} />
        <meshStandardMaterial 
          color="#1a1a25" 
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
      
      {/* Bamboo rings/segments - subtle blue tint */}
      {[0.5, 1.2, 1.9, 2.6, 3.3, 4.0].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.16, 0.02, 8, 16]} />
          <meshStandardMaterial color="#253040" roughness={0.6} />
        </mesh>
      ))}
      
      {/* Top cap */}
      <mesh position={[0, 4.55, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 0.15, 16]} />
        <meshStandardMaterial 
          color="#15202a" 
          roughness={0.5}
          metalness={0.25}
        />
      </mesh>
      {/* Indigo lantern hanging from top */}
      <IndigoClawLantern position={[0, 4.9, 0]} />
      {/* Base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.1, 16]} />
        <meshStandardMaterial 
          color="#0a1520" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

export default function Scene4IndigoClawDojo() {
  return (
    <>
      <IndigoClawBackground />
      
      {/* Dim, cold lighting */}
      <ambientLight intensity={0.15} color="#0a1525" />
      <directionalLight position={[5, 10, 5]} intensity={0.5} color="#0066aa" castShadow />
      <directionalLight position={[-5, 10, -5]} intensity={0.3} color="#003366" />
      
      {/* Main blue spotlight from above */}
      <spotLight 
        position={[0, 12, 0]} 
        intensity={100} 
        angle={0.4} 
        penumbra={0.8} 
        color="#00aaff" 
        castShadow
        target-position={[0, 0, 0]}
      />
      
      {/* Blue light - front left */}
      <spotLight 
        position={[-5, 6, 4]} 
        intensity={40} 
        angle={0.5} 
        penumbra={0.7} 
        color="#0088dd" 
      />
      
      {/* Blue light - front right */}
      <spotLight 
        position={[5, 5, 3]} 
        intensity={30} 
        angle={0.5} 
        penumbra={0.7} 
        color="#00ccff" 
      />
      
      {/* Rim light from behind - blue */}
      <pointLight position={[0, 3, -4]} intensity={5} color="#0066ff" distance={12} />
      
      <IndigoClawDojoMat />
      <IndigoClawCenterMarker />
      
      {/* Training poles in equilateral triangle formation */}
      <IndigoClawTrainingPole position={[0, 0, -7.5]} />
      <IndigoClawTrainingPole position={[-6.5, 0, 3.75]} />
      <IndigoClawTrainingPole position={[6.5, 0, 3.75]} />
      
      {/* Dark grid with blue/cyan colors */}
      <Grid 
        args={[60, 60]} 
        cellSize={1} 
        cellColor="#003355" 
        sectionColor="#0088aa"
        sectionThickness={1.5}
        fadeDistance={60}
        fadeStrength={4}
        position={[0, 0, 0]}
      />
      
      {/* Single white cat in the center */}
      <WhiteCat
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={0.00186}
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

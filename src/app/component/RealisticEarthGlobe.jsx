"use client";

// RealisticEarthGlobe.jsx - Ultra-realistic Earth with day/night cycle and city lights
// Using high-quality textures from NASA and other sources for photorealistic rendering

import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useLoader, extend } from '@react-three/fiber'
import { OrbitControls, Stars, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Local texture paths - using your actual files in public folder
const TEXTURE_URLS = {
  // Earth surface day map (8K resolution)
  day: '/8k_earth_daymap.jpg',
  // City lights at night
  night: '/earth_lights_2048.png',
  // Cloud coverage (8K resolution)
  clouds: '/8k_earth_clouds.jpg',
  // Normal map for terrain elevation (using day map as fallback if not available)
  normal: '/8k_earth_daymap.jpg',
  // Specular map for water reflection
  specular: '/earth_specular_2048.jpg'
};

// Custom shader for Earth with day/night transition
const EarthShaderMaterial = shaderMaterial(
  {
    dayTexture: null,
    nightTexture: null,
    cloudsTexture: null,
    normalTexture: null,
    specularTexture: null,
    sunDirection: new THREE.Vector3(1, 0, 0),
    time: 0
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment shader
  `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform sampler2D cloudsTexture;
    uniform sampler2D normalTexture;
    uniform sampler2D specularTexture;
    uniform vec3 sunDirection;
    uniform float time;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    
    void main() {
      // Sample all textures
      vec3 dayColor = texture2D(dayTexture, vUv).rgb;
      vec3 nightColor = texture2D(nightTexture, vUv).rgb;
      float clouds = texture2D(cloudsTexture, vUv).r;
      vec3 normalMap = texture2D(normalTexture, vUv).xyz * 2.0 - 1.0;
      float specular = texture2D(specularTexture, vUv).r;
      
      // Calculate normal with normal map
      vec3 normal = normalize(vNormal + normalMap * 0.3);
      
      // Sun lighting calculation
      float sunLight = dot(normal, sunDirection);
      
      // Smooth day/night transition
      float dayAmount = smoothstep(-0.4, 0.4, sunLight);
      float nightAmount = 1.0 - dayAmount;
      
      // Mix day and night textures
      vec3 color = dayColor * dayAmount;
      
      // Add city lights on night side with golden glow
      color += nightColor * nightAmount * 3.0 * vec3(1.0, 0.85, 0.4);
      
      // Add clouds (brighter on day side)
      color = mix(color, vec3(1.0), clouds * 0.6 * dayAmount);
      
      // Add specular highlights for water
      if(specular > 0.5 && sunLight > 0.0) {
        vec3 viewDir = normalize(vViewPosition);
        vec3 reflectDir = reflect(-sunDirection, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 20.0);
        color += vec3(0.4, 0.5, 0.7) * spec * specular * dayAmount;
      }
      
      // Add subtle rim lighting for atmosphere (much reduced)
      float rim = 1.0 - dot(normalize(vViewPosition), normal);
      rim = pow(rim, 3.0);
      color += vec3(0.1, 0.2, 0.3) * rim * 0.15;
      
      // Twilight zone enhancement (subtle)
      float twilight = 1.0 - abs(sunLight);
      twilight = pow(twilight, 4.0);
      color += vec3(1.0, 0.5, 0.2) * twilight * 0.1;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ EarthShaderMaterial });

// Atmosphere shader for the blue glow - MUCH MORE SUBTLE
const AtmosphereShaderMaterial = shaderMaterial(
  {
    sunDirection: new THREE.Vector3(1, 0, 0)
  },
  // Vertex shader
  `
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vPosition = mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment shader - REDUCED INTENSITY
  `
    uniform vec3 sunDirection;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vec3 viewDirection = normalize(-vPosition);
      
      // Much sharper falloff for thinner atmosphere
      float intensity = pow(0.65 - dot(vNormal, viewDirection), 4.0);
      
      // Subtle blue atmosphere with much lower intensity
      vec3 atmosphereColor = vec3(0.3, 0.6, 1.0);
      float sunInfluence = dot(vNormal, sunDirection) * 0.5 + 0.5;
      atmosphereColor = mix(atmosphereColor, vec3(0.8, 0.9, 1.0), sunInfluence * 0.2);
      
      // Much lower alpha for subtle effect
      gl_FragColor = vec4(atmosphereColor * intensity * 0.3, intensity * 0.2);
    }
  `
);

extend({ AtmosphereShaderMaterial });

// Main Earth component
function Earth() {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const atmosphereRef = useRef();
  // Fixed sun position at the top (not rotating)
  const sunDirection = useRef(new THREE.Vector3(0, 1, 0.3).normalize());
  
  // Load textures with simpler approach
  const [textures, setTextures] = useState({});
  
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    // Load all textures from local files
    Promise.all([
      loader.loadAsync(TEXTURE_URLS.day),
      loader.loadAsync(TEXTURE_URLS.night),
      loader.loadAsync(TEXTURE_URLS.clouds),
      loader.loadAsync(TEXTURE_URLS.normal),
      loader.loadAsync(TEXTURE_URLS.specular)
    ]).then(([day, night, clouds, normal, specular]) => {
      setTextures({ day, night, clouds, normal, specular });
    }).catch(err => {
      console.error('Error loading textures:', err);
    });
  }, []);
  
  // Create shader uniforms
  const earthUniforms = useMemo(() => ({
    dayTexture: { value: textures.day || null },
    nightTexture: { value: textures.night || null },
    cloudsTexture: { value: textures.clouds || null },
    normalTexture: { value: textures.normal || null },
    specularTexture: { value: textures.specular || null },
    sunDirection: { value: sunDirection.current },
    time: { value: 0 }
  }), [textures]);
  
  const atmosphereUniforms = useMemo(() => ({
    sunDirection: { value: sunDirection.current }
  }), []);
  
  // Animation
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Rotate Earth slowly
    if (earthRef.current) {
      earthRef.current.rotation.y = time * 0.03;
    }
    
    // Rotate clouds independently
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = time * 0.035;
    }
    
    // Sun position is now fixed at the top - no rotation
    // This creates a stable lighting like in Protocol Labs image
    
    // Update shader uniforms (sun direction stays constant)
    if (earthRef.current?.material) {
      earthRef.current.material.uniforms.sunDirection.value = sunDirection.current;
      earthRef.current.material.uniforms.time.value = time;
    }
    
    if (atmosphereRef.current?.material) {
      atmosphereRef.current.material.uniforms.sunDirection.value = sunDirection.current;
    }
  });
  
  if (!textures.day) {
    // Loading state
    return (
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#1e3a5f" wireframe />
      </mesh>
    );
  }
  
  return (
    <group>
      {/* Main Earth sphere with custom shader */}
      <mesh ref={earthRef} rotation={[Math.PI / 180 * 25, Math.PI / 180 * -15, Math.PI / 180 * 23.5]}>
        <sphereGeometry args={[2.5, 128, 128]} />
        <earthShaderMaterial
          dayTexture={textures.day}
          nightTexture={textures.night}
          cloudsTexture={textures.clouds}
          normalTexture={textures.normal}
          specularTexture={textures.specular}
          sunDirection={sunDirection.current}
        />
      </mesh>
      
      {/* Cloud layer */}
      <mesh ref={cloudsRef} rotation={[0, 0, Math.PI / 180 * 23.5]}>
        <sphereGeometry args={[2.51, 128, 128]} />
        <meshPhongMaterial
          map={textures.clouds}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
      
      {/* Atmosphere - MUCH THINNER AND SUBTLER */}
      <mesh ref={atmosphereRef} scale={[1.03, 1.03, 1.03]}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <atmosphereShaderMaterial
          sunDirection={sunDirection.current}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// Scene component
function EarthScene() {
  return (
    <>
      {/* Minimal ambient light */}
      <ambientLight intensity={0.03} />
      
      {/* Main directional light (sun) - positioned at the top */}
      <directionalLight
        position={[0, 10, 3]}
        intensity={2}
        color="#ffffff"
      />
      
      {/* Subtle fill light from below */}
      <directionalLight
        position={[0, -5, 2]}
        intensity={0.1}
        color="#4080ff"
      />
      
      {/* Stars background */}
      <Stars
        radius={300}
        depth={50}
        count={7000}
        factor={4}
        saturation={0}
        fade
      />
      
      {/* Earth */}
      <Suspense fallback={null}>
        <Earth />
      </Suspense>
      
      {/* Camera controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        maxPolarAngle={Math.PI * 0.9}
        minPolarAngle={Math.PI * 0.1}
        autoRotate={false}
        zoomSpeed={0.6}
        rotateSpeed={0.4}
      />
    </>
  );
}

// Canvas wrapper
export function EarthGlobeCanvas() {
  return (
    <Canvas
      camera={{ 
        position: [0, 0, 7], 
        fov: 50,
        near: 0.1,
        far: 1000
      }}
      gl={{ 
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        outputColorSpace: THREE.SRGBColorSpace,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1
      }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#000']} />
      <EarthScene />
    </Canvas>
  );
}

// Main hero component - Now as a section instead of full screen
export default function RealisticEarthHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full h-screen bg-black overflow-hidden">
      {/* Earth Globe */}
      <div className="absolute inset-0">
        {!mounted ? (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-blue-400/40 text-xs tracking-widest uppercase">Loading Earth</p>
            </div>
          </div>
        ) : (
          <EarthGlobeCanvas />
        )}
      </div>
      
      {/* Optional: Add subtle vignette for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 100%)'
        }} />
      </div>
      
      {/* Optional: Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
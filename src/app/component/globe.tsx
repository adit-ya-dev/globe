"use client";

// HeroGlobe.jsx (fixed for Next.js hydration)
// React component for Next.js hero section using @react-three/fiber + @react-three/drei
// ---------------------------
// Fix for hydration error:
// 1. Removed ClientOnly wrapper which was causing hydration mismatch
// 2. Split the component into a separate GlobeCanvas component
// 3. Use dynamic import in the parent component/page with ssr: false
// 4. Added proper mounting state management to prevent hydration issues
// ---------------------------

import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Line, Stars } from '@react-three/drei'

// Small SVG icons (whatsapp, instagram, linkedin, file) as React components to avoid external assets
const WhatsAppSVG = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5a9.5 9.5 0 1 0-2.6 6.1L21 21l-1.9-5.6A9.4 9.4 0 0 0 21 11.5z" fill="#25D366"/>
  </svg>
)
const InstagramSVG = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="5" fill="#E1306C"/>
  </svg>
)
const LinkedInSVG = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#0A66C2"/>
  </svg>
)
const FileSVG = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="3" width="14" height="18" rx="2" fill="#FFB100"/>
  </svg>
)

// Utility: generate n points on unit sphere (Fibonacci sphere)
function fibonacciSphere(samples = 12) {
  const pts = []
  const offset = 2 / samples
  const increment = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < samples; i++) {
    const y = i * offset - 1 + offset / 2
    const r = Math.sqrt(1 - y * y)
    const phi = i * increment
    const x = Math.cos(phi) * r
    const z = Math.sin(phi) * r
    pts.push([x, y, z])
  }
  return pts
}

function NodesAndLines({ radius = 1.6, nodes = 8 }) {
  const group = useRef()
  const positions = useMemo(() => fibonacciSphere(nodes), [nodes])
  const [hovered, setHovered] = useState(null)

  // animate the nodes slightly
  useFrame((state, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * 0.08
    group.current.rotation.x += Math.sin(state.clock.elapsedTime * 0.2) * 0.0005
  })

  return (
    <group ref={group}>
      {positions.map((p, i) => {
        const pos = [p[0] * radius, p[1] * radius, p[2] * radius]
        const isHovered = hovered === i
        return (
          <group key={i} position={pos}>
            {/* small glowing sphere */}
            <mesh
              onPointerOver={(e) => { e.stopPropagation(); setHovered(i) }}
              onPointerOut={(e) => { e.stopPropagation(); setHovered(null) }}
            >
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial emissive={isHovered ? '#ffd166' : '#7bd389'} roughness={0.2} metalness={0.1} />
            </mesh>

            {/* connecting line back to a center point on globe surface for visual "agent connection" */}
            <Line 
              points={[[0, 0, 0], pos]} 
              color="#7bd389" 
              lineWidth={1} 
              dashed={false} 
            />

            {/* label using Html from drei */}
            <Html distanceFactor={6} center>
              <div className={`pointer-events-none transform -translate-x-1/2 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} transition-all duration-200`} style={{ width: 120 }}>
                <div className="bg-white/90 text-slate-800 text-xs rounded-lg p-2 shadow-lg flex items-center gap-2">
                  {i % 4 === 0 && <WhatsAppSVG size={28} />}
                  {i % 4 === 1 && <InstagramSVG size={28} />}
                  {i % 4 === 2 && <LinkedInSVG size={28} />}
                  {i % 4 === 3 && <FileSVG size={28} />}
                  <div className="text-[12px] leading-tight">
                    <div className="font-semibold">Agent {i + 1}</div>
                    <div className="text-[11px] text-slate-600">Active — {Math.floor(Math.random() * 99)} users</div>
                  </div>
                </div>
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

function Globe({ radius = 1.5 }) {
  const ref = useRef()
  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.03
  })

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial roughness={0.6} metalness={0.2} color={'#0f172a'} emissive={'#041024'} emissiveIntensity={0.1} />
      </mesh>

      {/* subtle wireframe overlay as a sibling mesh (safer than nesting) */}
      <mesh>
        <sphereGeometry args={[radius + 0.002, 32, 32]} />
        <meshBasicMaterial wireframe transparent opacity={0.06} toneMapped={false} />
      </mesh>
    </group>
  )
}

// Separate the Canvas into its own component that will be dynamically imported
export function GlobeCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />

      <Stars radius={10} depth={20} count={200} factor={4} saturation={0} fade />

      <Globe />
      <NodesAndLines nodes={10} radius={1.7} />

      <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 1.5} />
    </Canvas>
  )
}

export default function HeroGlobe() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="w-full min-h-[560px] flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <div className="container mx-auto px-6 lg:px-12 py-10 flex flex-col lg:flex-row items-center gap-8">
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">Connect to smart agents around the world</h1>
          <p className="mt-4 text-slate-300 max-w-xl">A visual network of tools — WhatsApp, Instagram, LinkedIn, PDFs and sheets — accessible instantly. Hover nodes to see activity.</p>
          <div className="mt-6 flex items-center gap-3 justify-center lg:justify-start">
            <button className="px-5 py-3 bg-white text-slate-900 rounded-lg font-semibold shadow">Get started</button>
            <button className="px-5 py-3 border border-white/20 text-white rounded-lg">Documentation</button>
          </div>
        </div>

        <div className="w-full lg:w-1/2 h-[420px] rounded-2xl bg-transparent flex items-center justify-center">
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
            {/* Show placeholder until mounted to prevent hydration mismatch */}
            {!mounted ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-900/50 text-white">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-sm opacity-75">Loading 3D Globe...</p>
                </div>
              </div>
            ) : (
              <GlobeCanvas />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/*
--- Usage in Next.js App Directory ---
If you're importing this component in a page or parent component, use dynamic import:

// app/page.js or wherever you're using HeroGlobe
import dynamic from 'next/dynamic'

const HeroGlobe = dynamic(
  () => import('./components/HeroGlobe'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[560px] flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="text-white">Loading...</div>
      </div>
    )
  }
)

export default function Page() {
  return (
    <main>
      <HeroGlobe />
    </main>
  )
}

--- Alternative: Direct usage without dynamic import ---
If you want to use this component directly without dynamic import,
the mounted state approach above will prevent hydration errors by ensuring
the Canvas only renders after the component has mounted on the client.
*/
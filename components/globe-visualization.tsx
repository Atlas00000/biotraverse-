"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Stars, Text, Html } from "@react-three/drei"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, Maximize2, Minimize2 } from "lucide-react"
import type { AnimalMovement, Species } from "@/types/migration"
import { processMovementPaths, interpolatePath } from "@/utils/geospatial"

interface GlobeVisualizationProps {
  movements: AnimalMovement[]
  selectedSpecies: Species[]
  currentTime: number
  timeRange: { start: number; end: number }
  isPlaying: boolean
  loading: boolean
}

// Convert lat/lon to 3D coordinates on sphere
function latLonToVector3(lat: number, lon: number, radius = 5): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

// Earth Globe Component
function EarthGlobe() {
  const meshRef = useRef<THREE.Mesh>(null)
  const textureLoader = new THREE.TextureLoader()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[5, 64, 64]} />
      <meshPhongMaterial map={textureLoader.load("/assets/3d/texture_earth.jpg")} bumpScale={0.05} shininess={100} />
    </mesh>
  )
}

// Migration Path Component
function MigrationPath({
  coordinates,
  species,
  currentTime,
  isActive,
}: {
  coordinates: [number, number][]
  species: Species
  currentTime: number
  isActive: boolean
}) {
  const pathRef = useRef<THREE.Group>(null)
  const [points, setPoints] = useState<THREE.Vector3[]>([])

  useEffect(() => {
    const path3D = coordinates.map(([lon, lat]) => latLonToVector3(lat, lon, 5.1))
    setPoints(path3D)
  }, [coordinates])

  useFrame(() => {
    if (pathRef.current && isActive) {
      // Animate path visibility based on current time
      const visiblePoints = Math.floor((currentTime / 100) * points.length)
      pathRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          child.visible = index <= visiblePoints
          if (index === visiblePoints) {
            // Pulse effect for current position
            const scale = 1 + Math.sin(Date.now() * 0.01) * 0.3
            child.scale.setScalar(scale)
          }
        }
      })
    }
  })

  if (points.length === 0) return null

  return (
    <group ref={pathRef}>
      {/* Path line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={species.color} linewidth={3} transparent opacity={0.8} />
      </line>

      {/* Path points */}
      {points.map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={species.color} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Current position indicator */}
      {isActive && (
        <mesh
          position={
            interpolatePath(coordinates, currentTime / 100)
              ? latLonToVector3(
                  interpolatePath(coordinates, currentTime / 100)![1],
                  interpolatePath(coordinates, currentTime / 100)![0],
                  5.2,
                )
              : new THREE.Vector3()
          }
        >
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color={species.color} />

          {/* Species icon as HTML overlay */}
          <Html distanceFactor={10}>
            <div className="text-2xl animate-bounce">{species.icon}</div>
          </Html>
        </mesh>
      )}
    </group>
  )
}

// Atmosphere Effect
function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[5.5, 64, 64]} />
      <meshBasicMaterial color="#87CEEB" transparent opacity={0.1} side={THREE.BackSide} />
    </mesh>
  )
}

// Lighting Setup
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
    </>
  )
}

// Main Globe Scene
function GlobeScene({
  movements,
  selectedSpecies,
  currentTime,
  timeRange,
  isPlaying,
}: Omit<GlobeVisualizationProps, "loading">) {
  const { camera } = useThree()
  const [migrationPaths, setMigrationPaths] = useState<any[]>([])

  useEffect(() => {
    if (movements.length > 0) {
      const paths = processMovementPaths(movements, timeRange)
      setMigrationPaths(paths)
    }
  }, [movements, timeRange])

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 0, 15)
  }, [camera])

  return (
    <>
      <Lighting />
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade />

      <EarthGlobe />
      <Atmosphere />

      {/* Migration paths */}
      {migrationPaths.map((path) => {
        const species = selectedSpecies.find((s) => s.id === path.speciesId)
        if (!species) return null

        return (
          <MigrationPath
            key={`${path.speciesId}-${path.animalId}`}
            coordinates={path.coordinates}
            species={species}
            currentTime={currentTime}
            isActive={isPlaying}
          />
        )
      })}

      {/* Continent labels */}
      <Text position={latLonToVector3(40, -100, 6)} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
        North America
      </Text>

      <Text position={latLonToVector3(50, 10, 6)} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
        Europe
      </Text>

      <Text position={latLonToVector3(0, 20, 6)} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
        Africa
      </Text>

      <Text position={latLonToVector3(35, 100, 6)} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
        Asia
      </Text>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.6}
        panSpeed={0.8}
        rotateSpeed={0.4}
        minDistance={8}
        maxDistance={50}
      />
    </>
  )
}

export default function GlobeVisualization(props: GlobeVisualizationProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  if (props.loading) {
    return (
      <div className="h-full flex items-center justify-center bg-black rounded-lg">
        <div className="text-center text-white">
          <Globe className="h-12 w-12 mx-auto mb-4 animate-spin" />
          <p>Loading 3D Globe...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? "fixed inset-0 z-50" : "h-full"}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleFullscreen}
          className="bg-black/50 hover:bg-black/70 text-white border-white/20"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Species Legend */}
      {props.selectedSpecies.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 space-y-2">
          {props.selectedSpecies.map((species) => (
            <Badge
              key={species.id}
              variant="secondary"
              className="bg-black/50 text-white border-white/20"
              style={{ borderColor: species.color }}
            >
              <span className="mr-2">{species.icon}</span>
              {species.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 text-white/70 text-xs max-w-48">
        <p>🖱️ Drag to rotate • 🔍 Scroll to zoom • 📱 Pinch to zoom</p>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true, alpha: false }}
      >
        <GlobeScene {...props} />
      </Canvas>
    </motion.div>
  )
}

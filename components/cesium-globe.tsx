"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, Maximize2, Minimize2, Play, Pause } from "lucide-react"
import LoadingGlobe from "@/components/ui/loading-globe"
import type { AnimalMovement, Species } from "@/types/migration"
import { processMovementPaths, interpolatePath } from "@/utils/geospatial"

interface CesiumGlobeProps {
  movements: AnimalMovement[]
  selectedSpecies: Species[]
  currentTime: number
  timeRange: { start: number; end: number }
  isPlaying: boolean
  loading: boolean
}

// Cesium Globe Component
function CesiumGlobe({
  movements,
  selectedSpecies,
  currentTime,
  timeRange,
  isPlaying,
  loading,
}: CesiumGlobeProps) {
  const cesiumContainerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initAttempts, setInitAttempts] = useState(0)

  // Initialize Cesium with retry logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const initCesium = async () => {
      try {
        // Only run on client side
        if (typeof window === 'undefined') return

        // Set timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          setError('3D Globe initialization timeout. Please refresh the page.')
        }, 10000) // 10 second timeout

        // Dynamic import with proper error handling
        const cesiumModule = await import('cesium')
        const Cesium = cesiumModule.default || cesiumModule

        // Set Cesium base URL
        ;(window as any).CESIUM_BASE_URL = '/cesium/'

        if (!cesiumContainerRef.current) {
          throw new Error('Container not found')
        }

        if (viewerRef.current) {
          viewerRef.current.destroy()
          viewerRef.current = null
        }

        // Create simplified Cesium viewer
        viewerRef.current = new Cesium.Viewer(cesiumContainerRef.current, {
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          animation: false,
          timeline: false,
          fullscreenButton: false,
          infoBox: false,
          selectionIndicator: false,
          scene3DOnly: true,
          shouldAnimate: true,
          requestRenderMode: true,
          maximumRenderTimeChange: Infinity,
          targetFrameRate: 60,
          // Use simple imagery provider instead of terrain
          imageryProvider: new Cesium.OpenStreetMapImageryProvider({
            url: 'https://a.tile.openstreetmap.org/'
          })
        })

        // Configure the globe
        const scene = viewerRef.current.scene
        scene.globe.enableLighting = true
        scene.globe.showGroundAtmosphere = true

        // Set initial camera position
        viewerRef.current.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(0, 20, 20000000),
          orientation: {
            heading: 0.0,
            pitch: -Cesium.Math.PI_OVER_TWO,
            roll: 0.0
          }
        })

        clearTimeout(timeoutId)
        setIsInitialized(true)
        setError(null)

      } catch (err) {
        clearTimeout(timeoutId)
        console.error('Failed to initialize Cesium:', err)
        
        // Retry logic
        if (initAttempts < 2) {
          setInitAttempts(prev => prev + 1)
          setTimeout(initCesium, 2000) // Retry after 2 seconds
        } else {
          setError('Failed to load 3D globe. Please try the 2D map instead.')
        }
      }
    }

    initCesium()

    return () => {
      clearTimeout(timeoutId)
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy()
        } catch (e) {
          console.warn('Error destroying Cesium viewer:', e)
        }
        viewerRef.current = null
      }
    }
  }, [initAttempts])

  // Handle migration paths
  useEffect(() => {
    if (!viewerRef.current || !isInitialized) return

    try {
      const viewer = viewerRef.current
      const Cesium = (window as any).Cesium

      // Clear existing entities
      viewer.entities.removeAll()

      // Process migration paths
      const processedPaths = processMovementPaths(movements, timeRange)

      processedPaths.forEach((path) => {
        const species = selectedSpecies.find((s) => s.id === path.speciesId)
        if (!species) return

        // Create path coordinates
        const positions = path.coordinates.map(([lon, lat]) => 
          Cesium.Cartesian3.fromDegrees(lon, lat, 100000)
        ).filter(Boolean)

        if (positions.length < 2) return

        // Add migration path
        viewer.entities.add({
          polyline: {
            positions: positions,
            width: 4,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.2,
              color: Cesium.Color.fromCssColorString(species.color)
            }),
            clampToGround: false
          }
        })

        // Add current position indicator
        const currentPosition = interpolatePath(path.coordinates, currentTime / 100)
        if (currentPosition) {
          const currentCartesian = Cesium.Cartesian3.fromDegrees(
            currentPosition[0], 
            currentPosition[1], 
            150000
          )
          
          if (currentCartesian) {
            viewer.entities.add({
              position: currentCartesian,
              point: {
                pixelSize: 12,
                color: Cesium.Color.fromCssColorString(species.color),
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.NONE
              },
              label: {
                text: species.icon,
                font: '24px sans-serif',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -30),
                heightReference: Cesium.HeightReference.NONE
              }
            })
          }
        }
      })
    } catch (err) {
      console.error('Error updating migration paths:', err)
    }
  }, [movements, selectedSpecies, currentTime, timeRange, isInitialized])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      cesiumContainerRef.current?.requestFullscreen()
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

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 rounded-lg">
        <div className="text-center space-y-4 p-6">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <Globe className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-800">3D Globe Unavailable</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="text-sm"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading || !isInitialized) {
    return (
      <LoadingGlobe 
        message={initAttempts > 0 ? `Loading 3D Globe... (Attempt ${initAttempts + 1})` : "Loading 3D Globe..."} 
      />
    )
  }

  return (
    <motion.div
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
      {selectedSpecies.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 space-y-2">
          {selectedSpecies.map((species) => (
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

      {/* Status Indicator */}
      <div className="absolute bottom-4 right-4 z-10">
        <Badge
          variant="secondary"
          className="bg-black/50 text-white border-white/20"
        >
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <Play className="w-3 h-3 text-green-400" />
            ) : (
              <Pause className="w-3 h-3 text-orange-400" />
            )}
            <span className="text-xs">
              {isPlaying ? "Live" : "Paused"}
            </span>
          </div>
        </Badge>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 z-10 text-white/70 text-xs max-w-48">
        <p>🖱️ Drag to rotate • 🔍 Scroll to zoom • 📱 Pinch to zoom</p>
        <p className="text-white/50 mt-1">Real Earth data powered by Cesium</p>
      </div>

      {/* Cesium Container */}
      <div 
        ref={cesiumContainerRef} 
        className="h-full w-full"
        style={{ 
          background: 'linear-gradient(to bottom right, #1e3a8a, #1e40af, #3b82f6)'
        }}
      />
    </motion.div>
  )
}

export default CesiumGlobe 
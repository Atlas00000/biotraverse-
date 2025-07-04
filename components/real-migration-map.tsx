"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from "react-leaflet"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Globe, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Info, 
  Play, 
  Pause,
  MapPin,
  Satellite,
  Navigation
} from "lucide-react"
import LoadingGlobe from "@/components/ui/loading-globe"
import ErrorDisplay from "@/components/ui/error-display"
import type { AnimalMovement, Species } from "@/types/migration"
import { processMovementPaths, interpolatePath } from "@/utils/geospatial"
import "leaflet/dist/leaflet.css"

// Fix for default markers in React-Leaflet
import L from "leaflet"
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface RealMigrationMapProps {
  movements: AnimalMovement[]
  selectedSpecies: Species[]
  currentTime: number
  timeRange: { start: number; end: number }
  isPlaying: boolean
  zoomLevel: number
  onZoomChange: (zoom: number) => void
  loading: boolean
  error: string | null
  onRetry?: () => void
}

// Map Controls Component
function MapControls({ 
  onZoomIn, 
  onZoomOut, 
  onReset, 
  showLegend, 
  setShowLegend,
  mapType,
  setMapType 
}: {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  showLegend: boolean
  setShowLegend: (show: boolean) => void
  mapType: string
  setMapType: (type: string) => void
}) {
  return (
    <div className="absolute top-4 right-4 z-[1000] space-y-2">
      {/* Zoom Controls */}
      <div className="bg-black/50 backdrop-blur-md rounded-lg p-2 space-y-1 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          className="w-8 h-8 p-0 text-white hover:bg-white/20"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          className="w-8 h-8 p-0 text-white hover:bg-white/20"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="w-8 h-8 p-0 text-white hover:bg-white/20"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Map Type Toggle */}
      <div className="bg-black/50 backdrop-blur-md rounded-lg p-2 space-y-1 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMapType(mapType === "streets" ? "satellite" : "streets")}
          className="w-8 h-8 p-0 text-white hover:bg-white/20"
          title={mapType === "streets" ? "Switch to Satellite" : "Switch to Streets"}
        >
          {mapType === "streets" ? <Satellite className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLegend(!showLegend)}
          className="w-8 h-8 p-0 text-white hover:bg-white/20"
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// Map Event Handler Component
function MapEventHandler({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMap()

  useEffect(() => {
    const handleZoom = () => {
      onZoomChange(map.getZoom())
    }

    map.on('zoom', handleZoom)
    return () => {
      map.off('zoom', handleZoom)
    }
  }, [map, onZoomChange])

  return null
}

// Migration Paths Component
function MigrationPaths({ 
  movements, 
  selectedSpecies, 
  currentTime, 
  timeRange, 
  isPlaying 
}: {
  movements: AnimalMovement[]
  selectedSpecies: Species[]
  currentTime: number
  timeRange: { start: number; end: number }
  isPlaying: boolean
}) {
  const processedPaths = processMovementPaths(movements, timeRange)

  return (
    <>
      {processedPaths.map((path) => {
        const species = selectedSpecies.find((s) => s.id === path.speciesId)
        if (!species) return null

        // Convert coordinates to Leaflet format [lat, lng]
        const pathCoordinates = path.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])
        
        // Calculate current position
        const currentPosition = interpolatePath(path.coordinates, currentTime / 100)
        
        return (
          <div key={`${path.speciesId}-${path.animalId}`}>
            {/* Migration Path Line */}
            <Polyline
              positions={pathCoordinates}
              color={species.color}
              weight={4}
              opacity={0.8}
              dashArray="10, 5"
              className="migration-path"
            >
              <Popup>
                <div className="text-center">
                  <div className="text-2xl mb-2">{species.icon}</div>
                  <div className="font-semibold text-gray-800">{species.name}</div>
                  <div className="text-sm text-gray-600">{species.scientificName}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Distance: {path.totalDistance.toFixed(0)}km
                  </div>
                </div>
              </Popup>
            </Polyline>

            {/* Current Position Marker */}
            {currentPosition && (
              <div>
                {/* Pulse rings */}
                {[1, 2, 3].map((i) => (
                  <Circle
                    key={`pulse-${i}`}
                    center={[currentPosition[1], currentPosition[0]]}
                    radius={5000 * i}
                    pathOptions={{
                      color: species.color,
                      fillColor: species.color,
                      fillOpacity: 0.1,
                      weight: 2,
                      opacity: 0.3,
                    }}
                    className="pulse-ring"
                  />
                ))}

                {/* Main position marker */}
                <Marker
                  position={[currentPosition[1], currentPosition[0]]}
                  icon={L.divIcon({
                    className: 'custom-marker',
                    html: `
                      <div style="
                        background: ${species.color};
                        border: 3px solid white;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 0 10px ${species.color};
                        animation: bounce 1s ease-in-out infinite;
                      ">
                        <span style="font-size: 12px; color: white;">${species.icon}</span>
                      </div>
                    `,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                  })}
                >
                  <Popup>
                    <div className="text-center">
                      <div className="text-2xl mb-2">{species.icon}</div>
                      <div className="font-semibold text-gray-800">{species.name}</div>
                      <div className="text-sm text-gray-600">Current Position</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {currentPosition[1].toFixed(2)}°N, {currentPosition[0].toFixed(2)}°E
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

export default function RealMigrationMap({
  movements,
  selectedSpecies,
  currentTime,
  timeRange,
  isPlaying,
  zoomLevel,
  onZoomChange,
  loading,
  error,
  onRetry,
}: RealMigrationMapProps) {
  const mapRef = useRef<L.Map>(null)
  const [showLegend, setShowLegend] = useState(true)
  const [mapType, setMapType] = useState<"streets" | "satellite">("streets")
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  // Enhanced zoom controls
  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn()
  }, [])

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut()
  }, [])

  const handleReset = useCallback(() => {
    mapRef.current?.setView([20, 0], 2)
  }, [])

  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        title="Failed to load migration data"
        onRetry={onRetry}
      />
    )
  }

  if (loading) {
    return <LoadingGlobe message="Loading real-time map..." />
  }

  if (selectedSpecies.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-lg relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl"
          >
            <Globe className="h-10 w-10 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-3">Select Species to Begin</h3>
          <p className="text-blue-200">Choose wildlife species to visualize stunning migration patterns</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-lg overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      
      {/* Real Map */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full w-full relative z-10"
        >
          <MapContainer
            center={[20, 0]}
            zoom={2}
            className="h-full w-full"
            ref={mapRef}
            zoomControl={false}
            attributionControl={false}
          >
            {/* Map Type Tiles */}
            {mapType === "streets" ? (
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            ) : (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              />
            )}

            {/* Migration Paths */}
            <MigrationPaths
              movements={movements}
              selectedSpecies={selectedSpecies}
              currentTime={currentTime}
              timeRange={timeRange}
              isPlaying={isPlaying}
            />

            {/* Map Event Handler */}
            <MapEventHandler onZoomChange={onZoomChange} />
          </MapContainer>
        </motion.div>
      </AnimatePresence>

      {/* Enhanced Control Panel */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        showLegend={showLegend}
        setShowLegend={setShowLegend}
        mapType={mapType}
        setMapType={setMapType}
      />

      {/* Enhanced Legend */}
      <AnimatePresence>
        {showLegend && selectedSpecies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute bottom-4 left-4 z-[1000] bg-black/50 backdrop-blur-md rounded-lg p-4 space-y-3 shadow-lg"
          >
            <div className="flex items-center gap-2 text-white">
              <Info className="w-4 h-4" />
              <span className="text-sm font-semibold">Active Species</span>
            </div>
            <div className="space-y-2">
              {selectedSpecies.map((species) => (
                <motion.div
                  key={species.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: species.color }}
                  />
                  <span className="text-sm text-white">{species.icon} {species.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Indicator */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <Badge
          variant="secondary"
          className="bg-black/50 backdrop-blur-md text-white border-white/20 shadow-lg"
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

      {/* Map Type Indicator */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Badge
          variant="secondary"
          className="bg-black/50 backdrop-blur-md text-white border-white/20 shadow-lg"
        >
          <div className="flex items-center gap-2">
            {mapType === "streets" ? (
              <Navigation className="w-3 h-3" />
            ) : (
              <Satellite className="w-3 h-3" />
            )}
            <span className="text-xs">
              {mapType === "streets" ? "Streets" : "Satellite"}
            </span>
          </div>
        </Badge>
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        .leaflet-container {
          background: transparent !important;
        }
        
        .leaflet-control-attribution {
          display: none !important;
        }
        
        .migration-path {
          filter: drop-shadow(0 0 8px currentColor);
        }
        
        .pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
        
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        
        @keyframes pulse-ring {
          0% { 
            transform: scale(0.8); 
            opacity: 0.3; 
          }
          50% { 
            transform: scale(1.2); 
            opacity: 0.1; 
          }
          100% { 
            transform: scale(0.8); 
            opacity: 0.3; 
          }
        }
        
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
} 
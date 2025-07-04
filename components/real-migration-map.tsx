"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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
  Navigation,
  Map,
  Eye,
  EyeOff
} from "lucide-react"
import LoadingGlobe from "@/components/ui/loading-globe"
import ErrorDisplay from "@/components/ui/error-display"
import type { AnimalMovement, Species } from "@/types/migration"
import { processMovementPaths, interpolatePath, simplifyPath } from "@/utils/geospatial"

// Dynamic imports for client-side only
let MapContainer: any = null
let TileLayer: any = null
let Marker: any = null
let Popup: any = null
let Polyline: any = null
let useMap: any = null
let Circle: any = null
let L: any = null
let leafletCSSLoaded = false

// Free map providers
const MAP_PROVIDERS = {
  openstreetmap: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    icon: Navigation
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    icon: Satellite
  },
  terrain: {
    name: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a> contributors',
    icon: Map
  },
  dark: {
    name: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    icon: Eye
  },
  light: {
    name: "Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    icon: EyeOff
  }
}

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

// Enhanced Map Controls Component
function MapControls({ 
  onZoomIn, 
  onZoomOut, 
  onReset, 
  showLegend, 
  setShowLegend,
  mapType,
  setMapType,
  showPaths,
  setShowPaths
}: {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  showLegend: boolean
  setShowLegend: (show: boolean) => void
  mapType: string
  setMapType: (type: string) => void
  showPaths: boolean
  setShowPaths: (show: boolean) => void
}) {
  const [showMapMenu, setShowMapMenu] = useState(false)

  return (
    <div className="absolute top-4 right-4 z-[1000] space-y-2">
      {/* Zoom Controls */}
      <div className="bg-black/50 backdrop-blur-md rounded-lg p-2 space-y-1 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          className="w-8 h-8 p-0 text-white hover:bg-white/20"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          className="w-8 h-8 p-0 text-white hover:bg-white/20"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="w-8 h-8 p-0 text-white hover:bg-white/20"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Map Type Menu */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMapMenu(!showMapMenu)}
          className="w-8 h-8 p-0 text-white hover:bg-white/20 bg-black/50 backdrop-blur-md shadow-lg"
          title="Map Type"
        >
          <Layers className="w-4 h-4" />
        </Button>
        
        <AnimatePresence>
          {showMapMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 bg-black/80 backdrop-blur-md rounded-lg p-2 space-y-1 shadow-xl border border-white/20"
            >
              {Object.entries(MAP_PROVIDERS).map(([key, provider]) => {
                const IconComponent = provider.icon
                return (
                  <Button
                    key={key}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMapType(key)
                      setShowMapMenu(false)
                    }}
                    className={`w-full justify-start text-white hover:bg-white/20 ${
                      mapType === key ? 'bg-white/20' : ''
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    <span className="text-xs">{provider.name}</span>
                  </Button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle Controls */}
      <div className="bg-black/50 backdrop-blur-md rounded-lg p-2 space-y-1 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLegend(!showLegend)}
          className="w-8 h-8 p-0 text-white hover:bg-white/20"
          title="Toggle Legend"
        >
          <Info className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPaths(!showPaths)}
          className="w-8 h-8 p-0 text-white hover:bg-white/20"
          title="Toggle Paths"
        >
          <MapPin className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// Map Event Handler Component
function MapEventHandler({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  if (!useMap) return null
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

// Enhanced Migration Paths Component
function MigrationPaths({ 
  movements, 
  selectedSpecies, 
  currentTime, 
  timeRange, 
  isPlaying,
  showPaths
}: {
  movements: AnimalMovement[]
  selectedSpecies: Species[]
  currentTime: number
  timeRange: { start: number; end: number }
  isPlaying: boolean
  showPaths: boolean
}) {
  const processedPaths = processMovementPaths(movements, timeRange, currentTime)

  if (!showPaths || !Polyline || !Circle || !Popup) return null

  return (
    <>
      {processedPaths.map((path) => {
        const species = selectedSpecies.find((s) => s.id === path.speciesId)
        if (!species) return null

        // Simplify and convert coordinates to Leaflet format [lat, lng]
        const simplifiedCoordinates = simplifyPath(path.coordinates, 0.1) // Simplify with tolerance
        const pathCoordinates = simplifiedCoordinates.map(([lng, lat]) => [lat, lng] as [number, number])
        
        // Calculate current position based on the filtered path
        const pathProgress = path.coordinates.length > 1 ? 
          Math.min(currentTime / 100, 1) : 0
        const currentPosition = interpolatePath(path.coordinates, pathProgress)
        
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
                  <div className="text-xs text-gray-500">
                    Progress: {Math.round(currentTime)}%
                  </div>
                </div>
              </Popup>
            </Polyline>

            {/* Current Position Marker */}
            {currentPosition && (
              <div>
                {/* Single pulse ring for performance */}
                <Circle
                  center={[currentPosition[1], currentPosition[0]]}
                  radius={8000}
                  pathOptions={{
                    color: species.color,
                    fillColor: species.color,
                    fillOpacity: 0.05,
                    weight: 1,
                  }}
                  className="pulse-ring"
                />
                
                {/* Current position marker */}
                <Circle
                  center={[currentPosition[1], currentPosition[0]]}
                  radius={3000}
                  pathOptions={{
                    color: species.color,
                    fillColor: species.color,
                    fillOpacity: 0.9,
                    weight: 2,
                  }}
                  className="custom-marker"
                >
                  <Popup>
                    <div className="text-center">
                      <div className="text-xl mb-1">{species.icon}</div>
                      <div className="font-medium text-gray-800">{species.name}</div>
                      <div className="text-xs text-gray-600">Current Position</div>
                    </div>
                  </Popup>
                </Circle>
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
  const [isClient, setIsClient] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [showLegend, setShowLegend] = useState(true)
  const [mapType, setMapType] = useState("openstreetmap")
  const [showPaths, setShowPaths] = useState(true)
  const mapRef = useRef<any>(null)

  // Ensure we're on client side and initialize Leaflet
  useEffect(() => {
    const initClient = async () => {
      try {
        // Load Leaflet CSS only once
        if (!leafletCSSLoaded) {
          await import("leaflet/dist/leaflet.css")
          leafletCSSLoaded = true
        }

        // Import Leaflet and React-Leaflet components
        const [leafletModule, reactLeafletModule] = await Promise.all([
          import("leaflet"),
          import("react-leaflet")
        ])

        L = leafletModule
        MapContainer = reactLeafletModule.MapContainer
        TileLayer = reactLeafletModule.TileLayer
        Marker = reactLeafletModule.Marker
        Popup = reactLeafletModule.Popup
        Polyline = reactLeafletModule.Polyline
        useMap = reactLeafletModule.useMap
        Circle = reactLeafletModule.Circle
        
        // Fix for default markers in React-Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        setIsClient(true)
      } catch (err) {
        console.error('Failed to initialize Leaflet:', err)
        setMapError('Failed to load map. Please refresh the page.')
      }
    }

    initClient()
  }, [])

  // Don't render anything until client-side and components are loaded
  if (!isClient || !MapContainer || !TileLayer || !Polyline || !Circle) {
    return <LoadingGlobe message="Initializing map..." />
  }

  if (mapError) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 rounded-lg">
        <div className="text-center space-y-4 p-6">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <Globe className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-800">Map Unavailable</h3>
            <p className="text-red-600 text-sm mb-4">{mapError}</p>
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

  if (loading) {
    return <LoadingGlobe message="Loading map..." />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={onRetry} />
  }

  const selectedProvider = MAP_PROVIDERS[mapType as keyof typeof MAP_PROVIDERS]

  return (
    <motion.div
      className="relative h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Map Container */}
      <MapContainer
        center={[20, 0]}
        zoom={zoomLevel}
        className="h-full w-full"
        ref={mapRef}
        zoomControl={false}
        attributionControl={false}
        onLoad={() => setIsMapReady(true)}
      >
        <TileLayer
          url={selectedProvider.url}
          attribution={selectedProvider.attribution}
        />
        
        <MapEventHandler onZoomChange={onZoomChange} />
        
        <MigrationPaths
          movements={movements}
          selectedSpecies={selectedSpecies}
          currentTime={currentTime}
          timeRange={timeRange}
          isPlaying={isPlaying}
          showPaths={showPaths}
        />
      </MapContainer>

      {/* Controls */}
      <MapControls
        onZoomIn={() => mapRef.current?.zoomIn()}
        onZoomOut={() => mapRef.current?.zoomOut()}
        onReset={() => {
          mapRef.current?.setView([20, 0], 2)
          onZoomChange(2)
        }}
        showLegend={showLegend}
        setShowLegend={setShowLegend}
        mapType={mapType}
        setMapType={setMapType}
        showPaths={showPaths}
        setShowPaths={setShowPaths}
      />

      {/* Legend */}
      <AnimatePresence>
        {showLegend && selectedSpecies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute bottom-4 left-4 z-[1000] bg-black/80 backdrop-blur-md rounded-lg p-4 shadow-xl border border-white/20"
          >
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Species Legend
            </h3>
            <div className="space-y-2">
              {selectedSpecies.map((species) => (
                <div key={species.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: species.color }}
                  />
                  <span className="text-white text-xs">{species.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Indicator */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <Badge
          variant="secondary"
          className="bg-black/80 text-white border-white/20 backdrop-blur-md"
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

      {/* Map Info - Moved to bottom */}
      <div className="absolute bottom-4 left-4 z-[1000] text-white/70 text-xs max-w-48 bg-black/50 backdrop-blur-md rounded-lg p-2">
        <p>🖱️ Drag to pan • 🔍 Scroll to zoom • 📱 Pinch to zoom</p>
        <p className="text-white/50 mt-1">Real-time Migration Tracking</p>
      </div>
    </motion.div>
  )
} 
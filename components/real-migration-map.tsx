"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
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
import LoadingSpinner from "@/components/ui/loading-spinner"
import type { AnimalMovement, Species } from "@/types/migration"
import { processMovementPaths, interpolatePath, simplifyPath, calculateSpeciesBoundingBox } from "@/utils/geospatial"

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
  onFocusSpecies,
  selectedSpeciesCount,
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
  onFocusSpecies: () => void
  selectedSpeciesCount: number
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
        {selectedSpeciesCount === 1 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFocusSpecies}
            className="w-8 h-8 p-0 text-white hover:bg-white/20"
            title="Focus on Selected Species"
          >
            <Navigation className="w-4 h-4" />
          </Button>
        ) : selectedSpeciesCount > 1 ? (
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="w-8 h-8 p-0 text-white/50 cursor-not-allowed"
            title="Select a single species for auto-centering"
          >
            <Navigation className="w-4 h-4" />
          </Button>
        ) : null}
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
        
        {showMapMenu && (
          <div
            className="absolute top-full right-0 mt-2 bg-black/80 backdrop-blur-md rounded-lg p-2 space-y-1 shadow-xl border border-white/20 animate-in slide-in-from-top-2 duration-200"
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
            </div>
          )}
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
  // Performance optimization: Memoize processed paths
  const processedPaths = useMemo(() => {
    return processMovementPaths(movements, timeRange, currentTime)
  }, [movements, timeRange, currentTime])

  // Performance optimization: Filter paths for selected species only
  const filteredPaths = useMemo(() => {
    const selectedSpeciesIds = new Set(selectedSpecies.map(s => s.id))
    return processedPaths.filter(path => selectedSpeciesIds.has(path.speciesId))
  }, [processedPaths, selectedSpecies])

  // Performance optimization: Limit number of paths for multiple selections
  const limitedPaths = useMemo(() => {
    if (selectedSpecies.length <= 3) {
      return filteredPaths // Show all paths for 3 or fewer species
    } else if (selectedSpecies.length <= 6) {
      return filteredPaths.slice(0, 50) // Limit to 50 paths for 4-6 species
    } else {
      return filteredPaths.slice(0, 30) // Limit to 30 paths for 7+ species
    }
  }, [filteredPaths, selectedSpecies.length])

  // Performance optimization: Adaptive simplification based on selection count
  const getSimplificationTolerance = (speciesCount: number) => {
    if (speciesCount <= 2) return 0.05 // High detail for few species
    if (speciesCount <= 4) return 0.1 // Medium detail
    if (speciesCount <= 6) return 0.2 // Lower detail
    return 0.3 // Very simplified for many species
  }

  if (!showPaths || !Polyline || !Circle || !Popup) return null

  const tolerance = getSimplificationTolerance(selectedSpecies.length)

  return (
    <>
      {limitedPaths.map((path) => {
        const species = selectedSpecies.find((s) => s.id === path.speciesId)
        if (!species) return null

        // Adaptive simplification based on selection count
        const simplifiedCoordinates = simplifyPath(path.coordinates, tolerance)
        const pathCoordinates = simplifiedCoordinates.map(([lng, lat]) => [lat, lng] as [number, number])
        
        // Calculate current position based on the filtered path
        const pathProgress = path.coordinates.length > 1 ? 
          Math.min(currentTime / 100, 1) : 0
        const currentPosition = interpolatePath(path.coordinates, pathProgress)
        
        // Performance optimization: Adaptive opacity based on selection count
        const pathOpacity = selectedSpecies.length <= 3 ? 0.8 : 
                           selectedSpecies.length <= 6 ? 0.6 : 0.4
        
        // Performance optimization: Adaptive weight based on selection count
        const pathWeight = selectedSpecies.length <= 3 ? 4 : 
                          selectedSpecies.length <= 6 ? 3 : 2
        
        return (
          <div key={`${path.speciesId}-${path.animalId}`}>
            {/* Migration Path Line */}
            <Polyline
              positions={pathCoordinates}
              color={species.color}
              weight={pathWeight}
              opacity={pathOpacity}
              dashArray={selectedSpecies.length <= 4 ? "10, 5" : "15, 10"}
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

            {/* Current Position Marker - Only show for first 10 species for performance */}
            {currentPosition && selectedSpecies.findIndex(s => s.id === path.speciesId) < 10 && (
              <div>
                {/* Pulse ring - Only for first 5 species */}
                {selectedSpecies.findIndex(s => s.id === path.speciesId) < 5 && (
                  <Circle
                    center={[currentPosition[1], currentPosition[0]]}
                    radius={selectedSpecies.length <= 3 ? 8000 : 6000}
                    pathOptions={{
                      color: species.color,
                      fillColor: species.color,
                      fillOpacity: 0.05,
                      weight: 1,
                    }}
                    className="pulse-ring"
                  />
                )}
                
                {/* Current position marker */}
                <Circle
                  center={[currentPosition[1], currentPosition[0]]}
                  radius={selectedSpecies.length <= 3 ? 3000 : 2000}
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

// Persistent Species Indicators - Always visible regardless of zoom or timeline
function SpeciesIndicators({ 
  movements, 
  selectedSpecies 
}: {
  movements: AnimalMovement[]
  selectedSpecies: Species[]
}) {
  // Calculate center points for each selected species
  const speciesCenters = useMemo(() => {
    const centers: Array<{ species: Species; center: [number, number] }> = []
    
    selectedSpecies.forEach(species => {
      // Get all movements for this species
      const speciesMovements = movements.filter(m => m.speciesId === species.id)
      
      if (speciesMovements.length > 0) {
        // Calculate the center point of all movements for this species
        const totalLat = speciesMovements.reduce((sum, m) => sum + m.latitude, 0)
        const totalLng = speciesMovements.reduce((sum, m) => sum + m.longitude, 0)
        const center: [number, number] = [
          totalLat / speciesMovements.length,
          totalLng / speciesMovements.length
        ]
        
        centers.push({ species, center })
      }
    })
    
    return centers
  }, [movements, selectedSpecies])

  if (!Circle || !Popup || selectedSpecies.length === 0) return null

  return (
    <>
      {speciesCenters.map(({ species, center }) => (
        <div key={`indicator-${species.id}`}>
          {/* Outer glow ring - always visible */}
          <Circle
            center={center}
            radius={12000} // Larger radius for visibility at any zoom
            pathOptions={{
              color: species.color,
              fillColor: species.color,
              fillOpacity: 0.1,
              weight: 2,
            }}
            className="species-indicator-glow"
          />
          
          {/* Inner solid circle */}
          <Circle
            center={center}
            radius={6000}
            pathOptions={{
              color: species.color,
              fillColor: species.color,
              fillOpacity: 0.3,
              weight: 3,
            }}
            className="species-indicator-core"
          />
          
          {/* Species icon marker */}
          <Circle
            center={center}
            radius={4000}
            pathOptions={{
              color: species.color,
              fillColor: species.color,
              fillOpacity: 0.8,
              weight: 2,
            }}
            className="species-indicator-marker"
          >
            <Popup>
              <div className="text-center">
                <div className="text-3xl mb-2">{species.icon}</div>
                <div className="font-bold text-gray-800 text-lg">{species.name}</div>
                <div className="text-sm text-gray-600">{species.scientificName}</div>
                <div className="text-xs text-gray-500 mt-2">
                  Migration Range Center
                </div>
              </div>
            </Popup>
          </Circle>
        </div>
      ))}
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
  const [autoCenterKey, setAutoCenterKey] = useState(0) // Force re-render for auto-centering
  const [isAutoCentering, setIsAutoCentering] = useState(false)
  const [showSpeciesSelectedNotification, setShowSpeciesSelectedNotification] = useState(false)
  const [initRetryCount, setInitRetryCount] = useState(0)

  // Performance optimization: Memoize bounding box calculation (only for single species)
  const boundingBox = useMemo(() => {
    if (selectedSpecies.length === 1 && movements.length > 0) {
      return calculateSpeciesBoundingBox(movements, selectedSpecies)
    }
    return null
  }, [selectedSpecies, movements])

  // Track if auto-centering has been performed for current species
  const [lastAutoCenteredSpecies, setLastAutoCenteredSpecies] = useState<string | null>(null)
  const [autoCenterTimeout, setAutoCenterTimeout] = useState<NodeJS.Timeout | null>(null)

  // Reset auto-centering state when species selection changes
  useEffect(() => {
    if (selectedSpecies.length !== 1) {
      setLastAutoCenteredSpecies(null)
      setIsAutoCentering(false)
      setShowSpeciesSelectedNotification(false)
      // Clear any pending auto-center timeout
      if (autoCenterTimeout) {
        clearTimeout(autoCenterTimeout)
        setAutoCenterTimeout(null)
      }
    }
  }, [selectedSpecies.length, autoCenterTimeout])

  // Auto-center map when single species selection changes
  useEffect(() => {
    // Only auto-center if:
    // 1. We have exactly one species selected
    // 2. We haven't already auto-centered for this species
    // 3. The map is ready and we have a bounding box
    if (isClient && 
        mapRef.current && 
        boundingBox && 
        selectedSpecies.length === 1 && 
        selectedSpecies[0]?.id !== lastAutoCenteredSpecies) {
      
      // Mark this species as auto-centered
      setLastAutoCenteredSpecies(selectedSpecies[0].id)
      
      // Show species selected notification
      setShowSpeciesSelectedNotification(true)
      setTimeout(() => setShowSpeciesSelectedNotification(false), 3000)
      
      setIsAutoCentering(true)
      
      // Add a brief delay to make the transition more noticeable
      const centerTimeout = setTimeout(() => {
        try {
          // Smooth transition to the new view
          mapRef.current.setView(boundingBox.center, boundingBox.zoom, {
            animate: true,
            duration: 2.0, // Longer duration for more obvious movement
            easeLinearity: 0.25
          })
          
          // Update zoom level state
          onZoomChange(boundingBox.zoom)
        } catch (error) {
          // Silently handle errors in production
        }
        
        // Increment key to force re-render if needed
        setAutoCenterKey(prev => prev + 1)
      }, 500) // Longer delay to make the transition more obvious
      
      // Hide auto-centering indicator after animation
      const hideTimeout = setTimeout(() => {
        setIsAutoCentering(false)
      }, 4000) // Longer display time
      
      // Store timeout for cleanup
      setAutoCenterTimeout(hideTimeout)
    }
  }, [boundingBox, isClient, onZoomChange, selectedSpecies, lastAutoCenteredSpecies])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoCenterTimeout) {
        clearTimeout(autoCenterTimeout)
      }
    }
  }, [autoCenterTimeout])

  // Ensure we're on client side and initialize Leaflet
  useEffect(() => {
    const initClient = async () => {
      try {
        // Load Leaflet CSS only once
        if (!leafletCSSLoaded) {
          await import("leaflet/dist/leaflet.css")
          leafletCSSLoaded = true
        }

        // Import Leaflet and React-Leaflet components with timeout
        const importPromise = Promise.all([
          import("leaflet"),
          import("react-leaflet")
        ])
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Import timeout')), 10000)
        )
        
        const [leafletModule, reactLeafletModule] = await Promise.race([
          importPromise,
          timeoutPromise
        ]) as [any, any]

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
        setMapError(null) // Clear any previous errors
      } catch (err) {
        setMapError(`Failed to load map. Retry ${initRetryCount + 1}/3`)
        
        // Retry up to 3 times
        if (initRetryCount < 2) {
          setTimeout(() => {
            setInitRetryCount(prev => prev + 1)
          }, 2000)
        }
      }
    }

    initClient()
  }, [initRetryCount])

  // Don't render anything until client-side and components are loaded
  if (!isClient || !MapContainer || !TileLayer || !Polyline || !Circle) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
        <div className="text-center space-y-4 p-6">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <Globe className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Loading Map</h3>
            <p className="text-blue-600 text-sm">Initializing map components...</p>
            <div className="mt-4 flex justify-center">
              <div className="w-32 h-1 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setMapError(null)
                  setInitRetryCount(0)
                  setIsClient(false)
                }}
                className="text-sm"
              >
                Retry
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="text-sm ml-2"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
        <LoadingSpinner size="lg" text="Loading map..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 rounded-lg">
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️ Error loading map</div>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              Try Again
            </Button>
          )}
        </div>
      </div>
    )
  }

  const selectedProvider = MAP_PROVIDERS[mapType as keyof typeof MAP_PROVIDERS]

  return (
    <div
      className={`relative h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden animate-in zoom-in duration-500 ${
        isAutoCentering ? 'ring-4 ring-blue-400/50 ring-offset-2' : ''
      }`}
    >
      {/* Map Container */}
      <MapContainer
        center={[20, 0]}
        zoom={zoomLevel}
        className={`h-full w-full ${isAutoCentering ? 'animate-pulse' : ''}`}
        ref={mapRef}
        zoomControl={false}
        attributionControl={false}
        onLoad={() => {
          setIsMapReady(true)
        }}
        whenReady={() => {
          setIsMapReady(true)
        }}
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
        
        {/* Persistent Species Indicators - Always visible */}
        <SpeciesIndicators
          movements={movements}
          selectedSpecies={selectedSpecies}
        />
      </MapContainer>

      {/* Controls */}
      <MapControls
        onZoomIn={() => mapRef.current?.zoomIn()}
        onZoomOut={() => mapRef.current?.zoomOut()}
        onReset={() => {
          if (selectedSpecies.length > 0 && movements.length > 0) {
            // Auto-center to selected species
            const { center, zoom } = calculateSpeciesBoundingBox(movements, selectedSpecies)
            mapRef.current?.setView(center, zoom, {
              animate: true,
              duration: 1.5,
              easeLinearity: 0.25
            })
            onZoomChange(zoom)
          } else {
            // Default world view
            mapRef.current?.setView([20, 0], 2)
            onZoomChange(2)
          }
        }}
        onFocusSpecies={() => {
          if (selectedSpecies.length === 1 && movements.length > 0) {
            // Prevent multiple simultaneous auto-centering operations
            if (isAutoCentering) {
              return
            }
            
            setIsAutoCentering(true)
            setShowSpeciesSelectedNotification(true)
            
            const { center, zoom } = calculateSpeciesBoundingBox(movements, selectedSpecies)
            
            try {
              mapRef.current?.setView(center, zoom, {
                animate: true,
                duration: 2.0,
                easeLinearity: 0.25
              })
              onZoomChange(zoom)
            } catch (error) {
              // Silently handle errors in production
            }
            
            setTimeout(() => {
              setIsAutoCentering(false)
              setShowSpeciesSelectedNotification(false)
            }, 4000)
          }
        }}
        selectedSpeciesCount={selectedSpecies.length}
        showLegend={showLegend}
        setShowLegend={setShowLegend}
        mapType={mapType}
        setMapType={setMapType}
        showPaths={showPaths}
        setShowPaths={setShowPaths}
      />

      {/* Legend */}
      {showLegend && selectedSpecies.length > 0 && (
        <div
          className="absolute bottom-4 left-4 z-[1000] bg-black/80 backdrop-blur-md rounded-lg p-4 shadow-xl border border-white/20 animate-in slide-in-from-left-2 duration-300"
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
          </div>
        )}

      {/* Species selected notification */}
      {showSpeciesSelectedNotification && (
        <div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[2000] pointer-events-none animate-in slide-in-from-top-2 duration-500"
        >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl border border-white/20 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="animate-pulse">
                  🎯
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    Species Selected! 
                  </p>
                  <p className="text-xs opacity-90">
                    Map is moving to show your species...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Auto-centering overlay notification */}
      {isAutoCentering && (
        <div
          className="absolute inset-0 z-[2000] flex items-center justify-center pointer-events-none animate-in zoom-in duration-400"
        >
            <div className="bg-black/80 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20 max-w-sm mx-4">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-spin">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Auto-Centering Map</h3>
                  <p className="text-white/80 text-sm">
                    Moving to show your selected species...
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Status Indicators */}
      <div className="absolute bottom-4 right-4 z-[1000] space-y-2">
        {/* Auto-centering indicator */}
        {isAutoCentering && (
          <div className="relative animate-in slide-in-from-bottom-2 duration-300">
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-400/50 backdrop-blur-md shadow-lg animate-pulse"
              >
                <div className="flex items-center gap-2">
                  <div className="animate-spin">
                    <Navigation className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-medium">Auto-centering to species...</span>
                </div>
              </Badge>
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-sm animate-ping">              </div>
            </div>
          )}

        {/* Playback status */}
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



      {/* Performance Indicator - Show when optimizations are active */}
      {selectedSpecies.length > 3 && (
        <div className="absolute top-4 left-4 z-[1000] text-white/90 text-xs bg-amber-600/80 backdrop-blur-md rounded-lg p-2 border border-amber-400/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse"></div>
            <span>Performance Mode Active</span>
          </div>
          <div className="text-amber-200 text-xs mt-1">
            Showing {selectedSpecies.length <= 6 ? '50' : '30'} paths for smooth performance
          </div>
        </div>
      )}

      {/* Auto-centering Status Indicator */}
      {selectedSpecies.length > 1 && (
        <div className="absolute top-16 left-4 z-[1000] text-white/90 text-xs bg-blue-600/80 backdrop-blur-md rounded-lg p-2 border border-blue-400/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
            <span>Auto-centering Disabled</span>
          </div>
          <div className="text-blue-200 text-xs mt-1">
            Select a single species to enable auto-centering
          </div>
        </div>
      )}

      {/* Species Indicators Legend */}
      {selectedSpecies.length > 0 && (
        <div className="absolute bottom-20 left-4 z-[1000] text-white/90 text-xs bg-black/60 backdrop-blur-md rounded-lg p-3 border border-white/20 max-w-48">
          <div className="font-semibold mb-2 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            Species Indicators
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Migration Range Center</span>
            </div>
            <div className="text-gray-300 text-xs mt-2">
              Always visible regardless of zoom level or timeline position
            </div>
          </div>
        </div>
      )}

      {/* Map Info - Moved to bottom */}
      <div className="absolute bottom-4 left-4 z-[1000] text-white/70 text-xs max-w-48 bg-black/50 backdrop-blur-md rounded-lg p-2">
        <p>🖱️ Drag to pan • 🔍 Scroll to zoom • 📱 Pinch to zoom</p>
        <p className="text-white/50 mt-1">Real-time Migration Tracking</p>
      </div>
    </div>
  )
} 
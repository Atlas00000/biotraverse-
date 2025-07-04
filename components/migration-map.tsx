"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as d3 from "d3"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { Globe, ZoomIn, ZoomOut, RotateCcw, Layers, Info, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import LoadingGlobe from "@/components/ui/loading-globe"
import ErrorDisplay from "@/components/ui/error-display"
import type { AnimalMovement, Species } from "@/types/migration"
import { processMovementPaths, interpolatePath } from "@/utils/geospatial"

interface MigrationMapProps {
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

export default function MigrationMap({
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
}: MigrationMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [worldData, setWorldData] = useState<any>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [showLegend, setShowLegend] = useState(true)
  const [animationPhase, setAnimationPhase] = useState(0)
  const animationRef = useRef<number>()

  // Motion values for smooth animations
  const progressValue = useMotionValue(currentTime)
  const scaleValue = useMotionValue(zoomLevel)
  const opacityValue = useTransform(progressValue, [0, 100], [0.3, 1])

  // World map projection with enhanced styling
  const projection = d3
    .geoNaturalEarth1()
    .scale(180 * zoomLevel)
    .translate([dimensions.width / 2, dimensions.height / 2])

  const pathGenerator = d3.geoPath().projection(projection)

  // Load world map data
  useEffect(() => {
    const loadWorldData = async () => {
      try {
        const data = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@3/countries-110m.json")
        setWorldData(data)
      } catch (error) {
        console.error("Failed to load world map data:", error)
        setWorldData({ type: "FeatureCollection", features: [] })
      }
    }
    
    loadWorldData()
  }, [])

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Smooth animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const animate = () => {
      setAnimationPhase(prev => (prev + 1) % 360)
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  // Update motion values
  useEffect(() => {
    progressValue.set(currentTime)
    scaleValue.set(zoomLevel)
  }, [currentTime, zoomLevel, progressValue, scaleValue])

  // Enhanced zoom controls
  const handleZoomIn = useCallback(() => {
    onZoomChange(Math.min(zoomLevel * 1.5, 8))
  }, [zoomLevel, onZoomChange])

  const handleZoomOut = useCallback(() => {
    onZoomChange(Math.max(zoomLevel / 1.5, 0.5))
  }, [zoomLevel, onZoomChange])

  const handleReset = useCallback(() => {
    onZoomChange(1)
  }, [onZoomChange])

  // D3 visualization with enhanced effects
  useEffect(() => {
    if (!svgRef.current || !worldData) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    // Create main group with smooth transitions
    const g = svg.append("g")

    // Enhanced gradient definitions
    const defs = svg.append("defs")
    
    // Stunning background gradient
    const backgroundGradient = defs.append("radialGradient")
      .attr("id", "background-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
    
    backgroundGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#0f172a")
      .attr("stop-opacity", 0.95)
    
    backgroundGradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#1e293b")
      .attr("stop-opacity", 0.8)
    
    backgroundGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#334155")
      .attr("stop-opacity", 0.6)

    // Ocean gradient
    const oceanGradient = defs.append("linearGradient")
      .attr("id", "ocean-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
    
    oceanGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#0c4a6e")
      .attr("stop-opacity", 0.8)
    
    oceanGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#0369a1")
      .attr("stop-opacity", 0.4)

    // Land gradient
    const landGradient = defs.append("linearGradient")
      .attr("id", "land-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
    
    landGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#f8fafc")
      .attr("stop-opacity", 0.9)
    
    landGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#e2e8f0")
      .attr("stop-opacity", 0.7)

    // Add stunning background
    g.append("rect")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("fill", "url(#background-gradient)")
      .attr("rx", 12)
      .attr("ry", 12)

    // Animated grid pattern
    const gridPattern = defs.append("pattern")
      .attr("id", "grid-pattern")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 30)
      .attr("height", 30)
    
    gridPattern.append("rect")
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "none")
    
    gridPattern.append("circle")
      .attr("cx", 15)
      .attr("cy", 15)
      .attr("r", 1)
      .attr("fill", "#64748b")
      .attr("opacity", 0.2)

    // Add subtle grid overlay
    g.append("rect")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("fill", "url(#grid-pattern)")

    // Enhanced graticule with animation
    const graticule = d3.geoGraticule()
    g.append("path")
      .datum(graticule())
      .attr("d", pathGenerator)
      .attr("fill", "none")
      .attr("stroke", "#475569")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.3)
      .style("stroke-dasharray", "2,2")
      .style("animation", "dash 20s linear infinite")

    // Draw world countries with enhanced interactivity
    if (worldData && worldData.features) {
      g.selectAll("path.country")
        .data(worldData.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", pathGenerator)
        .attr("fill", "url(#land-gradient)")
        .attr("stroke", "#64748b")
        .attr("stroke-width", 0.8)
        .attr("opacity", 0.8)
        .style("transition", "all 0.3s ease")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .attr("fill", "#e2e8f0")
            .attr("stroke", "#475569")
            .attr("stroke-width", 2)
            .attr("opacity", 1)
            .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.3))")
          
          setHoveredCountry(d.properties?.name || "Unknown")
        })
        .on("mouseout", function() {
          d3.select(this)
            .attr("fill", "url(#land-gradient)")
            .attr("stroke", "#64748b")
            .attr("stroke-width", 0.8)
            .attr("opacity", 0.8)
            .style("filter", "none")
          
          setHoveredCountry(null)
        })
    }

    // Add major oceans with enhanced styling
    const oceans = [
      { name: "Pacific", coords: [[-180, -60], [180, -60], [180, 60], [-180, 60]] },
      { name: "Atlantic", coords: [[-60, -60], [20, -60], [20, 60], [-60, 60]] },
      { name: "Indian", coords: [[20, -60], [120, -60], [120, 30], [20, 30]] },
    ]

    oceans.forEach(ocean => {
      const oceanFeature = {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [ocean.coords] }
      }
      
      g.append("path")
        .datum(oceanFeature)
        .attr("d", pathGenerator)
        .attr("fill", "url(#ocean-gradient)")
        .attr("opacity", 0.6)
        .attr("stroke", "#0c4a6e")
        .attr("stroke-width", 1)
    })

    // Process and render migration paths with stunning effects
    const processedPaths = processMovementPaths(movements, timeRange)

    processedPaths.forEach((path, index) => {
      const species = selectedSpecies.find((s) => s.id === path.speciesId)
      if (!species) return

      const pathGroup = g.append("g").attr("class", `migration-path-${path.speciesId}`)

      // Create stunning path gradient
      const pathGradient = defs.append("linearGradient")
        .attr("id", `path-gradient-${path.speciesId}`)
        .attr("gradientUnits", "userSpaceOnUse")

      pathGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", species.color)
        .attr("stop-opacity", 0.3)

      pathGradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", species.color)
        .attr("stop-opacity", 0.8)

      pathGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", species.color)
        .attr("stop-opacity", 1)

      // Create glow filter
      const glowFilter = defs.append("filter")
        .attr("id", `glow-${path.speciesId}`)
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%")

      glowFilter.append("feGaussianBlur")
        .attr("stdDeviation", "4")
        .attr("result", "coloredBlur")

      glowFilter.append("feMerge")
        .append("feMergeNode")
        .attr("in", "coloredBlur")

      glowFilter.append("feMerge")
        .append("feMergeNode")
        .attr("in", "SourceGraphic")

      // Draw animated trail
      const line = d3
        .line<[number, number]>()
        .x((d) => projection(d)![0])
        .y((d) => projection(d)![1])
        .curve(d3.curveCardinal)

      // Animated trail with glow effect
      const trail = pathGroup
        .append("path")
        .datum(path.coordinates)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", `url(#path-gradient-${path.speciesId})`)
        .attr("stroke-width", 6)
        .attr("stroke-opacity", 0.9)
        .attr("stroke-linecap", "round")
        .attr("filter", `url(#glow-${path.speciesId})`)
        .style("stroke-dasharray", path.coordinates.length * 2)
        .style("stroke-dashoffset", path.coordinates.length * 2)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .style("stroke-dashoffset", 0)

      // Add animated particles along the path
      const particleCount = 20
      for (let i = 0; i < particleCount; i++) {
        const progress = (i / particleCount) + (animationPhase / 360)
        const position = interpolatePath(path.coordinates, progress % 1)
        
        if (position) {
          const [x, y] = projection(position) || [0, 0]
          
          pathGroup
            .append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 2)
            .attr("fill", species.color)
            .attr("opacity", 0.6)
            .style("animation", `pulse 2s ease-in-out infinite ${i * 0.1}s`)
        }
      }

      // Current position with stunning effects
      const currentPosition = interpolatePath(path.coordinates, currentTime / 100)
      if (currentPosition) {
        const [x, y] = projection(currentPosition) || [0, 0]

        // Animated pulse rings
        for (let i = 1; i <= 3; i++) {
          pathGroup
            .append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 8 * i)
            .attr("fill", "none")
            .attr("stroke", species.color)
            .attr("stroke-width", 2)
            .attr("opacity", 0.3)
            .style("animation", `pulse-ring 2s ease-in-out infinite ${i * 0.3}s`)
        }

        // Main position indicator
        pathGroup
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 10)
          .attr("fill", species.color)
          .attr("stroke", "white")
          .attr("stroke-width", 3)
          .attr("opacity", 0.9)
          .attr("filter", `url(#glow-${path.speciesId})`)
          .style("animation", "bounce 1s ease-in-out infinite")

        // Species icon with enhanced styling
        pathGroup
          .append("text")
          .attr("x", x)
          .attr("y", y + 4)
          .attr("text-anchor", "middle")
          .attr("font-size", "16px")
          .attr("font-weight", "bold")
          .attr("filter", `url(#glow-${path.speciesId})`)
          .style("text-shadow", "0 2px 4px rgba(0,0,0,0.5)")
          .text(species.icon)
      }
    })

    // Enhanced zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
        onZoomChange(event.transform.k)
      })

    svg.call(zoom)

    // Add stunning geographic labels
    const features = [
      { name: "North America", coords: [-100, 40], type: "continent" },
      { name: "South America", coords: [-60, -20], type: "continent" },
      { name: "Europe", coords: [10, 50], type: "continent" },
      { name: "Africa", coords: [20, 0], type: "continent" },
      { name: "Asia", coords: [100, 35], type: "continent" },
      { name: "Australia", coords: [135, -25], type: "continent" },
    ]

    features.forEach(feature => {
      const [x, y] = projection(feature.coords) || [0, 0]
      
      if (x < 0 || x > dimensions.width || y < 0 || y > dimensions.height) return
      
      // Enhanced label background
      g.append("rect")
        .attr("x", x - 50)
        .attr("y", y - 15)
        .attr("width", 100)
        .attr("height", 30)
        .attr("fill", "rgba(255, 255, 255, 0.95)")
        .attr("rx", 15)
        .attr("ry", 15)
        .attr("opacity", 0.9)
        .attr("stroke", "#475569")
        .attr("stroke-width", 1)
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))")

      // Enhanced label text
      g.append("text")
        .attr("x", x)
        .attr("y", y + 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "600")
        .attr("fill", "#1e293b")
        .text(feature.name)
    })

  }, [movements, selectedSpecies, currentTime, timeRange, dimensions, zoomLevel, worldData, animationPhase])

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
    return <LoadingGlobe message="Loading migration data..." />
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
    <div ref={containerRef} className="h-full w-full relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-lg overflow-hidden">
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
      
      {/* Main SVG */}
      <AnimatePresence>
        <motion.svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full relative z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </AnimatePresence>

      {/* Enhanced Control Panel */}
      <div className="absolute top-4 right-4 z-20 space-y-2">
        {/* Zoom Controls */}
        <div className="bg-black/50 backdrop-blur-md rounded-lg p-2 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="w-8 h-8 p-0 text-white hover:bg-white/20"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="w-8 h-8 p-0 text-white hover:bg-white/20"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="w-8 h-8 p-0 text-white hover:bg-white/20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Legend Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLegend(!showLegend)}
          className="w-8 h-8 p-0 text-white hover:bg-white/20 bg-black/50 backdrop-blur-md rounded-lg"
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>

      {/* Enhanced Legend */}
      <AnimatePresence>
        {showLegend && selectedSpecies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute bottom-4 left-4 z-20 bg-black/50 backdrop-blur-md rounded-lg p-4 space-y-3"
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

      {/* Hovered Country Info */}
      <AnimatePresence>
        {hoveredCountry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-md rounded-lg p-3 text-white"
          >
            <div className="text-sm font-semibold">{hoveredCountry}</div>
            <div className="text-xs text-blue-200">Hover for details</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Indicator */}
      <div className="absolute bottom-4 right-4 z-20">
        <Badge
          variant="secondary"
          className="bg-black/50 backdrop-blur-md text-white border-white/20"
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

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.1; }
          100% { transform: scale(0.8); opacity: 0.3; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
      `}</style>
    </div>
  )
}

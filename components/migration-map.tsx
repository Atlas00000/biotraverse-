"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Globe } from "lucide-react"
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
}: MigrationMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const animationRef = useRef<number>()

  // World map projection
  const projection = d3
    .geoNaturalEarth1()
    .scale(150 * zoomLevel)
    .translate([dimensions.width / 2, dimensions.height / 2])

  const pathGenerator = d3.geoPath().projection(projection)

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

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const animate = () => {
      // Animation logic will be handled by D3 transitions
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  // D3 visualization
  useEffect(() => {
    if (!svgRef.current || movements.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    // Create main group
    const g = svg.append("g")

    // Add world map background
    g.append("rect").attr("width", dimensions.width).attr("height", dimensions.height).attr("fill", "#f0f9ff")

    // Add graticule (grid lines)
    const graticule = d3.geoGraticule()
    g.append("path")
      .datum(graticule())
      .attr("d", pathGenerator)
      .attr("fill", "none")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 0.5)

    // Process and render migration paths
    const processedPaths = processMovementPaths(movements, timeRange)

    processedPaths.forEach((path, index) => {
      const species = selectedSpecies.find((s) => s.id === path.speciesId)
      if (!species) return

      // Create path group
      const pathGroup = g.append("g").attr("class", `migration-path-${path.speciesId}`)

      // Draw trail
      const line = d3
        .line<[number, number]>()
        .x((d) => projection(d)![0])
        .y((d) => projection(d)![1])
        .curve(d3.curveCardinal)

      const trail = pathGroup
        .append("path")
        .datum(path.coordinates)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", species.color)
        .attr("stroke-width", 3)
        .attr("stroke-opacity", 0.7)
        .attr("stroke-linecap", "round")

      // Add gradient effect
      const gradient = svg
        .append("defs")
        .append("linearGradient")
        .attr("id", `gradient-${path.speciesId}`)
        .attr("gradientUnits", "userSpaceOnUse")

      gradient.append("stop").attr("offset", "0%").attr("stop-color", species.color).attr("stop-opacity", 0.3)

      gradient.append("stop").attr("offset", "100%").attr("stop-color", species.color).attr("stop-opacity", 0.9)

      trail.attr("stroke", `url(#gradient-${path.speciesId})`)

      // Add animated animal icon
      const currentPosition = interpolatePath(path.coordinates, currentTime / 100)
      if (currentPosition) {
        const [x, y] = projection(currentPosition) || [0, 0]

        pathGroup
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 6)
          .attr("fill", species.color)
          .attr("stroke", "white")
          .attr("stroke-width", 2)
          .attr("opacity", 0.9)

        // Add species icon
        pathGroup
          .append("text")
          .attr("x", x)
          .attr("y", y + 1)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .text(species.icon)
      }
    })

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
        onZoomChange(event.transform.k)
      })

    svg.call(zoom)
  }, [movements, selectedSpecies, currentTime, timeRange, dimensions, zoomLevel])

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading migration data...</p>
        </div>
      </div>
    )
  }

  if (selectedSpecies.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <Globe className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Select Species to Begin</h3>
          <p className="text-gray-500">Choose wildlife species from the panel to visualize their migration patterns</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full w-full relative">
      <AnimatePresence>
        <motion.svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>
    </div>
  )
}

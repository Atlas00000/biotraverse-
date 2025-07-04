"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Map, Globe } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import RealMigrationMap from "./real-migration-map"
import GlobeVisualization from "./globe-visualization"
import type { AnimalMovement, Species } from "@/types/migration"

interface VisualizationToggleProps {
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

export default function VisualizationToggle(props: VisualizationToggleProps) {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d")

  return (
    <Card className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]">
      <CardContent className="h-full p-0 relative">
        {/* View Toggle - Responsive */}
        <div className="absolute top-2 md:top-4 left-2 md:left-4 z-20 flex bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-lg">
          <Button
            variant={viewMode === "2d" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("2d")}
            className="flex items-center gap-1 md:gap-2 text-xs"
          >
            <Map className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">2D Map</span>
            <span className="sm:hidden">2D</span>
          </Button>
          <Button
            variant={viewMode === "3d" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("3d")}
            className="flex items-center gap-1 md:gap-2 text-xs"
          >
            <Globe className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">3D Globe</span>
            <span className="sm:hidden">3D</span>
          </Button>
        </div>

        {/* Visualization Content */}
        <AnimatePresence mode="wait">
          {viewMode === "2d" ? (
            <motion.div
              key="2d"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <RealMigrationMap {...props} onRetry={props.onRetry} />
            </motion.div>
          ) : (
            <motion.div
              key="3d"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <GlobeVisualization
                movements={props.movements}
                selectedSpecies={props.selectedSpecies}
                currentTime={props.currentTime}
                timeRange={props.timeRange}
                isPlaying={props.isPlaying}
                loading={props.loading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

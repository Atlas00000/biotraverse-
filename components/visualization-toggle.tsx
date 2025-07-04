"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Map, Globe } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import MigrationMap from "./migration-map"
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
}

export default function VisualizationToggle(props: VisualizationToggleProps) {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d")

  return (
    <Card className="h-[600px] lg:h-[700px]">
      <CardContent className="h-full p-0 relative">
        {/* View Toggle */}
        <div className="absolute top-4 left-4 z-20 flex bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-lg">
          <Button
            variant={viewMode === "2d" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("2d")}
            className="flex items-center gap-2"
          >
            <Map className="w-4 h-4" />
            2D Map
          </Button>
          <Button
            variant={viewMode === "3d" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("3d")}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            3D Globe
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
              <MigrationMap {...props} />
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

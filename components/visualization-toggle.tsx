"use client"

import { Card, CardContent } from "@/components/ui/card"
import RealMigrationMap from "./real-migration-map"
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
  return (
    <Card className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]">
      <CardContent className="h-full p-0 relative">
        {/* Visualization Content */}
        <div className="h-full">
          <RealMigrationMap {...props} onRetry={props.onRetry} />
        </div>
      </CardContent>
    </Card>
  )
}

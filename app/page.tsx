"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Zap, Globe, Clock } from "lucide-react"
import TimelineControls from "@/components/timeline-controls"
import SpeciesSelector from "@/components/species-selector"
import DataStats from "@/components/data-stats"
import type { Species } from "@/types/migration"
import { useMigrationData } from "@/hooks/use-migration-data"
import VisualizationToggle from "@/components/visualization-toggle"
import AnalyticsDashboard from "@/components/analytics-dashboard"

export default function BioTraverse() {
  const [selectedSpecies, setSelectedSpecies] = useState<Species[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [timeRange, setTimeRange] = useState({ start: 0, end: 100 })
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showAnalytics, setShowAnalytics] = useState(false)

  const { movements, loading, error, stats, fetchMovements, isStreaming } = useMigrationData(selectedSpecies)

  useEffect(() => {
    if (selectedSpecies.length > 0) {
      fetchMovements()
    }
  }, [selectedSpecies, fetchMovements])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleSpeciesChange = (species: Species[]) => {
    setSelectedSpecies(species)
    setCurrentTime(0)
    setIsPlaying(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">BioTraverse</h1>
                <p className="text-sm text-gray-600">Wildlife Migration Tracker</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2">
                <Zap className="w-4 h-4" />
                {isStreaming ? "Live Data" : "Cached"}
              </Badge>
              <Badge variant="outline" className="gap-2">
                <Clock className="w-4 h-4" />
                {selectedSpecies.length} Species
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Species Selection</CardTitle>
                <CardDescription>Choose wildlife species to track their migration patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <SpeciesSelector
                  selectedSpecies={selectedSpecies}
                  onSpeciesChange={handleSpeciesChange}
                  loading={loading}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Playback Controls</CardTitle>
                <CardDescription>Control the migration timeline animation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handlePlayPause} disabled={selectedSpecies.length === 0} className="flex-1">
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleReset} disabled={selectedSpecies.length === 0}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <TimelineControls
                  currentTime={currentTime}
                  timeRange={timeRange}
                  isPlaying={isPlaying}
                  onTimeChange={setCurrentTime}
                  onTimeRangeChange={setTimeRange}
                  disabled={selectedSpecies.length === 0}
                />
              </CardContent>
            </Card>

            <DataStats stats={stats} loading={loading} />
          </div>

          {/* Main Visualization */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] lg:h-[700px]">
              <CardHeader>
                <CardTitle className="text-lg">Migration Visualization</CardTitle>
                <CardDescription>Real-time animated wildlife migration patterns</CardDescription>
              </CardHeader>
              <CardContent className="h-full p-0">
                <VisualizationToggle
                  movements={movements}
                  selectedSpecies={selectedSpecies}
                  currentTime={currentTime}
                  timeRange={timeRange}
                  isPlaying={isPlaying}
                  zoomLevel={zoomLevel}
                  onZoomChange={setZoomLevel}
                  loading={loading}
                  error={error}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        <AnalyticsDashboard
          movements={movements}
          selectedSpecies={selectedSpecies}
          stats={stats}
          timeRange={timeRange}
          isVisible={showAnalytics}
          onToggle={() => setShowAnalytics(!showAnalytics)}
        />
      </div>
    </div>
  )
}

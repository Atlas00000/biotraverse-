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
// import AnalyticsDashboard from "@/components/analytics-dashboard"

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 relative overflow-hidden">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-200 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-2 md:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                <Globe className="w-4 h-4 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  BioTraverse
                </h1>
                <p className="text-xs md:text-sm text-slate-500">Wildlife Migration Tracker</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Badge variant="outline" className="gap-1 md:gap-2 bg-white/80 text-xs">
                <Zap className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">{isStreaming ? "Live Data" : "Cached"}</span>
              </Badge>
              <Badge variant="outline" className="gap-1 md:gap-2 bg-white/80 text-xs">
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">{selectedSpecies.length} Species</span>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Mobile Layout - Stacked Controls */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 md:gap-4">
          {/* Left Controls Panel - Full width on mobile, sidebar on desktop */}
          <div className="xl:col-span-1 space-y-3 order-1 xl:order-1">
            {/* Species Selection */}
            <Card className="bg-white/80 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm md:text-base">Species Selection</CardTitle>
                <CardDescription className="text-xs">Choose wildlife species to track</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <SpeciesSelector
                  selectedSpecies={selectedSpecies}
                  onSpeciesChange={handleSpeciesChange}
                  loading={loading}
                />
              </CardContent>
            </Card>

            {/* Data Stats */}
            <DataStats stats={stats} loading={loading} />
          </div>

          {/* Main Visualization Area */}
          <div className="xl:col-span-4 order-2 xl:order-2">
            <Card className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] bg-white/80 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2 md:pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm md:text-base">Migration Visualization</CardTitle>
                    <CardDescription className="text-xs">Real-time animated wildlife migration patterns</CardDescription>
                  </div>
                  
                  {/* Playback Controls - Responsive layout */}
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={handlePlayPause} 
                      disabled={selectedSpecies.length === 0} 
                      size="sm"
                      className="h-8 px-2 md:px-3 text-xs md:text-sm"
                    >
                    {isPlaying ? (
                      <>
                          <Pause className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Pause</span>
                      </>
                    ) : (
                      <>
                          <Play className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Play</span>
                      </>
                    )}
                  </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleReset} 
                      disabled={selectedSpecies.length === 0}
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                  </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="h-full p-0 relative">
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
                  onRetry={fetchMovements}
                />
                
                {/* Timeline Controls - Responsive floating overlay */}
                <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 z-10">
                  <div className="bg-white/90 backdrop-blur-md rounded-lg p-2 md:p-3 shadow-lg border border-slate-200/50">
                    <TimelineControls
                      currentTime={currentTime}
                      timeRange={timeRange}
                      isPlaying={isPlaying}
                      onTimeChange={setCurrentTime}
                      onTimeRangeChange={setTimeRange}
                      disabled={selectedSpecies.length === 0}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* AnalyticsDashboard temporarily disabled for debugging */}
      {/* <AnalyticsDashboard
          movements={movements}
          selectedSpecies={selectedSpecies}
          stats={stats}
          timeRange={timeRange}
          isVisible={showAnalytics}
          onToggle={() => setShowAnalytics(!showAnalytics)}
      /> */}
    </div>
  )
}

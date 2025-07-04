"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Zap, Globe, Clock, MapPin, TrendingUp, Activity, Database } from "lucide-react"
import TimelineControls from "@/components/timeline-controls"
import SpeciesSelector from "@/components/species-selector"
import DataStats from "@/components/data-stats"
import type { Species } from "@/types/migration"
import { useMigrationData } from "@/hooks/use-migration-data"
import VisualizationToggle from "@/components/visualization-toggle"
import EnhancedControls from "@/components/enhanced-controls"

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

  useEffect(() => {
    if (!isPlaying || selectedSpecies.length === 0) return

    // Performance optimization: Adjust animation speed based on species count
    const getAnimationSpeed = (speciesCount: number) => {
      if (speciesCount <= 2) return 100 // Fast for few species
      if (speciesCount <= 4) return 150 // Medium for 3-4 species
      if (speciesCount <= 6) return 200 // Slower for 5-6 species
      return 300 // Slowest for 7+ species
    }

    const interval = setInterval(() => {
      setCurrentTime((prevTime) => {
        const newTime = prevTime + 0.5
        return newTime >= timeRange.end ? timeRange.start : newTime
      })
    }, getAnimationSpeed(selectedSpecies.length))

    return () => clearInterval(interval)
  }, [isPlaying, selectedSpecies.length, timeRange.start, timeRange.end])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 relative overflow-hidden animate-fade-in">
      {/* Background elements */}
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
              {selectedSpecies.length > 3 && (
                <Badge variant="outline" className="gap-1 md:gap-2 bg-amber-100 text-amber-800 border-amber-300 text-xs">
                  <Activity className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Performance Mode</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 md:gap-4">
          {/* Left Controls Panel */}
          <div className="xl:col-span-1 space-y-3 order-1 xl:order-1 animate-slide-in-left">
            {/* Species Selection */}
            <div className="animate-slide-in-up delay-200">
              <Card className="bg-white/80 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
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
            </div>

            {/* Data Stats */}
            <div className="animate-slide-in-up delay-300">
              <DataStats stats={stats} loading={loading} />
            </div>

            {/* Enhanced Controls */}
            <div className="animate-slide-in-up delay-400">
              <Card className="bg-white/80 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm md:text-base">Enhanced Controls</CardTitle>
                  <CardDescription className="text-xs">Advanced visualization settings</CardDescription>
              </CardHeader>
                <CardContent className="pt-0">
                  <EnhancedControls
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    onPlayPause={handlePlayPause}
                    onReset={handleReset}
                    onTimeChange={setCurrentTime}
                    disabled={selectedSpecies.length === 0}
                    selectedSpeciesCount={selectedSpecies.length}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Visualization Area */}
          <div className="xl:col-span-4 order-2 xl:order-2 animate-slide-in-right">
            <Card className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] bg-white/80 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2 md:pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm md:text-base">Migration Visualization</CardTitle>
                    <CardDescription className="text-xs">Real-time animated wildlife migration patterns</CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={handlePlayPause} 
                      disabled={selectedSpecies.length === 0} 
                      size="sm"
                      className="h-8 px-2 md:px-3 text-xs md:text-sm button-smooth"
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
                      className="h-8 w-8 p-0 button-smooth"
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

        {/* Quick Actions Section */}
        <div className="mt-6 md:mt-8 animate-slide-in-up delay-500">
          <Card className="bg-white/80 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm md:text-base">Quick Actions</CardTitle>
              <CardDescription className="text-xs">Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-auto p-3 flex flex-col items-center gap-2 text-xs"
                  onClick={handleReset}
                  disabled={selectedSpecies.length === 0}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset View</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-auto p-3 flex flex-col items-center gap-2 text-xs"
                  onClick={() => setZoomLevel(2)}
                  disabled={selectedSpecies.length === 0}
                >
                  <Globe className="w-4 h-4" />
                  <span>World View</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-auto p-3 flex flex-col items-center gap-2 text-xs"
                  onClick={() => setZoomLevel(5)}
                  disabled={selectedSpecies.length === 0}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Zoom In</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-auto p-3 flex flex-col items-center gap-2 text-xs"
                  onClick={() => setCurrentTime(50)}
                  disabled={selectedSpecies.length === 0}
                >
                  <Clock className="w-4 h-4" />
                  <span>Mid Year</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status Section */}
        <div className="mt-6 md:mt-8 animate-slide-in-up delay-600">
          <Card className="bg-white/80 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm md:text-base">System Status</CardTitle>
              <CardDescription className="text-xs">Current application state and information</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg border border-blue-200/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <div>
                      <div className="text-xs font-medium text-blue-900">Data Status</div>
                      <div className="text-xs text-blue-600">
                        {loading ? 'Loading...' : error ? 'Error' : 'Ready'}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    {movements.length} points
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg border border-green-200/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <div>
                      <div className="text-xs font-medium text-green-900">Playback</div>
                      <div className="text-xs text-green-600">
                        {isPlaying ? 'Playing' : 'Paused'}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {Math.round(currentTime)}%
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-lg border border-purple-200/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-purple-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <div>
                      <div className="text-xs font-medium text-purple-900">Connection</div>
                      <div className="text-xs text-purple-600">
                        {isStreaming ? 'Live Data' : 'Cached'}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                    {isStreaming ? 'Live' : 'Offline'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Migration Insights Section */}
        {selectedSpecies.length > 0 && (
          <div className="mt-6 md:mt-8 animate-slide-in-up delay-700">
            <Card className="bg-white/80 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm md:text-base">Migration Insights</CardTitle>
                <CardDescription className="text-xs">Key patterns and statistics from selected species</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-3 border border-blue-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                        <MapPin className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-blue-900">Distance</span>
                    </div>
                    <div className="text-lg font-bold text-blue-900">
                      {stats?.totalDistance ? `${stats.totalDistance.toFixed(0)}km` : '0km'}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-3 border border-green-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                        <TrendingUp className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-green-900">Speed</span>
                    </div>
                    <div className="text-lg font-bold text-green-900">
                      {stats?.averageSpeed ? `${stats.averageSpeed.toFixed(1)} km/h` : '0 km/h'}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-3 border border-purple-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
                        <Activity className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-purple-900">Tracks</span>
                    </div>
                    <div className="text-lg font-bold text-purple-900">
                      {stats?.activeTracks || 0}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg p-3 border border-orange-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
                        <Database className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-orange-900">Quality</span>
                    </div>
                    <div className="text-lg font-bold text-orange-900">
                      {stats?.dataQuality ? `${stats.dataQuality}%` : '0%'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-700">Selected Species</span>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {selectedSpecies.length} Active
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSpecies.map((species) => (
                      <Badge
                        key={species.id}
                        variant="secondary"
                        className="text-xs"
                        style={{ 
                          backgroundColor: `${species.color}15`, 
                          color: species.color,
                          borderColor: species.color
                        }}
                      >
                        <span className="mr-1">{species.icon}</span>
                        {species.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

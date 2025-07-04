"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Play, Pause, RotateCcw, Settings, Zap, Globe2 } from "lucide-react"
import { useState } from "react"

interface EnhancedControlsProps {
  isPlaying: boolean
  currentTime: number
  onPlayPause: () => void
  onReset: () => void
  onTimeChange: (time: number) => void
  disabled: boolean
  selectedSpeciesCount: number
}

export default function EnhancedControls({
  isPlaying,
  currentTime,
  onPlayPause,
  onReset,
  onTimeChange,
  disabled,
  selectedSpeciesCount,
}: EnhancedControlsProps) {
  const [showTrails, setShowTrails] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [showLabels, setShowLabels] = useState(true)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Enhanced Controls
        </CardTitle>
        <CardDescription>Advanced visualization settings and playback controls</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Playback Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Playback</Label>
          <div className="flex gap-2">
            <Button onClick={onPlayPause} disabled={disabled} className="flex-1">
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
            <Button variant="outline" onClick={onReset} disabled={disabled}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Timeline Position</Label>
          <Slider
            value={[currentTime]}
            onValueChange={(value) => onTimeChange(value[0])}
            max={100}
            step={1}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Start</span>
            <Badge variant="outline">{Math.round(currentTime)}%</Badge>
            <span>End</span>
          </div>
        </div>

        {/* Animation Speed */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Animation Speed</Label>
          <Slider
            value={[animationSpeed]}
            onValueChange={(value) => setAnimationSpeed(value[0])}
            min={0.1}
            max={3}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0.1x</span>
            <Badge variant="outline">{animationSpeed.toFixed(1)}x</Badge>
            <span>3x</span>
          </div>
        </div>

        {/* Visual Options */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Visual Options</Label>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <Label htmlFor="trails" className="text-sm">
                Show Migration Trails
              </Label>
            </div>
            <Switch id="trails" checked={showTrails} onCheckedChange={setShowTrails} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-green-500" />
              <Label htmlFor="labels" className="text-sm">
                Show Location Labels
              </Label>
            </div>
            <Switch id="labels" checked={showLabels} onCheckedChange={setShowLabels} />
          </div>
        </div>

        {/* Status */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Active Species</span>
            <Badge variant={selectedSpeciesCount > 0 ? "default" : "secondary"}>{selectedSpeciesCount}</Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Visualization Mode</span>
            <Badge variant="outline">3D Globe</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

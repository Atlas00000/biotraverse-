"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Play, Pause } from "lucide-react"
import { motion } from "framer-motion"

interface TimelineControlsProps {
  currentTime: number
  timeRange: { start: number; end: number }
  isPlaying: boolean
  onTimeChange: (time: number) => void
  onTimeRangeChange: (range: { start: number; end: number }) => void
  disabled: boolean
}

export default function TimelineControls({
  currentTime,
  timeRange,
  isPlaying,
  onTimeChange,
  onTimeRangeChange,
  disabled,
}: TimelineControlsProps) {
  const formatTime = (value: number) => {
    // Convert percentage to readable time format
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthIndex = Math.floor((value / 100) * 12)
    return months[Math.min(monthIndex, 11)]
  }

  const getSeason = (value: number) => {
    const monthIndex = Math.floor((value / 100) * 12)
    if (monthIndex >= 2 && monthIndex <= 4) return { name: "Spring", color: "bg-green-500", icon: "🌸" }
    if (monthIndex >= 5 && monthIndex <= 7) return { name: "Summer", color: "bg-yellow-500", icon: "☀️" }
    if (monthIndex >= 8 && monthIndex <= 10) return { name: "Fall", color: "bg-orange-500", icon: "🍂" }
    return { name: "Winter", color: "bg-blue-500", icon: "❄️" }
  }

  const getCurrentSeason = getSeason(currentTime)
  const getStartSeason = getSeason(timeRange.start)
  const getEndSeason = getSeason(timeRange.end)

  // Season markers for visual reference
  const seasonMarkers = [
    { position: 0, season: "Winter", icon: "❄️" },
    { position: 25, season: "Spring", icon: "🌸" },
    { position: 50, season: "Summer", icon: "☀️" },
    { position: 75, season: "Fall", icon: "🍂" },
  ]

  return (
    <div className="space-y-2 md:space-y-3">
                {/* Current Time Display */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-1.5 md:p-2 border border-blue-200/50">
            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-blue-600 mb-1">
                <span>Migration Progress</span>
                <span>{Math.round(currentTime)}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${currentTime}%` }}
                ></div>
              </div>
            </div>
        <div className="flex items-center justify-between mb-1 md:mb-1.5">
          <div className="flex items-center gap-1 md:gap-1.5">
            <Clock className="w-3 h-3 text-blue-600" />
            <Label className="text-xs font-medium text-blue-900">Current Time</Label>
          </div>
          <Badge variant="outline" className="bg-white/80 text-xs">
            {isPlaying ? (
              <motion.div className="flex items-center gap-1">
                <Play className="w-2.5 h-2.5 text-green-600" />
                <span className="text-xs hidden sm:inline">Playing</span>
              </motion.div>
            ) : (
              <motion.div className="flex items-center gap-1">
                <Pause className="w-2.5 h-2.5 text-orange-600" />
                <span className="text-xs hidden sm:inline">Paused</span>
              </motion.div>
            )}
          </Badge>
        </div>

        {/* Enhanced Slider with Visual Markers */}
        <div className="relative px-1">
          <Slider
            value={[currentTime]}
            onValueChange={(value) => onTimeChange(value[0])}
            max={100}
            step={1}
            disabled={disabled}
            className="w-full"
          />
          
          {/* Season Markers */}
          <div className="relative mt-1">
            {seasonMarkers.map((marker) => (
              <div
                key={marker.season}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${marker.position}%` }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">{marker.icon}</span>
                  <div className="w-px h-1.5 bg-gray-300"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Current Time Display */}
          <div className="flex justify-between items-center mt-1 md:mt-1.5">
            <div className="text-xs text-gray-500">Jan</div>
            <motion.div
              key={currentTime}
              initial={{ scale: 1.05, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <div className="flex items-center gap-1 justify-center">
                <span className="text-xs font-bold text-blue-900">{formatTime(currentTime)}</span>
                <Badge className={`${getCurrentSeason.color} text-white text-xs px-1 py-0`}>
                  {getCurrentSeason.icon}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                {Math.round(currentTime)}%
              </div>
            </motion.div>
            <div className="text-xs text-gray-500">Dec</div>
          </div>
        </div>
      </div>

      {/* Time Range Controls */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-1.5 md:p-2 border border-green-200/50">
        <div className="flex items-center gap-1 md:gap-1.5 mb-1 md:mb-1.5">
          <Calendar className="w-3 h-3 text-green-600" />
          <Label className="text-xs font-medium text-green-900">Time Range</Label>
        </div>
        
        <div className="px-1">
          <Slider
            value={[timeRange.start, timeRange.end]}
            onValueChange={(value) => onTimeRangeChange({ start: value[0], end: value[1] })}
            max={100}
            step={1}
            disabled={disabled}
            className="w-full"
          />
          
          {/* Range Display */}
          <div className="flex justify-between items-center mt-1 md:mt-1.5">
            <motion.div
              key={timeRange.start}
              initial={{ scale: 1.02 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="text-xs font-medium text-green-900">{formatTime(timeRange.start)}</div>
              <Badge variant="outline" className="bg-white/80 text-xs px-1 py-0 mt-1">
                {getStartSeason.icon}
              </Badge>
            </motion.div>
            
            <div className="text-xs text-gray-500">
              <div className="text-center">
                <div className="font-medium hidden sm:block">Range</div>
                <div>{Math.round(timeRange.end - timeRange.start)}%</div>
              </div>
            </div>
            
            <motion.div
              key={timeRange.end}
              initial={{ scale: 1.02 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="text-xs font-medium text-green-900">{formatTime(timeRange.end)}</div>
              <Badge variant="outline" className="bg-white/80 text-xs px-1 py-0 mt-1">
                {getEndSeason.icon}
              </Badge>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

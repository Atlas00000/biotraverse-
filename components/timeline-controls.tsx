"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Calendar, Clock } from "lucide-react"

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

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4" />
          <Label className="text-sm font-medium">Current Time</Label>
        </div>
        <div className="px-2">
          <Slider
            value={[currentTime]}
            onValueChange={(value) => onTimeChange(value[0])}
            max={100}
            step={1}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Start</span>
            <span className="font-medium">{formatTime(currentTime)}</span>
            <span>End</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4" />
          <Label className="text-sm font-medium">Time Range</Label>
        </div>
        <div className="px-2">
          <Slider
            value={[timeRange.start, timeRange.end]}
            onValueChange={(value) => onTimeRangeChange({ start: value[0], end: value[1] })}
            max={100}
            step={1}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(timeRange.start)}</span>
            <span>{formatTime(timeRange.end)}</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <p>Timeline represents a full migration cycle. Use the range slider to focus on specific periods.</p>
      </div>
    </div>
  )
}

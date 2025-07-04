"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, MapPin, Clock, Database } from "lucide-react"
import type { MigrationStats } from "@/types/migration"

interface DataStatsProps {
  stats: MigrationStats | null
  loading: boolean
}

export default function DataStats({ stats, loading }: DataStatsProps) {
  if (loading || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Statistics</CardTitle>
          <CardDescription>Migration data insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Data Statistics</CardTitle>
        <CardDescription>Real-time migration insights</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Database className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            <div className="text-lg font-bold text-blue-900">{stats.totalRecords.toLocaleString()}</div>
            <div className="text-xs text-blue-600">Records</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <MapPin className="w-5 h-5 mx-auto mb-1 text-green-600" />
            <div className="text-lg font-bold text-green-900">{stats.totalDistance.toFixed(0)}km</div>
            <div className="text-xs text-green-600">Distance</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Active Tracks</span>
            <Badge variant="secondary">{stats.activeTracks}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Avg Speed</span>
            <Badge variant="outline">{stats.averageSpeed.toFixed(1)} km/h</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Update</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{stats.lastUpdate}</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Data Quality</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.dataQuality}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">{stats.dataQuality}% complete</div>
        </div>
      </CardContent>
    </Card>
  )
}

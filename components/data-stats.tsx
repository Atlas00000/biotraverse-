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
      <Card className="bg-white/80 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
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
    <Card className="bg-white/80 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          Data Statistics
        </CardTitle>
        <CardDescription className="text-xs">Real-time migration insights</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Enhanced Metric Cards */}
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {/* Records Card */}
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-2 md:p-3 border border-blue-200/50 hover:border-blue-300/50 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-1.5 md:mb-2">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Database className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
                <div className="text-xs text-blue-600 font-medium bg-blue-100/50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                  Total
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm md:text-lg font-bold text-blue-900">
                  {stats.totalRecords.toLocaleString()}
                </div>
                <div className="text-xs text-blue-700 font-medium">Data Records</div>
              </div>
            </div>
          </div>

          {/* Distance Card */}
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-100/50 rounded-xl p-2 md:p-3 border border-green-200/50 hover:border-green-300/50 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-1.5 md:mb-2">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
                <div className="text-xs text-green-600 font-medium bg-green-100/50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                  Tracked
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm md:text-lg font-bold text-green-900">
                  {stats.totalDistance.toFixed(0)}km
                </div>
                <div className="text-xs text-green-700 font-medium">Total Distance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 gap-2 md:gap-3">
          {/* Active Tracks */}
          <div className="flex items-center justify-between p-2 md:p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200/50 hover:border-purple-300/50 transition-all duration-300">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="text-xs font-medium text-purple-900">Active Tracks</div>
                <div className="text-xs text-purple-600 hidden sm:block">Currently monitored</div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 font-semibold text-xs">
              {stats.activeTracks}
            </Badge>
          </div>

          {/* Average Speed */}
          <div className="flex items-center justify-between p-2 md:p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200/50 hover:border-orange-300/50 transition-all duration-300">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-md flex items-center justify-center">
                <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-orange-900">Average Speed</div>
                <div className="text-xs text-orange-600 hidden sm:block">Migration velocity</div>
              </div>
            </div>
            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 font-semibold text-xs">
              {stats.averageSpeed.toFixed(1)} km/h
            </Badge>
          </div>

          {/* Last Update */}
          <div className="flex items-center justify-between p-2 md:p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200/50 hover:border-cyan-300/50 transition-all duration-300">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-md flex items-center justify-center">
                <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
              </div>
              <div>
                <div className="text-xs font-medium text-cyan-900">Last Update</div>
                <div className="text-xs text-cyan-600 hidden sm:block">Data freshness</div>
              </div>
            </div>
            <div className="text-xs text-cyan-700 font-medium bg-cyan-100/50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
              {stats.lastUpdate}
            </div>
          </div>
        </div>

        {/* Enhanced Data Quality */}
        <div className="pt-3 border-t border-gray-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-md flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-900">Data Quality</span>
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs font-semibold ${
                stats.dataQuality >= 90 ? 'bg-green-100 text-green-700 border-green-200' :
                stats.dataQuality >= 70 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                'bg-red-100 text-red-700 border-red-200'
              }`}
            >
              {stats.dataQuality}% Complete
            </Badge>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  stats.dataQuality >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  stats.dataQuality >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-red-500 to-pink-500'
                }`}
                style={{ width: `${stats.dataQuality}%` }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
            
            {/* Quality indicators */}
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">Poor</span>
              <span className="text-xs text-gray-500">Good</span>
              <span className="text-xs text-gray-500">Excellent</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

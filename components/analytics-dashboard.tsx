"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, Download, Share2, Filter } from "lucide-react"
import MigrationAnalytics from "./migration-analytics"
import type { AnimalMovement, Species, MigrationStats } from "@/types/migration"

interface AnalyticsDashboardProps {
  movements: AnimalMovement[]
  selectedSpecies: Species[]
  stats: MigrationStats | null
  timeRange: { start: number; end: number }
  isVisible: boolean
  onToggle: () => void
}

export default function AnalyticsDashboard({
  movements,
  selectedSpecies,
  stats,
  timeRange,
  isVisible,
  onToggle,
}: AnalyticsDashboardProps) {
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv" | "json">("pdf")

  const handleExport = () => {
    // Simulate export functionality
    const data = {
      species: selectedSpecies.map((s) => s.name),
      totalMovements: movements.length,
      timeRange,
      exportedAt: new Date().toISOString(),
    }

    console.log(`Exporting analytics as ${exportFormat}:`, data)
    // In a real app, this would trigger actual export
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={onToggle} className="shadow-lg">
          <BarChart3 className="w-4 h-4 mr-2" />
          Analytics
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Migration Analytics Dashboard</h2>
            <p className="text-gray-600">
              Comprehensive analysis of {selectedSpecies.length} species • {movements.length} data points
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <Button variant="outline" onClick={onToggle}>
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <MigrationAnalytics
            movements={movements}
            selectedSpecies={selectedSpecies}
            stats={stats}
            timeRange={timeRange}
          />
        </div>
      </div>
    </div>
  )
}

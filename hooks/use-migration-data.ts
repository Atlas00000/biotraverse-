"use client"

import { useState, useCallback, useRef } from "react"
import type { AnimalMovement, Species, MigrationStats } from "@/types/migration"
import { generateMockMovements } from "@/utils/mock-data"

export function useMigrationData(selectedSpecies: Species[]) {
  const [movements, setMovements] = useState<AnimalMovement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<MigrationStats | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const workerRef = useRef<Worker | null>(null)

  const fetchMovements = useCallback(async () => {
    if (selectedSpecies.length === 0) {
      setMovements([])
      setStats(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Performance optimization: Reduce data points for multiple species
      const getMovementCount = (speciesCount: number) => {
        if (speciesCount <= 2) return 20 // Full detail for 1-2 species
        if (speciesCount <= 4) return 15 // Medium detail for 3-4 species
        if (speciesCount <= 6) return 10 // Lower detail for 5-6 species
        return 8 // Minimal detail for 7+ species
      }
      
      const movementCount = getMovementCount(selectedSpecies.length)
      const mockMovements = selectedSpecies.flatMap((species) => generateMockMovements(species, movementCount))

      setMovements(mockMovements)

      // Calculate stats
      const totalDistance = mockMovements.reduce((sum, movement, index, arr) => {
        if (index === 0) return sum
        const prev = arr[index - 1]
        if (prev.speciesId === movement.speciesId) {
          // Simple distance calculation (Haversine would be more accurate)
          const latDiff = movement.latitude - prev.latitude
          const lonDiff = movement.longitude - prev.longitude
          const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111 // Rough km conversion
          return sum + distance
        }
        return sum
      }, 0)

      const avgSpeed =
        mockMovements.filter((m) => m.speed).reduce((sum, m) => sum + (m.speed || 0), 0) /
        mockMovements.filter((m) => m.speed).length

      setStats({
        totalRecords: mockMovements.length,
        totalDistance,
        activeTracks: selectedSpecies.length,
        averageSpeed: avgSpeed || 0,
        lastUpdate: new Date().toLocaleTimeString(),
        dataQuality: 85 + Math.random() * 10,
      })

      setIsStreaming(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch migration data")
    } finally {
      setLoading(false)
    }
  }, [selectedSpecies])

  return {
    movements,
    loading,
    error,
    stats,
    fetchMovements,
    isStreaming,
  }
}

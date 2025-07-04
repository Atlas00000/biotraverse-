import type { AnimalMovement, MigrationPath } from "@/types/migration"

export function processMovementPaths(
  movements: AnimalMovement[],
  timeRange: { start: number; end: number },
): MigrationPath[] {
  // Group movements by species and animal
  const groupedMovements = movements.reduce(
    (acc, movement) => {
      const key = `${movement.speciesId}-${movement.animalId}`
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(movement)
      return acc
    },
    {} as Record<string, AnimalMovement[]>,
  )

  // Convert to paths
  return Object.entries(groupedMovements).map(([key, animalMovements]) => {
    const [speciesId, animalId] = key.split("-")

    // Sort by timestamp
    const sortedMovements = animalMovements.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )

    // Filter by time range
    const totalDuration =
      new Date(sortedMovements[sortedMovements.length - 1].timestamp).getTime() -
      new Date(sortedMovements[0].timestamp).getTime()

    const startTime = new Date(sortedMovements[0].timestamp).getTime() + (totalDuration * timeRange.start) / 100
    const endTime = new Date(sortedMovements[0].timestamp).getTime() + (totalDuration * timeRange.end) / 100

    const filteredMovements = sortedMovements.filter((movement) => {
      const movementTime = new Date(movement.timestamp).getTime()
      return movementTime >= startTime && movementTime <= endTime
    })

    // Extract coordinates and calculate total distance
    const coordinates: [number, number][] = filteredMovements.map((m) => [m.longitude, m.latitude])
    const timestamps = filteredMovements.map((m) => m.timestamp)

    const totalDistance = calculatePathDistance(coordinates)
    const duration =
      filteredMovements.length > 1
        ? new Date(filteredMovements[filteredMovements.length - 1].timestamp).getTime() -
          new Date(filteredMovements[0].timestamp).getTime()
        : 0

    return {
      speciesId,
      animalId,
      coordinates,
      timestamps,
      totalDistance,
      duration,
    }
  })
}

export function calculatePathDistance(coordinates: [number, number][]): number {
  let totalDistance = 0

  for (let i = 1; i < coordinates.length; i++) {
    const [lon1, lat1] = coordinates[i - 1]
    const [lon2, lat2] = coordinates[i]
    totalDistance += haversineDistance(lat1, lon1, lat2, lon2)
  }

  return totalDistance
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function interpolatePath(coordinates: [number, number][], progress: number): [number, number] | null {
  if (coordinates.length === 0) return null
  if (coordinates.length === 1) return coordinates[0]

  const totalSegments = coordinates.length - 1
  const segmentProgress = progress * totalSegments
  const segmentIndex = Math.floor(segmentProgress)
  const localProgress = segmentProgress - segmentIndex

  if (segmentIndex >= totalSegments) {
    return coordinates[coordinates.length - 1]
  }

  const [lon1, lat1] = coordinates[segmentIndex]
  const [lon2, lat2] = coordinates[segmentIndex + 1]

  const interpolatedLon = lon1 + (lon2 - lon1) * localProgress
  const interpolatedLat = lat1 + (lat2 - lat1) * localProgress

  return [interpolatedLon, interpolatedLat]
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Ramer-Douglas-Peucker algorithm for path simplification
export function simplifyPath(coordinates: [number, number][], tolerance: number): [number, number][] {
  if (coordinates.length <= 2) return coordinates

  let maxDistance = 0
  let maxIndex = 0

  for (let i = 1; i < coordinates.length - 1; i++) {
    const distance = perpendicularDistance(coordinates[i], coordinates[0], coordinates[coordinates.length - 1])

    if (distance > maxDistance) {
      maxDistance = distance
      maxIndex = i
    }
  }

  if (maxDistance > tolerance) {
    const leftPath = simplifyPath(coordinates.slice(0, maxIndex + 1), tolerance)
    const rightPath = simplifyPath(coordinates.slice(maxIndex), tolerance)

    return [...leftPath.slice(0, -1), ...rightPath]
  } else {
    return [coordinates[0], coordinates[coordinates.length - 1]]
  }
}

function perpendicularDistance(
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number],
): number {
  const [x0, y0] = point
  const [x1, y1] = lineStart
  const [x2, y2] = lineEnd

  const numerator = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1)
  const denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2))

  return numerator / denominator
}

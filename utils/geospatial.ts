import type { AnimalMovement, MigrationPath, Species } from "@/types/migration"

export function processMovementPaths(
  movements: AnimalMovement[],
  timeRange: { start: number; end: number },
  currentTime: number = 0,
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

    // Calculate time range within the current time window
    const totalDuration =
      new Date(sortedMovements[sortedMovements.length - 1].timestamp).getTime() -
      new Date(sortedMovements[0].timestamp).getTime()

    const rangeStartTime = new Date(sortedMovements[0].timestamp).getTime() + (totalDuration * timeRange.start) / 100
    const rangeEndTime = new Date(sortedMovements[0].timestamp).getTime() + (totalDuration * timeRange.end) / 100
    
    // Calculate current time position within the range
    const currentTimeInRange = rangeStartTime + (rangeEndTime - rangeStartTime) * (currentTime / 100)

    // Filter movements up to the current time position
    const filteredMovements = sortedMovements.filter((movement) => {
      const movementTime = new Date(movement.timestamp).getTime()
      return movementTime >= rangeStartTime && movementTime <= currentTimeInRange
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

// Calculate bounding box for a set of coordinates
export function calculateBoundingBox(coordinates: [number, number][]): {
  north: number
  south: number
  east: number
  west: number
} | null {
  if (coordinates.length === 0) return null

  let north = coordinates[0][1]
  let south = coordinates[0][1]
  let east = coordinates[0][0]
  let west = coordinates[0][0]

  for (const [lon, lat] of coordinates) {
    north = Math.max(north, lat)
    south = Math.min(south, lat)
    east = Math.max(east, lon)
    west = Math.min(west, lon)
  }

  return { north, south, east, west }
}

// Calculate optimal center and zoom for multiple bounding boxes
export function calculateOptimalView(boundingBoxes: Array<{
  north: number
  south: number
  east: number
  west: number
}>): { center: [number, number]; zoom: number } {
  if (boundingBoxes.length === 0) {
    return { center: [20, 0], zoom: 2 } // Default world view
  }

  // Find the combined bounding box
  let combinedNorth = boundingBoxes[0].north
  let combinedSouth = boundingBoxes[0].south
  let combinedEast = boundingBoxes[0].east
  let combinedWest = boundingBoxes[0].west

  for (const bbox of boundingBoxes) {
    combinedNorth = Math.max(combinedNorth, bbox.north)
    combinedSouth = Math.min(combinedSouth, bbox.south)
    combinedEast = Math.max(combinedEast, bbox.east)
    combinedWest = Math.min(combinedWest, bbox.west)
  }

  // Calculate center
  const centerLat = (combinedNorth + combinedSouth) / 2
  const centerLng = (combinedEast + combinedWest) / 2

  // Calculate optimal zoom level
  const latDiff = combinedNorth - combinedSouth
  const lngDiff = combinedEast - combinedWest
  const maxDiff = Math.max(latDiff, lngDiff)

  // Zoom level calculation based on the maximum difference
  let zoom = 2 // Default zoom
  if (maxDiff > 0) {
    // Logarithmic zoom calculation
    zoom = Math.floor(14 - Math.log2(maxDiff * 2))
    zoom = Math.max(1, Math.min(18, zoom)) // Clamp between 1 and 18
  }

  // Add some padding by reducing zoom slightly
  zoom = Math.max(1, zoom - 1)

  return { center: [centerLat, centerLng], zoom }
}

// Calculate bounding box for selected species movements
export function calculateSpeciesBoundingBox(
  movements: AnimalMovement[],
  selectedSpecies: Species[]
): { center: [number, number]; zoom: number } {
  if (selectedSpecies.length === 0 || movements.length === 0) {
    return { center: [20, 0], zoom: 2 }
  }

  // Filter movements for selected species
  const selectedSpeciesIds = selectedSpecies.map(s => s.id)
  const filteredMovements = movements.filter(m => selectedSpeciesIds.includes(m.speciesId))

  if (filteredMovements.length === 0) {
    return { center: [20, 0], zoom: 2 }
  }

  // Extract all coordinates
  const allCoordinates: [number, number][] = filteredMovements.map(m => [m.longitude, m.latitude])

  // Calculate bounding box
  const bbox = calculateBoundingBox(allCoordinates)
  if (!bbox) {
    return { center: [20, 0], zoom: 2 }
  }

  // Calculate optimal view
  return calculateOptimalView([bbox])
}

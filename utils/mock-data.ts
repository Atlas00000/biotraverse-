import type { AnimalMovement, Species } from "@/types/migration"

// Migration route templates for different species
const MIGRATION_ROUTES = {
  "arctic-tern": [
    { lat: 71.0, lon: -8.0 }, // Arctic
    { lat: 60.0, lon: -3.0 }, // North Sea
    { lat: 45.0, lon: -10.0 }, // Atlantic
    { lat: 20.0, lon: -20.0 }, // West Africa
    { lat: -10.0, lon: -15.0 }, // South Atlantic
    { lat: -35.0, lon: 20.0 }, // South Africa
    { lat: -60.0, lon: 0.0 }, // Antarctic
  ],
  "gray-whale": [
    { lat: 60.0, lon: -165.0 }, // Alaska
    { lat: 55.0, lon: -160.0 }, // Bering Sea
    { lat: 45.0, lon: -125.0 }, // Pacific Northwest
    { lat: 35.0, lon: -120.0 }, // California
    { lat: 25.0, lon: -110.0 }, // Baja California
  ],
  "monarch-butterfly": [
    { lat: 45.0, lon: -75.0 }, // Canada
    { lat: 40.0, lon: -85.0 }, // Great Lakes
    { lat: 35.0, lon: -95.0 }, // Texas
    { lat: 25.0, lon: -100.0 }, // Central Mexico
    { lat: 19.0, lon: -100.0 }, // Michoacán
  ],
  caribou: [
    { lat: 68.0, lon: -133.0 }, // Arctic Canada
    { lat: 65.0, lon: -125.0 }, // Mackenzie River
    { lat: 60.0, lon: -115.0 }, // Alberta
    { lat: 55.0, lon: -110.0 }, // Saskatchewan
  ],
  "sea-turtle": [
    { lat: 26.0, lon: -80.0 }, // Florida
    { lat: 30.0, lon: -75.0 }, // Atlantic
    { lat: 35.0, lon: -65.0 }, // Sargasso Sea
    { lat: 40.0, lon: -50.0 }, // North Atlantic
    { lat: 45.0, lon: -40.0 }, // Newfoundland
  ],
  wildebeest: [
    { lat: -1.5, lon: 34.8 }, // Serengeti
    { lat: -1.0, lon: 35.2 }, // Northern Serengeti
    { lat: -1.3, lon: 35.0 }, // Mara River
    { lat: -1.8, lon: 34.5 }, // Southern Serengeti
  ],
}

export function generateMockMovements(species: Species, count: number): AnimalMovement[] {
  const route = MIGRATION_ROUTES[species.id as keyof typeof MIGRATION_ROUTES] || MIGRATION_ROUTES["arctic-tern"]
  const movements: AnimalMovement[] = []

  // Generate fewer animals for better performance
  const animalCount = Math.min(Math.ceil(count / 15), 3) // Max 3 animals per species

  for (let animalIndex = 0; animalIndex < animalCount; animalIndex++) {
    const animalId = `${species.id}-${animalIndex + 1}`
    const pointsPerAnimal = Math.floor(count / animalCount)

    for (let i = 0; i < pointsPerAnimal; i++) {
      const progress = i / (pointsPerAnimal - 1)
      const routeIndex = progress * (route.length - 1)
      const lowerIndex = Math.floor(routeIndex)
      const upperIndex = Math.min(lowerIndex + 1, route.length - 1)
      const localProgress = routeIndex - lowerIndex

      // Interpolate between route points
      const lowerPoint = route[lowerIndex]
      const upperPoint = route[upperIndex]

      const lat = lowerPoint.lat + (upperPoint.lat - lowerPoint.lat) * localProgress
      const lon = lowerPoint.lon + (upperPoint.lon - lowerPoint.lon) * localProgress

      // Add some random variation
      const latVariation = (Math.random() - 0.5) * 2
      const lonVariation = (Math.random() - 0.5) * 2

      // Generate timestamp (spread over a year)
      const baseDate = new Date("2024-01-01")
      const dayOffset = Math.floor(progress * 365)
      const timestamp = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000)

      movements.push({
        id: `${animalId}-${i}`,
        speciesId: species.id,
        animalId,
        timestamp: timestamp.toISOString(),
        latitude: lat + latVariation,
        longitude: lon + lonVariation,
        altitude: Math.random() * 1000,
        speed: 5 + Math.random() * 20,
        heading: Math.random() * 360,
        accuracy: 5 + Math.random() * 10,
      })
    }
  }

  return movements.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

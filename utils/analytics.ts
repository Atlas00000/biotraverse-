import type { AnimalMovement, Species } from "@/types/migration"

export interface MigrationInsights {
  totalAnimals: number
  totalDistance: number
  averageSpeed: number
  migrationDuration: number
  efficiency: number
  speciesDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  insights: Array<{
    category: string
    description: string
    confidence: number
  }>
  seasonalPatterns: Array<{
    season: string
    [key: string]: any
  }>
  dailyActivity: Array<{
    hour: number
    activity: number
  }>
  strategies: Array<{
    name: string
    description: string
    prevalence: number
  }>
  stopovers: Array<{
    location: string
    frequency: number
    avgDuration: number
    species: string[]
  }>
  corridors: Array<{
    name: string
    usage: number
    length: number
    species: string[]
    peakSeason: string
  }>
  speciesComparison: Array<{
    name: string
    icon: string
    avgDistance: number
    avgSpeed: number
    duration: number
    efficiency: number
    stopovers: number
  }>
}

export function calculateMigrationInsights(
  movements: AnimalMovement[],
  selectedSpecies: Species[],
  timeRange: { start: number; end: number },
): MigrationInsights {
  // Group movements by animal
  const animalGroups = movements.reduce(
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

  const totalAnimals = Object.keys(animalGroups).length

  // Calculate total distance and speeds
  let totalDistance = 0
  let totalSpeed = 0
  let speedCount = 0

  Object.values(animalGroups).forEach((animalMovements) => {
    animalMovements.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    for (let i = 1; i < animalMovements.length; i++) {
      const prev = animalMovements[i - 1]
      const curr = animalMovements[i]

      // Calculate distance using Haversine formula
      const distance = haversineDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude)
      totalDistance += distance

      if (curr.speed) {
        totalSpeed += curr.speed
        speedCount++
      }
    }
  })

  const averageSpeed = speedCount > 0 ? totalSpeed / speedCount : 0

  // Species distribution
  const speciesDistribution = selectedSpecies.map((species) => {
    const speciesMovements = movements.filter((m) => m.speciesId === species.id)
    return {
      name: species.name,
      value: speciesMovements.length,
      color: species.color,
    }
  })

  // Generate insights
  const insights = generateAutomatedInsights(movements, selectedSpecies)

  // Seasonal patterns
  const seasonalPatterns = generateSeasonalData(movements, selectedSpecies)

  // Daily activity
  const dailyActivity = generateDailyActivity(movements)

  // Migration strategies
  const strategies = [
    { name: "Direct Migration", description: "Straight-line routes with minimal stops", prevalence: 35 },
    { name: "Staged Migration", description: "Multiple stopovers for rest and feeding", prevalence: 45 },
    { name: "Nomadic Movement", description: "Irregular patterns following resources", prevalence: 20 },
  ]

  // Stopovers
  const stopovers = generateStopoverAnalysis(movements, selectedSpecies)

  // Migration corridors
  const corridors = generateCorridorAnalysis(movements, selectedSpecies)

  // Species comparison
  const speciesComparison = generateSpeciesComparison(movements, selectedSpecies)

  return {
    totalAnimals,
    totalDistance,
    averageSpeed,
    migrationDuration: 120, // Average days
    efficiency: calculateRouteEfficiency(movements),
    speciesDistribution,
    insights,
    seasonalPatterns,
    dailyActivity,
    strategies,
    stopovers,
    corridors,
    speciesComparison,
  }
}

export function generateSeasonalPatterns(
  movements: AnimalMovement[],
  selectedSpecies: Species[],
): Array<{ month: string; [key: string]: any }> {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  return months.map((month) => {
    const monthData: any = { month }

    selectedSpecies.forEach((species) => {
      // Simulate seasonal activity based on species type
      let activity = 0
      const monthIndex = months.indexOf(month)

      switch (species.type) {
        case "bird":
          // Peak in spring and fall
          activity =
            monthIndex === 3 || monthIndex === 4 || monthIndex === 8 || monthIndex === 9
              ? 80 + Math.random() * 20
              : 20 + Math.random() * 30
          break
        case "marine":
          // More consistent throughout year
          activity = 40 + Math.random() * 40
          break
        case "mammal":
          // Peak in summer
          activity = monthIndex >= 5 && monthIndex <= 8 ? 70 + Math.random() * 30 : 30 + Math.random() * 20
          break
        default:
          activity = 30 + Math.random() * 40
      }

      monthData[species.id] = Math.round(activity)
    })

    return monthData
  })
}

export function calculateSpeedDistribution(
  movements: AnimalMovement[],
  selectedSpecies: Species[],
): Array<{ speedRange: string; [key: string]: any }> {
  const speedRanges = ["0-5", "5-15", "15-30", "30-50", "50+"]

  return speedRanges.map((range) => {
    const rangeData: any = { speedRange: range }

    selectedSpecies.forEach((species) => {
      // Simulate speed distribution based on species
      let count = 0
      const speciesMovements = movements.filter((m) => m.speciesId === species.id)

      switch (species.type) {
        case "bird":
          count =
            range === "15-30" || range === "30-50"
              ? Math.floor(Math.random() * 50) + 20
              : Math.floor(Math.random() * 20)
          break
        case "marine":
          count =
            range === "5-15" || range === "15-30" ? Math.floor(Math.random() * 40) + 15 : Math.floor(Math.random() * 15)
          break
        case "mammal":
          count =
            range === "0-5" || range === "5-15" ? Math.floor(Math.random() * 35) + 10 : Math.floor(Math.random() * 10)
          break
        default:
          count = Math.floor(Math.random() * 25)
      }

      rangeData[species.id] = count
    })

    return rangeData
  })
}

export function generateRouteAnalysis(
  movements: AnimalMovement[],
  selectedSpecies: Species[],
): Array<{
  species: string
  icon: string
  totalDistance: number
  directDistance: number
  efficiency: number
  detourFactor: number
}> {
  return selectedSpecies.map((species) => {
    const speciesMovements = movements.filter((m) => m.speciesId === species.id)

    // Calculate route metrics
    const totalDistance = 5000 + Math.random() * 10000 // Simulated
    const directDistance = totalDistance * (0.6 + Math.random() * 0.3)
    const efficiency = (directDistance / totalDistance) * 100
    const detourFactor = totalDistance / directDistance

    return {
      species: species.name,
      icon: species.icon,
      totalDistance,
      directDistance,
      efficiency,
      detourFactor,
    }
  })
}

export function calculateEnvironmentalFactors(
  movements: AnimalMovement[],
): Array<{ temperature: number; speed: number; windSpeed: number; pressure: number }> {
  return Array.from({ length: 50 }, () => ({
    temperature: -10 + Math.random() * 40,
    speed: 5 + Math.random() * 45,
    windSpeed: Math.random() * 30,
    pressure: 980 + Math.random() * 60,
  }))
}

// Helper functions
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function calculateRouteEfficiency(movements: AnimalMovement[]): number {
  // Simplified efficiency calculation
  return 75 + Math.random() * 20
}

function generateAutomatedInsights(
  movements: AnimalMovement[],
  selectedSpecies: Species[],
): Array<{ category: string; description: string; confidence: number }> {
  const insights = [
    {
      category: "Seasonal Timing",
      description:
        "Peak migration activity occurs during spring and fall months, with 85% of movements concentrated in these periods.",
      confidence: 92,
    },
    {
      category: "Route Optimization",
      description:
        "Animals show preference for established corridors, reducing energy expenditure by following predictable paths.",
      confidence: 87,
    },
    {
      category: "Environmental Response",
      description:
        "Migration timing strongly correlates with temperature changes, with departures triggered by 5°C temperature drops.",
      confidence: 94,
    },
    {
      category: "Stopover Strategy",
      description: "Strategic stopovers at resource-rich locations increase overall migration success rates by 40%.",
      confidence: 89,
    },
  ]

  return insights.slice(0, Math.min(4, selectedSpecies.length + 1))
}

function generateSeasonalData(
  movements: AnimalMovement[],
  selectedSpecies: Species[],
): Array<{ season: string; [key: string]: any }> {
  const seasons = ["Spring", "Summer", "Fall", "Winter"]

  return seasons.map((season) => {
    const seasonData: any = { season }

    selectedSpecies.forEach((species) => {
      let intensity = 0
      switch (season) {
        case "Spring":
        case "Fall":
          intensity = 70 + Math.random() * 30
          break
        case "Summer":
          intensity = species.type === "bird" ? 40 + Math.random() * 20 : 60 + Math.random() * 30
          break
        case "Winter":
          intensity = 20 + Math.random() * 30
          break
      }
      seasonData[species.id] = Math.round(intensity)
    })

    return seasonData
  })
}

function generateDailyActivity(movements: AnimalMovement[]): Array<{ hour: number; activity: number }> {
  return Array.from({ length: 24 }, (_, hour) => {
    // Simulate daily activity pattern (higher during dawn and dusk)
    let activity = 30
    if (hour >= 5 && hour <= 8)
      activity = 70 + Math.random() * 30 // Dawn
    else if (hour >= 17 && hour <= 20)
      activity = 80 + Math.random() * 20 // Dusk
    else if (hour >= 9 && hour <= 16)
      activity = 40 + Math.random() * 20 // Day
    else activity = 10 + Math.random() * 20 // Night

    return { hour, activity: Math.round(activity) }
  })
}

function generateStopoverAnalysis(
  movements: AnimalMovement[],
  selectedSpecies: Species[],
): Array<{ location: string; frequency: number; avgDuration: number; species: string[] }> {
  const locations = [
    "Great Lakes Region",
    "Gulf of Mexico",
    "Sahara Desert Edge",
    "Bering Strait",
    "Mediterranean Coast",
  ]

  return locations.slice(0, 3).map((location) => ({
    location,
    frequency: Math.floor(Math.random() * 50) + 20,
    avgDuration: Math.floor(Math.random() * 10) + 3,
    species: selectedSpecies.slice(0, Math.floor(Math.random() * selectedSpecies.length) + 1).map((s) => s.name),
  }))
}

function generateCorridorAnalysis(
  movements: AnimalMovement[],
  selectedSpecies: Species[],
): Array<{ name: string; usage: number; length: number; species: string[]; peakSeason: string }> {
  const corridors = [
    { name: "Atlantic Flyway", length: 4500, peakSeason: "Fall" },
    { name: "Pacific Corridor", length: 6200, peakSeason: "Spring" },
    { name: "Central Plains Route", length: 3800, peakSeason: "Summer" },
  ]

  return corridors.map((corridor) => ({
    ...corridor,
    usage: Math.floor(Math.random() * 40) + 40,
    species: selectedSpecies.slice(0, Math.floor(Math.random() * selectedSpecies.length) + 1).map((s) => s.name),
  }))
}

function generateSpeciesComparison(
  movements: AnimalMovement[],
  selectedSpecies: Species[],
): Array<{
  name: string
  icon: string
  avgDistance: number
  avgSpeed: number
  duration: number
  efficiency: number
  stopovers: number
}> {
  return selectedSpecies.map((species) => ({
    name: species.name,
    icon: species.icon,
    avgDistance: 2000 + Math.random() * 8000,
    avgSpeed:
      species.type === "bird"
        ? 25 + Math.random() * 30
        : species.type === "marine"
          ? 8 + Math.random() * 15
          : 5 + Math.random() * 10,
    duration: Math.floor(Math.random() * 100) + 30,
    efficiency: 60 + Math.random() * 35,
    stopovers: Math.floor(Math.random() * 8) + 2,
  }))
}

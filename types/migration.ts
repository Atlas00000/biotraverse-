export interface Species {
  id: string
  name: string
  scientificName: string
  icon: string
  color: string
  type: "bird" | "mammal" | "marine" | "reptile" | "insect"
}

export interface AnimalMovement {
  id: string
  speciesId: string
  animalId: string
  timestamp: string
  latitude: number
  longitude: number
  altitude?: number
  speed?: number
  heading?: number
  accuracy?: number
}

export interface MigrationPath {
  speciesId: string
  animalId: string
  coordinates: [number, number][]
  timestamps: string[]
  totalDistance: number
  duration: number
}

export interface MigrationStats {
  totalRecords: number
  totalDistance: number
  activeTracks: number
  averageSpeed: number
  lastUpdate: string
  dataQuality: number
}

export interface MovebankResponse {
  data: AnimalMovement[]
  meta: {
    total: number
    page: number
    limit: number
  }
}

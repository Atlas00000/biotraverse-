"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import type { Species } from "@/types/migration"

const AVAILABLE_SPECIES: Species[] = [
  {
    id: "arctic-tern",
    name: "Arctic Tern",
    scientificName: "Sterna paradisaea",
    icon: "🐦",
    color: "#3b82f6",
    type: "bird",
  },
  {
    id: "gray-whale",
    name: "Gray Whale",
    scientificName: "Eschrichtius robustus",
    icon: "🐋",
    color: "#6366f1",
    type: "marine",
  },
  {
    id: "monarch-butterfly",
    name: "Monarch Butterfly",
    scientificName: "Danaus plexippus",
    icon: "🦋",
    color: "#f59e0b",
    type: "insect",
  },
  {
    id: "caribou",
    name: "Caribou",
    scientificName: "Rangifer tarandus",
    icon: "🦌",
    color: "#10b981",
    type: "mammal",
  },
  {
    id: "sea-turtle",
    name: "Sea Turtle",
    scientificName: "Chelonia mydas",
    icon: "🐢",
    color: "#06b6d4",
    type: "reptile",
  },
  {
    id: "wildebeest",
    name: "Wildebeest",
    scientificName: "Connochaetes taurinus",
    icon: "🦬",
    color: "#8b5cf6",
    type: "mammal",
  },
]

interface SpeciesSelectorProps {
  selectedSpecies: Species[]
  onSpeciesChange: (species: Species[]) => void
  loading: boolean
}

export default function SpeciesSelector({ selectedSpecies, onSpeciesChange, loading }: SpeciesSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSpecies = AVAILABLE_SPECIES.filter(
    (species) =>
      species.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      species.scientificName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSpeciesToggle = (species: Species, checked: boolean) => {
    if (checked) {
      onSpeciesChange([...selectedSpecies, species])
    } else {
      onSpeciesChange(selectedSpecies.filter((s) => s.id !== species.id))
    }
  }

  const handleSelectAll = () => {
    onSpeciesChange(AVAILABLE_SPECIES)
  }

  const handleClearAll = () => {
    onSpeciesChange([])
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={loading}>
          Select All
        </Button>
        <Button variant="outline" size="sm" onClick={handleClearAll} disabled={loading || selectedSpecies.length === 0}>
          Clear All
        </Button>
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-3">
          {filteredSpecies.map((species) => {
            const isSelected = selectedSpecies.some((s) => s.id === species.id)

            return (
              <div
                key={species.id}
                className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={species.id}
                  checked={isSelected}
                  onCheckedChange={(checked) => handleSpeciesToggle(species, checked as boolean)}
                  disabled={loading}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{species.icon}</span>
                    <label htmlFor={species.id} className="text-sm font-medium cursor-pointer">
                      {species.name}
                    </label>
                  </div>

                  <p className="text-xs text-gray-500 italic mb-2">{species.scientificName}</p>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" style={{ backgroundColor: `${species.color}20`, color: species.color }}>
                      {species.type}
                    </Badge>
                    {loading && isSelected && <Loader2 className="h-3 w-3 animate-spin" />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {selectedSpecies.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-600 mb-2">Selected: {selectedSpecies.length} species</p>
          <div className="flex flex-wrap gap-1">
            {selectedSpecies.map((species) => (
              <Badge
                key={species.id}
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: `${species.color}20`, color: species.color }}
              >
                {species.icon} {species.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

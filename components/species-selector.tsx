"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Info } from "lucide-react"
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
    <div className="space-y-3">
      {/* Auto-centering info */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden"
      >
        <div className={`flex items-center gap-3 p-3 border-2 rounded-lg shadow-sm ${
          selectedSpecies.length === 1 
            ? 'bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-300/50' 
            : selectedSpecies.length > 1
            ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-300/50'
            : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-300/50'
        }`}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Info className={`w-5 h-5 flex-shrink-0 ${
              selectedSpecies.length === 1 ? 'text-green-600' : 
              selectedSpecies.length > 1 ? 'text-amber-600' : 'text-blue-600'
            }`} />
          </motion.div>
          <div>
            <p className={`text-sm font-semibold mb-1 ${
              selectedSpecies.length === 1 ? 'text-green-800' : 
              selectedSpecies.length > 1 ? 'text-amber-800' : 'text-blue-800'
            }`}>
              {selectedSpecies.length === 1 ? '🎯 Auto-Centering Active' : 
               selectedSpecies.length > 1 ? '⚠️ Multiple Species Selected' : 
               '🎯 Auto-Centering Available'}
            </p>
            <p className={`text-xs ${
              selectedSpecies.length === 1 ? 'text-green-700' : 
              selectedSpecies.length > 1 ? 'text-amber-700' : 'text-blue-700'
            }`}>
              {selectedSpecies.length === 1 
                ? 'The map will automatically center on your selected species!' 
                : selectedSpecies.length > 1
                ? 'Select a single species to enable auto-centering feature'
                : 'Select a single species to enable auto-centering'
              }
            </p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`w-2 h-2 rounded-full ${
              selectedSpecies.length === 1 ? 'bg-green-500' : 
              selectedSpecies.length > 1 ? 'bg-amber-500' : 'bg-blue-500'
            }`}
          />
        </div>
        {/* Animated border */}
        <motion.div
          className={`absolute inset-0 border-2 rounded-lg ${
            selectedSpecies.length === 1 ? 'border-green-400/30' : 
            selectedSpecies.length > 1 ? 'border-amber-400/30' : 'border-blue-400/30'
          }`}
          animate={{ 
            boxShadow: selectedSpecies.length === 1 ? [
              "0 0 0 0 rgba(34, 197, 94, 0.4)",
              "0 0 0 4px rgba(34, 197, 94, 0)",
              "0 0 0 0 rgba(34, 197, 94, 0)"
            ] : selectedSpecies.length > 1 ? [
              "0 0 0 0 rgba(245, 158, 11, 0.4)",
              "0 0 0 4px rgba(245, 158, 11, 0)",
              "0 0 0 0 rgba(245, 158, 11, 0)"
            ] : [
              "0 0 0 0 rgba(59, 130, 246, 0.4)",
              "0 0 0 4px rgba(59, 130, 246, 0)",
              "0 0 0 0 rgba(59, 130, 246, 0)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Enhanced Header with Search */}
      <div className="space-y-2">
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={loading} className="text-xs h-6 md:h-7 px-1.5 md:px-2">
            <span className="hidden sm:inline">Select All</span>
            <span className="sm:hidden">All</span>
        </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll} disabled={loading || selectedSpecies.length === 0} className="text-xs h-6 md:h-7 px-1.5 md:px-2">
            <span className="hidden sm:inline">Clear All</span>
            <span className="sm:hidden">Clear</span>
        </Button>
      </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search species..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-2 md:px-3 py-1 md:py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Enhanced Species Cards */}
      <ScrollArea className="h-40 md:h-48">
        <div className="space-y-1.5 md:space-y-2">
          {filteredSpecies.map((species) => {
            const isSelected = selectedSpecies.some((s) => s.id === species.id)

            return (
              <motion.div
                key={species.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`
                  relative group cursor-pointer rounded-lg border transition-all duration-200 overflow-hidden
                  ${isSelected 
                    ? 'border-blue-300 bg-blue-50/50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 hover:shadow-sm'
                  }
                `}
                onClick={() => handleSpeciesToggle(species, !isSelected)}
              >
                {/* Selection Indicator */}
                <div className={`
                  absolute top-0 left-0 w-1 h-full transition-all duration-200
                  ${isSelected ? 'bg-blue-500' : 'bg-transparent'}
                `} />
                
                <div className="flex items-start p-2 md:p-3">
                  {/* Enhanced Checkbox */}
                  <div className="relative mt-0.5">
                <Checkbox
                  id={species.id}
                  checked={isSelected}
                  onCheckedChange={(checked) => handleSpeciesToggle(species, checked as boolean)}
                  disabled={loading}
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    {loading && isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 ml-2 md:ml-3">
                    {/* Species Header */}
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                      <span className="text-base md:text-lg filter drop-shadow-sm">{species.icon}</span>
                      <label htmlFor={species.id} className="text-xs md:text-sm font-semibold cursor-pointer text-gray-900">
                        {species.name}
                      </label>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                        />
                      )}
                    </div>

                    {/* Scientific Name */}
                    <p className="text-xs text-gray-500 italic mb-1.5 md:mb-2 font-mono">{species.scientificName}</p>

                    {/* Enhanced Type Badge */}
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`
                          text-xs font-medium px-1.5 md:px-2 py-0.5 transition-all duration-200
                          ${isSelected ? 'shadow-sm' : ''}
                        `}
                        style={{ 
                          backgroundColor: isSelected ? species.color : `${species.color}15`, 
                          color: isSelected ? 'white' : species.color,
                          borderColor: species.color
                        }}
                      >
                        <span className="hidden sm:inline">{species.type.charAt(0).toUpperCase() + species.type.slice(1)}</span>
                        <span className="sm:hidden">{species.type.charAt(0).toUpperCase()}</span>
                    </Badge>
                      
                      {/* Migration Status */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1 text-xs text-blue-600"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                          <span className="hidden sm:inline">Active</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover Effects */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-5 transition-opacity duration-200
                  ${isSelected ? 'from-blue-500 to-purple-500' : 'from-gray-500 to-gray-600'}
                `} />
              </motion.div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Enhanced Selected Species Summary */}
      {selectedSpecies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pt-3 border-t border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-700">
              Selected: {selectedSpecies.length} species
            </p>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              {selectedSpecies.length} Active
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-1 md:gap-1.5">
            {selectedSpecies.map((species) => (
              <motion.div
                key={species.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <Badge
                  variant="secondary"
                  className="text-xs cursor-pointer transition-all duration-200 hover:shadow-md"
                  style={{ 
                    backgroundColor: `${species.color}15`, 
                    color: species.color,
                    borderColor: species.color
                  }}
                  onClick={() => handleSpeciesToggle(species, false)}
                >
                  <span className="mr-1">{species.icon}</span>
                  <span className="hidden sm:inline">{species.name}</span>
                  <span className="sm:hidden">{species.name.split(' ')[0]}</span>
                  <span className="ml-1 text-gray-400 group-hover:text-red-400 transition-colors">×</span>
              </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

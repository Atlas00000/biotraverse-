"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from "recharts"
import {
  TrendingUp,
  Clock,
  MapPin,
  Activity,
  Calendar,
  Thermometer,
  Wind,
  Mountain,
  Waves,
  Download,
  Share2,
} from "lucide-react"
import type { AnimalMovement, Species, MigrationStats } from "@/types/migration"
import {
  calculateMigrationInsights,
  generateSeasonalPatterns,
  calculateSpeedDistribution,
  generateRouteAnalysis,
  calculateEnvironmentalFactors,
} from "@/utils/analytics"

interface MigrationAnalyticsProps {
  movements: AnimalMovement[]
  selectedSpecies: Species[]
  stats: MigrationStats | null
  timeRange: { start: number; end: number }
}

export default function MigrationAnalytics({ movements, selectedSpecies, stats, timeRange }: MigrationAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedMetric, setSelectedMetric] = useState("distance")

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    if (movements.length === 0) return null
    return calculateMigrationInsights(movements, selectedSpecies, timeRange)
  }, [movements, selectedSpecies, timeRange])

  const seasonalData = useMemo(() => {
    if (movements.length === 0) return []
    return generateSeasonalPatterns(movements, selectedSpecies)
  }, [movements, selectedSpecies])

  const speedData = useMemo(() => {
    if (movements.length === 0) return []
    return calculateSpeedDistribution(movements, selectedSpecies)
  }, [movements, selectedSpecies])

  const routeAnalysis = useMemo(() => {
    if (movements.length === 0) return []
    return generateRouteAnalysis(movements, selectedSpecies)
  }, [movements, selectedSpecies])

  const environmentalData = useMemo(() => {
    if (movements.length === 0) return []
    return calculateEnvironmentalFactors(movements)
  }, [movements])

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Migration Analytics</CardTitle>
          <CardDescription>Select species to view detailed migration insights</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No data available for analysis</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Migration Analytics Dashboard</CardTitle>
              <CardDescription>
                Comprehensive insights from {analytics.totalAnimals} animals across {selectedSpecies.length} species
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <MapPin className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-900">{analytics.totalDistance.toFixed(0)}km</div>
              <div className="text-sm text-blue-600">Total Distance</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-900">{analytics.averageSpeed.toFixed(1)}</div>
              <div className="text-sm text-green-600">Avg Speed (km/h)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-900">{analytics.migrationDuration}</div>
              <div className="text-sm text-purple-600">Avg Duration (days)</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Activity className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-900">{analytics.efficiency.toFixed(1)}%</div>
              <div className="text-sm text-orange-600">Route Efficiency</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="comparison">Compare</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Species Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Species Distribution</CardTitle>
                <CardDescription>Migration activity by species</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.speciesDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.speciesDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Migration Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Migration Timeline</CardTitle>
                <CardDescription>Activity levels throughout the year</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={seasonalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedSpecies.map((species) => (
                      <Line
                        key={species.id}
                        type="monotone"
                        dataKey={species.id}
                        stroke={species.color}
                        strokeWidth={2}
                        name={species.name}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Insights</CardTitle>
              <CardDescription>Automated analysis of migration patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.insights.map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm">{insight.category}</span>
                    </div>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                    <Badge variant="outline" className="mt-2">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Seasonal Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seasonal Migration Patterns</CardTitle>
                <CardDescription>Migration intensity by season and species</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={analytics.seasonalPatterns}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="season" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    {selectedSpecies.map((species) => (
                      <Radar
                        key={species.id}
                        name={species.name}
                        dataKey={species.id}
                        stroke={species.color}
                        fill={species.color}
                        fillOpacity={0.1}
                      />
                    ))}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Route Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Route Analysis</CardTitle>
                <CardDescription>Efficiency and directness of migration routes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routeAnalysis.map((route, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{route.icon}</span>
                          <span className="font-medium">{route.species}</span>
                        </div>
                        <Badge variant="outline">{route.efficiency.toFixed(1)}% efficient</Badge>
                      </div>
                      <Progress value={route.efficiency} className="h-2" />
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>Distance: {route.totalDistance.toFixed(0)}km</div>
                        <div>Direct: {route.directDistance.toFixed(0)}km</div>
                        <div>Detour: {route.detourFactor.toFixed(1)}x</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Migration Corridors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Migration Corridors</CardTitle>
              <CardDescription>Most frequently used migration routes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.corridors.map((corridor, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{corridor.name}</h4>
                      <Badge variant="secondary">{corridor.usage}% usage</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Length: {corridor.length.toFixed(0)}km</div>
                      <div>Species: {corridor.species.join(", ")}</div>
                      <div>Peak Season: {corridor.peakSeason}</div>
                    </div>
                    <Progress value={corridor.usage} className="mt-2 h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Speed Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Speed Distribution</CardTitle>
                <CardDescription>Migration speeds across different species</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={speedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="speedRange" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedSpecies.map((species) => (
                      <Bar key={species.id} dataKey={species.id} fill={species.color} name={species.name} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Activity Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Activity Patterns</CardTitle>
                <CardDescription>Movement activity throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="activity" stroke="#8884d8" strokeWidth={2} name="Activity Level" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Behavioral Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Behavioral Analysis</CardTitle>
              <CardDescription>Key behavioral patterns and anomalies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Migration Strategies</h4>
                  {analytics.strategies.map((strategy, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{strategy.name}</div>
                        <div className="text-sm text-gray-600">{strategy.description}</div>
                      </div>
                      <Badge variant="outline">{strategy.prevalence}%</Badge>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Stopover Analysis</h4>
                  {analytics.stopovers.map((stopover, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{stopover.location}</div>
                        <Badge variant="secondary">{stopover.frequency} visits</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Avg stay: {stopover.avgDuration} days • {stopover.species.length} species
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environment Tab */}
        <TabsContent value="environment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Environmental Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Environmental Influences</CardTitle>
                <CardDescription>How environmental factors affect migration</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={environmentalData}>
                    <CartesianGrid />
                    <XAxis dataKey="temperature" name="Temperature" unit="°C" />
                    <YAxis dataKey="speed" name="Speed" unit="km/h" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter name="Migration Speed vs Temperature" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Climate Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Climate Impact Assessment</CardTitle>
                <CardDescription>Environmental factors affecting migration timing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Thermometer className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">Temperature Impact</div>
                      <div className="text-sm text-gray-600">High correlation with departure timing</div>
                    </div>
                    <Badge variant="outline">85% correlation</Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Wind className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">Wind Patterns</div>
                      <div className="text-sm text-gray-600">Affects route selection and speed</div>
                    </div>
                    <Badge variant="outline">72% correlation</Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Mountain className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium">Terrain Influence</div>
                      <div className="text-sm text-gray-600">Mountain ranges create natural corridors</div>
                    </div>
                    <Badge variant="outline">68% correlation</Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
                    <Waves className="w-5 h-5 text-cyan-600" />
                    <div className="flex-1">
                      <div className="font-medium">Ocean Currents</div>
                      <div className="text-sm text-gray-600">Critical for marine species migration</div>
                    </div>
                    <Badge variant="outline">91% correlation</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Species Comparison</CardTitle>
              <CardDescription>Comparative analysis across selected species</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Species</th>
                      <th className="text-right p-2">Avg Distance</th>
                      <th className="text-right p-2">Avg Speed</th>
                      <th className="text-right p-2">Duration</th>
                      <th className="text-right p-2">Efficiency</th>
                      <th className="text-right p-2">Stopovers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.speciesComparison.map((species, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span>{species.icon}</span>
                            <span className="font-medium">{species.name}</span>
                          </div>
                        </td>
                        <td className="text-right p-2">{species.avgDistance.toFixed(0)}km</td>
                        <td className="text-right p-2">{species.avgSpeed.toFixed(1)}km/h</td>
                        <td className="text-right p-2">{species.duration} days</td>
                        <td className="text-right p-2">{species.efficiency.toFixed(1)}%</td>
                        <td className="text-right p-2">{species.stopovers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

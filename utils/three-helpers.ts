import * as THREE from "three"

// Enhanced coordinate conversion with altitude support
export function latLonToVector3(lat: number, lon: number, radius = 5, altitude = 0): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const adjustedRadius = radius + altitude / 10000 // Scale altitude

  const x = -(adjustedRadius * Math.sin(phi) * Math.cos(theta))
  const z = adjustedRadius * Math.sin(phi) * Math.sin(theta)
  const y = adjustedRadius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

// Create curved path between two points on sphere
export function createCurvedPath(start: THREE.Vector3, end: THREE.Vector3, segments = 50): THREE.Vector3[] {
  const points: THREE.Vector3[] = []

  for (let i = 0; i <= segments; i++) {
    const t = i / segments

    // Spherical linear interpolation
    const angle = start.angleTo(end)
    const sinAngle = Math.sin(angle)

    if (sinAngle === 0) {
      points.push(start.clone())
      continue
    }

    const a = Math.sin((1 - t) * angle) / sinAngle
    const b = Math.sin(t * angle) / sinAngle

    const point = start.clone().multiplyScalar(a).add(end.clone().multiplyScalar(b))

    // Add some height for arc effect
    const height = Math.sin(t * Math.PI) * 0.5
    point.normalize().multiplyScalar(5.1 + height)

    points.push(point)
  }

  return points
}

// Create particle system for migration trails
export function createTrailParticles(path: THREE.Vector3[], color: string, count = 100): THREE.Points {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  const colorObj = new THREE.Color(color)

  for (let i = 0; i < count; i++) {
    const pathIndex = Math.floor((i / count) * (path.length - 1))
    const point = path[pathIndex]

    positions[i * 3] = point.x
    positions[i * 3 + 1] = point.y
    positions[i * 3 + 2] = point.z

    colors[i * 3] = colorObj.r
    colors[i * 3 + 1] = colorObj.g
    colors[i * 3 + 2] = colorObj.b

    sizes[i] = Math.random() * 0.1 + 0.05
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  })

  return new THREE.Points(geometry, material)
}

// Calculate great circle distance on sphere
export function greatCircleDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Create animated material for species trails
export function createAnimatedTrailMaterial(color: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(color) },
      opacity: { value: 0.8 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      uniform float opacity;
      varying vec2 vUv;
      
      void main() {
        float alpha = sin(vUv.x * 10.0 - time * 5.0) * 0.5 + 0.5;
        gl_FragColor = vec4(color, alpha * opacity);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  })
}

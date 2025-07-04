"use client"

import { motion } from "framer-motion"
import { Globe } from "lucide-react"

interface LoadingGlobeProps {
  message?: string
}

export default function LoadingGlobe({ message = "Loading migration data..." }: LoadingGlobeProps) {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg">
      <div className="text-center space-y-6">
        {/* Animated Globe */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto"
          >
            <Globe className="w-full h-full text-blue-500" />
          </motion.div>
          
          {/* Bouncing dots around the globe */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-blue-400 rounded-full"
              style={{
                top: "50%",
                left: "50%",
                marginTop: "-6px",
                marginLeft: "-6px",
              }}
              animate={{
                x: Math.cos((i * Math.PI) / 2) * 40,
                y: Math.sin((i * Math.PI) / 2) * 40,
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-lg font-medium text-slate-700"
          >
            {message}
          </motion.p>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorDisplayProps {
  error: string
  onRetry?: () => void
  title?: string
}

export default function ErrorDisplay({ 
  error, 
  onRetry, 
  title = "Something went wrong" 
}: ErrorDisplayProps) {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 rounded-lg">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-6 max-w-md mx-auto p-6"
      >
        {/* Error Icon */}
        <motion.div
          animate={{ 
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 2
          }}
          className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center"
        >
          <AlertCircle className="w-10 h-10 text-red-600" />
        </motion.div>

        {/* Error Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-red-800">{title}</h3>
          <p className="text-red-600 text-sm leading-relaxed">{error}</p>
        </div>

        {/* Retry Button */}
        {onRetry && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              onClick={onRetry}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </motion.div>
        )}

        {/* Helpful tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-red-500/70 bg-red-100/50 rounded-lg p-3"
        >
          <p>💡 Try selecting different species or check your connection</p>
        </motion.div>
      </motion.div>
    </div>
  )
} 
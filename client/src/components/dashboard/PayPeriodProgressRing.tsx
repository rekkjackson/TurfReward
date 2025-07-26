import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface PayPeriodProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  animate?: boolean;
  className?: string;
}

export function PayPeriodProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8, 
  showPercentage = true,
  animate = true,
  className = ""
}: PayPeriodProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animate]);

  const getProgressColor = (progress: number) => {
    if (progress < 25) return '#ef4444'; // red-500
    if (progress < 50) return '#f59e0b'; // amber-500
    if (progress < 75) return '#3b82f6'; // blue-500
    return '#10b981'; // emerald-500
  };

  const progressColor = getProgressColor(progress);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-700"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ 
            duration: animate ? 1.5 : 0, 
            ease: "easeOut",
            delay: animate ? 0.2 : 0
          }}
          className="drop-shadow-sm"
          style={{
            filter: `drop-shadow(0 0 6px ${progressColor}40)`
          }}
        />
      </svg>
      
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="text-center"
            initial={animate ? { scale: 0.8, opacity: 0 } : {}}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: animate ? 0.8 : 0, duration: 0.3 }}
          >
            <div 
              className="text-2xl font-bold"
              style={{ color: progressColor }}
            >
              {Math.round(animatedProgress)}%
            </div>
            <div className="text-xs text-gray-400 -mt-1">
              Complete
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
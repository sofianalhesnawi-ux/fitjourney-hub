import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedChartContainerProps {
  children: ReactNode;
  chartKey: string | number;
  className?: string;
}

export function AnimatedChartContainer({ 
  children, 
  chartKey,
  className = ''
}: AnimatedChartContainerProps) {
  const [currentKey, setCurrentKey] = useState(chartKey);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (chartKey !== currentKey) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setCurrentKey(chartKey);
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [chartKey, currentKey]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentKey}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            opacity: { duration: 0.2 }
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      
      {/* Loading shimmer during transition */}
      {isAnimating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/20 to-transparent"
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1s infinite linear'
          }}
        />
      )}
    </div>
  );
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatFn?: (n: number) => string;
  className?: string;
}

export function AnimatedNumber({ 
  value, 
  duration = 1000,
  formatFn = (n) => n.toLocaleString(),
  className = ''
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const current = startValue + (endValue - startValue) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <motion.span 
      className={className}
      key={value}
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {formatFn(Math.round(displayValue))}
    </motion.span>
  );
}

interface AnimatedProgressProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'accent';
}

export function AnimatedProgress({ 
  value, 
  className = '',
  showLabel = false,
  color = 'primary'
}: AnimatedProgressProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    accent: 'bg-accent'
  };

  return (
    <div className={`relative ${className}`}>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${colorClasses[color]} rounded-full relative overflow-hidden`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(displayValue, 100)}%` }}
          transition={{ 
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {/* Shimmer effect on progress bar */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 1
            }}
          />
        </motion.div>
      </div>
      
      {showLabel && (
        <motion.span
          className="absolute right-0 -top-6 text-xs font-medium"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(displayValue)}%
        </motion.span>
      )}
    </div>
  );
}

export function DataTransitionWrapper({ 
  children,
  dataKey
}: { 
  children: ReactNode;
  dataKey: string | number;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={dataKey}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

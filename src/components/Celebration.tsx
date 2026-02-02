import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Trophy, Star, Zap } from 'lucide-react';

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  rotation: number;
  color: string;
}

const CONFETTI_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(280, 75%, 60%)',
];

export function Confetti({ isActive }: { isActive: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isActive) {
      const newPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      }));
      setPieces(newPieces);
      
      const timer = setTimeout(() => setPieces([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ 
            opacity: 1, 
            y: -20, 
            x: `${piece.x}vw`,
            rotate: 0,
            scale: 1
          }}
          animate={{ 
            opacity: 0, 
            y: '100vh',
            rotate: piece.rotation + 720,
            scale: 0.5
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 2.5 + Math.random(),
            delay: piece.delay,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="fixed top-0 z-50 pointer-events-none"
          style={{ left: 0 }}
        >
          <div 
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: piece.color }}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

export function CheckmarkCelebration({ 
  isVisible, 
  onComplete,
  size = 'md'
}: { 
  isVisible: boolean; 
  onComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 15 
          }}
          className={`${sizeClasses[size]} rounded-full bg-success flex items-center justify-center relative`}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
          >
            <Check className={`${iconSizes[size]} text-success-foreground`} />
          </motion.div>
          
          {/* Ripple effect */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute inset-0 rounded-full bg-success`}
          />
          
          {/* Sparkles around */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: Math.cos((i * 60 * Math.PI) / 180) * 40,
                y: Math.sin((i * 60 * Math.PI) / 180) * 40,
              }}
              transition={{ 
                delay: 0.3 + i * 0.05,
                duration: 0.6,
                ease: "easeOut"
              }}
              className="absolute"
            >
              <Star className="h-3 w-3 text-warning fill-warning" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function GoalCompleteCelebration({ 
  isVisible, 
  goalName,
  onClose 
}: { 
  isVisible: boolean;
  goalName?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <Confetti isActive={isVisible} />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-card border rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-warning to-warning/60 flex items-center justify-center"
              >
                <Trophy className="h-10 w-10 text-warning-foreground" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-2"
              >
                🎉 Goal Achieved!
              </motion.h2>
              
              {goalName && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground"
                >
                  {goalName}
                </motion.p>
              )}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-2 mt-4"
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -8, 0],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      delay: 0.7 + i * 0.1,
                      duration: 0.5,
                      repeat: 2
                    }}
                  >
                    <Sparkles className="h-5 w-5 text-warning" />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function WorkoutCompleteCelebration({ 
  isVisible, 
  onClose 
}: { 
  isVisible: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <Confetti isActive={isVisible} />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-card border rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-success to-accent flex items-center justify-center"
              >
                <Zap className="h-10 w-10 text-success-foreground" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-2"
              >
                💪 Workout Complete!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground"
              >
                Great job crushing it today!
              </motion.p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

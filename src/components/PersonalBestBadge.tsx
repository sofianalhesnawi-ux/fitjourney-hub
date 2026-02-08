import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { Badge } from '@/components/ui/badge';
import { Confetti } from '@/components/Celebration';

const PB_STREAK_KEY = 'fittrack-pb-streak';

export function PersonalBestBadge() {
  const { data, t } = useFitTrack();
  const [showCelebration, setShowCelebration] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Calculate current streak
  const currentStreak = useMemo(() => {
    if (!data.workoutLogs.length) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const workoutDates = [...new Set(
      data.workoutLogs.map(log => {
        const date = new Date(log.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    )].sort((a, b) => b - a);

    if (workoutDates.length === 0) return 0;

    let streak = 0;
    let checkDate = today.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const daysSinceLastWorkout = Math.floor((today.getTime() - workoutDates[0]) / oneDayMs);
    if (daysSinceLastWorkout > 1) return 0;

    for (let i = 0; i <= workoutDates.length; i++) {
      if (workoutDates.includes(checkDate)) {
        streak++;
        checkDate -= oneDayMs;
      } else if (i === 0 && daysSinceLastWorkout === 1) {
        checkDate -= oneDayMs;
      } else {
        break;
      }
    }

    return streak;
  }, [data.workoutLogs]);

  // Check if current streak is a personal best
  const { isPersonalBest, previousBest } = useMemo(() => {
    const storedPB = parseInt(localStorage.getItem(PB_STREAK_KEY) || '0', 10);
    return {
      isPersonalBest: currentStreak > 0 && currentStreak > storedPB,
      previousBest: storedPB,
    };
  }, [currentStreak]);

  // Trigger celebration when PB is detected
  useEffect(() => {
    if (isPersonalBest && currentStreak > 1) {
      localStorage.setItem(PB_STREAK_KEY, String(currentStreak));
      setShowCelebration(true);
      setDismissed(false);
      const timer = setTimeout(() => setShowCelebration(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [isPersonalBest, currentStreak]);

  const pbText = (t.dashboard as any).personalBest || 'Personal Best!';

  if (!isPersonalBest || currentStreak <= 1 || dismissed) return null;

  return (
    <>
      <Confetti isActive={showCelebration} />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Badge
            className="cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-0 shadow-lg shadow-amber-500/30 gap-1 px-3 py-1 hover:shadow-amber-500/50 transition-shadow"
            onClick={() => setDismissed(true)}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
            >
              <Trophy className="h-3.5 w-3.5" />
            </motion.div>
            <span className="text-xs font-bold">{pbText} {currentStreak} 🔥</span>
          </Badge>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

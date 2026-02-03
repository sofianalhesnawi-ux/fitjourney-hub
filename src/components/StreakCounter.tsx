import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { useMemo } from 'react';

export function StreakCounter() {
  const { data, t } = useFitTrack();

  const streak = useMemo(() => {
    if (!data.workoutLogs.length) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get unique workout dates
    const workoutDates = [...new Set(
      data.workoutLogs.map(log => {
        const date = new Date(log.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    )].sort((a, b) => b - a);

    if (workoutDates.length === 0) return 0;

    let currentStreak = 0;
    let checkDate = today.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Check if today or yesterday has a workout to start the streak
    const mostRecentWorkout = workoutDates[0];
    const daysSinceLastWorkout = Math.floor((today.getTime() - mostRecentWorkout) / oneDayMs);
    
    if (daysSinceLastWorkout > 1) return 0; // Streak broken

    // Start checking from today
    for (let i = 0; i <= workoutDates.length; i++) {
      if (workoutDates.includes(checkDate)) {
        currentStreak++;
        checkDate -= oneDayMs;
      } else if (i === 0 && daysSinceLastWorkout === 1) {
        // Today doesn't have workout but yesterday does, start from yesterday
        checkDate -= oneDayMs;
      } else {
        break;
      }
    }

    return currentStreak;
  }, [data.workoutLogs]);

  const flameColor = streak >= 7 ? 'text-orange-500' : streak >= 3 ? 'text-amber-500' : 'text-amber-400';
  const glowColor = streak >= 7 ? 'shadow-orange-500/50' : streak >= 3 ? 'shadow-amber-500/50' : 'shadow-amber-400/40';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex items-center gap-2"
    >
      {/* Flame container */}
      <motion.div
        className={`relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 ${glowColor} shadow-lg`}
        animate={streak > 0 ? {
          boxShadow: [
            `0 0 10px 2px hsl(var(--primary) / 0.2)`,
            `0 0 20px 4px hsl(var(--primary) / 0.3)`,
            `0 0 10px 2px hsl(var(--primary) / 0.2)`,
          ]
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Animated flame icon */}
        <motion.div
          animate={streak > 0 ? {
            scale: [1, 1.15, 1],
            rotate: [0, -5, 5, 0],
          } : {}}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Flame className={`w-6 h-6 ${flameColor} drop-shadow-lg`} />
        </motion.div>

        {/* Fire particles */}
        {streak > 0 && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-amber-400"
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-5, -20],
                  x: [0, (i - 1) * 8],
                  scale: [1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Streak count */}
      <div className="flex flex-col">
        <motion.span
          key={streak}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold gradient-text"
        >
          {streak}
        </motion.span>
        <span className="text-xs text-muted-foreground font-medium">
          {streak === 1 ? t.dashboard.day : t.dashboard.days} {t.dashboard.streak}
        </span>
      </div>
    </motion.div>
  );
}

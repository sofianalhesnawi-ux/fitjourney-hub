import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { useMemo } from 'react';
import { getWeekStart } from '@/lib/utils';

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

  // Calculate weekly workout progress
  const weeklyProgress = useMemo(() => {
    const weekStart = getWeekStart();
    const workoutsThisWeek = data.workoutLogs.filter(
      log => new Date(log.date) >= weekStart
    ).length;
    const goal = data.goals.weeklyWorkouts || 4;
    return {
      current: workoutsThisWeek,
      goal,
      percentage: Math.min((workoutsThisWeek / goal) * 100, 100)
    };
  }, [data.workoutLogs, data.goals.weeklyWorkouts]);

  const flameColor = streak >= 7 ? 'text-orange-500' : streak >= 3 ? 'text-amber-500' : 'text-amber-400';
  const ringColor = weeklyProgress.percentage >= 100 
    ? 'stroke-green-500' 
    : weeklyProgress.percentage >= 50 
      ? 'stroke-amber-500' 
      : 'stroke-primary';

  // SVG circle calculations
  const size = 56;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (weeklyProgress.percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex items-center gap-3"
    >
      {/* Progress ring container */}
      <div className="relative">
        {/* SVG Progress Ring */}
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            className="opacity-30"
          />
          {/* Progress ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          />
        </svg>

        {/* Flame container - positioned inside the ring */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={streak > 0 ? {
            scale: [1, 1.1, 1],
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Animated flame icon */}
          <motion.div
            animate={streak > 0 ? {
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
                  className="absolute w-1 h-1 rounded-full bg-amber-400"
                  initial={{ opacity: 0, y: 0, x: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [-2, -12],
                    x: [0, (i - 1) * 6],
                    scale: [1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.25,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}
        </motion.div>

        {/* Glow effect when goal reached */}
        {weeklyProgress.percentage >= 100 && (
          <motion.div
            className="absolute inset-0 rounded-full bg-green-500/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>

      {/* Streak count and weekly progress */}
      <div className="flex flex-col">
        <motion.span
          key={streak}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xl font-bold gradient-text leading-tight"
        >
          {streak}
        </motion.span>
        <span className="text-[10px] text-muted-foreground font-medium leading-tight">
          {streak === 1 ? t.dashboard.day : t.dashboard.days} {t.dashboard.streak}
        </span>
        <span className="text-[10px] text-muted-foreground/70 leading-tight">
          {weeklyProgress.current}/{weeklyProgress.goal} {t.goals.thisWeek}
        </span>
      </div>
    </motion.div>
  );
}

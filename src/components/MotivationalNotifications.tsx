import { useEffect, useRef } from 'react';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { getWeekStart, getToday } from '@/lib/utils';
import { toast } from 'sonner';

export function MotivationalNotifications() {
  const { data, t } = useFitTrack();
  const hasShownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const today = getToday();
    const sessionKey = `motivation_${today}`;
    
    const alreadyShown = sessionStorage.getItem(sessionKey);
    if (alreadyShown) return;

    const notifications: { key: string; message: string; icon: string }[] = [];

    const weekStart = getWeekStart();
    const workoutsThisWeek = data.workoutLogs.filter(
      log => new Date(log.date) >= weekStart
    ).length;
    const workoutGoal = data.goals.weeklyWorkouts;

    if (workoutGoal) {
      const remaining = workoutGoal - workoutsThisWeek;
      if (remaining === 0) {
        notifications.push({
          key: 'workout_done',
          message: `🏆 ${t.motivational.goalReached}`,
          icon: '🏆',
        });
      } else if (remaining === 1) {
        notifications.push({
          key: 'workout_1',
          message: `🔥 ${t.motivational.oneWorkoutLeft}`,
          icon: '🔥',
        });
      } else if (remaining === 2 && workoutGoal >= 4) {
        notifications.push({
          key: 'workout_2',
          message: `💪 ${t.motivational.twoWorkoutsLeft}`,
          icon: '💪',
        });
      }
    }

    const todaysMeals = data.meals.filter(meal => meal.date === today);
    const todaysCalories = todaysMeals.reduce((sum, meal) =>
      sum + meal.items.reduce((itemSum, item) => itemSum + item.calories, 0), 0
    );
    const calorieGoal = data.goals.dailyCalories;

    if (calorieGoal && todaysCalories > 0) {
      const progress = (todaysCalories / calorieGoal) * 100;
      if (progress >= 80 && progress < 100) {
        notifications.push({
          key: 'cal_close',
          message: `🎯 ${t.motivational.caloriesAlmostDone}`,
          icon: '🎯',
        });
      } else if (progress >= 100 && progress <= 110) {
        notifications.push({
          key: 'cal_done',
          message: `✅ ${t.motivational.caloriesReached}`,
          icon: '✅',
        });
      }
    }

    if (data.goals.targetWeight) {
      const sortedWeights = [...data.weightEntries].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const currentWeight = sortedWeights[0]?.weight;
      if (currentWeight) {
        const diff = Math.abs(currentWeight - data.goals.targetWeight);
        if (diff <= 1 && diff > 0) {
          notifications.push({
            key: 'weight_close',
            message: `⚡ ${t.motivational.weightAlmostThere}`,
            icon: '⚡',
          });
        } else if (diff === 0) {
          notifications.push({
            key: 'weight_done',
            message: `🎉 ${t.motivational.weightGoalReached}`,
            icon: '🎉',
          });
        }
      }
    }

    if (workoutsThisWeek >= 3 && !workoutGoal) {
      notifications.push({
        key: 'streak_3',
        message: `🔥 ${t.motivational.greatStreak}`,
        icon: '🔥',
      });
    }

    if (notifications.length > 0) {
      sessionStorage.setItem(sessionKey, 'true');
      notifications.forEach((notif, index) => {
        if (!hasShownRef.current.has(notif.key)) {
          hasShownRef.current.add(notif.key);
          setTimeout(() => {
            toast(notif.message, {
              duration: 5000,
            });
          }, 1500 + index * 2000);
        }
      });
    }
  }, [data.workoutLogs, data.meals, data.weightEntries, data.goals, t]);

  return null;
}

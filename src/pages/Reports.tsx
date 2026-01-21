import { useState } from 'react';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Dumbbell, 
  Flame,
  Scale,
  TrendingUp,
  TrendingDown,
  Trophy,
  Calendar,
  Target
} from 'lucide-react';
import { getWeekStart, getMonthStart, formatDate } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

export default function Reports() {
  const { data, t, isRTL } = useFitTrack();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const today = new Date();
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

  // Calculate period stats
  const getPeriodStats = (startDate: Date, endDate: Date) => {
    const workouts = data.workoutLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate <= endDate;
    });

    const meals = data.meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate >= startDate && mealDate <= endDate;
    });

    const weights = data.weightEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalCalories = meals.reduce((sum, meal) => 
      sum + meal.items.reduce((itemSum, item) => itemSum + item.calories, 0), 0
    );

    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const avgCalories = meals.length > 0 ? Math.round(totalCalories / daysInPeriod) : 0;

    const totalProtein = meals.reduce((sum, meal) => 
      sum + meal.items.reduce((itemSum, item) => itemSum + item.protein, 0), 0
    );
    const avgProtein = meals.length > 0 ? Math.round(totalProtein / daysInPeriod) : 0;

    const startWeight = weights[0]?.weight;
    const endWeight = weights[weights.length - 1]?.weight;
    const weightChange = startWeight && endWeight ? endWeight - startWeight : null;

    // Find personal records in this period
    const exerciseMaxes: Record<string, number> = {};
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.weight) {
            if (!exerciseMaxes[exercise.name] || set.weight > exerciseMaxes[exercise.name]) {
              exerciseMaxes[exercise.name] = set.weight;
            }
          }
        });
      });
    });

    return {
      workoutCount: workouts.length,
      totalCalories,
      avgCalories,
      avgProtein,
      startWeight,
      endWeight,
      weightChange,
      personalRecords: Object.entries(exerciseMaxes).slice(0, 5),
      daysInPeriod
    };
  };

  const currentPeriodStart = period === 'weekly' ? weekStart : monthStart;
  const prevPeriodStart = period === 'weekly' ? prevWeekStart : prevMonthStart;
  const prevPeriodEnd = new Date(currentPeriodStart);
  prevPeriodEnd.setDate(prevPeriodEnd.getDate() - 1);

  const currentStats = getPeriodStats(currentPeriodStart, today);
  const prevStats = getPeriodStats(prevPeriodStart, prevPeriodEnd);

  // Workout frequency chart data
  const getWorkoutChartData = () => {
    if (period === 'weekly') {
      const days = isRTL
        ? ['إث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((day, index) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(dayDate.getDate() + index);
        const dayString = dayDate.toISOString().split('T')[0];
        const count = data.workoutLogs.filter(log => log.date === dayString).length;
        return { day, workouts: count };
      });
    } else {
      const weeks: { week: string; workouts: number }[] = [];
      let weekNum = 1;
      const current = new Date(monthStart);
      while (current <= today) {
        const weekEnd = new Date(current);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const count = data.workoutLogs.filter(log => {
          const logDate = new Date(log.date);
          return logDate >= current && logDate <= weekEnd;
        }).length;
        weeks.push({ week: `${t.reports.week} ${weekNum}`, workouts: count });
        current.setDate(current.getDate() + 7);
        weekNum++;
      }
      return weeks;
    }
  };

  const workoutChartData = getWorkoutChartData();

  // Achievements
  const achievements = [];
  
  // Check for workout consistency
  if (data.goals.weeklyWorkouts && currentStats.workoutCount >= data.goals.weeklyWorkouts) {
    achievements.push({ icon: Trophy, label: t.reports.workoutGoalReached, color: 'bg-success' });
  }
  
  // Check for weight goal progress
  if (currentStats.weightChange !== null) {
    const isLosingWeight = data.goals.targetWeight && currentStats.endWeight && 
      data.goals.targetWeight < currentStats.startWeight;
    if (isLosingWeight && currentStats.weightChange < 0) {
      achievements.push({ icon: TrendingDown, label: t.reports.weightLossProgress, color: 'bg-primary' });
    } else if (!isLosingWeight && currentStats.weightChange > 0) {
      achievements.push({ icon: TrendingUp, label: t.reports.weightGainProgress, color: 'bg-primary' });
    }
  }

  // Most consistent workout
  const exerciseCounts: Record<string, number> = {};
  data.workoutLogs.forEach(log => {
    log.exercises.forEach(ex => {
      exerciseCounts[ex.name] = (exerciseCounts[ex.name] || 0) + 1;
    });
  });
  const mostConsistentExercise = Object.entries(exerciseCounts)
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <motion.div 
      className="space-y-6 pb-20 lg:pb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.reports.title}</h1>
          <p className="text-muted-foreground">{t.reports.subtitle}</p>
        </div>
      </div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as 'weekly' | 'monthly')}>
        <TabsList>
          <TabsTrigger value="weekly">{t.reports.weekly}</TabsTrigger>
          <TabsTrigger value="monthly">{t.reports.monthly}</TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="mt-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Dumbbell className="h-4 w-4" />
                  {t.reports.workouts}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentStats.workoutCount}</div>
                <div className="flex items-center gap-1 text-sm">
                  {currentStats.workoutCount > prevStats.workoutCount ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : currentStats.workoutCount < prevStats.workoutCount ? (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  ) : null}
                  <span className="text-muted-foreground">
                    {t.reports.vsLast
                      .replace('{0}', String(prevStats.workoutCount))
                      .replace('{1}', period === 'weekly' ? t.reports.week : t.reports.month)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  {t.reports.avgDailyCalories}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentStats.avgCalories}</div>
                <p className="text-sm text-muted-foreground">
                  {t.reports.proteinAvg.replace('{0}', String(currentStats.avgProtein))}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  {t.reports.weightChange}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentStats.weightChange !== null 
                    ? `${currentStats.weightChange > 0 ? '+' : ''}${currentStats.weightChange.toFixed(1)} ${t.common.kg}`
                    : '—'
                  }
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentStats.startWeight && currentStats.endWeight 
                    ? `${currentStats.startWeight} → ${currentStats.endWeight} ${t.common.kg}`
                    : t.common.noData
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {t.reports.goalProgress}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.goals.weeklyWorkouts 
                    ? `${Math.round((currentStats.workoutCount / data.goals.weeklyWorkouts) * 100)}%`
                    : '—'
                  }
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentStats.workoutCount}/{data.goals.weeklyWorkouts || '?'} {t.reports.workouts}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Workout Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t.reports.workoutFrequency}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={workoutChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey={period === 'weekly' ? 'day' : 'week'} 
                    tick={{ fontSize: 12 }} 
                    reversed={isRTL}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="workouts" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Comparison & Achievements */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Period Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t.reports.periodComparison}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">{t.reports.workouts}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{prevStats.workoutCount}</span>
                      <span className="font-bold">{currentStats.workoutCount}</span>
                      {currentStats.workoutCount > prevStats.workoutCount && (
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          +{currentStats.workoutCount - prevStats.workoutCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">{t.reports.avgDailyCalories}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{prevStats.avgCalories}</span>
                      <span className="font-bold">{currentStats.avgCalories}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">{t.dashboard.protein}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{prevStats.avgProtein}g</span>
                      <span className="font-bold">{currentStats.avgProtein}g</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements & PRs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  {t.reports.achievementsHighlights}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.length > 0 ? (
                  <div className="space-y-2">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className={`p-2 rounded-full ${achievement.color}`}>
                          <achievement.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium">{achievement.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    {t.reports.keepWorking}
                  </p>
                )}

                {currentStats.personalRecords.length > 0 && (
                  <>
                    <h4 className="font-medium pt-2">{t.reports.personalRecords}</h4>
                    <div className="space-y-2">
                      {currentStats.personalRecords.map(([exercise, weight]) => (
                        <div key={exercise} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <span className="text-sm">{exercise}</span>
                          <Badge variant="outline">{weight} {t.common.kg}</Badge>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {mostConsistentExercise && (
                  <div className="pt-2">
                    <h4 className="font-medium mb-2">{t.reports.mostConsistentExercise}</h4>
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <span className="font-medium text-primary">{mostConsistentExercise[0]}</span>
                      <span className="text-sm text-muted-foreground">{mostConsistentExercise[1]} {t.reports.times}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

import { useState } from 'react';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Target, Scale, Flame, Dumbbell, Activity, Check, Sparkles, Trophy } from 'lucide-react';
import { getWeekStart } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Goals() {
  const { data, updateGoals, t } = useFitTrack();
  const [targetWeight, setTargetWeight] = useState(data.goals.targetWeight?.toString() || '');
  const [dailyCalories, setDailyCalories] = useState(data.goals.dailyCalories?.toString() || '');
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(data.goals.weeklyWorkouts?.toString() || '');
  const [targetBodyFat, setTargetBodyFat] = useState(data.goals.targetBodyFat?.toString() || '');
  const [targetMuscleMass, setTargetMuscleMass] = useState(data.goals.targetMuscleMass?.toString() || '');

  const currentWeight = [...data.weightEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.weight;
  const weekStart = getWeekStart();
  const workoutsThisWeek = data.workoutLogs.filter(log => new Date(log.date) >= weekStart).length;
  const latestBodyComp = [...data.bodyCompositions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const saveGoals = () => { 
    updateGoals({ 
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined, 
      dailyCalories: dailyCalories ? parseInt(dailyCalories) : undefined, 
      weeklyWorkouts: weeklyWorkouts ? parseInt(weeklyWorkouts) : undefined, 
      targetBodyFat: targetBodyFat ? parseFloat(targetBodyFat) : undefined, 
      targetMuscleMass: targetMuscleMass ? parseFloat(targetMuscleMass) : undefined 
    }); 
  };

  const calculateWeightProgress = () => { 
    if (!currentWeight || !data.goals.targetWeight) return null; 
    const startWeight = [...data.weightEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]?.weight; 
    if (!startWeight) return null; 
    const totalChange = Math.abs(startWeight - data.goals.targetWeight); 
    const currentChange = Math.abs(startWeight - currentWeight); 
    return Math.min(Math.max((currentChange / totalChange) * 100, 0), 100); 
  };
  
  const weightProgress = calculateWeightProgress();
  const workoutProgress = data.goals.weeklyWorkouts ? (workoutsThisWeek / data.goals.weeklyWorkouts) * 100 : 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-8 pb-20 lg:pb-6" 
      variants={container}
      initial="hidden" 
      animate="show"
    >
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">{t.goals.title}</span>
          </h1>
          <p className="text-muted-foreground mt-1">{t.goals.subtitle}</p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-warning/10 to-success/10 border border-warning/20"
        >
          <Trophy className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium text-foreground">{t.goals.achieveMore || 'Achieve more!'}</span>
        </motion.div>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/5 via-card to-accent/5 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t.goals.weightGoal}</CardTitle>
              <div className="p-2 rounded-xl bg-primary/10">
                <Scale className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {data.goals.targetWeight ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{currentWeight || '—'}</span>
                  <span className="text-muted-foreground">→ {data.goals.targetWeight} {t.common.kg}</span>
                </div>
                {weightProgress !== null && (
                  <div className="mt-4">
                    <Progress value={weightProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">{weightProgress.toFixed(0)}% {t.common.complete}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">{t.goals.noGoalSet}</p>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t.goals.weeklyWorkouts}</CardTitle>
              <div className="p-2 rounded-xl bg-accent/10">
                <Dumbbell className="h-4 w-4 text-accent" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {data.goals.weeklyWorkouts ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{workoutsThisWeek}</span>
                  <span className="text-muted-foreground">/ {data.goals.weeklyWorkouts} {t.goals.thisWeek}</span>
                </div>
                <div className="mt-4">
                  <Progress value={Math.min(workoutProgress, 100)} className="h-2" />
                  {workoutsThisWeek >= data.goals.weeklyWorkouts && (
                    <p className="text-xs text-success mt-2 flex items-center gap-1">
                      <Check className="h-3 w-3" /> {t.goals.goalReached}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">{t.goals.noGoalSet}</p>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t.goals.dailyCalories}</CardTitle>
              <div className="p-2 rounded-xl bg-warning/10">
                <Flame className="h-4 w-4 text-warning" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {data.goals.dailyCalories ? (
              <div className="text-3xl font-bold">{data.goals.dailyCalories} {t.common.kcal}</div>
            ) : (
              <p className="text-muted-foreground">{t.goals.noGoalSet}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {t.goals.setYourGoals}
            </CardTitle>
            <CardDescription>{t.goals.defineTargets}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target-weight" className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-primary" />
                  {t.goals.targetWeight}
                </Label>
                <Input 
                  id="target-weight" 
                  type="number" 
                  step="0.1" 
                  placeholder="e.g., 70" 
                  value={targetWeight} 
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="h-11"
                />
                {currentWeight && (
                  <p className="text-xs text-muted-foreground">{t.goals.current}: {currentWeight} {t.common.kg}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="daily-calories" className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-warning" />
                  {t.goals.dailyCalorieGoal}
                </Label>
                <Input 
                  id="daily-calories" 
                  type="number" 
                  placeholder="e.g., 2000" 
                  value={dailyCalories} 
                  onChange={(e) => setDailyCalories(e.target.value)}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weekly-workouts" className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-accent" />
                  {t.goals.weeklyWorkoutGoal}
                </Label>
                <Input 
                  id="weekly-workouts" 
                  type="number" 
                  min="1" 
                  max="7" 
                  placeholder="e.g., 4" 
                  value={weeklyWorkouts} 
                  onChange={(e) => setWeeklyWorkouts(e.target.value)}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">{t.goals.thisWeek}: {workoutsThisWeek} {t.goals.workouts}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-body-fat" className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-success" />
                  {t.goals.targetBodyFat}
                </Label>
                <Input 
                  id="target-body-fat" 
                  type="number" 
                  step="0.1" 
                  placeholder="e.g., 15" 
                  value={targetBodyFat} 
                  onChange={(e) => setTargetBodyFat(e.target.value)}
                  className="h-11"
                />
                {latestBodyComp?.bodyFat && (
                  <p className="text-xs text-muted-foreground">{t.goals.current}: {latestBodyComp.bodyFat}%</p>
                )}
              </div>
              
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="target-muscle-mass" className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  {t.goals.targetMuscleMass}
                </Label>
                <Input 
                  id="target-muscle-mass" 
                  type="number" 
                  step="0.1" 
                  placeholder="e.g., 40" 
                  value={targetMuscleMass} 
                  onChange={(e) => setTargetMuscleMass(e.target.value)}
                  className="h-11"
                />
                {latestBodyComp?.muscleMass && (
                  <p className="text-xs text-muted-foreground">{t.goals.current}: {latestBodyComp.muscleMass} {t.common.kg}</p>
                )}
              </div>
            </div>
            
            <Button onClick={saveGoals} size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/20">
              <Sparkles className="h-4 w-4 me-2" />
              {t.goals.saveGoals}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

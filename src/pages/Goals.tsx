import { useState } from 'react';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Target, Scale, Flame, Dumbbell, Activity, Check } from 'lucide-react';
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

  const saveGoals = () => { updateGoals({ targetWeight: targetWeight ? parseFloat(targetWeight) : undefined, dailyCalories: dailyCalories ? parseInt(dailyCalories) : undefined, weeklyWorkouts: weeklyWorkouts ? parseInt(weeklyWorkouts) : undefined, targetBodyFat: targetBodyFat ? parseFloat(targetBodyFat) : undefined, targetMuscleMass: targetMuscleMass ? parseFloat(targetMuscleMass) : undefined }); };

  const calculateWeightProgress = () => { if (!currentWeight || !data.goals.targetWeight) return null; const startWeight = [...data.weightEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]?.weight; if (!startWeight) return null; const totalChange = Math.abs(startWeight - data.goals.targetWeight); const currentChange = Math.abs(startWeight - currentWeight); return Math.min(Math.max((currentChange / totalChange) * 100, 0), 100); };
  const weightProgress = calculateWeightProgress();
  const workoutProgress = data.goals.weeklyWorkouts ? (workoutsThisWeek / data.goals.weeklyWorkouts) * 100 : 0;

  return (
    <motion.div className="space-y-6 pb-20 lg:pb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-foreground">{t.goals.title}</h1><p className="text-muted-foreground">{t.goals.subtitle}</p></div></div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-medium">{t.goals.weightGoal}</CardTitle><Scale className="h-4 w-4 text-muted-foreground" /></div></CardHeader><CardContent>{data.goals.targetWeight ? (<><div className="flex items-baseline gap-2"><span className="text-2xl font-bold">{currentWeight || '—'}</span><span className="text-muted-foreground">→ {data.goals.targetWeight} {t.common.kg}</span></div>{weightProgress !== null && <div className="mt-2"><Progress value={weightProgress} className="h-2" /><p className="text-xs text-muted-foreground mt-1">{weightProgress.toFixed(0)}% {t.common.complete}</p></div>}</>) : <p className="text-muted-foreground">{t.goals.noGoalSet}</p>}</CardContent></Card>
        <Card><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-medium">{t.goals.weeklyWorkouts}</CardTitle><Dumbbell className="h-4 w-4 text-muted-foreground" /></div></CardHeader><CardContent>{data.goals.weeklyWorkouts ? (<><div className="flex items-baseline gap-2"><span className="text-2xl font-bold">{workoutsThisWeek}</span><span className="text-muted-foreground">/ {data.goals.weeklyWorkouts} {t.goals.thisWeek}</span></div><div className="mt-2"><Progress value={Math.min(workoutProgress, 100)} className="h-2" />{workoutsThisWeek >= data.goals.weeklyWorkouts && <p className="text-xs text-success mt-1 flex items-center gap-1"><Check className="h-3 w-3" /> {t.goals.goalReached}</p>}</div></>) : <p className="text-muted-foreground">{t.goals.noGoalSet}</p>}</CardContent></Card>
        <Card><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-medium">{t.goals.dailyCalories}</CardTitle><Flame className="h-4 w-4 text-muted-foreground" /></div></CardHeader><CardContent>{data.goals.dailyCalories ? <div className="text-2xl font-bold">{data.goals.dailyCalories} {t.common.kcal}</div> : <p className="text-muted-foreground">{t.goals.noGoalSet}</p>}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />{t.goals.setYourGoals}</CardTitle><CardDescription>{t.goals.defineTargets}</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="target-weight" className="flex items-center gap-2"><Scale className="h-4 w-4" />{t.goals.targetWeight}</Label><Input id="target-weight" type="number" step="0.1" placeholder="e.g., 70" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} />{currentWeight && <p className="text-xs text-muted-foreground">{t.goals.current}: {currentWeight} {t.common.kg}</p>}</div>
            <div className="space-y-2"><Label htmlFor="daily-calories" className="flex items-center gap-2"><Flame className="h-4 w-4" />{t.goals.dailyCalorieGoal}</Label><Input id="daily-calories" type="number" placeholder="e.g., 2000" value={dailyCalories} onChange={(e) => setDailyCalories(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="weekly-workouts" className="flex items-center gap-2"><Dumbbell className="h-4 w-4" />{t.goals.weeklyWorkoutGoal}</Label><Input id="weekly-workouts" type="number" min="1" max="7" placeholder="e.g., 4" value={weeklyWorkouts} onChange={(e) => setWeeklyWorkouts(e.target.value)} /><p className="text-xs text-muted-foreground">{t.goals.thisWeek}: {workoutsThisWeek} {t.goals.workouts}</p></div>
            <div className="space-y-2"><Label htmlFor="target-body-fat" className="flex items-center gap-2"><Activity className="h-4 w-4" />{t.goals.targetBodyFat}</Label><Input id="target-body-fat" type="number" step="0.1" placeholder="e.g., 15" value={targetBodyFat} onChange={(e) => setTargetBodyFat(e.target.value)} />{latestBodyComp?.bodyFat && <p className="text-xs text-muted-foreground">{t.goals.current}: {latestBodyComp.bodyFat}%</p>}</div>
            <div className="space-y-2"><Label htmlFor="target-muscle-mass" className="flex items-center gap-2"><Dumbbell className="h-4 w-4" />{t.goals.targetMuscleMass}</Label><Input id="target-muscle-mass" type="number" step="0.1" placeholder="e.g., 40" value={targetMuscleMass} onChange={(e) => setTargetMuscleMass(e.target.value)} />{latestBodyComp?.muscleMass && <p className="text-xs text-muted-foreground">{t.goals.current}: {latestBodyComp.muscleMass} {t.common.kg}</p>}</div>
          </div>
          <Button onClick={saveGoals} className="w-full sm:w-auto">{t.goals.saveGoals}</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

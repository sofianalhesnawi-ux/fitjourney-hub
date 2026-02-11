import { useState } from 'react';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Scale, Flame, Dumbbell, Activity, Check, Sparkles, Trophy, Calculator, User } from 'lucide-react';
import { getWeekStart } from '@/lib/utils';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GoalCompleteCelebration } from '@/components/Celebration';
import { calculateBMR, calculateTDEE, calculateCalorieTarget, type ActivityLevel } from '@/lib/fitness-calculations';

export default function Goals() {
  const { data, updateGoals, t } = useFitTrack();
  const [targetWeight, setTargetWeight] = useState(data.goals.targetWeight?.toString() || '');
  const [dailyCalories, setDailyCalories] = useState(data.goals.dailyCalories?.toString() || '');
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(data.goals.weeklyWorkouts?.toString() || '');
  const [targetBodyFat, setTargetBodyFat] = useState(data.goals.targetBodyFat?.toString() || '');
  const [targetMuscleMass, setTargetMuscleMass] = useState(data.goals.targetMuscleMass?.toString() || '');
  const [height, setHeight] = useState(data.goals.height?.toString() || '');
  const [age, setAge] = useState(data.goals.age?.toString() || '');
  const [gender, setGender] = useState<'male' | 'female'>(data.goals.gender || 'male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(data.goals.activityLevel || 'moderate');
  const [weeklyWeightChange, setWeeklyWeightChange] = useState(data.goals.weeklyWeightChange?.toString() || '0');

  const currentWeight = [...data.weightEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.weight;
  const weekStart = getWeekStart();
  const workoutsThisWeek = data.workoutLogs.filter(log => new Date(log.date) >= weekStart).length;
  const latestBodyComp = [...data.bodyCompositions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [savedGoalName, setSavedGoalName] = useState('');

  // Parallax setup
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 300], [0, -20]);

  const saveGoals = () => { 
    updateGoals({ 
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined, 
      dailyCalories: dailyCalories ? parseInt(dailyCalories) : undefined, 
      weeklyWorkouts: weeklyWorkouts ? parseInt(weeklyWorkouts) : undefined, 
      targetBodyFat: targetBodyFat ? parseFloat(targetBodyFat) : undefined, 
      targetMuscleMass: targetMuscleMass ? parseFloat(targetMuscleMass) : undefined,
      height: height ? parseFloat(height) : undefined,
      age: age ? parseInt(age) : undefined,
      gender,
      activityLevel,
      weeklyWeightChange: weeklyWeightChange ? parseFloat(weeklyWeightChange) : undefined,
    });
    setSavedGoalName('Goals Updated Successfully!');
    setShowCelebration(true);
  };

  // Calculate BMR & TDEE
  const bmr = height && age && currentWeight
    ? calculateBMR(currentWeight, parseFloat(height), parseInt(age), gender)
    : 0;
  const tdee = bmr ? calculateTDEE(bmr, activityLevel) : 0;
  const recommendedCalories = tdee
    ? calculateCalorieTarget(tdee, parseFloat(weeklyWeightChange || '0'))
    : 0;

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
      <motion.div 
        variants={item} 
        className="flex items-center justify-between"
        style={{ y: parallaxY }}
      >
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
        <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card className="bg-gradient-to-br from-primary/5 via-card to-accent/5 overflow-hidden h-full">
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
        </motion.div>

        <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card className="overflow-hidden h-full">
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
        </motion.div>

        <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card className="overflow-hidden h-full">
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

      {/* Personal Info Section */}
      <motion.div variants={item}>
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-accent/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              {t.goals.personalInfo}
            </CardTitle>
            <CardDescription>{t.goals.personalInfoDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="height">{t.goals.height}</Label>
                <Input id="height" type="number" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">{t.goals.age}</Label>
                <Input id="age" type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>{t.goals.gender}</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t.goals.male}</SelectItem>
                    <SelectItem value="female">{t.goals.female}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.goals.activityLevel}</Label>
                <Select value={activityLevel} onValueChange={(v) => setActivityLevel(v as ActivityLevel)}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">{t.goals.sedentary}</SelectItem>
                    <SelectItem value="light">{t.goals.light}</SelectItem>
                    <SelectItem value="moderate">{t.goals.moderate}</SelectItem>
                    <SelectItem value="active">{t.goals.active}</SelectItem>
                    <SelectItem value="very_active">{t.goals.veryActive}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {bmr > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground">{t.goals.bmr}</p>
                  <p className="text-2xl font-bold">{bmr} <span className="text-sm font-normal text-muted-foreground">{t.common.kcal}</span></p>
                </div>
                <div className="p-4 rounded-xl bg-primary/10">
                  <p className="text-sm text-muted-foreground">{t.goals.tdee}</p>
                  <p className="text-2xl font-bold text-primary">{tdee} <span className="text-sm font-normal text-muted-foreground">{t.common.kcal}</span></p>
                </div>
              </div>
            )}

            <Button onClick={saveGoals} variant="outline" className="w-full sm:w-auto">
              <Sparkles className="h-4 w-4 me-2" />
              {t.goals.saveGoals}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Calorie Calculator */}
      <motion.div variants={item}>
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-warning/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-warning" />
              {t.goals.calorieCalculator}
            </CardTitle>
            <CardDescription>{t.goals.calorieCalcDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {tdee > 0 ? (
              <>
                <div className="space-y-2">
                  <Label>{t.goals.weeklyGoal}</Label>
                  <Select value={weeklyWeightChange} onValueChange={setWeeklyWeightChange}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">{t.goals.lose1kg}</SelectItem>
                      <SelectItem value="-0.5">{t.goals.lose05kg}</SelectItem>
                      <SelectItem value="0">{t.goals.maintain}</SelectItem>
                      <SelectItem value="0.5">{t.goals.gain05kg}</SelectItem>
                      <SelectItem value="1">{t.goals.gain1kg}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-warning/10 to-primary/10 border border-warning/20 text-center">
                  <p className="text-sm text-muted-foreground mb-1">{t.goals.recommendedCalories}</p>
                  <p className="text-4xl font-bold">{recommendedCalories}</p>
                  <p className="text-sm text-muted-foreground">{t.common.kcal}</p>
                </div>

                <Button 
                  onClick={() => { setDailyCalories(String(recommendedCalories)); saveGoals(); }}
                  className="w-full sm:w-auto shadow-lg shadow-warning/20"
                >
                  <Flame className="h-4 w-4 me-2" />
                  {t.goals.setAsGoal}
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-6">{t.goals.fillPersonalInfo}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Goal Saved Celebration */}
      <GoalCompleteCelebration 
        isVisible={showCelebration} 
        goalName={savedGoalName}
        onClose={() => setShowCelebration(false)} 
      />
    </motion.div>
  );
}

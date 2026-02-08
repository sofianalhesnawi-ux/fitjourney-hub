import { useState, useMemo } from 'react';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Apple, Coffee, Sun, Moon, Cookie, Trash2, ChevronLeft, ChevronRight, Droplets, TrendingUp, Utensils, Target } from 'lucide-react';
import { cn, generateId, formatDate, getToday } from '@/lib/utils';
import type { Meal, FoodItem } from '@/types/fitness';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, ReferenceLine, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckmarkCelebration } from '@/components/Celebration';

const MEAL_ICONS = { breakfast: Sun, lunch: Coffee, dinner: Moon, snack: Cookie };
const MEAL_COLORS = { 
  breakfast: 'from-amber-400 to-orange-500', 
  lunch: 'from-emerald-400 to-teal-500', 
  dinner: 'from-indigo-400 to-purple-500', 
  snack: 'from-pink-400 to-rose-500' 
};

export default function Nutrition() {
  const { data, addMeal, deleteMeal, addFrequentFood, addWaterEntry, updateWaterEntry, t, isRTL } = useFitTrack();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [mealType, setMealType] = useState<Meal['type']>('breakfast');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [currentFood, setCurrentFood] = useState({ name: '', calories: '', protein: '', carbs: '', fats: '', servingSize: '' });
  const [showCelebration, setShowCelebration] = useState(false);

  const MEAL_LABELS = { breakfast: t.nutrition.breakfast, lunch: t.nutrition.lunch, dinner: t.nutrition.dinner, snack: t.nutrition.snack };

  const todaysMeals = data.meals.filter(meal => meal.date === selectedDate);
  const totals = todaysMeals.reduce((acc, meal) => { meal.items.forEach(item => { acc.calories += item.calories; acc.protein += item.protein; acc.carbs += item.carbs; acc.fats += item.fats; }); return acc; }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  const calorieGoal = data.goals.dailyCalories || 2000;
  const calorieProgress = Math.min((totals.calories / calorieGoal) * 100, 100);
  const goalPercent = Math.round(calorieProgress);

  // Water tracking
  const waterGoal = data.goals.dailyWaterGlasses || 8;
  const todaysWater = data.waterEntries?.find(w => w.date === selectedDate);
  const currentGlasses = todaysWater?.glasses || 0;

  const addGlass = () => {
    if (todaysWater) {
      updateWaterEntry({ ...todaysWater, glasses: todaysWater.glasses + 1 });
    } else {
      addWaterEntry({ id: generateId(), date: selectedDate, glasses: 1, createdAt: new Date().toISOString() });
    }
  };

  const removeGlass = () => {
    if (todaysWater && todaysWater.glasses > 0) {
      updateWaterEntry({ ...todaysWater, glasses: todaysWater.glasses - 1 });
    }
  };

  // Weekly calorie data
  const weeklyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayMeals = data.meals.filter(m => m.date === dateStr);
      const cals = dayMeals.reduce((sum, m) => sum + m.items.reduce((s, item) => s + item.calories, 0), 0);
      const dayLabel = date.toLocaleDateString(isRTL ? 'ar' : 'en', { weekday: 'short' });
      days.push({ day: dayLabel, calories: cals, date: dateStr, isToday: dateStr === getToday() });
    }
    return days;
  }, [data.meals, isRTL]);

  // Macro goals (simple proportional defaults)
  const proteinGoal = Math.round((calorieGoal * 0.3) / 4);
  const carbsGoal = Math.round((calorieGoal * 0.45) / 4);
  const fatsGoal = Math.round((calorieGoal * 0.25) / 9);

  const navigateDate = (direction: 'prev' | 'next') => { const date = new Date(selectedDate); date.setDate(date.getDate() + (direction === 'next' ? 1 : -1)); setSelectedDate(date.toISOString().split('T')[0]); };
  
  const addFoodItem = () => { 
    if (!currentFood.name.trim()) return; 
    const newItem: FoodItem = { id: generateId(), name: currentFood.name.trim(), calories: parseInt(currentFood.calories) || 0, protein: parseInt(currentFood.protein) || 0, carbs: parseInt(currentFood.carbs) || 0, fats: parseInt(currentFood.fats) || 0, servingSize: currentFood.servingSize || undefined }; 
    setFoodItems([...foodItems, newItem]); 
    addFrequentFood(newItem); 
    setCurrentFood({ name: '', calories: '', protein: '', carbs: '', fats: '', servingSize: '' }); 
  };
  
  const removeFoodItem = (id: string) => { setFoodItems(foodItems.filter(item => item.id !== id)); };
  
  const saveMeal = () => { 
    if (foodItems.length === 0) return; 
    const isFirstMealToday = todaysMeals.length === 0;
    const meal: Meal = { id: generateId(), type: mealType, items: foodItems, date: selectedDate, createdAt: new Date().toISOString() }; 
    addMeal(meal); 
    setIsAddMealOpen(false); 
    setFoodItems([]); 
    setMealType('breakfast');
    if (isFirstMealToday && selectedDate === getToday()) {
      setShowCelebration(true);
    }
  };
  
  const selectFrequentFood = (food: FoodItem) => { setCurrentFood({ name: food.name, calories: food.calories.toString(), protein: food.protein.toString(), carbs: food.carbs.toString(), fats: food.fats.toString(), servingSize: food.servingSize || '' }); };
  const getMealsByType = (type: Meal['type']) => todaysMeals.filter(meal => meal.type === type);

  // SVG Calorie Ring
  const ringRadius = 58;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (calorieProgress / 100) * ringCircumference;

  return (
    <motion.div className="space-y-6 pb-20 lg:pb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <CheckmarkCelebration isVisible={showCelebration} onComplete={() => setShowCelebration(false)} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.nutrition.title}</h1>
          <p className="text-muted-foreground">{t.nutrition.subtitle}</p>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigateDate('prev')}>
          {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
        <div className="text-center">
          <p className="font-medium">{formatDate(selectedDate)}</p>
          {selectedDate === getToday() && <p className="text-xs text-muted-foreground">{t.common.today}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigateDate('next')} disabled={selectedDate === getToday()}>
          {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      {/* Daily Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Utensils, label: t.nutrition.mealsLogged, value: todaysMeals.length, color: 'text-primary' },
          { icon: TrendingUp, label: t.nutrition.avgPerMeal, value: todaysMeals.length > 0 ? Math.round(totals.calories / todaysMeals.length) : 0, suffix: t.common.kcal, color: 'text-accent' },
          { icon: Target, label: t.nutrition.goalAchieved, value: `${goalPercent}%`, color: goalPercent >= 100 ? 'text-emerald-500' : 'text-primary' },
          { icon: Droplets, label: t.nutrition.waterIntake, value: `${currentGlasses}/${waterGoal}`, suffix: t.nutrition.glasses, color: 'text-sky-500' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="bg-card/60 backdrop-blur-xl border-white/10 dark:border-white/5">
              <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                <stat.icon className={cn("h-5 w-5 mb-1", stat.color)} />
                <p className="text-xl font-bold">{stat.value}{stat.suffix ? <span className="text-xs font-normal text-muted-foreground ms-1">{stat.suffix}</span> : null}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Calorie Ring + Macros + Water */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Calorie Ring */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card/60 backdrop-blur-xl border-white/10 dark:border-white/5">
            <CardHeader className="pb-2"><CardTitle className="text-lg">{t.nutrition.calories}</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r={ringRadius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                  <motion.circle
                    cx="70" cy="70" r={ringRadius} fill="none"
                    stroke="url(#calorieGradient)" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    initial={{ strokeDashoffset: ringCircumference }}
                    animate={{ strokeDashoffset: ringOffset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span 
                    className="text-2xl font-bold" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {totals.calories}
                  </motion.span>
                  <span className="text-xs text-muted-foreground">/ {calorieGoal} {t.common.kcal}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {t.nutrition.kcalRemaining.replace('{0}', String(Math.max(calorieGoal - totals.calories, 0)))}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Macro Bars */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="bg-card/60 backdrop-blur-xl border-white/10 dark:border-white/5 h-full">
            <CardHeader className="pb-2"><CardTitle className="text-lg">{t.nutrition.macros}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: t.dashboard.protein, current: totals.protein, goal: proteinGoal, color: 'bg-chart-1' },
                { name: t.dashboard.carbs, current: totals.carbs, goal: carbsGoal, color: 'bg-chart-2' },
                { name: t.dashboard.fats, current: totals.fats, goal: fatsGoal, color: 'bg-chart-3' },
              ].map((macro, i) => {
                const pct = Math.min((macro.current / macro.goal) * 100, 100);
                return (
                  <motion.div key={macro.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{macro.name}</span>
                      <span className="text-muted-foreground">{macro.current}{t.common.g} / {macro.goal}{t.common.g}</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full", macro.color)}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Water Tracker */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card/60 backdrop-blur-xl border-white/10 dark:border-white/5 h-full">
            <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><Droplets className="h-5 w-5 text-sky-500" />{t.nutrition.waterIntake}</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-6">
                <Button variant="outline" size="icon" onClick={removeGlass} disabled={currentGlasses <= 0} className="rounded-full h-10 w-10">
                  <span className="text-lg font-bold">−</span>
                </Button>
                <div className="text-center">
                  <motion.p 
                    className="text-4xl font-bold text-sky-500" 
                    key={currentGlasses}
                    initial={{ scale: 1.3 }} 
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {currentGlasses}
                  </motion.p>
                  <p className="text-sm text-muted-foreground">{t.nutrition.of} {waterGoal} {t.nutrition.glasses}</p>
                </div>
                <Button variant="outline" size="icon" onClick={addGlass} className="rounded-full h-10 w-10">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {/* Water dots */}
              <div className="flex gap-1.5 flex-wrap justify-center">
                {Array.from({ length: waterGoal }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn("w-4 h-4 rounded-full transition-colors", i < currentGlasses ? "bg-sky-500" : "bg-muted")}
                    initial={i < currentGlasses ? { scale: 0 } : {}}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05, type: 'spring' }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Calorie Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-card/60 backdrop-blur-xl border-white/10 dark:border-white/5">
          <CardHeader className="pb-2"><CardTitle className="text-lg">{t.nutrition.weeklyCalories}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barSize={28}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis hide />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px' }} 
                    formatter={(value: number) => [`${value} ${t.common.kcal}`, t.nutrition.calories]}
                  />
                  <ReferenceLine y={calorieGoal} stroke="hsl(var(--primary))" strokeDasharray="6 4" strokeOpacity={0.5} />
                  <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
                    {weeklyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isToday ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.3)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Meal Button */}
      <div className="flex justify-end">
        <Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 me-2" />{t.nutrition.addMeal}</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{t.nutrition.addMeal}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>{t.nutrition.mealType}</Label>
                <Select value={mealType} onValueChange={(v) => setMealType(v as Meal['type'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">{t.nutrition.breakfast}</SelectItem>
                    <SelectItem value="lunch">{t.nutrition.lunch}</SelectItem>
                    <SelectItem value="dinner">{t.nutrition.dinner}</SelectItem>
                    <SelectItem value="snack">{t.nutrition.snack}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {data.frequentFoods.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">{t.nutrition.quickAdd}</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {data.frequentFoods.slice(0, 6).map(food => (
                      <Button key={food.id} size="sm" variant="outline" onClick={() => selectFrequentFood(food)} className="gap-1">
                        {food.name}
                        <span className="text-xs text-muted-foreground">{food.calories}{t.common.kcal}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Card className="border-dashed">
                <CardContent className="p-4 space-y-3">
                  <Input placeholder={t.nutrition.foodName} value={currentFood.name} onChange={(e) => setCurrentFood({ ...currentFood, name: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label className="text-xs">{t.nutrition.calories}</Label><Input type="number" placeholder={t.common.kcal} value={currentFood.calories} onChange={(e) => setCurrentFood({ ...currentFood, calories: e.target.value })} /></div>
                    <div><Label className="text-xs">{t.nutrition.servingSize}</Label><Input placeholder="e.g. 100g" value={currentFood.servingSize} onChange={(e) => setCurrentFood({ ...currentFood, servingSize: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><Label className="text-xs">{t.dashboard.protein}</Label><Input type="number" placeholder={t.common.g} value={currentFood.protein} onChange={(e) => setCurrentFood({ ...currentFood, protein: e.target.value })} /></div>
                    <div><Label className="text-xs">{t.dashboard.carbs}</Label><Input type="number" placeholder={t.common.g} value={currentFood.carbs} onChange={(e) => setCurrentFood({ ...currentFood, carbs: e.target.value })} /></div>
                    <div><Label className="text-xs">{t.dashboard.fats}</Label><Input type="number" placeholder={t.common.g} value={currentFood.fats} onChange={(e) => setCurrentFood({ ...currentFood, fats: e.target.value })} /></div>
                  </div>
                  <Button size="sm" onClick={addFoodItem} className="w-full"><Plus className="h-4 w-4 me-1" />{t.nutrition.addItem}</Button>
                </CardContent>
              </Card>

              <AnimatePresence>
                {foodItems.length > 0 && (
                  <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Label>{t.nutrition.itemsAdded}</Label>
                    {foodItems.map(item => (
                      <motion.div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        layout
                      >
                        <div>
                          <p className="font-medium">{item.name}{item.servingSize && <span className="text-xs text-muted-foreground ms-1">({item.servingSize})</span>}</p>
                          <p className="text-xs text-muted-foreground">{item.calories} {t.common.kcal} • P: {item.protein}{t.common.g} • C: {item.carbs}{t.common.g} • F: {item.fats}{t.common.g}</p>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => removeFoodItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button onClick={saveMeal} className="w-full" disabled={foodItems.length === 0}>{t.nutrition.saveMeal}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Meal List with Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{t.nutrition.all}</TabsTrigger>
          <TabsTrigger value="breakfast">{t.nutrition.breakfast}</TabsTrigger>
          <TabsTrigger value="lunch">{t.nutrition.lunch}</TabsTrigger>
          <TabsTrigger value="dinner">{t.nutrition.dinner}</TabsTrigger>
          <TabsTrigger value="snack">{t.nutrition.snacks}</TabsTrigger>
        </TabsList>
        {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-3">
            {(tab === 'all' ? todaysMeals : getMealsByType(tab as Meal['type'])).length > 0 
              ? (tab === 'all' ? todaysMeals : getMealsByType(tab as Meal['type'])).map((meal, index) => {
                const Icon = MEAL_ICONS[meal.type];
                const mealCalories = meal.items.reduce((sum, item) => sum + item.calories, 0);
                const mealProtein = meal.items.reduce((sum, item) => sum + item.protein, 0);
                const mealCarbs = meal.items.reduce((sum, item) => sum + item.carbs, 0);
                const mealFats = meal.items.reduce((sum, item) => sum + item.fats, 0);
                const macroTotal = (mealProtein * 4) + (mealCarbs * 4) + (mealFats * 9);
                const pP = macroTotal > 0 ? ((mealProtein * 4) / macroTotal) * 100 : 33;
                const pC = macroTotal > 0 ? ((mealCarbs * 4) / macroTotal) * 100 : 33;

                return (
                  <motion.div 
                    key={meal.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <Card className="bg-card/60 backdrop-blur-xl border-white/10 dark:border-white/5 overflow-hidden">
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          <motion.div 
                            className={cn("flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br shadow-lg", MEAL_COLORS[meal.type])}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <Icon className="h-5 w-5 text-white" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{MEAL_LABELS[meal.type]}</h3>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold">{mealCalories} {t.common.kcal}</span>
                                <Button size="icon" variant="ghost" onClick={() => deleteMeal(meal.id)} className="h-8 w-8"><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </div>
                            <div className="mt-1.5 space-y-1">
                              {meal.items.map(item => (
                                <p key={item.id} className="text-sm text-muted-foreground truncate">
                                  {item.name} – {item.calories} {t.common.kcal}
                                </p>
                              ))}
                            </div>
                            {/* Macro bar */}
                            <div className="mt-2 h-1.5 rounded-full overflow-hidden flex">
                              <div className="bg-chart-1 transition-all" style={{ width: `${pP}%` }} />
                              <div className="bg-chart-2 transition-all" style={{ width: `${pC}%` }} />
                              <div className="bg-chart-3 transition-all flex-1" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              }) 
              : (
                <Card className="bg-card/60 backdrop-blur-xl border-white/10 dark:border-white/5">
                  <CardContent className="py-8 text-center">
                    <Apple className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">{t.nutrition.noMealsLogged.replace('{0}', tab === 'all' ? t.nutrition.day : t.nutrition.meal)}</p>
                  </CardContent>
                </Card>
              )
            }
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
}

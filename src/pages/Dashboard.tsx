import { useState } from 'react';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Dumbbell, 
  Apple, 
  Scale,
  TrendingUp,
  TrendingDown,
  Plus,
  Flame,
  Sparkles,
  Zap
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { Link } from 'react-router-dom';
import { formatDateShort, getToday, getWeekStart } from '@/lib/utils';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AnimatedChartContainer, AnimatedNumber } from '@/components/AnimatedChart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StreakCounter } from '@/components/StreakCounter';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
];

export default function Dashboard() {
  const { data, t, isRTL } = useFitTrack();
  
  const today = getToday();
  const weekStart = getWeekStart();
  
  // Get latest weight
  const sortedWeights = [...data.weightEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const currentWeight = sortedWeights[0]?.weight;
  const previousWeight = sortedWeights[1]?.weight;
  const weightChange = currentWeight && previousWeight 
    ? currentWeight - previousWeight 
    : null;

  // Get latest body composition
  const latestBodyComp = [...data.bodyCompositions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  // Calculate workouts this week
  const workoutsThisWeek = data.workoutLogs.filter(
    log => new Date(log.date) >= weekStart
  ).length;

  // Today's nutrition
  const todaysMeals = data.meals.filter(meal => meal.date === today);
  const todaysCalories = todaysMeals.reduce((sum, meal) => 
    sum + meal.items.reduce((itemSum, item) => itemSum + item.calories, 0), 0
  );
  const todaysProtein = todaysMeals.reduce((sum, meal) => 
    sum + meal.items.reduce((itemSum, item) => itemSum + item.protein, 0), 0
  );
  const todaysCarbs = todaysMeals.reduce((sum, meal) => 
    sum + meal.items.reduce((itemSum, item) => itemSum + item.carbs, 0), 0
  );
  const todaysFats = todaysMeals.reduce((sum, meal) => 
    sum + meal.items.reduce((itemSum, item) => itemSum + item.fats, 0), 0
  );
  
  const calorieGoal = data.goals.dailyCalories || 2000;
  const calorieProgress = Math.min((todaysCalories / calorieGoal) * 100, 100);

  // Weight chart data (last 30 days)
  const weightChartData = sortedWeights
    .slice(0, 30)
    .reverse()
    .map(entry => ({
      date: formatDateShort(entry.date),
      weight: entry.weight
    }));

  // Weekly workout data
  const daysOfWeek = isRTL 
    ? ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const workoutBarData = daysOfWeek.map((day, index) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + index);
    const dayString = dayDate.toISOString().split('T')[0];
    const hasWorkout = data.workoutLogs.some(log => log.date === dayString);
    return { day, workouts: hasWorkout ? 1 : 0 };
  });

  // Macro pie chart data
  const macroData = [
    { name: t.dashboard.protein, value: todaysProtein * 4, grams: todaysProtein },
    { name: t.dashboard.carbs, value: todaysCarbs * 4, grams: todaysCarbs },
    { name: t.dashboard.fats, value: todaysFats * 9, grams: todaysFats },
  ];

  // Recent activity
  const recentWorkouts = [...data.workoutLogs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Chart view state for animated transitions
  const [chartView, setChartView] = useState<'week' | 'month'>('week');
  
  // Get monthly data for chart toggle
  const monthlyWeightData = sortedWeights
    .slice(0, 30)
    .reverse()
    .map(entry => ({
      date: formatDateShort(entry.date),
      weight: entry.weight
    }));
    
  const weeklyWeightData = sortedWeights
    .slice(0, 7)
    .reverse()
    .map(entry => ({
      date: formatDateShort(entry.date),
      weight: entry.weight
    }));
  
  const activeWeightData = chartView === 'week' ? weeklyWeightData : monthlyWeightData;

  // Scroll-based parallax setup
  const { scrollY } = useScroll();
  const parallaxY1 = useTransform(scrollY, [0, 500], [0, -30]);
  const parallaxY2 = useTransform(scrollY, [0, 500], [0, -20]);
  const parallaxY3 = useTransform(scrollY, [0, 500], [0, -15]);
  const parallaxScale = useTransform(scrollY, [0, 300], [1, 0.98]);
  const parallaxOpacity = useTransform(scrollY, [0, 400], [1, 0.8]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  };

  const StatCard = ({ 
    title, 
    icon: Icon, 
    value, 
    subtitle, 
    trend, 
    trendValue,
    gradient = false,
    children 
  }: {
    title: string;
    icon: React.ElementType;
    value: React.ReactNode;
    subtitle?: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    gradient?: boolean;
    children?: React.ReactNode;
  }) => (
    <Card className={gradient ? "bg-gradient-to-br from-primary/5 via-card to-accent/5" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 rounded-xl bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {trend && trendValue && (
          <p className={`text-sm flex items-center gap-1 mt-1 ${
            trend === 'up' ? 'text-warning' : 'text-success'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {trendValue}
          </p>
        )}
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {children}
      </CardContent>
    </Card>
  );

  return (
    <motion.div 
      className="space-y-8 pb-20 lg:pb-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header with parallax */}
      <motion.div 
        variants={item} 
        className="flex items-center justify-between"
        style={{ y: parallaxY1, scale: parallaxScale }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">{t.dashboard.title}</span>
          </h1>
          <p className="text-muted-foreground mt-1">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <StreakCounter />
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t.dashboard.keepItUp || 'Keep it up!'}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Stats with parallax */}
      <motion.div 
        variants={item} 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        style={{ y: parallaxY2, opacity: parallaxOpacity }}
      >
        <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <StatCard
            title={t.dashboard.currentWeight}
            icon={Scale}
            value={currentWeight ? <><AnimatedNumber value={currentWeight} /> {t.common.kg}</> : '—'}
            trend={weightChange !== null ? (weightChange > 0 ? 'up' : 'down') : undefined}
            trendValue={weightChange !== null ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} ${t.common.kg}` : undefined}
            gradient
          />
        </motion.div>

        <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <StatCard
            title={t.dashboard.bodyFat}
            icon={Activity}
            value={latestBodyComp?.bodyFat ? `${latestBodyComp.bodyFat}%` : '—'}
            subtitle={latestBodyComp ? `${t.dashboard.updated} ${formatDateShort(latestBodyComp.date)}` : t.common.noData}
          />
        </motion.div>

        <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <StatCard
            title={t.dashboard.workoutsThisWeek}
            icon={Dumbbell}
            value={<AnimatedNumber value={workoutsThisWeek} />}
            subtitle={t.dashboard.goalPerWeek.replace('{0}', String(data.goals.weeklyWorkouts || 4))}
          />
        </motion.div>

        <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card className="bg-gradient-to-br from-primary/5 via-card to-accent/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.todaysCalories}</CardTitle>
              <div className="p-2 rounded-xl bg-warning/10">
                <Flame className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                <AnimatedNumber value={todaysCalories} />
              </div>
              <div className="mt-3 space-y-2">
                <Progress value={calorieProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {todaysCalories} / {calorieGoal} {t.common.kcal}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="flex flex-wrap gap-3">
        <Button asChild size="lg" className="shadow-lg shadow-primary/20">
          <Link to="/workouts">
            <Plus className="h-5 w-5 me-2" />
            {t.dashboard.logWorkout}
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link to="/nutrition">
            <Apple className="h-5 w-5 me-2" />
            {t.dashboard.addMeal}
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link to="/metrics">
            <Scale className="h-5 w-5 me-2" />
            {t.dashboard.recordWeight}
          </Link>
        </Button>
      </motion.div>

      {/* Charts Row with parallax */}
      <motion.div 
        variants={item} 
        className="grid gap-6 lg:grid-cols-2"
        style={{ y: parallaxY3 }}
      >
        {/* Weight Trend with animated view toggle */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                {t.dashboard.weightTrend}
              </CardTitle>
              <Tabs value={chartView} onValueChange={(v) => setChartView(v as 'week' | 'month')}>
                <TabsList className="h-8">
                  <TabsTrigger value="week" className="text-xs px-3 h-6">{isRTL ? 'أسبوع' : 'Week'}</TabsTrigger>
                  <TabsTrigger value="month" className="text-xs px-3 h-6">{isRTL ? 'شهر' : 'Month'}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <AnimatedChartContainer chartKey={chartView}>
              {activeWeightData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={activeWeightData}>
                    <defs>
                      <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      reversed={isRTL}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      orientation={isRTL ? 'right' : 'left'}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fill="url(#weightGradient)"
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground">
                  <Scale className="h-12 w-12 mb-3 opacity-30" />
                  <p>{t.dashboard.noWeightData}</p>
                </div>
              )}
            </AnimatedChartContainer>
          </CardContent>
        </Card>

        {/* Weekly Workouts */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-accent/5 to-transparent">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              {t.dashboard.thisWeeksWorkouts}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={workoutBarData} barSize={40}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={1}/>
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  reversed={isRTL}
                />
                <YAxis 
                  domain={[0, 1]}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={() => ''}
                  orientation={isRTL ? 'right' : 'left'}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => [value ? t.workouts.completed : t.workouts.restDay, t.workouts.status]}
                />
                <Bar 
                  dataKey="workouts" 
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Nutrition & Activity Row */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        {/* Today's Macros */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-success/5 to-transparent">
            <CardTitle className="text-lg flex items-center gap-2">
              <Apple className="h-5 w-5 text-success" />
              {t.dashboard.todaysMacros}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-8">
              <div className="w-36 h-36 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      strokeWidth={0}
                    >
                      {macroData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}
                      formatter={(_, __, props) => [`${props.payload.grams}${t.common.g}`, props.payload.name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{todaysCalories}</p>
                    <p className="text-xs text-muted-foreground">{t.common.kcal}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                {macroData.map((macro, index) => (
                  <motion.div 
                    key={macro.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm" 
                        style={{ backgroundColor: CHART_COLORS[index] }} 
                      />
                      <span className="text-sm font-medium">{macro.name}</span>
                    </div>
                    <span className="font-bold">{macro.grams}{t.common.g}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-lg flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              {t.dashboard.recentWorkouts}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-primary">
              <Link to="/workouts">{t.common.viewAll}</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {recentWorkouts.length > 0 ? (
              <div className="space-y-4">
                {recentWorkouts.map((workout, index) => (
                  <motion.div 
                    key={workout.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {workout.templateName || t.dashboard.customWorkout}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateShort(workout.date)} • {workout.exercises.length} {t.dashboard.exercises}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <Dumbbell className="h-8 w-8 opacity-50" />
                </div>
                <p>{t.dashboard.noWorkoutsLogged}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

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
  Flame
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Link } from 'react-router-dom';
import { formatDateShort, getToday, getWeekStart } from '@/lib/utils';
import { motion } from 'framer-motion';

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
      className="space-y-6 pb-20 lg:pb-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.dashboard.title}</h1>
          <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.currentWeight}</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentWeight ? `${currentWeight} ${t.common.kg}` : '—'}
            </div>
            {weightChange !== null && (
              <p className={`text-xs flex items-center gap-1 ${weightChange > 0 ? 'text-warning' : 'text-success'}`}>
                {weightChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} {t.common.kg}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.bodyFat}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestBodyComp?.bodyFat ? `${latestBodyComp.bodyFat}%` : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {latestBodyComp ? `${t.dashboard.updated} ${formatDateShort(latestBodyComp.date)}` : t.common.noData}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.workoutsThisWeek}</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workoutsThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              {t.dashboard.goalPerWeek.replace('{0}', String(data.goals.weeklyWorkouts || 4))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.todaysCalories}</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysCalories}</div>
            <div className="mt-2">
              <Progress value={calorieProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {todaysCalories} / {calorieGoal} {t.common.kcal}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/workouts">
            <Plus className="h-4 w-4 me-2" />
            {t.dashboard.logWorkout}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/nutrition">
            <Apple className="h-4 w-4 me-2" />
            {t.dashboard.addMeal}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/metrics">
            <Scale className="h-4 w-4 me-2" />
            {t.dashboard.recordWeight}
          </Link>
        </Button>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        {/* Weight Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.dashboard.weightTrend}</CardTitle>
          </CardHeader>
          <CardContent>
            {weightChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    reversed={isRTL}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    orientation={isRTL ? 'right' : 'left'}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <p>{t.dashboard.noWeightData}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Workouts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.dashboard.thisWeeksWorkouts}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workoutBarData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  reversed={isRTL}
                />
                <YAxis 
                  domain={[0, 1]}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickFormatter={() => ''}
                  orientation={isRTL ? 'right' : 'left'}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [value ? t.workouts.completed : t.workouts.restDay, t.workouts.status]}
                />
                <Bar 
                  dataKey="workouts" 
                  fill="hsl(var(--chart-2))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Nutrition & Activity Row */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        {/* Today's Macros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.dashboard.todaysMacros}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                    >
                      {macroData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(_, __, props) => [`${props.payload.grams}${t.common.g}`, props.payload.name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[0] }} />
                    <span className="text-sm">{t.dashboard.protein}</span>
                  </div>
                  <span className="font-medium">{todaysProtein}{t.common.g}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[1] }} />
                    <span className="text-sm">{t.dashboard.carbs}</span>
                  </div>
                  <span className="font-medium">{todaysCarbs}{t.common.g}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[2] }} />
                    <span className="text-sm">{t.dashboard.fats}</span>
                  </div>
                  <span className="font-medium">{todaysFats}{t.common.g}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t.dashboard.recentWorkouts}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/workouts">{t.common.viewAll}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentWorkouts.length > 0 ? (
              <div className="space-y-4">
                {recentWorkouts.map(workout => (
                  <div key={workout.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {workout.templateName || t.dashboard.customWorkout}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateShort(workout.date)} • {workout.exercises.length} {t.dashboard.exercises}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t.dashboard.noWorkoutsLogged}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

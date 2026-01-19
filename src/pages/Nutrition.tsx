import { useState } from 'react';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Apple, 
  Coffee,
  Sun,
  Moon,
  Cookie,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { generateId, formatDate, getToday } from '@/lib/utils';
import type { Meal, FoodItem } from '@/types/fitness';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { motion } from 'framer-motion';

const MEAL_ICONS = {
  breakfast: Sun,
  lunch: Coffee,
  dinner: Moon,
  snack: Cookie
};

const MEAL_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack'
};

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
];

export default function Nutrition() {
  const { data, addMeal, deleteMeal, addFrequentFood } = useFitTrack();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  
  // Add meal form state
  const [mealType, setMealType] = useState<Meal['type']>('breakfast');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [currentFood, setCurrentFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: ''
  });

  const todaysMeals = data.meals.filter(meal => meal.date === selectedDate);
  
  // Calculate totals
  const totals = todaysMeals.reduce((acc, meal) => {
    meal.items.forEach(item => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fats += item.fats;
    });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const calorieGoal = data.goals.dailyCalories || 2000;
  const calorieProgress = Math.min((totals.calories / calorieGoal) * 100, 100);

  const macroData = [
    { name: 'Protein', value: totals.protein * 4, grams: totals.protein },
    { name: 'Carbs', value: totals.carbs * 4, grams: totals.carbs },
    { name: 'Fats', value: totals.fats * 9, grams: totals.fats },
  ];

  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const addFoodItem = () => {
    if (!currentFood.name.trim()) return;
    
    const newItem: FoodItem = {
      id: generateId(),
      name: currentFood.name.trim(),
      calories: parseInt(currentFood.calories) || 0,
      protein: parseInt(currentFood.protein) || 0,
      carbs: parseInt(currentFood.carbs) || 0,
      fats: parseInt(currentFood.fats) || 0
    };
    
    setFoodItems([...foodItems, newItem]);
    addFrequentFood(newItem);
    setCurrentFood({ name: '', calories: '', protein: '', carbs: '', fats: '' });
  };

  const removeFoodItem = (id: string) => {
    setFoodItems(foodItems.filter(item => item.id !== id));
  };

  const saveMeal = () => {
    if (foodItems.length === 0) return;
    
    const meal: Meal = {
      id: generateId(),
      type: mealType,
      items: foodItems,
      date: selectedDate,
      createdAt: new Date().toISOString()
    };
    
    addMeal(meal);
    setIsAddMealOpen(false);
    setFoodItems([]);
    setMealType('breakfast');
  };

  const selectFrequentFood = (food: FoodItem) => {
    setCurrentFood({
      name: food.name,
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      carbs: food.carbs.toString(),
      fats: food.fats.toString()
    });
  };

  const getMealsByType = (type: Meal['type']) => 
    todaysMeals.filter(meal => meal.type === type);

  return (
    <motion.div 
      className="space-y-6 pb-20 lg:pb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nutrition</h1>
          <p className="text-muted-foreground">Track your daily food intake</p>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigateDate('prev')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <p className="font-medium">{formatDate(selectedDate)}</p>
          {selectedDate === getToday() && (
            <p className="text-xs text-muted-foreground">Today</p>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigateDate('next')}
          disabled={selectedDate === getToday()}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Daily Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {totals.calories} <span className="text-lg font-normal text-muted-foreground">/ {calorieGoal} kcal</span>
            </div>
            <Progress value={calorieProgress} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.max(calorieGoal - totals.calories, 0)} kcal remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Macros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
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
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[0] }} />
                    <span>Protein</span>
                  </div>
                  <span className="font-medium">{totals.protein}g</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[1] }} />
                    <span>Carbs</span>
                  </div>
                  <span className="font-medium">{totals.carbs}g</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[2] }} />
                    <span>Fats</span>
                  </div>
                  <span className="font-medium">{totals.fats}g</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Meal Button */}
      <div className="flex justify-end">
        <Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Meal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Meal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Meal Type</Label>
                <Select value={mealType} onValueChange={(v) => setMealType(v as Meal['type'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Add from Frequent Foods */}
              {data.frequentFoods.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">Quick Add</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {data.frequentFoods.slice(0, 6).map(food => (
                      <Button
                        key={food.id}
                        size="sm"
                        variant="outline"
                        onClick={() => selectFrequentFood(food)}
                      >
                        {food.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Food Item Form */}
              <div className="p-3 border rounded-lg space-y-3">
                <Input
                  placeholder="Food name"
                  value={currentFood.name}
                  onChange={(e) => setCurrentFood({ ...currentFood, name: e.target.value })}
                />
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Label className="text-xs">Calories</Label>
                    <Input
                      type="number"
                      placeholder="kcal"
                      value={currentFood.calories}
                      onChange={(e) => setCurrentFood({ ...currentFood, calories: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Protein</Label>
                    <Input
                      type="number"
                      placeholder="g"
                      value={currentFood.protein}
                      onChange={(e) => setCurrentFood({ ...currentFood, protein: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Carbs</Label>
                    <Input
                      type="number"
                      placeholder="g"
                      value={currentFood.carbs}
                      onChange={(e) => setCurrentFood({ ...currentFood, carbs: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fats</Label>
                    <Input
                      type="number"
                      placeholder="g"
                      value={currentFood.fats}
                      onChange={(e) => setCurrentFood({ ...currentFood, fats: e.target.value })}
                    />
                  </div>
                </div>
                <Button size="sm" onClick={addFoodItem} className="w-full">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {/* Added Food Items */}
              {foodItems.length > 0 && (
                <div className="space-y-2">
                  <Label>Items Added</Label>
                  {foodItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.calories} kcal • P: {item.protein}g • C: {item.carbs}g • F: {item.fats}g
                        </p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => removeFoodItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                onClick={saveMeal} 
                className="w-full" 
                disabled={foodItems.length === 0}
              >
                Save Meal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Meals List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
          <TabsTrigger value="lunch">Lunch</TabsTrigger>
          <TabsTrigger value="dinner">Dinner</TabsTrigger>
          <TabsTrigger value="snack">Snacks</TabsTrigger>
        </TabsList>

        {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {(tab === 'all' ? todaysMeals : getMealsByType(tab as Meal['type'])).length > 0 ? (
              (tab === 'all' ? todaysMeals : getMealsByType(tab as Meal['type'])).map((meal) => {
                const Icon = MEAL_ICONS[meal.type];
                const mealCalories = meal.items.reduce((sum, item) => sum + item.calories, 0);
                return (
                  <Card key={meal.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{MEAL_LABELS[meal.type]}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{mealCalories} kcal</span>
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => deleteMeal(meal.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2 space-y-1">
                            {meal.items.map(item => (
                              <p key={item.id} className="text-sm text-muted-foreground">
                                {item.name} - {item.calories} kcal
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Apple className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No meals logged for this {tab === 'all' ? 'day' : 'meal'}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
}

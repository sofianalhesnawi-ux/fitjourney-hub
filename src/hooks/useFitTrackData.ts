import { useState, useEffect, useCallback } from 'react';
import type { 
  FitTrackData, 
  WorkoutTemplate, 
  WorkoutLog, 
  Meal, 
  WeightEntry, 
  BodyComposition,
  BodyMeasurement,
  ProgressPhoto,
  Goals,
  UserSettings,
  FoodItem,
  WaterEntry
} from '@/types/fitness';

const STORAGE_KEY = 'fittrack-data';

const defaultData: FitTrackData = {
  workoutTemplates: [],
  workoutLogs: [],
  meals: [],
  weightEntries: [],
  bodyCompositions: [],
  bodyMeasurements: [],
  progressPhotos: [],
  waterEntries: [],
  goals: {},
  settings: { theme: 'system', units: 'metric', language: 'en' },
  frequentFoods: []
};

export function useFitTrackData() {
  const [data, setData] = useState<FitTrackData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData({ ...defaultData, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load FitTrack data:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save FitTrack data:', error);
      }
    }
  }, [data, isLoaded]);

  // Workout Templates
  const addWorkoutTemplate = useCallback((template: WorkoutTemplate) => {
    setData(prev => ({
      ...prev,
      workoutTemplates: [...prev.workoutTemplates, template]
    }));
  }, []);

  const updateWorkoutTemplate = useCallback((template: WorkoutTemplate) => {
    setData(prev => ({
      ...prev,
      workoutTemplates: prev.workoutTemplates.map(t => 
        t.id === template.id ? template : t
      )
    }));
  }, []);

  const deleteWorkoutTemplate = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      workoutTemplates: prev.workoutTemplates.filter(t => t.id !== id)
    }));
  }, []);

  // Workout Logs
  const addWorkoutLog = useCallback((log: WorkoutLog) => {
    setData(prev => ({
      ...prev,
      workoutLogs: [...prev.workoutLogs, log]
    }));
  }, []);

  const updateWorkoutLog = useCallback((log: WorkoutLog) => {
    setData(prev => ({
      ...prev,
      workoutLogs: prev.workoutLogs.map(l => l.id === log.id ? log : l)
    }));
  }, []);

  const deleteWorkoutLog = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      workoutLogs: prev.workoutLogs.filter(l => l.id !== id)
    }));
  }, []);

  // Meals
  const addMeal = useCallback((meal: Meal) => {
    setData(prev => ({
      ...prev,
      meals: [...prev.meals, meal]
    }));
  }, []);

  const updateMeal = useCallback((meal: Meal) => {
    setData(prev => ({
      ...prev,
      meals: prev.meals.map(m => m.id === meal.id ? meal : m)
    }));
  }, []);

  const deleteMeal = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      meals: prev.meals.filter(m => m.id !== id)
    }));
  }, []);

  // Weight Entries
  const addWeightEntry = useCallback((entry: WeightEntry) => {
    setData(prev => ({
      ...prev,
      weightEntries: [...prev.weightEntries, entry]
    }));
  }, []);

  const deleteWeightEntry = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      weightEntries: prev.weightEntries.filter(e => e.id !== id)
    }));
  }, []);

  // Body Composition
  const addBodyComposition = useCallback((entry: BodyComposition) => {
    setData(prev => ({
      ...prev,
      bodyCompositions: [...prev.bodyCompositions, entry]
    }));
  }, []);

  const deleteBodyComposition = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      bodyCompositions: prev.bodyCompositions.filter(e => e.id !== id)
    }));
  }, []);

  // Body Measurements
  const addBodyMeasurement = useCallback((entry: BodyMeasurement) => {
    setData(prev => ({
      ...prev,
      bodyMeasurements: [...prev.bodyMeasurements, entry]
    }));
  }, []);

  const deleteBodyMeasurement = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      bodyMeasurements: prev.bodyMeasurements.filter(e => e.id !== id)
    }));
  }, []);

  // Progress Photos
  const addProgressPhoto = useCallback((photo: ProgressPhoto) => {
    setData(prev => ({
      ...prev,
      progressPhotos: [...prev.progressPhotos, photo]
    }));
  }, []);

  const deleteProgressPhoto = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      progressPhotos: prev.progressPhotos.filter(p => p.id !== id)
    }));
  }, []);

  // Goals
  const updateGoals = useCallback((goals: Goals) => {
    setData(prev => ({
      ...prev,
      goals: { ...prev.goals, ...goals }
    }));
  }, []);

  // Settings
  const updateSettings = useCallback((settings: Partial<UserSettings>) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }));
  }, []);

  // Frequent Foods
  const addFrequentFood = useCallback((food: FoodItem) => {
    setData(prev => {
      const existing = prev.frequentFoods.find(f => f.name.toLowerCase() === food.name.toLowerCase());
      if (existing) return prev;
      return {
        ...prev,
        frequentFoods: [...prev.frequentFoods, food].slice(-20) // Keep last 20
      };
    });
  }, []);

  // Water Entries
  const addWaterEntry = useCallback((entry: WaterEntry) => {
    setData(prev => ({
      ...prev,
      waterEntries: [...prev.waterEntries, entry]
    }));
  }, []);

  const updateWaterEntry = useCallback((entry: WaterEntry) => {
    setData(prev => ({
      ...prev,
      waterEntries: prev.waterEntries.map(w => w.id === entry.id ? entry : w)
    }));
  }, []);

  const deleteWaterEntry = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      waterEntries: prev.waterEntries.filter(w => w.id !== id)
    }));
  }, []);

  // Export/Import
  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fittrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data]);

  const importData = useCallback((jsonString: string, merge: boolean = false): boolean => {
    try {
      const imported = JSON.parse(jsonString) as FitTrackData;
      // Validate structure
      if (!imported || typeof imported !== 'object') {
        throw new Error('Invalid data structure');
      }
      
      if (merge) {
        setData(prev => ({
          workoutTemplates: [...prev.workoutTemplates, ...(imported.workoutTemplates || [])],
          workoutLogs: [...prev.workoutLogs, ...(imported.workoutLogs || [])],
          meals: [...prev.meals, ...(imported.meals || [])],
          weightEntries: [...prev.weightEntries, ...(imported.weightEntries || [])],
          bodyCompositions: [...prev.bodyCompositions, ...(imported.bodyCompositions || [])],
          bodyMeasurements: [...prev.bodyMeasurements, ...(imported.bodyMeasurements || [])],
          progressPhotos: [...prev.progressPhotos, ...(imported.progressPhotos || [])],
          waterEntries: [...prev.waterEntries, ...(imported.waterEntries || [])],
          goals: { ...prev.goals, ...imported.goals },
          settings: { ...prev.settings, ...imported.settings },
          frequentFoods: [...prev.frequentFoods, ...(imported.frequentFoods || [])]
        }));
      } else {
        setData({ ...defaultData, ...imported });
      }
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }, []);

  const clearAllData = useCallback(() => {
    setData(defaultData);
  }, []);

  return {
    data,
    isLoaded,
    // Workout Templates
    addWorkoutTemplate,
    updateWorkoutTemplate,
    deleteWorkoutTemplate,
    // Workout Logs
    addWorkoutLog,
    updateWorkoutLog,
    deleteWorkoutLog,
    // Meals
    addMeal,
    updateMeal,
    deleteMeal,
    // Weight
    addWeightEntry,
    deleteWeightEntry,
    // Body Composition
    addBodyComposition,
    deleteBodyComposition,
    // Body Measurements
    addBodyMeasurement,
    deleteBodyMeasurement,
    // Progress Photos
    addProgressPhoto,
    deleteProgressPhoto,
    // Water
    addWaterEntry,
    updateWaterEntry,
    deleteWaterEntry,
    // Goals
    updateGoals,
    // Settings
    updateSettings,
    // Frequent Foods
    addFrequentFood,
    // Export/Import
    exportData,
    importData,
    clearAllData
  };
}

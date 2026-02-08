// Core data types for FitTrack

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutLog {
  id: string;
  templateId?: string;
  templateName?: string;
  date: string;
  exercises: ExerciseLog[];
  notes?: string;
  duration?: number; // in minutes
  createdAt: string;
}

export interface ExerciseLog {
  id: string;
  name: string;
  sets: SetLog[];
}

export interface SetLog {
  reps: number;
  weight?: number;
  completed: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize?: string;
}

export interface WaterEntry {
  id: string;
  date: string;
  glasses: number;
  createdAt: string;
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: FoodItem[];
  date: string;
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  createdAt: string;
}

export interface BodyComposition {
  id: string;
  date: string;
  bodyFat?: number;
  muscleMass?: number;
  waterPercentage?: number;
  bmi?: number;
  createdAt: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  chest?: number;
  waist?: number;
  hips?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  createdAt: string;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  imageData: string; // base64
  notes?: string;
  createdAt: string;
}

export interface Goals {
  targetWeight?: number;
  dailyCalories?: number;
  weeklyWorkouts?: number;
  targetBodyFat?: number;
  targetMuscleMass?: number;
  dailyWaterGlasses?: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  units: 'metric' | 'imperial';
  language: 'en' | 'ar';
}

export interface FitTrackData {
  workoutTemplates: WorkoutTemplate[];
  workoutLogs: WorkoutLog[];
  meals: Meal[];
  weightEntries: WeightEntry[];
  bodyCompositions: BodyComposition[];
  bodyMeasurements: BodyMeasurement[];
  progressPhotos: ProgressPhoto[];
  waterEntries: WaterEntry[];
  goals: Goals;
  settings: UserSettings;
  frequentFoods: FoodItem[];
}

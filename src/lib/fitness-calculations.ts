// Accurate fitness calculations

/**
 * BMI = weight(kg) / height(m)²
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): { label: string; labelAr: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', labelAr: 'نقص وزن', color: 'text-blue-500' };
  if (bmi < 25) return { label: 'Normal', labelAr: 'طبيعي', color: 'text-success' };
  if (bmi < 30) return { label: 'Overweight', labelAr: 'زيادة وزن', color: 'text-warning' };
  return { label: 'Obese', labelAr: 'سمنة', color: 'text-destructive' };
}

/**
 * Mifflin-St Jeor equation (most accurate for BMR)
 * Male:   BMR = 10W + 6.25H − 5A + 5
 * Female: BMR = 10W + 6.25H − 5A − 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female'
): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 0;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

/**
 * TDEE = BMR × activity multiplier
 */
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
} as const;

export type ActivityLevel = keyof typeof ACTIVITY_MULTIPLIERS;

export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel
): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Calorie targets for weight change goals
 * 1 kg of body fat ≈ 7700 kcal
 * Safe rate: 0.25-1 kg/week
 */
export function calculateCalorieTarget(
  tdee: number,
  weeklyWeightChangeKg: number
): number {
  const dailyChange = (weeklyWeightChangeKg * 7700) / 7;
  return Math.round(tdee + dailyChange);
}

/**
 * Fat Mass = weight × (bodyFat% / 100)
 * Lean Body Mass = weight - fatMass
 */
export function calculateFatMass(weightKg: number, bodyFatPercent: number): number {
  return parseFloat((weightKg * bodyFatPercent / 100).toFixed(1));
}

export function calculateLeanMass(weightKg: number, bodyFatPercent: number): number {
  return parseFloat((weightKg * (1 - bodyFatPercent / 100)).toFixed(1));
}

export function calculateSMMRatio(muscleMassKg: number, weightKg: number): number {
  if (weightKg <= 0) return 0;
  return parseFloat((muscleMassKg / weightKg * 100).toFixed(1));
}

export function getBodyFatCategory(
  bodyFat: number,
  gender: 'male' | 'female'
): { label: string; labelAr: string; color: string } {
  if (gender === 'male') {
    if (bodyFat < 6) return { label: 'Essential', labelAr: 'أساسي', color: 'text-blue-500' };
    if (bodyFat < 14) return { label: 'Athletic', labelAr: 'رياضي', color: 'text-success' };
    if (bodyFat < 18) return { label: 'Fitness', labelAr: 'لياقة', color: 'text-success' };
    if (bodyFat < 25) return { label: 'Average', labelAr: 'متوسط', color: 'text-warning' };
    return { label: 'Above Average', labelAr: 'فوق المتوسط', color: 'text-destructive' };
  } else {
    if (bodyFat < 14) return { label: 'Essential', labelAr: 'أساسي', color: 'text-blue-500' };
    if (bodyFat < 21) return { label: 'Athletic', labelAr: 'رياضي', color: 'text-success' };
    if (bodyFat < 25) return { label: 'Fitness', labelAr: 'لياقة', color: 'text-success' };
    if (bodyFat < 32) return { label: 'Average', labelAr: 'متوسط', color: 'text-warning' };
    return { label: 'Above Average', labelAr: 'فوق المتوسط', color: 'text-destructive' };
  }
}

export function getWaterCategory(
  waterPercent: number,
  gender: 'male' | 'female'
): { label: string; labelAr: string; color: string } {
  const normalMin = gender === 'male' ? 50 : 45;
  const normalMax = gender === 'male' ? 65 : 60;
  if (waterPercent < normalMin) return { label: 'Low', labelAr: 'منخفض', color: 'text-warning' };
  if (waterPercent <= normalMax) return { label: 'Normal', labelAr: 'طبيعي', color: 'text-success' };
  return { label: 'High', labelAr: 'مرتفع', color: 'text-blue-500' };
}

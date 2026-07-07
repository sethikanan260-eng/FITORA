export const ACTIVITY = {
  sedentary: { label: "Desk job", mult: 1.2 },
  light: { label: "On your feet", mult: 1.375 },
  active: { label: "Physically active", mult: 1.55 },
  athlete: { label: "Trains hard already", mult: 1.725 },
}

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function calcPlan({ weight, height, age, sex, activity, experience, daysPerWeek, diet }) {
  const w = Number(weight), h = Number(height), a = Number(age)
  const bmr = sex === "male" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161
  const tdee = bmr * ACTIVITY[activity].mult
  const calorieTarget = Math.round(tdee + 300)
  const proteinPerKg = experience === "beginner" ? 1.8 : 2.0
  const proteinG = Math.round(w * proteinPerKg)
  let fatG, carbG
  if (diet === "keto") {
    fatG = Math.round((calorieTarget * 0.7) / 9)
    carbG = Math.max(20, Math.round((calorieTarget - proteinG * 4 - fatG * 9) / 4))
  } else {
    fatG = Math.round((calorieTarget * 0.25) / 9)
    carbG = Math.round((calorieTarget - proteinG * 4 - fatG * 9) / 4)
  }
  const split = buildSplit(Number(daysPerWeek))
  return { calorieTarget, proteinG, fatG, carbG, split, weeklySchedule: buildWeeklySchedule(split) }
}

function buildSplit(daysPerWeek) {
  if (daysPerWeek <= 3) return ["fullA", "fullB", "fullA"].slice(0, daysPerWeek)
  if (daysPerWeek === 4) return ["upper", "lower", "upper", "lower"]
  if (daysPerWeek === 5) return ["push", "pull", "legs", "upper", "lower"]
  return ["push", "pull", "legs", "push", "pull", "legs"]
}

function buildWeeklySchedule(split) {
  const n = split.length
  const schedule = new Array(7).fill(null)
  if (n === 0) return schedule
  if (n >= 7) return split.slice(0, 7)
  const usedSlots = new Set()
  for (let i = 0; i < n; i++) {
    let dayIdx = Math.round((i * 7) / n)
    while (usedSlots.has(dayIdx) && dayIdx < 6) dayIdx++
    dayIdx = Math.min(dayIdx, 6)
    schedule[dayIdx] = split[i]
    usedSlots.add(dayIdx)
  }
  return schedule
}

export const EXERCISE_LIBRARY = {
  push: [
    { name: "Barbell Bench Press", sets: { beginner: "3×8", intermediate: "4×6", advanced: "5×5" } },
    { name: "Overhead Press", sets: { beginner: "3×8", intermediate: "3×6", advanced: "4×5" } },
    { name: "Incline Dumbbell Press", sets: { beginner: "3×10", intermediate: "3×10", advanced: "4×8" } },
    { name: "Cable Lateral Raise", sets: { beginner: "3×12", intermediate: "3×15", advanced: "4×15" } },
    { name: "Triceps Rope Pushdown", sets: { beginner: "3×12", intermediate: "3×12", advanced: "4×10" } },
  ],
  pull: [
    { name: "Deadlift", sets: { beginner: "3×5", intermediate: "4×5", advanced: "5×3" } },
    { name: "Pull-Up / Lat Pulldown", sets: { beginner: "3×8", intermediate: "4×8", advanced: "5×6" } },
    { name: "Barbell Row", sets: { beginner: "3×8", intermediate: "4×8", advanced: "4×6" } },
    { name: "Face Pull", sets: { beginner: "3×15", intermediate: "3×15", advanced: "4×15" } },
    { name: "Barbell Curl", sets: { beginner: "3×10", intermediate: "3×10", advanced: "4×8" } },
  ],
  legs: [
    { name: "Back Squat", sets: { beginner: "3×8", intermediate: "4×6", advanced: "5×5" } },
    { name: "Romanian Deadlift", sets: { beginner: "3×10", intermediate: "3×8", advanced: "4×8" } },
    { name: "Leg Press", sets: { beginner: "3×12", intermediate: "3×10", advanced: "4×10" } },
    { name: "Walking Lunge", sets: { beginner: "3×12 ea", intermediate: "3×12 ea", advanced: "4×12 ea" } },
    { name: "Standing Calf Raise", sets: { beginner: "3×15", intermediate: "4×15", advanced: "4×20" } },
  ],
  upper: [
    { name: "Barbell Bench Press", sets: { beginner: "3×8", intermediate: "4×6", advanced: "5×5" } },
    { name: "Pull-Up / Lat Pulldown", sets: { beginner: "3×8", intermediate: "4×8", advanced: "5×6" } },
    { name: "Overhead Press", sets: { beginner: "3×8", intermediate: "3×6", advanced: "4×5" } },
    { name: "Barbell Row", sets: { beginner: "3×8", intermediate: "4×8", advanced: "4×6" } },
    { name: "Triceps Rope Pushdown", sets: { beginner: "3×12", intermediate: "3×12", advanced: "4×10" } },
  ],
  lower: [
    { name: "Back Squat", sets: { beginner: "3×8", intermediate: "4×6", advanced: "5×5" } },
    { name: "Romanian Deadlift", sets: { beginner: "3×10", intermediate: "3×8", advanced: "4×8" } },
    { name: "Leg Press", sets: { beginner: "3×12", intermediate: "3×10", advanced: "4×10" } },
    { name: "Standing Calf Raise", sets: { beginner: "3×15", intermediate: "4×15", advanced: "4×20" } },
  ],
  fullA: [
    { name: "Back Squat", sets: { beginner: "3×8", intermediate: "4×6", advanced: "5×5" } },
    { name: "Barbell Bench Press", sets: { beginner: "3×8", intermediate: "4×6", advanced: "5×5" } },
    { name: "Barbell Row", sets: { beginner: "3×8", intermediate: "4×8", advanced: "4×6" } },
    { name: "Plank", sets: { beginner: "3×30s", intermediate: "3×45s", advanced: "4×60s" } },
  ],
  fullB: [
    { name: "Deadlift", sets: { beginner: "3×5", intermediate: "4×5", advanced: "5×3" } },
    { name: "Overhead Press", sets: { beginner: "3×8", intermediate: "3×6", advanced: "4×5" } },
    { name: "Pull-Up / Lat Pulldown", sets: { beginner: "3×8", intermediate: "4×8", advanced: "5×6" } },
    { name: "Walking Lunge", sets: { beginner: "3×12 ea", intermediate: "3×12 ea", advanced: "4×12 ea" } },
  ],
}

export const DAY_LABELS = {
  push: "Push", pull: "Pull", legs: "Legs",
  upper: "Upper Body", lower: "Lower Body",
  fullA: "Full Body A", fullB: "Full Body B",
}

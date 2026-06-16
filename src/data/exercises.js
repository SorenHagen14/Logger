const exercises = [
  // Chest
  { id: 'chest-01', name: 'Flat Barbell Bench Press', muscleGroup: 'Chest', isBuiltIn: true },
  { id: 'chest-02', name: 'Flat Dumbbell Bench Press', muscleGroup: 'Chest', isBuiltIn: true },
  { id: 'chest-03', name: 'Flat Smith Machine Bench Press', muscleGroup: 'Chest', isBuiltIn: true },
  { id: 'chest-04', name: 'Incline Barbell Bench Press', muscleGroup: 'Chest', isBuiltIn: true },
  { id: 'chest-05', name: 'Incline Dumbbell Bench Press', muscleGroup: 'Chest', isBuiltIn: true },
  { id: 'chest-06', name: 'Incline Smith Machine Bench Press', muscleGroup: 'Chest', isBuiltIn: true },
  { id: 'chest-07', name: 'Decline Barbell Bench Press', muscleGroup: 'Chest', isBuiltIn: true },
  { id: 'chest-08', name: 'Decline Dumbbell Bench Press', muscleGroup: 'Chest', isBuiltIn: true },
  { id: 'chest-09', name: 'Cable Chest Fly (High to Low)', muscleGroup: 'Chest', isBuiltIn: true },
  { id: 'chest-10', name: 'Cable Chest Fly (Low to High)', muscleGroup: 'Chest', isBuiltIn: true },
  { id: 'chest-11', name: 'Cable Chest Fly (Mid)', muscleGroup: 'Chest', isBuiltIn: true },
  { id: 'chest-12', name: 'Machine Chest Fly', muscleGroup: 'Chest', isBuiltIn: true },
  { id: 'chest-13', name: 'Dumbbell Chest Fly', muscleGroup: 'Chest', isBuiltIn: true },
  { id: 'chest-14', name: 'Chest Dip', muscleGroup: 'Chest', isBuiltIn: true },
  { id: 'chest-15', name: 'Machine Chest Press', muscleGroup: 'Chest', isBuiltIn: true },

  // Back
  { id: 'back-01', name: 'Barbell Bent-Over Row', muscleGroup: 'Back', isBuiltIn: true },
  { id: 'back-02', name: 'Dumbbell Row', muscleGroup: 'Back', isBuiltIn: true },
  { id: 'back-03', name: 'Cable Lat Pulldown', muscleGroup: 'Back', isBuiltIn: true },
  { id: 'back-04', name: 'Cable Lat Pullover', muscleGroup: 'Back', isBuiltIn: true },
  { id: 'back-05', name: 'Dumbbell Lat Pullover', muscleGroup: 'Back', isBuiltIn: true },
  { id: 'back-06', name: 'Seated Cable Row', muscleGroup: 'Back', isBuiltIn: true },
  { id: 'back-07', name: 'T-Bar Row', muscleGroup: 'Back', isBuiltIn: true },
  { id: 'back-08', name: 'Pull-Up', muscleGroup: 'Back', isBuiltIn: true },
  { id: 'back-09', name: 'Chin-Up', muscleGroup: 'Back', isBuiltIn: true },
  { id: 'back-10', name: 'Machine Row', muscleGroup: 'Back', isBuiltIn: true },
  { id: 'back-11', name: 'Straight-Arm Pulldown', muscleGroup: 'Back', isBuiltIn: true },
  { id: 'back-12', name: 'Barbell Deadlift', muscleGroup: 'Back', isBuiltIn: true },
  { id: 'back-13', name: 'Dumbbell Deadlift', muscleGroup: 'Back', isBuiltIn: true },

  // Shoulders
  { id: 'shldr-01', name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', isBuiltIn: true },
  { id: 'shldr-02', name: 'Barbell Overhead Press', muscleGroup: 'Shoulders', isBuiltIn: true },
  { id: 'shldr-03', name: 'Smith Machine Shoulder Press', muscleGroup: 'Shoulders', isBuiltIn: true },
  { id: 'shldr-04', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', isBuiltIn: true },
  { id: 'shldr-05', name: 'Machine Lateral Raise', muscleGroup: 'Shoulders', isBuiltIn: true },
  { id: 'shldr-06', name: 'Cable Lateral Raise', muscleGroup: 'Shoulders', isBuiltIn: true },
  { id: 'shldr-07', name: 'Dumbbell Front Raise', muscleGroup: 'Shoulders', isBuiltIn: true },
  { id: 'shldr-08', name: 'Cable Front Raise', muscleGroup: 'Shoulders', isBuiltIn: true },
  { id: 'shldr-09', name: 'Dumbbell Rear Delt Fly', muscleGroup: 'Shoulders', isBuiltIn: true },
  { id: 'shldr-10', name: 'Cable Face Pull', muscleGroup: 'Shoulders', isBuiltIn: true },
  { id: 'shldr-11', name: 'Machine Reverse Fly', muscleGroup: 'Shoulders', isBuiltIn: true },
  { id: 'shldr-12', name: 'Barbell Upright Row', muscleGroup: 'Shoulders', isBuiltIn: true },

  // Biceps
  { id: 'bi-01', name: 'Barbell Curl', muscleGroup: 'Biceps', isBuiltIn: true },
  { id: 'bi-02', name: 'Dumbbell Curl', muscleGroup: 'Biceps', isBuiltIn: true },
  { id: 'bi-03', name: 'EZ Bar Curl', muscleGroup: 'Biceps', isBuiltIn: true },
  { id: 'bi-04', name: 'Hammer Curl', muscleGroup: 'Biceps', isBuiltIn: true },
  { id: 'bi-05', name: 'Cable Curl', muscleGroup: 'Biceps', isBuiltIn: true },
  { id: 'bi-06', name: 'Preacher Curl', muscleGroup: 'Biceps', isBuiltIn: true },
  { id: 'bi-07', name: 'Incline Dumbbell Curl', muscleGroup: 'Biceps', isBuiltIn: true },
  { id: 'bi-08', name: 'Concentration Curl', muscleGroup: 'Biceps', isBuiltIn: true },
  { id: 'bi-09', name: 'Machine Curl', muscleGroup: 'Biceps', isBuiltIn: true },

  // Triceps
  { id: 'tri-01', name: 'Overhead Tricep Extension (Dumbbell)', muscleGroup: 'Triceps', isBuiltIn: true },
  { id: 'tri-02', name: 'Overhead Tricep Extension (Cable)', muscleGroup: 'Triceps', isBuiltIn: true },
  { id: 'tri-03', name: 'Cable Tricep Pushdown (Rope)', muscleGroup: 'Triceps', isBuiltIn: true },
  { id: 'tri-04', name: 'Cable Tricep Pushdown (Bar)', muscleGroup: 'Triceps', isBuiltIn: true },
  { id: 'tri-05', name: 'Skull Crushers (EZ Bar)', muscleGroup: 'Triceps', isBuiltIn: true },
  { id: 'tri-06', name: 'Skull Crushers (Dumbbell)', muscleGroup: 'Triceps', isBuiltIn: true },
  { id: 'tri-07', name: 'Tricep Dip', muscleGroup: 'Triceps', isBuiltIn: true },
  { id: 'tri-08', name: 'Close-Grip Bench Press', muscleGroup: 'Triceps', isBuiltIn: true },
  { id: 'tri-09', name: 'Machine Tricep Extension', muscleGroup: 'Triceps', isBuiltIn: true },

  // Quads
  { id: 'quad-01', name: 'Barbell Back Squat', muscleGroup: 'Quads', isBuiltIn: true },
  { id: 'quad-02', name: 'Smith Machine Back Squat', muscleGroup: 'Quads', isBuiltIn: true },
  { id: 'quad-03', name: 'Front Squat', muscleGroup: 'Quads', isBuiltIn: true },
  { id: 'quad-04', name: 'Leg Press', muscleGroup: 'Quads', isBuiltIn: true },
  { id: 'quad-05', name: 'Leg Extension', muscleGroup: 'Quads', isBuiltIn: true },
  { id: 'quad-06', name: 'Hack Squat', muscleGroup: 'Quads', isBuiltIn: true },
  { id: 'quad-07', name: 'Goblet Squat', muscleGroup: 'Quads', isBuiltIn: true },
  { id: 'quad-08', name: 'Bulgarian Split Squat', muscleGroup: 'Quads', isBuiltIn: true },
  { id: 'quad-09', name: 'Walking Lunge', muscleGroup: 'Quads', isBuiltIn: true },
  { id: 'quad-10', name: 'Dumbbell Lunge', muscleGroup: 'Quads', isBuiltIn: true },

  // Hamstrings
  { id: 'ham-01', name: 'Romanian Deadlift (Barbell)', muscleGroup: 'Hamstrings', isBuiltIn: true },
  { id: 'ham-02', name: 'Romanian Deadlift (Dumbbell)', muscleGroup: 'Hamstrings', isBuiltIn: true },
  { id: 'ham-03', name: 'Lying Leg Curl', muscleGroup: 'Hamstrings', isBuiltIn: true },
  { id: 'ham-04', name: 'Seated Leg Curl', muscleGroup: 'Hamstrings', isBuiltIn: true },
  { id: 'ham-05', name: 'Nordic Hamstring Curl', muscleGroup: 'Hamstrings', isBuiltIn: true },
  { id: 'ham-06', name: 'Stiff-Leg Deadlift', muscleGroup: 'Hamstrings', isBuiltIn: true },
  { id: 'ham-07', name: 'Cable Pull-Through', muscleGroup: 'Hamstrings', isBuiltIn: true },
  { id: 'ham-08', name: 'Glute-Ham Raise', muscleGroup: 'Hamstrings', isBuiltIn: true },

  // Calves
  { id: 'calf-01', name: 'Standing Calf Raise (Machine)', muscleGroup: 'Calves', isBuiltIn: true },
  { id: 'calf-02', name: 'Seated Calf Raise', muscleGroup: 'Calves', isBuiltIn: true },
  { id: 'calf-03', name: 'Smith Machine Calf Raise', muscleGroup: 'Calves', isBuiltIn: true },
  { id: 'calf-04', name: 'Leg Press Calf Raise', muscleGroup: 'Calves', isBuiltIn: true },
  { id: 'calf-05', name: 'Dumbbell Calf Raise', muscleGroup: 'Calves', isBuiltIn: true },

  // Core
  { id: 'core-01', name: 'Cable Crunch', muscleGroup: 'Core', isBuiltIn: true },
  { id: 'core-02', name: 'Hanging Leg Raise', muscleGroup: 'Core', isBuiltIn: true },
  { id: 'core-03', name: 'Ab Wheel Rollout', muscleGroup: 'Core', isBuiltIn: true },
  { id: 'core-04', name: 'Plank', muscleGroup: 'Core', isBuiltIn: true },
  { id: 'core-05', name: 'Russian Twist', muscleGroup: 'Core', isBuiltIn: true },
  { id: 'core-06', name: 'Decline Sit-Up', muscleGroup: 'Core', isBuiltIn: true },
  { id: 'core-07', name: 'Machine Crunch', muscleGroup: 'Core', isBuiltIn: true },
  { id: 'core-08', name: 'Woodchop (Cable)', muscleGroup: 'Core', isBuiltIn: true },
];

export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quads', 'Hamstrings', 'Calves', 'Core'
];

export default exercises;

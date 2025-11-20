import { Exercise } from '../types';

export const exercises: Exercise[] = [
  { 
    id: '1', 
    name: 'Bench Press', 
    primaryMuscle: 'pectorals', 
    supportingMuscles: ['shoulders', 'triceps'], 
    equipment: 'barbell', 
    difficulty: 'intermediate',
    instructions: [
      "Lie on a flat bench with your eyes under the bar.",
      "Grip the bar slightly wider than shoulder-width.",
      "Unrack the bar and lower it to your mid-chest.",
      "Press the bar back up until your arms are fully extended."
    ],
    tips: [
      "Keep your feet flat on the floor for stability.",
      "Don't bounce the bar off your chest.",
      "Keep your elbows at a 45-degree angle."
    ]
  },
  { 
    id: '2', 
    name: 'Squat', 
    primaryMuscle: 'quadriceps', 
    supportingMuscles: ['glutes', 'hamstrings', 'lower_back'], 
    equipment: 'barbell', 
    difficulty: 'advanced',
    instructions: [
      "Stand with feet shoulder-width apart, bar resting on your upper back.",
      "Break at the hips and knees to lower yourself.",
      "Keep your chest up and back straight.",
      "Lower until your thighs are parallel to the floor.",
      "Drive back up through your heels."
    ],
    tips: [
      "Keep your knees in line with your toes.",
      "Brace your core before descending.",
      "Look straight ahead, not down."
    ]
  },
  { 
    id: '3', 
    name: 'Deadlift', 
    primaryMuscle: 'lower_back', 
    supportingMuscles: ['hamstrings', 'glutes', 'traps', 'forearms'], 
    equipment: 'barbell', 
    difficulty: 'advanced',
    instructions: [
      "Stand with feet hip-width apart, mid-foot under the bar.",
      "Bend over and grab the bar shoulder-width apart.",
      "Bend your knees until your shins touch the bar.",
      "Lift your chest up and straighten your lower back.",
      "Pull the bar up by extending your hips and knees."
    ],
    tips: [
      "Keep the bar close to your body throughout the lift.",
      "Don't round your back.",
      "Squeeze your glutes at the top."
    ]
  },
  { id: '4', name: 'Pull Up', primaryMuscle: 'lats', supportingMuscles: ['biceps', 'forearms'], equipment: 'bodyweight', difficulty: 'intermediate' },
  { id: '5', name: 'Overhead Press', primaryMuscle: 'shoulders', supportingMuscles: ['triceps'], equipment: 'barbell', difficulty: 'intermediate' },
  { id: '6', name: 'Barbell Row', primaryMuscle: 'lats', supportingMuscles: ['traps', 'biceps', 'lower_back'], equipment: 'barbell', difficulty: 'intermediate' },
  { id: '7', name: 'Dips', primaryMuscle: 'triceps', supportingMuscles: ['pectorals', 'shoulders'], equipment: 'bodyweight', difficulty: 'intermediate' },
  { id: '8', name: 'Lunges', primaryMuscle: 'quadriceps', supportingMuscles: ['glutes', 'hamstrings'], equipment: 'dumbbell', difficulty: 'beginner' },
  { id: '9', name: 'Crunches', primaryMuscle: 'abdominals', supportingMuscles: [], equipment: 'bodyweight', difficulty: 'beginner' },
  { id: '10', name: 'Calf Raises', primaryMuscle: 'calves', supportingMuscles: [], equipment: 'machine', difficulty: 'beginner' },
  { id: '11', name: 'Lat Pulldown', primaryMuscle: 'lats', supportingMuscles: ['biceps', 'forearms'], equipment: 'cables', difficulty: 'beginner' },
  { id: '12', name: 'Leg Press', primaryMuscle: 'quadriceps', supportingMuscles: ['glutes', 'hamstrings'], equipment: 'machine', difficulty: 'beginner' },
  { id: '13', name: 'Leg Curl', primaryMuscle: 'hamstrings', supportingMuscles: ['glutes'], equipment: 'machine', difficulty: 'beginner' },
  { id: '14', name: 'Leg Extension', primaryMuscle: 'quadriceps', supportingMuscles: [], equipment: 'machine', difficulty: 'beginner' },
  { id: '15', name: 'Face Pull', primaryMuscle: 'shoulders', supportingMuscles: ['traps'], equipment: 'cables', difficulty: 'beginner' },
  { id: '16', name: 'Lateral Raise', primaryMuscle: 'shoulders', supportingMuscles: ['traps'], equipment: 'dumbbell', difficulty: 'beginner' },
  { id: '17', name: 'Bicep Curl', primaryMuscle: 'biceps', supportingMuscles: ['forearms'], equipment: 'dumbbell', difficulty: 'beginner' },
  { id: '18', name: 'Tricep Extension', primaryMuscle: 'triceps', supportingMuscles: [], equipment: 'cables', difficulty: 'beginner' },
  { id: '19', name: 'Russian Twist', primaryMuscle: 'obliques', supportingMuscles: ['abdominals'], equipment: 'bodyweight', difficulty: 'beginner' },
  { id: '20', name: 'Plank', primaryMuscle: 'abdominals', supportingMuscles: ['shoulders', 'lower_back'], equipment: 'bodyweight', difficulty: 'beginner' },
  { id: '21', name: 'Romanian Deadlift', primaryMuscle: 'hamstrings', supportingMuscles: ['glutes', 'lower_back', 'forearms'], equipment: 'barbell', difficulty: 'intermediate' },
  { id: '22', name: 'Incline Bench Press', primaryMuscle: 'pectorals', supportingMuscles: ['shoulders', 'triceps'], equipment: 'barbell', difficulty: 'intermediate' },
  { id: '23', name: 'Hammer Curl', primaryMuscle: 'biceps', supportingMuscles: ['forearms'], equipment: 'dumbbell', difficulty: 'beginner' },
  { id: '24', name: 'Shrugs', primaryMuscle: 'traps', supportingMuscles: ['forearms'], equipment: 'dumbbell', difficulty: 'beginner' },
];

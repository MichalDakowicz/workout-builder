export type Muscle = 
  | 'traps'
  | 'shoulders'
  | 'pectorals'
  | 'biceps'
  | 'forearms'
  | 'abdominals'
  | 'obliques'
  | 'quadriceps'
  | 'calves'
  | 'triceps'
  | 'lats'
  | 'lower_back'
  | 'glutes'
  | 'hamstrings';

export type Equipment = 
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'bodyweight'
  | 'cables'
  | 'kettlebell'
  | 'other';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: Muscle;
  supportingMuscles: Muscle[];
  equipment: Equipment;
  difficulty: Difficulty;
  instructions?: string[];
  tips?: string[];
}

export type SetType = 'warmup' | 'normal' | 'failure' | 'dropset';

export interface WorkoutSet {
  type: SetType;
  reps?: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
}

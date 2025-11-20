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

export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: Muscle;
  supportingMuscles: Muscle[];
}

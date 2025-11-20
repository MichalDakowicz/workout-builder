import { Exercise, Muscle, Equipment } from '../types';
import apiData from './api_exercises.json';

const mapMuscle = (apiMuscle: string): Muscle | null => {
    const lower = apiMuscle.toLowerCase();
    if (lower.includes('biceps')) return 'biceps';
    if (lower.includes('triceps')) return 'triceps';
    if (lower.includes('forearm') || lower.includes('brachialis')) return 'forearms';
    if (lower.includes('chest') || lower.includes('pectoral')) return 'pectorals';
    if (lower.includes('deltoid') || lower.includes('shoulder')) return 'shoulders';
    if (lower.includes('trap') || lower.includes('neck')) return 'traps';
    if (lower.includes('lat') || lower.includes('back')) {
        if (lower.includes('lower')) return 'lower_back';
        return 'lats';
    }
    if (lower.includes('abs') || lower.includes('abdominal')) return 'abdominals';
    if (lower.includes('oblique')) return 'obliques';
    if (lower.includes('glute')) return 'glutes';
    if (lower.includes('hamstring')) return 'hamstrings';
    if (lower.includes('quad')) return 'quadriceps';
    if (lower.includes('calf') || lower.includes('calves') || lower.includes('soleus') || lower.includes('gastrocnemius')) return 'calves';
    
    return null;
};

const mapEquipment = (apiEquipment: string): Equipment => {
    const lower = apiEquipment.toLowerCase();
    if (lower.includes('barbell')) return 'barbell';
    if (lower.includes('dumbbell')) return 'dumbbell';
    if (lower.includes('cable')) return 'cables';
    if (lower.includes('machine') || lower.includes('smith')) return 'machine';
    if (lower.includes('body weight') || lower.includes('bodyweight')) return 'bodyweight';
    if (lower.includes('kettlebell')) return 'kettlebell';
    return 'other';
};

const uniqueExercises = new Map<string, Exercise>();

// The JSON import might have a different structure depending on how it was saved.
// Based on previous steps, it is { success: true, data: [...] }
const rawExercises = (apiData as any).data || [];

rawExercises.forEach((item: any) => {
    if (uniqueExercises.has(item.exerciseId)) return;

    const primary = mapMuscle(item.targetMuscles[0] || '') || 'shoulders';
    const supporting = item.secondaryMuscles
        .map(mapMuscle)
        .filter((m: Muscle | null): m is Muscle => m !== null);
    
    uniqueExercises.set(item.exerciseId, {
        id: item.exerciseId,
        name: item.name,
        primaryMuscle: primary,
        supportingMuscles: Array.from(new Set(supporting)) as Muscle[],
        equipment: mapEquipment(item.equipments[0] || ''),
        instructions: item.instructions,
        tips: [], // API doesn't provide tips in the same way, or we need to map them if available
        gifUrl: item.gifUrl
    });
});

export const exercises: Exercise[] = Array.from(uniqueExercises.values());

import { Exercise, Muscle, Equipment } from "../types";
import apiData from "./api_exercises.json";

const mapMuscle = (apiMuscle: string): Muscle | null => {
    const lower = apiMuscle.toLowerCase();
    if (lower.includes("biceps")) return "biceps";
    if (lower.includes("triceps")) return "triceps";
    if (lower.includes("forearm") || lower.includes("brachialis"))
        return "forearms";
    if (lower.includes("chest") || lower.includes("pectoral"))
        return "pectorals";
    if (lower.includes("rear delt")) return "rear_deltoids";
    if (lower.includes("deltoid") || lower.includes("shoulder"))
        return "shoulders";
    if (lower.includes("trap") || lower.includes("neck")) return "traps";
    if (lower.includes("upper back")) return "upper_back";
    if (lower.includes("lower back")) return "lower_back";
    if (lower.includes("lat") || lower.includes("back")) {
        if (lower.includes("lower")) return "lower_back";
        return "lats";
    }
    if (lower.includes("abs") || lower.includes("abdominal"))
        return "abdominals";
    if (lower.includes("oblique")) return "obliques";
    if (lower.includes("glute")) return "glutes";
    if (lower.includes("hamstring")) return "hamstrings";
    if (lower.includes("adductor")) return "adductors";
    if (lower.includes("abductor")) return "abductors";
    if (lower.includes("quad")) return "quadriceps";
    if (
        lower.includes("calf") ||
        lower.includes("calves") ||
        lower.includes("soleus") ||
        lower.includes("gastrocnemius")
    )
        return "calves";
    if (lower.includes("shin")) return "shins";

    return null;
};

const mapEquipment = (apiEquipment: string): Equipment => {
    const lower = apiEquipment.toLowerCase();
    if (lower.includes("barbell")) return "barbell";
    if (lower.includes("dumbbell")) return "dumbbell";
    if (lower.includes("cable")) return "cables";
    if (lower.includes("machine") || lower.includes("smith")) return "machine";
    if (lower.includes("body weight") || lower.includes("bodyweight"))
        return "bodyweight";
    if (lower.includes("kettlebell")) return "kettlebell";
    return "other";
};

const calculatePopularity = (name: string): number => {
    const lower = name.toLowerCase();
    let score = 50; // Base score

    // Hight popularity exercises
    if (lower == "barbell back squat") score += 60;
    if (lower == "barbell deadlift") score += 60;
    if (lower == "barbell bench press") score += 60;
    if (lower == "overhead press" || lower == "military press") score += 60;

    if (lower == "pull up") score += 45;
    if (lower == "chin up") score += 45;
    if (lower == "wide hand push up") score += 45;
    if (lower == "dip") score += 45;

    if (lower == "barbell bent over row") score += 40;

    // High popularity keywords
    if (lower.includes("row")) score += 30;

    // Medium popularity modifiers
    if (lower.includes("barbell")) score += 10;
    if (lower.includes("dumbbell")) score += 5;
    if (lower.includes("cable")) score += 5;

    // Penalize obscure variations slightly to favor standard versions
    if (lower.includes("single leg") || lower.includes("one arm")) score -= 10;
    if (lower.includes("smith")) score -= 5;
    if (lower.includes("machine")) score -= 5;
    if (lower.includes("band")) score -= 30;
    if (lower.includes("pov")) score -= 30;
    if (lower.includes("assisted")) score -= 20;
    if (lower.includes("bench") && !lower.includes("press")) score -= 15;

    return Math.max(0, Math.min(100, score));
};

const uniqueExercises = new Map<string, Exercise>();

// The JSON import might have a different structure depending on how it was saved.
// Based on previous steps, it is { success: true, data: [...] }
const rawExercises = (apiData as any).data || [];

rawExercises.forEach((item: any) => {
    if (uniqueExercises.has(item.exerciseId)) return;

    const primary = mapMuscle(item.targetMuscles[0] || "") || "shoulders";
    const supporting = item.secondaryMuscles
        .map(mapMuscle)
        .filter((m: Muscle | null): m is Muscle => m !== null);

    uniqueExercises.set(item.exerciseId, {
        id: item.exerciseId,
        name: item.name,
        primaryMuscle: primary,
        supportingMuscles: Array.from(new Set(supporting)) as Muscle[],
        equipment: mapEquipment(item.equipments[0] || ""),
        instructions: item.instructions,
        tips: [], // API doesn't provide tips in the same way, or we need to map them if available
        gifUrl: item.gifUrl,
        popularity: item.popularity || calculatePopularity(item.name),
    });
});

export const exercises: Exercise[] = Array.from(uniqueExercises.values());

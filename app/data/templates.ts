import { WorkoutExercise, SetType } from "../types";

export interface WorkoutTemplate {
    name: string;
    description: string;
    days: number;
    plan: Record<number, WorkoutExercise[]>;
}

const createExercise = (
    id: string,
    sets: number = 3,
    reps: number = 10
): WorkoutExercise => ({
    exerciseId: id,
    sets: Array(sets).fill({ type: "normal", reps }),
});

export const templates: WorkoutTemplate[] = [
    {
        name: "Full Body",
        description:
            "Classic beginner routine hitting every muscle group 3x a week.",
        days: 3,
        plan: {
            1: [
                createExercise("2", 3, 8), // Squat
                createExercise("1", 3, 10), // Bench
                createExercise("6", 3, 10), // Row
                createExercise("5", 3, 12), // Overhead Press
                createExercise("17", 3, 12), // Bicep Curl
                createExercise("18", 3, 12), // Tricep Ext
            ],
            2: [
                createExercise("3", 3, 5), // Deadlift
                createExercise("4", 3, 8), // Pull Up
                createExercise("7", 3, 10), // Dips
                createExercise("8", 3, 12), // Lunges
                createExercise("15", 3, 15), // Face Pull
                createExercise("20", 3, 60), // Plank
            ],
            3: [
                createExercise("12", 3, 10), // Leg Press
                createExercise("22", 3, 10), // Incline Bench
                createExercise("11", 3, 12), // Lat Pulldown
                createExercise("16", 3, 15), // Lateral Raise
                createExercise("13", 3, 12), // Leg Curl
                createExercise("10", 3, 15), // Calf Raises
            ],
        },
    },
    {
        name: "Upper / Lower",
        description: "Intermediate split separating upper and lower body days.",
        days: 4,
        plan: {
            1: [
                // Upper A
                createExercise("1", 3, 8), // Bench
                createExercise("6", 3, 10), // Row
                createExercise("5", 3, 12), // OHP
                createExercise("11", 3, 12), // Lat Pulldown
                createExercise("17", 3, 12), // Bicep Curl
                createExercise("18", 3, 12), // Tricep Ext
            ],
            2: [
                // Lower A
                createExercise("2", 3, 8), // Squat
                createExercise("21", 3, 10), // RDL
                createExercise("14", 3, 12), // Leg Ext
                createExercise("13", 3, 12), // Leg Curl
                createExercise("10", 4, 15), // Calf Raises
                createExercise("9", 3, 15), // Crunches
            ],
            3: [
                // Upper B
                createExercise("5", 3, 8), // OHP
                createExercise("4", 3, 8), // Pull Up
                createExercise("22", 3, 10), // Incline Bench
                createExercise("16", 3, 15), // Lateral Raise
                createExercise("15", 3, 15), // Face Pull
                createExercise("23", 3, 12), // Hammer Curl
            ],
            4: [
                // Lower B
                createExercise("3", 3, 5), // Deadlift
                createExercise("12", 3, 10), // Leg Press
                createExercise("8", 3, 12), // Lunges
                createExercise("19", 3, 20), // Russian Twist
                createExercise("20", 3, 60), // Plank
            ],
        },
    },
    {
        name: "Push / Pull / Legs",
        description:
            "Popular split grouping pushing, pulling, and leg movements.",
        days: 3,
        plan: {
            1: [
                // Push
                createExercise("1", 3, 8), // Bench
                createExercise("5", 3, 10), // OHP
                createExercise("22", 3, 10), // Incline Bench
                createExercise("16", 3, 15), // Lateral Raise
                createExercise("18", 3, 12), // Tricep Ext
            ],
            2: [
                // Pull
                createExercise("3", 3, 5), // Deadlift
                createExercise("4", 3, 8), // Pull Up
                createExercise("6", 3, 10), // Row
                createExercise("15", 3, 15), // Face Pull
                createExercise("17", 3, 12), // Bicep Curl
            ],
            3: [
                // Legs
                createExercise("2", 3, 8), // Squat
                createExercise("12", 3, 10), // Leg Press
                createExercise("21", 3, 10), // RDL
                createExercise("14", 3, 12), // Leg Ext
                createExercise("13", 3, 12), // Leg Curl
                createExercise("10", 4, 15), // Calf Raises
            ],
        },
    },
];

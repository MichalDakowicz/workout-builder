"use client";

import { useState, useMemo } from "react";
import MuscleMap from "./components/MuscleMap";
import { exercises } from "./data/exercises";
import { Muscle } from "./types";

const muscleAliases: Record<string, Muscle[]> = {
    chest: ['pectorals'],
    pecs: ['pectorals'],
    back: ['lats', 'traps', 'lower_back'],
    legs: ['quadriceps', 'hamstrings', 'calves', 'glutes'],
    quads: ['quadriceps'],
    arms: ['biceps', 'triceps', 'forearms'],
    abs: ['abdominals', 'obliques'],
    core: ['abdominals', 'obliques', 'lower_back'],
    shoulders: ['shoulders', 'traps']
};

export default function Home() {
    const [trainingDays, setTrainingDays] = useState(3);
    const [currentDay, setCurrentDay] = useState(1);
    const [workoutPlan, setWorkoutPlan] = useState<Record<number, string[]>>({});
    const [hoveredExerciseId, setHoveredExerciseId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const selectedExerciseIds = useMemo(() => workoutPlan[currentDay] || [], [workoutPlan, currentDay]);

    const toggleExercise = (id: string) => {
        setWorkoutPlan(prev => {
            const currentDayExercises = prev[currentDay] || [];
            const newDayExercises = currentDayExercises.includes(id)
                ? currentDayExercises.filter(e => e !== id)
                : [...currentDayExercises, id];
            
            return { ...prev, [currentDay]: newDayExercises };
        });
    };

    const filteredExercises = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return exercises;

        // Find all muscles that match the search term via aliases
        const aliasMuscles = Object.entries(muscleAliases)
            .filter(([key]) => key.includes(term) || term.includes(key))
            .flatMap(([, muscles]) => muscles);

        return exercises.filter(exercise => {
            const matchesName = exercise.name.toLowerCase().includes(term);
            const matchesPrimary = exercise.primaryMuscle.toLowerCase().includes(term);
            const matchesSupporting = exercise.supportingMuscles.some(m => m.toLowerCase().includes(term));
            
            const matchesAlias = aliasMuscles.some(m => 
                exercise.primaryMuscle === m || exercise.supportingMuscles.includes(m)
            );

            return matchesName || matchesPrimary || matchesSupporting || matchesAlias;
        });
    }, [searchTerm]);

    const { primaryMuscles, secondaryMuscles } = useMemo(() => {
        const primary = new Set<Muscle>();
        const secondary = new Set<Muscle>();
        
        selectedExerciseIds.forEach(id => {
            const exercise = exercises.find(e => e.id === id);
            if (exercise) {
                primary.add(exercise.primaryMuscle);
                exercise.supportingMuscles.forEach(m => secondary.add(m));
            }
        });

        // If a muscle is primary in any selected exercise, it should be treated as primary
        // even if it's secondary in another.
        // So we remove any primary muscles from the secondary set.
        primary.forEach(m => secondary.delete(m));
        
        return {
            primaryMuscles: Array.from(primary),
            secondaryMuscles: Array.from(secondary)
        };
    }, [selectedExerciseIds]);

    const previewMuscles = useMemo(() => {
        if (!hoveredExerciseId) return [];
        const exercise = exercises.find(e => e.id === hoveredExerciseId);
        return exercise ? [exercise.primaryMuscle, ...exercise.supportingMuscles] : [];
    }, [hoveredExerciseId]);

    const workoutStats = useMemo(() => {
        const stats: Record<string, { primary: number; secondary: number }> = {};
        
        selectedExerciseIds.forEach(id => {
            const exercise = exercises.find(e => e.id === id);
            if (exercise) {
                // Count primary
                if (!stats[exercise.primaryMuscle]) stats[exercise.primaryMuscle] = { primary: 0, secondary: 0 };
                stats[exercise.primaryMuscle].primary++;

                // Count secondary
                exercise.supportingMuscles.forEach(m => {
                    if (!stats[m]) stats[m] = { primary: 0, secondary: 0 };
                    stats[m].secondary++;
                });
            }
        });
        
        return Object.entries(stats)
            .sort((a, b) => (b[1].primary + b[1].secondary) - (a[1].primary + a[1].secondary));
    }, [selectedExerciseIds]);

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black text-zinc-900 dark:text-white">
            <header className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h1 className="text-3xl font-bold text-center mb-6">
                    Workout Builder
                </h1>
                
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <label className="font-medium whitespace-nowrap">Training Days:</label>
                        <div className="flex gap-1">
                            {[2, 3, 4, 5, 6].map(days => (
                                <button
                                    key={days}
                                    onClick={() => {
                                        setTrainingDays(days);
                                        if (currentDay > days) setCurrentDay(days);
                                    }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                        trainingDays === days
                                            ? "bg-blue-600 text-white"
                                            : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                    }`}
                                >
                                    {days}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0">
                        {Array.from({ length: trainingDays }).map((_, i) => {
                            const day = i + 1;
                            const exerciseCount = (workoutPlan[day] || []).length;
                            return (
                                <button
                                    key={day}
                                    onClick={() => setCurrentDay(day)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                                        currentDay === day
                                            ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-md"
                                            : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                    }`}
                                >
                                    Day {day}
                                    {exerciseCount > 0 && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                            currentDay === day 
                                                ? "bg-zinc-700 dark:bg-zinc-200 text-white dark:text-black" 
                                                : "bg-zinc-300 dark:bg-zinc-600"
                                        }`}>
                                            {exerciseCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            <main className="flex flex-col md:flex-row flex-1 p-6 gap-8">
                {/* Exercise List */}
                <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Select Exercises</h2>
                        {selectedExerciseIds.length > 0 && (
                            <button 
                                onClick={() => setWorkoutPlan(prev => ({ ...prev, [currentDay]: [] }))}
                                className="text-sm text-red-500 hover:text-red-600 font-medium"
                            >
                                Clear Day
                            </button>
                        )}
                    </div>
                    
                    <input
                        type="text"
                        placeholder="Search exercises or muscles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
                        {filteredExercises.map(exercise => (
                            <button
                                key={exercise.id}
                                onClick={() => toggleExercise(exercise.id)}
                                onMouseEnter={() => setHoveredExerciseId(exercise.id)}
                                onMouseLeave={() => setHoveredExerciseId(null)}
                                className={`p-4 rounded-lg text-left transition-all border ${
                                    selectedExerciseIds.includes(exercise.id)
                                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-400"
                                }`}
                            >
                                <div className="font-medium">{exercise.name}</div>
                                <div className="text-xs opacity-70 mt-1">
                                    <span className="font-semibold">Primary:</span> {exercise.primaryMuscle}
                                    {exercise.supportingMuscles.length > 0 && (
                                        <>
                                            <span className="mx-1">•</span>
                                            <span className="font-semibold">Supporting:</span> {exercise.supportingMuscles.join(", ")}
                                        </>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Visual Feedback */}
                <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Muscle Activation Map</h2>
                    <div className="w-full max-w-3xl h-[600px]">
                        <MuscleMap 
                            primaryMuscles={primaryMuscles}
                            secondaryMuscles={secondaryMuscles}
                            previewMuscles={previewMuscles}
                        />
                    </div>
                    <div className="mt-6 flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#ecf0f1] border border-zinc-300 rounded"></div>
                            <span>Untrained</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#e74c3c] rounded"></div>
                            <span>Primary</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#e67e22] rounded"></div>
                            <span>Supporting</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#f1c40f] rounded"></div>
                            <span>Preview</span>
                        </div>
                    </div>

                    {/* Workout Summary */}
                    {workoutStats.length > 0 && (
                        <div className="w-full mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-lg font-semibold mb-4">Workout Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {workoutStats.map(([muscle, counts]) => (
                                    <div key={muscle} className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800 rounded">
                                        <span className="capitalize">{muscle.replace('_', ' ')}</span>
                                        <div className="flex gap-2 text-xs font-medium">
                                            {counts.primary > 0 && (
                                                <span className="text-red-600 dark:text-red-400">{counts.primary} Pri</span>
                                            )}
                                            {counts.secondary > 0 && (
                                                <span className="text-orange-600 dark:text-orange-400">{counts.secondary} Sec</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

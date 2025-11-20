"use client";

import { useState, useMemo, useEffect } from "react";
import MuscleMap from "./components/MuscleMap";
import { exercises } from "./data/exercises";
import { Muscle, WorkoutExercise, Equipment, Difficulty, WorkoutSet, SetType } from "./types";

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
    const [workoutPlan, setWorkoutPlan] = useState<Record<number, WorkoutExercise[]>>({});
    const [hoveredExerciseId, setHoveredExerciseId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [equipmentFilter, setEquipmentFilter] = useState<Equipment | 'all'>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
    const [activeDropdown, setActiveDropdown] = useState<{exId: string, setIdx: number} | null>(null);

    // Load data from local storage on mount
    useEffect(() => {
        const savedDays = localStorage.getItem("trainingDays");
        const savedPlan = localStorage.getItem("workoutPlan");
        
        if (savedDays) {
            // eslint-disable-next-line
            setTrainingDays(parseInt(savedDays));
        }
        if (savedPlan) {
            try {
                setWorkoutPlan(JSON.parse(savedPlan));
            } catch (e) {
                console.error("Failed to parse workout plan", e);
            }
        }
    }, []);

    // Save data to local storage on change
    useEffect(() => {
        localStorage.setItem("trainingDays", trainingDays.toString());
        localStorage.setItem("workoutPlan", JSON.stringify(workoutPlan));
    }, [trainingDays, workoutPlan]);

    const exportData = () => {
        const data = {
            trainingDays,
            workoutPlan,
            version: 1,
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `workout-plan-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);
                
                if (data.trainingDays && typeof data.trainingDays === 'number') {
                    setTrainingDays(data.trainingDays);
                }
                
                if (data.workoutPlan && typeof data.workoutPlan === 'object') {
                    setWorkoutPlan(data.workoutPlan);
                }
                
                alert("Workout plan imported successfully!");
            } catch (error) {
                console.error("Import error:", error);
                alert("Invalid file format. Please upload a valid workout plan JSON.");
            }
        };
        reader.readAsText(file);
        // Reset input so the same file can be selected again if needed
        event.target.value = '';
    };

    const selectedExerciseIds = useMemo(() => 
        (workoutPlan[currentDay] || []).map(e => e.exerciseId), 
        [workoutPlan, currentDay]
    );

    const toggleExercise = (id: string) => {
        setWorkoutPlan(prev => {
            const currentDayExercises = prev[currentDay] || [];
            const exists = currentDayExercises.find(e => e.exerciseId === id);
            
            let newDayExercises;
            if (exists) {
                newDayExercises = currentDayExercises.filter(e => e.exerciseId !== id);
            } else {
                newDayExercises = [...currentDayExercises, { 
                    exerciseId: id, 
                    sets: [{ type: 'normal' as SetType, reps: 10 }] 
                }];
            }
            
            return { ...prev, [currentDay]: newDayExercises };
        });
    };

    const addSet = (exerciseId: string) => {
        setWorkoutPlan(prev => {
            const currentDayExercises = prev[currentDay] || [];
            const newDayExercises = currentDayExercises.map(e => 
                e.exerciseId === exerciseId 
                    ? { ...e, sets: [...e.sets, { type: 'normal' as SetType, reps: 10 }] }
                    : e
            );
            return { ...prev, [currentDay]: newDayExercises };
        });
    };

    const removeSet = (exerciseId: string, setIndex: number) => {
        setWorkoutPlan(prev => {
            const currentDayExercises = prev[currentDay] || [];
            const newDayExercises = currentDayExercises.map(e => 
                e.exerciseId === exerciseId 
                    ? { ...e, sets: e.sets.filter((_, i) => i !== setIndex) }
                    : e
            );
            return { ...prev, [currentDay]: newDayExercises };
        });
    };

    const updateSet = (exerciseId: string, setIndex: number, field: keyof WorkoutSet, value: any) => {
        setWorkoutPlan(prev => {
            const currentDayExercises = prev[currentDay] || [];
            const newDayExercises = currentDayExercises.map(e => 
                e.exerciseId === exerciseId 
                    ? { 
                        ...e, 
                        sets: e.sets.map((s, i) => i === setIndex ? { ...s, [field]: value } : s) 
                      }
                    : e
            );
            return { ...prev, [currentDay]: newDayExercises };
        });
    };

    const filteredExercises = useMemo(() => {
        let filtered = exercises;

        // Filter by Equipment
        if (equipmentFilter !== 'all') {
            filtered = filtered.filter(e => e.equipment === equipmentFilter);
        }

        // Filter by Difficulty
        if (difficultyFilter !== 'all') {
            filtered = filtered.filter(e => e.difficulty === difficultyFilter);
        }

        const term = searchTerm.toLowerCase().trim();
        if (!term) return filtered;

        // Find all muscles that match the search term via aliases
        const aliasMuscles = Object.entries(muscleAliases)
            .filter(([key]) => key.includes(term) || term.includes(key))
            .flatMap(([, muscles]) => muscles);

        return filtered.filter(exercise => {
            const matchesName = exercise.name.toLowerCase().includes(term);
            const matchesPrimary = exercise.primaryMuscle.toLowerCase().includes(term);
            const matchesSupporting = exercise.supportingMuscles.some(m => m.toLowerCase().includes(term));
            
            const matchesAlias = aliasMuscles.some(m => 
                exercise.primaryMuscle === m || exercise.supportingMuscles.includes(m)
            );

            return matchesName || matchesPrimary || matchesSupporting || matchesAlias;
        });
    }, [searchTerm, equipmentFilter, difficultyFilter]);

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

    const getSetTypeColor = (type: SetType) => {
        switch(type) {
            case 'warmup': return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/50';
            case 'failure': return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50';
            case 'dropset': return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/50';
            default: return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50';
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black text-zinc-900 dark:text-white">
            {activeDropdown && (
                <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
            )}
            <header className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h1 className="text-3xl font-bold text-center mb-6">
                    Workout Builder
                </h1>
                
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex flex-col gap-4 w-full md:w-auto">
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
                        
                        <div className="flex items-center gap-2 text-sm">
                            <button 
                                onClick={exportData}
                                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                            >
                                Export Plan
                            </button>
                            <label className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors cursor-pointer">
                                Import Plan
                                <input 
                                    type="file" 
                                    accept=".json" 
                                    onChange={importData} 
                                    className="hidden" 
                                />
                            </label>
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

                    <div className="flex gap-2">
                        <select
                            value={equipmentFilter}
                            onChange={(e) => setEquipmentFilter(e.target.value as Equipment | 'all')}
                            className="w-1/2 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Equipment</option>
                            <option value="barbell">Barbell</option>
                            <option value="dumbbell">Dumbbell</option>
                            <option value="machine">Machine</option>
                            <option value="cables">Cables</option>
                            <option value="bodyweight">Bodyweight</option>
                        </select>

                        <select
                            value={difficultyFilter}
                            onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | 'all')}
                            className="w-1/2 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
                        {filteredExercises.map(exercise => {
                            const isSelected = selectedExerciseIds.includes(exercise.id);
                            const workoutExercise = (workoutPlan[currentDay] || []).find(e => e.exerciseId === exercise.id);

                            return (
                                <div 
                                    key={exercise.id}
                                    className={`p-4 rounded-lg text-left transition-all border ${
                                        isSelected
                                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-400"
                                    }`}
                                >
                                    <button
                                        onClick={() => toggleExercise(exercise.id)}
                                        onMouseEnter={() => setHoveredExerciseId(exercise.id)}
                                        onMouseLeave={() => setHoveredExerciseId(null)}
                                        className="w-full text-left"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="font-medium">{exercise.name}</div>
                                            <div className="flex gap-1">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                                                    isSelected ? "bg-white/20" : "bg-zinc-100 dark:bg-zinc-800"
                                                }`}>
                                                    {exercise.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-xs opacity-70 mt-1">
                                            <span className="font-semibold">Primary:</span> {exercise.primaryMuscle}
                                            <span className="mx-1">•</span>
                                            <span className="capitalize">{exercise.equipment}</span>
                                        </div>
                                    </button>

                                    {isSelected && workoutExercise && (
                                        <div className="mt-3 pt-3 border-t border-white/20 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                                            {workoutExercise.sets.map((set, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <span className="text-xs font-mono opacity-50 w-4">{index + 1}</span>
                                                    
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setActiveDropdown(
                                                                activeDropdown?.exId === exercise.id && activeDropdown?.setIdx === index 
                                                                    ? null 
                                                                    : { exId: exercise.id, setIdx: index }
                                                            )}
                                                            className={`px-2 py-1 rounded text-xs border capitalize min-w-[70px] text-center transition-colors ${getSetTypeColor(set.type)}`}
                                                        >
                                                            {set.type}
                                                        </button>
                                                        
                                                        {activeDropdown?.exId === exercise.id && activeDropdown?.setIdx === index && (
                                                            <div className="absolute top-full left-0 mt-1 w-24 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-xl z-20 overflow-hidden flex flex-col">
                                                                {(['normal', 'warmup', 'failure', 'dropset'] as SetType[]).map(type => (
                                                                    <button
                                                                        key={type}
                                                                        onClick={() => {
                                                                            updateSet(exercise.id, index, 'type', type);
                                                                            setActiveDropdown(null);
                                                                        }}
                                                                        className={`px-3 py-2 text-xs text-left capitalize hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 ${
                                                                            set.type === type ? 'bg-zinc-50 dark:bg-zinc-700/50 font-medium' : ''
                                                                        }`}
                                                                    >
                                                                        <div className={`w-2 h-2 rounded-full ${
                                                                            type === 'warmup' ? 'bg-yellow-500' :
                                                                            type === 'failure' ? 'bg-red-500' :
                                                                            type === 'dropset' ? 'bg-purple-500' :
                                                                            'bg-blue-500'
                                                                        }`} />
                                                                        {type}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {set.type !== 'failure' && (
                                                        <input
                                                            type="number"
                                                            value={set.reps || ''}
                                                            onChange={(e) => updateSet(exercise.id, index, 'reps', parseInt(e.target.value))}
                                                            placeholder="Reps"
                                                            className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs focus:outline-none focus:border-white"
                                                        />
                                                    )}
                                                    
                                                    <button 
                                                        onClick={() => removeSet(exercise.id, index)}
                                                        className="ml-auto text-white/50 hover:text-red-400"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => addSet(exercise.id)}
                                                className="mt-1 text-xs bg-white/10 hover:bg-white/20 py-1 rounded transition-colors"
                                            >
                                                + Add Set
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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

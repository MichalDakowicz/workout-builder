"use client";

import { useState, useMemo, useEffect } from "react";
import MuscleMap from "./components/MuscleMap";
import ExerciseModal from "./components/ExerciseModal";
import { exercises } from "./data/exercises";
import { templates, WorkoutTemplate } from "./data/templates";
import { Muscle, WorkoutExercise, Equipment, Difficulty, WorkoutSet, SetType, Exercise } from "./types";
import { auth, db, googleProvider } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { ref, set, get, child } from "firebase/database";

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
    const [bodyPartFilter, setBodyPartFilter] = useState<Muscle | 'all'>('all');
    const [activeDropdown, setActiveDropdown] = useState<{exId: string, setIdx: number} | null>(null);
    const [clipboard, setClipboard] = useState<WorkoutExercise[] | null>(null);
    const [viewMode, setViewMode] = useState<'workout' | 'library'>('workout');
    const [showTemplates, setShowTemplates] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    // Handle Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                loadUserData(currentUser.uid);
            }
        });
        return () => unsubscribe();
    }, []);

    const loadUserData = async (userId: string) => {
        setIsSyncing(true);
        try {
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, `users/${userId}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                // Only ask to load if there is local data that might be overwritten
                const hasLocalData = Object.keys(workoutPlan).length > 0;
                if (!hasLocalData || confirm("Found saved workout data in the cloud. Do you want to load it?")) {
                    if (data.trainingDays) setTrainingDays(data.trainingDays);
                    if (data.workoutPlan) setWorkoutPlan(data.workoutPlan);
                }
            }
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed", error);
            alert("Login failed. Please try again.");
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // Save data to local storage on change
    useEffect(() => {
        localStorage.setItem("trainingDays", trainingDays.toString());
        localStorage.setItem("workoutPlan", JSON.stringify(workoutPlan));

        // Save to Firebase if logged in
        if (user) {
            const saveData = async () => {
                try {
                    await set(ref(db, 'users/' + user.uid), {
                        trainingDays,
                        workoutPlan,
                        lastUpdated: new Date().toISOString()
                    });
                } catch (e) {
                    console.error("Error saving to cloud", e);
                }
            };
            const timeoutId = setTimeout(saveData, 2000); // 2s debounce
            return () => clearTimeout(timeoutId);
        }
    }, [trainingDays, workoutPlan, user]);

    const applyTemplate = (template: WorkoutTemplate) => {
        if (confirm(`This will overwrite your current workout plan with "${template.name}". Continue?`)) {
            setTrainingDays(template.days);
            setWorkoutPlan(template.plan);
            setCurrentDay(1);
            setShowTemplates(false);
            setViewMode('workout');
        }
    };

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

    const copyDay = () => {
        const dayExercises = workoutPlan[currentDay] || [];
        if (dayExercises.length > 0) {
            setClipboard(JSON.parse(JSON.stringify(dayExercises)));
        }
    };

    const pasteDay = () => {
        if (clipboard) {
            if ((workoutPlan[currentDay] || []).length > 0) {
                if (!confirm("This will overwrite the current day's exercises. Continue?")) return;
            }
            setWorkoutPlan(prev => ({
                ...prev,
                [currentDay]: JSON.parse(JSON.stringify(clipboard))
            }));
        }
    };

    const moveExercise = (index: number, direction: 'up' | 'down') => {
        setWorkoutPlan(prev => {
            const currentDayExercises = [...(prev[currentDay] || [])];
            if (direction === 'up' && index > 0) {
                [currentDayExercises[index], currentDayExercises[index - 1]] = 
                [currentDayExercises[index - 1], currentDayExercises[index]];
            } else if (direction === 'down' && index < currentDayExercises.length - 1) {
                [currentDayExercises[index], currentDayExercises[index + 1]] = 
                [currentDayExercises[index + 1], currentDayExercises[index]];
            }
            return { ...prev, [currentDay]: currentDayExercises };
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

        // Filter by Body Part
        if (bodyPartFilter !== 'all') {
            filtered = filtered.filter(e => 
                e.primaryMuscle === bodyPartFilter || 
                e.supportingMuscles.includes(bodyPartFilter)
            );
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
    }, [searchTerm, equipmentFilter, difficultyFilter, bodyPartFilter]);

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

    const muscleVolume = useMemo(() => {
        const volume: Record<string, number> = {};
        const currentExercises = workoutPlan[currentDay] || [];

        currentExercises.forEach(workoutExercise => {
            const exerciseDef = exercises.find(e => e.id === workoutExercise.exerciseId);
            if (exerciseDef) {
                const setCheck = workoutExercise.sets.length;
                // Primary muscle gets full volume
                volume[exerciseDef.primaryMuscle] = (volume[exerciseDef.primaryMuscle] || 0) + setCheck;
            }
        });
        return volume;
    }, [workoutPlan, currentDay]);

    const getSetTypeColor = (type: SetType) => {
        switch(type) {
            case 'warmup': return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/50';
            case 'failure': return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50';
            case 'dropset': return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/50';
            default: return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50';
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black text-zinc-900 dark:text-white relative">
            {activeDropdown && (
                <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
            )}

            {/* Exercise Details Modal */}
            {selectedExercise && (
                <ExerciseModal 
                    exercise={selectedExercise} 
                    onClose={() => setSelectedExercise(null)} 
                />
            )}
            
            {/* Templates Modal */}
            {showTemplates && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Choose a Template</h2>
                            <button 
                                onClick={() => setShowTemplates(false)}
                                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto grid gap-4">
                            {templates.map((template, i) => (
                                <button
                                    key={i}
                                    onClick={() => applyTemplate(template)}
                                    className="flex flex-col text-left p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                            {template.name}
                                        </h3>
                                        <span className="text-xs font-bold px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400">
                                            {template.days} Days
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        {template.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <header className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">
                        Workout Builder
                    </h1>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-medium">{user.displayName}</span>
                                    <span className="text-xs text-zinc-500">{isSyncing ? 'Syncing...' : 'Synced'}</span>
                                </div>
                                {user.photoURL && (
                                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                                )}
                                <button 
                                    onClick={handleLogout}
                                    className="text-sm text-red-500 hover:text-red-600"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleLogin}
                                className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Sign in with Google
                            </button>
                        )}
                    </div>
                </div>
                
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
                                onClick={() => setShowTemplates(true)}
                                className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors shadow-sm"
                            >
                                Templates
                            </button>
                            <button 
                                onClick={exportData}
                                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                            >
                                Export
                            </button>
                            <label className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors cursor-pointer">
                                Import
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
                    {/* Tabs */}
                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                        <button
                            onClick={() => setViewMode('workout')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                viewMode === 'workout'
                                    ? "bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white"
                                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            }`}
                        >
                            My Workout ({(workoutPlan[currentDay] || []).length})
                        </button>
                        <button
                            onClick={() => setViewMode('library')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                viewMode === 'library'
                                    ? "bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white"
                                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            }`}
                        >
                            Add Exercises
                        </button>
                    </div>

                    {viewMode === 'workout' ? (
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
                            <div className="flex justify-end gap-2 mb-2">
                                {(workoutPlan[currentDay] || []).length > 0 && (
                                    <>
                                        <button 
                                            onClick={copyDay}
                                            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                        >
                                            Copy Day
                                        </button>
                                        <button 
                                            onClick={() => setWorkoutPlan(prev => ({ ...prev, [currentDay]: [] }))}
                                            className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                        >
                                            Clear Day
                                        </button>
                                    </>
                                )}
                                {clipboard && (
                                    <button 
                                        onClick={pasteDay}
                                        className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                    >
                                        Paste Day
                                    </button>
                                )}
                            </div>

                            {(workoutPlan[currentDay] || []).map((workoutExercise, index) => {
                                const exercise = exercises.find(e => e.id === workoutExercise.exerciseId);
                                if (!exercise) return null;
                                return (
                                    <div 
                                        key={`${workoutExercise.exerciseId}-${index}`}
                                        className="p-4 rounded-lg text-left transition-all border bg-blue-600 text-white border-blue-600 shadow-md"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <div className="font-medium">{exercise.name}</div>
                                                <button 
                                                    onClick={() => setSelectedExercise(exercise)}
                                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                                    title="View Details"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="flex gap-1">
                                                <button 
                                                    onClick={() => moveExercise(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 hover:bg-white/20 rounded disabled:opacity-30"
                                                >
                                                    ↑
                                                </button>
                                                <button 
                                                    onClick={() => moveExercise(index, 'down')}
                                                    disabled={index === (workoutPlan[currentDay] || []).length - 1}
                                                    className="p-1 hover:bg-white/20 rounded disabled:opacity-30"
                                                >
                                                    ↓
                                                </button>
                                                <button 
                                                    onClick={() => toggleExercise(exercise.id)}
                                                    className="p-1 hover:bg-red-500/50 rounded ml-1"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-white/20 flex flex-col gap-2">
                                            {workoutExercise.sets.map((set, setIndex) => (
                                                <div key={setIndex} className="flex items-center gap-2">
                                                    <span className="text-xs font-mono opacity-50 w-4">{setIndex + 1}</span>
                                                    
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setActiveDropdown(
                                                                activeDropdown?.exId === exercise.id && activeDropdown?.setIdx === setIndex 
                                                                    ? null 
                                                                    : { exId: exercise.id, setIdx: setIndex }
                                                            )}
                                                            className={`px-2 py-1 rounded text-xs border capitalize min-w-[70px] text-center transition-colors ${getSetTypeColor(set.type)}`}
                                                        >
                                                            {set.type}
                                                        </button>
                                                        
                                                        {activeDropdown?.exId === exercise.id && activeDropdown?.setIdx === setIndex && (
                                                            <div className="absolute top-full left-0 mt-1 w-24 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-xl z-20 overflow-hidden flex flex-col">
                                                                {(['normal', 'warmup', 'failure', 'dropset'] as SetType[]).map(type => (
                                                                    <button
                                                                        key={type}
                                                                        onClick={() => {
                                                                            updateSet(exercise.id, setIndex, 'type', type);
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
                                                    
                                                    {set.type !== 'failure' && set.type !== 'dropset' && (
                                                        <input
                                                            type="number"
                                                            value={set.reps || ''}
                                                            onChange={(e) => updateSet(exercise.id, setIndex, 'reps', parseInt(e.target.value))}
                                                            placeholder="Reps"
                                                            className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs focus:outline-none focus:border-white"
                                                        />
                                                    )}
                                                    
                                                    <button 
                                                        onClick={() => removeSet(exercise.id, setIndex)}
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
                                    </div>
                                );
                            })}

                            {(workoutPlan[currentDay] || []).length === 0 && (
                                <div className="text-center py-10 text-zinc-500">
                                    <p className="mb-2">No exercises added yet.</p>
                                    <button 
                                        onClick={() => setViewMode('library')} 
                                        className="text-blue-500 hover:underline"
                                    >
                                        Browse Library
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
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

                            <select
                                value={bodyPartFilter}
                                onChange={(e) => setBodyPartFilter(e.target.value as Muscle | 'all')}
                                className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Body Parts</option>
                                <option value="pectorals">Chest (Pectorals)</option>
                                <option value="lats">Back (Lats)</option>
                                <option value="traps">Traps</option>
                                <option value="lower_back">Lower Back</option>
                                <option value="shoulders">Shoulders</option>
                                <option value="biceps">Biceps</option>
                                <option value="triceps">Triceps</option>
                                <option value="forearms">Forearms</option>
                                <option value="abdominals">Abs</option>
                                <option value="obliques">Obliques</option>
                                <option value="quadriceps">Quads</option>
                                <option value="hamstrings">Hamstrings</option>
                                <option value="glutes">Glutes</option>
                                <option value="calves">Calves</option>
                            </select>

                            <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
                                {filteredExercises.map(exercise => {
                                    const isSelected = selectedExerciseIds.includes(exercise.id);
                                    
                                    return (
                                        <div 
                                            key={exercise.id}
                                            className={`p-4 rounded-lg text-left transition-all border ${
                                                isSelected
                                                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                                                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-400"
                                            }`}
                                        >
                                            <button
                                                onClick={() => {
                                                    toggleExercise(exercise.id);
                                                }}
                                                onMouseEnter={() => setHoveredExerciseId(exercise.id)}
                                                onMouseLeave={() => setHoveredExerciseId(null)}
                                                className="w-full text-left"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium">{exercise.name}</div>
                                                        <div 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedExercise(exercise);
                                                            }}
                                                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors text-zinc-400 hover:text-blue-500"
                                                            title="View Details"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                                                            isSelected ? "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200" : "bg-zinc-100 dark:bg-zinc-800"
                                                        }`}>
                                                            {exercise.difficulty}
                                                        </span>
                                                        {isSelected && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                                                Added
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="text-xs opacity-70 mt-1">
                                                    <span className="font-semibold">Primary:</span> {exercise.primaryMuscle}
                                                    <span className="mx-1">•</span>
                                                    <span className="capitalize">{exercise.equipment}</span>
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Visual Feedback */}
                <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Muscle Activation Map</h2>
                    <div className="w-full max-w-3xl h-[600px]">
                        <MuscleMap 
                            primaryMuscles={primaryMuscles}
                            secondaryMuscles={secondaryMuscles}
                            previewMuscles={previewMuscles}
                            muscleVolume={muscleVolume}
                            onMuscleClick={(muscle) => {
                                setViewMode('library');
                                setBodyPartFilter(muscle === bodyPartFilter ? 'all' : muscle);
                            }}
                        />
                    </div>
                    <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#ecf0f1] border border-zinc-300 rounded"></div>
                            <span>0 sets</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#4ade80] rounded"></div>
                            <span>1-2 sets</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#facc15] rounded"></div>
                            <span>3-5 sets</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#fb923c] rounded"></div>
                            <span>6-9 sets</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#f87171] rounded"></div>
                            <span>10+ sets</span>
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

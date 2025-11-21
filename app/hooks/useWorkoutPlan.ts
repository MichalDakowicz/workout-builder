import { useState, useEffect } from "react";
import { WorkoutExercise, WorkoutSet, SetType } from "../types";
import { WorkoutTemplate } from "../data/templates";
import { auth, db } from "../firebase";
import { ref, set, get, child } from "firebase/database";
import { User, signOut } from "firebase/auth";

export function useWorkoutPlan() {
    const [trainingDays, setTrainingDays] = useState(3);
    const [currentDay, setCurrentDay] = useState(1);
    const [workoutPlan, setWorkoutPlan] = useState<Record<number, WorkoutExercise[]>>({});
    const [clipboard, setClipboard] = useState<WorkoutExercise[] | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const loadUserData = async (userId: string) => {
        setIsSyncing(true);
        try {
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, `users/${userId}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
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

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setTrainingDays(3);
            setWorkoutPlan({});
            setCurrentDay(1);
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
            return true;
        }
        return false;
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

    const importData = (file: File) => {
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
    };

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

    const clearDay = () => {
        setWorkoutPlan(prev => ({ ...prev, [currentDay]: [] }));
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

    return {
        trainingDays,
        setTrainingDays,
        currentDay,
        setCurrentDay,
        workoutPlan,
        setWorkoutPlan,
        clipboard,
        user,
        setUser,
        isSyncing,
        loadUserData,
        handleLogout,
        applyTemplate,
        exportData,
        importData,
        toggleExercise,
        addSet,
        removeSet,
        updateSet,
        copyDay,
        pasteDay,
        clearDay,
        moveExercise
    };
}

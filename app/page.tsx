"use client";

import { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { exercises } from "./data/exercises";
import { templates } from "./data/templates";
import { WorkoutSet, Exercise } from "./types";

// Components
import MuscleMap from "./components/MuscleMap";
import ExerciseModal from "./components/ExerciseModal";
import { WorkoutHeader } from "./components/WorkoutHeader";
import { ExerciseFilters } from "./components/ExerciseFilters";
import { ExerciseList } from "./components/ExerciseList";
import { WorkoutDayView } from "./components/WorkoutDayView";
import { TemplatesModal } from "./components/TemplatesModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Hooks
import { useWorkoutPlan } from "./hooks/useWorkoutPlan";
import { useExerciseFilters } from "./hooks/useExerciseFilters";

export default function Home() {
    const {
        trainingDays,
        setTrainingDays,
        currentDay,
        setCurrentDay,
        workoutPlan,
        setWorkoutPlan,
        clipboard,
        user,
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
    } = useWorkoutPlan();

    const {
        searchTerm,
        setSearchTerm,
        equipmentFilter,
        setEquipmentFilter,
        bodyPartFilter,
        setBodyPartFilter,
        filteredExercises
    } = useExerciseFilters();

    const [viewMode, setViewMode] = useState<string>('workout');
    const [showTemplates, setShowTemplates] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed", error);
            alert("Login failed. Please try again.");
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            importData(file);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background font-sans text-foreground relative">
            {selectedExercise && (
                <ExerciseModal 
                    exercise={selectedExercise} 
                    onClose={() => setSelectedExercise(null)} 
                />
            )}
            
            {showTemplates && (
                <TemplatesModal
                    templates={templates}
                    onClose={() => setShowTemplates(false)}
                    onApplyTemplate={(t) => {
                        if (applyTemplate(t)) {
                            setShowTemplates(false);
                        }
                    }}
                />
            )}

            <WorkoutHeader
                user={user}
                isSyncing={isSyncing}
                trainingDays={trainingDays}
                currentDay={currentDay}
                workoutPlan={workoutPlan}
                onLogout={handleLogout}
                onLogin={handleLogin}
                onSetTrainingDays={setTrainingDays}
                onSetCurrentDay={setCurrentDay}
                onShowTemplates={() => setShowTemplates(true)}
                onExport={exportData}
                onImport={handleImport}
            />

            <main className="flex flex-col md:flex-row flex-1 p-6 gap-8">
                {/* Exercise List / Library */}
                <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
                    <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="workout">My Workout ({(workoutPlan[currentDay] || []).length})</TabsTrigger>
                            <TabsTrigger value="library">Library</TabsTrigger>
                        </TabsList>
                        <TabsContent value="library" className="space-y-4 mt-4">
                            <ExerciseFilters
                                searchTerm={searchTerm}
                                equipmentFilter={equipmentFilter}
                                bodyPartFilter={bodyPartFilter}
                                onSearchChange={setSearchTerm}
                                onEquipmentChange={setEquipmentFilter}
                                onBodyPartChange={setBodyPartFilter}
                            />
                            <ExerciseList
                                exercises={filteredExercises}
                                onAddExercise={(ex) => toggleExercise(ex.id)}
                                onOpenModal={setSelectedExercise}
                            />
                        </TabsContent>
                        <TabsContent value="workout" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Current Day Exercises</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {(workoutPlan[currentDay] || []).map((we, idx) => {
                                            const ex = exercises.find(e => e.id === we.exerciseId);
                                            if (!ex) return null;
                                            return (
                                                <div key={`${we.exerciseId}-${idx}`} className="p-2 text-sm border-b last:border-0">
                                                    {ex.name}
                                                </div>
                                            );
                                        })}
                                        {(workoutPlan[currentDay] || []).length === 0 && (
                                            <p className="text-muted-foreground text-sm">No exercises added.</p>
                                        )}
                                    </div>
                                    <Button 
                                        variant="secondary"
                                        className="w-full mt-4"
                                        onClick={() => setViewMode('library')}
                                    >
                                        Add Exercises
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Main Content - Workout View or Muscle Map */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="h-[600px]">
                        <WorkoutDayView
                            currentDay={currentDay}
                            workoutPlan={workoutPlan}
                            allExercises={exercises}
                            onRemoveExercise={toggleExercise}
                            onAddSet={addSet}
                            onRemoveSet={removeSet}
                            onUpdateSet={updateSet}
                            onOpenModal={setSelectedExercise}
                            onMoveExercise={moveExercise}
                        />
                    </div>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Muscle Focus</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] flex items-center justify-center">
                                <MuscleMap 
                                    muscleVolume={
                                        (workoutPlan[currentDay] || []).reduce((acc, we) => {
                                            const ex = exercises.find(e => e.id === we.exerciseId);
                                            if (ex) {
                                                // Count sets for primary muscle
                                                acc[ex.primaryMuscle] = (acc[ex.primaryMuscle] || 0) + we.sets.length;
                                                // Count partial sets for supporting muscles (optional, maybe 0.5 per set?)
                                                // For now, let's just count primary muscles for the heat map
                                            }
                                            return acc;
                                        }, {} as Record<string, number>)
                                    }
                                    onMuscleClick={(muscle) => {
                                        setBodyPartFilter(muscle);
                                        setViewMode('library');
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

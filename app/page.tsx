"use client";

import { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { exercises } from "./data/exercises";
import { templates } from "./data/templates";
import { WorkoutSet, Exercise } from "./types";
import { Maximize2, Minimize2 } from "lucide-react";

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
    const [isCompact, setIsCompact] = useState(false);

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
        <div className="flex flex-col h-screen overflow-hidden bg-background font-sans text-foreground relative">
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

            <main className="flex-1 container mx-auto max-w-7xl p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 overflow-hidden">
                {/* Sidebar - Workout & Library */}
                <div className="w-full lg:w-[400px] flex flex-col gap-4 shrink-0 h-full">
                    <Tabs value={viewMode} onValueChange={setViewMode} className="w-full flex flex-col h-full">
                        <TabsList className="grid w-full grid-cols-2 shrink-0">
                            <TabsTrigger value="workout">My Workout ({(workoutPlan[currentDay] || []).length})</TabsTrigger>
                            <TabsTrigger value="library">Library</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="workout" className="flex-1 flex flex-col gap-4 mt-4 overflow-hidden">
                            <div className="grid grid-cols-2 gap-2 shrink-0">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowTemplates(true)}
                                    className="w-full"
                                >
                                    Templates
                                </Button>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" onClick={exportData} className="w-full px-2" title="Export">
                                        Export
                                    </Button>
                                    <div className="relative w-full">
                                        <Button variant="outline" className="w-full px-2" asChild title="Import">
                                            <label className="cursor-pointer w-full h-full flex items-center justify-center">
                                                Import
                                                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                                            </label>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <WorkoutDayView
                                    currentDay={currentDay}
                                    workoutPlan={workoutPlan}
                                    allExercises={exercises}
                                    onRemoveExercise={(id) => toggleExercise(id)}
                                    onAddSet={addSet}
                                    onRemoveSet={removeSet}
                                    onUpdateSet={updateSet}
                                    onOpenModal={setSelectedExercise}
                                    onMoveExercise={moveExercise}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="library" className="flex-1 flex flex-col gap-4 mt-4 overflow-hidden">
                            <ExerciseFilters
                                searchTerm={searchTerm}
                                equipmentFilter={equipmentFilter}
                                bodyPartFilter={bodyPartFilter}
                                onSearchChange={setSearchTerm}
                                onEquipmentChange={setEquipmentFilter}
                                onBodyPartChange={setBodyPartFilter}
                            >
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setIsCompact(!isCompact)}
                                    title={isCompact ? "Expanded View" : "Compact View"}
                                >
                                    {isCompact ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                                </Button>
                            </ExerciseFilters>
                            <ExerciseList
                                exercises={filteredExercises}
                                onAddExercise={(ex) => toggleExercise(ex.id)}
                                onOpenModal={setSelectedExercise}
                                isCompact={isCompact}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Main Content - Muscle Map */}
                <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">
                    <Card className="h-full flex flex-col overflow-hidden">
                        <CardHeader className="shrink-0">
                            <CardTitle>Muscle Focus</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-6 overflow-hidden">
                            <div className="w-full h-full max-w-[600px] aspect-3/4">
                                <MuscleMap 
                                    muscleVolume={
                                        (workoutPlan[currentDay] || []).reduce((acc, we) => {
                                            const ex = exercises.find(e => e.id === we.exerciseId);
                                            if (ex) {
                                                acc[ex.primaryMuscle] = (acc[ex.primaryMuscle] || 0) + we.sets.length;
                                                ex.supportingMuscles?.forEach((m) => {
                                                    acc[m] = (acc[m] || 0) + (we.sets.length * 0.5);
                                                });
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

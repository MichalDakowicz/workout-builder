import React from 'react';
import { Info, Trash2, Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { WorkoutExercise, Exercise, WorkoutSet, SetType } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkoutDayViewProps {
    currentDay: number;
    workoutPlan: Record<number, WorkoutExercise[]>;
    allExercises: Exercise[];
    onRemoveExercise: (exerciseId: string) => void;
    onAddSet: (exerciseId: string) => void;
    onRemoveSet: (exerciseId: string, setIndex: number) => void;
    onUpdateSet: (exerciseId: string, setIndex: number, field: keyof WorkoutSet, value: any) => void;
    onOpenModal: (exercise: Exercise) => void;
    onMoveExercise: (index: number, direction: 'up' | 'down') => void;
}

export const WorkoutDayView: React.FC<WorkoutDayViewProps> = ({
    currentDay,
    workoutPlan,
    allExercises,
    onRemoveExercise,
    onAddSet,
    onRemoveSet,
    onUpdateSet,
    onOpenModal,
    onMoveExercise
}) => {
    const currentExercises = workoutPlan[currentDay] || [];

    const getExerciseDetails = (id: string) => allExercises.find(e => e.id === id);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-semibold">
                    Day {currentDay} Workout
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                    {currentExercises.length} exercises
                </span>
            </CardHeader>

            <CardContent className="space-y-4 flex-1 overflow-y-auto">
                {currentExercises.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        <p>No exercises added yet</p>
                        <p className="text-sm mt-1">Select exercises from the library to add them to your workout</p>
                    </div>
                ) : (
                    currentExercises.map((workoutExercise, idx) => {
                        const details = getExerciseDetails(workoutExercise.exerciseId);
                        if (!details) return null;

                        return (
                            <Card
                                key={`${workoutExercise.exerciseId}-${idx}`}
                                className="bg-muted/40"
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col mr-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => onMoveExercise(idx, 'up')}
                                                    disabled={idx === 0}
                                                >
                                                    <ChevronUp size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => onMoveExercise(idx, 'down')}
                                                    disabled={idx === currentExercises.length - 1}
                                                >
                                                    <ChevronDown size={14} />
                                                </Button>
                                            </div>
                                            <h3 className="font-medium">{details.name}</h3>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-primary"
                                                onClick={() => onOpenModal(details)}
                                            >
                                                <Info size={14} />
                                            </Button>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => onRemoveExercise(workoutExercise.exerciseId)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground uppercase font-medium px-2">
                                            <div className="col-span-2">Set</div>
                                            <div className="col-span-4">Type</div>
                                            <div className="col-span-4">Reps</div>
                                            <div className="col-span-2"></div>
                                        </div>
                                        
                                        {workoutExercise.sets.map((set, setIdx) => (
                                            <div key={setIdx} className="grid grid-cols-12 gap-2 items-center">
                                                <div className="col-span-2 flex items-center justify-center bg-background rounded h-9 text-sm font-medium text-muted-foreground border">
                                                    {setIdx + 1}
                                                </div>
                                                <div className="col-span-4">
                                                    <Select
                                                        value={set.type}
                                                        onValueChange={(value) => onUpdateSet(workoutExercise.exerciseId, setIdx, 'type', value as SetType)}
                                                    >
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="normal">Normal</SelectItem>
                                                            <SelectItem value="warmup">Warmup</SelectItem>
                                                            <SelectItem value="drop">Drop</SelectItem>
                                                            <SelectItem value="failure">Failure</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="col-span-4">
                                                    <Input
                                                        type="number"
                                                        value={set.reps || 0}
                                                        onChange={(e) => onUpdateSet(workoutExercise.exerciseId, setIdx, 'reps', parseInt(e.target.value) || 0)}
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="col-span-2 flex justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => onRemoveSet(workoutExercise.exerciseId, setIdx)}
                                                    >
                                                        <X size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <Button
                                            variant="outline"
                                            className="w-full border-dashed text-primary hover:bg-primary/5"
                                            onClick={() => onAddSet(workoutExercise.exerciseId)}
                                        >
                                            <Plus size={14} className="mr-2" />
                                            Add Set
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
};
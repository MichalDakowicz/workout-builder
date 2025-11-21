import React from 'react';
import { Exercise } from "../types";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExerciseListProps {
    exercises: Exercise[];
    onAddExercise: (exercise: Exercise) => void;
    onOpenModal: (exercise: Exercise) => void;
    isCompact?: boolean;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
    exercises,
    onAddExercise,
    onOpenModal,
    isCompact = false
}) => {
    return (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {exercises.map(exercise => (
                <Card
                    key={exercise.id}
                    className={`hover:border-primary transition-colors cursor-pointer ${isCompact ? 'py-1' : ''}`}
                    onClick={() => onOpenModal(exercise)}
                >
                    <CardContent className={`flex justify-between items-center ${isCompact ? 'p-2' : 'p-3 items-start'}`}>
                        <div className={isCompact ? "flex items-center gap-2 flex-1 overflow-hidden" : ""}>
                            <h3 className={`font-medium capitalize ${isCompact ? 'text-sm truncate' : ''}`}>{exercise.name}</h3>
                            {isCompact ? (
                                <span className="text-xs text-muted-foreground shrink-0">
                                    • {exercise.primaryMuscle}
                                </span>
                            ) : (
                                <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                                    <span className="capitalize">{exercise.primaryMuscle}</span>
                                    <span>•</span>
                                    <span className="capitalize">{exercise.equipment || 'Bodyweight'}</span>
                                </div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddExercise(exercise);
                            }}
                            className={`hover:text-primary ${isCompact ? 'h-6 w-6' : 'h-8 w-8'}`}
                        >
                            <Plus size={isCompact ? 14 : 18} />
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

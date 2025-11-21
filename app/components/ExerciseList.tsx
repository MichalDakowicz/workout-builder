import React from 'react';
import { Exercise } from "../types";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExerciseListProps {
    exercises: Exercise[];
    onAddExercise: (exercise: Exercise) => void;
    onOpenModal: (exercise: Exercise) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
    exercises,
    onAddExercise,
    onOpenModal
}) => {
    return (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {exercises.map(exercise => (
                <Card
                    key={exercise.id}
                    className="hover:border-primary transition-colors cursor-pointer"
                    onClick={() => onOpenModal(exercise)}
                >
                    <CardContent className="p-3 flex justify-between items-start">
                        <div>
                            <h3 className="font-medium">{exercise.name}</h3>
                            <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                                <span className="capitalize">{exercise.primaryMuscle}</span>
                                <span>•</span>
                                <span className="capitalize">{exercise.equipment || 'Bodyweight'}</span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddExercise(exercise);
                            }}
                            className="h-8 w-8 hover:text-primary"
                        >
                            <Plus size={18} />
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

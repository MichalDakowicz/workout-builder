import React from 'react';
import { Exercise } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ExerciseModalProps {
  exercise: Exercise;
  onClose: () => void;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({ exercise, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start pr-8">
            <div>
                <DialogTitle className="text-2xl font-bold">{exercise.name}</DialogTitle>
                <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="capitalize">
                        {exercise.equipment}
                    </Badge>
                </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Muscles */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Muscles Targeted</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="destructive" className="px-3 py-1.5 text-sm font-medium capitalize">
                {exercise.primaryMuscle.replace('_', ' ')} (Primary)
              </Badge>
              {exercise.supportingMuscles.map(m => (
                <Badge key={m} variant="outline" className="px-3 py-1.5 text-sm font-medium capitalize">
                  {m.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Instructions</h3>
              <ol className="space-y-3">
                {exercise.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-muted-foreground leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Video Panel */}
          {exercise.gifUrl && (
            <div className="bg-muted/50 border rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Demonstration
              </h3>
              <div className="w-full aspect-video bg-background rounded-lg overflow-hidden flex items-center justify-center border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={exercise.gifUrl} alt={exercise.name} className="max-w-full max-h-full object-contain" />
              </div>
            </div>
          )}

          {/* Tips */}
          {exercise.tips && exercise.tips.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-xl p-5">
              <h3 className="text-lg font-semibold mb-3 text-yellow-800 dark:text-yellow-500 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pro Tips
              </h3>
              <ul className="space-y-2">
                {exercise.tips.map((tip, idx) => (
                  <li key={idx} className="flex gap-2 text-yellow-700 dark:text-yellow-400/90">
                    <span className="text-yellow-500">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseModal;

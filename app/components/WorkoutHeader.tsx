import React from "react";
import { User } from "firebase/auth";
import { WorkoutExercise } from "../types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LogOut, Upload, Download, FileJson } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { AccentPicker } from "@/components/accent-picker";

interface WorkoutHeaderProps {
    user: User | null;
    isSyncing: boolean;
    trainingDays: number;
    currentDay: number;
    workoutPlan: Record<number, WorkoutExercise[]>;
    onLogout: () => void;
    onLogin: () => void;
    onSetTrainingDays: (days: number) => void;
    onSetCurrentDay: (day: number) => void;
    onShowTemplates: () => void;
    onExport: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({
    user,
    isSyncing,
    trainingDays,
    currentDay,
    workoutPlan,
    onLogout,
    onLogin,
    onSetTrainingDays,
    onSetCurrentDay,
    onShowTemplates,
    onExport,
    onImport,
}) => {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 shrink-0">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
                        WB
                    </div>
                    <h1 className="text-lg font-semibold tracking-tight hidden sm:block">
                        Workout Builder
                    </h1>
                </div>

                <div className="flex-1 flex items-center justify-center overflow-hidden px-4">
                    <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 no-scrollbar justify-center">
                        {Array.from({ length: trainingDays }).map((_, i) => {
                            const day = i + 1;
                            const exerciseCount = (workoutPlan[day] || [])
                                .length;
                            return (
                                <Button
                                    key={day}
                                    variant={
                                        currentDay === day ? "default" : "ghost"
                                    }
                                    size="sm"
                                    onClick={() => onSetCurrentDay(day)}
                                    className={`gap-2 whitespace-nowrap rounded-full h-8 ${
                                        currentDay === day
                                            ? ""
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    Day {day}
                                    {exerciseCount > 0 && (
                                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                                            {exerciseCount}
                                        </span>
                                    )}
                                </Button>
                            );
                        })}
                        <div className="h-4 w-px bg-border mx-2 shrink-0" />
                        <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs text-muted-foreground whitespace-nowrap mr-2">
                                Days:
                            </span>
                            {[2, 3, 4, 5, 6].map((days) => (
                                <button
                                    key={days}
                                    onClick={() => onSetTrainingDays(days)}
                                    className={`h-6 w-6 rounded-full text-[10px] flex items-center justify-center transition-colors ${
                                        trainingDays === days
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                                >
                                    {days}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <AccentPicker />
                    <ModeToggle />
                    {user ? (
                        <div className="flex items-center gap-3 pl-2 border-l ml-2">
                            <Avatar className="h-8 w-8 border">
                                <AvatarImage src={user.photoURL || undefined} />
                                <AvatarFallback>
                                    {user.displayName?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onLogout}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={onLogin} size="sm" className="gap-2">
                            <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Sign in
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

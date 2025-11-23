import React from "react";
import { Equipment, Muscle } from "../types";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ExerciseFiltersProps {
    searchTerm: string;
    equipmentFilter: Equipment | "all";
    bodyPartFilter: Muscle | "all";
    onSearchChange: (term: string) => void;
    onEquipmentChange: (equipment: Equipment | "all") => void;
    onBodyPartChange: (bodyPart: Muscle | "all") => void;
    children?: React.ReactNode;
}

export const ExerciseFilters: React.FC<ExerciseFiltersProps> = ({
    searchTerm,
    equipmentFilter,
    bodyPartFilter,
    onSearchChange,
    onEquipmentChange,
    onBodyPartChange,
    children,
}) => {
    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        placeholder="Search exercises or muscles..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pr-8 glass-panel border-white/10 bg-white/5 focus:border-primary/50 focus:bg-white/10 transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-neon-cyan transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                {children}
            </div>

            <div className="flex gap-2">
                <Select
                    value={equipmentFilter}
                    onValueChange={(value) =>
                        onEquipmentChange(value as Equipment | "all")
                    }
                >
                    <SelectTrigger className="flex-1 glass-panel border-white/10 bg-white/5 focus:border-primary/50 focus:bg-white/10 transition-all">
                        <SelectValue placeholder="Equipment" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl">
                        <SelectItem value="all">All Equipment</SelectItem>
                        <SelectItem value="barbell">Barbell</SelectItem>
                        <SelectItem value="dumbbell">Dumbbell</SelectItem>
                        <SelectItem value="machine">Machine</SelectItem>
                        <SelectItem value="cables">Cables</SelectItem>
                        <SelectItem value="bodyweight">Bodyweight</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={bodyPartFilter}
                    onValueChange={(value) =>
                        onBodyPartChange(value as Muscle | "all")
                    }
                >
                    <SelectTrigger className="flex-1 glass-panel border-white/10 bg-white/5 focus:border-primary/50 focus:bg-white/10 transition-all">
                        <SelectValue placeholder="Body Part" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl">
                        <SelectItem value="all">All Body Parts</SelectItem>
                        <SelectItem value="pectorals">
                            Chest (Pectorals)
                        </SelectItem>
                        <SelectItem value="lats">Back (Lats)</SelectItem>
                        <SelectItem value="upper_back">Upper Back</SelectItem>
                        <SelectItem value="traps">Traps</SelectItem>
                        <SelectItem value="lower_back">Lower Back</SelectItem>
                        <SelectItem value="shoulders">Shoulders</SelectItem>
                        <SelectItem value="rear_deltoids">
                            Rear Deltoids
                        </SelectItem>
                        <SelectItem value="biceps">Biceps</SelectItem>
                        <SelectItem value="triceps">Triceps</SelectItem>
                        <SelectItem value="forearms">Forearms</SelectItem>
                        <SelectItem value="abdominals">Abs</SelectItem>
                        <SelectItem value="obliques">Obliques</SelectItem>
                        <SelectItem value="quadriceps">Quads</SelectItem>
                        <SelectItem value="adductors">Adductors</SelectItem>
                        <SelectItem value="abductors">Abductors</SelectItem>
                        <SelectItem value="hamstrings">Hamstrings</SelectItem>
                        <SelectItem value="glutes">Glutes</SelectItem>
                        <SelectItem value="calves">Calves</SelectItem>
                        <SelectItem value="shins">Shins</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

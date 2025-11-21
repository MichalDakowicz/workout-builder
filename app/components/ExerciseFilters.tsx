import React from 'react';
import { Equipment, Muscle } from "../types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExerciseFiltersProps {
    searchTerm: string;
    equipmentFilter: Equipment | 'all';
    bodyPartFilter: Muscle | 'all';
    onSearchChange: (term: string) => void;
    onEquipmentChange: (equipment: Equipment | 'all') => void;
    onBodyPartChange: (bodyPart: Muscle | 'all') => void;
}

export const ExerciseFilters: React.FC<ExerciseFiltersProps> = ({
    searchTerm,
    equipmentFilter,
    bodyPartFilter,
    onSearchChange,
    onEquipmentChange,
    onBodyPartChange
}) => {
    return (
        <div className="space-y-3">
            <Input
                type="text"
                placeholder="Search exercises or muscles..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full"
            />

            <div className="flex gap-2">
                <Select
                    value={equipmentFilter}
                    onValueChange={(value) => onEquipmentChange(value as Equipment | 'all')}
                >
                    <SelectTrigger className="w-1/2">
                        <SelectValue placeholder="Equipment" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Equipment</SelectItem>
                        <SelectItem value="barbell">Barbell</SelectItem>
                        <SelectItem value="dumbbell">Dumbbell</SelectItem>
                        <SelectItem value="machine">Machine</SelectItem>
                        <SelectItem value="cables">Cables</SelectItem>
                        <SelectItem value="bodyweight">Bodyweight</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Select
                value={bodyPartFilter}
                onValueChange={(value) => onBodyPartChange(value as Muscle | 'all')}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Body Part" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Body Parts</SelectItem>
                    <SelectItem value="pectorals">Chest (Pectorals)</SelectItem>
                    <SelectItem value="lats">Back (Lats)</SelectItem>
                    <SelectItem value="traps">Traps</SelectItem>
                    <SelectItem value="lower_back">Lower Back</SelectItem>
                    <SelectItem value="shoulders">Shoulders</SelectItem>
                    <SelectItem value="biceps">Biceps</SelectItem>
                    <SelectItem value="triceps">Triceps</SelectItem>
                    <SelectItem value="forearms">Forearms</SelectItem>
                    <SelectItem value="abdominals">Abs</SelectItem>
                    <SelectItem value="obliques">Obliques</SelectItem>
                    <SelectItem value="quadriceps">Quads</SelectItem>
                    <SelectItem value="hamstrings">Hamstrings</SelectItem>
                    <SelectItem value="glutes">Glutes</SelectItem>
                    <SelectItem value="calves">Calves</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};

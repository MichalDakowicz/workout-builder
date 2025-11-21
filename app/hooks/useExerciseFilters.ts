import { useState, useMemo } from "react";
import { Exercise, Equipment, Muscle } from "../types";
import { exercises } from "../data/exercises";

const muscleAliases: Record<string, Muscle[]> = {
    chest: ['pectorals'],
    pecs: ['pectorals'],
    back: ['lats', 'traps', 'lower_back'],
    legs: ['quadriceps', 'hamstrings', 'calves', 'glutes'],
    quads: ['quadriceps'],
    arms: ['biceps', 'triceps', 'forearms'],
    abs: ['abdominals', 'obliques'],
    core: ['abdominals', 'obliques', 'lower_back'],
    shoulders: ['shoulders', 'traps']
};

export function useExerciseFilters() {
    const [searchTerm, setSearchTerm] = useState("");
    const [equipmentFilter, setEquipmentFilter] = useState<Equipment | 'all'>('all');
    const [bodyPartFilter, setBodyPartFilter] = useState<Muscle | 'all'>('all');

    const filteredExercises = useMemo(() => {
        let filtered = [...exercises];

        // Filter by Equipment
        if (equipmentFilter !== 'all') {
            filtered = filtered.filter(e => e.equipment === equipmentFilter);
        }

        // Filter by Body Part
        if (bodyPartFilter !== 'all') {
            filtered = filtered.filter(e => 
                e.primaryMuscle === bodyPartFilter || 
                e.supportingMuscles.includes(bodyPartFilter)
            );
        }

        const term = searchTerm.toLowerCase().trim();
        if (term) {
            // Find all muscles that match the search term via aliases
            const aliasMuscles = Object.entries(muscleAliases)
                .filter(([key]) => key.includes(term) || term.includes(key))
                .flatMap(([, muscles]) => muscles);

            filtered = filtered.filter(exercise => {
                const matchesName = exercise.name.toLowerCase().includes(term);
                const matchesPrimary = exercise.primaryMuscle.toLowerCase().includes(term);
                const matchesSupporting = exercise.supportingMuscles.some(m => m.toLowerCase().includes(term));
                
                const matchesAlias = aliasMuscles.some(m => 
                    exercise.primaryMuscle === m || exercise.supportingMuscles.includes(m)
                );

                return matchesName || matchesPrimary || matchesSupporting || matchesAlias;
            });
        }

        // Sort results
        return filtered.sort((a, b) => {
            // 1. Prioritize primary muscle match if body part filter is active
            if (bodyPartFilter !== 'all') {
                const aIsPrimary = a.primaryMuscle === bodyPartFilter;
                const bIsPrimary = b.primaryMuscle === bodyPartFilter;

                if (aIsPrimary && !bIsPrimary) return -1;
                if (!aIsPrimary && bIsPrimary) return 1;
            }

            // 2. Alphabetical sort as secondary
            return a.name.localeCompare(b.name);
        });
    }, [searchTerm, equipmentFilter, bodyPartFilter]);

    return {
        searchTerm,
        setSearchTerm,
        equipmentFilter,
        setEquipmentFilter,
        bodyPartFilter,
        setBodyPartFilter,
        filteredExercises
    };
}

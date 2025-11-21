import React from 'react';
import { Muscle } from '../types';

interface MuscleMapProps {
  primaryMuscles?: Muscle[];
  secondaryMuscles?: Muscle[];
  previewMuscles?: Muscle[];
  muscleVolume?: Record<string, number>; // Muscle name -> Set count
  onMuscleClick?: (muscle: Muscle) => void;
}

const MuscleMap: React.FC<MuscleMapProps> = ({ 
  primaryMuscles = [], 
  secondaryMuscles = [], 
  previewMuscles = [],
  muscleVolume,
  onMuscleClick
}) => {
  const isPrimary = (muscle: Muscle) => primaryMuscles.includes(muscle);
  const isSecondary = (muscle: Muscle) => secondaryMuscles.includes(muscle);
  const isPreview = (muscle: Muscle) => previewMuscles.includes(muscle);

  const getVolumeColor = (sets: number) => {
    if (sets === 0) return 'hsl(var(--muted))';
    if (sets < 3) return '#4ade80'; // Green-400 (Activation)
    if (sets < 6) return '#facc15'; // Yellow-400 (Moderate)
    if (sets < 10) return '#fb923c'; // Orange-400 (High)
    return '#f87171'; // Red-400 (Very High)
  };

  const getFill = (muscle: Muscle) => {
    if (isPreview(muscle)) return 'hsl(var(--chart-4))'; // Yellow/Gold
    
    // If volume data is provided, use it
    if (muscleVolume) {
      const sets = muscleVolume[muscle] || 0;
      return sets > 0 ? getVolumeColor(sets) : 'hsl(var(--muted))';
    }

    // Fallback to old Primary/Secondary logic
    if (isPrimary(muscle)) return 'hsl(var(--destructive))'; 
    if (isSecondary(muscle)) return 'hsl(var(--chart-5))'; // Orange-ish
    return 'hsl(var(--muted))'; // Grey for default
  };

  const getTitle = (muscle: Muscle) => {
    const name = muscle.charAt(0).toUpperCase() + muscle.slice(1).replace('_', ' ');
    const sets = muscleVolume ? (muscleVolume[muscle] || 0) : 0;
    return muscleVolume ? `${name}: ${sets} sets` : name;
  };

  const handleClick = (muscle: Muscle) => {
    if (onMuscleClick) {
      onMuscleClick(muscle);
    }
  };

  return (
    <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <style>
        {`
          path { transition: all 0.3s ease; }
          path:hover { fill: hsl(var(--primary)); opacity: 0.8; cursor: pointer; }
        `}
      </style>

      <text x="200" y="50" textAnchor="middle" fontSize="24" fill="hsl(var(--foreground))" stroke="none">FRONT</text>
      <text x="600" y="50" textAnchor="middle" fontSize="24" fill="hsl(var(--foreground))" stroke="none">BACK</text>

      {/* ================= FRONT VIEW ================= */}
      <g id="front-view">
        {/* Head */}
        <path d="M185,70 Q200,50 215,70 L215,100 L185,100 Z" fill="hsl(var(--muted))" stroke="none"/>
        <circle cx="200" cy="70" r="25" fill="hsl(var(--muted))" />

        {/* Traps (Neck) */}
        <path id="traps-front" d="M185,100 L160,115 L170,100 Z M215,100 L240,115 L230,100 Z" fill={getFill('traps')} onClick={() => handleClick('traps')}>
            <title>{getTitle('traps')}</title>
        </path>

        {/* Shoulders (Deltoids Front) */}
        <path id="shoulders-front" d="M160,115 L140,140 L155,150 L170,125 Z M240,115 L260,140 L245,150 L230,125 Z" fill={getFill('shoulders')} onClick={() => handleClick('shoulders')}>
            <title>{getTitle('shoulders')}</title>
        </path>

        {/* Chest (Pectorals) */}
        <path id="pectorals" d="M170,125 L200,125 L200,160 L165,150 Z M230,125 L200,125 L200,160 L235,150 Z" fill={getFill('pectorals')} onClick={() => handleClick('pectorals')}>
            <title>{getTitle('pectorals')}</title>
        </path>

        {/* Biceps */}
        <path id="biceps" d="M155,150 L145,180 L160,180 L165,150 Z M245,150 L255,180 L240,180 L235,150 Z" fill={getFill('biceps')} onClick={() => handleClick('biceps')}>
            <title>{getTitle('biceps')}</title>
        </path>

        {/* Forearms */}
        <path id="forearms" d="M145,180 L135,220 L150,225 L160,180 Z M255,180 L265,220 L250,225 L240,180 Z" fill={getFill('forearms')} onClick={() => handleClick('forearms')}>
            <title>{getTitle('forearms')}</title>
        </path>

        {/* Abs (Rectus Abdominis) */}
        <path id="abdominals" d="M180,160 L220,160 L215,220 L185,220 Z" fill={getFill('abdominals')} onClick={() => handleClick('abdominals')}>
            <title>{getTitle('abdominals')}</title>
        </path>

        {/* Obliques */}
        <path id="obliques" d="M180,160 L165,150 L165,210 L185,220 Z M220,160 L235,150 L235,210 L215,220 Z" fill={getFill('obliques')} onClick={() => handleClick('obliques')}>
            <title>{getTitle('obliques')}</title>
        </path>

        {/* Quads (Quadriceps) */}
        <path id="quadriceps" d="M185,220 L165,220 L160,320 L190,310 Z M215,220 L235,220 L240,320 L210,310 Z" fill={getFill('quadriceps')} onClick={() => handleClick('quadriceps')}>
            <title>{getTitle('quadriceps')}</title>
        </path>

        {/* Calves (Front Tibialis) */}
        <path id="calves-front" d="M160,320 L155,330 L165,390 L180,380 L190,310 Z M240,320 L245,330 L235,390 L220,380 L210,310 Z" fill={getFill('calves')} onClick={() => handleClick('calves')}>
            <title>{getTitle('calves')}</title>
        </path>
      </g>

      {/* ================= BACK VIEW ================= */}
      <g id="back-view">
        {/* Head (Back) */}
        <circle cx="600" cy="70" r="25" fill="hsl(var(--muted))" />

        {/* Traps (Upper Back) */}
        <path id="traps" d="M585,100 L560,115 L580,140 L600,160 L620,140 L640,115 L615,100 Z" fill={getFill('traps')} onClick={() => handleClick('traps')}>
            <title>{getTitle('traps')}</title>
        </path>

        {/* Shoulders (Rear Deltoids) */}
        <path id="shoulders-rear" d="M560,115 L540,140 L555,150 L575,125 Z M640,115 L660,140 L645,150 L625,125 Z" fill={getFill('shoulders')} onClick={() => handleClick('shoulders')}>
            <title>{getTitle('shoulders')}</title>
        </path>

        {/* Triceps */}
        <path id="triceps" d="M555,150 L545,180 L560,180 L565,150 Z M645,150 L655,180 L640,180 L635,150 Z" fill={getFill('triceps')} onClick={() => handleClick('triceps')}>
            <title>{getTitle('triceps')}</title>
        </path>

        {/* Lats (Latissimus Dorsi) */}
        <path id="lats" d="M580,140 L565,150 L570,200 L600,220 L630,200 L635,150 L620,140 L600,160 Z" fill={getFill('lats')} onClick={() => handleClick('lats')}>
            <title>{getTitle('lats')}</title>
        </path>

        {/* Lower Back (Erectors) */}
        <path id="lower-back" d="M570,200 L580,220 L600,220 L620,220 L630,200 Z" fill={getFill('lower_back')} onClick={() => handleClick('lower_back')}>
            <title>{getTitle('lower_back')}</title>
        </path>

        {/* Forearms (Back) */}
        <path id="forearms-back" d="M545,180 L535,220 L550,225 L560,180 Z M655,180 L665,220 L650,225 L640,180 Z" fill={getFill('forearms')} onClick={() => handleClick('forearms')}>
            <title>{getTitle('forearms')}</title>
        </path>

        {/* Glutes */}
        <path id="glutes" d="M580,220 L560,230 L560,270 L600,270 L640,270 L640,230 L620,220 L600,220 Z" fill={getFill('glutes')} onClick={() => handleClick('glutes')}>
            <title>{getTitle('glutes')}</title>
        </path>

        {/* Hamstrings */}
        <path id="hamstrings" d="M560,270 L555,320 L590,320 L600,270 Z M640,270 L645,320 L610,320 L600,270 Z" fill={getFill('hamstrings')} onClick={() => handleClick('hamstrings')}>
            <title>{getTitle('hamstrings')}</title>
        </path>

        {/* Calves (Gastrocnemius) */}
        <path id="calves" d="M555,320 L550,350 L565,390 L580,380 L590,320 Z M645,320 L650,350 L635,390 L620,380 L610,320 Z" fill={getFill('calves')} onClick={() => handleClick('calves')}>
            <title>{getTitle('calves')}</title>
        </path>
      </g>
    </svg>
  );
};

export default MuscleMap;

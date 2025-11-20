import React from 'react';
import { Muscle } from '../types';

interface MuscleMapProps {
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  previewMuscles?: Muscle[];
}

const MuscleMap: React.FC<MuscleMapProps> = ({ primaryMuscles, secondaryMuscles, previewMuscles = [] }) => {
  const isPrimary = (muscle: Muscle) => primaryMuscles.includes(muscle);
  const isSecondary = (muscle: Muscle) => secondaryMuscles.includes(muscle);
  const isPreview = (muscle: Muscle) => previewMuscles.includes(muscle);

  const getFill = (muscle: Muscle) => {
    if (isPreview(muscle)) return '#f1c40f'; // Yellow for preview
    if (isPrimary(muscle)) return '#e74c3c'; // Red for primary
    if (isSecondary(muscle)) return '#e67e22'; // Orange for secondary
    return '#ecf0f1'; // Grey for default
  };

  return (
    <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" fill="#e0e0e0" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <style>
        {`
          path { transition: fill 0.3s ease; }
          path:hover { fill: #bdc3c7; cursor: pointer; }
        `}
      </style>

      <text x="200" y="50" textAnchor="middle" fontSize="24" fill="#333" stroke="none">FRONT</text>
      <text x="600" y="50" textAnchor="middle" fontSize="24" fill="#333" stroke="none">BACK</text>

      {/* ================= FRONT VIEW ================= */}
      <g id="front-view">
        {/* Head */}
        <path d="M185,70 Q200,50 215,70 L215,100 L185,100 Z" fill="#ecf0f1" stroke="none"/>
        <circle cx="200" cy="70" r="25" fill="#ecf0f1" />

        {/* Traps (Neck) */}
        <path id="traps-front" d="M185,100 L160,115 L170,100 Z M215,100 L240,115 L230,100 Z" fill={getFill('traps')} />

        {/* Shoulders (Deltoids Front) */}
        <path id="shoulders-front" d="M160,115 L140,140 L155,150 L170,125 Z M240,115 L260,140 L245,150 L230,125 Z" fill={getFill('shoulders')} />

        {/* Chest (Pectorals) */}
        <path id="pectorals" d="M170,125 L200,125 L200,160 L165,150 Z M230,125 L200,125 L200,160 L235,150 Z" fill={getFill('pectorals')} />

        {/* Biceps */}
        <path id="biceps" d="M155,150 L145,180 L160,180 L165,150 Z M245,150 L255,180 L240,180 L235,150 Z" fill={getFill('biceps')} />

        {/* Forearms */}
        <path id="forearms" d="M145,180 L135,220 L150,225 L160,180 Z M255,180 L265,220 L250,225 L240,180 Z" fill={getFill('forearms')} />

        {/* Abs (Rectus Abdominis) */}
        <path id="abdominals" d="M180,160 L220,160 L215,220 L185,220 Z" fill={getFill('abdominals')} />

        {/* Obliques */}
        <path id="obliques" d="M180,160 L165,150 L165,210 L185,220 Z M220,160 L235,150 L235,210 L215,220 Z" fill={getFill('obliques')} />

        {/* Quads (Quadriceps) */}
        <path id="quadriceps" d="M185,220 L165,220 L160,320 L190,310 Z M215,220 L235,220 L240,320 L210,310 Z" fill={getFill('quadriceps')} />

        {/* Calves (Front Tibialis) */}
        <path id="calves-front" d="M160,320 L155,330 L165,390 L180,380 L190,310 Z M240,320 L245,330 L235,390 L220,380 L210,310 Z" fill={getFill('calves')} />
      </g>

      {/* ================= BACK VIEW ================= */}
      <g id="back-view">
        {/* Head (Back) */}
        <circle cx="600" cy="70" r="25" fill="#ecf0f1" />

        {/* Traps (Upper Back) */}
        <path id="traps" d="M585,100 L560,115 L580,140 L600,160 L620,140 L640,115 L615,100 Z" fill={getFill('traps')} />

        {/* Shoulders (Rear Deltoids) */}
        <path id="shoulders-rear" d="M560,115 L540,140 L555,150 L575,125 Z M640,115 L660,140 L645,150 L625,125 Z" fill={getFill('shoulders')} />

        {/* Triceps */}
        <path id="triceps" d="M555,150 L545,180 L560,180 L565,150 Z M645,150 L655,180 L640,180 L635,150 Z" fill={getFill('triceps')} />

        {/* Lats (Latissimus Dorsi) */}
        <path id="lats" d="M580,140 L565,150 L570,200 L600,220 L630,200 L635,150 L620,140 L600,160 Z" fill={getFill('lats')} />

        {/* Lower Back (Erectors) */}
        <path id="lower-back" d="M570,200 L580,220 L600,220 L620,220 L630,200 Z" fill={getFill('lower_back')} />

        {/* Forearms (Back) */}
        <path id="forearms-back" d="M545,180 L535,220 L550,225 L560,180 Z M655,180 L665,220 L650,225 L640,180 Z" fill={getFill('forearms')} />

        {/* Glutes */}
        <path id="glutes" d="M580,220 L560,230 L560,270 L600,270 L640,270 L640,230 L620,220 L600,220 Z" fill={getFill('glutes')} />

        {/* Hamstrings */}
        <path id="hamstrings" d="M560,270 L555,320 L590,320 L600,270 Z M640,270 L645,320 L610,320 L600,270 Z" fill={getFill('hamstrings')} />

        {/* Calves (Gastrocnemius) */}
        <path id="calves" d="M555,320 L550,350 L565,390 L580,380 L590,320 Z M645,320 L650,350 L635,390 L620,380 L610,320 Z" fill={getFill('calves')} />
      </g>
    </svg>
  );
};

export default MuscleMap;

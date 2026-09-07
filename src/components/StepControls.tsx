import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Volume2,
  VolumeX,
  Gauge,
} from 'lucide-react';
import { SimulationStep } from '../types/suanpan';
import { soundPlayer } from '../utils/audio';

interface StepControlsProps {
  steps: SimulationStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export const StepControls: React.FC<StepControlsProps> = ({
  steps,
  currentStepIndex,
  onStepChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onSpeedChange,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const currentStep = steps[currentStepIndex];

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundPlayer.enabled = next;
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      soundPlayer.playBeadClick(0.9);
      onStepChange(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      soundPlayer.playBeadClick(0.9);
      onStepChange(currentStepIndex + 1);
    }
  };

  const handleFirst = () => {
    soundPlayer.playRodReset();
    onStepChange(0);
  };

  const handleLast = () => {
    soundPlayer.playRodReset();
    onStepChange(steps.length - 1);
  };

  return (
    <div className="w-full bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Current Step Overview Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950">
            Paso {currentStepIndex + 1} de {steps.length}
          </span>
          <h3 className="text-sm sm:text-base font-serif font-bold text-stone-100">
            {currentStep?.title || 'Simulación en Curso'}
          </h3>
        </div>

        {/* Phase Badge */}
        {currentStep && (
          <span
            className={`text-xs font-mono px-2.5 py-1 rounded-full border ${getPhaseBadgeStyle(
              currentStep.phase
            )}`}
          >
            {getPhaseLabel(currentStep.phase)}
          </span>
        )}
      </div>

      {/* Didactic Step Physical Movement Explanation */}
      {currentStep && (
        <div className="bg-stone-950/70 border border-amber-500/20 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-stone-300 space-y-1.5">
          <div className="font-mono text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <span>⚙ Acción Analógica en el Tablero:</span>
          </div>
          <p className="leading-relaxed text-stone-200">
            {currentStep.explanation}
          </p>
        </div>
      )}

      {/* Control Buttons & Progress Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Playback Nav Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleFirst}
              disabled={currentStepIndex === 0}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:hover:bg-stone-800 text-stone-200 transition-colors"
              title="Primer paso (Carga inicial)"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:hover:bg-stone-800 text-stone-200 text-xs font-mono font-medium transition-colors"
              title="Paso anterior"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            {/* Play / Pause Primary Button */}
            <button
              onClick={onTogglePlay}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all shadow-md ${
                isPlaying
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
              }`}
              title={isPlaying ? 'Pausar reproducción' : 'Reproducir automáticamente'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Reproducir</span>
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:hover:bg-stone-800 text-stone-200 text-xs font-mono font-medium transition-colors"
              title="Siguiente paso"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleLast}
              disabled={currentStepIndex === steps.length - 1}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:hover:bg-stone-800 text-stone-200 transition-colors"
              title="Último paso (Solución final)"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* Speed & Sound Controls */}
          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800 text-xs font-mono text-stone-400">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              {[0.8, 1.5, 2.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onSpeedChange(speed)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    playbackSpeed === speed
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'hover:text-stone-200'
                  }`}
                >
                  {speed === 0.8 ? '1x' : speed === 1.5 ? '1.5x' : '2.5x'}
                </button>
              ))}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-stone-800 border-stone-700 text-stone-500'
              }`}
              title={soundEnabled ? 'Sonido de cuentas activado' : 'Sonido silenciado'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Step Progress Timeline Bar */}
        <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden border border-stone-800">
          <div
            className="bg-gradient-to-r from-amber-600 via-amber-400 to-amber-500 h-full transition-all duration-300 ease-out"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>

        {/* Clickable Step Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundPlayer.playBeadClick(0.7);
                onStepChange(idx);
              }}
              className={`px-2 py-1 rounded text-[11px] font-mono whitespace-nowrap transition-colors shrink-0 ${
                idx === currentStepIndex
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : idx < currentStepIndex
                  ? 'bg-stone-800/80 text-stone-300 hover:bg-stone-800'
                  : 'bg-stone-900/60 text-stone-500 hover:text-stone-300'
              }`}
              title={s.title}
            >
              {idx + 1}. {s.title.slice(0, 18)}...
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

function getPhaseBadgeStyle(phase: string): string {
  switch (phase) {
    case 'INITIAL_LOAD':
      return 'bg-blue-500/15 border-blue-500/40 text-blue-300';
    case 'OVERLOAD_ACCUMULATION':
      return 'bg-amber-500/20 border-amber-500/60 text-amber-300 animate-pulse';
    case 'CARRY_NORMALIZATION':
      return 'bg-purple-500/15 border-purple-500/40 text-purple-300';
    case 'ROW_SUBTRACTION':
      return 'bg-rose-500/15 border-rose-500/40 text-rose-300';
    case 'BACK_SUBSTITUTION':
    case 'PIVOT_ISOLATION':
      return 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300';
    case 'FINAL_SOLUTION':
      return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
    default:
      return 'bg-stone-800 border-stone-700 text-stone-300';
  }
}

function getPhaseLabel(phase: string): string {
  switch (phase) {
    case 'INITIAL_LOAD':
      return 'Carga Inicial';
    case 'ROW_SWAP':
      return 'Intercambio de Filas';
    case 'ROW_SCALE':
      return 'Escalado Analógico';
    case 'OVERLOAD_ACCUMULATION':
      return 'Sobrecarga (15 Cuentas)';
    case 'CARRY_NORMALIZATION':
      return 'Acarreo y Normalización';
    case 'ROW_SUBTRACTION':
      return 'Resta Analógica de Hilos';
    case 'PIVOT_ISOLATION':
      return 'Aislamiento de Incógnita';
    case 'BACK_SUBSTITUTION':
      return 'Sustitución Hacia Atrás';
    case 'FINAL_SOLUTION':
      return 'Solución Final Canónica';
    default:
      return phase;
  }
}

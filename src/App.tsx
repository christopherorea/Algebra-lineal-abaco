/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  AbacusState,
  MemoryBlock,
  SimulationStep,
} from './types/suanpan';
import {
  PRESET_SYSTEMS,
  solveSystemStepByStep,
} from './utils/gaussianSolver';
import {
  cloneAbacusState,
  generateVisualAsciiReport,
} from './utils/suanpanPhysics';
import { SuanpanBoard } from './components/SuanpanBoard';
import { AsciiReportView } from './components/AsciiReportView';
import { SystemInputForm } from './components/SystemInputForm';
import { StepControls } from './components/StepControls';
import { HardwareManualModal } from './components/HardwareManualModal';
import { soundPlayer } from './utils/audio';
import { Sparkles, HelpCircle, Layers, Cpu, Play } from 'lucide-react';

export default function App() {
  // Default to 3x3 Jiuzhang Suanshu classic problem
  const [dimension, setDimension] = useState<2 | 3>(3);
  const [matrix, setMatrix] = useState<number[][]>([
    [3, 2, 1, 39],
    [2, 3, 1, 34],
    [1, 2, 3, 26],
  ]);

  // Simulation steps
  const [steps, setSteps] = useState<SimulationStep[]>(() =>
    solveSystemStepByStep(
      [
        [3, 2, 1, 39],
        [2, 3, 1, 34],
        [1, 2, 3, 26],
      ],
      3
    )
  );
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.8);
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);

  // Active displayed abacus state
  const [currentAbacusState, setCurrentAbacusState] = useState<AbacusState>(
    () => steps[0].abacusState
  );

  // Flag if user has manually tweaked beads
  const [isManualTweak, setIsManualTweak] = useState<boolean>(false);
  const [customAsciiReport, setCustomAsciiReport] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state when step changes
  useEffect(() => {
    if (steps[currentStepIndex]) {
      setCurrentAbacusState(cloneAbacusState(steps[currentStepIndex].abacusState));
      setIsManualTweak(false);
      setCustomAsciiReport('');
    }
  }, [currentStepIndex, steps]);

  // Handle Playback Interval
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.round(1800 / playbackSpeed);
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            soundPlayer.playBeadClick(0.9);
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, steps.length]);

  // Re-run solver on system input
  const handleSolve = () => {
    setIsPlaying(false);
    const newSteps = solveSystemStepByStep(matrix, dimension);
    setSteps(newSteps);
    setCurrentStepIndex(0);
    setCurrentAbacusState(cloneAbacusState(newSteps[0].abacusState));
    setIsManualTweak(false);
    setCustomAsciiReport('');
    soundPlayer.playRodReset();
  };

  // Dimension change
  const handleDimensionChange = (newDim: 2 | 3) => {
    setIsPlaying(false);
    setDimension(newDim);
    if (newDim === 2) {
      const def2x2 = [
        [2, 3, 13],
        [1, -1, -1],
      ];
      setMatrix(def2x2);
      const newSteps = solveSystemStepByStep(def2x2, 2);
      setSteps(newSteps);
      setCurrentStepIndex(0);
      setCurrentAbacusState(cloneAbacusState(newSteps[0].abacusState));
    } else {
      const def3x3 = [
        [3, 2, 1, 39],
        [2, 3, 1, 34],
        [1, 2, 3, 26],
      ];
      setMatrix(def3x3);
      const newSteps = solveSystemStepByStep(def3x3, 3);
      setSteps(newSteps);
      setCurrentStepIndex(0);
      setCurrentAbacusState(cloneAbacusState(newSteps[0].abacusState));
    }
    setIsManualTweak(false);
    setCustomAsciiReport('');
  };

  // User manually edits beads on the virtual Suanpan
  const handleUpdateBlock = (
    rowIndex: number,
    varName: 'X' | 'Y' | 'Z' | 'R',
    updatedBlock: MemoryBlock
  ) => {
    setIsPlaying(false);
    setIsManualTweak(true);

    const nextState = cloneAbacusState(currentAbacusState);
    const row = nextState.rows.find((r) => r.rowIndex === rowIndex);
    if (row) {
      row.blocks[varName] = updatedBlock;
      setCurrentAbacusState(nextState);

      const manualDesc = `[MANIPULACIÓN FÍSICA DIRECTA DEL USUARIO]\nEl operador ha modificado manualmente las cuentas del Bloque ${varName} en la Fila ${rowIndex}. Valor neto actual: ${updatedBlock.netValue}.`;
      const ascii = generateVisualAsciiReport(manualDesc, nextState);
      setCustomAsciiReport(ascii);
    }
  };

  const handleResetBoard = () => {
    setIsPlaying(false);
    const blankMatrix =
      dimension === 2
        ? [
            [0, 0, 0],
            [0, 0, 0],
          ]
        : [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ];
    const initialBlankSteps = solveSystemStepByStep(blankMatrix, dimension);
    setCurrentAbacusState(cloneAbacusState(initialBlankSteps[0].abacusState));
    setIsManualTweak(true);
    setCustomAsciiReport(
      generateVisualAsciiReport(
        '[DESPEJE TOTAL DE CUENTAS]\nTodas las cuentas han sido alejadas de la viga central hacia los marcos exteriores (estado cero analógico).',
        initialBlankSteps[0].abacusState
      )
    );
    soundPlayer.playRodReset();
  };

  const currentStep = steps[currentStepIndex] || steps[0];

  // Active step for ASCII report display
  const activeReportStep: SimulationStep = isManualTweak
    ? {
        ...currentStep,
        title: 'Manipulación Manual Directa del Tablero',
        physicalDescription:
          'El usuario ha deslizado cuentas libremente sobre el ábaco Suanpan 2/5.',
        asciiReport: customAsciiReport || currentStep.asciiReport,
      }
    : currentStep;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-amber-500 selection:text-stone-950 font-sans pb-16">
      {/* Top Banner & Ancient Aesthetic Header */}
      <header className="border-b border-stone-800 bg-stone-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-400/50 shadow-md flex items-center justify-center text-amber-100 font-serif font-bold text-xl select-none">
              算
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-serif font-bold text-stone-100 tracking-wide">
                  Suanpan 2/5
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Hardware Analógico Matricial
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Simulador de Álgebra Lineal en Ábaco Chino Tradicional • Método Fangcheng (方程)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsManualOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 hover:text-white rounded-xl border border-stone-700 transition-colors shadow-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Manual y Reglas</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* System Definition Section */}
        <SystemInputForm
          dimension={dimension}
          matrix={matrix}
          onDimensionChange={handleDimensionChange}
          onMatrixChange={setMatrix}
          onSolve={handleSolve}
          onOpenManual={() => setIsManualOpen(true)}
        />

        {/* Step Controls & Timeline Playback */}
        <StepControls
          steps={steps}
          currentStepIndex={currentStepIndex}
          onStepChange={(idx) => {
            setIsPlaying(false);
            setCurrentStepIndex(idx);
          }}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          playbackSpeed={playbackSpeed}
          onSpeedChange={setPlaybackSpeed}
        />

        {/* Interactive Virtual Suanpan Board */}
        <div className="relative">
          {isManualTweak && (
            <div className="mb-3 p-2.5 bg-amber-500/15 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs text-amber-200">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <strong>Modo Manipulación Libre Activo:</strong> Has movido cuentas manualmente. Haz clic en un paso del control superior para volver a la secuencia guiada de Gauss.
              </span>
              <button
                onClick={() => {
                  setIsManualTweak(false);
                  setCurrentAbacusState(cloneAbacusState(currentStep.abacusState));
                  setCustomAsciiReport('');
                }}
                className="font-mono text-[11px] underline hover:text-amber-100"
              >
                Restaurar Paso {currentStepIndex + 1}
              </button>
            </div>
          )}

          <SuanpanBoard
            abacusState={currentAbacusState}
            activeRowIndices={isManualTweak ? [] : currentStep.activeRowIndices}
            activeVariables={isManualTweak ? [] : currentStep.activeVariables}
            isInteractive={true}
            onUpdateBlock={handleUpdateBlock}
            onResetBoard={handleResetBoard}
          />
        </div>

        {/* Exact Terminal ASCII Report View */}
        <AsciiReportView
          currentStep={activeReportStep}
          allSteps={steps}
        />
      </main>

      {/* Educational Hardware Manual Modal */}
      <HardwareManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
      />
    </div>
  );
}

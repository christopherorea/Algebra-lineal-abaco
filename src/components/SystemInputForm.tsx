import React, { useState } from 'react';
import { PRESET_SYSTEMS } from '../utils/gaussianSolver';
import { EquationPreset } from '../types/suanpan';
import { Calculator, Dices, Play, RefreshCw, BookOpen } from 'lucide-react';

interface SystemInputFormProps {
  dimension: 2 | 3;
  matrix: number[][];
  onDimensionChange: (dim: 2 | 3) => void;
  onMatrixChange: (newMatrix: number[][]) => void;
  onSolve: () => void;
  onOpenManual: () => void;
}

export const SystemInputForm: React.FC<SystemInputFormProps> = ({
  dimension,
  matrix,
  onDimensionChange,
  onMatrixChange,
  onSolve,
  onOpenManual,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('jiuzhang-fangcheng');

  const handlePresetSelect = (preset: EquationPreset) => {
    setSelectedPresetId(preset.id);
    onDimensionChange(preset.dimension);
    onMatrixChange(preset.equations.matrix.map((r) => [...r]));
  };

  const handleCellChange = (rIdx: number, cIdx: number, valStr: string) => {
    const parsed = parseInt(valStr, 10);
    const val = isNaN(parsed) ? 0 : parsed;
    const newM = matrix.map((r, i) =>
      i === rIdx ? r.map((c, j) => (j === cIdx ? val : c)) : [...r]
    );
    onMatrixChange(newM);
    setSelectedPresetId(''); // custom
  };

  const handleGenerateRandom = () => {
    // Generate clean integer solvable system
    const dim = dimension;
    const vars = dim === 2 ? [1 + Math.floor(Math.random() * 5), 1 + Math.floor(Math.random() * 5)] : [1 + Math.floor(Math.random() * 4), 1 + Math.floor(Math.random() * 4), 1 + Math.floor(Math.random() * 4)];
    
    const newM: number[][] = [];
    for (let i = 0; i < dim; i++) {
      const coeffs: number[] = [];
      let sum = 0;
      for (let j = 0; j < dim; j++) {
        // Random coeff between -3 and 4, non-zero
        let c = Math.floor(Math.random() * 7) - 3;
        if (c === 0) c = 1;
        coeffs.push(c);
        sum += c * vars[j];
      }
      coeffs.push(sum);
      newM.push(coeffs);
    }
    onMatrixChange(newM);
    setSelectedPresetId('');
  };

  const activePreset = PRESET_SYSTEMS.find((p) => p.id === selectedPresetId);

  return (
    <div className="w-full bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-serif font-bold text-stone-100">
            Definición del Sistema Lineal
          </h2>
        </div>

        {/* Dimension selector & Manual button */}
        <div className="flex items-center gap-2">
          <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => {
                onDimensionChange(2);
                const p2 = PRESET_SYSTEMS.find((p) => p.dimension === 2);
                if (p2) handlePresetSelect(p2);
              }}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-colors ${
                dimension === 2
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Matriz 2x2
            </button>
            <button
              onClick={() => {
                onDimensionChange(3);
                const p3 = PRESET_SYSTEMS.find((p) => p.dimension === 3);
                if (p3) handlePresetSelect(p3);
              }}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-colors ${
                dimension === 3
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Matriz 3x3
            </button>
          </div>

          <button
            onClick={onOpenManual}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors"
            title="Manual didáctico de hardware y método Fangcheng"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Manual Suanpan</span>
          </button>
        </div>
      </div>

      {/* Presets List */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-2">
          Problemas Históricos y Preconfigurados:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {PRESET_SYSTEMS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`text-left p-2.5 rounded-xl border transition-all text-xs ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 text-stone-100 shadow-xs'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="truncate">{preset.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-amber-300 ml-1 shrink-0">
                    {preset.dimension}x{preset.dimension}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 truncate">
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activePreset?.historicalContext && (
        <div className="text-xs text-amber-200/90 bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl flex items-start gap-2">
          <div className="text-amber-400 font-bold shrink-0">📜</div>
          <div>{activePreset.historicalContext}</div>
        </div>
      )}

      {/* Equations Matrix Inputs Grid */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-stone-400 font-bold">
            Coeficientes de Ecuaciones (Filas de Memoria)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateRandom}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-lg border border-stone-700 transition-colors"
              title="Generar sistema aleatorio con solución entera"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span>Aleatorio Entero</span>
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {matrix.map((row, rIdx) => {
            return (
              <div
                key={rIdx}
                className="flex flex-wrap items-center gap-2 bg-stone-900/80 p-2 rounded-lg border border-stone-800/80"
              >
                <span className="text-xs font-mono font-bold text-amber-400 min-w-[55px]">
                  Fila {rIdx + 1}:
                </span>

                {/* Variable X */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={row[0]}
                    onChange={(e) => handleCellChange(rIdx, 0, e.target.value)}
                    className="w-14 sm:w-16 bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-center font-mono text-xs text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="font-mono text-xs text-stone-300 font-bold">X</span>
                </div>

                <span className="text-stone-500 font-bold">+</span>

                {/* Variable Y */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={row[1]}
                    onChange={(e) => handleCellChange(rIdx, 1, e.target.value)}
                    className="w-14 sm:w-16 bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-center font-mono text-xs text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="font-mono text-xs text-stone-300 font-bold">Y</span>
                </div>

                {dimension === 3 && (
                  <>
                    <span className="text-stone-500 font-bold">+</span>
                    {/* Variable Z */}
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={row[2]}
                        onChange={(e) => handleCellChange(rIdx, 2, e.target.value)}
                        className="w-14 sm:w-16 bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-center font-mono text-xs text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <span className="font-mono text-xs text-stone-300 font-bold">Z</span>
                    </div>
                  </>
                )}

                <span className="text-amber-400 font-bold font-mono">=</span>

                {/* Result R */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={dimension === 3 ? row[3] : row[2]}
                    onChange={(e) =>
                      handleCellChange(rIdx, dimension === 3 ? 3 : 2, e.target.value)
                    }
                    className="w-16 sm:w-20 bg-stone-950 border border-amber-600/60 rounded-lg px-2 py-1 text-center font-mono text-xs font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="font-mono text-xs text-amber-400 font-bold">R</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action CTA: Simulate Gauss Elimination on Suanpan */}
      <button
        onClick={onSolve}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-serif font-bold text-sm sm:text-base rounded-xl shadow-lg transition-all duration-200 active:scale-[0.99] cursor-pointer"
      >
        <Play className="w-4 h-4 fill-stone-950" />
        <span>Traducir y Resolver en Hardware Suanpan 2/5 (Gauss Analógico)</span>
      </button>
    </div>
  );
};

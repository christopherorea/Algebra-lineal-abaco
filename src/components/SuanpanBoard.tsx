import React from 'react';
import { AbacusState, MemoryBlock, MemoryRow, RodState } from '../types/suanpan';
import { SuanpanRod } from './SuanpanRod';
import { numberToRodState } from '../utils/suanpanPhysics';
import { Sparkles, RotateCcw } from 'lucide-react';

interface SuanpanBoardProps {
  abacusState: AbacusState;
  activeRowIndices?: number[];
  activeVariables?: ('X' | 'Y' | 'Z' | 'R')[];
  isInteractive?: boolean;
  onUpdateBlock?: (
    rowIndex: number,
    varName: 'X' | 'Y' | 'Z' | 'R',
    updatedBlock: MemoryBlock
  ) => void;
  onResetBoard?: () => void;
}

export const SuanpanBoard: React.FC<SuanpanBoardProps> = ({
  abacusState,
  activeRowIndices = [],
  activeVariables = [],
  isInteractive = true,
  onUpdateBlock,
  onResetBoard,
}) => {
  const vars: ('X' | 'Y' | 'Z')[] =
    abacusState.dimension === 2 ? ['X', 'Y'] : ['X', 'Y', 'Z'];
  const blockKeys: ('X' | 'Y' | 'Z' | 'R')[] = [...vars, 'R'];

  const handleBeadClick = (
    rowIdx: number,
    varKey: 'X' | 'Y' | 'Z' | 'R',
    wireKey: 'S' | 'C' | 'D' | 'U',
    deck: 'cielo' | 'tierra',
    beadIndex: number
  ) => {
    if (!onUpdateBlock) return;
    const row = abacusState.rows.find((r) => r.rowIndex === rowIdx);
    if (!row) return;
    const block = row.blocks[varKey];
    if (!block) return;

    const newWires = { ...block.wires };

    if (wireKey === 'S') {
      // Toggle sign: 0 -> 1 -> 0
      newWires.S = newWires.S === 0 ? 1 : 0;
    } else {
      const rod = { ...newWires[wireKey] };
      if (deck === 'cielo') {
        // Toggle heaven bead
        // beadIndex 0 is top (cielo >= 2), 1 is lower cielo (cielo >= 1)
        if (beadIndex === 1) {
          rod.cielo = rod.cielo >= 1 ? 0 : 1;
        } else {
          rod.cielo = rod.cielo === 2 ? 1 : 2;
        }
      } else {
        // Tierra beads
        // beadIndex (0..4): toggle active count
        const clickedLevel = beadIndex + 1;
        if (rod.tierra === clickedLevel) {
          rod.tierra = clickedLevel - 1;
        } else {
          rod.tierra = clickedLevel;
        }
      }
      newWires[wireKey] = rod;
    }

    const cVal = newWires.C.cielo * 5 + newWires.C.tierra;
    const dVal = newWires.D.cielo * 5 + newWires.D.tierra;
    const uVal = newWires.U.cielo * 5 + newWires.U.tierra;
    const rawVal = cVal * 100 + dVal * 10 + uVal;
    const netValue = newWires.S === 1 ? -rawVal : rawVal;
    const isOverloaded = cVal > 9 || dVal > 9 || uVal > 9;

    onUpdateBlock(rowIdx, varKey, {
      variable: varKey,
      wires: newWires,
      netValue,
      isOverloaded,
    });
  };

  return (
    <div className="w-full bg-stone-900 border-2 border-stone-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative Traditional Brass Corners */}
      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-500/60 pointer-events-none rounded-tl-sm" />
      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-500/60 pointer-events-none rounded-tr-sm" />
      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-500/60 pointer-events-none rounded-bl-sm" />
      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-500/60 pointer-events-none rounded-br-sm" />

      {/* Board Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-lg">
            算
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-serif font-semibold text-stone-100 flex items-center gap-2">
              Tablero Analógico Suanpan 2/5 (算盘)
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Formato {abacusState.dimension}x{abacusState.dimension}
              </span>
            </h2>
            <p className="text-xs text-stone-400">
              Arquitectura de hardware: 4 hilos por bloque [S, C, D, U] • Capacidad extendida de 15 cuentas por hilo
            </p>
          </div>
        </div>

        {onResetBoard && (
          <button
            onClick={onResetBoard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 hover:text-white rounded-lg border border-stone-700 transition-colors shadow-xs"
            title="Despejar todas las cuentas de las filas a cero"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Despejar Cuentas</span>
          </button>
        )}
      </div>

      {/* Rows Container */}
      <div className="space-y-6">
        {abacusState.rows.map((row) => {
          const isRowActive = activeRowIndices.includes(row.rowIndex);

          return (
            <div
              key={row.rowIndex}
              id={`suanpan-row-${row.rowIndex}`}
              className={`rounded-xl border transition-all duration-300 ${
                isRowActive
                  ? 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
                  : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700'
              } p-3 sm:p-4`}
            >
              {/* Row Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isRowActive
                        ? 'bg-amber-500 text-stone-950 shadow-sm'
                        : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    Fila {row.rowIndex}
                  </span>
                  <span className="text-xs font-medium text-stone-300">
                    {row.label}
                  </span>
                  {isRowActive && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 animate-pulse">
                      <Sparkles className="w-3 h-3" /> Registro en operación
                    </span>
                  )}
                </div>

                {/* Mathematical Equation Preview for this row */}
                <div className="text-xs font-mono text-stone-400 hidden sm:block">
                  {formatEquationPreview(row, abacusState.dimension)}
                </div>
              </div>

              {/* Logical Blocks for Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {blockKeys.map((vKey) => {
                  const block = row.blocks[vKey];
                  if (!block) return null;
                  const isBlockActive =
                    isRowActive &&
                    (activeVariables.length === 0 || activeVariables.includes(vKey));

                  const isResult = vKey === 'R';

                  return (
                    <div
                      key={vKey}
                      className={`relative rounded-xl border p-2.5 transition-all duration-200 ${
                        isResult
                          ? 'bg-stone-900/90 border-amber-700/40'
                          : isBlockActive
                          ? 'bg-stone-900/90 border-amber-500/60 shadow-xs'
                          : 'bg-stone-900/50 border-stone-800/80'
                      }`}
                    >
                      {/* Block Header */}
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-800/80">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-mono font-bold px-1.5 py-0.2 rounded ${
                              isResult
                                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                                : 'bg-stone-800 text-stone-300'
                            }`}
                          >
                            {isResult ? 'Bloque R (Res)' : `Bloque ${vKey}`}
                          </span>
                        </div>

                        {/* Net Value Badge */}
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs font-mono font-bold ${
                              block.netValue < 0
                                ? 'text-rose-400'
                                : block.netValue === 0
                                ? 'text-stone-500'
                                : 'text-emerald-400'
                            }`}
                          >
                            {block.netValue > 0 ? `+${block.netValue}` : block.netValue}
                          </span>
                        </div>
                      </div>

                      {/* 4 Rods: S, C, D, U */}
                      <div className="grid grid-cols-4 gap-1 sm:gap-1.5 justify-items-center">
                        {/* Wire S (Sign) */}
                        <SuanpanRod
                          id={`rod-${row.rowIndex}-${vKey}-S`}
                          wireType="S"
                          label="S"
                          state={numberToRodState(0)}
                          signValue={block.wires.S}
                          isInteractive={isInteractive}
                          highlight={isBlockActive}
                          onBeadClick={(_deck, _idx) =>
                            handleBeadClick(row.rowIndex, vKey, 'S', _deck, _idx)
                          }
                        />

                        {/* Wire C (Hundreds) */}
                        <SuanpanRod
                          id={`rod-${row.rowIndex}-${vKey}-C`}
                          wireType="C"
                          label="C"
                          state={block.wires.C}
                          isInteractive={isInteractive}
                          highlight={isBlockActive}
                          onBeadClick={(deck, idx) =>
                            handleBeadClick(row.rowIndex, vKey, 'C', deck, idx)
                          }
                        />

                        {/* Wire D (Tens) */}
                        <SuanpanRod
                          id={`rod-${row.rowIndex}-${vKey}-D`}
                          wireType="D"
                          label="D"
                          state={block.wires.D}
                          isInteractive={isInteractive}
                          highlight={isBlockActive}
                          onBeadClick={(deck, idx) =>
                            handleBeadClick(row.rowIndex, vKey, 'D', deck, idx)
                          }
                        />

                        {/* Wire U (Units) */}
                        <SuanpanRod
                          id={`rod-${row.rowIndex}-${vKey}-U`}
                          wireType="U"
                          label="U"
                          state={block.wires.U}
                          isInteractive={isInteractive}
                          highlight={isBlockActive}
                          onBeadClick={(deck, idx) =>
                            handleBeadClick(row.rowIndex, vKey, 'U', deck, idx)
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend & Abacus Anatomy Footnote */}
      <div className="mt-6 pt-4 border-t border-stone-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-stone-400">
        <div className="flex items-start gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
          <span>
            <strong className="text-stone-300">Cielo (天):</strong> 2 cuentas superiores. Cada una vale <strong className="text-amber-300">5</strong> al empujarse hacia la viga central.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-600 mt-1 shrink-0" />
          <span>
            <strong className="text-stone-300">Tierra (地):</strong> 5 cuentas inferiores. Cada una vale <strong className="text-amber-300">1</strong> al subir hacia la viga central.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
          <span>
            <strong className="text-stone-300">Hilo S (Signo):</strong> 0 = Positivo, 1 = Negativo. Capacidad máxima por alambre = 15 cuentas.
          </span>
        </div>
      </div>
    </div>
  );
};

function formatEquationPreview(row: MemoryRow, dim: 2 | 3): string {
  const x = row.blocks.X.netValue;
  const y = row.blocks.Y.netValue;
  const z = dim === 3 ? row.blocks.Z.netValue : 0;
  const r = row.blocks.R.netValue;

  let str = `${x}X`;
  str += y >= 0 ? ` + ${y}Y` : ` - ${Math.abs(y)}Y`;
  if (dim === 3) {
    str += z >= 0 ? ` + ${z}Z` : ` - ${Math.abs(z)}Z`;
  }
  str += ` = ${r}`;
  return str;
}

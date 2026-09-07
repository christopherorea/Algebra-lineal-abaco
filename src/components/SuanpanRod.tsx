import React from 'react';
import { RodState } from '../types/suanpan';
import { soundPlayer } from '../utils/audio';

interface SuanpanRodProps {
  id?: string;
  wireType: 'S' | 'C' | 'D' | 'U';
  label: string;
  state: RodState;
  signValue?: number; // for wireType === 'S'
  isInteractive?: boolean;
  onBeadClick?: (deck: 'cielo' | 'tierra', beadIndex: number) => void;
  highlight?: boolean;
}

export const SuanpanRod: React.FC<SuanpanRodProps> = ({
  id,
  wireType,
  label,
  state,
  signValue = 0,
  isInteractive = true,
  onBeadClick,
  highlight = false,
}) => {
  const isSign = wireType === 'S';
  const totalValue = isSign ? signValue : state.cielo * 5 + state.tierra;
  const isOverloaded = !isSign && totalValue > 9;

  // Handle upper deck (cielo) beads: 2 beads total
  // When active, they slide down to touch the central beam
  const cieloActiveCount = state.cielo; // 0, 1, or 2

  // Handle lower deck (tierra) beads: 5 beads total
  // When active, they slide up to touch the central beam
  const tierraActiveCount = isSign ? signValue : state.tierra; // 0..5

  const handleUpperClick = (index: number) => {
    if (!isInteractive) return;
    soundPlayer.playBeadClick();
    if (onBeadClick) {
      onBeadClick('cielo', index);
    }
  };

  const handleLowerClick = (index: number) => {
    if (!isInteractive) return;
    soundPlayer.playBeadClick();
    if (onBeadClick) {
      onBeadClick('tierra', index);
    }
  };

  return (
    <div
      id={id}
      className={`relative flex flex-col items-center px-1.5 py-2 rounded-lg transition-colors duration-200 select-none ${
        highlight
          ? 'bg-amber-500/10 ring-1 ring-amber-400/40'
          : 'bg-stone-900/30 hover:bg-stone-900/50'
      }`}
    >
      {/* Rod Wire Header Label */}
      <div className="flex flex-col items-center mb-1 text-center">
        <span
          className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
            isSign
              ? signValue === 1
                ? 'bg-rose-900/60 text-rose-300 ring-1 ring-rose-500/50'
                : 'bg-emerald-900/60 text-emerald-300 ring-1 ring-emerald-500/50'
              : highlight
              ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/50'
              : 'bg-stone-800 text-stone-300'
          }`}
        >
          {label}
        </span>
      </div>

      {/* Frame / Rod Container */}
      <div className="relative w-8 sm:w-9 h-[220px] bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 rounded-sm border border-stone-800/80 shadow-inner flex flex-col items-center justify-between overflow-hidden">
        {/* Brass Rod Line (Alambre vertical) */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700 shadow-sm z-0" />

        {/* ---------------- UPPER DECK (CIELO) ---------------- */}
        <div className="relative z-10 w-full h-[62px] flex flex-col justify-start items-center pt-1 pb-1">
          {isSign ? (
            /* For sign rod: upper deck is inactive/reserved */
            <div className="flex flex-col items-center justify-center h-full text-[9px] text-stone-600 font-mono italic">
              —
            </div>
          ) : (
            <>
              {/* Bead 1 (Topmost) */}
              <div
                onClick={() => handleUpperClick(0)}
                className={`transition-all duration-300 cursor-pointer ${
                  cieloActiveCount >= 2 ? 'translate-y-[26px]' : 'translate-y-0'
                }`}
                title="Cuenta de Cielo 1 (Vale 5)"
              >
                <SuanpanBeadItem
                  deck="cielo"
                  isActive={cieloActiveCount >= 2}
                  value={5}
                />
              </div>

              {/* Bead 2 (Closer to beam) */}
              <div
                onClick={() => handleUpperClick(1)}
                className={`transition-all duration-300 cursor-pointer ${
                  cieloActiveCount >= 1 ? 'translate-y-[24px]' : 'translate-y-0'
                }`}
                title="Cuenta de Cielo 2 (Vale 5)"
              >
                <SuanpanBeadItem
                  deck="cielo"
                  isActive={cieloActiveCount >= 1}
                  value={5}
                />
              </div>
            </>
          )}
        </div>

        {/* ---------------- CENTRAL BEAM (VIGA CENTRAL / 梁) ---------------- */}
        <div className="relative z-20 w-full h-[18px] bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-y border-amber-500/40 shadow-md flex items-center justify-center">
          {/* Unit ivory marker dot */}
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              wireType === 'U'
                ? 'bg-amber-100 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                : 'bg-stone-500/50'
            }`}
          />
        </div>

        {/* ---------------- LOWER DECK (TIERRA) ---------------- */}
        <div className="relative z-10 w-full h-[132px] flex flex-col justify-end items-center pb-1 pt-1">
          {isSign ? (
            /* Sign rod has 1 earth bead: at beam = 1 (Negative), at bottom = 0 (Positive) */
            <div className="flex flex-col justify-end items-center h-full pb-2">
              <div
                onClick={() => handleLowerClick(0)}
                className={`transition-all duration-300 cursor-pointer ${
                  signValue === 1 ? '-translate-y-[70px]' : 'translate-y-0'
                }`}
                title="Alambre de Signo: Cuenta abajo=0 (+), Arriba contra viga=1 (-)"
              >
                <SuanpanBeadItem
                  deck="tierra"
                  isActive={signValue === 1}
                  value={1}
                  isSignBead
                />
              </div>
            </div>
          ) : (
            /* 5 earth beads */
            <div className="flex flex-col justify-end items-center gap-[2px] w-full">
              {[0, 1, 2, 3, 4].map((idx) => {
                // Bead 0 is topmost earth bead (closest to beam)
                // Bead 4 is bottommost earth bead
                const isActive = tierraActiveCount > idx;
                // Active beads slide UP towards the beam
                return (
                  <div
                    key={idx}
                    onClick={() => handleLowerClick(idx)}
                    className={`transition-all duration-300 cursor-pointer ${
                      isActive ? '-translate-y-[24px]' : 'translate-y-0'
                    }`}
                    title={`Cuenta de Tierra ${idx + 1} (Vale 1)`}
                  >
                    <SuanpanBeadItem
                      deck="tierra"
                      isActive={isActive}
                      value={1}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sub-wire readout info */}
      <div className="mt-1 flex flex-col items-center">
        <span
          className={`font-mono text-xs font-bold ${
            isSign
              ? signValue === 1
                ? 'text-rose-400'
                : 'text-emerald-400'
              : isOverloaded
              ? 'text-amber-300'
              : 'text-stone-300'
          }`}
        >
          {isSign ? (signValue === 0 ? '+ (0)' : '- (1)') : totalValue}
        </span>
        <span className="text-[9px] font-mono text-stone-500 whitespace-nowrap">
          {isSign
            ? signValue === 0
              ? 'Pos'
              : 'Neg'
            : `C:${state.cielo}|T:${state.tierra}`}
        </span>
        {isOverloaded && (
          <span className="text-[8px] font-mono uppercase bg-amber-500/20 text-amber-300 px-1 rounded ring-1 ring-amber-500/40 mt-0.5 animate-pulse">
            15-Cap
          </span>
        )}
      </div>
    </div>
  );
};

interface SuanpanBeadItemProps {
  deck: 'cielo' | 'tierra';
  isActive: boolean;
  value: number;
  isSignBead?: boolean;
}

const SuanpanBeadItem: React.FC<SuanpanBeadItemProps> = ({
  deck,
  isActive,
  isSignBead,
}) => {
  // Bi-conical classic Chinese Suanpan bead shape:
  // Rounded polygon diamond look with warm wood grain finish
  let beadGradient = isActive
    ? isSignBead
      ? 'from-rose-700 via-rose-500 to-rose-800'
      : deck === 'cielo'
      ? 'from-amber-600 via-amber-400 to-amber-700'
      : 'from-amber-700 via-amber-500 to-amber-800'
    : 'from-stone-700 via-stone-600 to-stone-800';

  let ringColor = isActive
    ? isSignBead
      ? 'ring-rose-400/80 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
      : 'ring-amber-300/80 shadow-[0_0_8px_rgba(245,158,11,0.35)]'
    : 'ring-stone-950/70 opacity-75 hover:opacity-100';

  return (
    <div
      className={`w-7 h-[16px] sm:w-8 sm:h-[17px] rounded-[5px] bg-gradient-to-b ${beadGradient} ring-1 ${ringColor} shadow-md flex items-center justify-center relative overflow-hidden transition-transform duration-150 hover:scale-105 active:scale-95`}
    >
      {/* Central diamond ridge highlight for bi-conical look */}
      <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-[1px] bg-white/40 shadow-xs pointer-events-none" />
      {/* Inner bead hole around brass rod */}
      <div className="w-1.5 h-1.5 rounded-full bg-stone-950/80 shadow-inner" />
    </div>
  );
};

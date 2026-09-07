import { AbacusState, BlockWires, MemoryBlock, MemoryRow, RodState } from '../types/suanpan';

/**
 * Maximum capacity of a Suanpan rod in 2/5 format:
 * 2 beads in Heaven (each worth 5) + 5 beads in Earth (each worth 1) = 15.
 */
export const MAX_ROD_CAPACITY = 15;

/**
 * Converts a non-negative integer (0-15) into a Suanpan rod state.
 * Uses standard canonical mapping for 0-9:
 *   cielo = Math.floor(val / 5) (0 or 1)
 *   tierra = val % 5 (0-4)
 * For intermediate overloads (10-15):
 *   cielo = 2 (both heaven beads active, worth 10)
 *   tierra = val - 10 (0-5 earth beads active)
 */
export function numberToRodState(value: number): RodState {
  const clamped = Math.max(0, Math.min(MAX_ROD_CAPACITY, Math.round(value)));
  if (clamped <= 9) {
    return {
      cielo: Math.floor(clamped / 5),
      tierra: clamped % 5,
    };
  }
  // Overloaded intermediate state (10 to 15)
  return {
    cielo: 2,
    tierra: clamped - 10,
  };
}

/**
 * Reads the numerical value registered on a rod (0-15).
 */
export function rodStateToNumber(rod: RodState): number {
  return rod.cielo * 5 + rod.tierra;
}

/**
 * Encodes a signed number (e.g. -125 to +999) into the 4 fixed wires: S, C, D, U.
 * Supports optional manual override of C, D, U values for un-normalized intermediate steps.
 */
export function encodeNumberToBlockWires(
  val: number,
  overrides?: { C?: number; D?: number; U?: number }
): BlockWires {
  const sign = val < 0 ? 1 : 0;
  const abs = Math.abs(Math.round(val));

  const cVal = overrides?.C !== undefined ? overrides.C : Math.floor((abs % 1000) / 100);
  const dVal = overrides?.D !== undefined ? overrides.D : Math.floor((abs % 100) / 10);
  const uVal = overrides?.U !== undefined ? overrides.U : abs % 10;

  return {
    S: sign,
    C: numberToRodState(cVal),
    D: numberToRodState(dVal),
    U: numberToRodState(uVal),
  };
}

/**
 * Computes net signed numerical value of a block from its wires.
 */
export function decodeBlockWiresToNumber(wires: BlockWires): number {
  const c = rodStateToNumber(wires.C);
  const d = rodStateToNumber(wires.D);
  const u = rodStateToNumber(wires.U);
  const rawAbs = c * 100 + d * 10 + u;
  return wires.S === 1 ? -rawAbs : rawAbs;
}

/**
 * Formats a rod state to the user's requested format: "Cielo:X|Tierra:Y"
 */
export function formatRodAscii(rod: RodState): string {
  return `Cielo:${rod.cielo}|Tierra:${rod.tierra}`;
}

/**
 * Creates a MemoryBlock from a signed number or custom wire configuration.
 */
export function createMemoryBlock(
  variable: 'X' | 'Y' | 'Z' | 'R',
  value: number,
  overrides?: { C?: number; D?: number; U?: number }
): MemoryBlock {
  const wires = encodeNumberToBlockWires(value, overrides);
  const cVal = rodStateToNumber(wires.C);
  const dVal = rodStateToNumber(wires.D);
  const uVal = rodStateToNumber(wires.U);
  const isOverloaded = cVal > 9 || dVal > 9 || uVal > 9;

  return {
    variable,
    wires,
    netValue: decodeBlockWiresToNumber(wires),
    isOverloaded,
  };
}

/**
 * Generates the strictly formatted ASCII report according to user specifications:
 *
 * [DESCRIPCIÓN DEL MOVIMIENTO FÍSICO EN EL TABLERO]
 * ...
 *
 * [ESTADO VISUAL DEL ÁBACO]
 * Fila 1 (Ecuación 1):
 *   Bloque X: [S: cuentas_activas] [C: cielo_act/tierra_act] [D: cielo_act/tierra_act] [U: cielo_act/tierra_act] (Valor neto)
 *   Bloque Y: ...
 *   Bloque R: ...
 * Fila 2 (Ecuación 2):
 *   ...
 */
export function generateVisualAsciiReport(
  physicalDescription: string,
  state: AbacusState
): string {
  const vars: ('X' | 'Y' | 'Z')[] = state.dimension === 2 ? ['X', 'Y'] : ['X', 'Y', 'Z'];
  const blockKeys: ('X' | 'Y' | 'Z' | 'R')[] = [...vars, 'R'];

  const lines: string[] = [];
  lines.push('[DESCRIPCIÓN DEL MOVIMIENTO FÍSICO EN EL TABLERO]');
  lines.push(physicalDescription.trim());
  lines.push('');
  lines.push('[ESTADO VISUAL DEL ÁBACO]');

  state.rows.forEach((row) => {
    lines.push(`Fila ${row.rowIndex} (${row.label.includes('(') ? row.label : `Ecuación ${row.rowIndex}`}):`);
    blockKeys.forEach((vKey) => {
      const block = row.blocks[vKey];
      if (!block) return;
      const sWire = `[S: ${block.wires.S}]`;
      const cWire = `[C: ${formatRodAscii(block.wires.C)}]`;
      const dWire = `[D: ${formatRodAscii(block.wires.D)}]`;
      const uWire = `[U: ${formatRodAscii(block.wires.U)}]`;
      const signSymbol = block.wires.S === 1 ? '-' : '+';
      const absVal = Math.abs(block.netValue);
      const net = `(Valor neto: ${signSymbol}${absVal}${block.isOverloaded ? ' *Intermedio/Sobrecarga*' : ''})`;
      lines.push(`  Bloque ${vKey}: ${sWire} ${cWire} ${dWire} ${uWire} ${net}`);
    });
  });

  return lines.join('\n');
}

/**
 * Deep clone an AbacusState so mutations during simulation don't bleed across steps.
 */
export function cloneAbacusState(state: AbacusState): AbacusState {
  return {
    dimension: state.dimension,
    rows: state.rows.map((r) => ({
      rowIndex: r.rowIndex,
      label: r.label,
      blocks: {
        X: {
          variable: 'X',
          wires: {
            S: r.blocks.X.wires.S,
            C: { ...r.blocks.X.wires.C },
            D: { ...r.blocks.X.wires.D },
            U: { ...r.blocks.X.wires.U },
          },
          netValue: r.blocks.X.netValue,
          isOverloaded: r.blocks.X.isOverloaded,
        },
        Y: {
          variable: 'Y',
          wires: {
            S: r.blocks.Y.wires.S,
            C: { ...r.blocks.Y.wires.C },
            D: { ...r.blocks.Y.wires.D },
            U: { ...r.blocks.Y.wires.U },
          },
          netValue: r.blocks.Y.netValue,
          isOverloaded: r.blocks.Y.isOverloaded,
        },
        Z: {
          variable: 'Z',
          wires: {
            S: r.blocks.Z.wires.S,
            C: { ...r.blocks.Z.wires.C },
            D: { ...r.blocks.Z.wires.D },
            U: { ...r.blocks.Z.wires.U },
          },
          netValue: r.blocks.Z.netValue,
          isOverloaded: r.blocks.Z.isOverloaded,
        },
        R: {
          variable: 'R',
          wires: {
            S: r.blocks.R.wires.S,
            C: { ...r.blocks.R.wires.C },
            D: { ...r.blocks.R.wires.D },
            U: { ...r.blocks.R.wires.U },
          },
          netValue: r.blocks.R.netValue,
          isOverloaded: r.blocks.R.isOverloaded,
        },
      },
    })),
  };
}

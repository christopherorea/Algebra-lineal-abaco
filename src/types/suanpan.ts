export interface RodState {
  cielo: number; // 0, 1, or 2 active beads against beam (each worth 5)
  tierra: number; // 0, 1, 2, 3, 4, or 5 active beads against beam (each worth 1)
}

export type WireName = 'S' | 'C' | 'D' | 'U';

export interface BlockWires {
  S: number; // 0 = Positivo, 1 = Negativo (Sign rod)
  C: RodState; // Centenas (0-15)
  D: RodState; // Decenas (0-15)
  U: RodState; // Unidades (0-15)
}

export interface MemoryBlock {
  variable: 'X' | 'Y' | 'Z' | 'R';
  wires: BlockWires;
  netValue: number; // Signed net value represented
  isOverloaded?: boolean; // True if any rod holds > 9 (using the 15-capacity buffer)
}

export interface MemoryRow {
  rowIndex: number; // 1-indexed (1, 2, 3)
  label: string; // e.g. "Fila 1 (Ecuación 1)"
  blocks: Record<'X' | 'Y' | 'Z' | 'R', MemoryBlock>;
}

export interface AbacusState {
  dimension: 2 | 3;
  rows: MemoryRow[];
}

export type StepPhase =
  | 'INITIAL_LOAD'
  | 'ROW_SWAP'
  | 'ROW_SCALE'
  | 'OVERLOAD_ACCUMULATION'
  | 'CARRY_NORMALIZATION'
  | 'ROW_SUBTRACTION'
  | 'BORROW_SIGN_INVERSION'
  | 'PIVOT_ISOLATION'
  | 'BACK_SUBSTITUTION'
  | 'FINAL_SOLUTION';

export interface SimulationStep {
  stepIndex: number;
  totalSteps: number;
  phase: StepPhase;
  title: string;
  physicalDescription: string;
  abacusState: AbacusState;
  activeRowIndices: number[]; // 1-indexed rows involved
  activeVariables: ('X' | 'Y' | 'Z' | 'R')[];
  asciiReport: string;
  matrixSnapshot: number[][]; // Raw matrix snapshot [rows x (vars + 1)]
  explanation: string;
}

export interface EquationPreset {
  id: string;
  name: string;
  dimension: 2 | 3;
  description: string;
  historicalContext?: string;
  equations: {
    matrix: number[][]; // 2x3 or 3x4
  };
}

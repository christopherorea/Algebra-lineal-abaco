import {
  AbacusState,
  EquationPreset,
  MemoryBlock,
  MemoryRow,
  SimulationStep,
  StepPhase,
} from '../types/suanpan';
import {
  cloneAbacusState,
  createMemoryBlock,
  generateVisualAsciiReport,
  MAX_ROD_CAPACITY,
  rodStateToNumber,
} from './suanpanPhysics';

export const PRESET_SYSTEMS: EquationPreset[] = [
  {
    id: 'jiuzhang-fangcheng',
    name: 'Jiuzhang Suanshu (Los Nueve Capítulos - Han)',
    dimension: 3,
    description: 'Problema 1 del Capítulo 8 "Fangcheng" (~179 d.C.): Cereal de tres calidades (Superior X, Media Y, Inferior Z).',
    historicalContext:
      'El método Fangcheng (方程) usaba varillas de cálculo colocadas en un tablero matricial. Se eliminaban coeficientes restando columnas/filas sucesivamente, exactamente el principio de la eliminación de Gauss, pero 1800 años antes.',
    equations: {
      matrix: [
        [3, 2, 1, 39], // 3X + 2Y + 1Z = 39
        [2, 3, 1, 34], // 2X + 3Y + 1Z = 34
        [1, 2, 3, 26], // 1X + 2Y + 3Z = 26
      ],
    },
  },
  {
    id: 'standard-2x2',
    name: 'Sistema Clásico 2x2',
    dimension: 2,
    description: '2X + 3Y = 13  |  1X - 1Y = -1',
    historicalContext: 'Sistema fundamental para observar la resta de hilos, inversión del hilo de Signo S y sustitución.',
    equations: {
      matrix: [
        [2, 3, 13],
        [1, -1, -1],
      ],
    },
  },
  {
    id: 'negative-2x2',
    name: 'Sistema 2x2 con Signos Negativos',
    dimension: 2,
    description: '3X - 2Y = 7  |  4X + 1Y = 13',
    historicalContext: 'Muestra la gestión analógica del alambre de signo S (0=Positivo, 1=Negativo) en el Suanpan.',
    equations: {
      matrix: [
        [3, -2, 7],
        [4, 1, 13],
      ],
    },
  },
  {
    id: 'didactic-3x3',
    name: 'Sistema Didáctico 3x3 Equilibrado',
    dimension: 3,
    description: '1X + 2Y + 1Z = 8  |  2X - 1Y + 1Z = 3  |  3X + 1Y - 2Z = 1',
    historicalContext: 'Reducción matricial completa 3x3 con sobrecarga temporal de hasta 15 cuentas y acarreo.',
    equations: {
      matrix: [
        [1, 2, 1, 8],
        [2, -1, 1, 3],
        [3, 1, -2, 1],
      ],
    },
  },
  {
    id: 'simple-3x3',
    name: 'Sistema 3x3 Simétrico',
    dimension: 3,
    description: '2X + 1Y + 1Z = 7  |  1X + 2Y + 1Z = 8  |  1X + 1Y + 2Z = 9',
    historicalContext: 'Solución directa (X=1, Y=2, Z=3) ideal para seguir el flujo físico de cuentas.',
    equations: {
      matrix: [
        [2, 1, 1, 7],
        [1, 2, 1, 8],
        [1, 1, 2, 9],
      ],
    },
  },
];

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/**
 * Creates an initial AbacusState from an augmented matrix.
 */
export function buildInitialAbacusState(matrix: number[][], dim: 2 | 3): AbacusState {
  const rows: MemoryRow[] = [];

  for (let i = 0; i < dim; i++) {
    const rowIdx = i + 1;
    const rData = matrix[i];

    const blockX = createMemoryBlock('X', rData[0]);
    const blockY = createMemoryBlock('Y', rData[1]);
    const blockZ = dim === 3 ? createMemoryBlock('Z', rData[2]) : createMemoryBlock('Z', 0);
    const blockR = createMemoryBlock('R', dim === 3 ? rData[3] : rData[2]);

    rows.push({
      rowIndex: rowIdx,
      label: `Fila ${rowIdx} (Ecuación ${rowIdx})`,
      blocks: {
        X: blockX,
        Y: blockY,
        Z: blockZ,
        R: blockR,
      },
    });
  }

  return {
    dimension: dim,
    rows,
  };
}

/**
 * Generates didactic step-by-step Gaussian elimination on the Suanpan analog hardware.
 */
export function solveSystemStepByStep(inputMatrix: number[][], dim: 2 | 3): SimulationStep[] {
  const steps: SimulationStep[] = [];
  const M: number[][] = inputMatrix.map((row) => [...row]);
  let currentState = buildInitialAbacusState(M, dim);

  // Helper to append a step
  const addStep = (
    phase: StepPhase,
    title: string,
    physicalDescription: string,
    activeRows: number[],
    activeVars: ('X' | 'Y' | 'Z' | 'R')[],
    explanation: string
  ) => {
    const clonedState = cloneAbacusState(currentState);
    const asciiReport = generateVisualAsciiReport(physicalDescription, clonedState);
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0, // updated at the end
      phase,
      title,
      physicalDescription,
      abacusState: clonedState,
      activeRowIndices: activeRows,
      activeVariables: activeVars,
      asciiReport,
      matrixSnapshot: M.map((r) => [...r]),
      explanation,
    });
  };

  // ----------------------------------------------------
  // PASO 0: CARGA INICIAL
  // ----------------------------------------------------
  let loadDesc = `[CARGA INICIAL DE COEFICIENTES EN EL HARDWARE]\n`;
  loadDesc += `Se configuran las ${dim} Filas de Memoria del ábaco Suanpan 2/5.\n`;
  for (let i = 0; i < dim; i++) {
    loadDesc += `• Fila ${i + 1}: `;
    loadDesc += `Bloque X cargado con ${M[i][0]}, Bloque Y con ${M[i][1]}, `;
    if (dim === 3) loadDesc += `Bloque Z con ${M[i][2]}, `;
    loadDesc += `Bloque Resultado R con ${dim === 3 ? M[i][3] : M[i][2]}.\n`;
  }
  loadDesc += `En cada hilo/alambre, las cuentas de Cielo (valor 5) y Tierra (valor 1) se empujan hacia la viga central para representar la magnitud, y el hilo S registra el signo (0=Positivo, 1=Negativo).`;

  addStep(
    'INITIAL_LOAD',
    'Carga Inicial de Ecuaciones en el Suanpan',
    loadDesc,
    dim === 2 ? [1, 2] : [1, 2, 3],
    dim === 2 ? ['X', 'Y', 'R'] : ['X', 'Y', 'Z', 'R'],
    'Los coeficientes iniciales de las ecuaciones son representados físicamente sobre los alambres del ábaco.'
  );

  // ----------------------------------------------------
  // ELIMINACIÓN DE GAUSS (TRIANGULARIZACIÓN)
  // ----------------------------------------------------
  const numCols = dim; // variables to eliminate
  for (let k = 0; k < numCols - 1; k++) {
    const pivotVar = k === 0 ? 'X' : 'Y';

    // 1. Pivot Check & Row Swap if needed
    if (M[k][k] === 0) {
      let swapIdx = -1;
      for (let r = k + 1; r < dim; r++) {
        if (M[r][k] !== 0) {
          swapIdx = r;
          break;
        }
      }
      if (swapIdx !== -1) {
        // Swap rows in matrix
        const temp = M[k];
        M[k] = M[swapIdx];
        M[swapIdx] = temp;

        // Swap memory rows in currentState
        const tempBlocks = currentState.rows[k].blocks;
        currentState.rows[k].blocks = currentState.rows[swapIdx].blocks;
        currentState.rows[swapIdx].blocks = tempBlocks;

        const swapDesc = `[INTERCAMBIO FÍSICO DE FILAS]\nEl pivote de la variable ${pivotVar} en la Fila ${k + 1} es 0. Se transfiere físicamente la configuración completa de cuentas entre la Fila ${k + 1} y la Fila ${swapIdx + 1} para ubicar un pivote no nulo en el hilo principal.`;
        addStep(
          'ROW_SWAP',
          `Intercambio Fila ${k + 1} ↔ Fila ${swapIdx + 1}`,
          swapDesc,
          [k + 1, swapIdx + 1],
          [pivotVar],
          'Intercambio de registros de memoria analógica para asegurar un coeficiente pivote distinto de cero.'
        );
      }
    }

    const pivotVal = M[k][k];

    // 2. Eliminate variable in rows below pivot
    for (let i = k + 1; i < dim; i++) {
      const targetVal = M[i][k];
      if (targetVal === 0) continue;

      // Find integer multipliers: M[i] = M[i] * multTarget - M[k] * multPivot
      const common = gcd(pivotVal, targetVal);
      const multTarget = Math.abs(pivotVal) / common;
      let multPivot = (Math.abs(targetVal) / common) * Math.sign(targetVal) * Math.sign(pivotVal);

      // STEP A: Multiplicación de la Fila Objetivo (con simulación de sobrecarga de 15 cuentas)
      if (multTarget !== 1) {
        const oldRowI = [...M[i]];
        // First show intermediate overload in row i
        const varsToScale: ('X' | 'Y' | 'Z' | 'R')[] = dim === 2 ? ['X', 'Y', 'R'] : ['X', 'Y', 'Z', 'R'];
        const colIndices = dim === 2 ? [0, 1, 2] : [0, 1, 2, 3];

        let overloadDesc = `[ESCALADO ANALÓGICO CON SOBRECARGA EN FILA ${i + 1}]\n`;
        overloadDesc += `Para igualar el coeficiente de la variable ${pivotVar}, multiplicamos la Fila ${i + 1} por ${multTarget}.\n`;
        overloadDesc += `En cada alambre (U, D, C), las cuentas activas se multiplican por ${multTarget}. Debido a la holgura del Suanpan 2/5, los alambres acumulan temporalmente hasta 15 cuentas pegadas a la viga central sin realizar acarreo inmediato:\n`;

        colIndices.forEach((cIdx, idx) => {
          const varName = varsToScale[idx];
          const prevVal = oldRowI[cIdx];
          const intermediateVal = prevVal * multTarget;
          const absPrev = Math.abs(prevVal);
          const rawU = (absPrev % 10) * multTarget;
          const rawD = Math.floor((absPrev % 100) / 10) * multTarget;

          overloadDesc += `• Bloque ${varName}: ${prevVal} × ${multTarget} = ${intermediateVal}. `;
          if (rawU > 9 && rawU <= MAX_ROD_CAPACITY) {
            overloadDesc += `Alambre U sostiene ${rawU} cuentas (Cielo:2|Tierra:${rawU - 10}) superando la base 10 dentro del límite de 15 cuentas del Suanpan. `;
          }
          overloadDesc += `\n`;

          // Put intermediate overloaded state into memory block if within capacity
          if (rawU <= MAX_ROD_CAPACITY && rawD <= MAX_ROD_CAPACITY) {
            currentState.rows[i].blocks[varName] = createMemoryBlock(
              varName,
              intermediateVal,
              rawU > 9 ? { U: rawU, D: rawD } : undefined
            );
          } else {
            currentState.rows[i].blocks[varName] = createMemoryBlock(varName, intermediateVal);
          }
        });

        addStep(
          'OVERLOAD_ACCUMULATION',
          `Multiplicación de Fila ${i + 1} por ${multTarget} (Buffer intermedio de 15)`,
          overloadDesc,
          [i + 1],
          varsToScale,
          'Uso didáctico de la capacidad extendida de 15 cuentas del Suanpan antes de simplificar por acarreo.'
        );

        // STEP B: Acarreo y normalización a base 10 (Carry)
        for (let col = 0; col < M[i].length; col++) {
          M[i][col] = M[i][col] * multTarget;
        }

        colIndices.forEach((cIdx, idx) => {
          const varName = varsToScale[idx];
          currentState.rows[i].blocks[varName] = createMemoryBlock(varName, M[i][cIdx]);
        });

        let carryDesc = `[ACARREO Y NORMALIZACIÓN FÍSICA EN FILA ${i + 1}]\n`;
        carryDesc += `Las cuentas acumuladas en los alambres que excedieron 9 son convertidas:\n`;
        carryDesc += `• Se despejan 10 unidades (2 cuentas de Cielo de valor 5 vuelven al marco superior) y se sube 1 cuenta de Tierra en el alambre inmediato superior (U → D, D → C).\n`;
        carryDesc += `• Los alambres de la Fila ${i + 1} quedan normalizados en formato canónico decimal (0 a 9).`;

        addStep(
          'CARRY_NORMALIZATION',
          `Acarreo y Normalización canónica en Fila ${i + 1}`,
          carryDesc,
          [i + 1],
          varsToScale,
          'Normalización de cuentas a base 10 estándar en el Suanpan.'
        );
      }

      // STEP C: Resta analógica de alambres: Fila i = Fila i - (multPivot * Fila k)
      let subDesc = `[RESTA ANALÓGICA DE ALAMBRES: FILA ${i + 1} - (${multPivot} × FILA ${k + 1})]\n`;
      subDesc += `Se realiza la sustracción analógica de cuentas entre los bloques de la Fila ${i + 1} y la Fila pivote ${k + 1}:\n`;

      const varsToSubtract: ('X' | 'Y' | 'Z' | 'R')[] = dim === 2 ? ['X', 'Y', 'R'] : ['X', 'Y', 'Z', 'R'];
      const colIndices = dim === 2 ? [0, 1, 2] : [0, 1, 2, 3];

      colIndices.forEach((cIdx, idx) => {
        const varName = varsToSubtract[idx];
        const valTargetBefore = M[i][cIdx];
        const valSub = multPivot * M[k][cIdx];
        const valFinal = valTargetBefore - valSub;

        if (cIdx === k) {
          // Pivot variable is cancelled
          subDesc += `• Bloque ${varName}: ${valTargetBefore} - ${valSub} = 0. Se alejan TODAS las cuentas de Cielo y Tierra de la viga central hacia los marcos exteriores. El alambre S se coloca en 0 (Positivo). ¡La variable ${varName} queda físicamente eliminada!\n`;
        } else {
          subDesc += `• Bloque ${varName}: Resta de cuentas ${valTargetBefore} - (${valSub}) = ${valFinal}. `;
          if (Math.sign(valTargetBefore) !== Math.sign(valFinal) && valFinal !== 0) {
            subDesc += `Al pasar a valor negativo, se activa 1 cuenta en el alambre de Signo S (pasa a S=1) y se reajustan las cuentas en U/D/C a la magnitud absoluta ${Math.abs(valFinal)}. `;
          }
          subDesc += `\n`;
        }

        M[i][cIdx] = valFinal;
        currentState.rows[i].blocks[varName] = createMemoryBlock(varName, valFinal);
      });

      addStep(
        'ROW_SUBTRACTION',
        `Eliminación Analógica de ${pivotVar} en Fila ${i + 1}`,
        subDesc,
        [k + 1, i + 1],
        [pivotVar, 'R'],
        `Cancelación analógica del bloque de la variable ${pivotVar} mediante sustracción de cuentas.`
      );
    }
  }

  // ----------------------------------------------------
  // SUSTITUCIÓN HACIA ATRÁS (BACK SUBSTITUTION)
  // ----------------------------------------------------
  // Solve for last variable first
  for (let i = dim - 1; i >= 0; i--) {
    const varName: 'X' | 'Y' | 'Z' = i === 0 ? 'X' : i === 1 ? 'Y' : 'Z';
    const rIdx = dim === 3 ? 3 : 2;
    const coeff = M[i][i];

    if (coeff !== 0 && coeff !== 1) {
      const currentR = M[i][rIdx];
      // Normalize row i so leading coefficient is 1
      if (currentR % coeff === 0) {
        const isolatedVal = currentR / coeff;
        M[i][i] = 1;
        M[i][rIdx] = isolatedVal;

        currentState.rows[i].blocks[varName] = createMemoryBlock(varName, 1);
        currentState.rows[i].blocks.R = createMemoryBlock('R', isolatedVal);

        let isoDesc = `[AISLAMIENTO DE VARIABLE EN FILA ${i + 1}]\n`;
        isoDesc += `El Bloque ${varName} tiene un coeficiente analógico de ${coeff}. Se divide el Bloque Resultado R (${currentR}) entre ${coeff}, obteniendo ${isolatedVal}.\n`;
        isoDesc += `En el ábaco, el Bloque ${varName} se fija a exactamente 1 cuenta activa en U (Cielo:0|Tierra:1), y el Bloque R se configura con el valor final ${isolatedVal}.`;

        addStep(
          'PIVOT_ISOLATION',
          `Aislamiento y Normalización de ${varName} = ${isolatedVal}`,
          isoDesc,
          [i + 1],
          [varName, 'R'],
          `Resolución directa de la variable ${varName} dividiendo cuentas del resultado.`
        );
      }
    }

    // Now substitute known value of varName into rows above (row j < i)
    const knownVal = M[i][rIdx];
    for (let j = i - 1; j >= 0; j--) {
      const coeffAbove = M[j][i];
      if (coeffAbove === 0) continue;

      const delta = coeffAbove * knownVal;
      const oldR = M[j][rIdx];
      const newR = oldR - delta;

      M[j][i] = 0;
      M[j][rIdx] = newR;

      currentState.rows[j].blocks[varName] = createMemoryBlock(varName, 0);
      currentState.rows[j].blocks.R = createMemoryBlock('R', newR);

      let subBackDesc = `[SUSTITUCIÓN HACIA ATRÁS: FILA ${j + 1} CON VALOR CONOCIDO ${varName} = ${knownVal}]\n`;
      subBackDesc += `El valor obtenido de ${varName} (${knownVal}) se multiplica por el coeficiente ${coeffAbove} del Bloque ${varName} en la Fila ${j + 1} (${delta}).\n`;
      subBackDesc += `Se restan analógicamente ${delta} unidades del Bloque R en la Fila ${j + 1} (de ${oldR} a ${newR}), y se retiran todas las cuentas del Bloque ${varName} dejándolo en 0.`;

      addStep(
        'BACK_SUBSTITUTION',
        `Sustitución de ${varName} en Fila ${j + 1}`,
        subBackDesc,
        [j + 1, i + 1],
        [varName, 'R'],
        `Propagación analógica del valor resuelto a las filas superiores.`
      );
    }
  }

  // Normalize Row 1 leading coefficient if needed
  if (M[0][0] !== 0 && M[0][0] !== 1) {
    const rIdx = dim === 3 ? 3 : 2;
    const coeff = M[0][0];
    const currentR = M[0][rIdx];
    if (currentR % coeff === 0) {
      const isoVal = currentR / coeff;
      M[0][0] = 1;
      M[0][rIdx] = isoVal;
      currentState.rows[0].blocks.X = createMemoryBlock('X', 1);
      currentState.rows[0].blocks.R = createMemoryBlock('R', isoVal);
    }
  }

  // ----------------------------------------------------
  // ESTADO FINAL: SISTEMA RESUELTO
  // ----------------------------------------------------
  const rIdx = dim === 3 ? 3 : 2;
  const solX = M[0][rIdx];
  const solY = M[1][rIdx];
  const solZ = dim === 3 ? M[2][rIdx] : undefined;

  let finalDesc = `[SOLUCIÓN FINAL DEL HARDWARE ANALÓGICO SUANPAN]\n`;
  finalDesc += `El sistema ha quedado reducido a su forma canónica diagonal completa:\n`;
  finalDesc += `★ X = ${solX}  (Fila 1, Bloque R)\n`;
  finalDesc += `★ Y = ${solY}  (Fila 2, Bloque R)\n`;
  if (dim === 3) {
    finalDesc += `★ Z = ${solZ}  (Fila 3, Bloque R)\n`;
  }
  finalDesc += `Todos los hilos de variables están fijados en identidad (1 en su alambre U) o despejados a 0, y los Bloques R contienen los valores exactos calculados mediante el desplazamiento analógico de cuentas.`;

  addStep(
    'FINAL_SOLUTION',
    'Sistema Resuelto Canónicamente',
    finalDesc,
    dim === 2 ? [1, 2] : [1, 2, 3],
    dim === 2 ? ['X', 'Y', 'R'] : ['X', 'Y', 'Z', 'R'],
    'Solución completa del sistema verificada en el ábaco Suanpan 2/5.'
  );

  // Update totalSteps on all steps
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));

  return steps;
}

import React from 'react';
import { X, BookOpen, Layers, Cpu, Award } from 'lucide-react';

interface HardwareManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HardwareManualModal: React.FC<HardwareManualModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-stone-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-stone-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-serif font-bold">
              算
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-stone-100">
                Manual de Hardware Analógico: Suanpan 2/5 y Álgebra Matricial
              </h2>
              <p className="text-xs text-stone-400 font-mono">
                Especificación Técnica del Simulador y Raíces Históricas Fangcheng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar text-xs sm:text-sm leading-relaxed">
          {/* Section 1: Memory Architecture */}
          <section className="space-y-2.5">
            <h3 className="text-amber-400 font-serif font-bold text-sm sm:text-base flex items-center gap-2 border-b border-stone-800 pb-1">
              <Layers className="w-4 h-4" /> 1. Arquitectura de Memoria Física
            </h3>
            <p className="text-stone-300">
              El simulador organiza el ábaco Suanpan en una jerarquía hardware estricta:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-300">
              <li>
                <strong className="text-amber-200">Filas de Memoria:</strong> Cada fila física del ábaco representa una ecuación lineal completa (Fila 1 = Ecuación 1, Fila 2 = Ecuación 2, Fila 3 = Ecuación 3).
              </li>
              <li>
                <strong className="text-amber-200">Bloques Lógicos:</strong> Cada Fila se particiona en bloques independientes para cada incógnita (<code className="font-mono text-amber-400 font-bold">X</code>, <code className="font-mono text-amber-400 font-bold">Y</code>, opcionalmente <code className="font-mono text-amber-400 font-bold">Z</code>) y el <code className="font-mono text-amber-400 font-bold">Resultado (R)</code>.
              </li>
              <li>
                <strong className="text-amber-200">Alambres / Hilos Fijos [S, C, D, U]:</strong>
                <ul className="list-circle pl-5 mt-1 space-y-1">
                  <li><strong className="text-stone-100 font-mono">Hilo S (Signo):</strong> Registra la polaridad del número. <code className="font-mono text-emerald-400">0 = Positivo</code> (cuenta alejada), <code className="font-mono text-rose-400">1 = Negativo</code> (cuenta pegada a la viga).</li>
                  <li><strong className="text-stone-100 font-mono">Hilo C (Centenas):</strong> Posición decimal de centenas (×100).</li>
                  <li><strong className="text-stone-100 font-mono">Hilo D (Decenas):</strong> Posición decimal de decenas (×10).</li>
                  <li><strong className="text-stone-100 font-mono">Hilo U (Unidades):</strong> Posición decimal de unidades (×1).</li>
                </ul>
              </li>
            </ul>
          </section>

          {/* Section 2: Suanpan 2/5 Physics & 15-Capacity Buffer */}
          <section className="space-y-2.5">
            <h3 className="text-amber-400 font-serif font-bold text-sm sm:text-base flex items-center gap-2 border-b border-stone-800 pb-1">
              <Cpu className="w-4 h-4" /> 2. Formato 2/5 y Capacidad Extendida de 15 Cuentas
            </h3>
            <p className="text-stone-300">
              A diferencia del Soroban japonés moderno (1/4), el tradicional <strong className="text-stone-100">Suanpan chino</strong> emplea la configuración <strong className="text-amber-300">2/5</strong>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-stone-950 rounded-xl border border-stone-800">
              <div className="space-y-1">
                <div className="font-mono font-bold text-amber-400">Cielo (天) — 2 Cuentas</div>
                <div className="text-xs text-stone-300">
                  Cada cuenta vale <strong className="text-amber-300">5</strong> al ser bajada contra la viga central. Capacidad en Cielo: 2 × 5 = <strong className="text-stone-100">10</strong>.
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-mono font-bold text-amber-400">Tierra (地) — 5 Cuentas</div>
                <div className="text-xs text-stone-300">
                  Cada cuenta vale <strong className="text-amber-300">1</strong> al ser subida contra la viga central. Capacidad en Tierra: 5 × 1 = <strong className="text-stone-100">5</strong>.
                </div>
              </div>
            </div>
            <p className="text-stone-300">
              <strong className="text-amber-300">¿Por qué 15 cuentas?</strong> La suma de 2 cuentas de Cielo (10) + 5 cuentas de Tierra (5) otorga una capacidad física de <strong className="text-stone-100">15</strong> por alambre. En la matemática tradicional china, esta holgura actúa como un <em className="text-amber-200">buffer analógico intermedio</em>: permite acumular productos o sumas sin verse obligado a acarrear de inmediato a base 10, optimizando la velocidad de cálculo antes de simplificar por acarreo.
            </p>
          </section>

          {/* Section 3: Ancient Roots - Fangcheng Method */}
          <section className="space-y-2.5">
            <h3 className="text-amber-400 font-serif font-bold text-sm sm:text-base flex items-center gap-2 border-b border-stone-800 pb-1">
              <Award className="w-4 h-4" /> 3. Raíces Históricas: El Método Fangcheng (方程)
            </h3>
            <p className="text-stone-300">
              El tratado clásico <strong className="text-stone-100">Jiuzhang Suanshu</strong> (<em>Los Nueve Capítulos sobre el Arte Matemático</em>, compilado durante la Dinastía Han, c. 179 d.C.), dedica su Capítulo 8 íntegro al método <strong className="text-amber-300">Fangcheng</strong>.
            </p>
            <p className="text-stone-300">
              Los eruditos chinos representaban sistemas de ecuaciones disponiendo varillas de cálculo en columnas o filas rectangulares (matrices). Mediante operaciones de multiplicación de filas y sustracción sucesiva de columnas para eliminar incógnitas, resolvieron sistemas de hasta 4 y 5 variables <em>más de mil ochocientos años antes</em> de que Carl Friedrich Gauss formalizara el método en Europa.
            </p>
            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-200">
              El formato de reporte ASCII de este simulador emula fielmente la lectura del ábaco de varillas: mapea en cada etapa cuántas cuentas quedan pegadas a la viga central (<code>Cielo:X|Tierra:Y</code>) y desglosa el movimiento analógico de eliminación.
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono font-bold text-xs rounded-xl transition-colors"
          >
            Entendido, volver al Tablero
          </button>
        </div>
      </div>
    </div>
  );
};

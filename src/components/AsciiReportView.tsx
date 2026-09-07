import React, { useState } from 'react';
import { Copy, Check, Terminal, FileText } from 'lucide-react';
import { SimulationStep } from '../types/suanpan';

interface AsciiReportViewProps {
  currentStep: SimulationStep;
  allSteps: SimulationStep[];
}

export const AsciiReportView: React.FC<AsciiReportViewProps> = ({
  currentStep,
  allSteps,
}) => {
  const [copiedCurrent, setCopiedCurrent] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [viewMode, setViewMode] = useState<'current' | 'full'>('current');

  const handleCopyCurrent = () => {
    navigator.clipboard.writeText(currentStep.asciiReport);
    setCopiedCurrent(true);
    setTimeout(() => setCopiedCurrent(false), 2000);
  };

  const handleCopyAll = () => {
    const fullTranscript = allSteps
      .map(
        (s, idx) =>
          `========================================================\n` +
          `PASO ${idx + 1}/${allSteps.length}: ${s.title.toUpperCase()}\n` +
          `========================================================\n\n` +
          s.asciiReport +
          `\n\n`
      )
      .join('\n');

    navigator.clipboard.writeText(fullTranscript);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const fullTranscriptText = allSteps
    .map(
      (s, idx) =>
        `========================================================\n` +
        `PASO ${idx + 1}/${allSteps.length}: ${s.title.toUpperCase()}\n` +
        `========================================================\n\n` +
        s.asciiReport +
        `\n\n`
    )
    .join('\n');

  return (
    <div className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Terminal Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <Terminal className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-mono font-bold text-stone-200">
            Reporte Riguroso de Hardware Analógico (ASCII)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-stone-900 rounded-lg p-0.5 border border-stone-800 text-xs font-mono">
            <button
              onClick={() => setViewMode('current')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'current'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Paso Actual ({currentStep.stepIndex}/{allSteps.length})
            </button>
            <button
              onClick={() => setViewMode('full')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'full'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Transcripción Completa
            </button>
          </div>

          {/* Copy Button */}
          {viewMode === 'current' ? (
            <button
              onClick={handleCopyCurrent}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg border border-stone-700 transition-colors shadow-xs"
              title="Copiar reporte ASCII del paso actual"
            >
              {copiedCurrent ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Paso</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg border border-stone-700 transition-colors shadow-xs"
              title="Copiar todos los pasos de la reducción"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Copiar Todo</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ASCII Output Box */}
      <div className="relative bg-stone-900/90 border border-stone-800 rounded-xl p-4 overflow-x-auto max-h-[420px] font-mono text-xs leading-relaxed text-amber-100 shadow-inner custom-scrollbar">
        <pre className="whitespace-pre font-mono">
          {viewMode === 'current'
            ? currentStep.asciiReport
            : fullTranscriptText}
        </pre>
      </div>

      <div className="mt-2 text-[11px] font-mono text-stone-500 flex items-center justify-between">
        <span>Formato: Cielo:X|Tierra:Y (Cuentas pegadas a la viga central)</span>
        <span>Límite analógico de sobrecarga: 15 cuentas / alambre</span>
      </div>
    </div>
  );
};

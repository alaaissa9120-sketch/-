import React, { useState } from 'react';
import { Code2, Copy, Check, ChevronDown, ChevronUp, Terminal, Sparkles } from 'lucide-react';
import { ParsedAction, MemoryItem } from '../types';

interface TechnicalInspectorProps {
  lastSpeech: string;
  lastAction?: ParsedAction;
  rawText?: string;
  newMemories?: MemoryItem[];
}

export const TechnicalInspector: React.FC<TechnicalInspectorProps> = ({
  lastSpeech,
  lastAction,
  rawText,
  newMemories,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const payload = {
    speech: lastSpeech,
    action: lastAction || { intent: 'NONE', parameters: {} },
    new_memories_extracted: newMemories && newMemories.length > 0 ? newMemories : undefined,
  };

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg backdrop-blur-md select-none text-right">
      {/* Header bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-orange-400" />
          <span>المعاينة البرمجية للبنية التقنية (JSON Intent & Memory)</span>
          {lastAction && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
              {lastAction.intent}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>{isOpen ? 'إخفاء' : 'عرض'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 font-mono text-xs space-y-3" dir="ltr">
          <div className="flex justify-between items-center text-slate-400 text-[11px]">
            <span className="text-orange-300 font-bold">Extracted Intent Payload:</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 overflow-x-auto text-emerald-400 text-[11px] leading-relaxed max-h-48">
            {jsonString}
          </pre>

          {rawText && (
            <details className="text-[11px] text-slate-400">
              <summary className="cursor-pointer hover:text-slate-200 transition">
                Raw Model Output (&lt;speech&gt; + &lt;action&gt;)
              </summary>
              <pre className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 mt-1 whitespace-pre-wrap text-slate-300 font-mono text-[10px]">
                {rawText}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

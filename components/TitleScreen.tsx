'use client';

import React, { useEffect } from 'react';
import { Play, Sparkles, Layers, Sliders, Mic } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between p-8 sm:p-12 pointer-events-auto bg-[#07090e]/80 select-none transition-opacity duration-300">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          <span className="font-mono text-xs uppercase tracking-widest text-slate-300">
            Spatial Task & Information Canvas
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>Three.js PBR</span>
            <span>·</span>
            <span>6-Force Symplectic</span>
            <span>·</span>
            <span>Gemini 4 Argon</span>
          </div>
          <button
            onClick={onStart}
            className="px-3 py-1 text-xs font-mono bg-[#111827] hover:bg-[#1f293d] border border-slate-700 rounded-lg text-slate-200 transition-colors"
          >
            Close (Esc)
          </button>
        </div>
      </div>

      {/* Centerpiece Hero Lockup with Bespoke Inline SVG over Negative Space */}
      <div className="max-w-2xl my-auto space-y-6">
        <div className="space-y-3">
          {/* Bespoke Geometric Logo SVG */}
          <svg className="w-16 h-16 text-sky-400 mb-4" viewBox="0 0 64 64" fill="none">
            <polygon
              points="32,4 60,18 60,46 32,60 4,46 4,18"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="rgba(56, 189, 248, 0.08)"
            />
            <polygon
              points="32,16 48,24 48,40 32,48 16,40 16,24"
              stroke="#38bdf8"
              strokeWidth="1.5"
              fill="rgba(56, 189, 248, 0.2)"
            />
            <circle cx="32" cy="32" r="4" fill="#f8fafc" />
            <line x1="32" y1="4" x2="32" y2="16" stroke="currentColor" strokeWidth="1.5" />
            <line x1="60" y1="18" x2="48" y2="24" stroke="currentColor" strokeWidth="1.5" />
            <line x1="60" y1="46" x2="48" y2="40" stroke="currentColor" strokeWidth="1.5" />
            <line x1="32" y1="60" x2="32" y2="48" stroke="currentColor" strokeWidth="1.5" />
            <line x1="4" y1="46" x2="16" y2="40" stroke="currentColor" strokeWidth="1.5" />
            <line x1="4" y1="18" x2="16" y2="24" stroke="currentColor" strokeWidth="1.5" />
          </svg>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-sans">
            AETHERIAL
          </h1>
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
            An adaptive 3D information substrate where tasks, code pipelines, and Google Workspace streams glide as tactile polyhedra and mechanical contraptions across an ambient spectrum.
          </p>
        </div>

        {/* Feature Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-[#0f172a]/90 border border-slate-800 rounded-xl p-3">
            <Layers className="w-4 h-4 text-sky-400 mb-1.5" />
            <h4 className="text-xs font-semibold text-slate-200">Faceted Polyhedra</h4>
            <p className="text-[11px] text-slate-400">4-face typed graph cards in 3D crystals</p>
          </div>
          <div className="bg-[#0f172a]/90 border border-slate-800 rounded-xl p-3">
            <Mic className="w-4 h-4 text-emerald-400 mb-1.5" />
            <h4 className="text-xs font-semibold text-slate-200">Deictic Voice</h4>
            <p className="text-[11px] text-slate-400">Hold + speak with Gemini 4 Agent</p>
          </div>
          <div className="bg-[#0f172a]/90 border border-slate-800 rounded-xl p-3">
            <Sliders className="w-4 h-4 text-amber-400 mb-1.5" />
            <h4 className="text-xs font-semibold text-slate-200">6-Force Physics</h4>
            <p className="text-[11px] text-slate-400">Wave & noise oscillator debug menu</p>
          </div>
          <div className="bg-[#0f172a]/90 border border-slate-800 rounded-xl p-3">
            <Sparkles className="w-4 h-4 text-purple-400 mb-1.5" />
            <h4 className="text-xs font-semibold text-slate-200">5 Contraptions</h4>
            <p className="text-[11px] text-slate-400">PR Coaster, Tetris, Split-Flap, Orrery</p>
          </div>
        </div>

        {/* Start CTA */}
        <div className="pt-4 flex items-center gap-4">
          <button
            onClick={onStart}
            className="flex items-center gap-2.5 px-6 py-3 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 rounded-xl shadow-lg transition-transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Enter Canvas</span>
          </button>
          <span className="text-xs font-mono text-slate-400">Press [Space] or [Enter]</span>
        </div>
      </div>

      {/* Bottom Control Hint Line */}
      <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
        <div>
          <span>Drag Node Move</span>
          <span className="mx-2">·</span>
          <span>Hold Space Voice</span>
          <span className="mx-2">·</span>
          <span>D Physics Menu</span>
          <span className="mx-2">·</span>
          <span>H Toggle Dock</span>
        </div>
        <div className="hidden sm:block">Zero Guilt · Ephemeral Data Streams</div>
      </div>
    </div>
  );
}

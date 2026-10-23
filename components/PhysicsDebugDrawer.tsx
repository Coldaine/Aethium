'use client';

import React, { useEffect, useRef } from 'react';
import { X, Activity, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { PhysicsWorldConfig, ForceParameter, WaveformType } from '@/types/spatial';

interface PhysicsDebugDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: PhysicsWorldConfig;
  onUpdateConfig: (updater: (prev: PhysicsWorldConfig) => PhysicsWorldConfig) => void;
  onResetDefaults: () => void;
}

export default function PhysicsDebugDrawer({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onResetDefaults,
}: PhysicsDebugDrawerProps) {
  const sparklineCanvasRef = useRef<HTMLCanvasElement>(null);

  // Sparkline animation for active waveform preview
  useEffect(() => {
    if (!isOpen) return;
    const canvas = sparklineCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let t = 0;

    const renderSparkline = () => {
      t += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw faint grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 30);
      ctx.lineTo(canvas.width, 30);
      ctx.stroke();

      // Draw live drift wave
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const normX = x / canvas.width;
        const wave = Math.sin(normX * 8 + t) * 18;
        const y = 30 + wave;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(renderSparkline);
    };

    animId = requestAnimationFrame(renderSparkline);
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  if (!isOpen) return null;

  const forceKeys: (keyof Omit<PhysicsWorldConfig, 'temporalSpineActive'>)[] = [
    'driftStrength',
    'edgeGravity',
    'mutualAttraction',
    'vortexTorque',
    'temporalSpinePull',
    'exitYankForce',
    'damping',
    'approachStillnessRadius',
  ];

  const updateParam = (key: keyof PhysicsWorldConfig, partial: Partial<ForceParameter>) => {
    onUpdateConfig((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] as ForceParameter),
        ...partial,
      },
    }));
  };

  return (
    <div className="fixed top-4 right-4 bottom-24 w-96 bg-[#0c111d] border border-slate-700/80 rounded-2xl shadow-2xl p-4 flex flex-col z-50 pointer-events-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold tracking-tight text-slate-100">
            Physics & Wave Oscillators
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onResetDefaults}
            className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset to Defaults"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sparkline Monitor */}
      <div className="my-2 bg-[#060911] border border-slate-800/80 rounded-lg p-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
          <span>Active Wave Resonance</span>
          <span className="text-sky-400 font-mono tabular-nums">
            {config.driftStrength.waveform.toUpperCase()} · {config.driftStrength.frequency.toFixed(2)}Hz
          </span>
        </div>
        <canvas ref={sparklineCanvasRef} width={340} height={60} className="w-full h-[60px]" />
      </div>

      {/* Force Sliders List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs font-sans">
        {forceKeys.map((key) => {
          const param = config[key] as ForceParameter;
          if (!param) return null;

          return (
            <div key={param.id} className="bg-[#121929] border border-slate-800 rounded-lg p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200">{param.name}</span>
                  <p className="text-[10px] text-slate-400">{param.description}</p>
                </div>
                <span className="font-mono text-amber-400 font-bold tabular-nums">
                  {param.currentValue.toFixed(2)}
                </span>
              </div>

              {/* Base Value Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Base Weight</span>
                  <span>{param.baseValue.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={key === 'vortexTorque' ? -1 : 0}
                  max={key === 'exitYankForce' ? 3 : 2}
                  step={0.02}
                  value={param.baseValue}
                  onChange={(e) => updateParam(key, { baseValue: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Dynamic Waveform Oscillator Toggle */}
              <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={param.oscillatorEnabled}
                    onChange={(e) => updateParam(key, { oscillatorEnabled: e.target.checked })}
                    className="rounded border-slate-700 accent-sky-400"
                  />
                  <span>Wave Oscillator</span>
                </label>

                {param.oscillatorEnabled && (
                  <select
                    value={param.waveform}
                    onChange={(e) => updateParam(key, { waveform: e.target.value as WaveformType })}
                    className="bg-[#0b101d] text-sky-300 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-mono"
                  >
                    <option value="sine">Sine</option>
                    <option value="triangle">Triangle</option>
                    <option value="perlin">Perlin Noise</option>
                    <option value="random_walk">Random Walk</option>
                  </select>
                )}
              </div>

              {/* Oscillator Range Bounds & Frequency */}
              {param.oscillatorEnabled && (
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-400">Min: {param.minVal.toFixed(2)}</span>
                    <input
                      type="range"
                      min={key === 'vortexTorque' ? -1 : 0}
                      max={param.maxVal}
                      step={0.05}
                      value={param.minVal}
                      onChange={(e) => updateParam(key, { minVal: parseFloat(e.target.value) })}
                      className="w-full accent-sky-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400">Max: {param.maxVal.toFixed(2)}</span>
                    <input
                      type="range"
                      min={param.minVal}
                      max={key === 'exitYankForce' ? 4 : 2.5}
                      step={0.05}
                      value={param.maxVal}
                      onChange={(e) => updateParam(key, { maxVal: parseFloat(e.target.value) })}
                      className="w-full accent-sky-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

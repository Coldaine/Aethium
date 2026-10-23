'use client';

import React from 'react';
import {
  Sparkles,
  Layers,
  Clock,
  RotateCcw,
  Volume2,
  VolumeX,
  Sliders,
  ChevronDown,
  ChevronUp,
  Plus,
  Compass,
  Monitor,
  HandMetal,
  Radio,
  FileCheck2,
} from 'lucide-react';
import { AttentionMode } from '@/types/spatial';

interface ControlDockProps {
  attentionMode: AttentionMode;
  onSetAttentionMode: (mode: AttentionMode) => void;
  temporalSpineActive: boolean;
  onToggleTemporalSpine: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenPhysicsDrawer: () => void;
  isPhysicsOpen: boolean;
  onUndo: () => void;
  canUndo: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAddNewBubble: () => void;
  onRefreshDigest: () => void;
  isRefreshingDigest: boolean;
  workspaceUser: { email: string | null; displayName: string | null } | null;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  hudClutchActive: boolean;
  onToggleHudClutch: () => void;
}

export default function ControlDock({
  attentionMode,
  onSetAttentionMode,
  temporalSpineActive,
  onToggleTemporalSpine,
  isMuted,
  onToggleMute,
  onOpenPhysicsDrawer,
  isPhysicsOpen,
  onUndo,
  canUndo,
  isCollapsed,
  onToggleCollapse,
  onAddNewBubble,
  onRefreshDigest,
  isRefreshingDigest,
  workspaceUser,
  onGoogleSignIn,
  onGoogleSignOut,
  hudClutchActive,
  onToggleHudClutch,
}: ControlDockProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-auto max-w-[min(1080px,96vw)] w-full">
      {/* Collapse / Expand Drawer Handle */}
      <button
        onClick={onToggleCollapse}
        className="px-3 py-1 mb-1.5 text-xs font-mono tracking-wider text-slate-400 hover:text-white bg-[#111622] hover:bg-[#1a2234] border border-slate-700/60 rounded-t-md transition-colors flex items-center gap-1.5 shadow-lg"
        title="Toggle HUD Visibility (Shortcut: H)"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Show Dock (H)</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            <span>Hide Dock (H)</span>
          </>
        )}
      </button>

      {/* Main Unified Dock Bar */}
      {!isCollapsed && (
        <div className="w-full bg-[#0d121f] border border-slate-700/70 rounded-xl p-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-sm">
          {/* Group 1: Attention Spectrum Modes */}
          <div className="flex items-center gap-1 bg-[#151c2e] p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onSetAttentionMode('tactile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                attentionMode === 'tactile'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full interactive touch & voice canvas"
            >
              <HandMetal className="w-3.5 h-3.5" />
              <span>Tactile</span>
            </button>

            <button
              onClick={() => onSetAttentionMode('hud_overlay')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                attentionMode === 'hud_overlay'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Translucent click-through desktop overlay"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>HUD Overlay</span>
            </button>

            <button
              onClick={() => onSetAttentionMode('ambient_tv')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                attentionMode === 'ambient_tv'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Low-interaction cinematic living screensaver"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Ambient TV</span>
            </button>
          </div>

          {/* Group 2: Temporal Spine & Clutch */}
          <div className="flex items-center gap-2">
            {attentionMode === 'hud_overlay' && (
              <button
                onClick={onToggleHudClutch}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                  hudClutchActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-[#151c2e] text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Clutch modifier: Lock input catch instead of click-through"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Clutch: {hudClutchActive ? 'LOCKED' : 'PASS'}</span>
              </button>
            )}

            <button
              onClick={onToggleTemporalSpine}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                temporalSpineActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-[#151c2e] text-slate-300 border-slate-800 hover:bg-[#1a2238]'
              }`}
              title="Pull scheduled items onto chronological horizontal axis"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline Spine</span>
            </button>

            <button
              onClick={onRefreshDigest}
              disabled={isRefreshingDigest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#151c2e] text-slate-300 border border-slate-800 hover:bg-[#1a2238] transition-colors"
              title="Refresh Split-Flap mechanical digest with Gemini 3.8 Flash"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isRefreshingDigest ? 'Refreshing...' : 'Clacker Digest'}</span>
            </button>
          </div>

          {/* Group 3: Google Workspace Connection */}
          <div className="flex items-center gap-2">
            {workspaceUser ? (
              <div className="flex items-center gap-2 bg-[#151c2e] px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300 truncate max-w-[140px]">
                  {workspaceUser.displayName || workspaceUser.email}
                </span>
                <button
                  onClick={onGoogleSignOut}
                  className="text-slate-400 hover:text-rose-400 text-[10px] ml-1"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
                title="Connect Gmail, Calendar, Drive & Keep"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Connect Workspace</span>
              </button>
            )}
          </div>

          {/* Group 4: Utilities & Physics Drawer Toggle */}
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2">
            <button
              onClick={onAddNewBubble}
              className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition-colors"
              title="Add New 3D Bubble"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg transition-colors ${
                canUndo
                  ? 'text-slate-300 hover:bg-[#151c2e]'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Undo Last Action (Ctrl+Z)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleMute}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-[#151c2e] transition-colors"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenPhysicsDrawer}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                isPhysicsOpen
                  ? 'bg-amber-500 text-slate-900 font-bold'
                  : 'bg-[#151c2e] text-amber-300 hover:bg-[#1c263e]'
              }`}
              title="Physics & Wave Oscillators Debug Menu (Shortcut: D)"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Physics (D)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { X, ExternalLink, Calendar, GitPullRequest, Mail, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { SpatialGraphNode } from '@/types/spatial';

interface BubbleInspectModalProps {
  node: SpatialGraphNode | null;
  onClose: () => void;
  onTriggerAction: (node: SpatialGraphNode, action: string) => void;
  onSwitchFace: (nodeId: string, faceIndex: number) => void;
}

export default function BubbleInspectModal({
  node,
  onClose,
  onTriggerAction,
  onSwitchFace,
}: BubbleInspectModalProps) {
  if (!node) return null;

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'github_pr':
        return <GitPullRequest className="w-4 h-4 text-cyan-400" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case 'gmail':
        return <Mail className="w-4 h-4 text-blue-400" />;
      case 'drive':
        return <FileText className="w-4 h-4 text-purple-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-amber-400" />;
    }
  };

  const faces = [
    { label: 'Overview', icon: '01' },
    { label: 'AI Summary', icon: '02' },
    { label: 'Actions', icon: '03' },
    { label: 'Metadata', icon: '04' },
  ];

  return (
    <div className="fixed top-16 left-6 w-96 bg-[#0c101d] border border-slate-700/80 rounded-2xl shadow-2xl p-5 z-40 pointer-events-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {getSourceIcon(node.source)}
          <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
            {node.source.replace('_', ' ')}
          </span>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs font-mono text-slate-400 capitalize">
            {node.status.replace('_', ' ')}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Face Selector Tabs */}
      <div className="flex items-center gap-1 my-3 p-1 bg-[#141b2d] rounded-lg border border-slate-800">
        {faces.map((f, idx) => (
          <button
            key={f.label}
            onClick={() => onSwitchFace(node.id, idx)}
            className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
              node.activeFaceIndex === idx
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Face Content */}
      <div className="space-y-3 min-h-[160px]">
        {node.activeFaceIndex === 0 && (
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight leading-snug">
              {node.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Priority: {node.facets?.metadata?.priority || 'medium'}</span>
              <span>·</span>
              <span>Cluster: {node.clusterId || 'unassigned'}</span>
            </div>
            {node.scheduledAt && (
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 pt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Timeline: {new Date(node.scheduledAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {node.activeFaceIndex === 1 && (
          <div className="space-y-2 bg-[#121828] p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-sky-400 uppercase tracking-wider block">
              Gemini Synthesis
            </span>
            <p className="text-sm text-slate-200 leading-relaxed">
              {node.summary || 'No summary available.'}
            </p>
          </div>
        )}

        {node.activeFaceIndex === 2 && (
          <div className="space-y-2">
            <span className="text-xs text-slate-400 block mb-1">Quick Actions</span>
            {(node.facets?.quickActions || ['Review', 'Archive', 'Complete']).map((action) => (
              <button
                key={action}
                onClick={() => onTriggerAction(node, action)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg bg-[#151d30] hover:bg-[#1e2a46] border border-slate-700/60 text-xs font-medium text-slate-100 transition-colors"
              >
                <span>{action}</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
              </button>
            ))}
          </div>
        )}

        {node.activeFaceIndex === 3 && (
          <div className="space-y-2 font-mono text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-500">ID</span>
              <span className="text-slate-400">{node.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-500">Source Type</span>
              <span>{node.source}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-500">Visual Effect</span>
              <span className="text-amber-400">{node.visualEffect}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Age on Canvas</span>
              <span>{Math.floor(node.ageSeconds)}s</span>
            </div>
          </div>
        )}
      </div>

      {/* Voice Prompt Hint */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Hold Space / Mouse to Speak</span>
        <span className="text-sky-400">Gemini 4 Argon</span>
      </div>
    </div>
  );
}

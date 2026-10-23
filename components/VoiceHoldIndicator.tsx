'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { SpatialGraphNode } from '@/types/spatial';

interface VoiceHoldIndicatorProps {
  node: SpatialGraphNode | null;
  isActive: boolean;
  onTranscriptComplete: (node: SpatialGraphNode, transcript: string) => void;
}

export default function VoiceHoldIndicator({
  node,
  isActive,
  onTranscriptComplete,
}: VoiceHoldIndicatorProps) {
  const [transcript, setTranscript] = useState('');
  const transcriptRef = useRef('');
  const nodeRef = useRef(node);
  const onCompleteRef = useRef(onTranscriptComplete);

  useEffect(() => {
    nodeRef.current = node;
    onCompleteRef.current = onTranscriptComplete;
  });

  useEffect(() => {
    if (!isActive || !node) {
      if (transcriptRef.current.trim() && nodeRef.current) {
        const text = transcriptRef.current.trim();
        transcriptRef.current = '';
        onCompleteRef.current(nodeRef.current, text);
      }
      return;
    }

    transcriptRef.current = '';

    let recognition: any = null;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          transcriptRef.current = current;
          setTranscript(current);
        };

        recognition.onerror = (err: any) => {
          console.warn('SpeechRecognition error:', err);
        };

        recognition.start();
      } catch (err) {
        console.warn('SpeechRecognition init error:', err);
      }
    }

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch {}
      }
    };
  }, [isActive, node]);

  if (!isActive || !node) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center animate-fade-in">
      {/* Audio Reactive Glow Ring */}
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.5)]">
          <Mic className="w-7 h-7 text-sky-300 animate-bounce" />
        </div>
      </div>

      {/* Target Node Badge & Spoken Transcript */}
      <div className="mt-3 bg-[#0f172a] border border-sky-500/60 rounded-xl px-4 py-2.5 shadow-2xl max-w-md text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-sky-400 font-mono mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DEICTIC VOICE COMMAND · {node.title.slice(0, 24)}</span>
        </div>
        <p className="text-sm font-medium text-white italic">
          {transcript || 'Speak command (e.g. "Push to Friday", "Archive", "Mark Approved")...'}
        </p>
        <span className="text-[10px] text-slate-400 mt-1 block font-mono">
          Release hold or Space to execute with Gemini Agent Harness
        </span>
      </div>
    </div>
  );
}

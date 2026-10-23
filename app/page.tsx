'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Canvas3D from '@/components/Canvas3D';
import ControlDock from '@/components/ControlDock';
import PhysicsDebugDrawer from '@/components/PhysicsDebugDrawer';
import VoiceHoldIndicator from '@/components/VoiceHoldIndicator';
import BubbleInspectModal from '@/components/BubbleInspectModal';
import WorkspaceConfirmModal from '@/components/WorkspaceConfirmModal';
import TitleScreen from '@/components/TitleScreen';
import {
  SpatialGraphNode,
  PhysicsWorldConfig,
  AttentionMode,
  UndoAction,
  PRBeadItem,
  TetrisTaskTile,
  SplitFlapBoardState,
  OrreryBranchPlanet,
  LavaBubble,
} from '@/types/spatial';
import { createDefaultPhysicsConfig } from '@/lib/physicsEngine';
import { soundFx } from '@/lib/audioSynth';
import {
  initialBubbles,
  initialTrainCars,
  initialPRBeads,
  initialTetrisTasks,
  initialSplitFlap,
  initialOrreryBranches,
  initialLavaBubbles,
} from '@/lib/initialData';
import { initAuth, googleSignIn, logout, getAccessToken } from '@/lib/firebase';

export default function SpatialCanvasPage() {
  // Main canvas state
  const [nodes, setNodes] = useState<SpatialGraphNode[]>([
    ...initialBubbles,
    ...initialTrainCars,
  ]);
  const [physicsConfig, setPhysicsConfig] = useState<PhysicsWorldConfig>(createDefaultPhysicsConfig());
  const [attentionMode, setAttentionMode] = useState<AttentionMode>('tactile');
  const [hudClutchActive, setHudClutchActive] = useState<boolean>(false);

  // Contraptions state
  const [prBeads, setPRBeads] = useState<PRBeadItem[]>(initialPRBeads);
  const [tetrisTasks, setTetrisTasks] = useState<TetrisTaskTile[]>(initialTetrisTasks);
  const [splitFlap, setSplitFlap] = useState<SplitFlapBoardState>(initialSplitFlap);
  const [orreryBranches, setOrreryBranches] = useState<OrreryBranchPlanet[]>(initialOrreryBranches);
  const [lavaBubbles, setLavaBubbles] = useState<LavaBubble[]>(initialLavaBubbles);

  // UI & overlay states (starts directly in the live 3D canvas)
  const [isTitleOpen, setIsTitleOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<SpatialGraphNode | null>(null);
  const [isHoldingVoice, setIsHoldingVoice] = useState<boolean>(false);
  const [voiceTargetNode, setVoiceTargetNode] = useState<SpatialGraphNode | null>(null);
  const [isPhysicsOpen, setIsPhysicsOpen] = useState<boolean>(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRefreshingDigest, setIsRefreshingDigest] = useState<boolean>(false);
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);

  // Workspace Auth state
  const [workspaceUser, setWorkspaceUser] = useState<{ email: string | null; displayName: string | null } | null>(null);
  const [workspaceConfirm, setWorkspaceConfirm] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    serviceName: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    serviceName: '',
    onConfirm: () => {},
  });

  // Track latest nodes in ref for undo snapshots
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  });

  const pushUndoSnapshot = useCallback((description: string) => {
    setUndoStack((prev) => [
      ...prev.slice(-15),
      {
        id: `undo-${Date.now()}`,
        description,
        timestamp: Date.now(),
        snapshot: JSON.parse(JSON.stringify(nodesRef.current)),
      },
    ]);
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setNodes(last.snapshot);
    soundFx.playMarimbaTap(380, 0.1);
  }, [undoStack]);

  // Firebase Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setWorkspaceUser({
          email: user.email,
          displayName: user.displayName,
        });
      },
      () => {
        setWorkspaceUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle physics drawer
      if ((e.key === 'd' || e.key === 'D') && !(e.target instanceof HTMLInputElement)) {
        setIsPhysicsOpen((prev) => !prev);
      }
      // Toggle bottom dock
      if ((e.key === 'h' || e.key === 'H') && !(e.target instanceof HTMLInputElement)) {
        setIsDockCollapsed((prev) => !prev);
      }
      // Escape to toggle Title / Pause screen
      if (e.key === 'Escape') {
        setIsTitleOpen((prev) => !prev);
      }
      // Ctrl+Z Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      // Space to start voice hold on selected node
      if (e.code === 'Space' && selectedNode && !isHoldingVoice && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setIsHoldingVoice(true);
        setVoiceTargetNode(selectedNode);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isHoldingVoice) {
        setIsHoldingVoice(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedNode, isHoldingVoice, handleUndo]);

  // Google Sign In & Workspace Ingestion
  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (!result) return;
      setWorkspaceUser({
        email: result.user.email,
        displayName: result.user.displayName,
      });
      soundFx.playSuccessChord();

      // Ingest live Gmail & Calendar with the access token
      const token = result.accessToken;
      if (token) {
        // Fetch Gmail
        try {
          const mailRes = await fetch('/app/api/workspace/gmail', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const mailData = await mailRes.json();
          if (mailData.success && mailData.messages?.length > 0) {
            const newTrainCars: SpatialGraphNode[] = mailData.messages.slice(0, 3).map((m: any, idx: number) => ({
              id: `gmail-${m.id}`,
              archetype: 'train_car' as const,
              source: 'gmail' as const,
              title: m.subject || 'Gmail Message',
              summary: `${m.from}: ${m.snippet?.slice(0, 100) || ''}`,
              status: 'idle' as const,
              visualEffect: 'normal' as const,
              activeFaceIndex: 0,
              facets: {
                title: m.subject || 'Gmail Message',
                summary: `${m.from}: ${m.snippet?.slice(0, 100) || ''}`,
                quickActions: ['Pluck to Canvas', 'Archive Email', 'Open in Gmail'],
                metadata: {
                  author: m.from,
                  sourceType: 'gmail' as const,
                  priority: 'medium' as const,
                  url: `https://mail.google.com/mail/u/0/#inbox/${m.id}`,
                },
              },
              position: { x: -8 - idx * 2.5, y: 3.2, z: 0 },
              velocity: { x: 0.45, y: 0, z: 0 },
              color: '#3B82F6',
              ttlSeconds: 60,
              ageSeconds: 0,
              externalId: m.id,
            }));
            setNodes((prev) => [...newTrainCars, ...prev]);
          }
        } catch (e) {
          console.warn('Gmail ingest error:', e);
        }

        // Fetch Calendar Events
        try {
          const calRes = await fetch('/app/api/workspace/calendar', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const calData = await calRes.json();
          if (calData.success && calData.events?.length > 0) {
            const newCalBubbles: SpatialGraphNode[] = calData.events.slice(0, 3).map((ev: any, idx: number) => ({
              id: `cal-${ev.id}`,
              archetype: 'bubble' as const,
              source: 'calendar' as const,
              title: ev.summary || 'Calendar Event',
              summary: ev.description || `Scheduled event at ${ev.start}`,
              status: 'idle' as const,
              visualEffect: 'normal' as const,
              activeFaceIndex: 0,
              facets: {
                title: ev.summary || 'Calendar Event',
                summary: ev.description || `Scheduled event at ${ev.start}`,
                quickActions: ['Join Meeting', 'Reschedule Event', 'Open Calendar'],
                metadata: {
                  sourceType: 'calendar' as const,
                  priority: 'medium' as const,
                  url: ev.htmlLink,
                },
              },
              position: { x: idx * 2.2 - 2, y: 0, z: 0 },
              velocity: { x: 0.01, y: 0.02, z: 0 },
              color: '#10B981',
              scheduledAt: ev.start,
              ageSeconds: 0,
              externalId: ev.id,
            }));
            setNodes((prev) => [...newCalBubbles, ...prev]);
          }
        } catch (e) {
          console.warn('Calendar ingest error:', e);
        }
      }
    } catch (err) {
      console.error('Sign-in failed:', err);
    }
  };

  const handleGoogleSignOut = async () => {
    await logout();
    setWorkspaceUser(null);
  };

  // Pluck a passing train car into a persistent 3D bubble
  const handlePluckTrainCar = async (trainCar: SpatialGraphNode) => {
    pushUndoSnapshot(`Pluck ${trainCar.title}`);
    soundFx.playMarimbaTap(640, 0.15);

    // Turn into persistent bubble
    setNodes((prev) =>
      prev.map((n) =>
        n.id === trainCar.id
          ? {
              ...n,
              archetype: 'bubble',
              ttlSeconds: undefined,
              isExpiring: false,
              visualEffect: 'in_progress',
              position: { x: 0, y: 0.5, z: 0 },
              velocity: { x: 0, y: 0, z: 0 },
            }
          : n
      )
    );

    // Call fast-facet generation
    try {
      const res = await fetch('/app/api/gemini/fast-facet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: `${trainCar.title}. ${trainCar.summary}`, source: trainCar.source }),
      });
      const data = await res.json();
      if (data.success && data.facetData) {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === trainCar.id
              ? {
                  ...n,
                  visualEffect: 'normal',
                  title: data.facetData.title,
                  summary: data.facetData.summary,
                  facets: {
                    ...n.facets,
                    title: data.facetData.title,
                    summary: data.facetData.summary,
                    quickActions: data.facetData.quickActions,
                  },
                }
              : n
          )
        );
      }
    } catch {
      setNodes((prev) =>
        prev.map((n) => (n.id === trainCar.id ? { ...n, visualEffect: 'normal' } : n))
      );
    }
  };

  // Push-to-Talk Deictic Voice Agent Harness
  const handleTranscriptComplete = async (targetNode: SpatialGraphNode, transcript: string) => {
    pushUndoSnapshot(`Voice action on ${targetNode.title}`);
    soundFx.playMarimbaTap(480, 0.1);

    // Set In-Progress visual spark
    setNodes((prev) =>
      prev.map((n) =>
        n.id === targetNode.id
          ? { ...n, visualEffect: 'in_progress' }
          : n
      )
    );

    try {
      const res = await fetch('/app/api/gemini/agent-harness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNode: targetNode,
          transcript,
          allNodes: nodes,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        const result = data.result;

        // Check if external Workspace mutation is required
        if (result.workspaceMutation?.required) {
          setWorkspaceConfirm({
            isOpen: true,
            title: `Execute Google ${result.workspaceMutation.service} Action?`,
            description: result.workspaceMutation.description || `Perform ${result.workspaceMutation.action} for ${targetNode.title}`,
            serviceName: result.workspaceMutation.service,
            onConfirm: async () => {
              setWorkspaceConfirm((c) => ({ ...c, isOpen: false }));
              const token = await getAccessToken();
              if (token) {
                await fetch('/app/api/workspace/mutate', {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    service: result.workspaceMutation.service,
                    action: result.workspaceMutation.action,
                    payload: { messageId: targetNode.externalId, title: targetNode.title },
                  }),
                });
              }
            },
          });
        }

        // Apply updated card data
        setNodes((prev) =>
          prev.map((n) => {
            if (n.id !== targetNode.id) return n;
            return {
              ...n,
              title: result.title || n.title,
              summary: result.summary || n.summary,
              status: (result.status as any) || n.status,
              visualEffect: result.kineticFlipTrigger ? 'gyro_spin' : 'normal',
              scheduledAt: result.scheduledAt || n.scheduledAt,
              facets: {
                ...n.facets,
                title: result.title || n.title,
                summary: result.summary || n.summary,
                quickActions: result.quickActions || n.facets.quickActions,
              },
            };
          })
        );

        soundFx.playSuccessChord();

        // Revert gyro spin back to normal after 2.5s
        setTimeout(() => {
          setNodes((prev) =>
            prev.map((n) => (n.id === targetNode.id ? { ...n, visualEffect: 'normal' } : n))
          );
        }, 2500);
      }
    } catch (err) {
      console.error('Agent harness failed:', err);
      setNodes((prev) =>
        prev.map((n) => (n.id === targetNode.id ? { ...n, visualEffect: 'normal' } : n))
      );
    }
  };

  // Refresh Split-Flap mechanical digest
  const handleRefreshDigest = async () => {
    setIsRefreshingDigest(true);
    soundFx.playClackerSound();
    try {
      const res = await fetch('/app/api/gemini/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeCards: nodes.filter((n) => n.archetype === 'bubble').length,
          prCount: prBeads.length,
          passingCount: prBeads.filter((b) => b.stage === 'approved' || b.stage === 'merged').length,
          failedCount: 0,
        }),
      });
      const data = await res.json();
      if (data.success && data.digest) {
        setSplitFlap((prev) => ({
          ...prev,
          line1: data.digest.line1,
          line2: data.digest.line2,
          line3: data.digest.line3,
          lastUpdated: data.digest.timestamp,
        }));
        soundFx.playClackerSound();
      }
    } catch (err) {
      console.warn('Digest refresh failed:', err);
    } finally {
      setIsRefreshingDigest(false);
    }
  };

  // Add new manual bubble
  const handleAddNewBubble = () => {
    pushUndoSnapshot('Add New Bubble');
    const newId = `bubble-${Date.now()}`;
    const newBubble: SpatialGraphNode = {
      id: newId,
      archetype: 'bubble',
      source: 'todo',
      title: 'New Spatial Task',
      summary: 'Voice hold with Space or click facets to inspect and edit.',
      status: 'idle',
      visualEffect: 'gyro_spin',
      activeFaceIndex: 0,
      facets: {
        title: 'New Spatial Task',
        summary: 'Voice hold with Space or click facets to inspect and edit.',
        quickActions: ['Mark In Progress', 'Prioritize', 'Archive'],
        metadata: {
          sourceType: 'todo',
          priority: 'medium',
          timestamp: 'Just now',
        },
      },
      position: { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 2, z: 0 },
      velocity: { x: (Math.random() - 0.5) * 0.1, y: (Math.random() - 0.5) * 0.1, z: 0 },
      color: '#38BDF8',
      ageSeconds: 0,
    };
    setNodes((prev) => [newBubble, ...prev]);
    soundFx.playMarimbaTap(580, 0.14);

    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => (n.id === newId ? { ...n, visualEffect: 'normal' } : n))
      );
    }, 2000);
  };

  // Toggle Tetris task completion
  const handleToggleTetrisTask = (taskId: string) => {
    setTetrisTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // Trigger quick action from Inspect Modal
  const handleTriggerAction = (targetNode: SpatialGraphNode, action: string) => {
    pushUndoSnapshot(`Trigger ${action} on ${targetNode.title}`);
    soundFx.playMarimbaTap(500, 0.1);

    if (action.toLowerCase().includes('archive') || action.toLowerCase().includes('complete')) {
      setNodes((prev) =>
        prev.map((n) => (n.id === targetNode.id ? { ...n, isExpiring: true } : n))
      );
      setSelectedNode(null);
    } else {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === targetNode.id
            ? {
                ...n,
                status: 'in_progress',
                visualEffect: 'refractive_shimmer',
              }
            : n
        )
      );
      setTimeout(() => {
        setNodes((prev) =>
          prev.map((n) => (n.id === targetNode.id ? { ...n, visualEffect: 'normal' } : n))
        );
      }, 2000);
    }
  };

  const handleSwitchFace = (nodeId: string, faceIndex: number) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, activeFaceIndex: faceIndex } : n))
    );
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode((prev) => (prev ? { ...prev, activeFaceIndex: faceIndex } : null));
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#07090e]">
      {/* 3D WebGL Three.js Canvas Layer */}
      <Canvas3D
        nodes={nodes}
        onNodesUpdate={setNodes}
        physicsConfig={physicsConfig}
        prBeads={prBeads}
        tetrisTasks={tetrisTasks}
        onToggleTetrisTask={handleToggleTetrisTask}
        splitFlap={splitFlap}
        onRefreshSplitFlap={handleRefreshDigest}
        orreryBranches={orreryBranches}
        lavaBubbles={lavaBubbles}
        attentionMode={attentionMode}
        onSelectNode={setSelectedNode}
        selectedNodeId={selectedNode?.id || null}
        onHoldNodeVoice={(node) => {
          if (node) {
            setIsHoldingVoice(true);
            setVoiceTargetNode(node);
          } else {
            setIsHoldingVoice(false);
          }
        }}
        isHoldingVoice={isHoldingVoice}
        onPluckTrainCar={handlePluckTrainCar}
        hudClutchActive={hudClutchActive}
      />

      {/* Title Screen Game Shell */}
      {isTitleOpen && <TitleScreen onStart={() => setIsTitleOpen(false)} />}

      {/* Top Bar Minimal Spec Lockup */}
      {!isTitleOpen && (
        <div className="fixed top-4 left-6 z-30 pointer-events-none flex items-center gap-3">
          <button
            onClick={() => setIsTitleOpen(true)}
            className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d121f]/90 border border-slate-700/60 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="font-bold tracking-wider">AETHERIAL</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-[#0d121f]/60 px-3 py-1 rounded-md border border-slate-800">
            <span>{nodes.filter((n) => n.archetype === 'bubble').length} BUBBLES</span>
            <span>·</span>
            <span>{prBeads.length} PRS</span>
            <span>·</span>
            <span className="text-sky-400 capitalize">{attentionMode.replace('_', ' ')}</span>
          </div>
        </div>
      )}

      {/* Voice Hold Indicator */}
      <VoiceHoldIndicator
        node={voiceTargetNode}
        isActive={isHoldingVoice}
        onTranscriptComplete={handleTranscriptComplete}
      />

      {/* Bubble 4-Face Inspection Drawer */}
      {selectedNode && (
        <BubbleInspectModal
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onTriggerAction={handleTriggerAction}
          onSwitchFace={handleSwitchFace}
        />
      )}

      {/* Physics & Wave Oscillators Debug Drawer */}
      <PhysicsDebugDrawer
        isOpen={isPhysicsOpen}
        onClose={() => setIsPhysicsOpen(false)}
        config={physicsConfig}
        onUpdateConfig={setPhysicsConfig}
        onResetDefaults={() => setPhysicsConfig(createDefaultPhysicsConfig())}
      />

      {/* Workspace Destructive/Mutating Confirmation Modal */}
      <WorkspaceConfirmModal
        isOpen={workspaceConfirm.isOpen}
        onClose={() => setWorkspaceConfirm((c) => ({ ...c, isOpen: false }))}
        onConfirm={workspaceConfirm.onConfirm}
        actionTitle={workspaceConfirm.title}
        actionDescription={workspaceConfirm.description}
        serviceName={workspaceConfirm.serviceName}
      />

      {/* Collapsible Bottom Control Dock */}
      {!isTitleOpen && (
        <ControlDock
          attentionMode={attentionMode}
          onSetAttentionMode={setAttentionMode}
          temporalSpineActive={physicsConfig.temporalSpineActive}
          onToggleTemporalSpine={() => {
            setPhysicsConfig((prev) => ({
              ...prev,
              temporalSpineActive: !prev.temporalSpineActive,
            }));
            soundFx.playMarimbaTap(520, 0.1);
          }}
          isMuted={isMuted}
          onToggleMute={() => {
            const next = !isMuted;
            setIsMuted(next);
            soundFx.isMuted = next;
          }}
          onOpenPhysicsDrawer={() => setIsPhysicsOpen((p) => !p)}
          isPhysicsOpen={isPhysicsOpen}
          onUndo={handleUndo}
          canUndo={undoStack.length > 0}
          isCollapsed={isDockCollapsed}
          onToggleCollapse={() => setIsDockCollapsed((c) => !c)}
          onAddNewBubble={handleAddNewBubble}
          onRefreshDigest={handleRefreshDigest}
          isRefreshingDigest={isRefreshingDigest}
          workspaceUser={workspaceUser}
          onGoogleSignIn={handleGoogleSignIn}
          onGoogleSignOut={handleGoogleSignOut}
          hudClutchActive={hudClutchActive}
          onToggleHudClutch={() => setHudClutchActive((prev) => !prev)}
        />
      )}
    </main>
  );
}

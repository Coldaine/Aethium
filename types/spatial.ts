export type AttentionMode = 'tactile' | 'hud_overlay' | 'ambient_tv';

export type NodeArchetype = 'bubble' | 'train_car';

export type NodeSource = 'todo' | 'note' | 'github_pr' | 'gmail' | 'calendar' | 'drive' | 'keep';

export type NodeStatus = 'idle' | 'in_progress' | 'completed' | 'ci_running' | 'approved' | 'failed';

export type VisualEffectState = 'normal' | 'single_particle_spark' | 'refractive_shimmer' | 'gyro_spin' | 'in_progress';

export interface FacetData {
  title: string;
  summary: string;
  quickActions: string[];
  metadata: {
    author?: string;
    repo?: string;
    branch?: string;
    url?: string;
    sourceType: NodeSource;
    timestamp?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  };
}

export interface SpatialGraphNode {
  id: string;
  archetype: NodeArchetype;
  source: NodeSource;
  title: string;
  summary: string;
  status: NodeStatus;
  visualEffect: VisualEffectState;
  facets: FacetData;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  targetRotation?: { x: number; y: number; z: number };
  activeFaceIndex: number; // 0: Title/Tag, 1: Summary, 2: Actions, 3: Metadata
  clusterId?: string;
  scheduledAt?: string; // ISO date for temporal spine
  ttlSeconds?: number;
  ageSeconds: number;
  isExpiring?: boolean;
  color?: string;
  externalId?: string;
}

export type WaveformType = 'static' | 'sine' | 'triangle' | 'perlin' | 'random_walk';

export interface ForceParameter {
  id: string;
  name: string;
  description: string;
  baseValue: number;
  currentValue: number;
  minVal: number;
  maxVal: number;
  oscillatorEnabled: boolean;
  waveform: WaveformType;
  frequency: number; // cycles per second / Hz
  phase: number;
}

export interface PhysicsWorldConfig {
  driftStrength: ForceParameter;
  edgeGravity: ForceParameter;
  mutualAttraction: ForceParameter;
  vortexTorque: ForceParameter;
  temporalSpinePull: ForceParameter;
  exitYankForce: ForceParameter;
  damping: ForceParameter;
  approachStillnessRadius: ForceParameter;
  temporalSpineActive: boolean;
}

export interface PRBeadItem {
  id: string;
  prNumber: number;
  title: string;
  author: string;
  repo: string;
  stage: 'draft' | 'open' | 'ci_running' | 'approved' | 'merged';
  progress: number; // 0 to 1 along wire track
  color: string;
  summary: string;
}

export interface TetrisTaskTile {
  id: string;
  title: string;
  category: string;
  points: number;
  color: string;
  gridX: number;
  gridY: number;
  width: number;
  height: number;
  completed: boolean;
}

export interface SplitFlapBoardState {
  line1: string;
  line2: string;
  line3: string;
  targetLine1: string;
  targetLine2: string;
  targetLine3: string;
  lastUpdated: string;
  isFlipping: boolean;
}

export interface OrreryBranchPlanet {
  id: string;
  branchName: string;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  color: string;
  prCount: number;
  commitCount: number;
}

export interface LavaBubble {
  id: string;
  name: string;
  y: number;
  targetY: number;
  speed: number;
  size: number;
  heat: number; // 0 to 1
  color: string;
}

export interface UndoAction {
  id: string;
  description: string;
  timestamp: number;
  snapshot: SpatialGraphNode[];
}

export interface WorkspaceUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

import { PhysicsWorldConfig, SpatialGraphNode, ForceParameter } from '@/types/spatial';

export const createDefaultPhysicsConfig = (): PhysicsWorldConfig => ({
  driftStrength: {
    id: 'drift',
    name: 'Ambient Wander / Drift',
    description: 'Gentle wandering force applied across all nodes',
    baseValue: 0.45,
    currentValue: 0.45,
    minVal: 0.1,
    maxVal: 0.9,
    oscillatorEnabled: true,
    waveform: 'sine',
    frequency: 0.1,
    phase: 0,
  },
  edgeGravity: {
    id: 'edgeGravity',
    name: 'Perimeter Gravity',
    description: 'Attraction toward viewport edges to preserve center workspace',
    baseValue: 0.35,
    currentValue: 0.35,
    minVal: 0.05,
    maxVal: 0.8,
    oscillatorEnabled: false,
    waveform: 'triangle',
    frequency: 0.08,
    phase: Math.PI / 4,
  },
  mutualAttraction: {
    id: 'mutualAttraction',
    name: 'Node Cluster Pull & Repulsion',
    description: 'Pull between clustered nodes paired with short-range anti-overlap repulsion',
    baseValue: 0.5,
    currentValue: 0.5,
    minVal: 0.1,
    maxVal: 0.9,
    oscillatorEnabled: true,
    waveform: 'sine',
    frequency: 0.05,
    phase: Math.PI / 2,
  },
  vortexTorque: {
    id: 'vortexTorque',
    name: 'Orbital Vortex Torque',
    description: 'Gentle circular circulation around the canvas center',
    baseValue: 0.25,
    currentValue: 0.25,
    minVal: -0.5,
    maxVal: 0.5,
    oscillatorEnabled: true,
    waveform: 'sine',
    frequency: 0.04,
    phase: 0,
  },
  temporalSpinePull: {
    id: 'temporalSpine',
    name: 'Temporal Spine Gravity',
    description: 'Pull items onto a chronological horizontal timeline line',
    baseValue: 0.85,
    currentValue: 0.85,
    minVal: 0.2,
    maxVal: 1.2,
    oscillatorEnabled: false,
    waveform: 'static',
    frequency: 0.1,
    phase: 0,
  },
  exitYankForce: {
    id: 'exitYank',
    name: 'TTL Exit Yank',
    description: 'Directional gravity yanking expired transient items off-screen',
    baseValue: 1.2,
    currentValue: 1.2,
    minVal: 0.5,
    maxVal: 2.5,
    oscillatorEnabled: false,
    waveform: 'static',
    frequency: 0.1,
    phase: 0,
  },
  damping: {
    id: 'damping',
    name: 'Viscous Air Drag / Damping',
    description: 'Velocity decay per frame to avoid runaway momentum',
    baseValue: 0.92,
    currentValue: 0.92,
    minVal: 0.8,
    maxVal: 0.98,
    oscillatorEnabled: false,
    waveform: 'static',
    frequency: 0.05,
    phase: 0,
  },
  approachStillnessRadius: {
    id: 'approachStillness',
    name: 'Approach Stillness Zone',
    description: 'Damps velocity to near-zero when pointer nears a node',
    baseValue: 2.2,
    currentValue: 2.2,
    minVal: 1.0,
    maxVal: 4.0,
    oscillatorEnabled: false,
    waveform: 'static',
    frequency: 0.05,
    phase: 0,
  },
  temporalSpineActive: false,
});

export function evaluateOscillator(param: ForceParameter, timeSec: number): number {
  if (!param.oscillatorEnabled || param.waveform === 'static') {
    return param.baseValue;
  }

  const range = param.maxVal - param.minVal;
  const mid = param.minVal + range / 2;
  const amp = range / 2;
  const cycle = (timeSec * param.frequency * 2 * Math.PI + param.phase) % (2 * Math.PI);

  switch (param.waveform) {
    case 'sine':
      return mid + amp * Math.sin(cycle);
    case 'triangle': {
      const norm = (cycle / (2 * Math.PI));
      const tri = norm < 0.5 ? 4 * norm - 1 : 3 - 4 * norm;
      return mid + amp * tri;
    }
    case 'perlin': {
      // 1D Perlin-like pseudo noise using harmonic superposition
      const noise =
        0.55 * Math.sin(cycle) +
        0.28 * Math.sin(cycle * 2.3 + 1.2) +
        0.17 * Math.sin(cycle * 4.7 + 2.5);
      return mid + amp * noise;
    }
    case 'random_walk': {
      const step = Math.sin(cycle * 1.5) * Math.cos(cycle * 0.7);
      return mid + amp * step;
    }
    default:
      return param.baseValue;
  }
}

export function updatePhysicsWorld(
  nodes: SpatialGraphNode[],
  config: PhysicsWorldConfig,
  dt: number,
  elapsedSec: number,
  pointerWorldPos: { x: number; y: number; z: number } | null,
  activeGrabId: string | null
): { updatedNodes: SpatialGraphNode[]; expiredIds: string[] } {
  // Clamp delta time to avoid frame skips
  const clampedDt = Math.min(dt, 0.05);

  // Update current values from oscillators
  config.driftStrength.currentValue = evaluateOscillator(config.driftStrength, elapsedSec);
  config.edgeGravity.currentValue = evaluateOscillator(config.edgeGravity, elapsedSec);
  config.mutualAttraction.currentValue = evaluateOscillator(config.mutualAttraction, elapsedSec);
  config.vortexTorque.currentValue = evaluateOscillator(config.vortexTorque, elapsedSec);
  config.temporalSpinePull.currentValue = evaluateOscillator(config.temporalSpinePull, elapsedSec);
  config.exitYankForce.currentValue = evaluateOscillator(config.exitYankForce, elapsedSec);

  const drift = config.driftStrength.currentValue;
  const edgeGrav = config.edgeGravity.currentValue;
  const mutual = config.mutualAttraction.currentValue;
  const vortex = config.vortexTorque.currentValue;
  const spinePull = config.temporalSpinePull.currentValue;
  const yank = config.exitYankForce.currentValue;
  const damping = config.damping.baseValue;
  const approachRadius = config.approachStillnessRadius.baseValue;

  const expiredIds: string[] = [];

  // Bounding workspace box (in Three.js world units)
  const BOUND_X = 7.5;
  const BOUND_Y = 4.2;

  const updatedNodes = nodes.map((node, i) => {
    // If user is actively dragging this node, position is driven by pointer
    if (node.id === activeGrabId) {
      return node;
    }

    // Age transient items
    let age = node.ageSeconds + clampedDt;
    let isExpiring = node.isExpiring;

    if (node.ttlSeconds && age >= node.ttlSeconds) {
      isExpiring = true;
    }

    let fx = 0;
    let fy = 0;
    let fz = 0;

    // 1. TTL Exit Yank (pulls expiring items off the right/bottom edge)
    if (isExpiring) {
      fx += yank * 3.5;
      fy -= yank * 1.5;
      if (node.position.x > BOUND_X + 4 || node.position.y < -BOUND_Y - 3) {
        expiredIds.push(node.id);
      }
    } else {
      // 2. Ambient Drift (pseudo-Brownian wander)
      const driftTime = elapsedSec * 0.8 + i * 1.7;
      fx += Math.sin(driftTime) * drift * 0.5;
      fy += Math.cos(driftTime * 1.2) * drift * 0.5;
      fz += Math.sin(driftTime * 0.7) * drift * 0.2;

      // 3. Perimeter / Edge Gravity (hugs perimeter or soft center bound)
      const distFromCenterSq = node.position.x * node.position.x + node.position.y * node.position.y;
      if (edgeGrav > 0) {
        // Push gently outward toward perimeter borders
        const normDist = Math.min(Math.sqrt(distFromCenterSq) / 5, 1);
        fx += (node.position.x > 0 ? 1 : -1) * edgeGrav * 0.2 * normDist;
        fy += (node.position.y > 0 ? 1 : -1) * edgeGrav * 0.2 * normDist;
      }

      // Soft rebound from screen edges
      if (Math.abs(node.position.x) > BOUND_X) {
        fx -= Math.sign(node.position.x) * (Math.abs(node.position.x) - BOUND_X) * 2.5;
      }
      if (Math.abs(node.position.y) > BOUND_Y) {
        fy -= Math.sign(node.position.y) * (Math.abs(node.position.y) - BOUND_Y) * 2.5;
      }
      if (Math.abs(node.position.z) > 1.8) {
        fz -= Math.sign(node.position.z) * (Math.abs(node.position.z) - 1.8) * 2.0;
      }

      // 4. Orbital Vortex Torque around Z axis
      if (Math.abs(vortex) > 0.01) {
        fx += -node.position.y * vortex * 0.15;
        fy += node.position.x * vortex * 0.15;
      }

      // 5. Mutual Node Attraction / Repulsion
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const other = nodes[j];
        const dx = other.position.x - node.position.x;
        const dy = other.position.y - node.position.y;
        const dz = other.position.z - node.position.z;
        const distSq = dx * dx + dy * dy + dz * dz + 0.001;
        const dist = Math.sqrt(distSq);

        // Anti-overlap repulsion (minimum spacing = 1.6 units)
        const minSpacing = 1.6;
        if (dist < minSpacing) {
          const repelForce = ((minSpacing - dist) / minSpacing) * 3.5;
          fx -= (dx / dist) * repelForce;
          fy -= (dy / dist) * repelForce;
          fz -= (dz / dist) * repelForce;
        }

        // Mutual attraction for shared cluster or source
        const sameCluster = node.clusterId && node.clusterId === other.clusterId;
        const sameSource = node.source === other.source;
        if ((sameCluster || sameSource) && dist > minSpacing && dist < 5.0) {
          const pull = mutual * (sameCluster ? 0.35 : 0.12);
          fx += (dx / dist) * pull;
          fy += (dy / dist) * pull;
          fz += (dz / dist) * pull;
        }
      }

      // 6. Temporal Spine Gravity (when active, aligns chronological items along horizontal line Y=0)
      if (config.temporalSpineActive && node.scheduledAt) {
        // Pull Y toward 0
        fy -= node.position.y * spinePull * 1.8;
        fz -= node.position.z * spinePull * 1.5;
      }

      // 7. Stillness on Approach (if mouse is near, damp speed rapidly)
      if (pointerWorldPos) {
        const pdx = pointerWorldPos.x - node.position.x;
        const pdy = pointerWorldPos.y - node.position.y;
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pdist < approachRadius) {
          const dampingFactor = Math.max(0.1, pdist / approachRadius);
          fx *= dampingFactor;
          fy *= dampingFactor;
          node.velocity.x *= dampingFactor;
          node.velocity.y *= dampingFactor;
        }
      }
    }

    // Symplectic velocity integration with damping
    const vx = (node.velocity.x + fx * clampedDt) * damping;
    const vy = (node.velocity.y + fy * clampedDt) * damping;
    const vz = (node.velocity.z + fz * clampedDt) * damping;

    const px = node.position.x + vx * clampedDt;
    const py = node.position.y + vy * clampedDt;
    const pz = node.position.z + vz * clampedDt;

    return {
      ...node,
      ageSeconds: age,
      isExpiring,
      position: { x: px, y: py, z: pz },
      velocity: { x: vx, y: vy, z: vz },
    };
  });

  return {
    updatedNodes: updatedNodes.filter((n) => !expiredIds.includes(n.id)),
    expiredIds,
  };
}

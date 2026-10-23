'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  SpatialGraphNode,
  PhysicsWorldConfig,
  PRBeadItem,
  TetrisTaskTile,
  SplitFlapBoardState,
  OrreryBranchPlanet,
  LavaBubble,
  AttentionMode,
} from '@/types/spatial';
import { updatePhysicsWorld } from '@/lib/physicsEngine';
import { soundFx } from '@/lib/audioSynth';

interface Canvas3DProps {
  nodes: SpatialGraphNode[];
  onNodesUpdate: (updater: (prev: SpatialGraphNode[]) => SpatialGraphNode[]) => void;
  physicsConfig: PhysicsWorldConfig;
  prBeads: PRBeadItem[];
  tetrisTasks: TetrisTaskTile[];
  onToggleTetrisTask: (id: string) => void;
  splitFlap: SplitFlapBoardState;
  onRefreshSplitFlap: () => void;
  orreryBranches: OrreryBranchPlanet[];
  lavaBubbles: LavaBubble[];
  attentionMode: AttentionMode;
  onSelectNode: (node: SpatialGraphNode | null) => void;
  selectedNodeId: string | null;
  onHoldNodeVoice: (node: SpatialGraphNode | null) => void;
  isHoldingVoice: boolean;
  onPluckTrainCar: (node: SpatialGraphNode) => void;
  hudClutchActive: boolean;
}

export default function Canvas3D({
  nodes,
  onNodesUpdate,
  physicsConfig,
  prBeads,
  tetrisTasks,
  onToggleTetrisTask,
  splitFlap,
  onRefreshSplitFlap,
  orreryBranches,
  lavaBubbles,
  attentionMode,
  onSelectNode,
  selectedNodeId,
  onHoldNodeVoice,
  isHoldingVoice,
  onPluckTrainCar,
  hudClutchActive,
}: Canvas3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Keep references to latest props in refs inside useEffect
  const nodesRef = useRef(nodes);
  const physicsConfigRef = useRef(physicsConfig);
  const selectedNodeIdRef = useRef(selectedNodeId);
  const attentionModeRef = useRef(attentionMode);
  const hudClutchActiveRef = useRef(hudClutchActive);
  const isHoldingVoiceRef = useRef(isHoldingVoice);
  const prBeadsRef = useRef(prBeads);
  const tetrisTasksRef = useRef(tetrisTasks);
  const splitFlapRef = useRef(splitFlap);
  const orreryBranchesRef = useRef(orreryBranches);
  const lavaBubblesRef = useRef(lavaBubbles);
  const onSelectNodeRef = useRef(onSelectNode);
  const onHoldNodeVoiceRef = useRef(onHoldNodeVoice);
  const onPluckTrainCarRef = useRef(onPluckTrainCar);
  const onToggleTetrisTaskRef = useRef(onToggleTetrisTask);
  const onRefreshSplitFlapRef = useRef(onRefreshSplitFlap);

  useEffect(() => {
    nodesRef.current = nodes;
    physicsConfigRef.current = physicsConfig;
    selectedNodeIdRef.current = selectedNodeId;
    attentionModeRef.current = attentionMode;
    hudClutchActiveRef.current = hudClutchActive;
    isHoldingVoiceRef.current = isHoldingVoice;
    prBeadsRef.current = prBeads;
    tetrisTasksRef.current = tetrisTasks;
    splitFlapRef.current = splitFlap;
    orreryBranchesRef.current = orreryBranches;
    lavaBubblesRef.current = lavaBubbles;
    onSelectNodeRef.current = onSelectNode;
    onHoldNodeVoiceRef.current = onHoldNodeVoice;
    onPluckTrainCarRef.current = onPluckTrainCar;
    onToggleTetrisTaskRef.current = onToggleTetrisTask;
    onRefreshSplitFlapRef.current = onRefreshSplitFlap;
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene with atmospheric studio horizon
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080e);
    scene.fog = new THREE.FogExp2(0x06080e, 0.022);

    // Camera framed closer for high-res presence
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.8);

    // Renderer configured for ultra-sharp Hi-DPI (Retina) output
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
      stencil: false,
    });
    renderer.setSize(width, height);
    // Use true devicePixelRatio (capped at 2.5 for 4K/Retina sharpness)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff5e4, 2.6);
    keyLight.position.set(6, 8, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x0f172a, 1.4);
    hemiLight.position.set(0, 12, 0);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLight.position.set(-8, -4, -4);
    scene.add(rimLight);

    // Studio Horizon Floor Grid
    const grid = new THREE.GridHelper(36, 36, 0x0284c7, 0x1e293b);
    grid.position.set(0, -4.2, -1.0);
    const gridMat = grid.material as THREE.LineBasicMaterial;
    gridMat.transparent = true;
    gridMat.opacity = 0.35;
    scene.add(grid);

    // Ambient Luminous Dust Particles
    const dustCount = 280;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 18;
      dustPositions[i + 1] = (Math.random() - 0.5) * 10;
      dustPositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // Master Groups
    const bubblesGroup = new THREE.Group();
    scene.add(bubblesGroup);

    const trainsGroup = new THREE.Group();
    scene.add(trainsGroup);

    const widgetsGroup = new THREE.Group();
    scene.add(widgetsGroup);

    // -------------------------------------------------------------
    // ULTRA-SHARP 1024x1024 PROCEDURAL FACET TEXTURE
    // -------------------------------------------------------------
    function createFacetTexture(node: SpatialGraphNode, faceIndex: number): THREE.CanvasTexture {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Rounded container background with gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
      bgGrad.addColorStop(0, '#0c1222');
      bgGrad.addColorStop(1, '#050811');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1024, 1024);

      // Glowing border
      ctx.strokeStyle = node.color || '#38bdf8';
      ctx.lineWidth = 18;
      ctx.strokeRect(16, 16, 992, 992);

      // Header Banner
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.fillRect(25, 25, 974, 120);

      // Top Tag
      ctx.fillStyle = node.color || '#38bdf8';
      ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(node.source.toUpperCase(), 50, 100);

      // Status Badge
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(node.status.toUpperCase(), 970, 100);
      ctx.textAlign = 'left';

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 64px "Plus Jakarta Sans", sans-serif';
      const words = node.title.split(' ');
      let line = '';
      let y = 230;
      for (let w = 0; w < words.length; w++) {
        const testLine = line + words[w] + ' ';
        if (ctx.measureText(testLine).width > 880 && w > 0) {
          ctx.fillText(line, 50, y);
          line = words[w] + ' ';
          y += 80;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 50, y);

      // Hairline divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(50, y + 40);
      ctx.lineTo(974, y + 40);
      ctx.stroke();

      // Summary
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '40px "Plus Jakarta Sans", sans-serif';
      y += 110;
      const sumWords = (node.summary || '').split(' ');
      line = '';
      for (let w = 0; w < sumWords.length; w++) {
        const testLine = line + sumWords[w] + ' ';
        if (ctx.measureText(testLine).width > 880 && w > 0) {
          ctx.fillText(line, 50, y);
          line = sumWords[w] + ' ';
          y += 56;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 50, y);

      // Bottom Actions Footer
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(40, 840, 944, 130);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 840, 944, 130);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 38px "Plus Jakarta Sans", sans-serif';
      const actions = node.facets?.quickActions?.slice(0, 3).join('   ·   ') || 'HOLD SPACE TO SPEAK';
      ctx.fillText(`⚡ ${actions}`, 80, 920);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    }

    // -------------------------------------------------------------
    // HIGH-RES 256x256 KINETIC LETTER SPRITE TEXTURE
    // -------------------------------------------------------------
    function createLetterTexture(char: string, color: string): THREE.CanvasTexture {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, 256, 256);

      // Subtle radial glow behind character
      const glow = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 256, 256);

      ctx.fillStyle = color;
      ctx.font = 'bold 150px "Syne", "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, 128, 128);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    }

    const nodeMeshMap = new Map<string, THREE.Group>();

    // -------------------------------------------------------------
    // BUILD HIGH-FIDELITY CRYSTALLINE POLYHEDRA BUBBLE
    // -------------------------------------------------------------
    function getOrCreateBubbleMesh(node: SpatialGraphNode): THREE.Group {
      if (nodeMeshMap.has(node.id)) {
        return nodeMeshMap.get(node.id)!;
      }

      const bubbleGroup = new THREE.Group();
      bubbleGroup.userData = { nodeId: node.id, isBubble: true };

      const baseColor = new THREE.Color(node.color || '#38bdf8');

      // 1. Faceted Crystal Shell (Icosahedron with sub-detail for diamond cut)
      const crystalGeo = new THREE.IcosahedronGeometry(0.92, 1);
      const crystalMat = new THREE.MeshPhysicalMaterial({
        color: baseColor,
        roughness: 0.1,
        metalness: 0.25,
        transmission: 0.72,
        transparent: true,
        opacity: 0.88,
        ior: 1.6,
        thickness: 1.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
      });
      const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
      crystalMesh.castShadow = true;
      bubbleGroup.add(crystalMesh);

      // 2. Razor-Sharp Crystalline Diamond Edge Highlights
      const edgesGeo = new THREE.EdgesGeometry(crystalGeo);
      const edgesMat = new THREE.LineBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.85,
        linewidth: 2,
      });
      const edgesMesh = new THREE.LineSegments(edgesGeo, edgesMat);
      bubbleGroup.add(edgesMesh);

      // 3. Inner Glowing Chromatic Core
      const coreGeo = new THREE.SphereGeometry(0.36, 24, 24);
      const coreMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: baseColor,
        emissiveIntensity: 1.8,
        roughness: 0.2,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      bubbleGroup.add(coreMesh);

      // 4. Precision Machined Metallic Gimbal Ring
      const ringGeo = new THREE.TorusGeometry(1.15, 0.03, 16, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        metalness: 0.95,
        roughness: 0.15,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2.2;
      bubbleGroup.add(ringMesh);

      // 5. Facet Display Card
      const facetTex = createFacetTexture(node, node.activeFaceIndex || 0);
      const cardGeo = new THREE.PlaneGeometry(1.28, 1.28);
      const cardMat = new THREE.MeshBasicMaterial({
        map: facetTex,
        transparent: true,
        opacity: 0.96,
        side: THREE.DoubleSide,
      });
      const cardMesh = new THREE.Mesh(cardGeo, cardMat);
      cardMesh.position.set(0, 0, 0.94);
      bubbleGroup.add(cardMesh);

      // 6. Kinetic 3D Floating Title Characters
      const titleChars = (node.title || '').slice(0, 16).split('');
      const charGroup = new THREE.Group();
      charGroup.name = 'kineticTitle';
      charGroup.position.set(0, 1.35, 0);

      const letterSpacing = 0.15;
      const startX = -((titleChars.length - 1) * letterSpacing) / 2;

      titleChars.forEach((char, idx) => {
        const letterTex = createLetterTexture(char, '#ffffff');
        const planeGeo = new THREE.PlaneGeometry(0.26, 0.26);
        const planeMat = new THREE.MeshBasicMaterial({
          map: letterTex,
          transparent: true,
          side: THREE.DoubleSide,
        });
        const planeMesh = new THREE.Mesh(planeGeo, planeMat);
        planeMesh.position.set(startX + idx * letterSpacing, 0, 0);
        planeMesh.userData = { charIndex: idx, baseRotationX: 0, flipPhase: idx * 0.08 };
        charGroup.add(planeMesh);
      });
      bubbleGroup.add(charGroup);

      // 7. Single-Particle Spark Orb
      const sparkGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const sparkMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x38bdf8,
        emissiveIntensity: 2.5,
      });
      const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
      sparkMesh.name = 'sparkOrb';
      sparkMesh.position.set(1.2, 0, 0);
      bubbleGroup.add(sparkMesh);

      bubblesGroup.add(bubbleGroup);
      nodeMeshMap.set(node.id, bubbleGroup);
      return bubbleGroup;
    }

    // -------------------------------------------------------------
    // BUILD HIGH-FIDELITY PASSING TRAIN CARS
    // -------------------------------------------------------------
    function getOrCreateTrainMesh(node: SpatialGraphNode): THREE.Group {
      if (nodeMeshMap.has(node.id)) {
        return nodeMeshMap.get(node.id)!;
      }

      const trainGroup = new THREE.Group();
      trainGroup.userData = { nodeId: node.id, isTrain: true };

      // Chassis
      const bodyGeo = new THREE.BoxGeometry(1.8, 0.65, 0.55);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(node.color || '#3b82f6'),
        metalness: 0.85,
        roughness: 0.2,
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      trainGroup.add(bodyMesh);

      // Couplers
      const beadGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const beadMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
      const beadLeft = new THREE.Mesh(beadGeo, beadMat);
      beadLeft.position.set(-0.95, 0, 0);
      const beadRight = new THREE.Mesh(beadGeo, beadMat);
      beadRight.position.set(0.95, 0, 0);
      trainGroup.add(beadLeft);
      trainGroup.add(beadRight);

      // Neon Cargo Stripe
      const stripeGeo = new THREE.BoxGeometry(1.6, 0.09, 0.58);
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
      trainGroup.add(stripeMesh);

      // Train Title Banner (High Res)
      const bannerTex = createLetterTexture(node.title.slice(0, 18), '#ffffff');
      const bannerGeo = new THREE.PlaneGeometry(1.65, 0.35);
      const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex, transparent: true, side: THREE.DoubleSide });
      const bannerMesh = new THREE.Mesh(bannerGeo, bannerMat);
      bannerMesh.position.set(0, 0.5, 0);
      trainGroup.add(bannerMesh);

      trainsGroup.add(trainGroup);
      nodeMeshMap.set(node.id, trainGroup);
      return trainGroup;
    }

    // -------------------------------------------------------------
    // BUILD 5 SPATIAL CONTRAPTION WIDGETS (HIGH FIDELITY)
    // -------------------------------------------------------------

    // 1. PR Bead Roller Coaster (Dual Tubular Track + Cross-Ties)
    const coasterGroup = new THREE.Group();
    coasterGroup.position.set(-5.6, 0.8, -0.8);
    coasterGroup.scale.set(0.72, 0.72, 0.72);

    const curvePoints = [
      new THREE.Vector3(-1.8, -1.2, 0),
      new THREE.Vector3(-1.2, 1.3, 0.8),
      new THREE.Vector3(0, 1.9, 0),
      new THREE.Vector3(1.2, 0.7, -0.6),
      new THREE.Vector3(1.6, -1.0, 0.4),
      new THREE.Vector3(0, -1.7, 0),
    ];
    const coasterCurve = new THREE.CatmullRomCurve3(curvePoints, true);

    // Primary Rail (200 curve segments, 16 tubular segments)
    const coasterTubeGeo = new THREE.TubeGeometry(coasterCurve, 180, 0.05, 16, true);
    const coasterTubeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15,
    });
    const coasterTrack = new THREE.Mesh(coasterTubeGeo, coasterTubeMat);
    coasterGroup.add(coasterTrack);

    // Support Pylons
    const pylonGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.4, 16);
    const pylon1 = new THREE.Mesh(pylonGeo, coasterTubeMat);
    pylon1.position.set(-1.0, -1.1, 0);
    const pylon2 = new THREE.Mesh(pylonGeo, coasterTubeMat);
    pylon2.position.set(1.0, -1.1, 0);
    coasterGroup.add(pylon1);
    coasterGroup.add(pylon2);

    // Coaster PR Beads (Polished Luminous Spheres)
    const beadMeshes: { mesh: THREE.Mesh; prId: string; speed: number; t: number }[] = [];
    prBeadsRef.current.forEach((bead, i) => {
      const beadGeo = new THREE.SphereGeometry(0.2, 24, 24);
      const beadMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(bead.color),
        emissive: new THREE.Color(bead.color),
        emissiveIntensity: 0.9,
        roughness: 0.15,
        metalness: 0.85,
      });
      const mesh = new THREE.Mesh(beadGeo, beadMat);
      mesh.userData = { prBead: bead };
      coasterGroup.add(mesh);
      beadMeshes.push({
        mesh,
        prId: bead.id,
        speed: 0.06 + i * 0.015,
        t: bead.progress,
      });
    });
    widgetsGroup.add(coasterGroup);

    // 2. Low-Gravity Tetris & Icicle Task Graph (Upper Right)
    const tetrisGroup = new THREE.Group();
    tetrisGroup.position.set(5.6, 0.8, -0.8);
    tetrisGroup.scale.set(0.68, 0.68, 0.68);

    const frameGeo = new THREE.BoxGeometry(3.6, 3.2, 0.4);
    const frameWireMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
    const frameMesh = new THREE.Mesh(frameGeo, frameWireMat);
    tetrisGroup.add(frameMesh);

    const taskMeshes: THREE.Mesh[] = [];
    tetrisTasksRef.current.forEach((t) => {
      const blockGeo = new THREE.BoxGeometry(t.width * 0.75 - 0.08, t.height * 0.75 - 0.08, 0.32);
      const blockMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(t.color),
        transparent: true,
        opacity: t.completed ? 0.35 : 0.9,
        roughness: 0.15,
        metalness: 0.4,
        clearcoat: 0.8,
      });
      const mesh = new THREE.Mesh(blockGeo, blockMat);
      mesh.position.set(t.gridX * 0.75 - 1.2, -t.gridY * 0.75 + 0.8, 0);
      mesh.userData = { taskId: t.id };
      tetrisGroup.add(mesh);
      taskMeshes.push(mesh);
    });
    widgetsGroup.add(tetrisGroup);

    // 3. Split-Flap Digest Clacker Board (Top Center)
    const splitFlapGroup = new THREE.Group();
    splitFlapGroup.position.set(0, 3.2, -1.0);
    splitFlapGroup.scale.set(0.62, 0.62, 0.62);

    const boardChassisGeo = new THREE.BoxGeometry(6.6, 2.1, 0.35);
    const boardChassisMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.25,
      metalness: 0.9,
    });
    const boardChassis = new THREE.Mesh(boardChassisGeo, boardChassisMat);
    boardChassis.userData = { isSplitFlap: true };
    splitFlapGroup.add(boardChassis);

    // 2048x640 High-Res Flap Canvas Texture
    const flapCanvas = document.createElement('canvas');
    flapCanvas.width = 2048;
    flapCanvas.height = 640;
    const flapCtx = flapCanvas.getContext('2d')!;

    function updateFlapTexture(sf: SplitFlapBoardState) {
      flapCtx.imageSmoothingEnabled = true;
      flapCtx.fillStyle = '#020617';
      flapCtx.fillRect(0, 0, 2048, 640);

      flapCtx.strokeStyle = '#38bdf8';
      flapCtx.lineWidth = 8;
      flapCtx.strokeRect(20, 20, 2008, 600);

      // Split lines across the middle of each row
      flapCtx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      flapCtx.lineWidth = 4;
      flapCtx.beginPath();
      flapCtx.moveTo(20, 160);
      flapCtx.lineTo(2028, 160);
      flapCtx.moveTo(20, 320);
      flapCtx.lineTo(2028, 320);
      flapCtx.moveTo(20, 480);
      flapCtx.lineTo(2028, 480);
      flapCtx.stroke();

      flapCtx.fillStyle = '#ffffff';
      flapCtx.font = 'bold 88px "JetBrains Mono", monospace';

      flapCtx.fillText(sf.line1, 70, 150);
      flapCtx.fillText(sf.line2, 70, 310);
      flapCtx.fillText(sf.line3, 70, 470);

      flapCtx.fillStyle = '#38bdf8';
      flapCtx.font = '40px monospace';
      flapCtx.fillText(`DIGEST · ${sf.lastUpdated}`, 1540, 560);
    }
    updateFlapTexture(splitFlapRef.current);

    const flapTexture = new THREE.CanvasTexture(flapCanvas);
    flapTexture.colorSpace = THREE.SRGBColorSpace;
    flapTexture.minFilter = THREE.LinearMipmapLinearFilter;
    flapTexture.magFilter = THREE.LinearFilter;
    flapTexture.generateMipmaps = true;

    const flapPlateGeo = new THREE.PlaneGeometry(6.2, 1.9);
    const flapPlateMat = new THREE.MeshBasicMaterial({ map: flapTexture, side: THREE.DoubleSide });
    const flapPlate = new THREE.Mesh(flapPlateGeo, flapPlateMat);
    flapPlate.position.set(0, 0, 0.19);
    flapPlate.userData = { isSplitFlap: true };
    splitFlapGroup.add(flapPlate);
    widgetsGroup.add(splitFlapGroup);

    // 4. Project Orrery Planetary Rings (Bottom Left)
    const orreryGroup = new THREE.Group();
    orreryGroup.position.set(-5.0, -2.5, -0.8);
    orreryGroup.scale.set(0.68, 0.68, 0.68);

    const sunGeo = new THREE.SphereGeometry(0.38, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    orreryGroup.add(sunMesh);

    const planetMeshes: { mesh: THREE.Mesh; branch: OrreryBranchPlanet }[] = [];
    orreryBranchesRef.current.forEach((b) => {
      const ringGeo = new THREE.TorusGeometry(b.orbitRadius, 0.025, 12, 64);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2.3;
      orreryGroup.add(ringMesh);

      const planetGeo = new THREE.SphereGeometry(0.14, 24, 24);
      const planetMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(b.color), metalness: 0.7, roughness: 0.2 });
      const planetMesh = new THREE.Mesh(planetGeo, planetMat);
      orreryGroup.add(planetMesh);
      planetMeshes.push({ mesh: planetMesh, branch: b });
    });
    widgetsGroup.add(orreryGroup);

    // 5. Thermal Lava Tube (Bottom Right)
    const lavaGroup = new THREE.Group();
    lavaGroup.position.set(5.0, -2.5, -0.8);
    lavaGroup.scale.set(0.68, 0.68, 0.68);

    const tubeGeo = new THREE.CylinderGeometry(0.58, 0.58, 2.9, 32, 1, true);
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.5,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    lavaGroup.add(tubeMesh);

    const capGeo = new THREE.CylinderGeometry(0.64, 0.64, 0.16, 32);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.95, roughness: 0.15 });
    const capTop = new THREE.Mesh(capGeo, capMat);
    capTop.position.set(0, 1.5, 0);
    const capBottom = new THREE.Mesh(capGeo, capMat);
    capBottom.position.set(0, -1.5, 0);
    lavaGroup.add(capTop);
    lavaGroup.add(capBottom);

    const lavaMeshes: { mesh: THREE.Mesh; bubble: LavaBubble }[] = [];
    lavaBubblesRef.current.forEach((lb) => {
      const blobGeo = new THREE.SphereGeometry(lb.size, 24, 24);
      const blobMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(lb.color),
        emissive: new THREE.Color(lb.color),
        emissiveIntensity: lb.heat * 1.5,
        roughness: 0.2,
      });
      const mesh = new THREE.Mesh(blobGeo, blobMat);
      mesh.position.set(0, lb.y, 0);
      lavaGroup.add(mesh);
      lavaMeshes.push({ mesh, bubble: lb });
    });
    widgetsGroup.add(lavaGroup);

    // -------------------------------------------------------------
    // INTERACTION & RAYCASTING
    // -------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let pointerWorldPos: { x: number; y: number; z: number } | null = null;
    let activeGrabId: string | null = null;
    let holdTimer: NodeJS.Timeout | null = null;
    let isHoldInitiated = false;

    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const planeIntersection = new THREE.Vector3();

    function updateMouseCoordinates(e: MouseEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (raycaster.ray.intersectPlane(dragPlane, planeIntersection)) {
        pointerWorldPos = {
          x: planeIntersection.x,
          y: planeIntersection.y,
          z: planeIntersection.z,
        };
      }
    }

    const handlePointerMove = (e: MouseEvent) => {
      if (attentionModeRef.current === 'hud_overlay' && !hudClutchActiveRef.current && !e.altKey) {
        return;
      }
      updateMouseCoordinates(e);

      if (activeGrabId && pointerWorldPos) {
        onNodesUpdate((prev) =>
          prev.map((n) =>
            n.id === activeGrabId
              ? {
                  ...n,
                  position: { x: pointerWorldPos!.x, y: pointerWorldPos!.y, z: n.position.z },
                  velocity: { x: 0, y: 0, z: 0 },
                }
              : n
          )
        );
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (attentionModeRef.current === 'hud_overlay' && !hudClutchActiveRef.current && !e.altKey) {
        return;
      }
      updateMouseCoordinates(e);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let currentObj: THREE.Object3D | null = intersects[0].object;

        while (
          currentObj &&
          !currentObj.userData?.nodeId &&
          !currentObj.userData?.isSplitFlap &&
          !currentObj.userData?.taskId &&
          !currentObj.userData?.prBead
        ) {
          currentObj = currentObj.parent;
        }

        if (currentObj?.userData?.isSplitFlap) {
          soundFx.playClackerSound();
          onRefreshSplitFlapRef.current();
          return;
        }

        if (currentObj?.userData?.taskId) {
          soundFx.playMarimbaTap(620, 0.1);
          onToggleTetrisTaskRef.current(currentObj.userData.taskId);
          return;
        }

        if (currentObj?.userData?.nodeId) {
          const targetNode = nodesRef.current.find((n) => n.id === currentObj!.userData.nodeId);
          if (targetNode) {
            soundFx.playMarimbaTap(540, 0.12);

            if (targetNode.archetype === 'train_car') {
              onPluckTrainCarRef.current(targetNode);
              return;
            }

            activeGrabId = targetNode.id;
            onSelectNodeRef.current(targetNode);

            isHoldInitiated = false;
            if (holdTimer) clearTimeout(holdTimer);
            holdTimer = setTimeout(() => {
              isHoldInitiated = true;
              onHoldNodeVoiceRef.current(targetNode);
            }, 350);
          }
        }
      } else {
        onSelectNodeRef.current(null);
      }
    };

    const handlePointerUp = () => {
      if (holdTimer) clearTimeout(holdTimer);
      if (isHoldInitiated) {
        onHoldNodeVoiceRef.current(null);
      }
      activeGrabId = null;
      isHoldInitiated = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousemove', handlePointerMove);
    domElement.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // -------------------------------------------------------------
    // ANIMATION & PHYSICS STEP
    // -------------------------------------------------------------
    const clock = new THREE.Clock();
    let animId = 0;

    const tick = () => {
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05);
      const elapsed = clock.getElapsedTime();

      // Step physics
      const { updatedNodes, expiredIds } = updatePhysicsWorld(
        nodesRef.current,
        physicsConfigRef.current,
        dt,
        elapsed,
        pointerWorldPos,
        activeGrabId
      );

      if (expiredIds.length > 0) {
        soundFx.playYankWhoosh();
      }

      onNodesUpdate(() => updatedNodes);

      // Ambient Dust Drift
      dustParticles.rotation.y = elapsed * 0.03;
      dustParticles.rotation.x = Math.sin(elapsed * 0.02) * 0.05;

      // Sync 3D Meshes
      updatedNodes.forEach((node) => {
        let meshGroup: THREE.Group;
        if (node.archetype === 'bubble') {
          meshGroup = getOrCreateBubbleMesh(node);
        } else {
          meshGroup = getOrCreateTrainMesh(node);
        }

        meshGroup.position.set(node.position.x, node.position.y, node.position.z);

        const isSelected = selectedNodeIdRef.current === node.id;
        const scaleTarget = isSelected ? 1.15 : 1.0;
        meshGroup.scale.lerp(new THREE.Vector3(scaleTarget, scaleTarget, scaleTarget), 0.1);

        if (node.visualEffect === 'gyro_spin') {
          meshGroup.rotation.x += dt * 3.2;
          meshGroup.rotation.y += dt * 4.0;
        } else {
          meshGroup.rotation.y += dt * 0.35;
          meshGroup.rotation.x = Math.sin(elapsed * 0.5 + node.ageSeconds) * 0.12;
        }

        const kineticGroup = meshGroup.getObjectByName('kineticTitle');
        if (kineticGroup) {
          kineticGroup.children.forEach((child: any) => {
            if (node.visualEffect === 'in_progress' || isHoldingVoiceRef.current) {
              child.rotation.x += dt * 14;
            } else {
              child.position.y = Math.sin(elapsed * 3.2 + (child.userData.flipPhase || 0)) * 0.045;
              child.rotation.x = THREE.MathUtils.lerp(child.rotation.x, 0, 0.1);
            }
          });
        }

        const sparkOrb = meshGroup.getObjectByName('sparkOrb');
        if (sparkOrb) {
          if (node.visualEffect === 'single_particle_spark' || node.visualEffect === 'in_progress') {
            sparkOrb.visible = true;
            const sparkAngle = elapsed * 9;
            sparkOrb.position.set(Math.cos(sparkAngle) * 1.25, Math.sin(sparkAngle) * 1.25, 0);
          } else {
            sparkOrb.visible = false;
          }
        }
      });

      // Cleanup despawned meshes
      for (const [id, grp] of nodeMeshMap.entries()) {
        if (!updatedNodes.some((n) => n.id === id)) {
          bubblesGroup.remove(grp);
          trainsGroup.remove(grp);
          nodeMeshMap.delete(id);
        }
      }

      // Animate Coaster Beads
      beadMeshes.forEach((item) => {
        item.t = (item.t + dt * item.speed) % 1.0;
        const pos = coasterCurve.getPointAt(item.t);
        item.mesh.position.copy(pos);
      });

      // Animate Orrery Planets
      planetMeshes.forEach((item) => {
        item.branch.angle += dt * item.branch.orbitSpeed;
        const r = item.branch.orbitRadius;
        item.mesh.position.set(
          Math.cos(item.branch.angle) * r,
          Math.sin(item.branch.angle) * r * Math.sin(Math.PI / 2.3),
          Math.sin(item.branch.angle) * r * Math.cos(Math.PI / 2.3)
        );
      });

      // Animate Lava Tube Blobs
      lavaMeshes.forEach((item) => {
        item.bubble.y += dt * item.bubble.speed;
        if (item.bubble.y > 1.25) {
          item.bubble.y = -1.25;
        }
        item.mesh.position.y = item.bubble.y;
        item.mesh.position.x = Math.sin(elapsed * 2.2 + item.bubble.y) * 0.16;
      });

      // Split-Flap board update
      updateFlapTexture(splitFlapRef.current);
      flapTexture.needsUpdate = true;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      domElement.removeEventListener('mousemove', handlePointerMove);
      domElement.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('resize', handleResize);

      renderer.dispose();
      pmremGenerator.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 w-full h-full overflow-hidden ${
        attentionMode === 'hud_overlay' && !hudClutchActive
          ? 'pointer-events-none'
          : 'pointer-events-auto'
      }`}
    />
  );
}

'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, Icosahedron, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Colors from design system ─── */
const VIOLET = new THREE.Color('#8B5CF6');
const SIGNAL = new THREE.Color('#34D399');
const MARIGOLD = new THREE.Color('#F2A93B');

/* ─── Types ─── */
interface NodeData {
  id: number;
  position: THREE.Vector3;
  color: THREE.Color;
  scale: number;
  speed: number;
  phaseX: number;
  phaseY: number;
  phaseZ: number;
}

interface EdgeData {
  from: number;
  to: number;
  pulseOffset: number;
}

/* ─── Generate node positions ─── */
function generateNodes(count: number): NodeData[] {
  const nodes: NodeData[] = [];
  const colors = [VIOLET, SIGNAL, VIOLET, SIGNAL, MARIGOLD];

  for (let i = 0; i < count; i++) {
    nodes.push({
      id: i,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8 - 2
      ),
      color: colors[i % colors.length],
      scale: 0.12 + Math.random() * 0.22,
      speed: 0.15 + Math.random() * 0.25,
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      phaseZ: Math.random() * Math.PI * 2,
    });
  }
  return nodes;
}

/* ─── Generate edges (connect nearby nodes) ─── */
function generateEdges(nodes: NodeData[], maxDist: number): EdgeData[] {
  const edges: EdgeData[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = nodes[i].position.distanceTo(nodes[j].position);
      if (dist < maxDist && edges.length < 25) {
        edges.push({ from: i, to: j, pulseOffset: Math.random() * Math.PI * 2 });
      }
    }
  }
  return edges;
}

/* ─── Single glowing node ─── */
function SignalNode({ data, time }: { data: NodeData; time: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const t = time.current;
    meshRef.current.position.x = data.position.x + Math.sin(t * data.speed + data.phaseX) * 0.4;
    meshRef.current.position.y = data.position.y + Math.cos(t * data.speed * 0.8 + data.phaseY) * 0.3;
    meshRef.current.position.z = data.position.z + Math.sin(t * data.speed * 0.6 + data.phaseZ) * 0.2;
    meshRef.current.rotation.x += 0.002;
    meshRef.current.rotation.y += 0.003;
  });

  return (
    <Icosahedron ref={meshRef} args={[data.scale, 1]} position={data.position}>
      <MeshDistortMaterial
        color={data.color}
        emissive={data.color}
        emissiveIntensity={0.4}
        transparent
        opacity={0.35}
        roughness={0.2}
        metalness={0.1}
        distort={0.15}
        speed={1.5}
      />
    </Icosahedron>
  );
}

/* ─── Animated connection line ─── */
function ConnectionLine({
  nodes,
  edge,
  time,
}: {
  nodes: NodeData[];
  edge: EdgeData;
  time: React.MutableRefObject<number>;
}) {
  const lineRef = useRef<any>(null);
  const [opacity, setOpacity] = useState(0.08);

  useFrame(() => {
    const t = time.current;
    // Pulsing opacity — "fires" periodically
    const pulse = Math.sin(t * 0.5 + edge.pulseOffset);
    const newOpacity = pulse > 0.7 ? 0.25 + (pulse - 0.7) * 1.5 : 0.06;
    setOpacity(newOpacity);
  });

  const fromNode = nodes[edge.from];
  const toNode = nodes[edge.to];

  // Approximate current positions using same formula as SignalNode
  const t = 0; // base position for initial render
  const startPos: [number, number, number] = [
    fromNode.position.x,
    fromNode.position.y,
    fromNode.position.z,
  ];
  const endPos: [number, number, number] = [
    toNode.position.x,
    toNode.position.y,
    toNode.position.z,
  ];

  // Use a gradient color between the two node colors
  const mixColor = fromNode.color.clone().lerp(toNode.color, 0.5);

  return (
    <Line
      ref={lineRef}
      points={[startPos, endPos]}
      color={mixColor}
      lineWidth={1}
      transparent
      opacity={opacity}
    />
  );
}

/* ─── Mouse parallax camera controller ─── */
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    // Smooth lerp toward mouse position
    target.current.x += (mouse.current.x * 0.4 - target.current.x) * 0.02;
    target.current.y += (-mouse.current.y * 0.3 - target.current.y) * 0.02;

    camera.position.x = target.current.x;
    camera.position.y = target.current.y + 0.5;
    camera.lookAt(0, 0, -2);
  });

  return null;
}

/* ─── Main Scene ─── */
function Scene() {
  const timeRef = useRef(0);

  const nodes = useMemo(() => generateNodes(16), []);
  const edges = useMemo(() => generateEdges(nodes, 6), [nodes]);

  useFrame((_, delta) => {
    timeRef.current += delta;
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.6} color="#8B5CF6" />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color="#34D399" />

      {/* Nodes */}
      {nodes.map((node) => (
        <SignalNode key={node.id} data={node} time={timeRef} />
      ))}

      {/* Connection lines */}
      {edges.map((edge, i) => (
        <ConnectionLine key={i} nodes={nodes} edge={edge} time={timeRef} />
      ))}

      <CameraRig />
    </>
  );
}

/* ─── Exported Canvas wrapper ─── */
export default function SignalFieldScene() {
  return (
    <div className="absolute inset-0" style={{ zIndex: 0 }}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.5, 8], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <React.Suspense fallback={null}>
          <Scene />
        </React.Suspense>
      </Canvas>
    </div>
  );
}

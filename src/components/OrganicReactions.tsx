import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { reactions, Reaction, ReactionAtom, ReactionBond } from '../utils/reactionData';

const getElementColor = (element: string) => {
  switch (element) {
    case 'C': return '#333333';
    case 'H': return '#ffffff';
    case 'O': return '#ff0000';
    case 'Br': return '#8b0000';
    case 'Cl': return '#00ff00';
    default: return '#cccccc';
  }
};

const getElementRadius = (element: string) => {
  switch (element) {
    case 'C': return 0.4;
    case 'H': return 0.25;
    case 'O': return 0.35;
    case 'Br': return 0.5;
    case 'Cl': return 0.45;
    default: return 0.3;
  }
};

const AnimatedAtom = ({ atom, progressRef, viewMode }: { atom: ReactionAtom; progressRef: React.MutableRefObject<number>; viewMode: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const start = new THREE.Vector3(...atom.startPos);
  const end = new THREE.Vector3(...atom.endPos);
  const mid = start.clone().lerp(end, 0.5);

  const color = getElementColor(atom.element);
  const radius = getElementRadius(atom.element);
  
  useFrame(() => {
    if (!meshRef.current) return;
    const progress = progressRef.current;
    let pos = start;
    if (viewMode === 'full') {
      pos = start.clone().lerp(end, progress);
    } else if (viewMode === 'breaking') {
      pos = start.clone().lerp(mid, progress);
    } else if (viewMode === 'forming') {
      pos = mid.clone().lerp(end, progress);
    }
    meshRef.current.position.copy(pos);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
    </mesh>
  );
};

const AnimatedBond = ({ bond, atoms, progressRef, viewMode }: { bond: ReactionBond; atoms: ReactionAtom[]; progressRef: React.MutableRefObject<number>; viewMode: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const mesh1Ref = useRef<THREE.Mesh>(null);
  const mesh2Ref = useRef<THREE.Mesh>(null);
  const mat1Ref = useRef<THREE.MeshStandardMaterial>(null);
  const mat2Ref = useRef<THREE.MeshStandardMaterial>(null);

  const sourceAtom = atoms.find(a => a.id === bond.source);
  const targetAtom = atoms.find(a => a.id === bond.target);
  if (!sourceAtom || !targetAtom) return null;

  useFrame(() => {
    if (!groupRef.current) return;
    const progress = progressRef.current;

    const getAtomPos = (atom: ReactionAtom) => {
      const start = new THREE.Vector3(...atom.startPos);
      const end = new THREE.Vector3(...atom.endPos);
      const mid = start.clone().lerp(end, 0.5);
      if (viewMode === 'full') return start.clone().lerp(end, progress);
      if (viewMode === 'breaking') return start.clone().lerp(mid, progress);
      return mid.clone().lerp(end, progress);
    };

    const startPos = getAtomPos(sourceAtom);
    const endPos = getAtomPos(targetAtom);

    const distance = startPos.distanceTo(endPos);
    const position = startPos.clone().add(endPos).multiplyScalar(0.5);
    const direction = endPos.clone().sub(startPos).normalize();
    
    const up = new THREE.Vector3(0, 1, 0);
    let quaternion = new THREE.Quaternion();
    if (direction.lengthSq() > 0.0001) {
      quaternion.setFromUnitVectors(up, direction);
    }

    let opacity = 1;
    if (viewMode === 'full') {
      if (bond.behavior === 'breaking' || bond.behavior === 'pi-breaking') {
        opacity = progress < 0.5 ? 1 - (progress * 2) : 0;
      } else if (bond.behavior === 'forming') {
        opacity = progress > 0.5 ? (progress - 0.5) * 2 : 0;
      }
    } else if (viewMode === 'breaking') {
      if (bond.behavior === 'breaking' || bond.behavior === 'pi-breaking') {
        opacity = 1 - progress;
      } else if (bond.behavior === 'forming') {
        opacity = 0;
      }
    } else if (viewMode === 'forming') {
      if (bond.behavior === 'breaking' || bond.behavior === 'pi-breaking') {
        opacity = 0;
      } else if (bond.behavior === 'forming') {
        opacity = progress;
      }
    }

    if (bond.type === 'double') {
      let right = new THREE.Vector3().crossVectors(direction, up);
      if (right.lengthSq() < 0.001) {
        right = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(1, 0, 0));
      }
      right.normalize().multiplyScalar(0.12);
      
      const op1 = 1;
      let op2 = 1;
      
      if (viewMode === 'full') {
        if (bond.behavior === 'pi-breaking') op2 = progress < 0.5 ? 1 - (progress * 2) : 0;
      } else if (viewMode === 'breaking') {
        if (bond.behavior === 'pi-breaking') op2 = 1 - progress;
      } else if (viewMode === 'forming') {
        if (bond.behavior === 'pi-breaking') op2 = 0;
      }

      if (mesh1Ref.current && mat1Ref.current) {
        mesh1Ref.current.position.copy(position.clone().add(right));
        mesh1Ref.current.quaternion.copy(quaternion);
        mesh1Ref.current.scale.set(1, distance, 1);
        mesh1Ref.current.visible = op1 > 0.01;
        mat1Ref.current.opacity = op1;
        mat1Ref.current.transparent = op1 < 1;
      }
      if (mesh2Ref.current && mat2Ref.current) {
        mesh2Ref.current.position.copy(position.clone().sub(right));
        mesh2Ref.current.quaternion.copy(quaternion);
        mesh2Ref.current.scale.set(1, distance, 1);
        mesh2Ref.current.visible = op2 > 0.01;
        mat2Ref.current.opacity = op2;
        mat2Ref.current.transparent = op2 < 1;
      }
    } else {
      if (mesh1Ref.current && mat1Ref.current) {
        mesh1Ref.current.position.copy(position);
        mesh1Ref.current.quaternion.copy(quaternion);
        mesh1Ref.current.scale.set(1, distance, 1);
        mesh1Ref.current.visible = opacity > 0.01;
        mat1Ref.current.opacity = opacity;
        mat1Ref.current.transparent = opacity < 1;
      }
    }
  });

  if (bond.type === 'double') {
    return (
      <group ref={groupRef}>
        <mesh ref={mesh1Ref}>
          <cylinderGeometry args={[0.06, 0.06, 1, 6]} />
          <meshStandardMaterial ref={mat1Ref} color="#aaaaaa" roughness={0.4} />
        </mesh>
        <mesh ref={mesh2Ref}>
          <cylinderGeometry args={[0.06, 0.06, 1, 6]} />
          <meshStandardMaterial ref={mat2Ref} color="#aaaaaa" roughness={0.4} />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      <mesh ref={mesh1Ref}>
        <cylinderGeometry args={[0.08, 0.08, 1, 6]} />
        <meshStandardMaterial ref={mat1Ref} color="#aaaaaa" roughness={0.4} />
      </mesh>
    </group>
  );
};

const ReactionScene = ({ reaction, progressRef, viewMode }: { reaction: Reaction; progressRef: React.MutableRefObject<number>; viewMode: string }) => {
  return (
    <group>
      {reaction.atoms.map(a => <AnimatedAtom key={a.id} atom={a} progressRef={progressRef} viewMode={viewMode} />)}
      {reaction.bonds.map(b => <AnimatedBond key={b.id} bond={b} atoms={reaction.atoms} progressRef={progressRef} viewMode={viewMode} />)}
    </group>
  );
};

const AnimationController = ({ isPlaying, setIsPlaying, progressRef, sliderRef }: any) => {
  useFrame((state, delta) => {
    if (isPlaying) {
      const next = progressRef.current + delta / 3;
      if (next >= 1) {
        progressRef.current = 1;
        setIsPlaying(false);
      } else {
        progressRef.current = next;
      }
      if (sliderRef.current) {
        sliderRef.current.value = progressRef.current.toString();
      }
    }
  });
  return null;
};

export function OrganicReactions() {
  const [selectedId, setSelectedId] = useState(reactions[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const progressRef = useRef(0);
  const sliderRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'full' | 'breaking' | 'forming'>('full');
  const [autoRotate, setAutoRotate] = useState(true);
  
  const reaction = reactions.find(r => r.id === selectedId)!;

  const handleDoubleClick = () => {
    setAutoRotate(!autoRotate);
  };

  const handleReset = () => {
    progressRef.current = 0;
    if (sliderRef.current) sliderRef.current.value = '0';
    setIsPlaying(false);
  };

  const handleSeek = (val: number) => {
    progressRef.current = val;
    if (sliderRef.current) sliderRef.current.value = val.toString();
    setIsPlaying(false);
  };

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-semibold text-slate-800">有机反应列表</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {reactions.map(r => (
            <button
              key={r.id}
              onClick={() => { setSelectedId(r.id); handleReset(); }}
              className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-all ${
                selectedId === r.id 
                  ? 'bg-blue-600 text-white font-medium shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative bg-slate-100" onDoubleClick={handleDoubleClick}>
        <div className="flex-1 relative">
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <color attach="background" args={['#f8fafc']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 10]} intensity={0.8} />
            <ReactionScene reaction={reaction} progressRef={progressRef} viewMode={viewMode} />
            <AnimationController isPlaying={isPlaying} setIsPlaying={setIsPlaying} progressRef={progressRef} sliderRef={sliderRef} />
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true} 
              autoRotate={autoRotate}
              autoRotateSpeed={1.0}
            />
            <Environment preset="city" />
          </Canvas>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 p-5 space-y-4">
            <div className="text-center">
              <h3 className="font-bold text-lg text-slate-800">{reaction.name}</h3>
              <p className="text-sm text-slate-600 font-mono mt-1 bg-slate-100 inline-block px-3 py-1 rounded-full">{reaction.equation}</p>
            </div>
            
            <div className="flex justify-center gap-2 mb-2">
              <button 
                onClick={() => { setViewMode('full'); handleReset(); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === 'full' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                完整反应
              </button>
              <button 
                onClick={() => { setViewMode('breaking'); handleReset(); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === 'breaking' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                仅看断键
              </button>
              <button 
                onClick={() => { setViewMode('forming'); handleReset(); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === 'forming' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                仅看成键
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (progressRef.current >= 1) handleSeek(0);
                  setIsPlaying(!isPlaying);
                }}
                className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                onClick={handleReset}
                className="p-3 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <RotateCcw size={20} />
              </button>
              
              <input
                type="range"
                ref={sliderRef}
                min="0"
                max="1"
                step="0.01"
                defaultValue={0}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl text-sm text-slate-700 border border-blue-100/50 leading-relaxed">
              {reaction.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

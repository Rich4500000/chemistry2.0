import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const v = [
  new THREE.Vector3(1, 1, 1),
  new THREE.Vector3(-1, -1, 1),
  new THREE.Vector3(-1, 1, -1),
  new THREE.Vector3(1, -1, -1)
];

const generateDiamondRings = () => {
  const rings: [number, number, number][][] = [];
  
  for (let i = 0; i < 4; i++) {
    for (let k = i + 1; k < 4; k++) {
      for (let j = 0; j < 4; j++) {
        if (j !== i && j !== k) {
          const ring = [
            new THREE.Vector3(0, 0, 0),
            v[i].clone(),
            v[i].clone().sub(v[j]),
            v[i].clone().sub(v[j]).add(v[k]),
            v[k].clone().sub(v[j]),
            v[k].clone()
          ];
          rings.push(ring.map(vec => [vec.x, vec.y, vec.z] as [number, number, number]));
        }
      }
    }
  }
  return rings;
};

const allRings = generateDiamondRings();

const Bond = ({ start, end }: { start: [number, number, number], end: [number, number, number] }) => {
  const vStart = new THREE.Vector3(...start);
  const vEnd = new THREE.Vector3(...end);
  const distance = vStart.distanceTo(vEnd);
  const position = vStart.clone().add(vEnd).divideScalar(2);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vEnd.clone().sub(vStart).normalize());

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[0.08, 0.08, distance, 8]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>
  );
};

export const DiamondRings: React.FC = () => {
  const [visibleRings, setVisibleRings] = useState(1);

  const { atoms, bonds } = useMemo(() => {
    const uniqueAtoms = new Map<string, [number, number, number]>();
    const uniqueBonds = new Set<string>();
    const bondData: { start: [number, number, number], end: [number, number, number] }[] = [];

    uniqueAtoms.set('0,0,0', [0, 0, 0]);

    for (let i = 0; i < visibleRings; i++) {
      const ring = allRings[i];
      for (let j = 0; j < ring.length; j++) {
        const a = ring[j];
        const b = ring[(j + 1) % 6];
        
        uniqueAtoms.set(a.join(','), a);
        
        const key1 = `${a.join(',')}->${b.join(',')}`;
        const key2 = `${b.join(',')}->${a.join(',')}`;
        
        if (!uniqueBonds.has(key1) && !uniqueBonds.has(key2)) {
          uniqueBonds.add(key1);
          bondData.push({ start: a, end: b });
        }
      }
    }

    return { atoms: Array.from(uniqueAtoms.values()), bonds: bondData };
  }, [visibleRings]);

  return (
    <div className="flex w-full h-full bg-slate-900 text-white">
      <div className="w-1/3 p-8 border-r border-white/10 bg-black/20 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6 text-white">金刚石六元环</h2>
        <p className="text-slate-300 mb-8 leading-relaxed">
          金刚石是典型的共价晶体。每个碳原子与周围4个碳原子形成正四面体。
          在金刚石晶格中，任意一个碳原子都参与构成了 12 个六元环。
        </p>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3 text-slate-200">围绕中心碳原子的六元环数量</h3>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="0" 
                max="12" 
                step="1" 
                value={visibleRings} 
                onChange={(e) => setVisibleRings(parseInt(e.target.value))}
                className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-xl font-bold text-blue-400 w-8 text-center">{visibleRings}</span>
            </div>
            
            <div className="mt-6 flex flex-col gap-2">
              <button onClick={() => setVisibleRings(0)} className="py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors text-left">
                0: 只看中心碳原子
              </button>
              <button onClick={() => setVisibleRings(1)} className="py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors text-left">
                1: 观察一个完整的椅型六元环
              </button>
              <button onClick={() => setVisibleRings(12)} className="py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors text-left">
                12: 显示所有穿过中心原子的六元环
              </button>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h4 className="font-bold text-blue-400 mb-2">结构解析</h4>
            <ul className="text-sm text-slate-300 space-y-2 list-disc pl-4">
              <li>中心红色的球代表我们关注的碳原子。</li>
              <li>金刚石中的六元环不是平面的，而是呈“椅型”构型。</li>
              <li>中心碳原子有4根键，从中任选2根键（组合数为 C(4,2)=6），每对键都可以形成2个不同的六元环，因此总共有 6 × 2 = 12 个六元环。</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="w-2/3 relative flex flex-col">
        <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
          <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 20, 10]} intensity={1} />
            <directionalLight position={[-10, -20, -10]} intensity={0.5} />
            <OrbitControls autoRotate autoRotateSpeed={1} enableZoom={true} />
            
            {atoms.map((pos, i) => {
              const isCenter = pos[0] === 0 && pos[1] === 0 && pos[2] === 0;
              return (
                <Sphere key={`c-${i}`} args={[isCenter ? 0.3 : 0.25, 32, 32]} position={pos}>
                  <meshStandardMaterial color={isCenter ? "#ef4444" : "#334155"} roughness={0.2} metalness={0.8} />
                </Sphere>
              );
            })}

            {bonds.map((bond, i) => (
              <Bond key={`bond-${i}`} start={bond.start} end={bond.end} />
            ))}
          </Canvas>
        </div>
      </div>
    </div>
  );
};

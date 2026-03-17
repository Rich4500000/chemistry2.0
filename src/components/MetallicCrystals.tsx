import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { elements } from '../data/elements';
import { generateFCC, generateBCC } from '../utils/crystalGenerators';
import { motion } from 'framer-motion';

const getElementData = (atomicNumber: number) => elements.find(e => e.atomicNumber === atomicNumber) || elements[0];

const ElectronCloud = ({ flow }: { flow: boolean }) => {
  const count = 300;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8),
      vel: new THREE.Vector3((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05)
    }));
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    
    particles.forEach((p, i) => {
      // Add flow velocity if electric field is applied
      if (flow) {
        p.pos.x += 0.08; // Flow to the right
      } else {
        p.pos.add(p.vel);
      }

      // Wrap around bounds
      if (p.pos.x > 4) p.pos.x = -4;
      if (p.pos.x < -4) p.pos.x = 4;
      if (p.pos.y > 4) p.pos.y = -4;
      if (p.pos.y < -4) p.pos.y = 4;
      if (p.pos.z > 4) p.pos.z = -4;
      if (p.pos.z < -4) p.pos.z = 4;

      dummy.position.copy(p.pos);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshBasicMaterial color="#60a5fa" transparent opacity={0.8} />
    </instancedMesh>
  );
};

const MetalLattice = ({ atomicNumber }: { atomicNumber: number }) => {
  const elem = getElementData(atomicNumber);
  const radius = Math.max(0.2, (elem.radius || 1.0) * 0.3);
  const size = 3;
  const a = 2.5;
  const offset = (size * a) / 2;

  const ions = useMemo(() => {
    const pos = [];
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          pos.push([x * a - offset + a/2, y * a - offset + a/2, z * a - offset + a/2]);
        }
      }
    }
    return pos;
  }, [a, offset, size]);

  return (
    <group>
      {ions.map((pos, i) => (
        <Sphere key={i} args={[radius, 32, 32]} position={pos as [number, number, number]}>
          <meshStandardMaterial color={elem.color || '#ffffff'} roughness={0.3} metalness={0.8} />
        </Sphere>
      ))}
      {ions.map((pos, i) => (
        <UnitCellBox key={`cell-${i}`} position={pos as [number, number, number]} size={a} />
      ))}
    </group>
  );
};

const Bond = ({ start, end }: { start: [number, number, number], end: [number, number, number] }) => {
  const vStart = new THREE.Vector3(...start);
  const vEnd = new THREE.Vector3(...end);
  const distance = vStart.distanceTo(vEnd);
  const position = vStart.clone().add(vEnd).divideScalar(2);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vEnd.clone().sub(vStart).normalize());

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[0.1, 0.1, distance, 8]} />
      <meshStandardMaterial color="#fbbf24" transparent opacity={0.6} />
    </mesh>
  );
};

const Atom = ({ position, atomicNumber }: { position: [number, number, number], atomicNumber: number }) => {
  const elem = getElementData(atomicNumber);
  const radius = Math.max(0.2, (elem.radius || 1.0) * 0.3);
  
  return (
    <Sphere args={[radius, 32, 32]} position={position}>
      <meshStandardMaterial color={elem.color || '#ffffff'} roughness={0.3} metalness={0.8} />
    </Sphere>
  );
};

const UnitCellBox = ({ position, size }: { position: [number, number, number], size: number }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[size, size, size]} />
      <meshBasicMaterial visible={false} />
      <Edges linewidth={2} color="white" transparent opacity={0.3} depthWrite={false} />
    </mesh>
  );
};

const CrystalViewer = ({ crystalData }: { crystalData: { atoms: any[], bonds: any[], unitCells?: any[] } }) => {
  return (
    <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} />
      <directionalLight position={[-10, -10, -10]} intensity={0.5} />
      <OrbitControls autoRotate autoRotateSpeed={1.0} enableZoom={true} />
      
      {crystalData.atoms.map((atom, i) => (
        <Atom key={`atom-${i}`} position={atom.pos} atomicNumber={atom.element} />
      ))}
      
      {crystalData.bonds.map((bond, i) => (
        <Bond key={`bond-${i}`} start={bond.start} end={bond.end} />
      ))}

      {crystalData.unitCells?.map((cell, i) => (
        <UnitCellBox key={`cell-${i}`} position={cell.pos} size={cell.size} />
      ))}
    </Canvas>
  );
};


import { metallicGenerators } from '../utils/crystalGenerators';

export const MetallicCrystals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'theory' | 'crystal'>('theory');
  const [activeCrystalId, setActiveCrystalId] = useState<string>(metallicGenerators[0].id);
  const [flow, setFlow] = useState(false);
  const [size, setSize] = useState<number>(2);

  const activeCrystal = useMemo(() => metallicGenerators.find(c => c.id === activeCrystalId)!, [activeCrystalId]);
  const crystalData = useMemo(() => activeCrystal.gen(size), [activeCrystal, size]);

  return (
    <div className="flex w-full h-full bg-slate-900 text-white">
      <div className="w-1/3 p-8 border-r border-white/10 bg-black/20 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6 text-white">金属晶体</h2>
        <p className="text-slate-300 mb-8 leading-relaxed">
          金属晶体由带正电的金属阳离子和自由移动的价电子（电子气）组成。这种特殊的“金属键”赋予了金属导电、导热和延展性。
        </p>
        
        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg shrink-0 border border-white/10">
          <button
            onClick={() => setActiveTab('theory')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'theory' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            电子气理论
          </button>
          <button
            onClick={() => setActiveTab('crystal')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'crystal' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            晶体结构
          </button>
        </div>

        {activeTab === 'crystal' && (
          <>
            <div className="space-y-2 mb-6">
              {metallicGenerators.map(crystal => (
                <button
                  key={crystal.id}
                  onClick={() => setActiveCrystalId(crystal.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeCrystalId === crystal.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="font-bold">{crystal.name}</div>
                  <div className="text-xs mt-1 opacity-80">{crystal.description}</div>
                </button>
              ))}
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6 shrink-0">
              <h3 className="text-sm font-bold text-slate-300 mb-3">晶胞数量 (N × N × N)</h3>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" 
                  max="9" 
                  step="1" 
                  value={size} 
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-xl font-bold text-blue-400 w-8 text-center">{size}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                提示：数量过大可能会导致渲染卡顿。
              </p>
            </div>
          </>
        )}

        <div className="space-y-6">
          {activeTab === 'theory' && (
            <>
              <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                <h3 className="text-lg font-bold text-blue-400 mb-3">施加外加电场</h3>
                <p className="text-sm text-slate-300 mb-4">
                  当没有外加电场时，自由电子在金属阳离子之间做无规则的热运动。
                  当施加外加电场时，自由电子会发生定向移动，形成电流。
                </p>
                <button
                  onClick={() => setFlow(!flow)}
                  className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
                    flow 
                      ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' 
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {flow ? '关闭电场 (无规则运动)' : '开启电场 (定向移动)'}
                </button>
              </div>

              <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                <h4 className="font-bold text-emerald-400 mb-2">模型说明</h4>
                <ul className="text-sm text-slate-300 space-y-2 list-disc pl-4">
                  <li><span className="text-orange-400 font-bold">橙色大球</span>：代表金属阳离子，固定在晶格节点上。</li>
                  <li><span className="text-blue-400 font-bold">蓝色小球</span>：代表自由电子（电子气），在整个晶体中自由穿梭。</li>
                  <li>金属键没有方向性和饱和性，因此金属可以被锻打变形而不破裂。</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="w-2/3 relative flex flex-col">
        <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
          {activeTab === 'theory' && (
            <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 20, 10]} intensity={1.5} />
              <directionalLight position={[-10, -20, -10]} intensity={0.5} />
              <OrbitControls autoRotate={!flow} autoRotateSpeed={0.5} enableZoom={true} />
              
              <MetalLattice atomicNumber={29} /> {/* Copper */}
              <ElectronCloud flow={flow} />
            </Canvas>
          )}
          {activeTab === 'crystal' && <CrystalViewer key={`${activeCrystal.id}-${size}`} crystalData={crystalData} />}
        </div>
      </div>
    </div>
  );
};

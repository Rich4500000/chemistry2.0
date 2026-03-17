import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { ionicGenerators, CrystalGenerator, BondType } from '../utils/crystalGenerators';
import { elements } from '../data/elements';

const getElementData = (atomicNumber: number) => elements.find(e => e.atomicNumber === atomicNumber) || elements[0];

const Bond = ({ start, end, type }: { start: [number, number, number], end: [number, number, number], type: BondType }) => {
  const vStart = new THREE.Vector3(...start);
  const vEnd = new THREE.Vector3(...end);
  const distance = vStart.distanceTo(vEnd);
  const position = vStart.clone().add(vEnd).divideScalar(2);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vEnd.clone().sub(vStart).normalize());

  if (type === 'vdw') {
    return null; // Don't render VDW bonds explicitly
  }

  const isIonic = type === 'ionic';
  const radius = isIonic ? 0.02 : 0.06;
  const color = isIonic ? '#94a3b8' : '#cbd5e1';
  const opacity = isIonic ? 0.4 : 1.0;

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, distance, 8]} />
      <meshStandardMaterial color={color} transparent={isIonic} opacity={opacity} />
    </mesh>
  );
};

const Atom = ({ position, atomicNumber }: { position: [number, number, number], atomicNumber: number }) => {
  const elem = getElementData(atomicNumber);
  const radius = Math.max(0.2, (elem.radius || 1.0) * 0.3);
  
  return (
    <Sphere args={[radius, 32, 32]} position={position}>
      <meshStandardMaterial color={elem.color || '#ffffff'} roughness={0.3} metalness={0.5} />
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
        <Bond key={`bond-${i}`} start={bond.start} end={bond.end} type={bond.type} />
      ))}

      {crystalData.unitCells?.map((cell, i) => (
        <UnitCellBox key={`cell-${i}`} position={cell.pos} size={cell.size} />
      ))}
    </Canvas>
  );
};

export const IonicCrystals: React.FC = () => {
  const [activeCrystalId, setActiveCrystalId] = useState<string>(ionicGenerators[0].id);
  const [size, setSize] = useState<number>(2);

  const activeCrystal = useMemo(() => ionicGenerators.find(c => c.id === activeCrystalId)!, [activeCrystalId]);
  const crystalData = useMemo(() => activeCrystal.gen(size), [activeCrystal, size]);

  return (
    <div className="flex w-full h-full bg-slate-50">
      <div className="w-1/3 p-6 border-r border-slate-200 bg-white overflow-y-auto flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">离子晶体</h2>
        <p className="text-slate-600 mb-6 text-sm">
          离子晶体是由正负离子通过静电引力（离子键）结合而成的晶体。
        </p>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 shrink-0">
          <h3 className="text-sm font-bold text-slate-700 mb-3">晶胞数量 (N × N × N)</h3>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="1" 
              max="9" 
              step="1" 
              value={size} 
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="flex-1 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-xl font-bold text-blue-600 w-8 text-center">{size}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            提示：数量过大可能会导致渲染卡顿。
          </p>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto pr-2">
          {ionicGenerators.map((crystal) => (
            <motion.button
              key={crystal.id}
              onClick={() => setActiveCrystalId(crystal.id)}
              className={`w-full text-left p-3 rounded-xl transition-all ${
                activeCrystalId === crystal.id 
                  ? 'bg-blue-50 border-blue-200 shadow-sm border' 
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <h3 className={`font-bold ${activeCrystalId === crystal.id ? 'text-blue-700' : 'text-slate-700'}`}>
                {crystal.name}
              </h3>
            </motion.button>
          ))}
        </div>
      </div>
      
      <div className="w-2/3 relative flex flex-col bg-slate-900">
        <div className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 max-w-md">
          <h3 className="text-xl font-bold text-white mb-2">{activeCrystal.name}</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{activeCrystal.description}</p>
          <div className="mt-3 flex gap-2">
            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
              离子键
            </span>
          </div>
        </div>
        <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
          <CrystalViewer key={`${activeCrystal.id}-${size}`} crystalData={crystalData} />
        </div>
      </div>
    </div>
  );
};

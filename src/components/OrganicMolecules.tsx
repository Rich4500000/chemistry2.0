import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { elements } from '../data/elements';
import { generatedOrganicMolecules } from '../data/organicMolecules';
import { MoleculeData, BondType } from '../utils/organicGenerators';

const getElementData = (atomicNumber: number) => elements.find(e => e.atomicNumber === atomicNumber) || elements[0];

const Bond = ({ start, end, type }: { start: [number, number, number], end: [number, number, number], type: BondType }) => {
  const vStart = new THREE.Vector3(...start);
  const vEnd = new THREE.Vector3(...end);
  const distance = vStart.distanceTo(vEnd);
  const position = vStart.clone().add(vEnd).divideScalar(2);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vEnd.clone().sub(vStart).normalize());

  const radius = 0.08;
  const color = '#94a3b8';

  if (type === 'single') {
    return (
      <mesh position={position} quaternion={quaternion}>
        <cylinderGeometry args={[radius, radius, distance, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  } else if (type === 'double') {
    const offset = 0.12;
    return (
      <group position={position} quaternion={quaternion}>
        <mesh position={[offset, 0, 0]}>
          <cylinderGeometry args={[radius, radius, distance, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[-offset, 0, 0]}>
          <cylinderGeometry args={[radius, radius, distance, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    );
  } else if (type === 'triple') {
    const offset = 0.15;
    return (
      <group position={position} quaternion={quaternion}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[radius, radius, distance, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[offset, 0, 0]}>
          <cylinderGeometry args={[radius, radius, distance, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[-offset, 0, 0]}>
          <cylinderGeometry args={[radius, radius, distance, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    );
  }
  return null;
};

const Atom = ({ position, atomicNumber }: { position: [number, number, number], atomicNumber: number }) => {
  const elem = getElementData(atomicNumber);
  // Scale down radii slightly for molecules
  const radius = Math.max(0.2, (elem.radius || 1.0) * 0.4);
  
  return (
    <Sphere args={[radius, 32, 32]} position={position}>
      <meshStandardMaterial color={elem.color || '#ffffff'} roughness={0.3} metalness={0.2} />
    </Sphere>
  );
};

const MoleculeViewer = ({ molecule }: { molecule: MoleculeData }) => {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} />
      <directionalLight position={[-10, -10, -10]} intensity={0.5} />
      <OrbitControls autoRotate autoRotateSpeed={2.0} enableZoom={true} />
      
      <group>
        {molecule.atoms.map((atom, i) => (
          <Atom key={`atom-${i}`} position={atom.pos} atomicNumber={atom.element} />
        ))}
        
        {molecule.bonds.map((bond, i) => (
          <Bond key={`bond-${i}`} start={bond.start} end={bond.end} type={bond.type} />
        ))}
      </group>
    </Canvas>
  );
};

export const OrganicMolecules: React.FC = () => {
  const [activeMoleculeId, setActiveMoleculeId] = useState<string>(generatedOrganicMolecules[0].id);
  const activeMolecule = useMemo(() => generatedOrganicMolecules.find(m => m.id === activeMoleculeId)!, [activeMoleculeId]);

  // Group molecules by category
  const groupedMolecules = useMemo(() => {
    const groups: Record<string, MoleculeData[]> = {};
    generatedOrganicMolecules.forEach(m => {
      if (!groups[m.category]) groups[m.category] = [];
      groups[m.category].push(m);
    });
    return groups;
  }, []);

  return (
    <div className="flex w-full h-full bg-slate-50">
      <div className="w-1/3 p-6 border-r border-slate-200 bg-white overflow-y-auto flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">有机物模型</h2>
        <p className="text-slate-600 mb-6 text-sm">
          有机物通常是由碳、氢、氧等元素组成的共价化合物。这里展示了超过90种常见的有机物模型。
        </p>

        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
          {Object.entries(groupedMolecules).map(([category, molecules]) => (
            <div key={category} className="space-y-2">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider sticky top-0 bg-white py-2 z-10">
                {category}
              </h3>
              {molecules.map((molecule) => (
                <motion.button
                  key={molecule.id}
                  onClick={() => setActiveMoleculeId(molecule.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    activeMoleculeId === molecule.id 
                      ? 'bg-emerald-50 border-emerald-200 shadow-sm border' 
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex justify-between items-center">
                    <h3 className={`font-bold ${activeMoleculeId === molecule.id ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {molecule.name}
                    </h3>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {molecule.formula}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="w-2/3 relative flex flex-col bg-slate-900">
        <div className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 max-w-md">
          <div className="flex items-end gap-3 mb-2">
            <h3 className="text-xl font-bold text-white">{activeMolecule.name}</h3>
            <span className="text-lg font-mono text-emerald-400">{activeMolecule.formula}</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{activeMolecule.description}</p>
          <div className="mt-3 flex gap-2">
            <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
              共价键
            </span>
            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
              {activeMolecule.category}
            </span>
          </div>
        </div>
        <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
          <MoleculeViewer key={activeMolecule.id} molecule={activeMolecule} />
        </div>
      </div>
    </div>
  );
};

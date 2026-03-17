import React, { useState, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { elements } from '../data/elements';
import { BondType } from '../utils/crystalGenerators';
import { Trash2, Plus, Link as LinkIcon } from 'lucide-react';

const getElementData = (atomicNumber: number) => elements.find(e => e.atomicNumber === atomicNumber) || elements[0];

interface AtomData {
  id: string;
  element: number;
  pos: [number, number, number];
}

interface BondData {
  id: string;
  startId: string;
  endId: string;
  type: BondType;
}

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
  const isMetallic = type === 'metallic';
  const radius = isIonic ? 0.02 : isMetallic ? 0.1 : 0.06;
  const color = isIonic ? '#94a3b8' : isMetallic ? '#fbbf24' : '#cbd5e1';
  const opacity = isIonic ? 0.4 : isMetallic ? 0.6 : 1.0;

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, distance, 8]} />
      <meshStandardMaterial color={color} transparent={isIonic || isMetallic} opacity={opacity} />
    </mesh>
  );
};

export const CustomBuilder: React.FC = () => {
  const [atoms, setAtoms] = useState<AtomData[]>([]);
  const [bonds, setBonds] = useState<BondData[]>([]);
  const [selectedElement, setSelectedElement] = useState(6); // Carbon
  const [selectedBondType, setSelectedBondType] = useState<BondType>('covalent');
  const [selectedAtoms, setSelectedAtoms] = useState<string[]>([]);
  const [zLevel, setZLevel] = useState(0);

  const handlePlaneClick = (e: any) => {
    e.stopPropagation();
    const { point } = e;
    // Snap to grid
    const x = Math.round(point.x);
    const y = Math.round(point.y);
    const z = zLevel;

    const newAtom: AtomData = {
      id: Math.random().toString(36).substr(2, 9),
      element: selectedElement,
      pos: [x, y, z]
    };
    setAtoms([...atoms, newAtom]);
  };

  const handleAtomClick = (e: any, id: string) => {
    e.stopPropagation();
    setSelectedAtoms(prev => {
      if (prev.includes(id)) {
        return prev.filter(a => a !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const createBond = () => {
    if (selectedAtoms.length === 2) {
      const newBond: BondData = {
        id: Math.random().toString(36).substr(2, 9),
        startId: selectedAtoms[0],
        endId: selectedAtoms[1],
        type: selectedBondType
      };
      setBonds([...bonds, newBond]);
      setSelectedAtoms([]);
    }
  };

  const clearAll = () => {
    setAtoms([]);
    setBonds([]);
    setSelectedAtoms([]);
  };

  return (
    <div className="flex w-full h-full bg-slate-50">
      <div className="w-1/3 p-6 border-r border-slate-200 bg-white overflow-y-auto flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">自定义搭建晶胞</h2>
        <p className="text-slate-600 mb-6 text-sm">
          点击右侧网格平面添加原子。选中两个原子后点击“连接”创建化学键。
        </p>
        
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-3">1. 选择元素 (前四周期)</h3>
            <select 
              value={selectedElement} 
              onChange={(e) => setSelectedElement(parseInt(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
            >
              {elements.map(e => (
                <option key={e.atomicNumber} value={e.atomicNumber}>
                  {e.atomicNumber} - {e.symbol} ({e.name})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-3">2. 调整 Z 轴高度 (层级)</h3>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="-5" 
                max="5" 
                step="1" 
                value={zLevel} 
                onChange={(e) => setZLevel(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono font-bold w-8 text-right">{zLevel}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">调整高度以在不同层面上放置原子。</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-3">3. 创建化学键</h3>
            <select 
              value={selectedBondType} 
              onChange={(e) => setSelectedBondType(e.target.value as BondType)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white mb-3"
            >
              <option value="covalent">共价键 (实线)</option>
              <option value="ionic">离子键 (细半透明)</option>
              <option value="metallic">金属键 (粗半透明)</option>
            </select>
            
            <button 
              onClick={createBond}
              disabled={selectedAtoms.length !== 2}
              className={`w-full py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                selectedAtoms.length === 2 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <LinkIcon size={18} />
              连接选中的原子 ({selectedAtoms.length}/2)
            </button>
          </div>

          <button 
            onClick={clearAll}
            className="w-full py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 size={18} />
            清空画布
          </button>
        </div>
      </div>
      
      <div className="w-2/3 relative flex flex-col bg-slate-900">
        <div className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
          <p className="text-white text-sm">
            当前 Z 高度: <span className="font-bold text-blue-400">{zLevel}</span>
          </p>
          <p className="text-slate-300 text-xs mt-1">
            点击网格添加原子。点击原子进行选中。
          </p>
        </div>
        
        <div className="flex-1 w-full h-full cursor-crosshair">
          <Canvas camera={{ position: [0, -10, 10], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 10]} intensity={1} />
            <directionalLight position={[-10, -10, -10]} intensity={0.5} />
            <OrbitControls enableRotate={true} enableZoom={true} enablePan={true} />
            
            <gridHelper args={[20, 20, '#475569', '#1e293b']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, zLevel]} />
            
            <Plane 
              args={[20, 20]} 
              rotation={[0, 0, 0]} 
              position={[0, 0, zLevel]} 
              visible={false} 
              onClick={handlePlaneClick} 
            />

            {atoms.map((atom) => {
              const elem = getElementData(atom.element);
              const radius = Math.max(0.2, (elem.radius || 1.0) * 0.3);
              const isSelected = selectedAtoms.includes(atom.id);
              
              return (
                <Sphere 
                  key={atom.id} 
                  args={[radius, 32, 32]} 
                  position={atom.pos}
                  onClick={(e) => handleAtomClick(e, atom.id)}
                >
                  <meshStandardMaterial 
                    color={isSelected ? '#3b82f6' : (elem.color || '#ffffff')} 
                    roughness={0.3} 
                    metalness={0.5} 
                    emissive={isSelected ? '#3b82f6' : '#000000'}
                    emissiveIntensity={isSelected ? 0.5 : 0}
                  />
                </Sphere>
              );
            })}

            {bonds.map((bond) => {
              const startAtom = atoms.find(a => a.id === bond.startId);
              const endAtom = atoms.find(a => a.id === bond.endId);
              if (!startAtom || !endAtom) return null;
              return (
                <Bond 
                  key={bond.id} 
                  start={startAtom.pos} 
                  end={endAtom.pos} 
                  type={bond.type} 
                />
              );
            })}
          </Canvas>
        </div>
      </div>
    </div>
  );
};

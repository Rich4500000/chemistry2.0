import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

const InstancedAtoms = ({ positions, color, radius }: { positions: THREE.Vector3[], color: string, radius: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (meshRef.current && positions.length > 0) {
      positions.forEach((pos, i) => {
        dummy.position.copy(pos);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [positions, dummy]);

  if (positions.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, positions.length]}>
      <sphereGeometry args={[radius, 12, 12]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
    </instancedMesh>
  );
};

const InstancedBonds = ({ bonds, color, radius }: { bonds: {start: THREE.Vector3, end: THREE.Vector3}[], color: string, radius: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (meshRef.current && bonds.length > 0) {
      bonds.forEach((bond, i) => {
        const distance = bond.start.distanceTo(bond.end);
        const position = bond.start.clone().add(bond.end).multiplyScalar(0.5);
        const direction = bond.end.clone().sub(bond.start).normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        
        dummy.position.copy(position);
        dummy.quaternion.copy(quaternion);
        dummy.scale.set(1, distance, 1);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [bonds, dummy]);

  if (bonds.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, bonds.length]}>
      <cylinderGeometry args={[radius, radius, 1, 6]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </instancedMesh>
  );
};

const SiO2Model = () => {
  const { siAtoms, oAtoms, bonds } = useMemo(() => {
    const siAtoms: THREE.Vector3[] = [];
    const oAtoms: THREE.Vector3[] = [];
    const bonds: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    
    const a = 3.0;
    
    const basePoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(a/2, a/2, 0),
      new THREE.Vector3(a/2, 0, a/2),
      new THREE.Vector3(0, a/2, a/2),
      new THREE.Vector3(a/4, a/4, a/4),
      new THREE.Vector3(3*a/4, 3*a/4, a/4),
      new THREE.Vector3(3*a/4, a/4, 3*a/4),
      new THREE.Vector3(a/4, 3*a/4, 3*a/4),
    ];
    
    for (let x = -1; x <= 0; x++) {
      for (let y = -1; y <= 0; y++) {
        for (let z = -1; z <= 0; z++) {
          const offset = new THREE.Vector3(x*a, y*a, z*a);
          basePoints.forEach(p => {
            const pos = p.clone().add(offset);
            if (pos.length() < 3.5) {
              if (!siAtoms.some(existing => existing.distanceTo(pos) < 0.1)) {
                siAtoms.push(pos);
              }
            }
          });
        }
      }
    }
    
    const siBondDist = (Math.sqrt(3) * a) / 4;
    
    for (let i = 0; i < siAtoms.length; i++) {
      for (let j = i + 1; j < siAtoms.length; j++) {
        if (siAtoms[i].distanceTo(siAtoms[j]) < siBondDist + 0.1) {
          const oPos = siAtoms[i].clone().lerp(siAtoms[j], 0.5);
          oAtoms.push(oPos);
          bonds.push({ start: siAtoms[i], end: oPos });
          bonds.push({ start: siAtoms[j], end: oPos });
        }
      }
    }
    
    return { siAtoms, oAtoms, bonds };
  }, []);

  return (
    <group>
      <InstancedAtoms positions={siAtoms} color="#888888" radius={0.35} />
      <InstancedAtoms positions={oAtoms} color="#ff0000" radius={0.25} />
      <InstancedBonds bonds={bonds} color="#cccccc" radius={0.06} />
    </group>
  );
};

const MgOModel = () => {
  const { mgAtoms, oAtoms, bonds } = useMemo(() => {
    const mgAtoms: THREE.Vector3[] = [];
    const oAtoms: THREE.Vector3[] = [];
    const bonds: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    const a = 2.5;
    
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const pos = new THREE.Vector3(x * a, y * a, z * a);
          if (pos.length() > 4) continue;
          
          if ((Math.abs(x) + Math.abs(y) + Math.abs(z)) % 2 === 0) {
            mgAtoms.push(pos);
          } else {
            oAtoms.push(pos);
          }
        }
      }
    }
    
    for (let i = 0; i < mgAtoms.length; i++) {
      for (let j = 0; j < oAtoms.length; j++) {
        if (mgAtoms[i].distanceTo(oAtoms[j]) < a + 0.1) {
          bonds.push({ start: mgAtoms[i], end: oAtoms[j] });
        }
      }
    }
    
    return { mgAtoms, oAtoms, bonds };
  }, []);

  return (
    <group>
      <InstancedAtoms positions={mgAtoms} color="#4ade80" radius={0.35} />
      <InstancedAtoms positions={oAtoms} color="#ff0000" radius={0.35} />
      <InstancedBonds bonds={bonds} color="#cccccc" radius={0.06} />
    </group>
  );
};

const Na2OModel = () => {
  const { naAtoms, oAtoms, bonds } = useMemo(() => {
    const naAtoms: THREE.Vector3[] = [];
    const oAtoms: THREE.Vector3[] = [];
    const bonds: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    const a = 4.0;
    
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const pos = new THREE.Vector3(x * a, y * a, z * a);
          if (pos.length() > 5) continue;
          oAtoms.push(pos);
          
          if (x < 1 && y < 1) oAtoms.push(new THREE.Vector3((x + 0.5) * a, (y + 0.5) * a, z * a));
          if (x < 1 && z < 1) oAtoms.push(new THREE.Vector3((x + 0.5) * a, y * a, (z + 0.5) * a));
          if (y < 1 && z < 1) oAtoms.push(new THREE.Vector3(x * a, (y + 0.5) * a, (z + 0.5) * a));
        }
      }
    }
    
    for (let x = -1; x < 1; x++) {
      for (let y = -1; y < 1; y++) {
        for (let z = -1; z < 1; z++) {
          naAtoms.push(new THREE.Vector3((x + 0.25) * a, (y + 0.25) * a, (z + 0.25) * a));
          naAtoms.push(new THREE.Vector3((x + 0.75) * a, (y + 0.25) * a, (z + 0.25) * a));
          naAtoms.push(new THREE.Vector3((x + 0.25) * a, (y + 0.75) * a, (z + 0.25) * a));
          naAtoms.push(new THREE.Vector3((x + 0.75) * a, (y + 0.75) * a, (z + 0.25) * a));
          naAtoms.push(new THREE.Vector3((x + 0.25) * a, (y + 0.25) * a, (z + 0.75) * a));
          naAtoms.push(new THREE.Vector3((x + 0.75) * a, (y + 0.25) * a, (z + 0.75) * a));
          naAtoms.push(new THREE.Vector3((x + 0.25) * a, (y + 0.75) * a, (z + 0.75) * a));
          naAtoms.push(new THREE.Vector3((x + 0.75) * a, (y + 0.75) * a, (z + 0.75) * a));
        }
      }
    }
    
    const filteredNa = naAtoms.filter(p => p.length() < 4.5);
    const filteredO = oAtoms.filter(p => p.length() < 4.5);
    
    const bondDist = Math.sqrt(3) * a / 4;
    for (let i = 0; i < filteredNa.length; i++) {
      for (let j = 0; j < filteredO.length; j++) {
        if (filteredNa[i].distanceTo(filteredO[j]) < bondDist + 0.1) {
          bonds.push({ start: filteredNa[i], end: filteredO[j] });
        }
      }
    }
    
    return { naAtoms: filteredNa, oAtoms: filteredO, bonds };
  }, []);

  return (
    <group>
      <InstancedAtoms positions={naAtoms} color="#a78bfa" radius={0.25} />
      <InstancedAtoms positions={oAtoms} color="#ff0000" radius={0.35} />
      <InstancedBonds bonds={bonds} color="#cccccc" radius={0.06} />
    </group>
  );
};

const Al2O3Model = () => {
  const { alAtoms, oAtoms, bonds } = useMemo(() => {
    const alAtoms: THREE.Vector3[] = [];
    const oAtoms: THREE.Vector3[] = [];
    const bonds: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    
    const a = 4.76;
    const c = 12.99;
    const scale = 0.5;
    
    const x_O = 0.306;
    const z_Al = 0.352;
    
    const translations = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(2/3, 1/3, 1/3),
      new THREE.Vector3(1/3, 2/3, 2/3)
    ];
    
    for (let i = -1; i <= 0; i++) {
      for (let j = -1; j <= 0; j++) {
        for (let k = -1; k <= 0; k++) {
          const cellOffset = new THREE.Vector3(i, j, k);
          
          translations.forEach(t => {
            const base = cellOffset.clone().add(t);
            
            const al_fracs = [
              new THREE.Vector3(0, 0, z_Al),
              new THREE.Vector3(0, 0, -z_Al),
              new THREE.Vector3(0, 0, 0.5 + z_Al),
              new THREE.Vector3(0, 0, 0.5 - z_Al)
            ];
            
            al_fracs.forEach(frac => {
              const p = base.clone().add(frac);
              const x = (p.x - p.y / 2) * a * scale;
              const y = (p.y * Math.sqrt(3) / 2) * a * scale;
              const z = p.z * c * scale;
              alAtoms.push(new THREE.Vector3(x, y, z));
            });
            
            const o_fracs = [
              new THREE.Vector3(x_O, 0, 0.25),
              new THREE.Vector3(0, x_O, 0.25),
              new THREE.Vector3(-x_O, -x_O, 0.25),
              new THREE.Vector3(-x_O, 0, 0.75),
              new THREE.Vector3(0, -x_O, 0.75),
              new THREE.Vector3(x_O, x_O, 0.75)
            ];
            
            o_fracs.forEach(frac => {
              const p = base.clone().add(frac);
              const x = (p.x - p.y / 2) * a * scale;
              const y = (p.y * Math.sqrt(3) / 2) * a * scale;
              const z = p.z * c * scale;
              oAtoms.push(new THREE.Vector3(x, y, z));
            });
          });
        }
      }
    }
    
    const center = new THREE.Vector3(-a*scale/2, -a*scale/2, -c*scale/2);
    const filteredAl = alAtoms.filter(p => p.distanceTo(center) < 4.5).map(p => p.sub(center));
    const filteredO = oAtoms.filter(p => p.distanceTo(center) < 4.5).map(p => p.sub(center));
    
    for (let i = 0; i < filteredAl.length; i++) {
      for (let j = 0; j < filteredO.length; j++) {
        const dist = filteredAl[i].distanceTo(filteredO[j]);
        if (dist > 1.5 && dist < 2.5) {
          bonds.push({ start: filteredAl[i], end: filteredO[j] });
        }
      }
    }
    
    return { alAtoms: filteredAl, oAtoms: filteredO, bonds };
  }, []);

  return (
    <group>
      <InstancedAtoms positions={alAtoms} color="#60a5fa" radius={0.3} />
      <InstancedAtoms positions={oAtoms} color="#ff0000" radius={0.35} />
      <InstancedBonds bonds={bonds} color="#cccccc" radius={0.06} />
    </group>
  );
};

export function TransitionalCrystals() {
  const [activeModel, setActiveModel] = useState('sio2');
  const [autoRotate, setAutoRotate] = useState(true);

  const handleDoubleClick = () => {
    setAutoRotate(!autoRotate);
  };

  const models = [
    { id: 'sio2', name: '二氧化硅 (SiO₂)', desc: '典型的共价晶体，但在某些教材中也被作为过渡晶体讨论其键型特征。在晶体结构中，每个硅原子与4个氧原子形成四面体结构，每个氧原子与2个硅原子相连，形成三维空间网状结构。', atoms: [{name: '硅 (Si)', color: '#888888'}, {name: '氧 (O)', color: '#ff0000'}] },
    { id: 'al2o3', name: '氧化铝 (Al₂O₃)', desc: '刚玉结构，属于过渡晶体，具有较高的硬度和熔点。氧离子作六方最密堆积，铝离子填充在三分之二的八面体空隙中。', atoms: [{name: '铝 (Al)', color: '#60a5fa'}, {name: '氧 (O)', color: '#ff0000'}] },
    { id: 'mgo', name: '氧化镁 (MgO)', desc: '氯化钠型结构，属于过渡晶体。镁离子和氧离子分别形成面心立方晶格并相互穿插，每个离子都被6个异号离子包围。', atoms: [{name: '镁 (Mg)', color: '#4ade80'}, {name: '氧 (O)', color: '#ff0000'}] },
    { id: 'na2o', name: '氧化钠 (Na₂O)', desc: '反萤石结构，属于过渡晶体。氧离子形成面心立方晶格，钠离子填充在所有的四面体空隙中。', atoms: [{name: '钠 (Na)', color: '#a78bfa'}, {name: '氧 (O)', color: '#ff0000'}] },
  ];

  const activeData = models.find(m => m.id === activeModel)!;

  return (
    <div className="flex h-full w-full">
      <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-semibold text-slate-800">过渡晶体</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            {models.map(model => (
              <button
                key={model.id}
                onClick={() => setActiveModel(model.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  activeModel === model.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="font-medium">{model.name}</div>
              </button>
            ))}
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mt-4">
            <h3 className="font-medium text-slate-800 mb-2">{activeData.name}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {activeData.desc}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
              {activeData.atoms.map((atom, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: atom.color }}></div>
                  {atom.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-100" onDoubleClick={handleDoubleClick}>
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <color attach="background" args={['#f8fafc']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 10]} intensity={0.8} />
          {activeModel === 'sio2' && <SiO2Model />}
          {activeModel === 'al2o3' && <Al2O3Model />}
          {activeModel === 'mgo' && <MgOModel />}
          {activeModel === 'na2o' && <Na2OModel />}
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
    </div>
  );
}

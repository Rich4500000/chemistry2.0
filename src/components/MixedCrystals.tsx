import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Layers, Info } from 'lucide-react';

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
    <instancedMesh ref={meshRef} args={[null as any, null as any, positions.length]}>
      <sphereGeometry args={[radius, 12, 12]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
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
    <instancedMesh ref={meshRef} args={[null as any, null as any, bonds.length]}>
      <cylinderGeometry args={[radius, radius, 1, 6]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </instancedMesh>
  );
};

const PzOrbitals = ({ positions }: { positions: THREE.Vector3[] }) => {
  const topRef = useRef<THREE.InstancedMesh>(null);
  const bottomRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const topMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const bottomMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useEffect(() => {
    if (topRef.current && bottomRef.current && positions.length > 0) {
      positions.forEach((pos, i) => {
        dummy.position.copy(pos).add(new THREE.Vector3(0, 0, 0.45));
        dummy.scale.set(1, 1, 1.5);
        dummy.updateMatrix();
        topRef.current!.setMatrixAt(i, dummy.matrix);
        
        dummy.position.copy(pos).add(new THREE.Vector3(0, 0, -0.45));
        dummy.scale.set(1, 1, 1.5);
        dummy.updateMatrix();
        bottomRef.current!.setMatrixAt(i, dummy.matrix);
      });
      topRef.current.instanceMatrix.needsUpdate = true;
      bottomRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [positions, dummy]);

  useFrame(({ camera }) => {
    const dist = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
    const opacity = Math.max(0, Math.min(0.6, (15 - dist) / 10));
    if (topMatRef.current) {
      topMatRef.current.opacity = opacity;
      topMatRef.current.visible = opacity > 0.01;
    }
    if (bottomMatRef.current) {
      bottomMatRef.current.opacity = opacity;
      bottomMatRef.current.visible = opacity > 0.01;
    }
  });

  if (positions.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={topRef} args={[null as any, null as any, positions.length]}>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial ref={topMatRef} color="#8b5cf6" roughness={0.2} transparent opacity={0} />
      </instancedMesh>
      <instancedMesh ref={bottomRef} args={[null as any, null as any, positions.length]}>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial ref={bottomMatRef} color="#ec4899" roughness={0.2} transparent opacity={0} />
      </instancedMesh>
    </group>
  );
};

const GraphiteModel = () => {
  const { atoms, bonds, interlayerBonds } = useMemo(() => {
    const atoms: THREE.Vector3[] = [];
    const bonds: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    const a = 1.42; // C-C bond length
    const c = 3.35; // Interlayer distance

    // Generate two layers (AB stacking)
    for (let l = 0; l < 2; l++) {
      const z = (l - 0.5) * c;
      const shiftX = l * a; // AB stacking shift
      
      const layerAtoms: THREE.Vector3[] = [];
      // Generate a hexagonal grid
      for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
          const baseX = i * 1.5 * a + j * 1.5 * a + shiftX;
          const baseY = i * Math.sqrt(3) * a / 2 - j * Math.sqrt(3) * a / 2;
          
          const p1 = new THREE.Vector3(baseX, baseY, z);
          const p2 = new THREE.Vector3(baseX + a, baseY, z);
          
          // Filter to create a roughly circular shape
          if (p1.length() < 5) layerAtoms.push(p1);
          if (p2.length() < 5) layerAtoms.push(p2);
        }
      }
      
      // Add bonds within the layer
      for (let i = 0; i < layerAtoms.length; i++) {
        for (let j = i + 1; j < layerAtoms.length; j++) {
          if (layerAtoms[i].distanceTo(layerAtoms[j]) < a + 0.1) {
            bonds.push({ start: layerAtoms[i], end: layerAtoms[j] });
          }
        }
      }
      atoms.push(...layerAtoms);
    }

    // Add weak interlayer interactions (van der Waals)
    const interlayerBonds: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        if (Math.abs(atoms[i].z - atoms[j].z) > 1 && atoms[i].distanceTo(atoms[j]) < c + 0.5) {
          // Only connect atoms that are roughly above each other
          if (Math.hypot(atoms[i].x - atoms[j].x, atoms[i].y - atoms[j].y) < 0.1) {
            interlayerBonds.push({ start: atoms[i], end: atoms[j] });
          }
        }
      }
    }

    return { atoms, bonds, interlayerBonds };
  }, []);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <InstancedAtoms positions={atoms} color="#333333" radius={0.3} />
      <InstancedBonds bonds={bonds} color="#888888" radius={0.08} />
      <InstancedBonds bonds={interlayerBonds} color="#aaaaaa" radius={0.03} />
      <PzOrbitals positions={atoms} />
    </group>
  );
};

const MixedCrystals = () => {
  const [autoRotate, setAutoRotate] = useState(true);

  const handleDoubleClick = () => {
    setAutoRotate(!autoRotate);
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Information */}
      <div className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Layers size={24} />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">混合晶体</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">石墨 (Graphite)</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              石墨是一种典型的混合晶体。在每一层内，碳原子通过强烈的共价键（sp²杂化）结合形成六边形网状结构。层与层之间则通过较弱的范德华力结合。
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-indigo-900 mb-1">交互提示</h4>
                <p className="text-sm text-indigo-700">
                  使用鼠标滚轮放大模型。当您靠近碳原子时，将能看到未参与杂化的 <strong>p_z 轨道</strong>（紫色和粉色部分），它们相互平行重叠，形成了贯穿整个碳层的离域大π键。
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">结构特征：</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                层内 C-C 键长：1.42 Å
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                层间距离：3.35 Å
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                良好的导电性（离域π键）
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                良好的润滑性（层间易滑动）
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Content - 3D Viewer */}
      <div className="flex-1 relative bg-slate-900" onDoubleClick={handleDoubleClick}>
        <Canvas camera={{ position: [0, 5, 12], fov: 45 }}>
          <color attach="background" args={['#0f172a']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <directionalLight position={[-10, -10, -10]} intensity={0.5} />
          <Environment preset="city" />
          
          <GraphiteModel />
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={20}
            autoRotate={autoRotate}
            autoRotateSpeed={1.0}
          />
        </Canvas>
      </div>
    </div>
  );
};

export { MixedCrystals };

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

const PzOrbital = ({ position }: { position: THREE.Vector3 }) => {
  const ref1 = useRef<THREE.MeshStandardMaterial>(null);
  const ref2 = useRef<THREE.MeshStandardMaterial>(null);
  
  useFrame(({ camera }) => {
    const dist = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
    // Fade in orbitals when camera gets closer than 15 units
    const opacity = Math.max(0, Math.min(0.6, (15 - dist) / 10));
    
    if (ref1.current) {
      ref1.current.opacity = opacity;
      ref1.current.transparent = opacity < 1;
      ref1.current.visible = opacity > 0.01;
    }
    if (ref2.current) {
      ref2.current.opacity = opacity;
      ref2.current.transparent = opacity < 1;
      ref2.current.visible = opacity > 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0, 0.5]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial ref={ref1} color="#8b5cf6" roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, -0.5]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial ref={ref2} color="#ec4899" roughness={0.2} />
      </mesh>
    </group>
  );
};

const GraphiteModel = () => {
  const { atoms, bonds } = useMemo(() => {
    const atoms: THREE.Vector3[] = [];
    const bonds: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    const a = 1.42;
    const c = 3.35;

    for (let l = 0; l < 2; l++) {
      const z = (l - 0.5) * c;
      const shiftX = l * a; // AB stacking shift
      
      const layerAtoms: THREE.Vector3[] = [];
      for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
          const baseX = i * 1.5 * a + j * 1.5 * a + shiftX;
          const baseY = i * Math.sqrt(3) * a / 2 - j * Math.sqrt(3) * a / 2;
          
          const p1 = new THREE.Vector3(baseX, baseY, z);
          const p2 = new THREE.Vector3(baseX + a, baseY, z);
          
          if (p1.length() < 5) layerAtoms.push(p1);
          if (p2.length() < 5) layerAtoms.push(p2);
        }
      }
      
      // Add bonds within layer
      for (let i = 0; i < layerAtoms.length; i++) {
        for (let j = i + 1; j < layerAtoms.length; j++) {
          if (layerAtoms[i].distanceTo(layerAtoms[j]) < a + 0.1) {
            bonds.push({ start: layerAtoms[i], end: layerAtoms[j] });
          }
        }
      }
      atoms.push(...layerAtoms);
    }

    // Interlayer bonds (dashed lines representation)
    const interlayerBonds: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        if (Math.abs(atoms[i].z - atoms[j].z) > 1 && atoms[i].distanceTo(atoms[j]) < c + 0.5) {
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
      {atoms.map((pos, i) => (
        <group key={`atom-${i}`}>
          <mesh position={pos}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial color="#333333" roughness={0.4} metalness={0.2} />
          </mesh>
          <PzOrbital position={pos} />
        </group>
      ))}
      
      {bonds.map((bond, i) => {
        const distance = bond.start.distanceTo(bond.end);
        const position = bond.start.clone().add(bond.end).multiplyScalar(0.5);
        const direction = bond.end.clone().sub(bond.start).normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        
        return (
          <mesh key={`bond-${i}`} position={position} quaternion={quaternion}>
            <cylinderGeometry args={[0.08, 0.08, distance, 8]} />
            <meshStandardMaterial color="#888888" roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

export function MixedCrystals() {
  return (
    <div className="flex h-full w-full">
      <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-semibold text-slate-800">混合晶体</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-medium text-slate-800 mb-2">石墨 (Graphite)</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              石墨是典型的混合型晶体。层内碳原子以 sp² 杂化轨道形成共价键，构成正六边形平面网状结构；层与层之间以范德华力结合。
            </p>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
              💡 提示：放大模型（拉近视角）即可观察到碳原子未参与杂化的 pz 轨道，它们肩并肩重叠形成了离域大 π 键。
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-100">
        <Canvas camera={{ position: [0, 8, 12], fov: 45 }}>
          <color attach="background" args={['#f8fafc']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 10]} intensity={0.8} />
          <GraphiteModel />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          <Environment preset="city" />
        </Canvas>
      </div>
    </div>
  );
}

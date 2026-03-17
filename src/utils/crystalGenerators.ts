import { elements } from '../data/elements';

export type BondType = 'covalent' | 'ionic' | 'metallic' | 'vdw';

export interface CrystalGenerator {
  id: string;
  name: string;
  description: string;
  gen: (size: number) => { 
    atoms: { pos: [number, number, number]; element: number }[]; 
    bonds: { start: [number, number, number]; end: [number, number, number]; type: BondType }[];
    unitCells?: { pos: [number, number, number]; size: number }[];
  };
}

const getElement = (symbol: string) => elements.find(e => e.symbol === symbol)?.atomicNumber || 1;

// Helper to generate a lattice
const generateLattice = (
  basis: { pos: [number, number, number]; element: number }[],
  a: number,
  size: number,
  bondLength: number,
  bondType: BondType,
  tolerance = 0.15,
  expandBounds = 0.01
) => {
  const atoms: { pos: [number, number, number]; element: number }[] = [];
  const bonds: { start: [number, number, number]; end: [number, number, number]; type: BondType }[] = [];
  const unitCells: { pos: [number, number, number]; size: number }[] = [];

  for (let x = -1; x <= size; x++) {
    for (let y = -1; y <= size; y++) {
      for (let z = -1; z <= size; z++) {
        for (const b of basis) {
          const fracX = x + b.pos[0];
          const fracY = y + b.pos[1];
          const fracZ = z + b.pos[2];

          if (fracX >= -expandBounds && fracX <= size + expandBounds &&
              fracY >= -expandBounds && fracY <= size + expandBounds &&
              fracZ >= -expandBounds && fracZ <= size + expandBounds) {
            atoms.push({
              pos: [fracX * a, fracY * a, fracZ * a],
              element: b.element
            });
          }
        }
      }
    }
  }

  // Deduplicate atoms
  const uniqueAtoms: typeof atoms = [];
  atoms.forEach(atom => {
    const isDuplicate = uniqueAtoms.some(ua => 
      Math.abs(ua.pos[0] - atom.pos[0]) < 0.01 &&
      Math.abs(ua.pos[1] - atom.pos[1]) < 0.01 &&
      Math.abs(ua.pos[2] - atom.pos[2]) < 0.01
    );
    if (!isDuplicate) {
      uniqueAtoms.push(atom);
    }
  });

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        unitCells.push({
          pos: [(x + 0.5) * a, (y + 0.5) * a, (z + 0.5) * a],
          size: a
        });
      }
    }
  }

  for (let i = 0; i < uniqueAtoms.length; i++) {
    for (let j = i + 1; j < uniqueAtoms.length; j++) {
      const dx = uniqueAtoms[i].pos[0] - uniqueAtoms[j].pos[0];
      const dy = uniqueAtoms[i].pos[1] - uniqueAtoms[j].pos[1];
      const dz = uniqueAtoms[i].pos[2] - uniqueAtoms[j].pos[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (Math.abs(dist - bondLength) < tolerance) {
        bonds.push({ start: uniqueAtoms[i].pos, end: uniqueAtoms[j].pos, type: bondType });
      }
    }
  }

  // Center
  const offset = (size * a) / 2;
  uniqueAtoms.forEach(atom => {
    atom.pos = [atom.pos[0] - offset, atom.pos[1] - offset, atom.pos[2] - offset];
  });
  bonds.forEach(bond => {
    bond.start = [bond.start[0] - offset, bond.start[1] - offset, bond.start[2] - offset];
    bond.end = [bond.end[0] - offset, bond.end[1] - offset, bond.end[2] - offset];
  });
  unitCells.forEach(cell => {
    cell.pos = [cell.pos[0] - offset, cell.pos[1] - offset, cell.pos[2] - offset];
  });

  return { atoms: uniqueAtoms, bonds, unitCells };
};

export const generateHexagonalLattice = (
  basis: { pos: [number, number, number]; element: number }[],
  a: number,
  c: number,
  size: number,
  bondLength: number,
  bondType: BondType,
  tolerance = 0.2,
  expandBounds = 0.01
) => {
  const atoms: { pos: [number, number, number]; element: number }[] = [];
  const bonds: { start: [number, number, number]; end: [number, number, number]; type: BondType }[] = [];
  const unitCells: { pos: [number, number, number]; size: number }[] = [];

  for (let x = -1; x <= size; x++) {
    for (let y = -1; y <= size; y++) {
      for (let z = -1; z <= size; z++) {
        for (const b of basis) {
          const fracX = x + b.pos[0];
          const fracY = y + b.pos[1];
          const fracZ = z + b.pos[2];

          if (fracX >= -expandBounds && fracX <= size + expandBounds &&
              fracY >= -expandBounds && fracY <= size + expandBounds &&
              fracZ >= -expandBounds && fracZ <= size + expandBounds) {
            const px = fracX * a - fracY * a / 2;
            const py = fracY * a * Math.sqrt(3) / 2;
            const pz = fracZ * c;
            atoms.push({ pos: [px, py, pz], element: b.element });
          }
        }
      }
    }
  }

  // Deduplicate atoms
  const uniqueAtoms: typeof atoms = [];
  atoms.forEach(atom => {
    const isDuplicate = uniqueAtoms.some(ua => 
      Math.abs(ua.pos[0] - atom.pos[0]) < 0.01 &&
      Math.abs(ua.pos[1] - atom.pos[1]) < 0.01 &&
      Math.abs(ua.pos[2] - atom.pos[2]) < 0.01
    );
    if (!isDuplicate) {
      uniqueAtoms.push(atom);
    }
  });

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        const cx = (x + 0.5) * a - (y + 0.5) * a / 2;
        const cy = (y + 0.5) * a * Math.sqrt(3) / 2;
        const cz = (z + 0.5) * c;
        unitCells.push({ pos: [cx, cy, cz], size: Math.max(a, c) });
      }
    }
  }

  for (let i = 0; i < uniqueAtoms.length; i++) {
    for (let j = i + 1; j < uniqueAtoms.length; j++) {
      const dx = uniqueAtoms[i].pos[0] - uniqueAtoms[j].pos[0];
      const dy = uniqueAtoms[i].pos[1] - uniqueAtoms[j].pos[1];
      const dz = uniqueAtoms[i].pos[2] - uniqueAtoms[j].pos[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (Math.abs(dist - bondLength) < tolerance) {
        bonds.push({ start: uniqueAtoms[i].pos, end: uniqueAtoms[j].pos, type: bondType });
      }
    }
  }

  const cx = (size * a - size * a / 2) / 2;
  const cy = (size * a * Math.sqrt(3) / 2) / 2;
  const cz = (size * c) / 2;
  uniqueAtoms.forEach(atom => {
    atom.pos = [atom.pos[0] - cx, atom.pos[1] - cy, atom.pos[2] - cz];
  });
  bonds.forEach(bond => {
    bond.start = [bond.start[0] - cx, bond.start[1] - cy, bond.start[2] - cz];
    bond.end = [bond.end[0] - cx, bond.end[1] - cy, bond.end[2] - cz];
  });
  unitCells.forEach(cell => {
    cell.pos = [cell.pos[0] - cx, cell.pos[1] - cy, cell.pos[2] - cz];
  });

  return { atoms: uniqueAtoms, bonds, unitCells };
};

export const generateHCP = (elem: string, a: number, c: number, size: number) => {
  const e1 = getElement(elem);
  const basis = [
    { pos: [0, 0, 0], element: e1 },
    { pos: [1/3, 2/3, 1/2], element: e1 }
  ] as any;
  return generateHexagonalLattice(basis, a, c, size, a, 'metallic');
};

export const generateHBN = (size: number) => {
  const eB = getElement('B');
  const eN = getElement('N');
  const a = 2.5;
  const c = 6.66;
  const basis = [
    { pos: [0, 0, 0], element: eB },
    { pos: [1/3, 2/3, 0], element: eN },
    { pos: [1/3, 2/3, 1/2], element: eB },
    { pos: [0, 0, 1/2], element: eN }
  ] as any;
  return generateHexagonalLattice(basis, a, c, size, a / Math.sqrt(3), 'covalent');
};

export const generateC60Crystal = (size: number) => {
  const a = 14.1; // FCC lattice constant
  const scale = 0.7; // To make C-C bond ~1.4
  const cE = getElement('C');
  const atoms: { pos: [number, number, number]; element: number }[] = [];
  const bonds: { start: [number, number, number]; end: [number, number, number]; type: BondType }[] = [];
  const unitCells: { pos: [number, number, number]; size: number }[] = [];

  const fccBasis = [
    [0, 0, 0], [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5]
  ];

  const phi = (1 + Math.sqrt(5)) / 2;
  const c60Template: [number, number, number][] = [];
  const addVertex = (x: number, y: number, z: number) => {
    if (!c60Template.some(v => Math.abs(v[0]-x)<0.1 && Math.abs(v[1]-y)<0.1 && Math.abs(v[2]-z)<0.1)) {
      c60Template.push([x, y, z]);
    }
  };
  const addEvenPermutations = (x: number, y: number, z: number) => {
    const perms = [[x, y, z], [y, z, x], [z, x, y]];
    perms.forEach(p => {
      for (let i = -1; i <= 1; i += 2) {
        for (let j = -1; j <= 1; j += 2) {
          for (let k = -1; k <= 1; k += 2) {
            addVertex(p[0] * i, p[1] * j, p[2] * k);
          }
        }
      }
    });
  };
  addEvenPermutations(0, 1, 3 * phi);
  addEvenPermutations(1, 2 + phi, 2 * phi);
  addEvenPermutations(phi, 2, 2 * phi + 1);

  for (let x = -1; x <= size; x++) {
    for (let y = -1; y <= size; y++) {
      for (let z = -1; z <= size; z++) {
        for (const b of fccBasis) {
          const fracX = x + b[0];
          const fracY = y + b[1];
          const fracZ = z + b[2];

          if (fracX >= -0.01 && fracX <= size + 0.01 &&
              fracY >= -0.01 && fracY <= size + 0.01 &&
              fracZ >= -0.01 && fracZ <= size + 0.01) {
            
            const center: [number, number, number] = [
              fracX * a,
              fracY * a,
              fracZ * a
            ];
            const c60Atoms = c60Template.map(v => [
              v[0] * scale + center[0],
              v[1] * scale + center[1],
              v[2] * scale + center[2]
            ] as [number, number, number]);
            
            c60Atoms.forEach(pos => atoms.push({ pos, element: cE }));
            
            for (let i = 0; i < c60Atoms.length; i++) {
              for (let j = i + 1; j < c60Atoms.length; j++) {
                const dx = c60Atoms[i][0] - c60Atoms[j][0];
                const dy = c60Atoms[i][1] - c60Atoms[j][1];
                const dz = c60Atoms[i][2] - c60Atoms[j][2];
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                if (Math.abs(dist - 1.4) < 0.2) {
                  bonds.push({ start: c60Atoms[i], end: c60Atoms[j], type: 'covalent' });
                }
              }
            }
          }
        }
      }
    }
  }

  // Deduplicate C60 molecules (by deduplicating atoms)
  const uniqueAtoms: typeof atoms = [];
  const seenPos = new Set<string>();
  atoms.forEach(atom => {
    const key = `${atom.pos[0].toFixed(3)},${atom.pos[1].toFixed(3)},${atom.pos[2].toFixed(3)}`;
    if (!seenPos.has(key)) {
      seenPos.add(key);
      uniqueAtoms.push(atom);
    }
  });

  const uniqueBonds: typeof bonds = [];
  const seenBonds = new Set<string>();
  bonds.forEach(bond => {
    const k1 = `${bond.start[0].toFixed(3)},${bond.start[1].toFixed(3)},${bond.start[2].toFixed(3)}`;
    const k2 = `${bond.end[0].toFixed(3)},${bond.end[1].toFixed(3)},${bond.end[2].toFixed(3)}`;
    const key = k1 < k2 ? `${k1}-${k2}` : `${k2}-${k1}`;
    if (!seenBonds.has(key)) {
      seenBonds.add(key);
      uniqueBonds.push(bond);
    }
  });

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        unitCells.push({
          pos: [(x + 0.5) * a, (y + 0.5) * a, (z + 0.5) * a],
          size: a
        });
      }
    }
  }

  const offset = (size * a) / 2;
  uniqueAtoms.forEach(atom => {
    atom.pos = [atom.pos[0] - offset, atom.pos[1] - offset, atom.pos[2] - offset];
  });
  uniqueBonds.forEach(bond => {
    bond.start = [bond.start[0] - offset, bond.start[1] - offset, bond.start[2] - offset];
    bond.end = [bond.end[0] - offset, bond.end[1] - offset, bond.end[2] - offset];
  });
  unitCells.forEach(cell => {
    cell.pos = [cell.pos[0] - offset, cell.pos[1] - offset, cell.pos[2] - offset];
  });

  return { atoms: uniqueAtoms, bonds: uniqueBonds, unitCells };
};

export const generateRockSalt = (elem1: string, elem2: string, a: number, size: number) => {
  const e1 = getElement(elem1);
  const e2 = getElement(elem2);
  const basis = [
    { pos: [0, 0, 0], element: e1 }, { pos: [0.5, 0.5, 0], element: e1 }, { pos: [0.5, 0, 0.5], element: e1 }, { pos: [0, 0.5, 0.5], element: e1 },
    { pos: [0.5, 0, 0], element: e2 }, { pos: [0, 0.5, 0], element: e2 }, { pos: [0, 0, 0.5], element: e2 }, { pos: [0.5, 0.5, 0.5], element: e2 }
  ] as any;
  return generateLattice(basis, a, size, a / 2, 'ionic');
};

export const generateCsCl = (elem1: string, elem2: string, a: number, size: number) => {
  const e1 = getElement(elem1);
  const e2 = getElement(elem2);
  const basis = [
    { pos: [0, 0, 0], element: e1 },
    { pos: [0.5, 0.5, 0.5], element: e2 }
  ] as any;
  return generateLattice(basis, a, size, a * Math.sqrt(3) / 2, 'ionic');
};

export const generateFluorite = (elem1: string, elem2: string, a: number, size: number) => {
  const e1 = getElement(elem1);
  const e2 = getElement(elem2);
  const basis = [
    { pos: [0, 0, 0], element: e1 }, { pos: [0.5, 0.5, 0], element: e1 }, { pos: [0.5, 0, 0.5], element: e1 }, { pos: [0, 0.5, 0.5], element: e1 },
    { pos: [0.25, 0.25, 0.25], element: e2 }, { pos: [0.75, 0.75, 0.25], element: e2 }, { pos: [0.75, 0.25, 0.75], element: e2 }, { pos: [0.25, 0.75, 0.75], element: e2 },
    { pos: [0.25, 0.25, 0.75], element: e2 }, { pos: [0.75, 0.75, 0.75], element: e2 }, { pos: [0.25, 0.75, 0.25], element: e2 }, { pos: [0.75, 0.25, 0.25], element: e2 }
  ] as any;
  return generateLattice(basis, a, size, a * Math.sqrt(3) / 4, 'ionic');
};

export const generateSphalerite = (elem1: string, elem2: string, a: number, size: number, type: BondType = 'covalent') => {
  const e1 = getElement(elem1);
  const e2 = getElement(elem2);
  const basis = [
    { pos: [0, 0, 0], element: e1 }, { pos: [0.5, 0.5, 0], element: e1 }, { pos: [0.5, 0, 0.5], element: e1 }, { pos: [0, 0.5, 0.5], element: e1 },
    { pos: [0.25, 0.25, 0.25], element: e2 }, { pos: [0.75, 0.75, 0.25], element: e2 }, { pos: [0.75, 0.25, 0.75], element: e2 }, { pos: [0.25, 0.75, 0.75], element: e2 }
  ] as any;
  return generateLattice(basis, a, size, a * Math.sqrt(3) / 4, type);
};

export const generateDiamond = (elem: string, a: number, size: number) => {
  return generateSphalerite(elem, elem, a, size, 'covalent');
};

export const generateFCC = (elem: string, a: number, size: number, type: BondType = 'vdw') => {
  const e1 = getElement(elem);
  const basis = [
    { pos: [0, 0, 0], element: e1 }, { pos: [0.5, 0.5, 0], element: e1 }, { pos: [0.5, 0, 0.5], element: e1 }, { pos: [0, 0.5, 0.5], element: e1 }
  ] as any;
  return generateLattice(basis, a, size, a / Math.sqrt(2), type);
};

export const generateBCC = (elem: string, a: number, size: number, type: BondType = 'metallic') => {
  const e1 = getElement(elem);
  const basis = [
    { pos: [0, 0, 0], element: e1 },
    { pos: [0.5, 0.5, 0.5], element: e1 }
  ] as any;
  return generateLattice(basis, a, size, a * Math.sqrt(3) / 2, type);
};

// Simplified molecular crystals (using FCC of molecules for simplicity)
export const generateMolecularFCC = (centerElem: string, outerElem: string, a: number, size: number, offset: number) => {
  const cE = getElement(centerElem);
  const oE = getElement(outerElem);
  const basis = [
    { pos: [0, 0, 0], element: cE }, { pos: [0.5, 0.5, 0], element: cE }, { pos: [0.5, 0, 0.5], element: cE }, { pos: [0, 0.5, 0.5], element: cE },
    { pos: [offset, offset, offset], element: oE }, { pos: [-offset, -offset, -offset], element: oE },
    { pos: [0.5+offset, 0.5+offset, offset], element: oE }, { pos: [0.5-offset, 0.5-offset, -offset], element: oE },
    { pos: [0.5+offset, offset, 0.5+offset], element: oE }, { pos: [0.5-offset, -offset, 0.5-offset], element: oE },
    { pos: [offset, 0.5+offset, 0.5+offset], element: oE }, { pos: [-offset, 0.5-offset, 0.5-offset], element: oE }
  ] as any;
  // Only bond within the molecule
  const lattice = generateLattice(basis, a, size, 0, 'vdw', 0.15, 0.25); // No VDW bonds drawn
  const bonds: any[] = [];
  lattice.atoms.forEach(atom => {
    if (atom.element === cE) {
      lattice.atoms.forEach(other => {
        if (other.element === oE) {
          const dist = Math.sqrt(Math.pow(atom.pos[0]-other.pos[0], 2) + Math.pow(atom.pos[1]-other.pos[1], 2) + Math.pow(atom.pos[2]-other.pos[2], 2));
          if (Math.abs(dist - offset*a*Math.sqrt(3)) < 0.1) {
            bonds.push({ start: atom.pos, end: other.pos, type: 'covalent' });
          }
        }
      });
    }
  });
  return { atoms: lattice.atoms, bonds, unitCells: lattice.unitCells };
};

export const generateMethane = (size: number) => {
  const eC = getElement('C');
  const eH = getElement('H');
  const a = 4.2; // FCC lattice constant for solid methane
  const offset = (size * a) / 2;
  const atoms: any[] = [];
  const bonds: any[] = [];
  const unitCells: any[] = [];

  const c_h_bond_length = 1.09; // C-H bond length
  // Tetrahedral directions
  const t1 = [1, 1, 1];
  const t2 = [1, -1, -1];
  const t3 = [-1, 1, -1];
  const t4 = [-1, -1, 1];
  const norm = Math.sqrt(3);
  const dirs = [t1, t2, t3, t4].map(d => [d[0]/norm, d[1]/norm, d[2]/norm]);

  // FCC basis for the molecules
  const basis = [
    [0, 0, 0], [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5]
  ];

  for (let x = -1; x <= size; x++) {
    for (let y = -1; y <= size; y++) {
      for (let z = -1; z <= size; z++) {
        for (const b of basis) {
          const fracX = x + b[0];
          const fracY = y + b[1];
          const fracZ = z + b[2];

          if (fracX >= -0.01 && fracX <= size + 0.01 &&
              fracY >= -0.01 && fracY <= size + 0.01 &&
              fracZ >= -0.01 && fracZ <= size + 0.01) {
            
            const px = fracX * a;
            const py = fracY * a;
            const pz = fracZ * a;
            const cPos = [px, py, pz];
            atoms.push({ pos: cPos, element: eC });

            dirs.forEach(d => {
              const hPos = [
                px + d[0] * c_h_bond_length,
                py + d[1] * c_h_bond_length,
                pz + d[2] * c_h_bond_length
              ];
              atoms.push({ pos: hPos, element: eH });
              bonds.push({ start: cPos, end: hPos, type: 'covalent' });
            });
          }
        }
      }
    }
  }

  const uniqueAtoms: any[] = [];
  const uniqueBonds: any[] = [];
  
  const seenPos = new Set<string>();
  atoms.forEach(atom => {
    const key = `${atom.pos[0].toFixed(3)},${atom.pos[1].toFixed(3)},${atom.pos[2].toFixed(3)}`;
    if (!seenPos.has(key)) {
      seenPos.add(key);
      uniqueAtoms.push(atom);
    }
  });

  const seenBonds = new Set<string>();
  bonds.forEach(bond => {
    const k1 = `${bond.start[0].toFixed(3)},${bond.start[1].toFixed(3)},${bond.start[2].toFixed(3)}`;
    const k2 = `${bond.end[0].toFixed(3)},${bond.end[1].toFixed(3)},${bond.end[2].toFixed(3)}`;
    const key = k1 < k2 ? `${k1}-${k2}` : `${k2}-${k1}`;
    if (!seenBonds.has(key)) {
      seenBonds.add(key);
      uniqueBonds.push(bond);
    }
  });

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        unitCells.push({
          pos: [(x + 0.5) * a, (y + 0.5) * a, (z + 0.5) * a],
          size: a
        });
      }
    }
  }

  uniqueAtoms.forEach(atom => {
    atom.pos = [atom.pos[0] - offset, atom.pos[1] - offset, atom.pos[2] - offset];
  });
  uniqueBonds.forEach(bond => {
    bond.start = [bond.start[0] - offset, bond.start[1] - offset, bond.start[2] - offset];
    bond.end = [bond.end[0] - offset, bond.end[1] - offset, bond.end[2] - offset];
  });
  unitCells.forEach(cell => {
    cell.pos = [cell.pos[0] - offset, cell.pos[1] - offset, cell.pos[2] - offset];
  });

  return { atoms: uniqueAtoms, bonds: uniqueBonds, unitCells };
};

export const molecularGenerators: CrystalGenerator[] = [
  { id: 'ne', name: '固态氖 (Ne)', description: '面心立方(FCC)堆积，由范德华力结合。', gen: (size) => generateFCC('Ne', 3.1, size) },
  { id: 'ar', name: '固态氩 (Ar)', description: '面心立方(FCC)堆积，由范德华力结合。', gen: (size) => generateFCC('Ar', 3.8, size) },
  { id: 'kr', name: '固态氪 (Kr)', description: '面心立方(FCC)堆积，由范德华力结合。', gen: (size) => generateFCC('Kr', 4.0, size) },
  { id: 'co2', name: '干冰 (CO₂)', description: '分子晶体，CO₂分子位于面心立方晶格点上。', gen: (size) => generateMolecularFCC('C', 'O', 5.6, size, 0.1) },
  { id: 'ch4', name: '固态甲烷 (CH₄)', description: '分子晶体，CH₄分子按面心立方排列，具有正四面体空间结构。', gen: (size) => generateMethane(size) },
  { id: 'n2', name: '固态氮 (N₂)', description: '分子晶体，由双原子分子构成。', gen: (size) => generateMolecularFCC('N', 'N', 4.0, size, 0.05) },
  { id: 'o2', name: '固态氧 (O₂)', description: '分子晶体，由双原子分子构成。', gen: (size) => generateMolecularFCC('O', 'O', 3.8, size, 0.05) },
  { id: 'f2', name: '固态氟 (F₂)', description: '分子晶体，由双原子分子构成。', gen: (size) => generateMolecularFCC('F', 'F', 3.5, size, 0.05) },
  { id: 'cl2', name: '固态氯 (Cl₂)', description: '分子晶体，由双原子分子构成。', gen: (size) => generateMolecularFCC('Cl', 'Cl', 4.5, size, 0.05) },
  { id: 'h2o', name: '冰 (H₂O)', description: '类金刚石结构(Ice Ic)，通过氢键连接。', gen: (size) => generateDiamond('O', 4.5, size) },
  { id: 's8', name: '硫磺 (S₈)', description: '由皇冠状S₈环构成的分子晶体。', gen: (size) => generateMolecularFCC('S', 'S', 6.0, size, 0.15) },
  { id: 'c60', name: '富勒烯 (C₆₀)', description: '由60个碳原子构成的足球状分子，形成面心立方(FCC)晶体。', gen: (size) => generateC60Crystal(size) }
];

export const ionicGenerators: CrystalGenerator[] = [
  { id: 'nacl', name: '氯化钠 (NaCl)', description: '典型的岩盐结构，面心立方晶格穿插。', gen: (size) => generateRockSalt('Na', 'Cl', 4.0, size) },
  { id: 'kcl', name: '氯化钾 (KCl)', description: '岩盐结构。', gen: (size) => generateRockSalt('K', 'Cl', 4.5, size) },
  { id: 'lif', name: '氟化锂 (LiF)', description: '岩盐结构。', gen: (size) => generateRockSalt('Li', 'F', 3.0, size) },
  { id: 'mgo', name: '氧化镁 (MgO)', description: '岩盐结构。', gen: (size) => generateRockSalt('Mg', 'O', 3.5, size) },
  { id: 'cao', name: '氧化钙 (CaO)', description: '岩盐结构。', gen: (size) => generateRockSalt('Ca', 'O', 3.8, size) },
  { id: 'cscl1', name: '氯化铯 (CsCl) - 铯心', description: '体心立方(BCC)衍生结构。Cs位于体心，Cl位于顶点。', gen: (size) => generateCsCl('Cl', 'Cs', 3.5, size) },
  { id: 'cscl2', name: '氯化铯 (CsCl) - 氯心', description: '体心立方(BCC)衍生结构。Cl位于体心，Cs位于顶点。', gen: (size) => generateCsCl('Cs', 'Cl', 3.5, size) },
  { id: 'caf2', name: '萤石 (CaF₂)', description: '萤石结构，Ca位于面心，F位于四面体空隙。', gen: (size) => generateFluorite('Ca', 'F', 4.5, size) },
  { id: 'zns', name: '闪锌矿 (ZnS)', description: '闪锌矿结构，S位于面心，Zn占据一半四面体空隙。', gen: (size) => generateSphalerite('Zn', 'S', 4.0, size, 'ionic') },
  { id: 'kbr', name: '溴化钾 (KBr)', description: '岩盐结构。', gen: (size) => generateRockSalt('K', 'Br', 4.8, size) },
  { id: 'naf', name: '氟化钠 (NaF)', description: '岩盐结构。', gen: (size) => generateRockSalt('Na', 'F', 3.5, size) }
];

export const covalentGenerators: CrystalGenerator[] = [
  { id: 'diamond', name: '金刚石 (C)', description: '碳原子形成正四面体网络。', gen: (size) => generateDiamond('C', 3.0, size) },
  { id: 'si', name: '晶体硅 (Si)', description: '类金刚石结构。', gen: (size) => generateDiamond('Si', 3.5, size) },
  { id: 'ge', name: '晶体锗 (Ge)', description: '类金刚石结构。', gen: (size) => generateDiamond('Ge', 3.8, size) },
  { id: 'sic', name: '碳化硅 (SiC)', description: '闪锌矿结构。', gen: (size) => generateSphalerite('Si', 'C', 3.2, size) },
  { id: 'bn', name: '立方氮化硼 (BN)', description: '闪锌矿结构，硬度仅次于金刚石。', gen: (size) => generateSphalerite('B', 'N', 2.8, size) },
  { id: 'hbn', name: '六方氮化硼 (h-BN)', description: '层状结构，类似石墨，层间由范德华力结合。', gen: (size) => generateHBN(size) },
  { id: 'alp', name: '磷化铝 (AlP)', description: '闪锌矿结构。', gen: (size) => generateSphalerite('Al', 'P', 3.8, size) },
  { id: 'gaas', name: '砷化镓 (GaAs)', description: '闪锌矿结构，重要的半导体材料。', gen: (size) => generateSphalerite('Ga', 'As', 4.0, size) },
  { id: 'bp', name: '磷化硼 (BP)', description: '闪锌矿结构。', gen: (size) => generateSphalerite('B', 'P', 3.2, size) },
  { id: 'bas', name: '砷化硼 (BAs)', description: '闪锌矿结构。', gen: (size) => generateSphalerite('B', 'As', 3.5, size) },
  { id: 'sio2', name: '二氧化硅 (SiO₂)', description: '简化版方石英结构，硅氧四面体网络。', gen: (size) => generateSphalerite('Si', 'O', 4.0, size) }
];

export const metallicGenerators: CrystalGenerator[] = [
  { id: 'cu', name: '铜 (Cu)', description: '面心立方(FCC)堆积，配位数12。', gen: (size) => generateFCC('Cu', 3.6, size, 'metallic') },
  { id: 'fe', name: '铁 (α-Fe)', description: '体心立方(BCC)堆积，配位数8。', gen: (size) => generateBCC('Fe', 2.9, size, 'metallic') },
  { id: 'na', name: '钠 (Na)', description: '体心立方(BCC)堆积，配位数8。', gen: (size) => generateBCC('Na', 4.3, size, 'metallic') },
  { id: 'k', name: '钾 (K)', description: '体心立方(BCC)堆积，配位数8。', gen: (size) => generateBCC('K', 5.3, size, 'metallic') },
  { id: 'zn', name: '锌 (Zn)', description: '六方最密堆积(HCP)，配位数12。', gen: (size) => generateHCP('Zn', 2.7, 4.9, size) },
  { id: 'mg', name: '镁 (Mg)', description: '六方最密堆积(HCP)，配位数12。', gen: (size) => generateHCP('Mg', 3.2, 5.2, size) }
];


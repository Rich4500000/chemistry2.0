export type BondType = 'single' | 'double' | 'triple';

export interface AtomData {
  element: number;
  pos: [number, number, number];
}

export interface BondData {
  start: [number, number, number];
  end: [number, number, number];
  type: BondType;
}

export interface MoleculeData {
  id: string;
  name: string;
  formula: string;
  description: string;
  atoms: AtomData[];
  bonds: BondData[];
  category: string;
}

const addBond = (bonds: BondData[], a1: AtomData, a2: AtomData, type: BondType = 'single') => {
  bonds.push({ start: a1.pos, end: a2.pos, type });
};

export const buildLinearMolecule = (
  n: number, 
  type: 'alkane' | 'alkene' | 'alkyne' | 'alcohol' | 'acid',
  name: string,
  id: string,
  formula: string,
  description: string,
  category: string
): MoleculeData => {
  const atoms: AtomData[] = [];
  const bonds: BondData[] = [];
  
  const dCC = 1.54;
  const dC_C = 1.34;
  const dCC_triple = 1.20;
  const dCH = 1.09;
  const dCO = 1.43;
  const dC_O = 1.22;
  const dOH = 0.96;
  
  const angle = 109.5 * Math.PI / 180;
  const halfAngle = angle / 2;

  let currentX = 0;
  let currentY = 0;

  const carbons: AtomData[] = [];

  for (let i = 0; i < n; i++) {
    let stepX = dCC * Math.sin(halfAngle);
    let stepY = (i % 2 === 0 ? 1 : -1) * dCC * Math.cos(halfAngle);
    
    if (i === 1) {
      if (type === 'alkene') {
        stepX = dC_C;
        stepY = 0;
      } else if (type === 'alkyne') {
        stepX = dCC_triple;
        stepY = 0;
      }
    } else if (i > 1 && (type === 'alkene' || type === 'alkyne')) {
        if (type === 'alkyne' && i === 2) {
            stepX = dCC;
            stepY = 0;
        }
    }

    currentX += stepX;
    currentY += stepY;

    const c: AtomData = { element: 6, pos: [currentX, currentY, 0] };
    atoms.push(c);
    carbons.push(c);

    if (i > 0) {
      let bType: BondType = 'single';
      if (i === 1 && type === 'alkene') bType = 'double';
      if (i === 1 && type === 'alkyne') bType = 'triple';
      addBond(bonds, carbons[i-1], c, bType);
    }
  }

  for (let i = 0; i < n; i++) {
    const c = carbons[i];
    let hCount = 2;
    if (i === 0) hCount = 3;
    if (i === n - 1) hCount = 3;
    if (n === 1) hCount = 4;

    if (type === 'alkene') {
      if (i === 0 || i === 1) hCount -= 1;
    } else if (type === 'alkyne') {
      if (i === 0 || i === 1) hCount -= 2;
    }

    if (type === 'alcohol' && i === n - 1) {
      hCount -= 1;
      const oPos: [number, number, number] = [c.pos[0] + dCO, c.pos[1], c.pos[2]];
      const o: AtomData = { element: 8, pos: oPos };
      atoms.push(o);
      addBond(bonds, c, o, 'single');
      
      const hPos: [number, number, number] = [oPos[0] + dOH * Math.cos(halfAngle), oPos[1] + dOH * Math.sin(halfAngle), 0];
      const h: AtomData = { element: 1, pos: hPos };
      atoms.push(h);
      addBond(bonds, o, h, 'single');
    }

    if (type === 'acid' && i === n - 1) {
      hCount -= 3;
      const o1Pos: [number, number, number] = [c.pos[0] + dC_O * Math.cos(halfAngle), c.pos[1] + dC_O * Math.sin(halfAngle), 0];
      const o1: AtomData = { element: 8, pos: o1Pos };
      atoms.push(o1);
      addBond(bonds, c, o1, 'double');

      const o2Pos: [number, number, number] = [c.pos[0] + dCO * Math.cos(-halfAngle), c.pos[1] + dCO * Math.sin(-halfAngle), 0];
      const o2: AtomData = { element: 8, pos: o2Pos };
      atoms.push(o2);
      addBond(bonds, c, o2, 'single');

      const hPos: [number, number, number] = [o2Pos[0] + dOH, o2Pos[1], 0];
      const h: AtomData = { element: 1, pos: hPos };
      atoms.push(h);
      addBond(bonds, o2, h, 'single');
    }

    const hPositions: [number, number, number][] = [
      [c.pos[0], c.pos[1] + dCH * 0.5, c.pos[2] + dCH * 0.866],
      [c.pos[0], c.pos[1] - dCH * 0.5, c.pos[2] - dCH * 0.866],
      [c.pos[0] - dCH * 0.866, c.pos[1], c.pos[2] + dCH * 0.5],
      [c.pos[0] + dCH * 0.866, c.pos[1], c.pos[2] - dCH * 0.5],
    ];

    for (let j = 0; j < hCount; j++) {
      const h: AtomData = { element: 1, pos: hPositions[j % 4] };
      atoms.push(h);
      addBond(bonds, c, h, 'single');
    }
  }

  let cx = 0, cy = 0, cz = 0;
  atoms.forEach(a => { cx += a.pos[0]; cy += a.pos[1]; cz += a.pos[2]; });
  cx /= atoms.length; cy /= atoms.length; cz /= atoms.length;
  atoms.forEach(a => { a.pos = [a.pos[0] - cx, a.pos[1] - cy, a.pos[2] - cz]; });
  bonds.forEach(b => {
    b.start = [b.start[0] - cx, b.start[1] - cy, b.start[2] - cz];
    b.end = [b.end[0] - cx, b.end[1] - cy, b.end[2] - cz];
  });

  return { id, name, formula, description, atoms, bonds, category };
};

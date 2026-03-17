import * as THREE from 'three';

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

// Helper to create a new atom and add it to the list
const createAtom = (atoms: AtomData[], element: number, pos: THREE.Vector3): AtomData => {
  const atom: AtomData = { element, pos: [pos.x, pos.y, pos.z] };
  atoms.push(atom);
  return atom;
};

// Standard bond lengths (Angstroms)
const BL = {
  CC_SINGLE: 1.54,
  CC_DOUBLE: 1.34,
  CC_TRIPLE: 1.20,
  CH: 1.09,
  CO_SINGLE: 1.43,
  CO_DOUBLE: 1.22,
  OH: 0.96,
};

// Standard bond angles (Radians)
const ANGLES = {
  TETRAHEDRAL: 109.5 * (Math.PI / 180),
  TRIGONAL: 120 * (Math.PI / 180),
  LINEAR: Math.PI,
};

// Helper to generate tetrahedral positions around a central atom
const getTetrahedralPositions = (center: THREE.Vector3, refDir: THREE.Vector3, bondLength: number, count: number): THREE.Vector3[] => {
  const positions: THREE.Vector3[] = [];
  if (count === 0) return positions;

  // Base vectors for a perfect tetrahedron (if center is 0,0,0 and one bond is along +y)
  // We'll rotate these to align with the reference direction
  const t1 = new THREE.Vector3(0, 1, 0);
  const t2 = new THREE.Vector3(Math.sqrt(8/9), -1/3, 0);
  const t3 = new THREE.Vector3(-Math.sqrt(2/9), -1/3, Math.sqrt(2/3));
  const t4 = new THREE.Vector3(-Math.sqrt(2/9), -1/3, -Math.sqrt(2/3));

  const tetVectors = [t1, t2, t3, t4];

  // If we have a reference direction (e.g., an existing C-C bond), we align t1 with that direction.
  // The remaining vectors (t2, t3, t4) will naturally point away from the existing bond.
  const alignDir = refDir.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), alignDir);

  // We need to pick the remaining vectors (t2, t3, t4)
  for (let i = 1; i <= count && i < 4; i++) {
    const v = tetVectors[i].clone().applyQuaternion(quaternion).multiplyScalar(bondLength).add(center);
    positions.push(v);
  }

  return positions;
};

// Helper to generate trigonal planar positions
const getTrigonalPositions = (center: THREE.Vector3, refDir: THREE.Vector3, bondLength: number, count: number, normalDir?: THREE.Vector3): THREE.Vector3[] => {
  const positions: THREE.Vector3[] = [];
  if (count === 0) return positions;

  const alignDir = refDir.clone().normalize();
  
  // Choose a normal vector for the plane. If not provided, pick an arbitrary orthogonal vector.
  let normal = normalDir;
  if (!normal) {
    normal = new THREE.Vector3(0, 0, 1);
    if (Math.abs(alignDir.dot(normal)) > 0.9) {
      normal = new THREE.Vector3(1, 0, 0);
    }
    normal.crossVectors(alignDir, normal).normalize();
  }

  // Rotate alignDir by 120 and 240 degrees around the normal
  if (count >= 1) {
    const v1 = alignDir.clone().applyAxisAngle(normal, ANGLES.TRIGONAL).multiplyScalar(bondLength).add(center);
    positions.push(v1);
  }
  if (count >= 2) {
    const v2 = alignDir.clone().applyAxisAngle(normal, -ANGLES.TRIGONAL).multiplyScalar(bondLength).add(center);
    positions.push(v2);
  }

  return positions;
};

// Helper to generate linear positions
const getLinearPositions = (center: THREE.Vector3, refDir: THREE.Vector3, bondLength: number, count: number): THREE.Vector3[] => {
  const positions: THREE.Vector3[] = [];
  if (count === 0) return positions;
  
  const alignDir = refDir.clone().normalize().negate();
  const v1 = alignDir.clone().multiplyScalar(bondLength).add(center);
  positions.push(v1);
  
  return positions;
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
  
  // 1. Build the Carbon backbone
  const carbonPositions: THREE.Vector3[] = [];
  let currentPos = new THREE.Vector3(0, 0, 0);
  carbonPositions.push(currentPos.clone());

  let currentDir = new THREE.Vector3(1, 0, 0); // Initial direction

  for (let i = 1; i < n; i++) {
    let bondLength = BL.CC_SINGLE;
    let angle = ANGLES.TETRAHEDRAL;
    
    // Determine bond type and angle based on molecule type and position
    if (i === 1) {
      if (type === 'alkene') {
        bondLength = BL.CC_DOUBLE;
        angle = ANGLES.TRIGONAL;
      } else if (type === 'alkyne') {
        bondLength = BL.CC_TRIPLE;
        angle = ANGLES.LINEAR;
      }
    } else if (i === 2 && type === 'alkyne') {
      // The bond after a triple bond must be linear
      angle = ANGLES.LINEAR;
    }

    // Calculate next position
    // We zig-zag the backbone for alkanes and alkenes
    let nextDir = currentDir.clone();
    
    if (angle !== ANGLES.LINEAR) {
       // Rotate direction to create zig-zag
       const axis = new THREE.Vector3(0, 0, 1);
       // Alternate rotation direction for zig-zag
       const rotAngle = (i % 2 === 0 ? 1 : -1) * (Math.PI - angle);
       nextDir.applyAxisAngle(axis, rotAngle).normalize();
    }

    currentPos = currentPos.clone().add(nextDir.clone().multiplyScalar(bondLength));
    carbonPositions.push(currentPos.clone());
    currentDir = nextDir;
  }

  // Create Carbon atoms
  const carbonAtoms = carbonPositions.map(pos => createAtom(atoms, 6, pos));

  // Add C-C bonds
  for (let i = 0; i < n - 1; i++) {
    let bType: BondType = 'single';
    if (i === 0 && type === 'alkene') bType = 'double';
    if (i === 0 && type === 'alkyne') bType = 'triple';
    addBond(bonds, carbonAtoms[i], carbonAtoms[i+1], bType);
  }

  // 2. Add Hydrogens and Functional Groups
  for (let i = 0; i < n; i++) {
    const cPos = carbonPositions[i];
    const cAtom = carbonAtoms[i];
    
    // Determine hybridization and reference directions
    let hybridization = 'sp3';
    let refDirs: THREE.Vector3[] = [];
    
    if (i > 0) refDirs.push(carbonPositions[i-1].clone().sub(cPos).normalize());
    if (i < n - 1) refDirs.push(carbonPositions[i+1].clone().sub(cPos).normalize());

    if (type === 'alkene' && (i === 0 || i === 1)) hybridization = 'sp2';
    if (type === 'alkyne' && (i === 0 || i === 1)) hybridization = 'sp';
    if (type === 'acid' && i === n - 1) hybridization = 'sp2';

    // Calculate how many hydrogens to add
    let hCount = 4 - refDirs.length;
    if (hybridization === 'sp2') hCount = 3 - refDirs.length;
    if (hybridization === 'sp') hCount = 2 - refDirs.length;

    // Special handling for functional groups at the end
    if (i === n - 1) {
      if (type === 'alcohol') {
        hCount -= 1; // Replace one H with OH
        
        // Add O
        const refDir = refDirs[0] || new THREE.Vector3(-1, 0, 0);
        const oPositions = getTetrahedralPositions(cPos, refDir, BL.CO_SINGLE, 1);
        const oPos = oPositions[0];
        const oAtom = createAtom(atoms, 8, oPos);
        addBond(bonds, cAtom, oAtom, 'single');
        refDirs.push(oPos.clone().sub(cPos).normalize());

        // Add H to O (bent geometry)
        const cToODir = cPos.clone().sub(oPos).normalize();
        const hOnOPositions = getTetrahedralPositions(oPos, cToODir, BL.OH, 1);
        const hAtom = createAtom(atoms, 1, hOnOPositions[0]);
        addBond(bonds, oAtom, hAtom, 'single');
      } else if (type === 'acid') {
        hCount = 0; // Acid carbon has no hydrogens
        
        const refDir = refDirs[0] || new THREE.Vector3(-1, 0, 0);
        
        // Add =O
        const trigPositions = getTrigonalPositions(cPos, refDir, BL.CO_DOUBLE, 2);
        const o1Pos = trigPositions[0];
        const o1Atom = createAtom(atoms, 8, o1Pos);
        addBond(bonds, cAtom, o1Atom, 'double');

        // Add -OH
        const o2Pos = trigPositions[1].clone().sub(cPos).normalize().multiplyScalar(BL.CO_SINGLE).add(cPos);
        const o2Atom = createAtom(atoms, 8, o2Pos);
        addBond(bonds, cAtom, o2Atom, 'single');

        // Add H to -OH
        const cToO2Dir = cPos.clone().sub(o2Pos).normalize();
        const hOnOPositions = getTetrahedralPositions(o2Pos, cToO2Dir, BL.OH, 1);
        const hAtom = createAtom(atoms, 1, hOnOPositions[0]);
        addBond(bonds, o2Atom, hAtom, 'single');
        
        // Manually add H to C for Formic acid (n=1)
        if (n === 1) {
           const hPos = refDir.clone().multiplyScalar(BL.CH).add(cPos);
           const hAtomC = createAtom(atoms, 1, hPos);
           addBond(bonds, cAtom, hAtomC, 'single');
        }
      }
    }

    // Add Hydrogens
    if (hCount > 0) {
      let hPositions: THREE.Vector3[] = [];
      
      // If it's methane (n=1, no refDirs), create a perfect tetrahedron from scratch
      if (n === 1 && type === 'alkane') {
         const t1 = new THREE.Vector3(0, 1, 0).multiplyScalar(BL.CH).add(cPos);
         const t2 = new THREE.Vector3(Math.sqrt(8/9), -1/3, 0).multiplyScalar(BL.CH).add(cPos);
         const t3 = new THREE.Vector3(-Math.sqrt(2/9), -1/3, Math.sqrt(2/3)).multiplyScalar(BL.CH).add(cPos);
         const t4 = new THREE.Vector3(-Math.sqrt(2/9), -1/3, -Math.sqrt(2/3)).multiplyScalar(BL.CH).add(cPos);
         hPositions = [t1, t2, t3, t4];
      } else {
        // We need a primary reference direction to build around
        // For terminal atoms, we use the single bond.
        // For internal atoms, we use the average of the two bonds to find the "outside" direction
        let primaryRefDir = refDirs[0];
        
        if (refDirs.length === 2) {
           // Internal atom
           const sum = refDirs[0].clone().add(refDirs[1]);
           if (sum.lengthSq() < 0.01) {
             // Linear molecule internal atom (e.g. alkyne)
             primaryRefDir = refDirs[0]; 
           } else {
             // Angle bisector points INWARD. We want the OUTWARD direction as our "reference" to build the remaining bonds away from.
             primaryRefDir = sum.normalize(); 
           }
        }

        if (hybridization === 'sp3') {
           if (refDirs.length === 1) {
             hPositions = getTetrahedralPositions(cPos, primaryRefDir, BL.CH, hCount);
           } else if (refDirs.length === 2) {
             // For a CH2 group in a zig-zag chain, the two H's should be above and below the plane
             // primaryRefDir points INWARD. We want to place H's pointing OUTWARD and UP/DOWN.
             const planeNormal = new THREE.Vector3(0, 0, 1); // Assuming backbone is in XY plane
             
             // The angle between the two C-C bonds is ~109.5.
             // The angle between the two C-H bonds is ~109.5.
             // The bisector of C-C bonds and bisector of C-H bonds are collinear but opposite.
             const outwardBisector = primaryRefDir.clone().negate();
             
             // The axis to rotate around should be in the C-C-C plane and perpendicular to the outwardBisector.
             // This is simply the difference between the two reference directions.
             const rotationAxis = refDirs[0].clone().sub(refDirs[1]).normalize();
             
             // Half angle of H-C-H is ~54.75 degrees
             const halfHCH = 54.75 * (Math.PI / 180);
             
             const h1 = outwardBisector.clone().applyAxisAngle(rotationAxis, halfHCH).multiplyScalar(BL.CH).add(cPos);
             const h2 = outwardBisector.clone().applyAxisAngle(rotationAxis, -halfHCH).multiplyScalar(BL.CH).add(cPos);
             
             // Fallback if cross product fails (linear)
             if (refDirs[0].clone().cross(refDirs[1]).lengthSq() < 0.01) {
                 hPositions = getTetrahedralPositions(cPos, primaryRefDir, BL.CH, hCount);
             } else {
                 hPositions = [h1, h2].slice(0, hCount);
             }
           }
        } else if (hybridization === 'sp2') {
           if (refDirs.length === 1) {
             hPositions = getTrigonalPositions(cPos, primaryRefDir, BL.CH, hCount, new THREE.Vector3(0, 0, 1));
           } else if (refDirs.length === 2) {
             // Internal sp2 atom (e.g., in an alkene chain). The hydrogen should point OUTWARD, opposite to the bisector.
             const outwardBisector = primaryRefDir.clone().negate();
             hPositions = [outwardBisector.multiplyScalar(BL.CH).add(cPos)];
           }
        } else if (hybridization === 'sp') {
           hPositions = getLinearPositions(cPos, primaryRefDir, BL.CH, hCount);
        }
      }

      hPositions.forEach(pos => {
        const hAtom = createAtom(atoms, 1, pos);
        addBond(bonds, cAtom, hAtom, 'single');
      });
    }
  }

  // 3. Center the molecule
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

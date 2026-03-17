import { buildLinearMolecule, MoleculeData } from '../utils/organicGenerators';

const alkaneNames = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十'];

const sub = (n: number) => n.toString().split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[parseInt(d)]).join('');

export const generatedOrganicMolecules: MoleculeData[] = [];

// Alkanes (20)
for (let i = 1; i <= 20; i++) {
  const formula = `C${i > 1 ? sub(i) : ''}H${sub(2*i+2)}`;
  generatedOrganicMolecules.push(
    buildLinearMolecule(i, 'alkane', `${alkaneNames[i-1]}烷`, `alkane_${i}`, formula, `直链烷烃，含有 ${i} 个碳原子。`, '烷烃 (Alkanes)')
  );
}

// Alkenes (19)
for (let i = 2; i <= 20; i++) {
  const formula = `C${sub(i)}H${sub(2*i)}`;
  generatedOrganicMolecules.push(
    buildLinearMolecule(i, 'alkene', `1-${alkaneNames[i-1]}烯`, `alkene_${i}`, formula, `直链烯烃，含有 ${i} 个碳原子和一个碳碳双键。`, '烯烃 (Alkenes)')
  );
}

// Alkynes (19)
for (let i = 2; i <= 20; i++) {
  const formula = `C${sub(i)}H${sub(2*i-2)}`;
  generatedOrganicMolecules.push(
    buildLinearMolecule(i, 'alkyne', `1-${alkaneNames[i-1]}炔`, `alkyne_${i}`, formula, `直链炔烃，含有 ${i} 个碳原子和一个碳碳三键。`, '炔烃 (Alkynes)')
  );
}

// Alcohols (20)
for (let i = 1; i <= 20; i++) {
  const formula = `C${i > 1 ? sub(i) : ''}H${sub(2*i+1)}OH`;
  generatedOrganicMolecules.push(
    buildLinearMolecule(i, 'alcohol', `1-${alkaneNames[i-1]}醇`, `alcohol_${i}`, formula, `直链醇，含有 ${i} 个碳原子和一个羟基。`, '醇类 (Alcohols)')
  );
}

// Acids (20)
for (let i = 1; i <= 20; i++) {
  let formula = '';
  if (i === 1) formula = 'HCOOH';
  else if (i === 2) formula = 'CH₃COOH';
  else formula = `C${sub(i-1)}H${sub(2*(i-1)+1)}COOH`;
  
  generatedOrganicMolecules.push(
    buildLinearMolecule(i, 'acid', `${alkaneNames[i-1]}酸`, `acid_${i}`, formula, `直链羧酸，含有 ${i} 个碳原子和一个羧基。`, '羧酸 (Carboxylic Acids)')
  );
}

// Add Benzene and some aromatics
const benzene: MoleculeData = {
  id: 'benzene',
  name: '苯',
  formula: 'C₆H₆',
  description: '最简单的芳香烃，具有平面正六边形结构。碳碳键是介于单键和双键之间的独特键。',
  category: '芳香烃 (Aromatics)',
  atoms: [
    { element: 6, pos: [0, 1.4, 0] },
    { element: 6, pos: [1.21, 0.7, 0] },
    { element: 6, pos: [1.21, -0.7, 0] },
    { element: 6, pos: [0, -1.4, 0] },
    { element: 6, pos: [-1.21, -0.7, 0] },
    { element: 6, pos: [-1.21, 0.7, 0] },
    { element: 1, pos: [0, 2.4, 0] },
    { element: 1, pos: [2.08, 1.2, 0] },
    { element: 1, pos: [2.08, -1.2, 0] },
    { element: 1, pos: [0, -2.4, 0] },
    { element: 1, pos: [-2.08, -1.2, 0] },
    { element: 1, pos: [-2.08, 1.2, 0] },
  ],
  bonds: [
    { start: [0, 1.4, 0], end: [1.21, 0.7, 0], type: 'double' },
    { start: [1.21, 0.7, 0], end: [1.21, -0.7, 0], type: 'single' },
    { start: [1.21, -0.7, 0], end: [0, -1.4, 0], type: 'double' },
    { start: [0, -1.4, 0], end: [-1.21, -0.7, 0], type: 'single' },
    { start: [-1.21, -0.7, 0], end: [-1.21, 0.7, 0], type: 'double' },
    { start: [-1.21, 0.7, 0], end: [0, 1.4, 0], type: 'single' },
    { start: [0, 1.4, 0], end: [0, 2.4, 0], type: 'single' },
    { start: [1.21, 0.7, 0], end: [2.08, 1.2, 0], type: 'single' },
    { start: [1.21, -0.7, 0], end: [2.08, -1.2, 0], type: 'single' },
    { start: [0, -1.4, 0], end: [0, -2.4, 0], type: 'single' },
    { start: [-1.21, -0.7, 0], end: [-2.08, -1.2, 0], type: 'single' },
    { start: [-1.21, 0.7, 0], end: [-2.08, 1.2, 0], type: 'single' },
  ]
};

generatedOrganicMolecules.push(benzene);

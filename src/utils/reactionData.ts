export type ReactionAtom = {
  id: string;
  element: string;
  startPos: [number, number, number];
  endPos: [number, number, number];
};

export type ReactionBond = {
  id: string;
  source: string; // atom id
  target: string; // atom id
  type: 'single' | 'double' | 'triple';
  behavior: 'static' | 'breaking' | 'forming' | 'pi-breaking';
};

export type Reaction = {
  id: string;
  name: string;
  description: string;
  equation: string;
  atoms: ReactionAtom[];
  bonds: ReactionBond[];
};

export const reactions: Reaction[] = [
  {
    id: 'ethylene-bromine',
    name: '乙烯与溴的加成反应',
    equation: 'CH₂=CH₂ + Br₂ → CH₂Br-CH₂Br',
    description: '加成反应：乙烯分子中的碳碳双键中有一个键容易断裂。溴分子靠近时，Br-Br键断裂，两个溴原子分别加成到两个碳原子上，形成1,2-二溴乙烷。',
    atoms: [
      // Ethylene (planar, sp2 hybridized, bond angle ~120 deg)
      { id: 'C1', element: 'C', startPos: [-0.67, 0, 0], endPos: [-0.77, 0, 0] },
      { id: 'C2', element: 'C', startPos: [0.67, 0, 0], endPos: [0.77, 0, 0] },
      // H atoms at 120 deg
      { id: 'H1', element: 'H', startPos: [-1.23, 0.97, 0], endPos: [-1.28, 0.73, 0.73] },
      { id: 'H2', element: 'H', startPos: [-1.23, -0.97, 0], endPos: [-1.28, -0.73, -0.73] },
      { id: 'H3', element: 'H', startPos: [1.23, 0.97, 0], endPos: [1.28, 0.73, 0.73] },
      { id: 'H4', element: 'H', startPos: [1.23, -0.97, 0], endPos: [1.28, -0.73, -0.73] },
      // Bromine molecule
      { id: 'Br1', element: 'Br', startPos: [0, 2.5, 0], endPos: [-0.77, 1.5, -1.0] },
      { id: 'Br2', element: 'Br', startPos: [0, 4.5, 0], endPos: [0.77, -1.5, 1.0] },
    ],
    bonds: [
      { id: 'b1', source: 'C1', target: 'C2', type: 'double', behavior: 'pi-breaking' },
      { id: 'b3', source: 'C1', target: 'H1', type: 'single', behavior: 'static' },
      { id: 'b4', source: 'C1', target: 'H2', type: 'single', behavior: 'static' },
      { id: 'b5', source: 'C2', target: 'H3', type: 'single', behavior: 'static' },
      { id: 'b6', source: 'C2', target: 'H4', type: 'single', behavior: 'static' },
      { id: 'b7', source: 'Br1', target: 'Br2', type: 'single', behavior: 'breaking' },
      { id: 'b8', source: 'C1', target: 'Br1', type: 'single', behavior: 'forming' },
      { id: 'b9', source: 'C2', target: 'Br2', type: 'single', behavior: 'forming' },
    ]
  },
  {
    id: 'methane-chlorine',
    name: '甲烷与氯气的取代反应',
    equation: 'CH₄ + Cl₂ →(光照) CH₃Cl + HCl',
    description: '取代反应：在光照条件下，氯气分子裂解为氯自由基，攻击甲烷分子，取代其中的一个氢原子，生成一氯甲烷和氯化氢。',
    atoms: [
      // Methane (tetrahedral, sp3 hybridized, bond angle 109.5 deg)
      // C at origin. H atoms at corners of a tetrahedron.
      // Let bond length be ~1.09
      { id: 'C', element: 'C', startPos: [0, 0, 0], endPos: [0, 0, 0] },
      { id: 'H1', element: 'H', startPos: [0, 1.09, 0], endPos: [0, 1.09, 0] },
      { id: 'H2', element: 'H', startPos: [1.027, -0.363, 0], endPos: [1.027, -0.363, 0] },
      { id: 'H3', element: 'H', startPos: [-0.514, -0.363, 0.889], endPos: [-0.514, -0.363, 0.889] },
      { id: 'H4', element: 'H', startPos: [-0.514, -0.363, -0.889], endPos: [2.5, -1.5, 0] },
      // Chlorine molecule
      { id: 'Cl1', element: 'Cl', startPos: [3, 1.5, 0], endPos: [-0.8, -0.56, -1.38] }, // Cl replaces H4
      { id: 'Cl2', element: 'Cl', startPos: [4.5, 1.5, 0], endPos: [3.5, -1.5, 0] },
    ],
    bonds: [
      { id: 'b1', source: 'C', target: 'H1', type: 'single', behavior: 'static' },
      { id: 'b2', source: 'C', target: 'H2', type: 'single', behavior: 'static' },
      { id: 'b3', source: 'C', target: 'H3', type: 'single', behavior: 'static' },
      { id: 'b4', source: 'C', target: 'H4', type: 'single', behavior: 'breaking' },
      { id: 'b5', source: 'Cl1', target: 'Cl2', type: 'single', behavior: 'breaking' },
      { id: 'b6', source: 'C', target: 'Cl1', type: 'single', behavior: 'forming' },
      { id: 'b7', source: 'H4', target: 'Cl2', type: 'single', behavior: 'forming' },
    ]
  },
  {
    id: 'esterification',
    name: '乙酸乙酯的酯化反应',
    equation: 'CH₃COOH + CH₃CH₂OH ⇌(浓H₂SO₄, △) CH₃COOCH₂CH₃ + H₂O',
    description: '酯化反应：遵循“酸脱羟基醇脱氢”的规律。乙酸失去-OH，乙醇失去-H，结合生成水，剩余部分结合生成乙酸乙酯。',
    atoms: [
      // Acetic acid part
      { id: 'C1', element: 'C', startPos: [-3, 0, 0], endPos: [-3, 0, 0] }, // Methyl C (sp3)
      { id: 'C2', element: 'C', startPos: [-1.5, 0, 0], endPos: [-1.5, 0, 0] }, // Carbonyl C (sp2)
      { id: 'O1', element: 'O', startPos: [-0.75, 1.3, 0], endPos: [-0.75, 1.3, 0] }, // Carbonyl O
      { id: 'O2', element: 'O', startPos: [-0.75, -1.3, 0], endPos: [0, -3.0, 0] }, // Hydroxyl O (leaving)
      { id: 'H_acid', element: 'H', startPos: [0.2, -1.3, 0], endPos: [-0.5, -3.8, 0] }, // Hydroxyl H (leaving with O2)
      
      // Ethanol part
      { id: 'H_alc', element: 'H', startPos: [1.2, -1.3, 0], endPos: [0.5, -3.8, 0] }, // Hydroxyl H (leaving)
      { id: 'O3', element: 'O', startPos: [2.0, -1.3, 0], endPos: [-0.5, -1.0, 0] }, // Hydroxyl O (nucleophile)
      { id: 'C3', element: 'C', startPos: [3.0, 0, 0], endPos: [0.5, -0.5, 0] }, // Methylene C (sp3)
      { id: 'C4', element: 'C', startPos: [4.5, 0, 0], endPos: [2.0, -0.5, 0] }, // Methyl C (sp3)
      
      // Methyl H's on Acetic Acid (tetrahedral around C1)
      { id: 'C1_H1', element: 'H', startPos: [-3.33, 1.03, 0], endPos: [-3.33, 1.03, 0] },
      { id: 'C1_H2', element: 'H', startPos: [-3.33, -0.51, 0.89], endPos: [-3.33, -0.51, 0.89] },
      { id: 'C1_H3', element: 'H', startPos: [-3.33, -0.51, -0.89], endPos: [-3.33, -0.51, -0.89] },
      
      // Methylene H's on Ethanol (tetrahedral around C3)
      { id: 'C3_H1', element: 'H', startPos: [2.67, 0.89, 0.51], endPos: [0.17, 0.39, 0.51] },
      { id: 'C3_H2', element: 'H', startPos: [2.67, 0.89, -0.51], endPos: [0.17, 0.39, -0.51] },
      
      // Methyl H's on Ethanol (tetrahedral around C4)
      { id: 'C4_H1', element: 'H', startPos: [4.83, 1.03, 0], endPos: [2.33, 0.53, 0] },
      { id: 'C4_H2', element: 'H', startPos: [4.83, -0.51, 0.89], endPos: [2.33, -1.01, 0.89] },
      { id: 'C4_H3', element: 'H', startPos: [4.83, -0.51, -0.89], endPos: [2.33, -1.01, -0.89] },
    ],
    bonds: [
      { id: 'b1', source: 'C1', target: 'C2', type: 'single', behavior: 'static' },
      { id: 'b2', source: 'C2', target: 'O1', type: 'double', behavior: 'static' },
      { id: 'b3', source: 'C2', target: 'O2', type: 'single', behavior: 'breaking' },
      { id: 'b4', source: 'O2', target: 'H_acid', type: 'single', behavior: 'static' },
      { id: 'b5', source: 'O3', target: 'H_alc', type: 'single', behavior: 'breaking' },
      { id: 'b6', source: 'C3', target: 'O3', type: 'single', behavior: 'static' },
      { id: 'b7', source: 'C3', target: 'C4', type: 'single', behavior: 'static' },
      { id: 'b8', source: 'C2', target: 'O3', type: 'single', behavior: 'forming' },
      { id: 'b9', source: 'O2', target: 'H_alc', type: 'single', behavior: 'forming' },
      { id: 'b10', source: 'C1', target: 'C1_H1', type: 'single', behavior: 'static' },
      { id: 'b11', source: 'C1', target: 'C1_H2', type: 'single', behavior: 'static' },
      { id: 'b12', source: 'C1', target: 'C1_H3', type: 'single', behavior: 'static' },
      { id: 'b13', source: 'C3', target: 'C3_H1', type: 'single', behavior: 'static' },
      { id: 'b14', source: 'C3', target: 'C3_H2', type: 'single', behavior: 'static' },
      { id: 'b15', source: 'C4', target: 'C4_H1', type: 'single', behavior: 'static' },
      { id: 'b16', source: 'C4', target: 'C4_H2', type: 'single', behavior: 'static' },
      { id: 'b17', source: 'C4', target: 'C4_H3', type: 'single', behavior: 'static' },
    ]
  }
];

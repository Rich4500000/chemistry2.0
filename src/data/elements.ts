export interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  period: number;
  group: number;
  category: string;
  atomicMass: number;
  electronConfiguration: string;
  electronegativity: number | null;
  meltingPoint: number | null; // K
  boilingPoint: number | null; // K
  density: number | null; // g/cm3
  description: string;
  color: string;
  radius: number;
}

export const elements: ElementData[] = [
  { atomicNumber: 1, symbol: "H", name: "氢", period: 1, group: 1, category: "非金属", atomicMass: 1.008, electronConfiguration: "1s1", electronegativity: 2.20, meltingPoint: 13.99, boilingPoint: 20.271, density: 0.00008988, description: "宇宙中最轻、最丰富的元素。", color: "#FFFFFF", radius: 0.3 },
  { atomicNumber: 2, symbol: "He", name: "氦", period: 1, group: 18, category: "稀有气体", atomicMass: 4.0026, electronConfiguration: "1s2", electronegativity: null, meltingPoint: 0.95, boilingPoint: 4.22, density: 0.0001786, description: "无色、无臭、无味的惰性单原子气体。", color: "#D9FFFF", radius: 0.28 },
  { atomicNumber: 3, symbol: "Li", name: "锂", period: 2, group: 1, category: "碱金属", atomicMass: 6.94, electronConfiguration: "[He] 2s1", electronegativity: 0.98, meltingPoint: 453.69, boilingPoint: 1615, density: 0.534, description: "最轻的金属，密度最小的固体元素。", color: "#CC80FF", radius: 1.28 },
  { atomicNumber: 4, symbol: "Be", name: "铍", period: 2, group: 2, category: "碱土金属", atomicMass: 9.0122, electronConfiguration: "[He] 2s2", electronegativity: 1.57, meltingPoint: 1560, boilingPoint: 2742, density: 1.85, description: "一种钢灰色的坚硬轻金属。", color: "#C2FF00", radius: 0.96 },
  { atomicNumber: 5, symbol: "B", name: "硼", period: 2, group: 13, category: "类金属", atomicMass: 10.81, electronConfiguration: "[He] 2s2 2p1", electronegativity: 2.04, meltingPoint: 2349, boilingPoint: 4200, density: 2.08, description: "一种黑色或棕色的类金属。", color: "#FFB5B5", radius: 0.84 },
  { atomicNumber: 6, symbol: "C", name: "碳", period: 2, group: 14, category: "非金属", atomicMass: 12.011, electronConfiguration: "[He] 2s2 2p2", electronegativity: 2.55, meltingPoint: 3800, boilingPoint: 4300, density: 2.267, description: "生命的基础元素，有多种同素异形体（如金刚石、石墨）。", color: "#909090", radius: 0.76 },
  { atomicNumber: 7, symbol: "N", name: "氮", period: 2, group: 15, category: "非金属", atomicMass: 14.007, electronConfiguration: "[He] 2s2 2p3", electronegativity: 3.04, meltingPoint: 63.15, boilingPoint: 77.36, density: 0.001251, description: "地球大气中最丰富的气体。", color: "#3050F8", radius: 0.71 },
  { atomicNumber: 8, symbol: "O", name: "氧", period: 2, group: 16, category: "非金属", atomicMass: 15.999, electronConfiguration: "[He] 2s2 2p4", electronegativity: 3.44, meltingPoint: 54.36, boilingPoint: 90.20, density: 0.001429, description: "支持燃烧和呼吸的重要气体。", color: "#FF0D0D", radius: 0.66 },
  { atomicNumber: 9, symbol: "F", name: "氟", period: 2, group: 17, category: "卤素", atomicMass: 18.998, electronConfiguration: "[He] 2s2 2p5", electronegativity: 3.98, meltingPoint: 53.53, boilingPoint: 85.03, density: 0.001696, description: "最活泼的非金属元素，电负性最高。", color: "#90E050", radius: 0.57 },
  { atomicNumber: 10, symbol: "Ne", name: "氖", period: 2, group: 18, category: "稀有气体", atomicMass: 20.180, electronConfiguration: "[He] 2s2 2p6", electronegativity: null, meltingPoint: 24.56, boilingPoint: 27.07, density: 0.0009002, description: "通电时发出红橙色光的惰性气体。", color: "#B3E3F5", radius: 0.58 },
  { atomicNumber: 11, symbol: "Na", name: "钠", period: 3, group: 1, category: "碱金属", atomicMass: 22.990, electronConfiguration: "[Ne] 3s1", electronegativity: 0.93, meltingPoint: 370.87, boilingPoint: 1156, density: 0.968, description: "柔软、银白色的活泼金属。", color: "#AB5CF2", radius: 1.66 },
  { atomicNumber: 12, symbol: "Mg", name: "镁", period: 3, group: 2, category: "碱土金属", atomicMass: 24.305, electronConfiguration: "[Ne] 3s2", electronegativity: 1.31, meltingPoint: 923, boilingPoint: 1363, density: 1.738, description: "银白色的轻金属，燃烧时发出耀眼白光。", color: "#8AFF00", radius: 1.41 },
  { atomicNumber: 13, symbol: "Al", name: "铝", period: 3, group: 13, category: "后过渡金属", atomicMass: 26.982, electronConfiguration: "[Ne] 3s2 3p1", electronegativity: 1.61, meltingPoint: 933.47, boilingPoint: 2792, density: 2.70, description: "地壳中含量最丰富的金属元素。", color: "#BFA6A6", radius: 1.21 },
  { atomicNumber: 14, symbol: "Si", name: "硅", period: 3, group: 14, category: "类金属", atomicMass: 28.085, electronConfiguration: "[Ne] 3s2 3p2", electronegativity: 1.90, meltingPoint: 1687, boilingPoint: 3538, density: 2.329, description: "重要的半导体材料，地壳中含量第二丰富的元素。", color: "#F0C8A0", radius: 1.11 },
  { atomicNumber: 15, symbol: "P", name: "磷", period: 3, group: 15, category: "非金属", atomicMass: 30.974, electronConfiguration: "[Ne] 3s2 3p3", electronegativity: 2.19, meltingPoint: 317.3, boilingPoint: 553.6, density: 1.823, description: "有白磷、红磷等多种同素异形体。", color: "#FF8000", radius: 1.07 },
  { atomicNumber: 16, symbol: "S", name: "硫", period: 3, group: 16, category: "非金属", atomicMass: 32.06, electronConfiguration: "[Ne] 3s2 3p4", electronegativity: 2.58, meltingPoint: 388.36, boilingPoint: 717.8, density: 2.07, description: "黄色的非金属固体，常见于火山地区。", color: "#FFFF30", radius: 1.05 },
  { atomicNumber: 17, symbol: "Cl", name: "氯", period: 3, group: 17, category: "卤素", atomicMass: 35.45, electronConfiguration: "[Ne] 3s2 3p5", electronegativity: 3.16, meltingPoint: 171.6, boilingPoint: 239.11, density: 0.0032, description: "黄绿色的有毒气体，具有强氧化性。", color: "#1FF01F", radius: 1.02 },
  { atomicNumber: 18, symbol: "Ar", name: "氩", period: 3, group: 18, category: "稀有气体", atomicMass: 39.948, electronConfiguration: "[Ne] 3s2 3p6", electronegativity: null, meltingPoint: 83.80, boilingPoint: 87.30, density: 0.001784, description: "大气中最丰富的稀有气体。", color: "#80D1E3", radius: 1.06 },
  { atomicNumber: 19, symbol: "K", name: "钾", period: 4, group: 1, category: "碱金属", atomicMass: 39.098, electronConfiguration: "[Ar] 4s1", electronegativity: 0.82, meltingPoint: 336.53, boilingPoint: 1032, density: 0.862, description: "柔软的银白色金属，遇水剧烈反应。", color: "#8F40D4", radius: 2.03 },
  { atomicNumber: 20, symbol: "Ca", name: "钙", period: 4, group: 2, category: "碱土金属", atomicMass: 40.078, electronConfiguration: "[Ar] 4s2", electronegativity: 1.00, meltingPoint: 1115, boilingPoint: 1757, density: 1.55, description: "生物骨骼和牙齿的重要组成元素。", color: "#3DFF00", radius: 1.76 },
  { atomicNumber: 21, symbol: "Sc", name: "钪", period: 4, group: 3, category: "过渡金属", atomicMass: 44.956, electronConfiguration: "[Ar] 3d1 4s2", electronegativity: 1.36, meltingPoint: 1814, boilingPoint: 3109, density: 2.985, description: "一种柔软的银白色过渡金属。", color: "#E6E6E6", radius: 1.70 },
  { atomicNumber: 22, symbol: "Ti", name: "钛", period: 4, group: 4, category: "过渡金属", atomicMass: 47.867, electronConfiguration: "[Ar] 3d2 4s2", electronegativity: 1.54, meltingPoint: 1941, boilingPoint: 3560, density: 4.506, description: "具有高强度重量比和优良抗腐蚀性的金属。", color: "#BFC2C7", radius: 1.60 },
  { atomicNumber: 23, symbol: "V", name: "钒", period: 4, group: 5, category: "过渡金属", atomicMass: 50.942, electronConfiguration: "[Ar] 3d3 4s2", electronegativity: 1.63, meltingPoint: 2183, boilingPoint: 3680, density: 6.0, description: "一种坚硬的银灰色延展性金属。", color: "#A6A6AB", radius: 1.53 },
  { atomicNumber: 24, symbol: "Cr", name: "铬", period: 4, group: 6, category: "过渡金属", atomicMass: 51.996, electronConfiguration: "[Ar] 3d5 4s1", electronegativity: 1.66, meltingPoint: 2180, boilingPoint: 2944, density: 7.19, description: "一种坚硬的钢灰色金属，常用于不锈钢。", color: "#8A99C7", radius: 1.39 },
  { atomicNumber: 25, symbol: "Mn", name: "锰", period: 4, group: 7, category: "过渡金属", atomicMass: 54.938, electronConfiguration: "[Ar] 3d5 4s2", electronegativity: 1.55, meltingPoint: 1519, boilingPoint: 2334, density: 7.21, description: "一种坚硬脆性的银灰色金属。", color: "#9C7AC7", radius: 1.39 },
  { atomicNumber: 26, symbol: "Fe", name: "铁", period: 4, group: 8, category: "过渡金属", atomicMass: 55.845, electronConfiguration: "[Ar] 3d6 4s2", electronegativity: 1.83, meltingPoint: 1811, boilingPoint: 3134, density: 7.874, description: "地球上最常见的元素（按质量计），构成地核的主要部分。", color: "#E06633", radius: 1.32 },
  { atomicNumber: 27, symbol: "Co", name: "钴", period: 4, group: 9, category: "过渡金属", atomicMass: 58.933, electronConfiguration: "[Ar] 3d7 4s2", electronegativity: 1.88, meltingPoint: 1768, boilingPoint: 3200, density: 8.90, description: "一种具有铁磁性的硬质银灰色金属。", color: "#F090A0", radius: 1.26 },
  { atomicNumber: 28, symbol: "Ni", name: "镍", period: 4, group: 10, category: "过渡金属", atomicMass: 58.693, electronConfiguration: "[Ar] 3d8 4s2", electronegativity: 1.91, meltingPoint: 1728, boilingPoint: 3186, density: 8.908, description: "一种具有铁磁性的银白色金属，常用于合金。", color: "#50D050", radius: 1.24 },
  { atomicNumber: 29, symbol: "Cu", name: "铜", period: 4, group: 11, category: "过渡金属", atomicMass: 63.546, electronConfiguration: "[Ar] 3d10 4s1", electronegativity: 1.90, meltingPoint: 1357.77, boilingPoint: 2835, density: 8.96, description: "一种具有极高导热性和导电性的红橙色金属。", color: "#C88033", radius: 1.32 },
  { atomicNumber: 30, symbol: "Zn", name: "锌", period: 4, group: 12, category: "过渡金属", atomicMass: 65.38, electronConfiguration: "[Ar] 3d10 4s2", electronegativity: 1.65, meltingPoint: 692.68, boilingPoint: 1180, density: 7.14, description: "一种略带蓝白色的金属，常用于防腐镀层。", color: "#7D80B0", radius: 1.22 },
  { atomicNumber: 31, symbol: "Ga", name: "镓", period: 4, group: 13, category: "后过渡金属", atomicMass: 69.723, electronConfiguration: "[Ar] 3d10 4s2 4p1", electronegativity: 1.81, meltingPoint: 302.91, boilingPoint: 2477, density: 5.91, description: "一种在室温附近熔化的柔软银色金属。", color: "#C28F8F", radius: 1.22 },
  { atomicNumber: 32, symbol: "Ge", name: "锗", period: 4, group: 14, category: "类金属", atomicMass: 72.630, electronConfiguration: "[Ar] 3d10 4s2 4p2", electronegativity: 2.01, meltingPoint: 1211.40, boilingPoint: 3106, density: 5.323, description: "一种灰白色的类金属，重要的半导体材料。", color: "#668F8F", radius: 1.20 },
  { atomicNumber: 33, symbol: "As", name: "砷", period: 4, group: 15, category: "类金属", atomicMass: 74.922, electronConfiguration: "[Ar] 3d10 4s2 4p3", electronegativity: 2.18, meltingPoint: 1090, boilingPoint: 887, density: 5.727, description: "一种有毒的类金属，有多种同素异形体。", color: "#BD80E3", radius: 1.19 },
  { atomicNumber: 34, symbol: "Se", name: "硒", period: 4, group: 16, category: "非金属", atomicMass: 78.971, electronConfiguration: "[Ar] 3d10 4s2 4p4", electronegativity: 2.55, meltingPoint: 494, boilingPoint: 958, density: 4.81, description: "一种非金属，具有光电导性。", color: "#FFA100", radius: 1.20 },
  { atomicNumber: 35, symbol: "Br", name: "溴", period: 4, group: 17, category: "卤素", atomicMass: 79.904, electronConfiguration: "[Ar] 3d10 4s2 4p5", electronegativity: 2.96, meltingPoint: 265.8, boilingPoint: 332.0, density: 3.1028, description: "室温下唯一的液态非金属元素，红棕色发烟液体。", color: "#A62929", radius: 1.20 },
  { atomicNumber: 36, symbol: "Kr", name: "氪", period: 4, group: 18, category: "稀有气体", atomicMass: 83.798, electronConfiguration: "[Ar] 3d10 4s2 4p6", electronegativity: 3.00, meltingPoint: 115.79, boilingPoint: 119.93, density: 0.003749, description: "一种无色、无臭、无味的稀有气体。", color: "#5CB8D1", radius: 1.16 }
];

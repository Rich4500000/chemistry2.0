import React, { useState } from 'react';
import { MolecularCrystals } from './components/MolecularCrystals';
import { MetallicCrystals } from './components/MetallicCrystals';
import { CovalentCrystals } from './components/CovalentCrystals';
import { IonicCrystals } from './components/IonicCrystals';
import { DiamondRings } from './components/DiamondRings';
import { CustomBuilder } from './components/CustomBuilder';
import { OrganicMolecules } from './components/OrganicMolecules';
import { OrganicReactions } from './components/OrganicReactions';
import { MixedCrystals } from './components/MixedCrystals';
import { TransitionalCrystals } from './components/TransitionalCrystals';
import { Layers, Zap, Hexagon, Hammer, Box, CircleDot, TestTube, Activity, Gem } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type View = 'molecular' | 'metallic' | 'covalent' | 'ionic' | 'mixed' | 'transitional' | 'diamondrings' | 'custom' | 'organic' | 'organic-reactions';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('molecular');

  const navItems = [
    { id: 'molecular', label: '分子晶体', icon: <Box size={20} /> },
    { id: 'metallic', label: '金属晶体', icon: <Zap size={20} /> },
    { id: 'covalent', label: '共价晶体', icon: <Layers size={20} /> },
    { id: 'ionic', label: '离子晶体', icon: <CircleDot size={20} /> },
    { id: 'mixed', label: '混合晶体', icon: <Layers size={20} /> },
    { id: 'transitional', label: '过渡晶体', icon: <Gem size={20} /> },
    { id: 'organic', label: '有机物模型', icon: <TestTube size={20} /> },
    { id: 'organic-reactions', label: '有机反应动画', icon: <Activity size={20} /> },
    { id: 'diamondrings', label: '金刚石六元环', icon: <Hexagon size={20} /> },
    { id: 'custom', label: '自定义搭建', icon: <Hammer size={20} /> },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className="w-20 md:w-64 bg-slate-900 text-slate-300 flex flex-col items-center md:items-start py-8 border-r border-slate-800 shrink-0 overflow-y-auto">
        <div className="px-4 md:px-8 mb-12 flex items-center gap-3 w-full justify-center md:justify-start">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">
            R
          </div>
          <h1 className="text-xl font-bold text-white hidden md:block tracking-tight">richandchemistry</h1>
        </div>

        <div className="flex flex-col gap-2 w-full px-4 pb-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all w-full ${
                currentView === item.id 
                  ? 'bg-blue-600/20 text-blue-400 font-medium' 
                  : 'hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="shrink-0">{item.icon}</div>
              <span className="hidden md:block">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full absolute inset-0"
          >
            {currentView === 'molecular' && <MolecularCrystals />}
            {currentView === 'metallic' && <MetallicCrystals />}
            {currentView === 'covalent' && <CovalentCrystals />}
            {currentView === 'ionic' && <IonicCrystals />}
            {currentView === 'mixed' && <MixedCrystals />}
            {currentView === 'transitional' && <TransitionalCrystals />}
            {currentView === 'organic' && <OrganicMolecules />}
            {currentView === 'organic-reactions' && <OrganicReactions />}
            {currentView === 'diamondrings' && <DiamondRings />}
            {currentView === 'custom' && <CustomBuilder />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

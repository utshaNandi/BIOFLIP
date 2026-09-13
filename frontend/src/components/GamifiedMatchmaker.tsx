import React, { useState } from 'react';
import { motion, useAnimation, useMotionValue, useTransform, type PanInfo, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';

interface Props {
  ligands: any[];
  protein: any;
}

export const GamifiedMatchmaker: React.FC<Props> = ({ ligands, protein }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'failure'>('idle');

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // These transforms rely on 'x' being a pure number, not a string like '100vw'
  const rotate = useTransform(x, [-300, 300], [-10, 10]);
  const passOpacity = useTransform(x, [-50, -150], [0, 1]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  const activeLigand = ligands[currentIndex];

  // ==========================================
  // CORRECTED SVG SHAPES
  // ==========================================
  const getLigandPeg = (shape: string) => {
    const base = "M 120 70 A 90 90 0 0 0 120 250 ";
    let peg = "";
    if (shape === 'square') {
      peg = "L 120 250 L 210 250 L 210 70 L 120 70 Z";
    } else if (shape === 'triangle') {
      peg = "L 120 250 L 210 160 L 120 70 Z"; 
    } else { 
      peg = "C 220 250 220 70 120 70 Z"; 
    }
    return base + peg;
  };

  const getProteinGroove = (shape: string) => {
    const baseRight = "M 600 0 L 600 800 L 150 800 ";
    let groove = "";
    if (shape === 'square') {
      groove = "L 150 480 L 240 480 L 240 300 L 150 300 ";
    } else if (shape === 'triangle') {
      groove = "L 150 480 L 240 390 L 150 300 ";
    } else { 
      groove = "L 150 480 C 250 480 250 300 150 300 ";
    }
    const baseTop = "L 150 0 Z";
    return baseRight + groove + baseTop;
  };

  // ==========================================
  // SWIPE LOGIC
  // ==========================================
  const processRightSwipe = async () => {
    if (activeLigand.isPerfectFit) {
      setFeedback('success');
    } else {
      setFeedback('failure');
    }
    
    // Using strict numeric values (1000) so useTransform math doesn't break
    await controls.start({ x: 1000, y: 50, opacity: 0, rotate: 20, transition: { duration: 0.4, ease: "easeOut" } });
    advanceQueue();
  };

  const processLeftSwipe = async (currentY: number) => {
    // Using strict numeric values (-1000) so useTransform math doesn't break
    await controls.start({ x: -1000, y: currentY, opacity: 0, rotate: -20, transition: { duration: 0.4, ease: "easeOut" } });
    advanceQueue();
  };

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const swipeThreshold = 150;
    if (info.offset.x > swipeThreshold) await processRightSwipe();
    else if (info.offset.x < -swipeThreshold) await processLeftSwipe(info.offset.y);
    else controls.start({ x: 0, y: 0, rotate: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } });
  };

  const handleButtonAction = async (direction: 'left' | 'right') => {
    if (direction === 'right') await processRightSwipe();
    else await processLeftSwipe(50);
  };

  const advanceQueue = () => {
    setFeedback('idle');
    // Instantly snap the next card back to the center invisible
    controls.set({ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.8 });
    x.set(0); 
    y.set(0);
    setCurrentIndex(prev => (prev + 1) % ligands.length);
    // Animate it scaling into view
    controls.start({ opacity: 1, scale: 1, transition: { duration: 0.3 } });
  };

  if (!activeLigand) return null;

  const mockSMILES = activeLigand.isPerfectFit ? "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O" : "C1=CC=C(C=C1)C(=O)O";
  const mockMW = (Math.random() * (500 - 200) + 200).toFixed(1);
  const mockLogP = (Math.random() * (5 - 1) + 1).toFixed(1);
  const mockTPSA = (Math.random() * (120 - 40) + 40).toFixed(1);
  const mockCharge = Math.floor(Math.random() * 3) - 1;
  const mockHBD = Math.floor(Math.random() * 4);
  const mockHBA = Math.floor(Math.random() * 6) + 2;
  const mockRot = Math.floor(Math.random() * 8) + 1;
  const affinity = activeLigand.isPerfectFit ? -(Math.random() * (10 - 7) + 7).toFixed(1) : -(Math.random() * (6 - 2) + 2).toFixed(1);

  return (
    <div className="w-full h-screen flex relative overflow-hidden font-sans">
      
      {/* LEFT DIVISION - Japandi Ivory */}
      <div className="w-1/2 h-full bg-[#FDFBF7] relative flex items-center justify-center z-10">
        
        {/* DRAGGABLE LIGAND CARD */}
        <motion.div
          key={activeLigand.id || activeLigand.name} // Key forces React to treat this as a fresh card
          style={{ x, y, rotate, scale }}
          drag
          dragConstraints={{ left: -500, right: 500, top: -200, bottom: 200 }}
          dragElastic={0.8}
          onDragEnd={handleDragEnd}
          animate={controls}
          whileTap={{ cursor: "grabbing" }}
          className="w-[440px] bg-white rounded-[2rem] shadow-[0_15px_50px_rgba(0,0,0,0.06)] border border-[#1A1A1A]/5 flex flex-col cursor-grab relative z-20 pb-6"
        >
          <motion.div style={{ opacity: passOpacity }} className="absolute top-8 right-8 border-4 border-rose-500 text-rose-500 px-6 py-2 rounded-2xl font-black text-3xl rotate-12 z-40 bg-white/90 backdrop-blur-md">
            PASS
          </motion.div>
          <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 border-4 border-emerald-500 text-emerald-500 px-6 py-2 rounded-2xl font-black text-3xl -rotate-12 z-40 bg-white/90 backdrop-blur-md">
            BIND
          </motion.div>

          <div className="px-8 pt-10 pb-4 text-center">
            <h2 className="text-3xl font-extrabold text-[#1A1A1A] mb-3 tracking-tight">{activeLigand.name}</h2>
            <div className="bg-[#F4EFEA] rounded-full py-2 px-4 inline-block">
              <p className="font-mono text-[10px] text-[#1A1A1A]/60 uppercase tracking-widest">{mockSMILES}</p>
            </div>
          </div>

          <div className="w-full h-64 flex items-center justify-center relative my-4">
            <svg viewBox="0 0 320 320" className="w-56 h-auto drop-shadow-xl transform translate-x-4">
              <path 
                d={getLigandPeg(activeLigand.pegShape)} 
                fill={activeLigand.isPerfectFit ? "#FBBF24" : "#A78BFA"} 
                stroke="#ffffff"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="px-10">
            <div className="grid grid-cols-4 gap-y-6 gap-x-2 text-center mb-8 border-t border-[#1A1A1A]/5 pt-6">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/40 font-bold mb-1">Weight</span>
                <span className="font-mono text-sm text-[#1A1A1A] font-bold">{mockMW}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/40 font-bold mb-1">LogP</span>
                <span className="font-mono text-sm text-[#1A1A1A] font-bold">{mockLogP}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/40 font-bold mb-1">TPSA</span>
                <span className="font-mono text-sm text-[#1A1A1A] font-bold">{mockTPSA}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/40 font-bold mb-1">Charge</span>
                <span className="font-mono text-sm text-[#1A1A1A] font-bold">{mockCharge}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/40 font-bold mb-1">HBD/A</span>
                <span className="font-mono text-sm text-[#1A1A1A] font-bold">{mockHBD}/{mockHBA}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/40 font-bold mb-1">Rot. Bonds</span>
                <span className="font-mono text-sm text-[#1A1A1A] font-bold">{mockRot}</span>
              </div>
              <div className="col-span-2 flex flex-col justify-center bg-white rounded-xl py-2 border border-[#1A1A1A]/10 shadow-sm">
                <span className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/50 font-bold">Predicted Affinity</span>
                <span className="font-mono text-lg font-black text-[#1A1A1A]">{affinity} <span className="text-[10px] text-[#1A1A1A]/50">kcal/mol</span></span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#0F172A] rounded-2xl px-6 py-4 shadow-md">
              <span className="text-xs uppercase tracking-widest text-white/80 font-bold">Compatibility</span>
              <span className="font-mono text-xl font-black text-emerald-400">
                {activeLigand.compatibilityScore}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CENTER BOUNDARY BUTTONS */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-8 z-50">
        <button 
          onClick={() => handleButtonAction('left')}
          className="w-24 h-24 rounded-full bg-white shadow-2xl border border-rose-100 flex items-center justify-center text-rose-500 hover:scale-110 hover:bg-rose-50 transition-all duration-300 group"
        >
          <X className="w-10 h-10 group-hover:text-rose-600 transition-colors" strokeWidth={3} />
        </button>
        <button 
          onClick={() => handleButtonAction('right')}
          className="w-24 h-24 rounded-full bg-white shadow-2xl border border-emerald-100 flex items-center justify-center text-emerald-500 hover:scale-110 hover:bg-emerald-50 transition-all duration-300 group"
        >
          <Heart className="w-10 h-10 fill-current group-hover:text-emerald-600 transition-colors" strokeWidth={2.5} />
        </button>
      </div>

      {/* RIGHT DIVISION - Dark Mode Background */}
      <div className="w-1/2 h-full relative overflow-hidden bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#1E1B4B] z-0">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
             {Array.from({ length: 8 }).map((_, i) => (
                <path key={i} d={`M -100 ${i * 100} Q 200 ${i * 100 + 100} 500 ${i * 100} T 1100 ${i * 100}`} fill="none" stroke="#FFFFFF" strokeWidth="2" />
             ))}
          </svg>
        </div>

        <div className="absolute inset-y-0 right-0 w-[120%] flex items-center justify-end pointer-events-none">
          <svg viewBox="0 0 600 800" className="h-screen w-auto drop-shadow-2xl">
            <defs>
              <linearGradient id="protein-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BE185D" />
                <stop offset="100%" stopColor="#831843" />
              </linearGradient>
              <filter id="protein-shadow">
                <feDropShadow dx="-20" dy="0" stdDeviation="30" floodColor="#000000" floodOpacity="0.5" />
              </filter>
            </defs>
            <path 
              d={getProteinGroove(protein.grooveShape)} 
              fill="url(#protein-grad)" 
              filter="url(#protein-shadow)"
            />
          </svg>
        </div>

        <div className="absolute top-16 right-16 text-right z-30">
          <h1 className="text-6xl font-serif font-black text-white tracking-tight mb-8 drop-shadow-lg">{protein.name}</h1>
          <div className="flex items-center gap-6 bg-white/5 px-6 py-4 rounded-xl border border-white/10 backdrop-blur-md">
            <div className="text-right">
              <p className="text-[10px] text-pink-300 uppercase tracking-widest font-bold">Class</p>
              <p className="font-mono text-sm text-white font-medium">{protein.class}</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-right">
              <p className="text-[10px] text-pink-300 uppercase tracking-widest font-bold">Hydrophobicity</p>
              <p className="font-mono text-sm text-white font-medium">{protein.hydrophobicity}</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-right">
              <p className="text-[10px] text-pink-300 uppercase tracking-widest font-bold">Charge</p>
              <p className="font-mono text-sm text-white font-medium">{protein.charge}</p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {feedback !== 'idle' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-1/2 left-32 transform -translate-y-1/2 z-40"
            >
              <div className={`px-10 py-6 rounded-3xl backdrop-blur-xl border-2 shadow-2xl ${
                feedback === 'success' 
                  ? 'bg-emerald-900/60 border-emerald-500/50 text-emerald-400' 
                  : 'bg-rose-900/60 border-rose-500/50 text-rose-400'
              }`}>
                <p className="text-2xl font-black uppercase tracking-widest">
                  {feedback === 'success' ? "Molecular Match" : "Enzyme Mismatch"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
    </div>
  );
};
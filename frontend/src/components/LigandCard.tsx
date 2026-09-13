import React from 'react';
import { motion, useMotionValue, useTransform, useAnimation, type PanInfo } from 'framer-motion';
import type { Ligand, SwipeDirection } from '../types';
import { X, Heart, Search, Activity, Droplets, Zap, Combine } from 'lucide-react';

interface LigandCardProps {
  ligand: Ligand;
  isTopCard: boolean;
  onSwipe: (direction: SwipeDirection) => void;
}

export const LigandCard: React.FC<LigandCardProps> = ({ ligand, isTopCard, onSwipe }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();

  // Map the drag distance to physical rotation (Tinder effect)
  const rotate = useTransform(x, [-300, 300], [-18, 18]);
  
  // Map drag distance to overlay opacities
  const passOpacity = useTransform(x, [-50, -150], [0, 1]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const investigateOpacity = useTransform(y, [-50, -150], [0, 1]);

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const swipeThreshold = 120;
    const velocity = info.velocity.x;

    // Fast flick or dragging past the threshold triggers the swipe
    if (info.offset.x > swipeThreshold || velocity > 500) {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
      onSwipe('right');
    } else if (info.offset.x < -swipeThreshold || velocity < -500) {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
      onSwipe('left');
    } else if (info.offset.y < -swipeThreshold) {
      await controls.start({ y: -500, opacity: 0, transition: { duration: 0.3 } });
      onSwipe('up');
    } else {
      // Snap back to center if threshold wasn't met
      controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const triggerButtonSwipe = async (direction: SwipeDirection) => {
    const xMove = direction === 'left' ? -500 : direction === 'right' ? 500 : 0;
    const yMove = direction === 'up' ? -500 : 0;
    await controls.start({ x: xMove, y: yMove, opacity: 0, transition: { duration: 0.4 } });
    onSwipe(direction);
  };

  // Static background card rendering
  if (!isTopCard) {
    return (
      <motion.div 
        initial={{ scale: 0.94, y: 30 }}
        animate={{ scale: 0.94, y: 30 }}
        className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-sand/50 shadow-sm pointer-events-none z-0"
      />
    );
  }

  // Active top card rendering
  return (
    <motion.div
      style={{ x, y, rotate }}
      animate={controls}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.98, cursor: 'grabbing' }}
      className="absolute inset-0 bg-white rounded-[2rem] border border-sand shadow-2xl flex flex-col cursor-grab select-none z-10 overflow-hidden"
    >
      {/* Visual Feedback Overlays */}
      <motion.div style={{ opacity: passOpacity }} className="absolute top-8 right-8 border-4 border-terracotta text-terracotta px-4 py-1.5 rounded-xl font-serif font-bold text-3xl tracking-widest rotate-12 pointer-events-none z-20">
        PASS
      </motion.div>
      <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 border-4 border-sage text-sage px-4 py-1.5 rounded-xl font-serif font-bold text-3xl tracking-widest -rotate-12 pointer-events-none z-20">
        MATCH
      </motion.div>
      <motion.div style={{ opacity: investigateOpacity }} className="absolute bottom-32 left-1/2 -translate-x-1/2 border-4 border-charcoal text-charcoal px-6 py-2 rounded-xl font-serif font-bold text-2xl tracking-widest pointer-events-none z-20 bg-white/80">
        INVESTIGATE
      </motion.div>

      {/* Top Half: Molecular Structure Display */}
      <div className="h-[45%] bg-ivory relative border-b border-sand/50 flex flex-col items-center justify-center p-6">
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-charcoal uppercase tracking-widest shadow-sm">
          {ligand.compatibilityScore}% Compatible
        </div>
        
        {/* Placeholder for actual 2D/3D render */}
        <div className="w-full h-full flex items-center justify-center opacity-80">
           <svg viewBox="0 0 100 100" className="w-32 h-32">
             <path d="M 30 50 L 50 30 L 70 50 L 50 70 Z M 70 50 L 90 50 M 30 50 L 10 50" stroke="var(--color-charcoal)" strokeWidth="2" fill="none" />
             <circle cx="50" cy="30" r="4" fill="var(--color-terracotta)" />
             <circle cx="50" cy="70" r="4" fill="var(--color-sage)" />
           </svg>
        </div>
        <p className="absolute bottom-2 text-[10px] font-mono text-charcoal/40 max-w-[90%] truncate">{ligand.smiles}</p>
      </div>

      {/* Bottom Half: Scientific Profile */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-end mb-1">
            <h2 className="font-serif text-4xl text-charcoal font-bold tracking-tight">{ligand.name}</h2>
            <span className="font-mono text-xl text-sage font-bold">{ligand.predictedAffinity} <span className="text-xs text-charcoal/50">kcal/mol</span></span>
          </div>
          <p className="font-mono text-xs text-charcoal/60 mb-6">{ligand.formula} • MW: {ligand.molecularWeight}</p>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-ivory/50 rounded-xl p-3 border border-sand/30 flex items-center gap-3">
              <Droplets className="w-5 h-5 text-terracotta/70" />
              <div>
                <p className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold">LogP (Hydrophobicity)</p>
                <p className="font-mono text-sm text-charcoal">{ligand.logP}</p>
              </div>
            </div>
            <div className="bg-ivory/50 rounded-xl p-3 border border-sand/30 flex items-center gap-3">
              <Zap className="w-5 h-5 text-sage/70" />
              <div>
                <p className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold">TPSA (Polarity)</p>
                <p className="font-mono text-sm text-charcoal">{ligand.tpsa}</p>
              </div>
            </div>
            <div className="bg-ivory/50 rounded-xl p-3 border border-sand/30 flex items-center gap-3">
              <Activity className="w-5 h-5 text-charcoal/50" />
              <div>
                <p className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold">H-Bond Don/Acc</p>
                <p className="font-mono text-sm text-charcoal">{ligand.hbd} / {ligand.hba}</p>
              </div>
            </div>
            <div className="bg-ivory/50 rounded-xl p-3 border border-sand/30 flex items-center gap-3">
              <Combine className="w-5 h-5 text-charcoal/50" />
              <div>
                <p className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold">Rotatable Bonds</p>
                <p className="font-mono text-sm text-charcoal">{ligand.rotatableBonds}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-6 pt-4">
          <button 
            onClick={() => triggerButtonSwipe('left')}
            className="w-14 h-14 bg-white border-2 border-sand rounded-full flex items-center justify-center text-terracotta hover:bg-terracotta/5 transition-colors shadow-sm"
          >
            <X className="w-6 h-6" />
          </button>
          <button 
            onClick={() => triggerButtonSwipe('up')}
            className="w-12 h-12 bg-white border-2 border-sand rounded-full flex items-center justify-center text-charcoal/60 hover:bg-sand/20 transition-colors shadow-sm"
          >
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={() => triggerButtonSwipe('right')}
            className="w-14 h-14 bg-white border-2 border-sand rounded-full flex items-center justify-center text-sage hover:bg-sage/10 transition-colors shadow-sm"
          >
            <Heart className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
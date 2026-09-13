import React from 'react';
import { motion } from 'framer-motion';
import type { Ligand, Protein } from '../types';

interface Props {
  ligand: Ligand;
  protein: Protein;
  onContinue: () => void;
}

export const MatchModal: React.FC<Props> = ({ ligand, protein, onContinue }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg bg-ivory rounded-[2rem] border border-sand shadow-2xl p-8 flex flex-col items-center"
      >
        <div className="w-20 h-20 rounded-full border-4 border-sage flex items-center justify-center text-sage mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-10 h-10">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        
        <h2 className="font-serif text-3xl font-bold text-charcoal mb-2">It's a Match!</h2>
        <p className="text-center text-charcoal/70 mb-8">
          <strong className="text-charcoal">{ligand.name}</strong> binds strongly to the <strong className="text-charcoal">{protein.name}</strong> pocket.
        </p>

        <div className="w-full bg-white rounded-2xl border border-sand p-5 mb-8">
          <h3 className="text-[10px] uppercase tracking-widest text-charcoal/50 font-bold mb-4 text-center">Why did they match?</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-charcoal/80">Shape Compatibility</span>
              <span className="font-mono font-bold text-sage">{ligand.compatibilityBreakdown.shapeFit}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-charcoal/80">Hydrophobic Fit</span>
              <span className="font-mono font-bold text-sage">{ligand.compatibilityBreakdown.hydrophobicFit}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-charcoal/80">Hydrogen Bonding</span>
              <span className="font-mono font-bold text-sage">{ligand.compatibilityBreakdown.hBondFit}%</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-sand/50 text-xs text-charcoal/60 text-center leading-relaxed">
            The ligand contains hydrophobic regions that interact favorably with the residues inside the binding pocket. Lower binding free energy ({ligand.predictedAffinity} kcal/mol) indicates stronger predicted binding.
          </div>
        </div>

        <button 
          onClick={onContinue}
          className="w-full py-4 bg-charcoal text-white rounded-xl font-bold tracking-widest text-xs uppercase hover:bg-charcoal/90 transition-colors"
        >
          Keep Screening
        </button>
      </motion.div>
    </motion.div>
  );
};
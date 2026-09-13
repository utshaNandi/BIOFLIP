import React from 'react';
import { motion } from 'framer-motion';
import type { Protein } from '../types';

interface Props {
  proteins: Protein[];
  onSelect: (protein: Protein) => void;
}

export const ProteinSelector: React.FC<Props> = ({ proteins, onSelect }) => {
  return (
    <div className="w-full max-w-4xl mx-auto pt-10">
      <h1 className="font-serif text-4xl text-charcoal mb-2 text-center">Choose your target.</h1>
      <p className="text-sm text-charcoal/60 mb-10 text-center uppercase tracking-widest">Select a protein to begin screening.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {proteins.map((protein) => (
          <motion.div
            key={protein.id}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => onSelect(protein)}
            className="p-6 bg-white border border-sand rounded-3xl shadow-sm hover:shadow-md cursor-pointer transition-shadow"
          >
            <h2 className="font-serif text-2xl text-charcoal mb-1">{protein.name}</h2>
            <p className="text-xs font-mono text-sage mb-4">PDB: {protein.pdbId} | {protein.category}</p>
            {/* Abstract representation of the protein groove */}
            <div className="h-24 bg-sage/10 rounded-xl flex items-center justify-end px-4 border border-sage/20">
               <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-50">
                 <path d="M 100 0 C 60 10 30 40 30 50 C 30 60 60 90 100 100 L 100 0 Z" fill="var(--color-sage)" />
               </svg>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
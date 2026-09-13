import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mapping the 6 distinct modules to their respective individual images[cite: 5]
const modules = [
  {
    id: 'decode-life',
    title: 'Decode Life',
    subtitle: 'DNA to Protein Translation',
    path: '/genecraft',
    image: '/cell1.jpg', 
    fallbackColor: 'bg-[#F4EFEA]' // Warm ivory
  },
  {
    id: 'deepdock',
    title: 'BioFlip Lite', 
    subtitle: 'The Ligand Matchmaking Arena',
    path: '/arena',
    image: '/cell2.jpg', 
    fallbackColor: 'bg-[#8F9B82]' // Muted sage
  },
  {
    id: 'biosystems',
    title: 'Small Systems',
    subtitle: 'Bacterial Growth Curves',
    path: '/biogrow',
    image: '/cell3.jpg', 
    fallbackColor: 'bg-[#E5D9C5]' // Natural sand
  },
  {
    id: 'discovery',
    title: 'Curiosity & Discovery',
    subtitle: 'Drug-Likeness Prediction',
    path: '/pharmascan',
    image: '/cell4.jpg', 
    fallbackColor: 'bg-[#D98371]' // Subtle terracotta
  },
  {
    id: 'patch',
    title: 'Biological Necessity',
    subtitle: 'CRISPR Target Design',
    path: '/crispr',
    image: '/cell5.jpg', 
    fallbackColor: 'bg-[#2D3748]' // Charcoal
  },
  {
    id: 'tindermed',
    title: 'Match & Learn',
    subtitle: 'Variant Impact Analysis',
    path: '/variant',
    image: '/cell6.jpg', 
    fallbackColor: 'bg-[#D4DFD7]' // Soft sage/grey
  }
];

export const LandingGrid: React.FC = () => {
  const [activeCell, setActiveCell] = useState<string | null>(null);

  const handleCellClick = (modId: string, e: React.MouseEvent) => {
    // Only Cell 6 triggers navigation; others show "Under Progress"[cite: 5]
    if (modId === 'tindermed') {
      return; 
    }

    e.preventDefault();
    e.stopPropagation();
    setActiveCell(modId);

    setTimeout(() => {
      setActiveCell(null);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
      
      {/* Japandi Minimalist Header[cite: 5] */}
      <header className="w-full max-w-[1200px] mb-8 text-left z-10 px-6">
        <h1 className="font-serif text-4xl text-[#1A1A1A] font-bold tracking-tight">
          BioFlip Lite
        </h1>
        <p className="text-[#1A1A1A]/50 uppercase tracking-[0.2em] text-[10px] font-bold mt-1">
          Computational Biology Suite
        </p>
      </header>

      {/* The Unified Seamless Grid Container (Sharp edges, no gaps)[cite: 5] */}
      <div className="w-full max-w-[1200px] h-[75vh] min-h-[600px] overflow-hidden shadow-2xl bg-black">
        
        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 w-full h-full gap-0">
          {modules.map((mod) => {
            const isUnderProgress = activeCell === mod.id;

            return (
              <div
                key={mod.id}
                data-path={mod.path}
                onClick={(e) => handleCellClick(mod.id, e)}
                className={`group relative w-full h-full cursor-pointer overflow-hidden transition-all duration-500 ${mod.fallbackColor} ${isUnderProgress ? 'grayscale' : ''}`}
              >
                
                {/* Individual Image Layer */}
                <div 
                  className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-500 ${isUnderProgress ? 'opacity-30' : 'opacity-100'}`}
                  style={{
                    backgroundImage: `url('${mod.image}')`,
                    backgroundRepeat: 'no-repeat'
                  }}
                />

                {/* Typography Reveal[cite: 5] */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end pointer-events-none overflow-hidden z-10">
                  <div className={`transform translate-y-8 opacity-0 transition-all duration-500 ease-out ${isUnderProgress ? 'hidden' : 'group-hover:translate-y-0 group-hover:opacity-100'}`}>
                    <h2 className="font-serif text-3xl text-white font-bold tracking-tight mb-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                      {mod.title}
                    </h2>
                    <p className="text-[11px] font-sans text-white/90 tracking-widest uppercase max-w-[90%] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                      {mod.subtitle}
                    </p>
                  </div>
                </div>

                {/* Under Progress Overlay */}
                <AnimatePresence>
                  {isUnderProgress && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-0 flex items-center justify-center z-20 bg-black/40"
                    >
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full shadow-lg">
                        <span className="text-white font-bold tracking-widest uppercase text-sm">Under Progress</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};
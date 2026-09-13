import { useState, useEffect } from 'react';
import { LandingGrid } from './components/LandingGrid';
import { GamifiedMatchmaker } from './components/GamifiedMatchmaker';
import { ArrowLeft } from 'lucide-react';

// Hardcoded 5 Proteins with distinct physical groove shapes[cite: 3]
const HARDCODED_PROTEINS = [
  { id: 'egfr', name: 'EGFR Kinase', class: 'Receptor', hydrophobicity: 'High', charge: 'Neutral', grooveShape: 'triangle' },
  { id: 'd2', name: 'Dopamine D2 Receptor', class: 'GPCR', hydrophobicity: 'Medium', charge: 'Positive', grooveShape: 'square' },
  { id: 'hiv', name: 'HIV-1 Protease', class: 'Enzyme', hydrophobicity: 'High', charge: 'Negative', grooveShape: 'curve' },
  { id: 'cox2', name: 'COX-2 Enzyme', class: 'Enzyme', hydrophobicity: 'Very High', charge: 'Neutral', grooveShape: 'triangle' },
  { id: 'ace2', name: 'ACE2 Receptor', class: 'Hydrolase', hydrophobicity: 'Medium', charge: 'Negative', grooveShape: 'curve' }
];

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [selectedProtein, setSelectedProtein] = useState(HARDCODED_PROTEINS[0]);
  const [ligands, setLigands] = useState<any[]>([]);

  // Simple Native Router[cite: 3]
  useEffect(() => {
    const handleNavigation = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Generate a queue of ligands based on code rules, not AI[cite: 3]
  useEffect(() => {
    if (currentPath === '/' || currentPath === '') return;

    const shapes = ['triangle', 'square', 'curve'];
    const newLigands = Array.from({ length: 15 }).map((_, i) => {
      const isMatch = Math.random() > 0.5;
      const pegShape = isMatch 
        ? selectedProtein.grooveShape 
        : shapes.find(s => s !== selectedProtein.grooveShape) || 'square';

      return {
        id: `ligand-${i}-${Date.now()}`,
        name: `Candidate L-${Math.floor(Math.random() * 900) + 100}`,
        pegShape: pegShape,
        isPerfectFit: pegShape === selectedProtein.grooveShape,
        compatibilityScore: pegShape === selectedProtein.grooveShape ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 30) + 20
      };
    });

    setLigands(newLigands);
  }, [selectedProtein, currentPath]);

  // ==========================================
  // 1. FRONT PAGE (Restored to exact original state)
  // ==========================================
  if (currentPath === '/' || currentPath === '') {
    return (
      <div onClick={(e) => {
        const target = e.target as HTMLElement;
        const card = target.closest('[data-path]');
        if (card) {
          e.preventDefault();
          navigateTo(card.getAttribute('data-path') || '/');
        }
      }}>
        <LandingGrid />
      </div>
    );
  }

  // ==========================================
  // 2. MATCHMAKING ARENA (Full screen, no header)
  // ==========================================
  return (
    <div className="w-full h-screen overflow-hidden relative bg-[#FDFBF7]">
      
      {/* Minimalist Floating Back Button */}
      <button 
        onClick={() => navigateTo('/')}
        className="absolute top-8 left-8 z-50 p-4 bg-white/80 backdrop-blur-md rounded-full border border-black/5 shadow-lg hover:scale-110 hover:bg-white transition-all focus:outline-none"
      >
        <ArrowLeft className="w-6 h-6 text-slate-800" />
      </button>

      {/* Render the full-bleed Matchmaker */}
      {ligands.length > 0 && (
        <GamifiedMatchmaker 
          key={selectedProtein.id} 
          ligands={ligands} 
          protein={selectedProtein}
          onQueueEmpty={() => console.log("Queue finished")}
        />
      )}
    </div>
  );
}
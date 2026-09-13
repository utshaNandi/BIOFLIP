export interface PocketPersonality {
  hydrophobicity: number; // 0 - 100
  polarity: number;       // 0 - 100
  charge: number;         // -100 to 100
  hBondPotential: number; // 0 - 100
  flexibility: number;    // 0 - 100
  archetype: string;      // e.g. "Selective & Hydrophobic"
}

export interface Protein {
  id: string;
  name: string;
  pdbId: string;
  category: string;
  description: string;
  personality: PocketPersonality;
  knownLigandCount: number;
}

export interface Ligand {
  id: string;
  name: string;
  formula: string;
  smiles: string;
  molecularWeight: number;
  logP: number;
  tpsa: number;
  hbd: number;
  hba: number;
  rotatableBonds: number;
  charge: number;
  predictedAffinity: number; // kcal/mol (e.g. -8.7)
  compatibilityScore: number; // 0 - 100
  compatibilityBreakdown: {
    shapeFit: number;
    hydrophobicFit: number;
    hBondFit: number;
    chargeFit: number;
  };
}

export type SwipeDirection = 'left' | 'right' | 'up';
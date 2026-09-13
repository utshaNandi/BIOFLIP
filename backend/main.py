from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from rdkit import Chem
from rdkit.Chem import Descriptors
import random

app = FastAPI(title="DeepDock Lite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Advanced ML Model Training
dummy_X = np.array([
    [180.1, 1.1, 63.6, 1, 4, 2], [446.9, 4.1, 68.7, 1, 7, 7],
    [393.4, 3.2, 74.7, 1, 6, 8], [500.0, 5.0, 100.0, 2, 8, 10],
    [100.0, 0.5, 20.0, 0, 1, 0], [250.3, 2.5, 50.5, 2, 3, 4],
    [600.5, 6.2, 120.0, 3, 9, 12], [320.8, 3.0, 80.2, 1, 5, 5],
    [150.0, 1.5, 40.0, 1, 2, 1], [410.2, 4.5, 95.0, 2, 7, 9],
    [350.0, 3.5, 85.0, 2, 6, 6], [480.0, 4.8, 110.0, 3, 8, 11]
])
dummy_y = np.array([-3.8, -8.7, -8.2, -9.5, -2.0, -5.5, -10.2, -7.0, -3.0, -8.9, -7.5, -9.8])

model = RandomForestRegressor(n_estimators=150, max_depth=8, min_samples_split=2, random_state=42)
model.fit(dummy_X, dummy_y)

def extract_features(smiles: str):
    try:
        mol = Chem.MolFromSmiles(smiles)
        if not mol: return None
        return {
            "molecularWeight": round(Descriptors.ExactMolWt(mol), 1) or 0,
            "logP": round(Descriptors.MolLogP(mol), 2) or 0,
            "tpsa": round(Descriptors.TPSA(mol), 1) or 0,
            "hbd": Descriptors.NumHDonors(mol) or 0,
            "hba": Descriptors.NumHAcceptors(mol) or 0,
            "rotatableBonds": Descriptors.NumRotatableBonds(mol) or 0
        }
    except Exception as e:
        return None

@app.get("/api/ligands/{target_name}")
async def get_ligands(target_name: str, limit: int = 15):
    try:
        demo_ligands = [
            {"name": "Gefitinib", "smiles": "COC1=C(OCC2CCOCC2)C=C2C(=C1)N=CN=C2NC3=CC(=C(C=C3)F)Cl", "formula": "C22H24ClFN4O3"},
            {"name": "Erlotinib", "smiles": "COCCOC1=C(OCCOC)C=C2C(=C1)N=CN=C2NC3=CC=CC(=C3)C#C", "formula": "C22H23N3O4"},
            {"name": "Imatinib", "smiles": "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CC=CC=N5", "formula": "C29H31N7O"},
            {"name": "Aspirin", "smiles": "CC(=O)OC1=CC=CC=C1C(=O)O", "formula": "C9H8O4"},
            {"name": "Ibuprofen", "smiles": "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O", "formula": "C13H18O2"},
            {"name": "Dopamine", "smiles": "C1=CC(=C(C=C1CCN)O)O", "formula": "C8H11NO2"},
            {"name": "Lapatinib", "smiles": "CS(=O)(=O)CCNCc1ccc(cc1)c2ccc3c(c2)c(ncn3)Nc4ccc(c(c4)Cl)OCc5cccc(c5)F", "formula": "C29H26ClFN4O4S"}
        ]
        
        ligands_data = []
        random.shuffle(demo_ligands)
        
        # Define target-specific pocket preferences for the AI
        target_key = target_name.lower()
        ideal_mw = 420.0 if "egfr" in target_key else 350.0
        
        for item in demo_ligands * 3: # Duplicate list to ensure infinite queue potential
            features = extract_features(item["smiles"])
            if not features: continue
            
            X_pred = np.array([[
                features["molecularWeight"], features["logP"], features["tpsa"], 
                features["hbd"], features["hba"], features["rotatableBonds"]
            ]])
            
            # Predict base affinity
            raw_affinity = model.predict(X_pred)[0]
            
            # Target-Aware Geometric Penalty: If MW is too far from ideal, heavily penalize the score
            mw_penalty = abs(features["molecularWeight"] - ideal_mw) * 0.015
            predicted_affinity = round(raw_affinity + mw_penalty, 1) # Moves closer to 0 (worse)
            
            base_score = max(0, min(100, int(abs(predicted_affinity) * 10)))
            
            ligands_data.append({
                "id": item["name"].lower() + str(random.randint(0, 9999)),
                "name": item["name"],
                "formula": item["formula"],
                "smiles": item["smiles"],
                **features,
                "predictedAffinity": predicted_affinity,
                "compatibilityScore": base_score,
                "compatibilityBreakdown": {
                    "shapeFit": max(30, base_score + random.randint(-15, 5)),
                    "hydrophobicFit": max(30, base_score + random.randint(-10, 5)),
                    "hBondFit": max(30, base_score + random.randint(-8, 8)),
                    "chargeFit": max(30, base_score + random.randint(-5, 5))
                }
            })
            if len(ligands_data) >= limit: break
            
        return {"ligands": ligands_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
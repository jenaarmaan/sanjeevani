import pandas as pd
import numpy as np
import random
from typing import List, Dict, Any, Optional
from schema.triage_schema import TriageInput, PatientSymptoms, ChronicConditions, RiskLevel
from rules.emergency_rules import evaluate_emergency_rules
from rules.risk_rules import evaluate_risk_rules

class SanjeevaniDataGenerator:
    """
    Generates medically-informed synthetic data for Project Sanjeevani.
    Focuses on General Triage schema and realistic correlation between factors.
    """

    def __init__(self, seed: int = 42):
        np.random.seed(seed)
        random.seed(seed)

    def generate_sample(self, force_risk_tier: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates a single synthetic patient record.
        force_risk_tier: Optional parameter to bias generation towards certain levels for balancing.
        """
        # 1. Base Demographics
        if force_risk_tier == "HIGH" or force_risk_tier == "EMERGENCY":
            age = random.randint(60, 95)
        elif force_risk_tier == "MODERATE":
            age = random.randint(40, 75)
        else:
            age = random.randint(1, 100)
            
        gender = random.choice(["Male", "Female", "Other"])
        
        # 2. Chronic Conditions (correlated with age)
        prob_chronic = min(0.1 + (age / 100) * 0.6, 0.8)
        diabetes = random.random() < (prob_chronic * 0.5)
        hypertension = random.random() < (prob_chronic * 0.6)
        
        # 3. Symptoms
        # Emergency symptoms (Rare unless forced)
        chest_pain = False
        breathlessness = False
        
        if force_risk_tier == "EMERGENCY":
            if random.random() > 0.5:
                chest_pain = True
            else:
                breathlessness = True
        else:
            chest_pain = random.random() < 0.02
            breathlessness = random.random() < 0.05

        # Standard symptoms
        fever = random.random() < (0.3 if force_risk_tier != "LOW" else 0.1)
        cough = random.random() < (0.4 if force_risk_tier != "LOW" else 0.15)
        fatigue = random.random() < (0.2 if force_risk_tier != "LOW" else 0.05)
        
        fever_days = random.randint(1, 7) if fever else 0

        # Construct Schema Objects
        symptoms = PatientSymptoms(
            fever=fever,
            fever_duration_days=fever_days,
            cough=cough,
            breathlessness=breathlessness,
            chest_pain=chest_pain,
            fatigue=fatigue
        )
        
        conditions = ChronicConditions(
            diabetes=diabetes,
            hypertension=hypertension
        )
        
        triage_input = TriageInput(
            age=age,
            gender=gender,
            symptoms=symptoms,
            chronic_conditions=conditions,
            patient_id=f"SYN-{random.randint(10000, 99999)}"
        )

        # 4. Labeling Logic (Rule-Driven with slight noise for ML training)
        # We use the actual rules to label the data to ensure consistency.
        emergency_eval = evaluate_emergency_rules(triage_input)
        if emergency_eval:
            label = RiskLevel.EMERGENCY
            score = 10.0
        else:
            risk_eval = evaluate_risk_rules(triage_input)
            label = risk_eval.risk_level
            score = risk_eval.assessment_score

        # Flat dictionary for DataFrame output
        return {
            "patient_id": triage_input.patient_id,
            "age": age,
            "gender": gender,
            "fever": fever,
            "fever_duration_days": fever_days,
            "cough": cough,
            "breathlessness": breathlessness,
            "chest_pain": chest_pain,
            "fatigue": fatigue,
            "diabetes": diabetes,
            "hypertension": hypertension,
            "assessment_score": score,
            "risk_label": label.value
        }

    def generate_dataset(self, n_samples: int = 5000) -> pd.DataFrame:
        """
        Generates a balanced dataset of health records.
        """
        data = []
        
        # Class Balance Strategy:
        # We want to oversample rare classes (High/Emergency) and Moderate cases
        # while keeping Low as the baseline but not overwhelming.
        # Target: ~30% Low, ~30% Moderate, ~30% High, ~10% Emergency
        
        tiers = ["LOW", "MODERATE", "HIGH", "EMERGENCY"]
        weights = [0.30, 0.30, 0.30, 0.10]
        
        print(f"Generating {n_samples} synthetic triage records...")
        
        for i in range(n_samples):
            target_tier = np.random.choice(tiers, p=weights)
            sample = self.generate_sample(force_risk_tier=target_tier)
            data.append(sample)
            
            if (i+1) % 1000 == 0:
                print(f"Generated {i+1} samples...")

        return pd.DataFrame(data)

if __name__ == "__main__":
    import os
    
    # Path setup
    output_dir = "intelligence/data"
    os.makedirs(output_dir, exist_ok=True)
    
    generator = SanjeevaniDataGenerator()
    df = generator.generate_dataset(5000)
    
    # Save results
    output_path = os.path.join(output_dir, "synthetic_triage_data.csv")
    df.to_csv(output_path, index=False)
    
    print("\nGeneration Complete.")
    print(f"Dataset saved to: {output_path}")
    print("\nClass Distribution:")
    print(df['risk_label'].value_counts(normalize=True))
    print("\nFirst 5 records:")
    print(df.head())

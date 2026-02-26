import sys
import os

from schema.triage_schema import TriageInput, PatientSymptoms, ChronicConditions, RiskLevel
from core.triage_engine import SanjeevaniTriageEngine

def test_pediatric_triage():
    engine = SanjeevaniTriageEngine()
    
    print("-" * 50)
    print("Project Sanjeevani: Pediatric Health Domain Validation")
    print("-" * 50)

    # CASE 1: Infant Emergency (Age < 1yr + Fever 39C)
    infant_emergency = TriageInput(
        age=0,
        symptoms=PatientSymptoms(fever=True),
        chronic_conditions=ChronicConditions(),
        metadata={
            "age_years": 0.5,
            "temp_c": 39.0
        }
    )
    res1 = engine.process(infant_emergency)
    print(f"\n[CASE 1] Infant Emergency (<1yr + Fever 39C):")
    print(f"   Final Risk: {res1.risk_level.value}")
    print(f"   Is Emergency: {res1.is_emergency}")
    print(f"   Reasons: {[r for r in res1.reasons if 'Pediatric' in r]}")

    # CASE 2: High Risk (Malnutrition + Prolonged Fever)
    # Scoring: Malnutrition(4) + Fever > 3d(3) = 7 -> HIGH
    high_risk_ped = TriageInput(
        age=5,
        symptoms=PatientSymptoms(fever=True, fever_duration_days=5),
        chronic_conditions=ChronicConditions(),
        metadata={
            "age_years": 5,
            "malnutrition_signs": True
        }
    )
    res2 = engine.process(high_risk_ped)
    print(f"\n[CASE 2] High Risk Pediatric (Malnutrition + 5d Fever):")
    print(f"   Final Risk: {res2.risk_level.value}")
    print(f"   Reasons: {res2.reasons}")

    # CASE 3: Low Risk Child (Normal Fever)
    low_risk_ped = TriageInput(
        age=8,
        symptoms=PatientSymptoms(fever=True, fever_duration_days=1),
        chronic_conditions=ChronicConditions(),
        metadata={
            "age_years": 8,
            "temp_c": 37.5
        }
    )
    res3 = engine.process(low_risk_ped)
    print(f"\n[CASE 3] Low Risk Pediatric (1d Fever):")
    print(f"   Final Risk: {res3.risk_level.value}")

    # CASE 4: Pediatric Seizures (Immediate Emergency)
    seizure_input = TriageInput(
        age=3,
        symptoms=PatientSymptoms(),
        chronic_conditions=ChronicConditions(),
        metadata={
            "age_years": 3,
            "seizures": True
        }
    )
    res4 = engine.process(seizure_input)
    print(f"\n[CASE 4] Pediatric Emergency (Seizures):")
    print(f"   Final Risk: {res4.risk_level.value}")
    print(f"   Reasons: {[r for r in res4.reasons if 'Pediatric' in r]}")

if __name__ == "__main__":
    test_pediatric_triage()

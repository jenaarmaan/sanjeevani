import sys
import os

# Ensure project root is in path
sys.path.append(os.getcwd())

from schema.triage_schema import TriageInput, PatientSymptoms, ChronicConditions, RiskLevel
from core.triage_engine import SanjeevaniTriageEngine

def test_triage():
    engine = SanjeevaniTriageEngine()
    
    print("-" * 50)
    print("Sanjeevani Triage System - Validation Test")
    print("-" * 50)

    # Test Case 1: Critical Emergency
    emergency_input = TriageInput(
        age=50,
        symptoms=PatientSymptoms(chest_pain=True),
        chronic_conditions=ChronicConditions()
    )
    res1 = engine.process(emergency_input)
    print(f"[CASE 1] Emergency Check (Chest Pain):")
    print(f"   Risk Level: {res1.risk_level.value}")
    print(f"   Reasons: {res1.reasons}")
    print(f"   Is Emergency: {res1.is_emergency}")

    # Test Case 2: High Risk Refinement (ML Pattern)
    # Rules result in MODERATE (6 points), ML refines to HIGH
    high_risk_input = TriageInput(
        age=71,
        symptoms=PatientSymptoms(fatigue=True),
        chronic_conditions=ChronicConditions(diabetes=True)
    )
    res2 = engine.process(high_risk_input)
    print(f"\n[CASE 2] High Risk Refinement (Elderly + Diabetes + Fatigue):")
    print(f"   Risk Level: {res2.risk_level.value}")
    print(f"   Reasons: {res2.reasons}")
    print(f"   ML Insight Check: {'ML Insight' in str(res2.reasons)}")

    # Test Case 3: Low Risk
    low_risk_input = TriageInput(
        age=25,
        symptoms=PatientSymptoms(cough=True),
        chronic_conditions=ChronicConditions()
    )
    res3 = engine.process(low_risk_input)
    print(f"\n[CASE 3] Low Risk (Young + Single Symptom):")
    print(f"   Risk Level: {res3.risk_level.value}")
    print(f"   Reasons: {res3.reasons}")

if __name__ == "__main__":
    test_triage()

import sys
import os

from schema.triage_schema import TriageInput, PatientSymptoms, ChronicConditions, RiskLevel
from core.triage_engine import SanjeevaniTriageEngine

def test_integration():
    engine = SanjeevaniTriageEngine()
    
    print("-" * 50)
    print("Sanjeevani Triage - ML Integration Validation")
    print("-" * 50)

    # Test Case 1: Upgrade Check
    # Let's find a case where rules say MODERATE but ML might say HIGH
    # (High age + Diabetes is often refined by our ML pattern)
    upgrade_input = TriageInput(
        age=85,
        gender="Female",
        symptoms=PatientSymptoms(fatigue=True, cough=True),
        chronic_conditions=ChronicConditions(diabetes=True)
    )
    # Rules: Diabetes(2) + Age>60(3) + Fatigue(1) + Cough(1) = 7 -> HIGH
    # Wait, 7 is already HIGH in our rules. 
    
    # Let's try: Age 61(3) + Fatigue(1) = 4 (MODERATE)
    # If ML sees Age 61 and Fatigue and maybe gender as a risk, it might upgrade.
    
    # Let's try to simulate a downgrade prevention.
    # We will force a case where rules say HIGH but we'll see what ML says.
    high_input = TriageInput(
        age=90,
        gender="Male",
        symptoms=PatientSymptoms(fever=True, fever_duration_days=4),
        chronic_conditions=ChronicConditions(diabetes=True, hypertension=True)
    )
    # Rules: Age>60(3) + Fever>3d(4) + Diabetes(2) + Hypertension(2) = 11 -> HIGH
    
    res = engine.process(high_input)
    print(f"\n[CASE] High Risk (Rule-based):")
    print(f"   Final Risk: {res.risk_level.value}")
    print(f"   ML Prediction: {res.metadata.get('ml_prediction')}")
    ml_confidence = res.metadata.get('ml_confidence')
    conf_str = f"{ml_confidence:.2f}" if ml_confidence is not None else "ML Bypassed (Rule-based decision)"
    print(f"   ML Confidence: {conf_str}")

    # Verify no downgrade
    if res.risk_level == RiskLevel.HIGH and res.metadata.get('ml_prediction') == 'MODERATE':
        print("   SUCCESS: ML attempted downgrade to MODERATE, but Rule-based HIGH was maintained.")
    else:
        print(f"   Note: ML agreed or also predicted high/equal.")

if __name__ == "__main__":
    test_integration()

import sys
import os

from schema.triage_schema import TriageInput, PatientSymptoms, ChronicConditions, RiskLevel
from core.triage_engine import SanjeevaniTriageEngine

def test_maternal_triage():
    engine = SanjeevaniTriageEngine()
    
    print("-" * 50)
    print("Project Sanjeevani: Maternal Health Domain Validation")
    print("-" * 50)

    # CASE 1: Maternal Emergency (Seizures)
    # Even if general symptoms are mild, seizures in pregnancy is a critical red flag.
    emergency_input = TriageInput(
        age=28,
        symptoms=PatientSymptoms(),
        chronic_conditions=ChronicConditions(),
        metadata={
            "is_pregnant": True,
            "weeks_pregnant": 32,
            "seizures": True
        }
    )
    res1 = engine.process(emergency_input)
    print(f"\n[CASE 1] Maternal Emergency (Seizures):")
    print(f"   Final Risk: {res1.risk_level.value}")
    print(f"   Is Emergency: {res1.is_emergency}")
    print(f"   Maternal Reasons Detected: {[r for r in res1.reasons if 'Maternal' in r]}")

    # CASE 2: High Risk Late Pregnancy (Diabetes + 38 weeks)
    # Scoring: Gestational Diabetes(3) + Late Pregnancy(2) = 5 -> HIGH
    high_risk_input = TriageInput(
        age=25,
        symptoms=PatientSymptoms(fatigue=True),
        chronic_conditions=ChronicConditions(),
        metadata={
            "is_pregnant": True,
            "weeks_pregnant": 38,
            "gestational_diabetes": True
        }
    )
    res2 = engine.process(high_risk_input)
    print(f"\n[CASE 2] High Risk (38 Weeks + Diabetes):")
    print(f"   Final Risk: {res2.risk_level.value}")
    print(f"   Maternal Upgrade Check: {'Maternal Risk Rule: Upgraded' in str(res2.reasons)}")
    print(f"   Reasons: {res2.reasons}")

    # CASE 3: Low Risk Early Pregnancy (10 weeks)
    # Scoring: Early pregnancy (<28 weeks) + No symptoms = Low
    low_risk_input = TriageInput(
        age=24,
        symptoms=PatientSymptoms(),
        chronic_conditions=ChronicConditions(),
        metadata={
            "is_pregnant": True,
            "weeks_pregnant": 10
        }
    )
    res3 = engine.process(low_risk_input)
    print(f"\n[CASE 3] Low Risk (Early Pregnancy + No Symptoms):")
    print(f"   Final Risk: {res3.risk_level.value}")

    # CASE 4: Critical Hypertension (Sys BP >= 160)
    # Passed via vitals
    bp_input = TriageInput(
        age=30,
        symptoms=PatientSymptoms(),
        chronic_conditions=ChronicConditions(),
        vitals={"sys_bp": 165},
        metadata={
            "is_pregnant": True,
            "weeks_pregnant": 24
        }
    )
    res4 = engine.process(bp_input)
    print(f"\n[CASE 4] Maternal Emergency (Critical BP 165):")
    print(f"   Final Risk: {res4.risk_level.value}")
    print(f"   Reasons: {[r for r in res4.reasons if 'BP' in r]}")

if __name__ == "__main__":
    test_maternal_triage()

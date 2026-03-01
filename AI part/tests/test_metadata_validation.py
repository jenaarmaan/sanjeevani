import sys
import os

from schema.triage_schema import TriageInput, PatientSymptoms, ChronicConditions, RiskLevel
from core.triage_engine import SanjeevaniTriageEngine

def test_metadata_validation():
    engine = SanjeevaniTriageEngine()
    
    print("-" * 50)
    print("Project Sanjeevani: Metadata Validation Layer Test")
    print("-" * 50)

    # CASE 1: Invalid weeks_pregnant (Out of range) + VALID EMERGENCY (Seizures)
    # Expected: Warning generated, but EMERGENCY still triggers.
    invalid_weeks_input = TriageInput(
        age=25,
        symptoms=PatientSymptoms(),
        chronic_conditions=ChronicConditions(),
        metadata={
            "is_pregnant": True,
            "weeks_pregnant": 99, # INVALID
            "seizures": True # VALID EMERGENCY
        }
    )
    res1 = engine.process(invalid_weeks_input)
    print(f"\n[CASE 1] Invalid Weeks (99) + Seizures:")
    print(f"   Final Risk: {res1.risk_level.value}")
    print(f"   Is Emergency: {res1.is_emergency}")
    print(f"   Validation Warnings: {[r for r in res1.reasons if 'Metadata Validation' in r]}")

    # CASE 2: Invalid BP Type (String)
    invalid_bp_input = TriageInput(
        age=30,
        symptoms=PatientSymptoms(),
        chronic_conditions=ChronicConditions(),
        metadata={
            "is_pregnant": True,
            "sys_bp": "CRITICALLY_HIGH" # INVALID
        }
    )
    res2 = engine.process(invalid_bp_input)
    print(f"\n[CASE 2] Invalid BP type (String):")
    print(f"   Final Risk: {res2.risk_level.value}")
    print(f"   Validation Warnings: {[r for r in res2.reasons if 'Metadata Validation' in r]}")

    # CASE 3: Invalid is_pregnant type
    # Expected: Maternal domain bypassed, general triage continues.
    mixed_input = TriageInput(
        age=28,
        symptoms=PatientSymptoms(),
        chronic_conditions=ChronicConditions(),
        metadata={
            "is_pregnant": "YES", # INVALID TYPE
            "vaginal_bleeding": True # Maternal Red Flag
        }
    )
    res3 = engine.process(mixed_input)
    print(f"\n[CASE 3] Invalid 'is_pregnant' type (String):")
    print(f"   Final Risk: {res3.risk_level.value}")
    print(f"   Validation Warnings: {[r for r in res3.reasons if 'Metadata Validation' in r]}")
    print(f"   Is Emergency: {res3.is_emergency} (Should be False because Maternal bypassed)")

if __name__ == "__main__":
    test_metadata_validation()

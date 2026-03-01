import sys
import os
from schema.triage_schema import TriageInput, PatientSymptoms, ChronicConditions, RiskLevel
from core.triage_engine import SanjeevaniTriageEngine

def run_safety_audit():
    """
    Healthcare Safety Audit Suite for Project Sanjeevani.
    Verifies system behavior in high-stakes edge cases.
    """
    engine = SanjeevaniTriageEngine()
    
    scenarios = [
        {
            "id": "SAFE-001",
            "name": "Conflicting - Normal Vitals + Seizure",
            "input": TriageInput(
                age=25,
                symptoms=PatientSymptoms(),
                chronic_conditions=ChronicConditions(),
                vitals={"temp_c": 37.0, "sys_bp": 120},
                metadata={"is_pregnant": True, "seizures": True}
            ),
            "expected_risk": RiskLevel.EMERGENCY,
            "rationale": "Medical red flag (Seizure) must override normal vitals."
        },
        {
            "id": "SAFE-002",
            "name": "Partial Metadata - Pregnancy No Weeks",
            "input": TriageInput(
                age=25,
                symptoms=PatientSymptoms(),
                chronic_conditions=ChronicConditions(),
                metadata={"is_pregnant": True, "vaginal_bleeding": True}
            ),
            "expected_risk": RiskLevel.EMERGENCY,
            "rationale": "Maternal red flag triggers even without optional 'weeks_pregnant'."
        },
        {
            "id": "SAFE-003",
            "name": "Corrupted Types - Strings for Numbers",
            "input": TriageInput(
                age=25,
                symptoms=PatientSymptoms(),
                chronic_conditions=ChronicConditions(),
                metadata={"age_years": "NOT_AN_AGE", "is_pregnant": True, "seizures": True}
            ),
            "expected_risk": RiskLevel.EMERGENCY,
            "rationale": "Validator strips bad types; rules detect emergency from valid flags."
        },
        {
            "id": "SAFE-004",
            "name": "Safety Floor - ML Downgrade Block",
            "input": TriageInput(
                age=90,
                symptoms=PatientSymptoms(breathlessness=True),
                chronic_conditions=ChronicConditions(diabetes=True)
            ),
            "expected_risk": RiskLevel.EMERGENCY,
            "rationale": "Breathlessness is a hard red flag; Layer 1 logic dominates."
        },
        {
            "id": "SAFE-005",
            "name": "Multi-Domain Overlap - Pregnant Minor",
            "input": TriageInput(
                age=11,
                symptoms=PatientSymptoms(),
                chronic_conditions=ChronicConditions(),
                metadata={"is_pregnant": True, "age_years": 11}
            ),
            "expected_risk": RiskLevel.MODERATE, 
            "rationale": "11yo pregnant triggers Pediatric domain (11 < 12) and Maternal domain (<18 points)."
        }
    ]

    print("="*80)
    print("PROJECT SANJEEVANI: HEALTHCARE SAFETY AUDIT")
    print("="*80)
    
    results = []
    for s in scenarios:
        print(f"\n[Scenario {s['id']}] {s['name']}")
        output = engine.process(s['input'])
        
        passed = (output.risk_level == s['expected_risk'])
        status = "PASSED" if passed else "FAILED"
        
        print(f"   Expected: {s['expected_risk'].value}")
        print(f"   Actual:   {output.risk_level.value}")
        print(f"   Verdict:  {status}")
        if not passed:
             print(f"   DEBUG: Reasons: {output.reasons}")
        
        results.append({
            "id": s['id'],
            "name": s['name'],
            "expected": s['expected_risk'].value,
            "actual": output.risk_level.value,
            "status": status
        })

    # Summary Matrix
    print("\n" + "="*80)
    print("SAFETY SCENARIO MATRIX")
    print("="*80)
    print(f"{'ID':<10} | {'Scenario Name':<40} | {'Status':<10}")
    print("-" * 80)
    for r in results:
        print(f"{r['id']:<10} | {r['name']:<40} | {r['status']:<10}")
    
    all_passed = all(r['status'] == "PASSED" for r in results)
    print("\nFINAL SAFETY VERDICT: " + ("CERTIFIED SAFE" if all_passed else "SAFETY ALERT - FIX REQUIRED"))
    print("="*80)

if __name__ == "__main__":
    run_safety_audit()

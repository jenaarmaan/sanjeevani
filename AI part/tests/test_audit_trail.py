import sys
import json

from schema.triage_schema import TriageInput, PatientSymptoms, ChronicConditions, RiskLevel
from core.triage_engine import SanjeevaniTriageEngine

def test_audit_trail():
    engine = SanjeevaniTriageEngine()
    
    print("-" * 60)
    print("Project Sanjeevani: Audit Trail & Explainability Validation")
    print("-" * 60)

    # CASE: Pediatric Patient with ML Refinement
    # This should trigger Layer 0, 1, 2, 4, 5
    child_input = TriageInput(
        age=5,
        symptoms=PatientSymptoms(fatigue=True),
        chronic_conditions=ChronicConditions(diabetes=True),
        metadata={
            "age_years": 5,
            "malnutrition_signs": True
        }
    )
    
    result = engine.process(child_input)
    
    print(f"\n[RESULTS] Final Risk: {result.risk_level.value}")
    print("\n[DECISION TRACE]")
    for entry in result.decision_trace:
        step = entry.get("step")
        source = entry.get("source", "N/A")
        print(f"-> STEP: {step}")
        print(f"   Source: {source}")
        for k, v in entry.items():
            if k not in ["step", "source"]:
                print(f"   {k}: {v}")

    # Validation assertions
    steps = [e["step"] for e in result.decision_trace]
    assert "Input Validation" in steps
    assert "General Risk Assessment" in steps
    assert "Pediatric Risk Assessment" in steps
    assert "ML Refinement" in steps
    
    print("\nTrace Completeness: VERIFIED")

    # CASE: Maternal Emergency (Safety Override Check)
    # We will simulate a safety override via config later, 
    # but for now let's just see a maternal trace.
    maternal_input = TriageInput(
        age=25,
        symptoms=PatientSymptoms(),
        chronic_conditions=ChronicConditions(),
        metadata={
            "is_pregnant": True,
            "seizures": True
        }
    )
    res_mat = engine.process(maternal_input)
    print(f"\n[MATERNAL CASE] Risk: {res_mat.risk_level.value}")
    steps_mat = [e["step"] for e in res_mat.decision_trace]
    print(f"Steps: {steps_mat}")
    assert "Maternal Risk Assessment" in steps_mat

if __name__ == "__main__":
    test_audit_trail()

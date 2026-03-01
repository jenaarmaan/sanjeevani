import sys
import json
import os
import dataclasses
from typing import Any, Dict

# Add project root to path for core imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from core.triage_engine import SanjeevaniTriageEngine
from schema.triage_schema import TriageInput, PatientSymptoms, ChronicConditions, RiskLevel

def serialize_result(obj: Any) -> Any:
    """Recursively serializes dataclasses and enums to JSON-friendly format."""
    if dataclasses.is_dataclass(obj):
        return {k: serialize_result(v) for k, v in dataclasses.asdict(obj).items()}
    if isinstance(obj, Enum):
        return obj.value
    if isinstance(obj, list):
        return [serialize_result(i) for i in obj]
    if isinstance(obj, dict):
        return {k: serialize_result(v) for k, v in obj.items()}
    return obj

def main():
    try:
        # 1. Read input from stdin
        input_data = json.load(sys.stdin)
        
        # 2. Map input to TriageInput
        # We manually map JSON fields to ensure schema stability
        symptoms = PatientSymptoms(
            fever=input_data.get("symptoms", {}).get("fever", False),
            fever_duration_days=input_data.get("symptoms", {}).get("fever_duration_days", 0),
            cough=input_data.get("symptoms", {}).get("cough", False),
            breathlessness=input_data.get("symptoms", {}).get("breathlessness", False),
            chest_pain=input_data.get("symptoms", {}).get("chest_pain", False),
            fatigue=input_data.get("symptoms", {}).get("fatigue", False)
        )
        
        chronic = ChronicConditions(
            diabetes=input_data.get("chronic_conditions", {}).get("diabetes", False),
            hypertension=input_data.get("chronic_conditions", {}).get("hypertension", False)
        )
        
        triage_input = TriageInput(
            age=input_data.get("age", 0),
            symptoms=symptoms,
            chronic_conditions=chronic,
            patient_id=input_data.get("patient_id"),
            gender=input_data.get("gender", "Unknown"),
            vitals=input_data.get("vitals", {}),
            metadata=input_data.get("metadata", {})
        )
        
        # 3. Initialize engine and process
        # Use absolute path for storage if needed, or relative to script
        engine = SanjeevaniTriageEngine()
        result = engine.process(triage_input)
        
        # 4. Output structured JSON
        output = {
            "status": "success",
            "risk_level": result.risk_level.value,
            "reasons": result.reasons,
            "suggested_actions": result.suggested_actions,
            "is_emergency": result.is_emergency,
            "assessment_score": result.assessment_score,
            "explanation": result.explanation,
            "decision_trace": result.decision_trace
        }
        
        print(json.dumps(output, indent=2))
        
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    # Helper needed for Enums mentioned in serialize_result
    from enum import Enum
    main()

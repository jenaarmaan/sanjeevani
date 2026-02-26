from typing import List, Optional
from schema.triage_schema import TriageInput, RiskLevel, TriageOutput

def evaluate_emergency_rules(data: TriageInput) -> Optional[TriageOutput]:
    """
    Evaluates critical red flags that require immediate medical attention.
    This is the first layer of the hybrid system.
    """
    reasons: List[str] = []
    is_emergency: bool = False

    # 1. Cardiac Red Flags
    if data.symptoms.chest_pain:
        reasons.append("Patient reports chest pain - potential cardiac event.")
        is_emergency = True

    # 2. Respiratory Red Flags
    if data.symptoms.breathlessness:
        reasons.append("Patient reports breathlessness - potential respiratory distress.")
        is_emergency = True

    if is_emergency:
        return TriageOutput(
            risk_level=RiskLevel.EMERGENCY,
            reasons=reasons,
            suggested_actions=[
                "Seek immediate emergency medical care.",
                "Call local emergency services (e.g., 108/112).",
                "Do not wait for further evaluation."
            ],
            is_emergency=True
        )

    return None # Pass to next layer if no emergency

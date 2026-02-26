from typing import List
from schema.triage_schema import TriageInput, RiskLevel, TriageOutput

def evaluate_risk_rules(data: TriageInput) -> TriageOutput:
    """
    Evaluates risk based on symptoms, age, and chronic conditions.
    This handles non-emergency cases.
    """
    reasons: List[str] = []
    points: int = 0
    
    # Chronic conditions increase risk profile
    if data.chronic_conditions.diabetes:
        points += 2
        reasons.append("Pre-existing condition: Diabetes")
    if data.chronic_conditions.hypertension:
        points += 2
        reasons.append("Pre-existing condition: Hypertension")

    # Age as a risk factor
    if data.age > 60:
        points += 3
        reasons.append("Age over 60 increases vulnerability")
    elif data.age > 45:
        points += 1

    # Symptom weightage
    if data.symptoms.fever:
        points += 2
        if data.symptoms.fever_duration_days >= 3:
            points += 2
            reasons.append("Prolonged fever (3+ days)")
        else:
            reasons.append("Presence of fever")
            
    if data.symptoms.cough:
        points += 1
        reasons.append("Presence of cough")
    
    if data.symptoms.fatigue:
        points += 1
        reasons.append("Presence of fatigue")

    # Risk Categorization
    level: RiskLevel
    if points >= 7:
        level = RiskLevel.HIGH
        actions = ["Consult a doctor within 24 hours.", "Monitor oxygen levels and temperature closely."]
    elif points >= 4:
        level = RiskLevel.MODERATE
        actions = ["Schedule a tele-consultation.", "Isolate and monitor symptoms."]
    else:
        level = RiskLevel.LOW
        actions = ["Rest and stay hydrated.", "Monitor if symptoms worsen.", "Standard preventive care."]

    return TriageOutput(
        risk_level=level,
        reasons=reasons,
        suggested_actions=actions,
        is_emergency=False,
        assessment_score=float(points)
    )

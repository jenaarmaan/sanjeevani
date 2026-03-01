from schema.triage_schema import TriageInput, TriageOutput, RiskLevel
from core.config_loader import ClinicalConfig

def evaluate_pediatric_risk(data: TriageInput, base_output: TriageOutput) -> TriageOutput:
    """
    Evaluates Pediatric specific risks for children using externalized thresholds.
    Rules run after General Triage and can only upgrade the risk level.

    Safety: Non-diagnostic risk assessment. 
    Design: Clinical thresholds are read from config/clinical_thresholds.json 
            with safe defaults as fallbacks.
    """
    metadata = data.metadata
    age_years = metadata.get("age_years")
    
    # --- THRESHOLD LOADING (FAIL-SAFE) ---
    # We load constants from config. If missing, we use hardcoded safe defaults
    # to maintain functional integrity.
    
    activation_limit = ClinicalConfig.get_value("pediatric", "activation_age_limit", 12)
    infant_limit = ClinicalConfig.get_value("pediatric", "infant_age_limit", 1)
    fever_emergency_limit = ClinicalConfig.get_value("pediatric", "fever_emergency_threshold", 38.0)
    prolonged_fever_limit = ClinicalConfig.get_value("pediatric", "prolonged_fever_days", 3)
    
    high_risk_threshold = ClinicalConfig.get_value("pediatric", "high_risk_points_threshold", 6)
    moderate_risk_threshold = ClinicalConfig.get_value("pediatric", "moderate_risk_points_threshold", 3)
    
    # Activation check
    if age_years is None or age_years >= activation_limit:
        return base_output

    pediatric_reasons = []
    current_risk = base_output.risk_level
    
    # 1. EMERGENCY RED FLAGS (Force EMERGENCY)
    pediatric_emergency = False
    
    # Red Flag: Infant (<infant_limit) with Fever (>=fever_emergency_limit)
    temp = data.vitals.get("temp_c") or metadata.get("temp_c")
    if age_years < infant_limit and temp and temp >= fever_emergency_limit:
        pediatric_reasons.append(f"Pediatric Red Flag: Infant (<{infant_limit}yr) with significant fever ({temp}°C).")
        pediatric_emergency = True

    # Other Red Flags (Fixed Safety Gates)
    if metadata.get("seizures", False):
        pediatric_reasons.append("Pediatric Red Flag: Seizures detected.")
        pediatric_emergency = True

    if metadata.get("severe_dehydration", False):
        pediatric_reasons.append("Pediatric Red Flag: Signs of severe dehydration.")
        pediatric_emergency = True

    if metadata.get("respiratory_distress", False) or data.symptoms.breathlessness:
        pediatric_reasons.append("Pediatric Red Flag: Respiratory distress detected.")
        pediatric_emergency = True

    if pediatric_emergency:
        base_output.risk_level = RiskLevel.EMERGENCY
        base_output.is_emergency = True
        base_output.reasons.extend(pediatric_reasons)
        base_output.suggested_actions = [
            "Pediatric Emergency: Seek immediate pediatric emergency care.",
            "Contact your pediatrician or nearest hospital immediately.",
            "Monitor breathing and consciousness."
        ]
        return base_output

    # 2. HIGH / MODERATE RISK UPGRADES
    additional_points = 0
    
    # Prolonged fever (> threshold)
    if data.symptoms.fever and data.symptoms.fever_duration_days > prolonged_fever_limit:
        pediatric_reasons.append(f"Pediatric Risk: Prolonged fever detected (>{prolonged_fever_limit} days).")
        additional_points += 3

    # Malnutrition signs
    if metadata.get("malnutrition_signs", False):
        pediatric_reasons.append("Pediatric Risk: Visible signs of malnutrition.")
        additional_points += 4

    # Recurrent vomiting or diarrhea
    if metadata.get("recurrent_vomiting", False) or metadata.get("recurrent_diarrhea", False):
        pediatric_reasons.append("Pediatric Risk: Recurrent vomiting or diarrhea.")
        additional_points += 3

    # Categorization Upgrade Logic (Using Configurable Thresholds)
    new_level = current_risk
    if additional_points >= high_risk_threshold:
        target_candidate = RiskLevel.HIGH
    elif additional_points >= moderate_risk_threshold:
        target_candidate = RiskLevel.MODERATE
    else:
        target_candidate = RiskLevel.LOW

    # Priority check (Upgrade only - Safety Guarantee)
    order = {RiskLevel.LOW: 0, RiskLevel.MODERATE: 1, RiskLevel.HIGH: 2, RiskLevel.EMERGENCY: 3}
    
    if order[target_candidate] > order[current_risk]:
        new_level = target_candidate
        base_output.reasons.append("Pediatric Risk Rule: Upgraded risk level based on child-specific factors.")

    base_output.risk_level = new_level
    base_output.reasons.extend(pediatric_reasons)
    
    if new_level == RiskLevel.HIGH and current_risk != RiskLevel.HIGH:
        base_output.suggested_actions.append("Pediatrician Consultation: Required within 24 hours.")
    elif new_level == RiskLevel.MODERATE and current_risk != RiskLevel.MODERATE:
        base_output.suggested_actions.append("Schedule a visit with your pediatrician.")

    return base_output

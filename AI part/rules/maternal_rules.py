from schema.triage_schema import TriageInput, TriageOutput, RiskLevel
from core.config_loader import ClinicalConfig

def evaluate_maternal_risk(data: TriageInput, base_output: TriageOutput) -> TriageOutput:
    """
    Evaluates Maternal Health specific risks for pregnant patients using externalized thresholds.
    Rules run after General Triage and can only upgrade the risk level.

    Safety: Non-diagnostic risk assessment. 
    Design: Clinical thresholds are read from config/clinical_thresholds.json 
            with safe defaults as fallbacks.
    """
    metadata = data.metadata
    if not metadata.get("is_pregnant", False):
        return base_output

    # --- THRESHOLD LOADING (FAIL-SAFE) ---
    critical_sys_bp = ClinicalConfig.get_value("maternal", "critical_sys_bp", 160)
    late_pregnancy_weeks = ClinicalConfig.get_value("maternal", "late_pregnancy_weeks", 28)
    high_risk_threshold = ClinicalConfig.get_value("maternal", "high_risk_points_threshold", 5)
    moderate_risk_threshold = ClinicalConfig.get_value("maternal", "moderate_risk_points_threshold", 2)

    maternal_reasons = []
    current_risk = base_output.risk_level
    
    # 1. EMERGENCY RED FLAGS (Force EMERGENCY)
    maternal_emergency = False
    
    if metadata.get("vaginal_bleeding", False):
        maternal_reasons.append("Maternal Red Flag: Vaginal bleeding detected.")
        maternal_emergency = True

    if metadata.get("severe_abdominal_pain", False):
        maternal_reasons.append("Maternal Red Flag: Severe abdominal pain.")
        maternal_emergency = True

    if metadata.get("seizures", False) or metadata.get("loss_of_consciousness", False):
        maternal_reasons.append("Maternal Red Flag: Seizures or loss of consciousness.")
        maternal_emergency = True

    # BP Check (from vitals or metadata)
    sys_bp = data.vitals.get("sys_bp") or metadata.get("sys_bp")
    if sys_bp and sys_bp >= critical_sys_bp:
        maternal_reasons.append(f"Maternal Red Flag: Critical Hypertension (Sys BP: {sys_bp}).")
        maternal_emergency = True

    # Fetal Movement (Weeks >= late_pregnancy_weeks)
    weeks = metadata.get("weeks_pregnant", 0)
    if weeks >= late_pregnancy_weeks and metadata.get("reduced_fetal_movement", False):
        maternal_reasons.append(f"Maternal Red Flag: Reduced fetal movement (Stage: {weeks} weeks).")
        maternal_emergency = True

    if maternal_emergency:
        # Upgrade to EMERGENCY regardless of previous state
        base_output.risk_level = RiskLevel.EMERGENCY
        base_output.is_emergency = True
        base_output.reasons.extend(maternal_reasons)
        base_output.suggested_actions = [
            "Maternal Emergency: Seek immediate obstetric/emergency care.",
            "Contact your gynecologist/hospital immediately.",
            "Do not wait for further symptoms."
        ]
        return base_output

    # 2. HIGH / MODERATE RISK INDICATORS
    # Only proceed if we are not already at EMERGENCY
    additional_points = 0
    
    # Age factors
    if data.age < 18:
        maternal_reasons.append("Maternal Risk: Adolescent pregnancy (<18).")
        additional_points += 3
    elif data.age > 35:
        maternal_reasons.append("Maternal Risk: Advanced maternal age (>35).")
        additional_points += 2

    # Late pregnancy
    if weeks >= late_pregnancy_weeks:
        maternal_reasons.append(f"Maternal Risk: Late pregnancy (Weeks {weeks}).")
        additional_points += 2

    # Chronic Condition modulation for pregnancy
    if data.chronic_conditions.diabetes or metadata.get("gestational_diabetes", False):
        maternal_reasons.append("Maternal Risk: Diabetic/Gestational diabetic profile.")
        additional_points += 3
        
    if data.chronic_conditions.hypertension:
        maternal_reasons.append("Maternal Risk: Chronic hypertension in pregnancy.")
        additional_points += 3

    # Moderate Symptoms
    if metadata.get("severe_headache", False) or metadata.get("visual_disturbances", False):
        maternal_reasons.append("Maternal Risk: Potential pre-eclampsia signs (Headache/Visual).")
        additional_points += 3
        
    if metadata.get("severe_swelling", False):
        maternal_reasons.append("Maternal Risk: Severe swelling (edema).")
        additional_points += 2

    if metadata.get("dizziness", False):
        maternal_reasons.append("Maternal Risk: Significant dizziness reported.")
        additional_points += 1

    # Final Risk Upgrade Logic
    new_level = current_risk
    if additional_points >= high_risk_threshold:
        target_candidate = RiskLevel.HIGH
    elif additional_points >= moderate_risk_threshold:
        target_candidate = RiskLevel.MODERATE
    else:
        target_candidate = RiskLevel.LOW

    # Priority check (Upgrade only)
    order = {RiskLevel.LOW: 0, RiskLevel.MODERATE: 1, RiskLevel.HIGH: 2, RiskLevel.EMERGENCY: 3}
    
    if order[target_candidate] > order[current_risk]:
        new_level = target_candidate
        base_output.reasons.append("Maternal Risk Rule: Upgraded risk level based on pregnancy factors.")

    base_output.risk_level = new_level
    base_output.reasons.extend(maternal_reasons)
    
    # Update actions based on new risk if upgraded
    if new_level == RiskLevel.HIGH and current_risk != RiskLevel.HIGH:
        base_output.suggested_actions.append("Obstetric Consultation: Required within 24 hours.")
    elif new_level == RiskLevel.MODERATE and current_risk != RiskLevel.MODERATE:
        base_output.suggested_actions.append("Schedule urgent prenatal checkup.")

    return base_output

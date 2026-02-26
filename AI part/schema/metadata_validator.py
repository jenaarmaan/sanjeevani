from typing import Dict, Any, List, Tuple

def validate_metadata(metadata: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Validates domain-specific metadata for Project Sanjeevani.
    Focuses on Maternal and Pediatric Health constraints for offline-first triage.
    
    Rules:
    - is_pregnant: boolean
    - weeks_pregnant: int [1, 45]
    - blood_pressure.systolic (sys_bp): int [50, 250]
    - maternal/pediatric symptoms: boolean
    - age_years: int [0, 150]
    - temp_c: float [30, 45]
    """
    clean_metadata = metadata.copy()
    warnings = []

    # 1. is_pregnant validation
    if "is_pregnant" in metadata:
        val = metadata["is_pregnant"]
        if not isinstance(val, bool):
            warnings.append("Metadata Validation: 'is_pregnant' must be a boolean. Field excluded.")
            if "is_pregnant" in clean_metadata: clean_metadata.pop("is_pregnant")

    # 2. weeks_pregnant validation
    if "weeks_pregnant" in metadata:
        val = metadata["weeks_pregnant"]
        try:
            int_val = int(val)
            if 1 <= int_val <= 45:
                clean_metadata["weeks_pregnant"] = int_val
            else:
                warnings.append(f"Metadata Validation: 'weeks_pregnant' ({val}) out of safe range (1-45). Field excluded.")
                if "weeks_pregnant" in clean_metadata: clean_metadata.pop("weeks_pregnant")
        except (ValueError, TypeError):
            warnings.append(f"Metadata Validation: 'weeks_pregnant' must be an integer. Field excluded.")
            if "weeks_pregnant" in clean_metadata: clean_metadata.pop("weeks_pregnant")

    # 3. Blood Pressure Validation (Systolic)
    sys_bp = None
    if "sys_bp" in metadata:
        sys_bp = metadata["sys_bp"]
    elif "blood_pressure" in metadata and isinstance(metadata["blood_pressure"], dict):
        sys_bp = metadata["blood_pressure"].get("systolic")

    if sys_bp is not None:
        try:
            int_val = int(sys_bp)
            if 50 <= int_val <= 250:
                clean_metadata["sys_bp"] = int_val
            else:
                warnings.append(f"Metadata Validation: blood pressure systolic ({sys_bp}) out of safe range (50-250). Field excluded.")
                if "sys_bp" in clean_metadata: clean_metadata.pop("sys_bp")
        except (ValueError, TypeError):
            warnings.append(f"Metadata Validation: blood pressure systolic must be an integer. Field excluded.")
            if "sys_bp" in clean_metadata: clean_metadata.pop("sys_bp")

    # 4. Age Years Validation (Pediatric Activation)
    if "age_years" in metadata:
        val = metadata["age_years"]
        try:
            int_val = int(val)
            if 0 <= int_val < 150:
                clean_metadata["age_years"] = int_val
            else:
                warnings.append(f"Metadata Validation: 'age_years' ({val}) out of safe range. Field excluded.")
                if "age_years" in clean_metadata: clean_metadata.pop("age_years")
        except (ValueError, TypeError):
            warnings.append(f"Metadata Validation: 'age_years' must be an integer. Field excluded.")
            if "age_years" in clean_metadata: clean_metadata.pop("age_years")

    # 5. Temperature Validation (Celsius: 30-45)
    if "temp_c" in metadata:
        val = metadata["temp_c"]
        try:
            float_val = float(val)
            if 30.0 <= float_val <= 45.0:
                clean_metadata["temp_c"] = float_val
            else:
                warnings.append(f"Metadata Validation: 'temp_c' ({val}) out of safe range. Field excluded.")
                if "temp_c" in clean_metadata: clean_metadata.pop("temp_c")
        except (ValueError, TypeError):
            warnings.append(f"Metadata Validation: 'temp_c' must be a number. Field excluded.")
            if "temp_c" in clean_metadata: clean_metadata.pop("temp_c")

    # 6. Flag Validation (Boolean checks)
    maternal_symp_keys = [
        "vaginal_bleeding", "severe_abdominal_pain", "seizures", 
        "loss_of_consciousness", "reduced_fetal_movement", "gestational_diabetes",
        "severe_headache", "visual_disturbances", "severe_swelling", "dizziness"
    ]
    
    pediatric_symp_keys = [
        "severe_dehydration", "respiratory_distress", "malnutrition_signs",
        "recurrent_vomiting", "recurrent_diarrhea"
    ]
    
    for key in maternal_symp_keys:
        if key in metadata:
            val = metadata[key]
            if not isinstance(val, bool):
                warnings.append(f"Metadata Validation: Maternal indicator '{key}' must be boolean. Field excluded.")
                if key in clean_metadata: clean_metadata.pop(key)
                
    for key in pediatric_symp_keys:
        if key in metadata:
            val = metadata[key]
            if not isinstance(val, bool):
                warnings.append(f"Metadata Validation: Pediatric indicator '{key}' must be boolean. Field excluded.")
                if key in clean_metadata: clean_metadata.pop(key)

    return clean_metadata, warnings

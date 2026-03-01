import sys
import os
import json

# Ensure project root is in path


from core.config_loader import ClinicalConfig
from schema.triage_schema import TriageInput, PatientSymptoms, ChronicConditions, RiskLevel
from core.triage_engine import SanjeevaniTriageEngine

def run_config_logic_tests():
    print("-" * 60)
    print("Project Sanjeevani: Config System Strict Validation Tests")
    print("-" * 60)

    # Backup real config if exists
    real_config_path = "config/clinical_thresholds.json"
    temp_config_path = "config/clinical_thresholds.json.bak"
    if os.path.exists(real_config_path):
        os.rename(real_config_path, temp_config_path)

    try:
        # TEST 1: Missing Config -> Safe Defaults
        ClinicalConfig.reset_for_test()
        print("\n[TEST 1] Missing Config File:")
        val = ClinicalConfig.get_value("pediatric", "fever_emergency_threshold", 99.0)
        warnings = ClinicalConfig.get_warnings()
        print(f"   Threshold: {val} (Expected 38.0)")
        print(f"   Warnings: {warnings}")
        assert val == 38.0

        # TEST 2: Invalid Values (Type Mismatch & Safety Gate)
        ClinicalConfig.reset_for_test()
        invalid_data = {
            "pediatric": {
                "fever_emergency_threshold": 42.0, # Attempt to weaken (Max 38.0)
                "activation_age_limit": "TWELVE"   # Invalid Type
            }
        }
        with open(real_config_path, 'w') as f:
            json.dump(invalid_data, f)
            
        print("\n[TEST 2] Invalid Values (Safety Gate & Type):")
        fever_val = ClinicalConfig.get_value("pediatric", "fever_emergency_threshold", 0.0)
        age_val = ClinicalConfig.get_value("pediatric", "activation_age_limit", 0)
        warnings = ClinicalConfig.get_warnings()
        print(f"   Fever Threshold: {fever_val} (Expected fallback 38.0)")
        print(f"   Age Limit: {age_val} (Expected fallback 12)")
        for w in warnings:
            print(f"   Warning: {w}")
        
        assert fever_val == 38.0
        assert age_val == 12

        # TEST 3: Emergency Rules Still Trigger Correctly
        # Even with an invalid config, the engine should use the fallback 38.0
        engine = SanjeevaniTriageEngine()
        infant_input = TriageInput(
            age=0,
            symptoms=PatientSymptoms(fever=True),
            chronic_conditions=ChronicConditions(),
            metadata={
                "age_years": 0.5,
                "temp_c": 38.5 
            }
        )
        res = engine.process(infant_input)
        print("\n[TEST 3] Emergency Trigger Resilience:")
        print(f"   Final Risk: {res.risk_level.value} (Expected EMERGENCY)")
        print(f"   Reason: {res.reasons[-1]}")
        assert res.risk_level == RiskLevel.EMERGENCY

    finally:
        # Cleanup and Restore
        if os.path.exists(real_config_path):
            os.remove(real_config_path)
        if os.path.exists(temp_config_path):
            os.rename(temp_config_path, real_config_path)

    print("\n" + "="*40)
    print("ALL CONFIG VALIDATION TESTS PASSED")
    print("="*40)

if __name__ == "__main__":
    run_config_logic_tests()

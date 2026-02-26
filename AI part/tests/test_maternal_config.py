import sys
import os
import json

# Ensure project root is in path


from core.config_loader import ClinicalConfig
from schema.triage_schema import TriageInput, PatientSymptoms, ChronicConditions, RiskLevel
from core.triage_engine import SanjeevaniTriageEngine

def test_maternal_config_integration():
    print("-" * 60)
    print("Project Sanjeevani: Maternal Config System Integration Tests")
    print("-" * 60)

    # Backup real config
    real_config_path = "config/clinical_thresholds.json"
    temp_config_path = "config/clinical_thresholds.json.bak"
    if os.path.exists(real_config_path):
        os.rename(real_config_path, temp_config_path)

    try:
        # TEST 1: Configured Thresholds Work (e.g., Lowering BP threshold for stricter safety)
        ClinicalConfig.reset_for_test()
        strict_config = {
            "maternal": {
                "critical_sys_bp": 140, # More strict than default 160
                "late_pregnancy_weeks": 28,
                "high_risk_points_threshold": 5,
                "moderate_risk_points_threshold": 2
            }
        }
        with open(real_config_path, 'w') as f:
            json.dump(strict_config, f)
            
        engine = SanjeevaniTriageEngine()
        bp_input = TriageInput(
            age=30,
            symptoms=PatientSymptoms(),
            chronic_conditions=ChronicConditions(),
            vitals={"sys_bp": 145},
            metadata={"is_pregnant": True, "weeks_pregnant": 24}
        )
        res1 = engine.process(bp_input)
        print(f"\n[TEST 1] Strict Config Threshold (BP 140):")
        print(f"   Final Risk: {res1.risk_level.value} (Expected EMERGENCY)")
        assert res1.risk_level == RiskLevel.EMERGENCY

        # TEST 2: Safety Cannot Be Downgraded (Gate Protection)
        # Attempt to set BP threshold to 200 (weakening safety)
        ClinicalConfig.reset_for_test()
        weak_config = {
            "maternal": {
                "critical_sys_bp": 200, # Attempt to weaken (Gate is 160)
                "late_pregnancy_weeks": 28,
                "high_risk_points_threshold": 5,
                "moderate_risk_points_threshold": 2
            }
        }
        with open(real_config_path, 'w') as f:
            json.dump(weak_config, f)
            
        res2 = engine.process(bp_input) # Input BP is 145. 
        # If gate works, threshold is 160. 145 < 160 -> Not Emergency.
        # But wait, let's test a BP of 170.
        bp_input_170 = TriageInput(
            age=30, symptoms=PatientSymptoms(), chronic_conditions=ChronicConditions(),
            vitals={"sys_bp": 170}, metadata={"is_pregnant": True, "weeks_pregnant": 24}
        )
        res3 = engine.process(bp_input_170)
        print(f"\n[TEST 2] Safety Gate Protection (BP 200 Blocked):")
        print(f"   Final Risk: {res3.risk_level.value} (Expected EMERGENCY because 170 > 160 gate)")
        
        # Check warnings
        warnings = ClinicalConfig.get_warnings()
        print(f"   Warnings: {warnings}")
        assert any("safety gate (160)" in w for w in warnings)
        assert res3.risk_level == RiskLevel.EMERGENCY

    finally:
        # Restore
        if os.path.exists(real_config_path):
            os.remove(real_config_path)
        if os.path.exists(temp_config_path):
            os.rename(temp_config_path, real_config_path)

    print("\n" + "="*40)
    print("ALL MATERNAL CONFIG TESTS PASSED")
    print("="*40)

if __name__ == "__main__":
    test_maternal_config_integration()

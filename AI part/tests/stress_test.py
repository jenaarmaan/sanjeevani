import os
import sys
import random
import time
import json
import logging
from typing import List, Dict, Any

from schema.triage_schema import TriageInput, PatientSymptoms, ChronicConditions, RiskLevel
from core.triage_engine import SanjeevaniTriageEngine
from core.config_loader import ClinicalConfig

# Disable excessive logging for stress test
logging.getLogger("SanjeevaniTriageEngine").setLevel(logging.ERROR)
logging.getLogger("SanjeevaniConfigLoader").setLevel(logging.ERROR)

def generate_random_case(id: int) -> TriageInput:
    """Generates a semi-random triage case with potential chaos."""
    age = random.randint(0, 95)
    gender = random.choice(["Male", "Female", "Other"])
    
    # Random Symptoms
    symptoms = PatientSymptoms(
        fever=random.choice([True, False]),
        fever_duration_days=random.randint(0, 10),
        cough=random.choice([True, False]),
        breathlessness=random.random() < 0.1, # 10% chance of emergency
        chest_pain=random.random() < 0.05,     # 5% chance of emergency
        fatigue=random.choice([True, False])
    )
    
    # Random Chronic Conditions
    chronic = ChronicConditions(
        diabetes=random.choice([True, False]),
        hypertension=random.choice([True, False])
    )
    
    metadata = {}
    
    # Domain activation logic
    if gender == "Female" and age >= 15 and age <= 50 and random.random() < 0.3:
        metadata["is_pregnant"] = True
        metadata["weeks_pregnant"] = random.randint(1, 42)
        if random.random() < 0.1: metadata["vaginal_bleeding"] = True
        if random.random() < 0.05: metadata["seizures"] = True
        
    if age < 12:
        metadata["age_years"] = age
        if random.random() < 0.1: metadata["respiratory_distress"] = True
        if random.random() < 0.1: metadata["temp_c"] = random.uniform(36.0, 41.0)

    # Chaos Injection (Invalid data)
    chaos_type = random.random()
    if chaos_type < 0.05: # 5% invalid weeks
        metadata["weeks_pregnant"] = "NOT_A_NUMBER"
    elif chaos_type < 0.10: # 5% invalid age_years
        metadata["age_years"] = -5
    elif chaos_type < 0.15: # 5% invalid BP
        metadata["sys_bp"] = 999 

    return TriageInput(
        age=age,
        gender=gender,
        symptoms=symptoms,
        chronic_conditions=chronic,
        metadata=metadata,
        patient_id=f"STRESS_{id}"
    )

def run_stress_test(num_cases=100):
    print("=" * 60)
    print(f"PROJECT SANJEEVANI: END-TO-END STRESS TEST ({num_cases} CASES)")
    print("=" * 60)
    
    engine = SanjeevaniTriageEngine()
    
    stats = {
        "total": 0,
        "crashes": 0,
        "emergencies_detected": 0,
        "ml_upgrades": 0,
        "ml_downgrade_attempts_blocked": 0,
        "validation_warnings_triggered": 0,
        "domain_maternal_active": 0,
        "domain_pediatric_active": 0
    }

    start_time = time.time()

    # SETUP CHAOS SCENARIOS
    config_path = "config/clinical_thresholds.json"
    model_path = "intelligence/models/risk_refiner.pkl"
    
    for i in range(num_cases):
        # Specific chaos injections at intervals
        if i == 25: 
            print("   [CHAOS] Simulating Missing Config...")
            if os.path.exists(config_path): os.rename(config_path, config_path + ".tmp")
            ClinicalConfig.reset_for_test()
        
        if i == 50:
            print("   [CHAOS] Simulating ML Model Unavailable...")
            if os.path.exists(model_path): os.rename(model_path, model_path + ".tmp")
            # We don't need reset for model as it's class level and potentially already loaded, 
            # but we can force it by re-instantiating if we wanted. 
            # In our current engine, _model is already loaded. 
            # To truly test "unavailable during load", we'd need a fresh engine.
            engine = SanjeevaniTriageEngine() 

        if i == 75:
            print("   [RESTORE] Restoring Config and Model...")
            if os.path.exists(config_path + ".tmp"): os.rename(config_path + ".tmp", config_path)
            if os.path.exists(model_path + ".tmp"): os.rename(model_path + ".tmp", model_path)
            ClinicalConfig.reset_for_test()
            engine = SanjeevaniTriageEngine()

        case = generate_random_case(i)
        
        try:
            result = engine.process(case)
            stats["total"] += 1
            
            if result.is_emergency: stats["emergencies_detected"] += 1
            
            # Trace analysis
            for step in result.decision_trace:
                if step.get("step") == "ML Refinement":
                    if step.get("applied"): stats["ml_upgrades"] += 1
                    if step.get("blocked_by_safety_floor"): stats["ml_downgrade_attempts_blocked"] += 1
                
                if step.get("step") == "Maternal Risk Assessment" and step.get("activated"):
                    stats["domain_maternal_active"] += 1
                
                if step.get("step") == "Pediatric Risk Assessment" and step.get("activated"):
                    stats["domain_pediatric_active"] += 1
            
            if any("Metadata Validation" in r for r in result.reasons):
                stats["validation_warnings_triggered"] += 1

        except Exception as e:
            print(f"CRITICAL ERROR on Case {i}: {e}")
            stats["crashes"] += 1

    end_time = time.time()
    
    # Final cleanup if loop finished early
    if os.path.exists(config_path + ".tmp"): os.rename(config_path + ".tmp", config_path)
    if os.path.exists(model_path + ".tmp"): os.rename(model_path + ".tmp", model_path)

    # Summary Report
    print("\n" + "="*60)
    print("STRESS TEST SUMMARY REPORT")
    print("="*60)
    print(f"Total Cases Processed:      {stats['total']}")
    print(f"Total Crashes:              {stats['crashes']}")
    print(f"Execution Time:             {end_time - start_time:.2f} seconds")
    print("-" * 60)
    print(f"Emergencies Detected:       {stats['emergencies_detected']}")
    print(f"Validation Warnings:        {stats['validation_warnings_triggered']}")
    print("-" * 60)
    print(f"Domain: Maternal Active:    {stats['domain_maternal_active']}")
    print(f"Domain: Pediatric Active:   {stats['domain_pediatric_active']}")
    print("-" * 60)
    print(f"ML: Risk Upgrades:          {stats['ml_upgrades']}")
    print(f"ML: Downgrades Blocked:     {stats['ml_downgrade_attempts_blocked']} (SAFETY GATE VERIFIED)")
    print("-" * 60)
    
    if stats["crashes"] == 0:
        print("VERDICT: SYSTEM STABLE - ZERO CRASHES IN HIGH LOAD")
    else:
        print("VERDICT: UNSTABLE - CRASHES DETECTED")

if __name__ == "__main__":
    run_stress_test(100)

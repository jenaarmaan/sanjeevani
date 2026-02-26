import os
import sys
import logging
import importlib

# Configure logging for startup
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger("SanjeevaniStartupCheck")

def run_self_check():
    """
    Performs a comprehensive system check for offline deployment readiness.
    Ensures essentials (config, model, deps) are present and functional.
    """
    print("=" * 60)
    print("PROJECT SANJEEVANI: STARTUP SELF-CHECK")
    print("=" * 60)

    checks_passed = True
    warnings = []

    # 1. Dependency Check
    required_libs = ["pandas", "numpy", "sklearn", "pickle"]
    print(f"[1/4] Checking Runtime Dependencies...")
    for lib in required_libs:
        try:
            importlib.import_module(lib)
            print(f"   - {lib}: OK")
        except ImportError:
            logger.error(f"Missing dependency: {lib}")
            checks_passed = False

    # 2. Config Availability
    print(f"\n[2/4] Checking Clinical Configuration...")
    config_path = "config/clinical_thresholds.json"
    if os.path.exists(config_path):
        from core.config_loader import ClinicalConfig
        try:
            ClinicalConfig.reset_for_test()
            config = ClinicalConfig.load()
            if ClinicalConfig.get_warnings():
                for w in ClinicalConfig.get_warnings():
                    print(f"   ! Warning: {w}")
            print(f"   - {config_path}: OK")
        except Exception as e:
            logger.error(f"Config load failure: {e}")
            checks_passed = False
    else:
        logger.warning(f"Config file missing at {config_path}. Falling back to internal defaults.")
        warnings.append("System running on hard-coded clinical defaults.")

    # 3. ML Model Availability
    print(f"\n[3/4] Checking ML Risk Refiner Model...")
    model_path = "intelligence/models/risk_refiner.pkl"
    if os.path.exists(model_path):
        from core.triage_engine import SanjeevaniTriageEngine
        engine = SanjeevaniTriageEngine()
        model = engine._get_model()
        if model:
            print(f"   - {model_path}: OK")
        else:
            logger.warning(f"ML Model file exists but failed to load.")
            warnings.append("ML layer disabled. Using rule-based triage only.")
    else:
        logger.warning(f"ML Model file missing at {model_path}.")
        warnings.append("ML layer disabled. Using rule-based triage only.")

    # 4. System Integrity (Environment)
    print(f"\n[4/4] Verifying System Environment...")
    print(f"   - Python Version: {sys.version.split()[0]}")
    # Verify we are on at least Python 3.8
    if sys.version_info.major < 3 or (sys.version_info.major == 3 and sys.version_info.minor < 8):
        logger.error(f"Incompatible Python version. Sanjeevani requires 3.8+")
        checks_passed = False
    else:
        print(f"   - Environment: OK")

    print("\n" + "=" * 60)
    if checks_passed:
        if warnings:
            print("STATUS: OPERATIONAL (WITH WARNINGS)")
            for w in warnings:
                print(f"   - {w}")
        else:
            print("STATUS: READY FOR DEPLOYMENT")
    else:
        print("STATUS: CRITICAL FAILURE - DEPLOYMENT BLOCKED")
        sys.exit(1)
    print("=" * 60 + "\n")

    return checks_passed

if __name__ == "__main__":
    run_self_check()

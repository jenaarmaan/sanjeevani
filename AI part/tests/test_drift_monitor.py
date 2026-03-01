import unittest
import os
import shutil
import json
from core.triage_engine import SanjeevaniTriageEngine
from schema.triage_schema import TriageInput, PatientSymptoms, ChronicConditions, RiskLevel
from intelligence.drift_monitor import DriftLevel

class TestDriftMonitor(unittest.TestCase):
    def setUp(self):
        self.test_history_dir = "tests/temp_drift"
        os.makedirs(self.test_history_dir, exist_ok=True)
        self.history_file = os.path.join(self.test_history_dir, "patient_history.json")
        self.engine = SanjeevaniTriageEngine(history_path=self.history_file)
        
        # Reset drift monitor buffers for each test
        self.engine.drift_monitor.feature_history = []
        self.engine.drift_monitor.prediction_history = []
        self.engine.drift_monitor.confidence_history = []

    def tearDown(self):
        if os.path.exists(self.test_history_dir):
            shutil.rmtree(self.test_history_dir)

    def test_normal_behavior_no_drift(self):
        """Verifies that normal inputs do not trigger drift warnings."""
        # Baseline check needs at least window_size // 2 (25) samples
        for _ in range(25):
            data = TriageInput(
                age=30,
                symptoms=PatientSymptoms(),
                chronic_conditions=ChronicConditions()
            )
            self.engine.process(data)
        
        level, reasons = self.engine.drift_monitor.check_drift()
        self.assertEqual(level, DriftLevel.NONE)
        self.assertEqual(len(reasons), 0)

    def test_feature_drift_warning(self):
        """Verifies that significant shift in input features (Age) triggers a warning."""
        # Training baseline age mean is ~62. Std: 22.
        # Sending age=130 results in Z = (130-62)/22 = 3.09 > 2.0.
        for _ in range(30):
            data = TriageInput(
                age=130,
                symptoms=PatientSymptoms(),
                chronic_conditions=ChronicConditions()
            )
            self.engine.process(data)
        
        level, reasons = self.engine.drift_monitor.check_drift()
        self.assertIn(level, [DriftLevel.WARNING, DriftLevel.SEVERE])
        self.assertTrue(any("age distribution deviates" in r for r in reasons))

    def test_severe_drift_ml_bypass(self):
        """Verifies that confidence collapse triggers SEVERE level and ML bypass."""
        # Mock confidence to be low (below critical margin 0.45)
        self.engine.drift_monitor.confidence_history = [0.4] * 30
        self.engine.drift_monitor.feature_history = [{"age": 30}] * 30
        self.engine.drift_monitor.prediction_history = ["LOW"] * 30
        
        data = TriageInput(
            age=30,
            symptoms=PatientSymptoms(),
            chronic_conditions=ChronicConditions()
        )
        result = self.engine.process(data)
        
        self.assertEqual(result.explanation["drift_report"]["level"], "SEVERE")
        self.assertIn("ML_BYPASSED_SEVERE_DRIFT", result.explanation["safety_audit_flags"])

    def test_prediction_drift(self):
        """Verifies that shift in risk output distribution triggers a warning."""
        # Mock prediction history to be 100% HIGH (baseline is ~20%)
        # Shift is 0.80 > 0.40 (SKEW_THRESHOLD)
        self.engine.drift_monitor.prediction_history = ["HIGH"] * 30
        self.engine.drift_monitor.feature_history = [{"age": 30}] * 30
        self.engine.drift_monitor.confidence_history = [0.9] * 30
        
        level, reasons = self.engine.drift_monitor.check_drift()
        self.assertIn(level, [DriftLevel.WARNING, DriftLevel.SEVERE])
        self.assertTrue(any("Output skew" in r for r in reasons))

if __name__ == "__main__":
    unittest.main()

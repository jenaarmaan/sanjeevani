import unittest
import os
import json
import shutil
from core.triage_engine import SanjeevaniTriageEngine
from schema.triage_schema import TriageInput, PatientSymptoms, ChronicConditions, RiskLevel

class TestXAILayer(unittest.TestCase):
    def setUp(self):
        self.test_history_dir = "tests/temp_history"
        os.makedirs(self.test_history_dir, exist_ok=True)
        self.history_file = os.path.join(self.test_history_dir, "patient_history.json")
        self.engine = SanjeevaniTriageEngine(history_path=self.history_file)

    def tearDown(self):
        if os.path.exists(self.test_history_dir):
            shutil.rmtree(self.test_history_dir)

    def test_emergency_explanation(self):
        """Validates that Emergency explanations match the safety-critical requirements."""
        data = TriageInput(
            age=30,
            symptoms=PatientSymptoms(chest_pain=True), # Emergency trigger
            chronic_conditions=ChronicConditions()
        )
        result = self.engine.process(data)
        
        self.assertEqual(result.risk_level, RiskLevel.EMERGENCY)
        self.assertIsNotNone(result.explanation)
        
        narrative = result.explanation["human_readable_narrative"]
        self.assertTrue(narrative.startswith("Priority: Life-Safety Protocol"))
        self.assertEqual(result.explanation["decision_primary_driver"], "Rule Layer")
        self.assertIn("EMERGENCY_OVERRIDE_ACTIVE", result.explanation["safety_audit_flags"])

    def test_history_escalation_explanation(self):
        """Validates explanation when history overrides current visit risk."""
        patient_id = "patient_123"
        
        # 1. First visit: LOW
        data_1 = TriageInput(
            age=30,
            patient_id=patient_id,
            symptoms=PatientSymptoms(fever=True, fever_duration_days=1), # Points: 2 (Fever)
            chronic_conditions=ChronicConditions()
        )
        # Manually record a worsening history trend
        # We need at least 2 visits to show a trend.
        # Let's record a previous LOW visit, then a visit that would be LOW but we want to see escalation.
        
        # Actually, PatientHistoryManager.get_escalation upgrades if trend is WORSENING.
        # WORSENING is if current rank > prev rank.
        # To get an escalation on the CURRENT visit, the trend must be calculated based on PREVIOUS visits.
        
        # Seed history
        self.engine.history_manager.record_visit(patient_id, RiskLevel.LOW, 2.0)
        self.engine.history_manager.record_visit(patient_id, RiskLevel.MODERATE, 5.0)
        
        # Now trend is WORSENING (MODERATE > LOW)
        # next visit with LOW input should be escalated to MODERATE
        data_2 = TriageInput(
            age=30,
            patient_id=patient_id,
            symptoms=PatientSymptoms(fever=False),
            chronic_conditions=ChronicConditions()
        )
        
        result = self.engine.process(data_2)
        
        self.assertEqual(result.risk_level, RiskLevel.MODERATE)
        self.assertEqual(result.explanation["decision_primary_driver"], "History Layer")
        self.assertIn("Predictive escalation applied due to worsening longitudinal trend", result.explanation["human_readable_narrative"])
        self.assertIn("HISTORY_RATIFIED_ESCALATION", result.explanation["safety_audit_flags"])

    def test_ml_downgrade_rejection_explanation(self):
        """Validates that ML downgrade rejections are clearly logged and explained."""
        # This requires a mock model or a way to force ML to predict LOW while rules say HIGH.
        # The engine loads model from intelligence/models/risk_refiner.pkl
        
        # Let's mock the model in the engine
        class MockModel:
            def predict(self, X):
                return ["LOW"]
            def predict_proba(self, X):
                return [[0.9, 0.1, 0.0, 0.0]] # High confidence in LOW
        
        SanjeevaniTriageEngine._model = MockModel() # Force mock model
        
        # Rules say HIGH (Points: Diabetes(2) + Hypertension(2) + Age>60(3) = 7)
        data = TriageInput(
            age=65,
            symptoms=PatientSymptoms(),
            chronic_conditions=ChronicConditions(diabetes=True, hypertension=True)
        )
        
        result = self.engine.process(data)
        
        self.assertEqual(result.risk_level, RiskLevel.HIGH) # Safety floor maintained
        self.assertIsNotNone(result.explanation)
        
        narrative = result.explanation["human_readable_narrative"]
        self.assertIn("Automated safety floor maintained. ML suggestion rejected due to clinical rule.", narrative)
        self.assertIn("ML_DOWNGRADE_BLOCKED", result.explanation["safety_audit_flags"])
        self.assertEqual(result.explanation["ml_insight_profile"]["rejected_downgrade"], True)

if __name__ == "__main__":
    unittest.main()

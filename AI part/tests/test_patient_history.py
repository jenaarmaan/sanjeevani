import os
import unittest
from intelligence.patient_history import PatientHistoryManager, RiskTrend
from schema.triage_schema import RiskLevel

class TestPatientHistory(unittest.TestCase):
    def setUp(self) -> None:
        self.test_file = "tests/test_history.json"
        self.manager = PatientHistoryManager(storage_path=self.test_file)

    def tearDown(self) -> None:
        if os.path.exists(self.test_file):
            os.remove(self.test_file)

    def test_record_and_prune(self) -> None:
        p_id = "PAT_001"
        for i in range(10):
            self.manager.record_visit(p_id, RiskLevel.LOW, float(i))
        
        # Verify pruning
        self.assertEqual(len(self.manager._data[p_id]), 5)
        # Verify sequence preservation (last 5 should be 5, 6, 7, 8, 9)
        self.assertEqual(self.manager._data[p_id][-1].assessment_score, 9.0)

    def test_trend_logic(self) -> None:
        p_id = "PAT_002"
        
        # Case: Stable
        self.manager.record_visit(p_id, RiskLevel.MODERATE, 5.0)
        self.manager.record_visit(p_id, RiskLevel.MODERATE, 5.0)
        self.assertEqual(self.manager.compute_trend(p_id), RiskTrend.STABLE)

        # Case: Worsening (Categorical)
        self.manager.record_visit(p_id, RiskLevel.HIGH, 8.0)
        self.assertEqual(self.manager.compute_trend(p_id), RiskTrend.WORSENING)

        # Case: Improving (Categorical)
        self.manager.record_visit(p_id, RiskLevel.LOW, 2.0)
        self.assertEqual(self.manager.compute_trend(p_id), RiskTrend.IMPROVING)

    def test_score_drift_trend(self) -> None:
        p_id = "PAT_003"
        # Within same risk bucket (MODERATE), check for score-based worsening
        self.manager.record_visit(p_id, RiskLevel.MODERATE, 4.0)
        self.manager.record_visit(p_id, RiskLevel.MODERATE, 6.0) # Diff 2.0 > 1.5
        self.assertEqual(self.manager.compute_trend(p_id), RiskTrend.WORSENING)

    def test_escalation_guarantee(self) -> None:
        p_id = "PAT_004"
        
        # Scenario: Patient was LOW (score 1) -> now they are LOW (score 3) (Worsening trend)
        self.manager.record_visit(p_id, RiskLevel.LOW, 1.0)
        self.manager.record_visit(p_id, RiskLevel.LOW, 3.0)
        
        # current is LOW, but trend is WORSENING
        escalated = self.manager.get_escalation(p_id, RiskLevel.LOW)
        self.assertEqual(escalated, RiskLevel.MODERATE)

        # Scenario: Patient was HIGH -> now MODERATE (Improving trend)
        # Manager must NEVER downgrade
        self.manager.record_visit(p_id, RiskLevel.HIGH, 8.0)
        self.manager.record_visit(p_id, RiskLevel.MODERATE, 4.0)
        
        escalated_stable = self.manager.get_escalation(p_id, RiskLevel.MODERATE)
        self.assertEqual(escalated_stable, RiskLevel.MODERATE) # Remains moderate, not downgraded to low

    def test_persistence(self) -> None:
        p_id = "PAT_005"
        self.manager.record_visit(p_id, RiskLevel.HIGH, 9.0)
        
        # New manager instance pointing to same file
        new_manager = PatientHistoryManager(storage_path=self.test_file)
        self.assertEqual(len(new_manager._data[p_id]), 1)
        self.assertEqual(new_manager._data[p_id][0].risk_level, RiskLevel.HIGH)

if __name__ == "__main__":
    unittest.main()

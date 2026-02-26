import json
import os
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Dict, Any, Optional, Final
from datetime import datetime
from schema.triage_schema import RiskLevel

class RiskTrend(Enum):
    """Categorizes the direction of a patient's risk profile over time."""
    IMPROVING = "IMPROVING"
    STABLE = "STABLE"
    WORSENING = "WORSENING"
    UNKNOWN = "UNKNOWN"

@dataclass
class VisitRecord:
    """A single data point in a patient's clinical history."""
    risk_level: RiskLevel
    assessment_score: float
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "risk_level": self.risk_level.value,
            "assessment_score": self.assessment_score,
            "timestamp": self.timestamp
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "VisitRecord":
        return cls(
            risk_level=RiskLevel(data["risk_level"]),
            assessment_score=float(data["assessment_score"]),
            timestamp=data["timestamp"]
        )

class PatientHistoryManager:
    """
    Manages longitudinal patient records for offline-first triage.
    Provides trend analysis to detect clinical deterioration.
    """
    
    # Configuration
    HISTORY_DIR: Final[str] = "intelligence/data"
    HISTORY_FILE: Final[str] = "intelligence/data/patient_history.json"
    MAX_HISTORY_PER_PATIENT: Final[int] = 5

    # Risk rank for trend calculation
    RISK_RANK: Final[Dict[RiskLevel, int]] = {
        RiskLevel.LOW: 0,
        RiskLevel.MODERATE: 1,
        RiskLevel.HIGH: 2,
        RiskLevel.EMERGENCY: 3
    }

    storage_path: str
    _data: Dict[str, List[VisitRecord]]

    def __init__(self, storage_path: Optional[str] = None) -> None:
        self.storage_path = storage_path or self.HISTORY_FILE
        # Ensure the data directory exists offline
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        self._data = {}
        self._load_data()

    def _load_data(self) -> None:
        """Loads historical records from local JSON storage."""
        if not os.path.exists(self.storage_path):
            self._data = {}
            return

        try:
            with open(self.storage_path, 'r') as f:
                raw_data: Any = json.load(f)
                if not isinstance(raw_data, dict):
                    self._data = {}
                    return
                
                new_data: Dict[str, List[VisitRecord]] = {}
                for pid, visits in raw_data.items():
                    if isinstance(visits, list):
                        new_data[str(pid)] = [VisitRecord.from_dict(v) for v in visits if isinstance(v, dict)]
                self._data = new_data
        except (json.JSONDecodeError, KeyError, Exception):
            # In healthcare resilience, corrupted history is better discarded than crashing
            self._data = {}

    def _save_data(self) -> None:
        """Persists current state to local storage."""
        try:
            with open(self.storage_path, 'w') as f:
                serializable_data = {
                    pid: [v.to_dict() for v in visits]
                    for pid, visits in self._data.items()
                }
                json.dump(serializable_data, f, indent=2)
        except Exception:
            # Offline-first resilience: storage failure shouldn't stop the processor
            pass

    def record_visit(self, patient_id: str, risk_level: RiskLevel, score: float) -> None:
        """
        Adds a new record for a patient and prunes old entries.
        """
        if not patient_id: return

        if patient_id not in self._data:
            self._data[patient_id] = []

        # Add new record
        record = VisitRecord(risk_level=risk_level, assessment_score=score)
        self._data[patient_id].append(record)

        # Keep only the last N visits
        # Using a more explicit slice to satisfy Pyright
        current_history = self._data[patient_id]
        if len(current_history) > self.MAX_HISTORY_PER_PATIENT:
            # Slice assignment with explicit type preservation
            self._data[patient_id] = list(current_history[-self.MAX_HISTORY_PER_PATIENT:])

        self._save_data()

    def compute_trend(self, patient_id: str) -> RiskTrend:
        """
        Analyzes consecutive records to determine the clinical trajectory.
        Logic:
        - WORSENING: If the current risk or score is higher than the average of previous visits.
        - IMPROVING: If the current risk is lower than previous.
        - STABLE: Minor fluctuations or identical states.
        """
        history = self._data.get(patient_id, [])
        if len(history) < 2:
            return RiskTrend.UNKNOWN

        current = history[-1]
        previous = history[-2]

        curr_rank = self.RISK_RANK[current.risk_level]
        prev_rank = self.RISK_RANK[previous.risk_level]

        # 1. Check for categorical worsening
        if curr_rank > prev_rank:
            return RiskTrend.WORSENING
        
        # 2. Check for categorical improvement
        if curr_rank < prev_rank:
            return RiskTrend.IMPROVING

        # 3. Check for score-based drift (for stable risk buckets)
        score_diff = current.assessment_score - previous.assessment_score
        if score_diff > 1.5:  # Significant point increase within same bucket
            return RiskTrend.WORSENING
        elif score_diff < -1.5:
            return RiskTrend.IMPROVING

        return RiskTrend.STABLE

    def get_escalation(self, patient_id: str, current_risk: RiskLevel) -> RiskLevel:
        """
        Escalation-only Logic: Bumps the risk level if the history shows a 
        dangerous trend, but never downgrades. 
        """
        if current_risk == RiskLevel.EMERGENCY:
            return current_risk

        trend = self.compute_trend(patient_id)
        
        if trend == RiskTrend.WORSENING:
            # Upgrade LOW -> MODERATE or MODERATE -> HIGH
            if current_risk == RiskLevel.LOW:
                return RiskLevel.MODERATE
            if current_risk == RiskLevel.MODERATE:
                return RiskLevel.HIGH
        
        return current_risk

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional, Dict, Any

class RiskLevel(Enum):
    """
    Standardized risk categorization for Project Sanjeevani.
    """
    LOW = "LOW"             # Mild symptoms, no underlying high-risk factors. Recommended home care.
    MODERATE = "MODERATE"   # Requires monitoring or non-urgent medical consultation (within 48-72h).
    HIGH = "HIGH"           # Significant risk factors; requires urgent medical attention (within 24h).
    EMERGENCY = "EMERGENCY" # Immediate life-threatening red flags; requires emergency care (108/112).

@dataclass
class PatientSymptoms:
    """
    Core symptoms monitored in General Triage.
    Backward Compatibility: New symptoms should be added as Optional fields with default False,
    or passed via the TriageInput.metadata dictionary to avoid breaking existing logic.
    """
    fever: bool = False
    fever_duration_days: int = 0
    cough: bool = False
    breathlessness: bool = False  # Critical respiratory red flag.
    chest_pain: bool = False      # Critical cardiac red flag.
    fatigue: bool = False

@dataclass
class ChronicConditions:
    """
    Pre-existing conditions that modulate risk profiles.
    Backward Compatibility: Add new conditions as Optional fields or via TriageInput.metadata.
    """
    diabetes: bool = False
    hypertension: bool = False

@dataclass
class TriageInput:
    """
    The primary data contract for Sanjeevani Triage Engine.
    
    FIELDS:
    - age: Integer age of the patient (Risk thresholding).
    - symptoms: Structured core symptoms.
    - chronic_conditions: Structured pre-existing health status.
    - patient_id: Optional tracking ID for backend integration.
    - gender: Biological gender (influences certain risk models like CVD).
    - vitals: Dictionary for numerical data (spO2, BP, Temp).
    - metadata: Key-value store for specialized domain data (e.g., 'weeks_pregnant' for Maternal).
    """
    age: int
    symptoms: PatientSymptoms
    chronic_conditions: ChronicConditions
    
    patient_id: Optional[str] = None
    gender: Optional[str] = None
    
    # Expected keys for vitals: 'spO2', 'temp_f', 'pulse', 'sys_bp', 'dia_bp'
    vitals: Dict[str, Any] = field(default_factory=dict)
    
    # Use metadata for any field NOT present in core schema to ensure backward compatibility.
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class TriageOutput:
    """
    Standardized structured response from the Triage Engine.
    
    FIELDS:
    - risk_level: The final categorized risk.
    - reasons: List of strings (human-readable) explaining the decision logic.
    - suggested_actions: List of non-diagnostic, safe next steps.
    - is_emergency: Rapid boolean flag for UI/Siren alerts.
    - engine_version: Version of the logic used (for auditing).
    - assessment_score: Numeric score (points or ML probability) for clinical review.
    - metadata: Domain-specific insights (e.g., 'probable_cause', 'referral_dept').
    """
    risk_level: RiskLevel
    reasons: List[str]
    suggested_actions: List[str]
    is_emergency: bool
    
    engine_version: str = "1.0.0"
    assessment_score: float = 0.0 
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    # Audit trail of every decision step
    decision_trace: List[Dict[str, Any]] = field(default_factory=list)
    
    # Explainability (XAI) output
    explanation: Optional[Dict[str, Any]] = None

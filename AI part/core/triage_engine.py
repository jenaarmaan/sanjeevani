import pickle
import os
import pandas as pd
import numpy as np
import logging
from typing import Tuple, Optional, List, Dict, Any

from schema.triage_schema import TriageInput, TriageOutput, RiskLevel
from rules.emergency_rules import evaluate_emergency_rules
from rules.risk_rules import evaluate_risk_rules
from rules.maternal_rules import evaluate_maternal_risk
from rules.pediatric_rules import evaluate_pediatric_risk
from schema.metadata_validator import validate_metadata
from core.config_loader import ClinicalConfig
from intelligence.patient_history import PatientHistoryManager, RiskTrend
from intelligence.drift_monitor import DriftMonitor, DriftLevel
from core.explainability import ExplainabilityLayer
import dataclasses

# Configure logging for healthcare-grade auditing
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SanjeevaniTriageEngine")

class SanjeevaniTriageEngine:
    _model = None  # Class-level attribute for lazy loading
    _model_path = "intelligence/models/risk_refiner.pkl"
    
    # Safety Constraint: Risk order for comparison (Never downgrade risk)
    RISK_ORDER: Dict[RiskLevel, int] = {
        RiskLevel.LOW: 0,
        RiskLevel.MODERATE: 1,
        RiskLevel.HIGH: 2,
        RiskLevel.EMERGENCY: 3
    }

    def __init__(self, history_path: Optional[str] = None):
        self.history_manager = PatientHistoryManager(storage_path=history_path)
        self.xai_layer = ExplainabilityLayer()
        self.drift_monitor = DriftMonitor()

    def _get_model(self) -> Any:
        if SanjeevaniTriageEngine._model is None:
            if os.path.exists(self._model_path):
                try:
                    with open(self._model_path, 'rb') as f:
                        SanjeevaniTriageEngine._model = pickle.load(f)
                    logger.info(f"ML Model loaded successfully from {self._model_path}")
                except Exception as e:
                    logger.warning(f"Failed to load ML model: {e}")
            else:
                logger.warning(f"ML Model file missing at {self._model_path}")
        return SanjeevaniTriageEngine._model

    def _prepare_features(self, data: TriageInput) -> pd.DataFrame:
        gender_map = {'Male': 0, 'Female': 1, 'Other': 2}
        features = {
            'age': data.age,
            'gender_enc': gender_map.get(data.gender, 2),
            'fever': int(data.symptoms.fever),
            'fever_duration_days': data.symptoms.fever_duration_days,
            'cough': int(data.symptoms.cough),
            'fatigue': int(data.symptoms.fatigue),
            'diabetes': int(data.chronic_conditions.diabetes),
            'hypertension': int(data.chronic_conditions.hypertension)
        }
        return pd.DataFrame([features])

    def process(self, data: TriageInput) -> TriageOutput:
        """
        Orchestrates hybrid triage with full audit trail.
        """
        trace: List[Dict[str, Any]] = []
        
        # Layer 0: Metadata Validation & Config Health
        clean_metadata, validation_warnings = validate_metadata(data.metadata)
        data.metadata = clean_metadata
        
        config_warnings = ClinicalConfig.get_warnings()
        safety_overrides_applied = any("safety gate" in w.lower() for w in config_warnings)
        
        trace.append({
            "step": "Input Validation",
            "source": "schema/metadata_validator.py",
            "result": "Success" if not validation_warnings else "Warnings",
            "validation_warnings": validation_warnings,
            "config_warnings": config_warnings,
            "safety_overrides_applied": safety_overrides_applied
        })

        # Layer 1: Emergency Rules
        emergency_result = evaluate_emergency_rules(data)
        if emergency_result:
            emergency_result.decision_trace = trace
            emergency_result.decision_trace.append({
                "step": "Emergency Detection",
                "source": "rules/emergency_rules.py",
                "triggered": True,
                "risk_level": "EMERGENCY",
                "config_used": False # Emergency rules are hardcoded safety triggers
            })
            emergency_result.reasons.extend(validation_warnings + config_warnings)
            
            # Layer X: Explainability (Early Exit for Emergency)
            emergency_result.decision_trace = trace
            explanation = self.xai_layer.generate_explanation(data, emergency_result, trace)
            emergency_result.explanation = dataclasses.asdict(explanation)
            
            return emergency_result

        # Layer 2: General Risk Rules
        risk_result = evaluate_risk_rules(data)
        risk_result.reasons.extend(validation_warnings + config_warnings)
        trace.append({
            "step": "General Risk Assessment",
            "source": "rules/risk_rules.py",
            "risk_level": risk_result.risk_level.value,
            "config_used": False # General rules still hardcoded
        })

        # Layer 3: Maternal Domain
        if data.metadata.get("is_pregnant", False):
            prev_risk = risk_result.risk_level
            risk_result = evaluate_maternal_risk(data, risk_result)
            trace.append({
                "step": "Maternal Risk Assessment",
                "source": "rules/maternal_rules.py",
                "activated": True,
                "risk_upgrade": risk_result.risk_level != prev_risk,
                "final_risk": risk_result.risk_level.value,
                "config_used": True
            })
            if risk_result.is_emergency:
                risk_result.decision_trace = trace
                return risk_result

        # Layer 4: Pediatric Domain
        if data.metadata.get("age_years", 999) < 12:
            prev_risk = risk_result.risk_level
            risk_result = evaluate_pediatric_risk(data, risk_result)
            trace.append({
                "step": "Pediatric Risk Assessment",
                "source": "rules/pediatric_rules.py",
                "activated": True,
                "risk_upgrade": risk_result.risk_level != prev_risk,
                "final_risk": risk_result.risk_level.value,
                "config_used": True
            })
            if risk_result.is_emergency:
                risk_result.decision_trace = trace
                return risk_result

        # Layer 4.5: Patient History Layer
        history_escalated = False
        history_trend = "UNKNOWN"
        if data.patient_id:
            trend = self.history_manager.compute_trend(data.patient_id)
            history_trend = trend.value
            new_risk = self.history_manager.get_escalation(data.patient_id, risk_result.risk_level)
            if self.RISK_ORDER[new_risk] > self.RISK_ORDER[risk_result.risk_level]:
                risk_result.risk_level = new_risk
                history_escalated = True
                trace.append({
                    "step": "History Escalation",
                    "source": "intelligence/patient_history.py",
                    "trend": history_trend,
                    "escalated": True
                })
            else:
                trace.append({
                    "step": "History Escalation",
                    "source": "intelligence/patient_history.py",
                    "trend": history_trend,
                    "escalated": False
                })

        # Layer 5: ML Refinement
        model = self._get_model()
        drift_level = DriftLevel.NONE
        drift_reasons = []
        
        if model:
            # Check for drift before inference
            drift_level, drift_reasons = self.drift_monitor.check_drift()
            
            if drift_level == DriftLevel.SEVERE:
                trace.append({
                    "step": "ML Refinement",
                    "status": "Bypassed - Model Drift",
                    "reason": "Severe drift detected",
                    "drift_reasons": drift_reasons
                })
            else:
                try:
                    X = self._prepare_features(data)
                    ml_pred_array = model.predict(X)
                    ml_pred_str = str(ml_pred_array[0])
                    ml_prediction = RiskLevel[ml_pred_str]
                    
                    probs = model.predict_proba(X)[0] if hasattr(model, "predict_proba") else [1.0]
                    ml_confidence = float(np.max(probs))

                    current_rank = self.RISK_ORDER[risk_result.risk_level]
                    ml_rank = self.RISK_ORDER[ml_prediction]
                    
                    applied = False
                    blocked_by_safety = False
                    
                    if ml_rank > current_rank:
                        risk_result.risk_level = ml_prediction
                        applied = True
                    elif ml_rank < current_rank:
                        blocked_by_safety = True

                    # Identifying influencing features for audit
                    influencing_features = [f for f, v in X.iloc[0].items() if v != 0 and f != 'gender_enc']

                    trace.append({
                        "step": "ML Refinement",
                        "source": "intelligence/risk_model.py",
                        "ml_prediction": ml_pred_str,
                        "ml_confidence": ml_confidence,
                        "applied": applied,
                        "blocked_by_safety_floor": blocked_by_safety,
                        "influencing_features": influencing_features
                    })
                    
                    # Update drift monitor with new event
                    features_dict = X.iloc[0].to_dict()
                    self.drift_monitor.add_inference(features_dict, ml_pred_str, ml_confidence)

                except Exception as e:
                    logger.error(f"ML Refinement Error: {e}")
                    trace.append({"step": "ML Refinement", "status": "Error", "message": str(e)})
        else:
            trace.append({"step": "ML Refinement", "status": "Model Not Loaded"})

        risk_result.decision_trace = trace
        
        # Layer X: Explainability
        explanation = self.xai_layer.generate_explanation(
            data, 
            risk_result, 
            trace, 
            history_trend=history_trend, 
            history_escalated=history_escalated,
            drift_report={
                "level": drift_level.value,
                "reasons": drift_reasons
            }
        )
        risk_result.explanation = dataclasses.asdict(explanation)
        
        # Record visit for future history if patient_id exists
        if data.patient_id:
            self.history_manager.record_visit(
                data.patient_id, 
                risk_result.risk_level, 
                risk_result.assessment_score
            )

        return risk_result

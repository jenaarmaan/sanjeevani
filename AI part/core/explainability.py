from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from schema.triage_schema import TriageInput, TriageOutput, RiskLevel
import logging

@dataclass
class ExplanationProfile:
    """
    Deterministic explainability audit trail for Project Sanjeevani.
    """
    decision_primary_driver: str
    layer_rationales: Dict[str, str]
    rule_evidence: List[str]
    ml_insight_profile: Dict[str, Any]
    history_context: Dict[str, Any]
    safety_audit_flags: List[str]
    human_readable_narrative: str
    drift_report: Optional[Dict[str, Any]] = None

class ExplainabilityLayer:
    """
    Implements a deterministic XAI layer that produces audit trails.
    Priority: Rule > History > ML
    """

    def __init__(self):
        self.logger = logging.getLogger("SanjeevaniXAI")

    def generate_explanation(
        self, 
        data: TriageInput, 
        output: TriageOutput, 
        trace: List[Dict[str, Any]],
        history_trend: Optional[str] = None,
        history_escalated: bool = False,
        drift_report: Optional[Dict[str, Any]] = None
    ) -> ExplanationProfile:
        
        # 1. Identify Primary Driver
        primary_driver = "Unknown"
        layer_rationales = {}
        rule_evidence = []
        ml_insight = {}
        history_ctx = {
            "trend_direction": history_trend or "UNKNOWN",
            "escalation_applied": history_escalated
        }
        safety_flags = []

        # Parse trace for info
        emergency_triggered = False
        rule_upgrade = False
        ml_applied = False
        ml_blocked = False
        ml_bypassed_drift = False
        
        for step in trace:
            step_name = step.get("step")
            if step_name == "Emergency Detection" and step.get("triggered"):
                emergency_triggered = True
                primary_driver = "Rule Layer"
                layer_rationales["Rule Layer"] = "Critical red flag detected."
                rule_evidence.extend(output.reasons) # Reasons usually populated by rule layer
            
            elif step_name in ["General Risk Assessment", "Maternal Risk Assessment", "Pediatric Risk Assessment"]:
                if step.get("risk_upgrade") or step_name == "General Risk Assessment":
                    if not emergency_triggered:
                        primary_driver = "Rule Layer"
                    layer_rationales["Rule Layer"] = f"Clinical logic applied at {step_name}."
                    # Filter reasons that might be from rules
                    # This is a bit fuzzy without exact mapping, but let's assume all current reasons are rule evidence
                    # unless it's ML.
                
            elif step_name == "ML Refinement":
                if step.get("status") == "Bypassed - Model Drift":
                    ml_bypassed_drift = True
                    ml_insight = {"status": "Bypassed", "reason": "Drift Detection"}
                    continue

                ml_insight = {
                    "ml_predicted_label": step.get("ml_prediction"),
                    "confidence_score": step.get("ml_confidence"),
                    "applied": step.get("applied", False),
                    "rejected_downgrade": step.get("blocked_by_safety_floor", False),
                    "influencing_features": step.get("influencing_features", [])
                }
                if step.get("applied") and not emergency_triggered and not history_escalated:
                    primary_driver = "ML Layer"
                    layer_rationales["ML Layer"] = "ML identified risk acceleration."
                elif step.get("blocked_by_safety_floor"):
                    ml_blocked = True
        
        if history_escalated:
            primary_driver = "History Layer"
            layer_rationales["History Layer"] = "Longitudinal deterioration detected."

        # Rule evidence: Gather from output reasons (excluding ML specific ones if any)
        rule_evidence = [r for r in output.reasons if "ML" not in r]

        # Safety Audit Flags
        if emergency_triggered:
            safety_flags.append("EMERGENCY_OVERRIDE_ACTIVE")
        if ml_blocked:
            safety_flags.append("ML_DOWNGRADE_BLOCKED")
        if history_escalated:
            safety_flags.append("HISTORY_RATIFIED_ESCALATION")
        if ml_bypassed_drift:
            safety_flags.append("ML_BYPASSED_SEVERE_DRIFT")
        elif drift_report and drift_report.get("level") != "NONE":
            safety_flags.append("ML_LOW_TRUST_DRIFT_WARNING")

        # Narrative Construction
        narrative_parts = []
        
        # Priority: Life-Safety Protocol for Emergencies
        if output.risk_level == RiskLevel.EMERGENCY:
            narrative_parts.append("Priority: Life-Safety Protocol")
            if emergency_triggered:
                narrative_parts.append("Detected critical clinical triggers requiring immediate intervention.")
            else:
                narrative_parts.append("Triggered by clinical escalation to emergency status.")
        
        # Rule Layer Detail
        if primary_driver == "Rule Layer":
            narrative_parts.append(f"Risk level {output.risk_level.value} determined by clinical rule triggers.")
            if rule_evidence:
                triggers: List[str] = rule_evidence
                narrative_parts.append(f"Triggers: {', '.join(triggers[:2])}.")
        
        # History Detail
        if history_escalated:
            narrative_parts.append("Predictive escalation applied due to worsening longitudinal trend.")
            narrative_parts.append(f"Trend direction: {history_trend}.")
        
        # ML Detail
        if ml_bypassed_drift:
            narrative_parts.append("ML confidence degraded — refinement bypassed per safety protocol.")
        elif ml_insight.get("ml_predicted_label"):
            if ml_insight.get("applied"):
                narrative_parts.append(f"ML Layer upgraded risk based on pattern recognition (Confidence: {ml_insight.get('confidence_score'):.2f}).")
            elif ml_insight.get("rejected_downgrade"):
                narrative_parts.append("Automated safety floor maintained. ML suggestion rejected due to clinical rule.")
            elif not emergency_triggered:
                narrative_parts.append("ML layer confirmed clinical rule assessment (Pattern Verification).")

        # Drift Narratives
        if drift_report and drift_report.get("level") != "NONE":
            reasons = drift_report.get("reasons", [])
            if reasons:
                narrative_parts.append(f"Model drift detected: {reasons[0]}.")

        # Fallback/Default
        if not narrative_parts:
            narrative_parts.append(f"Standard clinical protocol applied. Risk categorized as {output.risk_level.value}.")

        human_narrative = " ".join(narrative_parts)

        return ExplanationProfile(
            decision_primary_driver=primary_driver,
            layer_rationales=layer_rationales,
            rule_evidence=rule_evidence,
            ml_insight_profile=ml_insight,
            history_context=history_ctx,
            safety_audit_flags=safety_flags,
            human_readable_narrative=human_narrative,
            drift_report=drift_report
        )

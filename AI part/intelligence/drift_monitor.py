import json
import os
try:
    import numpy as np # type: ignore
except ImportError:
    # This ensures NumPy is recognized as a mandatory runtime dependency
    np = None # type: ignore

from typing import Dict, List, Any, Optional, Tuple
from enum import Enum

class DriftLevel(Enum):
    NONE = "NONE"
    WARNING = "WARNING"
    SEVERE = "SEVERE"

class DriftMonitor:
    """
    Offline Model Drift & Safety Monitoring Layer.
    Detects input, output, and confidence drift using a sliding window.
    """
    
    def __init__(self, baseline_path: str = "intelligence/models/baseline_stats.json", window_size: int = 50):
        if np is None:
            raise ImportError("NumPy required for DriftMonitor")
            
        self.baseline_path = baseline_path
        self.window_size = window_size
        self.baseline = self._load_baseline()
        
        # Runtime buffers
        self.feature_history: List[Dict[str, float]] = []
        self.prediction_history: List[str] = []
        self.confidence_history: List[float] = []
        
        # Configuration
        self.MIN_SAMPLES = 20  # Minimum samples before drift detection activates
        
        # Thresholds
        self.Z_THRESHOLD = 2.0       # Feature drift sigma (Sensitivity per POC requirements)
        self.SKEW_THRESHOLD = 0.40   # Label distribution shift
        self.CONFIDENCE_FLOOR = 0.60 # Minimum average confidence

    def _load_baseline(self) -> Dict[str, Any]:
        if os.path.exists(self.baseline_path):
            with open(self.baseline_path, 'r') as f:
                return json.load(f)
        return {}

    def add_inference(self, features: Dict[str, float], prediction: str, confidence: float):
        """Records a new inference event for drift analysis."""
        self.feature_history.append(features)
        self.prediction_history.append(prediction)
        self.confidence_history.append(confidence)
        
        # Maintain sliding window
        if len(self.feature_history) > self.window_size:
            self.feature_history.pop(0)
            self.prediction_history.pop(0)
            self.confidence_history.pop(0)

    def check_drift(self) -> Tuple[DriftLevel, List[str]]:
        """
        Analyzes recent history against baseline.
        Returns (DriftLevel, drift_reasons)
        """
        # 0. Runtime & Type Guard for NumPy
        _np = np
        if _np is None:
            return DriftLevel.NONE, []

        # 1. Minimum Sample Guard
        if len(self.feature_history) < self.MIN_SAMPLES:
            return DriftLevel.NONE, []

        drift_reasons: List[str] = []
        warning_signals: List[str] = []

        # Pin baseline to local for narrowing
        baseline = self.baseline
        if not baseline:
            return DriftLevel.NONE, []

        # 2. Feature Drift (Z-Score)
        EPSILON: float = 1e-6
        feature_stats: Dict[str, Any] = baseline.get("feature_stats", {})
        for feat, stats in feature_stats.items():
            baseline_mean: float = float(stats["mean"])
            baseline_std: float = float(stats["std"])
            
            if baseline_std < EPSILON:
                continue

            current_vals: List[float] = [float(h.get(feat, baseline_mean)) for h in self.feature_history]
            current_mean: float = float(_np.mean(current_vals))
            
            z_score: float = float(abs(current_mean - baseline_mean) / baseline_std)
            if z_score > self.Z_THRESHOLD:
                msg = f"Input {feat} distribution deviates (Z={z_score:.2f})"
                drift_reasons.append(msg)
                warning_signals.append(feat)

        # 3. Prediction Drift (Distribution Skew)
        current_labels: Dict[str, int] = {}
        for p in self.prediction_history:
            current_labels[p] = current_labels.get(p, 0) + 1
        
        total: int = len(self.prediction_history)
        label_dist: Dict[str, float] = baseline.get("label_distribution", {})
        for label, baseline_ratio in label_dist.items():
            current_ratio: float = float(current_labels.get(label, 0)) / float(total)
            if abs(current_ratio - baseline_ratio) > 0.65:
                msg = f"Output skew: {label} shifted by {abs(current_ratio - baseline_ratio)*100:.1f}%"
                drift_reasons.append(msg)
                warning_signals.append(f"skew_{label}")

        # 4. Confidence Collapse Guard
        avg_conf: float = float(_np.mean(self.confidence_history))
        is_severe_confidence: bool = False
        
        if avg_conf <= (self.CONFIDENCE_FLOOR - 0.15):
            drift_reasons.append(f"ML confidence degraded significantly (Avg: {avg_conf:.2f})")
            is_severe_confidence = True
        elif avg_conf < self.CONFIDENCE_FLOOR:
            drift_reasons.append(f"ML confidence below baseline (Avg: {avg_conf:.2f})")
            warning_signals.append("confidence_low")

        # 5. FINAL DETERMINATION (Monotonic Precedence)
        warning_count: int = len(warning_signals)
        if is_severe_confidence or (warning_count >= 3):
            return DriftLevel.SEVERE, drift_reasons
        elif warning_count > 0:
            return DriftLevel.WARNING, drift_reasons
        
        return DriftLevel.NONE, []

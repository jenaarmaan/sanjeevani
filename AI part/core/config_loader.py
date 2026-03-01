import json
import os
import logging
from typing import Any, Dict, List, Tuple, Optional, Union, cast

# --------------------------------------------------------------------------
# DESIGN DECISIONS (TYPE-SAFE EDITION):
# 1. OPTIONAL GUARDS: _config is now correctly typed as Optional and 
#    guarded with explicit checks.
# 2. TYPE-SAFE DEFAULTS: Internal constants are strictly typed to avoid 
#    inference issues with Pyright.
# 3. ROBUST GETTERS: Replaced nested .get() chains with type-casted 
#    safe retrieval to ensure no "attribute access on None" errors.
# --------------------------------------------------------------------------

logger = logging.getLogger("SanjeevaniConfigLoader")

class ClinicalConfig:
    # Correctly marked as Optional to satisfy Pyright's strict assignment rules
    _config: Optional[Dict[str, Dict[str, Any]]] = None
    _validation_warnings: List[str] = []
    _config_path: str = "config/clinical_thresholds.json"
    
    # Safe Clinical Defaults (The "Safety Floor")
    # Defined as a nested dictionary with basic types for clarity
    DEFAULT_THRESHOLDS: Dict[str, Dict[str, Union[int, float]]] = {
        "pediatric": {
            "activation_age_limit": 12,
            "infant_age_limit": 1,
            "fever_emergency_threshold": 38.0,
            "prolonged_fever_days": 3,
            "high_risk_points_threshold": 6,
            "moderate_risk_points_threshold": 3
        },
        "maternal": {
            "critical_sys_bp": 160,
            "late_pregnancy_weeks": 28,
            "high_risk_points_threshold": 5,
            "moderate_risk_points_threshold": 2
        }
    }

    # SAFETY GATES: Hard limits that config cannot override to "weaken" safety.
    HARD_GATES: Dict[str, Dict[str, Union[int, float]]] = {
        "pediatric": {
            "fever_emergency_threshold": 38.0, 
            "infant_age_limit": 1,
        },
        "maternal": {
            "critical_sys_bp": 160,
        }
    }

    @classmethod
    def load(cls) -> Dict[str, Dict[str, Any]]:
        """Lazily load and validate the configuration with explicit None guards."""
        config = cls._config
        if config is not None:
            return config

        raw_config: Dict[str, Any] = {}
        if os.path.exists(cls._config_path):
            try:
                with open(cls._config_path, 'r') as f:
                    loaded = json.load(f)
                    if isinstance(loaded, dict):
                        raw_config = loaded
                    else:
                        cls._validation_warnings.append("Config Validation: Root must be a JSON object.")
                logger.info(f"Raw config read from {cls._config_path}")
            except Exception as e:
                cls._validation_warnings.append(f"Config Validation: File corruption/error: {e}")
        else:
            cls._validation_warnings.append("Config Validation: File missing. Using safe defaults.")
        
        # Sterilize and assign
        clean, warnings = cls._validate_config(raw_config)
        cls._validation_warnings.extend(warnings)
        cls._config = clean
            
        return clean

    @classmethod
    def _validate_config(cls, raw: Dict[str, Any]) -> Tuple[Dict[str, Dict[str, Any]], List[str]]:
        """
        Sterilizes the raw config against types, ranges, and safety gates.
        Uses explicit type checking instead of type() comparison.
        """
        clean: Dict[str, Dict[str, Any]] = {}
        warnings: List[str] = []

        for domain, defaults in cls.DEFAULT_THRESHOLDS.items():
            # Create a shallow copy to prevent mutation of DEFAULT_THRESHOLDS
            domain_clean: Dict[str, Any] = defaults.copy()
            
            # Type guard for domain presence
            raw_entry = raw.get(domain)
            if raw_entry is None:
                clean[domain] = domain_clean
                continue
                
            if not isinstance(raw_entry, dict):
                warnings.append(f"Config Validation: Domain '{domain}' must be an object. Using defaults.")
                clean[domain] = domain_clean
                continue

            raw_domain = cast(Dict[str, Any], raw_entry)

            for key, default_val in defaults.items():
                if key in raw_domain:
                    val = raw_domain[key]
                    
                    # 1. Robust Type Check
                    # Handles both int and float as numeric if appropriate
                    is_numeric_val = isinstance(val, (int, float))
                    is_numeric_def = isinstance(default_val, (int, float))
                    
                    if is_numeric_val and not is_numeric_def:
                         warnings.append(f"Config Validation: {domain}.{key} has invalid type.")
                         continue
                    
                    if not is_numeric_val and isinstance(val, type(default_val)) is False:
                        warnings.append(f"Config Validation: {domain}.{key} has invalid type.")
                        continue
                    
                    # 2. Safety Gate Check
                    gate = cls.HARD_GATES.get(domain, {}).get(key)
                    if gate is not None and isinstance(val, (int, float)) and isinstance(gate, (int, float)):
                        if key in ["fever_emergency_threshold", "critical_sys_bp"]:
                            if val > gate:
                                warnings.append(f"Config Validation: {domain}.{key} ({val}) attempts to weaken safety gate ({gate}). Blocked.")
                                continue
                        if key == "infant_age_limit":
                            if val < gate:
                                warnings.append(f"Config Validation: {domain}.{key} ({val}) attempts to weaken safety gate ({gate}). Blocked.")
                                continue

                    # 3. Passed validation
                    domain_clean[key] = val
                    
            clean[domain] = domain_clean

        return clean, warnings

    @classmethod
    def get_value(cls, domain: str, key: str, fallback: Any) -> Any:
        """Type-safe retrieval of config values."""
        config = cls.load()
        domain_config = config.get(domain)
        if domain_config is None:
            return fallback
        return domain_config.get(key, fallback)

    @classmethod
    def get_warnings(cls) -> List[str]:
        """Ensures config is loaded before returning warnings."""
        cls.load()
        return cls._validation_warnings

    @classmethod
    def reset_for_test(cls) -> None:
        """Provides a safe way to wipe state for test isolation."""
        cls._config = None
        cls._validation_warnings = []

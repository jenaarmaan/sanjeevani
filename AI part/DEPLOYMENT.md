# Sanjeevani Deployment Readiness Checklist (Offline-First)

This document outlines the requirements and verification steps for deploying Project Sanjeevani in low-resource, offline environments.

## 1. Runtime Environment
- [ ] **Python 3.10**: Verified as the primary deployment target.
- [ ] **Dependencies**: `pandas`, `numpy`, `scikit-learn` installed in the local environment.
- [ ] **Zero Internet**: System verified to have no `requests`, `urllib`, or API-based calls in the critical path.

## 2. Artifact Integrity
- [ ] **Clinical Config**: `config/clinical_thresholds.json` must be present.
- [ ] **ML Model**: `intelligence/models/risk_refiner.pkl` must be present for refined risk assessment.
- [ ] **Permissions**: Read access to the `config/` and `intelligence/models/` directories.

## 3. Hardware Requirements
- **RAM**: Minimum 512MB (Lightweight Random Forest + Pandas overhead).
- **Storage**: < 50MB for code and models.
- **CPU**: ARM/x86 compatible (Standard Python environment).

## 4. Safety & Resilience Gates
- [ ] **Startup Check**: Run `python -m core.startup_check` before service initiation.
- [ ] **Config Handlers**: System must fall back to `ClinicalConfig.DEFAULT_THRESHOLDS` if JSON is corrupted.
- [ ] **ML Safety**: System must continue to operate using rule-based logic if `pickle.load()` fails.
- [ ] **Safety Floor**: Audit trails must show `blocked_by_safety_floor: True` if ML attempts to downgrade risk.

## 5. Deployment Command
To verify a new installation, run:
```powershell
python -m core.startup_check
```

## 6. Offline Validation (Proof)
The system has been tested by disabling network interfaces and performing:
1. Model loading (Successful via local Pickle).
2. Triage rules execution (Successful via local JSON config).
3. Audit trail generation (Successful via local logic).

**Final Deployment Status: READY**

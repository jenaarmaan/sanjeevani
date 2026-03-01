# Project Sanjeevani: General Triage Layer

This module implements a hybrid AI triage system for general health screening. It prioritizes safety, explainability, and offline capability.

## Architecture
The system uses a 3-layer assessment approach:

1. **Deterministic Rules (Emergency)**: Detects immediate red flags like chest pain or severe breathlessness. Acts as a fail-safe.
2. **Clinical Scoring (Standard Risk)**: Uses a point-based system (Age, Symptoms, Chronic conditions) to categorize patients into LOW, MODERATE, or HIGH risk.
3. **ML Refinement (Nuanced Risk)**: A focused ML layer that identifies complex risk patterns (e.g., geriatric high-risk clusters) to refine the risk level and provide specific insights.

## Safety Principles
- **Non-Diagnostic**: The system outputs risk levels and recommended actions, not disease names.
- **Fail-safe Defaults**: Any missing data or critical flag defaults to the highest safe risk level.
- **Explainable**: Every decision includes a list of `reasons` for clinician or user review.

## Project Structure
- `schema/`: Structured data models (Pydantic-ready).
- `rules/`: Deterministic clinical logic.
- `intelligence/`: ML model placeholders and refinement logic.
- `core/`: Orchestration engine.

## Usage
```python
from core.triage_engine import SanjeevaniTriageEngine
from schema.triage_schema import TriageInput, PatientSymptoms, ChronicConditions

engine = SanjeevaniTriageEngine()
patient_data = TriageInput(
    age=71,
    symptoms=PatientSymptoms(fatigue=True),
    chronic_conditions=ChronicConditions(diabetes=True)
)
result = engine.process(patient_data)
print(f"Risk Level: {result.risk_level.value}")
print(f"Reasons: {result.reasons}")
```

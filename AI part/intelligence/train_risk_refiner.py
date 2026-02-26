import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from typing import List

# --------------------------------------------------------------------------
# DESIGN DECISIONS & SAFETY CONSTRAINTS:
# 1. NON-DIAGNOSTIC: The model only predicts RiskLevel (Low/Moderate/High).
# 2. EMERGENCY EXCLUSION: Rule-based logic is 100% reliable for life-safety. 
#    ML is excluded from Emergency detection to prevent False Negatives in critical cases.
# 3. OFFLINE-FIRST: Random Forest is selected due to its small footprint 
#    when serialized and fast inference without specialized hardware (GPU).
# 4. EXPLAINABILITY: Feature importance and shallow depth (max_depth=5) 
#    ensure the model's behavior is consistent and interpretable by clinicians.
# --------------------------------------------------------------------------

def train_risk_refiner():
    # 1. Load the dataset
    data_path = "intelligence/data/synthetic_triage_data.csv"
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}. Please run synthetic data generator first.")
        return

    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} samples from {data_path}")

    # 2. Filter out EMERGENCY rows (Rule-based domain)
    # Safety: ML should not handle emergency red-flags as per system design
    df_ml = df[df['risk_label'] != 'EMERGENCY'].copy()
    print(f"Filtered for ML Training: {len(df_ml)} non-emergency samples.")

    # 3. Preprocessing
    # Map Gender to numerical values
    gender_map = {'Male': 0, 'Female': 1, 'Other': 2}
    df_ml['gender_enc'] = df_ml['gender'].map(gender_map)

    # Features: age, gender, and non-emergency symptoms/conditions
    features = [
        'age', 'gender_enc', 'fever', 'fever_duration_days', 
        'cough', 'fatigue', 'diabetes', 'hypertension'
    ]
    
    X = df_ml[features]
    y = df_ml['risk_label']

    # 4. Split data
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 5. Train Lightweight Random Forest
    # Parameters optimized for offline mobile/edge deployment
    model = RandomForestClassifier(
        n_estimators=50, 
        max_depth=5, 
        random_state=42
    )
    
    print("\nTraining Risk Refinement Model (RandomForest)...")
    model.fit(X_train, y_train)

    # 6. Evaluation
    y_pred = model.predict(X_val)
    
    print("\n" + "="*40)
    print("EVALUATION RESULTS")
    print("="*40)
    print(f"Overall Accuracy: {accuracy_score(y_val, y_pred):.4f}")
    
    print("\nClassification Report:")
    print(classification_report(y_val, y_pred))
    
    print("\nConfusion Matrix (Calculated):")
    cm = confusion_matrix(y_val, y_pred, labels=['LOW', 'MODERATE', 'HIGH'])
    print("          Pred_LOW  Pred_MOD  Pred_HIGH")
    print(f"True_LOW  {cm[0][0]:<10} {cm[0][1]:<10} {cm[0][2]:<10}")
    print(f"True_MOD  {cm[1][0]:<10} {cm[1][1]:<10} {cm[1][2]:<10}")
    print(f"True_HIGH {cm[2][0]:<10} {cm[2][1]:<10} {cm[2][2]:<10}")

    # 7. Explainability: Feature Importance
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    print("\n" + "="*40)
    print("EXPLAINABILITY: FEATURE IMPORTANCE")
    print("="*40)
    for f in range(X.shape[1]):
        print(f"{f + 1}. {features[indices[f]]:<20} {importances[indices[f]]:.4f}")

    print("\nDesign Rationale:")
    print("- Why Random Forest: Non-linear symptom correlations (e.g., Age+Chronic) are better captured ")
    print("  than by simple linear models, yet RF remains fast and offline-capable.")
    print("- Integration: This model supplements rule-based logic by providing a 'probability' or ")
    print("  pattern-matched second opinion for MODERATE and HIGH cases.")

    # 8. Serialization
    models_dir = "intelligence/models"
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, "risk_refiner.pkl")
    
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
        
    print(f"\nModel serialized successfully to: {model_path}")

if __name__ == "__main__":
    train_risk_refiner()

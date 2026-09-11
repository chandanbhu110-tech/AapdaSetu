"""
SIH NER Smart Logistics Platform - Random Forest Disruption Model Trainer
=============================================================================
IMPORTANT NOTICE:
This script generates and trains on SYNTHETIC DEMO TRAINING DATA designed to simulate
North Eastern Region (NER) monsoon, terrain, and road hazard dynamics.
This data is NOT real historical NER incident logs.
=============================================================================
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import joblib

def generate_synthetic_data(num_samples=1200, random_seed=42):
    np.random.seed(random_seed)
    
    # Feature distributions realistic to NER monsoon & mountainous topography
    rainfall_1h = np.random.exponential(scale=4.5, size=num_samples) # mm
    rainfall_24h = rainfall_1h * np.random.uniform(3.0, 8.0, size=num_samples) + np.random.exponential(scale=15.0, size=num_samples)
    wind_speed = np.random.gamma(shape=2.5, scale=4.0, size=num_samples) # km/h
    
    # Road condition score (0 = impassable, 100 = excellent)
    road_condition_score = np.random.uniform(20.0, 95.0, size=num_samples)
    
    # Traffic level (1 = very light, 5 = gridlock/heavy)
    traffic_level = np.random.choice([1, 2, 3, 4, 5], size=num_samples, p=[0.15, 0.35, 0.30, 0.15, 0.05])
    
    # Incident presence
    incident_count = np.random.choice([0, 1, 2, 3, 4], size=num_samples, p=[0.50, 0.28, 0.14, 0.06, 0.02])
    incident_severity = np.zeros(num_samples)
    for i in range(num_samples):
        if incident_count[i] > 0:
            # 1: Low, 2: Moderate, 3: High, 4: Critical
            incident_severity[i] = np.random.choice([1, 2, 3, 4], p=[0.25, 0.35, 0.25, 0.15])
            
    # Route Health Score (0 - 100)
    route_health_score = np.clip(
        road_condition_score * 0.45 
        - incident_count * 12.0 
        - incident_severity * 6.0 
        - (rainfall_24h / 50.0) * 15.0 
        + np.random.normal(20, 5, num_samples),
        5, 100
    )
    
    # Mountainous NER terrain attributes
    elevation = np.random.uniform(150.0, 2600.0, size=num_samples) # meters
    slope = np.random.uniform(2.0, 38.0, size=num_samples) # degrees
    historical_disruptions = np.random.poisson(lam=2.2, size=num_samples) # count per season
    distance_to_incident = np.where(
        incident_count > 0,
        np.random.uniform(0.5, 45.0, size=num_samples),
        999.0 # No active incident within critical proximity
    )
    
    # Ground truth disruption probability function based on domain physics
    # Landslides & road cuts in NER correlate strongly with:
    # high 24h rain, steep slope, critical incidents, low health score
    hazard_index = (
        (rainfall_24h / 60.0) * 0.28 +
        (slope / 30.0) * 0.22 +
        (incident_severity / 4.0) * 0.25 +
        ((100.0 - route_health_score) / 100.0) * 0.20 +
        (historical_disruptions / 6.0) * 0.10 +
        np.where(distance_to_incident < 10.0, 0.15, 0.0)
    )
    
    # Sigmoid conversion with realistic noise
    prob = 1.0 / (1.0 + np.exp(-4.0 * (hazard_index - 0.55)))
    disruption = (np.random.rand(num_samples) < prob).astype(int)
    
    df = pd.DataFrame({
        'rainfall_1h': np.round(rainfall_1h, 2),
        'rainfall_24h': np.round(rainfall_24h, 2),
        'wind_speed': np.round(wind_speed, 2),
        'road_condition_score': np.round(road_condition_score, 1),
        'traffic_level': traffic_level,
        'incident_count': incident_count,
        'incident_severity': incident_severity.astype(int),
        'route_health_score': np.round(route_health_score, 1),
        'elevation': np.round(elevation, 1),
        'slope': np.round(slope, 1),
        'historical_disruptions': historical_disruptions,
        'distance_to_incident': np.round(distance_to_incident, 1),
        'disruption': disruption
    })
    
    return df

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, 'data')
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(data_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)
    
    csv_path = os.path.join(data_dir, 'disruption_history.csv')
    print("1. Generating clearly-labeled SYNTHETIC DEMO TRAINING DATA...")
    df = generate_synthetic_data(num_samples=1200, random_seed=42)
    df.to_csv(csv_path, index=False)
    print(f"   Saved {len(df)} synthetic records to: {csv_path}")
    print(f"   Disruption distribution: 0={sum(df['disruption']==0)}, 1={sum(df['disruption']==1)}")
    
    features = [
        'rainfall_1h',
        'rainfall_24h',
        'wind_speed',
        'road_condition_score',
        'traffic_level',
        'incident_count',
        'incident_severity',
        'route_health_score',
        'elevation',
        'slope',
        'historical_disruptions',
        'distance_to_incident'
    ]
    target = 'disruption'
    
    X = df[features]
    y = df[target]
    
    print("\n2. Splitting dataset into 80% train and 20% test (random_state=42)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    print("3. Training RandomForestClassifier...")
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=4,
        random_state=42
    )
    clf.fit(X_train, y_train)
    
    print("4. Calculating genuine test metrics (NOT faked)...")
    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]
    
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))
    roc_auc = float(roc_auc_score(y_test, y_prob))
    
    print("--------------------------------------------------")
    print(f"Accuracy : {acc:.4f} ({acc*100:.2f}%)")
    print(f"Precision: {prec:.4f}")
    print(f"Recall   : {rec:.4f}")
    print(f"F1 Score : {f1:.4f}")
    print(f"ROC-AUC  : {roc_auc:.4f}")
    print("--------------------------------------------------")
    
    # Save model
    model_path = os.path.join(models_dir, 'disruption_model.joblib')
    joblib.dump(clf, model_path)
    print(f"5. Saved trained model to: {model_path}")
    
    # Feature importances
    importances = dict(zip(features, [round(float(v), 4) for v in clf.feature_importances_]))
    sorted_importances = dict(sorted(importances.items(), key=lambda item: item[1], reverse=True))
    
    metrics_path = os.path.join(models_dir, 'model_metrics.json')
    metrics_data = {
        'model_name': 'RandomForestClassifier',
        'data_source': 'SYNTHETIC_NER_DEMO_DATA',
        'metrics': {
            'accuracy': round(acc, 4),
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1_score': round(f1, 4),
            'roc_auc': round(roc_auc, 4)
        },
        'feature_importances': sorted_importances,
        'features': features,
        'train_samples': len(X_train),
        'test_samples': len(X_test)
    }
    
    with open(metrics_path, 'w') as f:
        json.dump(metrics_data, f, indent=2)
    print(f"6. Saved metrics & metadata to: {metrics_path}")

if __name__ == '__main__':
    main()

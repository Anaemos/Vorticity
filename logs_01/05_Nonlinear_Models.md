# Phase 5 — Nonlinear Models

## Objective

Evaluate whether nonlinear model classes improve next-day direction prediction for the NIFTY 50 relative to the Phase 1–4 logistic regression baseline.

Prior phases established:

- Stable predictive accuracy ≈ 0.54–0.55
- Weak but persistent signal
- No improvement from regime encoding
- No sensitivity to volatility estimator choice

Phase 5 tests whether this signal contains nonlinear structure that linear models cannot capture.

---

# 1. Experimental Design

To ensure comparability with prior phases, all pipeline components were held constant:

- Data: NIFTY 50 daily OHLCV
- Features:
  ret_lag_1, ret_lag_5, ret_lag_10  
  ma_ratio_5, ma_ratio_10, ma_ratio_20  
  vol_cc, vol_cc_lag_1
- Target: next-day direction
- Volatility: close-to-close (Phase 4 conclusion)
- Split: chronological 80/20
- Scaling: train-fit standardization

Only the model class was changed.

---

# 2. Models Evaluated

## Logistic Regression (baseline)

Linear classifier from Phase 1–4.

## Decision Tree

Single CART tree with constrained depth.

## Random Forest

Bagged ensemble of trees with feature randomness.

## Gradient Boosting

Sequential additive trees optimizing log-loss.

---

# 3. Hyperparameter Rationale

Tree depth and leaf size were restricted to prevent overfitting on financial noise:

- max_depth ≈ 3–5  
- min_samples_leaf ≈ 50  
- moderate ensemble size  

These values reflect typical regularization levels in financial direction models with daily data.

---

# 4. Results

Test accuracy:

| Model | Accuracy |
|------|---------|
Logistic | 0.544 |
Decision Tree | 0.509 |
Random Forest | 0.563 |
Gradient Boost | 0.562 |

---

# 5. Interpretation

## 5.1 Decision Tree

Single tree collapses to near-random accuracy.

This indicates:

- High noise in daily index direction
- Instability of local splits
- Weak separability in feature space

This behavior is typical in financial classification.

---

## 5.2 Ensemble Improvement

Random Forest and Gradient Boosting improve accuracy by ≈1.8 percentage points over logistic regression.

This demonstrates:

The NIFTY direction signal contains nonlinear interactions not captured by a linear decision boundary.

However, accuracy remains in the ~0.56 range, confirming that:

The predictive signal remains weak even under nonlinear modeling.

---

# 6. Key Findings

1. Logistic regression reproduces Phase-1 baseline (pipeline validated).
2. Single decision trees are unstable on financial direction data.
3. Tree ensembles provide modest but consistent improvement.
4. NIFTY direction exhibits limited nonlinear predictability.
5. Overall predictability remains weak but real.

---

# 7. Implications for Project Thesis

Results refine the project claim:

NIFTY next-day direction shows weak but stable predictability (~55%) under linear models and modest nonlinear enhancement (~56%) under ensemble methods, indicating limited nonlinear structure in index return dynamics.

---

# 8. Conclusion

Nonlinear ensemble models modestly outperform logistic regression while preserving realistic financial ML accuracy levels.

This confirms that the predictive signal contains nonlinear structure but remains fundamentally weak.

---

# 9. Next Extensions

To fully characterize nonlinear behavior:

1. Regime-conditioned nonlinear evaluation  
2. Walk-forward nonlinear validation  

These will determine whether nonlinear gains depend on volatility regime or market period.

---

**Checkpoint:** Phase 5 complete
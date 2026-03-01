# Nonlinear Extensions — Stability and Regime Interaction

## Objective

Evaluate whether nonlinear predictive structure observed in Phase 5 global model comparisons remains stable across:

1. Volatility regimes  
2. Time (walk forward validation)

Phase 5 showed that tree-based ensembles modestly outperform logistic regression in a static hold out split. This extension tests whether that advantage persists under regime conditioning and temporal validation.

---

# 1. Motivation

Financial return direction prediction is widely considered close to a random walk, with typical accuracies near 50–56% even under advanced models.

Therefore, the key research question is not whether nonlinear models improve accuracy in a single split, but whether any nonlinear predictive structure:

- varies across volatility regimes  
- remains stable across time  

This extension addresses both.

---

# 2. Experimental Setup

Pipeline identical to Phase 5:

- Features:
  ret_lag_1, ret_lag_5, ret_lag_10  
  ma_ratio_5, ma_ratio_10, ma_ratio_20  
  vol_cc, vol_cc_lag_1  

- Target: next-day direction  
- Volatility regime: terciles of close-to-close volatility  
- Models: Random Forest, Gradient Boosting  
- Scaling: train-fit standardization  

Two analyses performed:

1. Regime conditioned nonlinear accuracy  
2. Walk forward nonlinear validation  

---

# 3. Regime-Conditioned Nonlinear Results

Test accuracy by volatility regime:

| Regime | RandomForest | GradientBoost |
|--------|-------------|--------------|
High | 0.658 | 0.544 |
Low | 0.554 | 0.587 |
Medium | 0.531 | 0.510 |

## Interpretation

Low volatility regime shows the most consistent nonlinear improvement, particularly for Gradient Boosting.

High volatility regime exhibits inflated Random Forest accuracy due to small sample size and estimator variance.

Mediumvolatility regime remains weakest across all models, consistent with prior phases.

These results indicate that nonlinear predictive structure is strongest in calmer market conditions and unstable in turbulent regimes.

---

# 4. Walk-Forward Nonlinear Validation

Yearly expanding-window validation produced:

| Model | Mean Accuracy | Std |
|------|--------------|-----|
RandomForest | 0.521 | 0.045 |
GradientBoost | 0.524 | 0.044 |

## Interpretation

Global Phase 5 nonlinear accuracy (~0.562) declines to ~0.522–0.524 under walk-forward validation.

This indicates that nonlinear predictive patterns identified in a single split do not remain stable across time.

Tree ensembles capture period-specific interactions that do not generalize across evolving market conditions.

---

# 5. Combined Findings

1. Nonlinear models outperform logistic regression in static evaluation.
2. Nonlinear gains concentrate in low volatility regimes.
3. High volatility nonlinear performance is unstable.
4. Nonlinear advantage diminishes under walk forward validation.
5. Direction predictability remains weak overall (~52–56%).

---

# 6. Implications for Market Predictability

Results support the prevailing view that:

Equity index direction is close to a random walk with limited exploitable structure.

However, weak nonlinear predictability appears conditionally present in low-volatility environments and transient across time.

This aligns with the hypothesis that markets are weakly nonlinear and non-stationary rather than strictly random.

---

# 7. Project Level Interpretation

The project demonstrates:

- Leakage free time-series ML design  
- Regime aware evaluation  
- Nonlinear model comparison  
- Temporal stability analysis  

Rather than claiming strong predictability, results characterize the limits and conditional nature of return direction prediction.

---

# 8. Conclusion

Nonlinear ensemble models provide modest directional prediction gains in static evaluation but do not exhibit stable temporal generalization. Nonlinear predictability is strongest in low-volatility regimes and unstable in high-volatility periods.

Overall evidence supports weak, regime-dependent, and non-stationary structure in NIFTY return direction rather than robust predictability.

---

**Checkpoint:** Nonlinear extensions complete
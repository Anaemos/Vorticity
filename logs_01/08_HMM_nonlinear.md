# Phase 7 — Nonlinear Predictability Within HMM Regimes

## Objective

Evaluate whether nonlinear predictive structure varies across latent market regimes inferred by the Hidden Markov Model (Phase 6).

While Phase 5 established that nonlinear models modestly outperform logistic regression globally, Phase 7 investigates whether this nonlinear advantage depends on market state.

---

# 1. Methodology

## 1.1 Regime Source

Latent regimes were obtained from the Phase-6 HMM model fitted on:

- daily return
- close to close volatility

Each observation was assigned a regime label:

Low, Medium, High

These regimes were merged with the direction-prediction dataset.

---

## 1.2 Direction Models

Models evaluated:

- Logistic Regression (linear baseline)
- Random Forest
- Gradient Boosting

Features identical to prior phases:

- lagged returns
- moving average ratios
- volatility
- lagged volatility

HMM regime was **not used as a predictor**, but only for conditioning evaluation.

---

# 2. Regime-Conditioned Accuracy

Test accuracy by HMM regime:

| Regime | Logistic | RandomForest | GradientBoost |
|--------|---------|-------------|--------------|
High | 0.614 | 0.659 | 0.659 |
Low | 0.563 | 0.580 | 0.575 |
Medium | 0.532 | 0.529 | 0.527 |

---

# 3. Nonlinear Gain by Regime

Nonlinear advantage relative to logistic:

| Regime | RF Gain | GB Gain |
|--------|--------|--------|
High | +0.045 |
Low | +0.016 |
Medium | −0.002 |

---

# 4. Interpretation

## 4.1 Nonlinear Structure Strongest in High-Volatility Regimes

The turbulent HMM regime exhibits the largest nonlinear gain (~4.5%).  
This suggests crisis-like market states contain stronger nonlinear directional structure.

Such regimes are characterized by:

- volatility clustering
- persistent directional moves
- trend cascades
- macro shocks

Tree ensembles can exploit these nonlinear interactions more effectively than linear models.

---

## 4.2 Moderate Nonlinear Structure in Calm Regimes

Low-volatility regimes show modest nonlinear improvement (~1.6%).  
Calm markets contain weaker but still present nonlinear micro-patterns.

---

## 4.3 Transitional Regimes Exhibit No Nonlinear Structure

The medium regime shows no nonlinear gain.  
This regime corresponds to unstable transitional states identified in Phase 6.

Directional dynamics in this regime appear dominated by noise rather than structure.

---

# 5. Key Findings

1. Nonlinear predictive structure is regime-dependent.
2. Strongest nonlinear interactions occur in turbulent regimes.
3. Calm regimes contain weaker nonlinear patterns.
4. Transitional regimes contain minimal exploitable structure.
5. Latent regimes meaningfully condition model performance.

---

# 6. Implications for Project

Results confirm that:

Predictability and nonlinear structure both vary systematically across latent market states.

This strengthens the regime-dependent predictability thesis and demonstrates that latent HMM regimes provide meaningful conditioning for nonlinear models.

---

# 7. Conclusion

Nonlinear ensemble models provide their largest advantage in turbulent HMM regimes, indicating that nonlinear directional structure is concentrated in crisis-like market states and largely absent in transitional regimes.

---

**Checkpoint:** Phase 7 complete
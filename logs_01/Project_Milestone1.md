# Project Milestone — Classical ML & Regime Modeling Complete

## Status

The project has reached a natural methodological milestone with the completion of classical machine learning modeling, latent regime analysis, and nonlinear evaluation for NIFTY 50 direction prediction.

This document summarizes the completed scope, empirical findings, and established limits prior to the next modeling phase.

---

# Scope Completed

## Data & Features
- Asset: NIFTY 50 index
- Frequency: Daily (2007–present)
- Features:
  - Lagged returns (1, 5, 10)
  - Moving-average ratios (5, 10, 20)
  - Volatility (20-day close-to-close)
  - Lagged volatility

Target: next-day direction (binary)

Validation: chronological split + walk-forward (earlier phases)

---

# Regime Modeling

Two regime definitions evaluated:

1. Volatility quantile regimes (terciles)
2. Hidden Markov Model (HMM) regimes

HMM specification:
- Inputs: return + volatility
- 3 latent states
- Persistent high-volatility regime identified
- Regime labels saved for downstream analysis

Key finding:
Latent regimes provide meaningful segmentation of market conditions and condition predictability strength.

---

# Models Evaluated

Linear:
- Logistic Regression

Tree ensembles:
- Random Forest
- Gradient Boosting (sklearn)
- XGBoost

Evaluations:
- Global accuracy
- Walk-forward stability
- Regime-conditioned accuracy
- Nonlinear gain by regime

---

# Empirical Findings

1. Direction predictability remains weak (~52–58%).
2. Predictability varies systematically across regimes.
3. High-volatility regimes are most predictable.
4. Nonlinear structure is strongest in turbulent regimes.
5. Transitional regimes show minimal structure.
6. Latent HMM regimes are persistent and interpretable.
7. Regime label provides little direct predictive value as a feature.
8. XGBoost does not materially outperform simpler models.
9. Logistic regression often matches or exceeds tree ensembles.

---

# Interpretation

Results indicate that NIFTY direction predictability is:

- weak
- regime-dependent
- partly nonlinear in crises
- unstable across time
- largely captured by linear structure

More complex tree ensembles do not provide consistent improvement, suggesting the classical tabular ML ceiling has been reached for this feature space.

---

# Methodological Conclusion

The project has established that:

Market regimes influence the strength of directional predictability but do not themselves provide independent predictive information once return and volatility dynamics are observed.

This supports a regime-conditional rather than regime-predictive view of market direction modeling.

---

# Phase Coverage

Completed phases:

- Baseline logistic modeling
- Volatility regime construction
- Walk-forward validation
- Volatility estimator comparison
- Nonlinear tree ensembles
- HMM latent regimes
- Nonlinear × regime interaction
- XGBoost benchmark

The classical ML and regime modeling arc is complete.

---

# Next Frontier (Future Work)

The next modeling axes identified:

1. Sequential models (LSTM / TFT)
2. Probabilistic forecasting (quantiles / distributions)
3. Cross-asset regime analysis (Indian ETFs)
4. Regime-aware signal filtering

These directions extend beyond static tabular ML into temporal and probabilistic modeling.

---

# Milestone Summary

The project has rigorously explored and largely exhausted classical tabular ML approaches for NIFTY direction prediction, establishing the limits of predictability and the role of latent regimes.

This milestone marks the completion of the classical modeling phase and a transition point toward sequence-based and probabilistic frameworks.

---

**Next phase:** Sequential or probabilistic regime-aware modeling
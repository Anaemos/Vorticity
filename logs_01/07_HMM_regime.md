# Phase 6 — Hidden Markov Regime Modeling

## Objective

Replace heuristic volatility quantile regimes with latent market regimes inferred via a Hidden Markov Model (HMM) and evaluate whether these regimes provide clearer conditioning for direction predictability.

Prior phases used volatility terciles as a proxy for market state. Phase 6 introduces a probabilistic regime model based on return volatility dynamics.

---

# 1. Methodology

## 1.1 Regime Variables

Latent regimes were inferred from contemporaneous:

- daily return
- close to close volatility

These variables capture both directional movement and market turbulence without using future information.

---

## 1.2 HMM Specification

A 3-state Gaussian Hidden Markov Model was fitted:

- n_components = 3
- full covariance
- EM estimation
- Markov state transitions

The model assumes each hidden state generates returns and volatility from a multivariate Gaussian distribution, with persistent transitions across time.

---

# 2. Learned Regimes

State means (volatility):

Low/Medium states: ≈ 0.125  
High state: ≈ 0.310  

Thus the HMM identified:

- one turbulent regime
- two calm sub regimes

This refines volatility quantiles by splitting calm markets into micro states.

---

# 3. Regime Persistence

Transition matrix showed:

High → High ≈ 0.98  
Low ↔ Medium ≈ high switching  

Thus turbulent regimes are persistent while calm regimes fluctuate.

This matches volatility clustering in financial markets.

---

# 4. Comparison vs Quantile Regimes

Cross-tabulation showed:

- Quantile High aligns strongly with HMM High
- Quantile Low/Medium split across HMM Low/Medium

Thus HMM refines calm regimes while preserving crisis identification.

---

# 5. Direction Predictability by HMM Regime

Accuracy:

High   ≈ 0.614  
Low    ≈ 0.563  
Medium ≈ 0.532  

Thus direction predictability is highest in turbulent regimes.

---

# 6. Interpretation

Higher directional predictability in high volatility regimes arises from:

- persistent directional moves
- volatility clustering
- crisis trend formation
- macro shock propagation

Calm markets exhibit smaller, noisier fluctuations with frequent sign reversals, reducing directional separability.

Thus turbulent regimes provide clearer directional structure despite higher risk.

---

# 7. Comparison vs Quantile Conditioning

Quantile regimes produced weaker separation:

High ≈ 0.564  
Low  ≈ 0.564  

HMM regimes increased crisis predictability to ≈0.614, indicating cleaner regime segmentation.

---

# 8. Key Findings

1. Latent HMM regimes capture persistent turbulent states.
2. Calm markets split into two micro regimes.
3. Direction predictability increases in turbulent regimes.
4. HMM regimes separate predictability more clearly than quantiles.
5. Predictability remains weak overall but regime-dependent.

---

# 9. Implications for Project

Results support a regime-conditional view of predictability:

Directional structure is strongest in turbulent market states and weakest in transitional regimes.

This demonstrates that latent regime modeling improves conditional analysis of market predictability.

---

# 10. Conclusion

Hidden Markov regimes provide more realistic market state segmentation than volatility quantiles and reveal stronger regime-dependent direction predictability, particularly in persistent high volatility periods.

---

**Checkpoint:** Phase 6 complete
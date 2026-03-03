# Phase 8 — Regime Dependent Probabilistic Return Forecasting

## Objective

Extend binary direction prediction to probabilistic forecasting by modeling the conditional return distribution and evaluating whether uncertainty structure varies across latent HMM regimes.

Previous phases established:

* Weak but persistent direction predictability (~55%)
* Stronger predictability in turbulent HMM regimes
* Concentration of nonlinear structure in crisis-like states

Phase 8 evaluates whether return distribution width and calibration are also regime-dependent.

---

## Methodology

### Target

Continuous next-day return:

```
target_ret = return_{t+1}
```

### Features

Identical to Phases 5–7:

* ret_lag_1, ret_lag_5, ret_lag_10
* ma_ratio_5, ma_ratio_10, ma_ratio_20
* vol_cc, vol_cc_lag_1

### Model

Gradient Boosting Regressor (Quantile loss):

* α = 0.10
* α = 0.50
* α = 0.90

This produces an 80% predictive interval:

```
[q10, q90]
```

### Evaluation Metrics

* Interval width: q90 − q10
* Coverage: fraction of returns within interval
* Mean return by regime
* Median prediction by regime

Chronological 80/20 split preserved.

---

## Results

| Regime | Mean Return | Width  | Coverage | Count |
| ------ | ----------- | ------ | -------- | ----- |
| High   | 0.0035      | 0.0271 | 0.795    | 44    |
| Low    | 0.0008      | 0.0182 | 0.815    | 428   |
| Medium | ~0.0000     | 0.0182 | 0.799    | 428   |

---

## Key Findings

1. Turbulent regime exhibits substantially wider predictive intervals.
2. Calm regimes show narrower return distributions.
3. Coverage remains near nominal 80% across all regimes.
4. Distributional differences across regimes are stronger than median return differences.
5. Regime dependence manifests primarily in uncertainty magnitude.

---

## Interpretation

Phase 8 confirms that regime-dependent structure in NIFTY returns extends beyond directional predictability to distributional uncertainty.

Turbulent HMM states are characterized by:

* Larger mean returns
* Wider conditional return distribution
* Preserved probabilistic calibration

This supports a regime-conditioned view of market dynamics where volatility clustering influences both direction structure and uncertainty magnitude.

---

## Conclusion

Return uncertainty is regime-dependent and systematically wider in turbulent market states. Probabilistic forecasting reveals structural differences not fully captured by binary classification.

---

**Checkpoint: Phase 8 complete**

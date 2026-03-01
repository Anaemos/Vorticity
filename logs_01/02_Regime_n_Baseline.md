# Phase 2 — Regime Aware Modeling

## Objective

Evaluate whether explicit volatility regime information improves next-day direction prediction for the NIFTY 50 beyond the baseline model using continuous volatility features.

This phase tests two hypotheses:

1. Adding categorical volatility regime as a predictor improves accuracy.
2. Separate models per regime outperform a single global model.

---

# 1. Baseline Reference

From Phase 1:

Overall test accuracy:

```
0.5478
```

Baseline predictors:

```
ret_lag_1, ret_lag_5, ret_lag_10
ma_ratio_5, ma_ratio_10, ma_ratio_20
volatility, vol_lag_1
```

Volatility regime used only for evaluation.

---

# 2. Regime as Predictor (Global Model)

## Method

Volatility regime (`Low`, `Medium`, `High`) encoded using one‑hot variables:

```
regime_Low
regime_Medium
regime_High
```

These were appended to scaled baseline features and logistic regression retrained.

## Result

```
Regime-feature accuracy: 0.5456
Baseline accuracy:       0.5478
```

## Interpretation

Adding regime category did not improve performance and slightly reduced accuracy.

This indicates that categorical regime information does not provide incremental predictive signal beyond continuous volatility magnitude already present in features (`volatility`, `vol_lag_1`).

---

# 3. Regime-Specific Models

## Method

Separate logistic regression models trained on each regime subset of training data and evaluated on matching regime subset of test data.

## Results

```
Low    : 0.5556  (n = 576)
Medium : 0.5311  (n = 241)
High   : 0.5422  (n = 83)
```

Baseline regime accuracies (Phase 1 reference):

```
Low    ≈ 0.545
Medium ≈ 0.539
High   ≈ 0.590  (small sample)
```

## Interpretation

* Low regime: slight improvement
* Medium regime: slight decrease
* High regime: lower and unstable due to small sample

No consistent advantage from regime-specific modeling.

---

# 4. Key Findings

1. Continuous volatility features already encode regime effects relevant to direction prediction.
2. Explicit regime categories do not add new predictive information.
3. Separate regime models do not materially outperform a global model.
4. Predictive structure appears largely shared across regimes for this feature set.

---

# 5. Implications for Project Thesis

Volatility regimes influence interpretability of predictability but do not necessarily enhance predictive performance when volatility magnitude is already modeled continuously.

This refines the project claim:

Regime awareness is analytically meaningful but not inherently predictive for next-day direction in NIFTY using standard technical features.

---

# 6. Phase 2 Conclusion

Regime-aware modeling experiments do not improve upon the Phase 1 baseline. The baseline global logistic regression with continuous volatility features remains the most effective configuration among tested models.

Phase 2 therefore establishes that regime information is largely redundant with volatility magnitude for this prediction task.



**Checkpoint:** Regime+Baseline complete

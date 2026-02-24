# Phase 4 — Volatility Estimator Comparison

## Objective

Evaluate whether range-based volatility estimators (Parkinson and Garman–Klass) improve volatility regime definition and next‑day direction prediction performance compared to standard close‑to‑close volatility for the NIFTY 50.

Prior phases established a baseline model and regime framework using close to close volatility. Phase 4 tests whether theoretically more efficient estimators materially change predictive outcomes.

---

# 1. Volatility Estimators Implemented

Three annualized 20 day volatility measures were computed:

**Close to Close (CC)**
Rolling standard deviation of log returns.

**Parkinson (PK)**
Range‑based estimator using daily High–Low information:

σ²ₚ = (ln(H/L))² / (4 ln 2)

**Garman–Klass (GK)**
OHLC‑based estimator incorporating range and open–close drift:

σ²_gk = 0.5(ln(H/L))² − (2ln2 − 1)(ln(C/O))²

Multi‑day volatility obtained via rolling mean of daily variance followed by square root and annualization.

---

# 2. Empirical Properties on NIFTY

Summary statistics:

* CC mean ≈ 0.173
* PK mean ≈ 0.148
* GK mean ≈ 0.145

Correlations:

* PK–GK ≈ 0.995
* CC–PK ≈ 0.947
* CC–GK ≈ 0.925

Interpretation:

* All estimators strongly correlated
* Range‑based estimators smoother and lower on average
* Close‑to‑close captures additional gap volatility not present in PK/GK

This indicates overnight gaps contribute materially to NIFTY volatility.

---

# 3. Regime Construction

Each estimator independently partitioned into tercile regimes:

Low / Medium / High

Resulting regime distributions in test period:

* CC High: 83 days
* PK High: 20 days
* GK High: 25 days

Range‑based estimators classify substantially fewer days as high volatility.

---

# 4. Predictive Comparison

Baseline logistic model rerun under each regime system with matching volatility features.

Overall accuracy:

* CC: 0.544
* PK: 0.541
* GK: 0.542

Differences are negligible (<0.3%).

---

# 5. Regime‑Conditioned Accuracy

**Close‑to‑Close**

* Low: 0.545
* Medium: 0.527
* High: 0.590

**Parkinson**

* Low: 0.550
* Medium: 0.520
* High: 0.700 (n = 20)

**Garman–Klass**

* Low: 0.552
* Medium: 0.520
* High: 0.680 (n = 25)

Interpretation:

* PK/GK high‑regime accuracy inflated by very small samples
* No reliable improvement vs CC regimes
* Regime ordering otherwise similar

---

# 6. Key Findings

1. Close‑to‑close volatility is slightly higher due to inclusion of overnight gaps.
2. Range‑based estimators label fewer extreme volatility periods.
3. Regime redistribution does not materially change predictive performance.
4. Direction predictability in NIFTY appears insensitive to volatility estimator choice.

---

# 7. Market Structure Insight

Results indicate that for index‑level NIFTY data:

Overnight gap volatility dominates intraday range volatility.

Thus close‑to‑close volatility already captures most predictive regime variation.

---

# 8. Phase 4 Conclusion

Range‑based volatility estimators (Parkinson and Garman–Klass) do not improve next‑day direction prediction or regime discrimination relative to close‑to‑close volatility for the NIFTY 50.

The simpler close‑to‑close measure remains adequate for regime modeling in this context.

---

# 9. Implications for Project

Phase 4 demonstrates that theoretical improvements in volatility estimation do not necessarily translate into predictive gains in index‑level direction models.

This validates the baseline volatility choice and supports proceeding to model‑class improvements.



**Checkpoint:** Phase 4 complete

# Phase 11 — Distribution Structure Analysis

## Objective

This phase examines how the **distributional structure of daily returns changes across volatility regimes** identified by the Hidden Markov Model.

While previous phases analyzed regime transitions and persistence, this phase focuses on how risk manifests in the **shape of the return distribution**, including:

- skewness
- kurtosis
- extreme event frequency
- quantile spread
- regime conditioned Value at Risk

The goal is to understand how turbulent regimes alter not only volatility but the **entire probabilistic structure of returns**.

---

## Methodology

### Data Preparation

The NIFTY 50 dataset was rebuilt from the raw source and merged with the HMM regime labels produced in earlier phases.

The analysis focuses on daily log returns conditioned on the three inferred regimes:

Low, Medium, and High volatility states.

---

## Distribution Statistics

Basic distribution statistics were computed for each regime:

| Regime | Mean | Std | Skew | Kurtosis |
|------|------|------|------|------|
| High | 0.00054 | 0.0214 | 0.037 | 6.83 |
| Low | -0.00011 | 0.00815 | -0.178 | 0.81 |
| Medium | 0.00086 | 0.00813 | -0.049 | 0.73 |

### Interpretation

High-volatility regimes exhibit extremely **fat tailed return distributions**, indicating that extreme market movements occur far more frequently during turbulent periods.

Skewness remains near zero in turbulent regimes, suggesting that turbulence expands both upside and downside tails symmetrically.

Calm regimes display mild negative skew, reflecting the tendency for equity markets to experience occasional sharp declines even during stable periods.

---

## Extreme Event Frequency

Extreme events were defined as daily returns exceeding two standard deviations.

The probability of extreme returns by regime:

| Regime | Extreme Probability |
|------|------|
| High | 0.1668 |
| Low | 0.0054 |
| Medium | 0.0042 |

This shows that extreme price movements occur **over thirty times more frequently in turbulent regimes**.

---

## Tail Asymmetry

Downside and upside extreme events were measured separately.

Results show that turbulent regimes increase the probability of both large gains and losses, reinforcing the interpretation that volatility regimes represent **uncertainty expansion rather than directional bias**.

---

## Quantile Spread

Return quantiles were computed to measure distribution width.

| Regime | q10 | q50 | q90 | Width |
|------|------|------|------|------|
| High | -0.0233 | 0.0010 | 0.0230 | 0.0462 |
| Low | -0.0104 | 0.0001 | 0.0097 | 0.0201 |
| Medium | -0.0093 | 0.0010 | 0.0105 | 0.0198 |

The High regime exhibits a distribution width more than **twice as large** as calm regimes.

---

## Regime-Conditioned Value at Risk

Downside risk was measured using 1% and 5% Value at Risk.

| Regime | 1% VaR | 5% VaR |
|------|------|------|
| High | -5.86% | -3.37% |
| Low | -2.20% | -1.42% |
| Medium | -1.97% | -1.30% |

This indicates that severe downside risk is **more than doubled during turbulent regimes**.

---

## Key Findings

1. Turbulent regimes exhibit significantly **fat tailed return distributions**.
2. Extreme events occur dramatically more often during high-volatility states.
3. Volatility regimes affect not only variance but the **entire shape of the return distribution**.
4. Turbulence expands both tails of the distribution while increasing downside risk magnitude.

---

## Conclusion

This phase demonstrates that volatility regimes fundamentally alter the probabilistic structure of market returns.

Rather than merely increasing variance, turbulent regimes produce **fat tailed distributions with significantly higher extreme risk**, reinforcing the importance of regime aware probabilistic modeling in financial markets.
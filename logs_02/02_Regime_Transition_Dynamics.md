# Phase 10 — Regime Transition Dynamics

## Objective

This phase investigates the **transition dynamics between volatility regimes** in the NIFTY 50 index using the previously fitted Hidden Markov Model (HMM).

Earlier phases identified latent regimes and analyzed predictability and risk within those regimes. This phase focuses on **how regimes evolve over time**, specifically:

- How persistent each regime is
- How markets enter turbulent regimes
- How markets exit turbulent regimes
- Whether early warning signals appear before regime transitions

Understanding these dynamics helps characterize the market as a **regime-switching stochastic system** rather than a stationary process.

---

## Methodology

### HMM Refit

The Gaussian Hidden Markov Model was refit on the NIFTY 50 dataset to ensure consistency and reproducibility for transition analysis.

Input variables used for the model:

- Daily log returns
- Close to close volatility (20 day rolling)

The model was configured with three latent states.

After fitting, the states were mapped to interpretable regimes based on **average volatility levels**:

| State | Regime Interpretation |
|------|------------------------|
| Low Volatility | Calm market conditions |
| Medium Volatility | Transitional / unstable conditions |
| High Volatility | Turbulent market regime |

---

## Transition Matrix Analysis

An empirical transition matrix was computed to measure the probability of moving from one regime to another.

Key observations:

- **High volatility regimes show strong persistence**, confirming volatility clustering.
- **Low volatility regimes are also highly persistent**, reflecting long calm periods.
- **Medium regimes appear unstable**, frequently transitioning to either Low or High states.

This suggests that the Medium regime functions as a **transition buffer** between calm and turbulent markets.

---

## Crisis Entry Analysis

Transitions into the High volatility regime were analyzed.

Observed pathways:

- Medium → High  
- Low → High

Results:

- Direct Low → High transitions were extremely rare.
- Most crisis entries followed the pattern:

  Low → Medium → High

Interpretation:

Financial crises typically emerge from **periods of instability**, not directly from calm markets.

---

## Pre-Transition Behavior

Market behavior was analyzed in the days preceding regime switches.

Metrics examined:

- Average volatility
- Average returns
- HMM state probability entropy

Findings:

- Volatility changes before transitions were not consistently gradual.
- However, **HMM entropy increased before regime switches**, indicating growing uncertainty in regime classification.

Interpretation:

When the market begins shifting between volatility structures, the model becomes less confident in assigning a single regime.

This entropy increase acts as a potential **early warning signal for regime transitions**.

---

## Crisis Exit Dynamics

Transitions out of the High-volatility regime were also analyzed.

Observed exit pathways:

- High → Medium
- High → Low

Both occurred with similar frequency in the dataset.

Interpretation:

Crisis regimes can end through two mechanisms:

1. **Gradual stabilization**  
   High → Medium → Low

2. **Direct normalization**  
   High → Low

Volatility was found to remain elevated in the days preceding regime exits, reflecting the persistence of turbulent market conditions.

---

## Key Findings

### Regime Persistence

Both calm and turbulent regimes show strong persistence, supporting the widely observed phenomenon of **volatility clustering**.

---

### Ladder Transition Structure

Most transitions follow a structured ladder pattern:

Low → Medium → High  
High → Medium → Low

Direct transitions between extreme regimes are uncommon.

---

### Crisis Emergence

Market turbulence generally emerges from unstable periods rather than from calm states.

---

### Model Uncertainty Before Regime Shifts

Entropy analysis shows that the model becomes less certain about regime classification before transitions, suggesting that **structural instability precedes regime changes**.

---

### Crisis Exit Behavior

Turbulent regimes may resolve either gradually or abruptly, but volatility typically remains elevated before normalization occurs.

---

## Conclusion

This phase demonstrates that financial markets behave as **regime switching systems with structured transition dynamics**.

Risk is not evenly distributed across time. Instead, it concentrates around regime transitions, particularly when entering turbulent states.

These findings strengthen the interpretation of financial markets as **non stationary systems characterized by persistent volatility regimes and structured regime evolution**.

---

## Next Phase

Phase 11 will deepen the probabilistic framework by examining the **distributional structure of returns across regimes**, focusing on:

- skewness
- tail asymmetry
- extreme return frequency
- downside vs upside tail behavior

This analysis will enhance the project's focus on **risk aware probabilistic modeling rather than directional prediction**.
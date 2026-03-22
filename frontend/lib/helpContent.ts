// All help content lives here.
// Used in two places:
//   1. Tooltip on dashboard card labels (uses `summary` only)
//   2. Full page at /help/[term] (uses everything)

export interface HelpTerm {
  slug: string
  title: string
  group: 'basics' | 'risk' | 'ml'
  summary: string       // 1–2 sentences — shown in tooltip
  detail: string        // 3–6 sentences — shown on help page
  example: string       // concrete real-world example
  seeAlso: string[]     // other slugs
}

export const HELP_CONTENT: HelpTerm[] = [
  // GROUP 1: BASICS
  {
    slug: 'regime',
    group: 'basics',
    title: 'Volatility Regime',
    summary: 'A label describing the current market conditions for a stock — Low, Medium, or High volatility.',
    detail: `Every stock goes through periods of calm and turbulence. A regime captures which state the stock is currently in, based on how wildly its price has been moving recently. Low means the stock has been quiet and predictable. Medium is normal market activity. High means the stock is in a turbulent, high-risk period — large swings up or down. Regimes are detected automatically using a statistical model (HMM) that learns each stock's own historical behaviour pattern.`,
    example: `During the COVID crash of March 2020, almost every Indian stock entered a High regime. By mid-2021, most had settled back into Low or Medium. TATASTEEL spends more time in High regime than HDFC Bank because metals are inherently more volatile than banking.`,
    seeAlso: ['stability', 'hmm', 'transition-risk'],
  },
  {
    slug: 'stability',
    group: 'basics',
    title: 'Regime Stability',
    summary: 'How confident the model is that the current regime will persist. Stable means it is likely to stay. Unstable means a regime change may be near.',
    detail: `Stability is derived from entropy — a measure of how uncertain the model is about which regime the stock is in. When entropy is low, the model is confident: the stock is clearly in one regime and likely to stay there. When entropy is high, the stock's recent behaviour fits multiple regimes, signalling potential transition. Stable, Uncertain, and Unstable correspond to low, medium, and high entropy relative to that stock's historical average.`,
    example: `A stock with Stable + Low regime is in a clearly calm period — a good time to assess baseline risk. A stock with Unstable + Medium regime is a warning signal: it may be about to enter High volatility.`,
    seeAlso: ['entropy', 'regime', 'transition-risk'],
  },
  {
    slug: 'transition-risk',
    group: 'basics',
    title: 'Transition Risk',
    summary: 'The probability (%) that this stock will enter a High-volatility regime within 1, 3, or 5 trading days.',
    detail: `This is the core forecast of the system. A deep learning model (TFT) analyses the last 30 days of price behaviour and outputs a probability that the stock will enter its High regime soon. The 1-day probability is the most accurate (AUC ~0.97). The 5-day probability is less precise but still meaningful (AUC ~0.87). A reading of 4% means the model thinks there is a 4-in-100 chance of a High-regime transition within that window — not a certainty, but a signal worth monitoring.`,
    example: `If ICICI Bank shows 1d: 1.2%, 3d: 3.4%, 5d: 8.1%, it means near-term risk is low but rising over the week. Compare this with TATASTEEL at 1d: 6.8%, 3d: 14.2%, 5d: 19.5% — a very different risk profile even if both are currently in Medium regime.`,
    seeAlso: ['empirical-high', 'tft', 'regime'],
  },
  {
    slug: 'empirical-high',
    group: 'basics',
    title: 'Empirical High Probability',
    summary: 'The historical frequency of transitioning to High regime from the current regime — what the data shows has happened in the past, not a model forecast.',
    detail: `This is a simple historical count, not a model output. It answers: "Looking at all the days this stock was in its current regime, what fraction of the time did it move to High regime the next day?" It is a complement to the TFT forecast — the TFT uses recent patterns to predict the current situation, while empirical probability provides the long-run base rate. Together they give a fuller picture.`,
    example: `If SBIN has an empirical High probability of 0.6%, it means historically only 6 in every 1000 days in its current regime led to a High-regime day next. If the TFT's 1d risk is 4%, it is predicting something higher than the historical norm — worth paying attention to.`,
    seeAlso: ['transition-risk', 'transition-matrix', 'regime'],
  },

  // GROUP 2: RISK NUMBERS
  {
    slug: 'var',
    group: 'risk',
    title: 'Value at Risk (VaR)',
    summary: 'The worst expected daily loss at a given confidence level. VaR 1% of −4.1% means on the worst 1% of days, you could lose more than 4.1% in a single day.',
    detail: `VaR is a standard risk measure used in finance. VaR 1% means: in the worst 1 out of every 100 trading days, losses exceeded this value. VaR 5% is less extreme — the worst 5 in every 100 days. Both values are shown per regime, so you can directly compare how much worse High-regime days are versus Low-regime days for the same stock. A negative sign means a loss. A VaR of −2.7% at the 5% level means there is a 5% chance of losing more than 2.7% on any given day.`,
    example: `TATASTEEL in High regime might show VaR 1% of −5.8%. The same stock in Low regime might show −1.9%. This quantifies exactly how much riskier the High regime is in practical terms.`,
    seeAlso: ['return-range', 'regime'],
  },
  {
    slug: 'return-range',
    group: 'risk',
    title: 'Return Range (Q10 / Q50 / Q90)',
    summary: 'The typical daily return distribution in the current regime. Q10 is the bad days, Q50 is the median day, Q90 is the good days.',
    detail: `Quantiles describe the spread of typical daily returns for this stock in its current regime. Q10 (10th percentile) means 90% of days had returns above this — it represents a bad but not extreme day. Q50 is the median — the middling typical day. Q90 represents a good day where only 10% of days were better. Together they give you the realistic range of what to expect from this stock right now, not just in a crisis.`,
    example: `INFY in Medium regime with Q10: −1.1%, Q50: +0.04%, Q90: +1.2% tells you a typical day is essentially flat, a bad day loses about 1%, and a good day gains about 1.2%. This is a normal, symmetric distribution.`,
    seeAlso: ['var', 'regime'],
  },
  {
    slug: 'entropy',
    group: 'risk',
    title: 'Entropy',
    summary: 'A measure of how certain the model is about the current regime. Low entropy means high confidence. Rising entropy is an early warning of regime change.',
    detail: `Entropy comes from information theory. In this system, it measures how spread out the model's probability is across the three regimes. If the model is 97% sure the stock is in Low regime, entropy is very low — near zero. If it is 40% Low, 35% Medium, 25% High, entropy is high — the model is uncertain. From the project's calibration: a typical baseline is around 0.25. When entropy rises toward 0.32 or above, a regime transition is historically more likely to follow soon.`,
    example: `HDFC Bank with entropy 0.0158 is in a clearly defined regime with very high model confidence. If you saw it at 0.38 tomorrow, that would be a meaningful early warning signal despite the regime label not having changed yet.`,
    seeAlso: ['stability', 'regime', 'hmm'],
  },

  // GROUP 3: ML CONCEPTS
  {
    slug: 'hmm',
    group: 'ml',
    title: 'Hidden Markov Model (HMM)',
    summary: 'The statistical model that detects which volatility regime a stock is in. It is trained once per stock and never changed — only used to label new data.',
    detail: `An HMM is a model that assumes a system switches between hidden states (regimes) over time, and each state produces observable data (daily returns and volatility) with a characteristic pattern. For each stock, an HMM is trained on its entire price history and learns to distinguish Low, Medium, and High volatility periods based on the statistical fingerprint of each. Once trained, it is frozen — the pipeline simply applies it to new daily data to get a regime label and confidence score (entropy). Each stock has its own HMM because each stock has its own volatility personality.`,
    example: `TATASTEEL's HMM learned that its High regime has a return standard deviation 4× larger than its Low regime. HDFCBANK's High regime is less dramatic. Using a shared model for both would misrepresent both stocks.`,
    seeAlso: ['regime', 'entropy', 'tft'],
  },
  {
    slug: 'tft',
    group: 'ml',
    title: 'Temporal Fusion Transformer (TFT)',
    summary: 'The deep learning model that forecasts transition risk. It reads 30 days of price features and outputs the probability of entering High regime in 1, 3, or 5 days.',
    detail: `A TFT is a type of neural network designed specifically for time series forecasting. It uses an attention mechanism to decide which past days are most relevant for the current prediction. Each stock has three TFT models — one for each forecast horizon (1d, 3d, 5d). They were trained on the stock's full price history using the HMM regime labels as targets. Like the HMM, they are frozen after training — the pipeline runs inference only, never retraining. The output is a sigmoid probability: 0 = no risk, 1 = certain transition, but in practice values stay in the range of 0.003 to 0.20 for most stocks most of the time.`,
    example: `The 1-day TFT model for ICICIBANK achieves an AUC of ~0.97, meaning it correctly ranks risky days above safe days 97% of the time. The 5-day model is ~0.87 — still informative but less precise, since markets are harder to predict further out.`,
    seeAlso: ['transition-risk', 'hmm', 'regime'],
  },
  {
    slug: 'transition-matrix',
    group: 'ml',
    title: 'Transition Matrix',
    summary: 'A table showing the historical probability of moving from one regime to another. Each row is the current regime, each column is the next day\'s regime.',
    detail: `The transition matrix is a 3×3 table computed from the stock's full regime history. Each cell shows: given that today is in regime X, what is the probability that tomorrow is in regime Y? The diagonal (Low→Low, Medium→Medium, High→High) is typically very high (0.95–0.98) because regimes tend to persist. The off-diagonal cells are small but important — they tell you how often each regime transitions to each other. This is a purely historical measure, unlike the TFT forecast which uses current conditions.`,
    example: `For HDFCBANK: Low→High is 0.07% historically — almost never happens directly. High→Low is also nearly zero (0%). Once in High, it almost always stays High the next day (97.7%) before gradually returning through Medium. This stickiness is why even small transition risk probabilities from the TFT are worth taking seriously.`,
    seeAlso: ['regime', 'empirical-high', 'tft'],
  },
]

// Lookup by slug
export function getHelpTerm(slug: string): HelpTerm | undefined {
  return HELP_CONTENT.find(t => t.slug === slug)
}

// All slugs - used to generate static routes
export const HELP_SLUGS = HELP_CONTENT.map(t => t.slug)

// Group labels for the help index page
export const GROUP_LABELS: Record<HelpTerm['group'], string> = {
  basics: 'What you see on every card',
  risk:   'Risk numbers explained',
  ml:     'The models behind the data',
}
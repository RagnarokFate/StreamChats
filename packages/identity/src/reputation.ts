export interface ReputationWeights {
  messages: number;
  gifts: number;
  watchTime: number;
  modActions: number;
  spamFlags: number;
}

export const DEFAULT_REPUTATION_WEIGHTS: ReputationWeights = {
  messages: 0.01,
  gifts: 0.5,
  watchTime: 0.005, // per minute
  modActions: -2.0, // negative weight for timeouts/bans
  spamFlags: -1.0,  // negative weight for shadow suppressed messages
};

export class ReputationCalculator {
  private weights: ReputationWeights;

  constructor(weights: Partial<ReputationWeights> = {}) {
    this.weights = { ...DEFAULT_REPUTATION_WEIGHTS, ...weights };
  }

  public updateWeights(newWeights: Partial<ReputationWeights>) {
    this.weights = { ...this.weights, ...newWeights };
  }

  public getWeights(): ReputationWeights {
    return this.weights;
  }

  /**
   * Computes the new reputation score given historical statistics.
   * A base score is 1.0. Score can drop below 0 but practically clamped to 0.
   */
  public calculateScore(
    baseScore: number,
    stats: { messages: number; gifts: number; watchTimeMins: number; modActions: number; spamFlags: number }
  ): number {
    let score = baseScore;
    score += stats.messages * this.weights.messages;
    score += stats.gifts * this.weights.gifts;
    score += stats.watchTimeMins * this.weights.watchTime;
    score += stats.modActions * this.weights.modActions;
    score += stats.spamFlags * this.weights.spamFlags;

    return Math.max(0, score);
  }
}

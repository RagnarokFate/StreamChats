import { PlatformAccount } from './index';
import { Platform } from '@obs-chat/event-schema';

export interface IdentitySuggestion {
  sourceAccount: PlatformAccount;
  targetAccount: PlatformAccount;
  confidence: number;
}

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + indicator // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Finds likely account matches based on username similarity.
 */
export function generateSuggestions(
  unlinkedAccounts: PlatformAccount[],
  threshold: number = 0.8
): IdentitySuggestion[] {
  const suggestions: IdentitySuggestion[] = [];

  for (let i = 0; i < unlinkedAccounts.length; i++) {
    for (let j = i + 1; j < unlinkedAccounts.length; j++) {
      const acc1 = unlinkedAccounts[i];
      const acc2 = unlinkedAccounts[j];

      if (acc1.platform === acc2.platform) continue;

      const name1 = acc1.platformUsername.toLowerCase();
      const name2 = acc2.platformUsername.toLowerCase();

      const distance = levenshteinDistance(name1, name2);
      const maxLen = Math.max(name1.length, name2.length);
      const similarity = 1 - distance / maxLen;

      if (similarity >= threshold) {
        suggestions.push({
          sourceAccount: acc1,
          targetAccount: acc2,
          confidence: similarity
        });
      }
    }
  }

  // Sort by confidence descending
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

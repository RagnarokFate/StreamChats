export interface ModerationOptions {
  bannedWords: string[];
  bannedWordAction: 'drop' | 'mask';
  maskCharacter?: string;
  spamProtectionEnabled?: boolean;
  maxMessageHistory?: number;
}

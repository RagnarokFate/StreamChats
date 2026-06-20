export interface ModerationOptions {
  bannedWords: string[];
  bannedWordAction: 'drop' | 'mask' | 'flag';
  maskCharacter?: string;
  spamProtectionEnabled?: boolean;
  maxMessageHistory?: number;
}

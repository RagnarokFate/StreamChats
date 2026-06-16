import { ChatEvent, TextFragment } from '@obs-chat/event-schema';
import { ModerationOptions } from '../types';

export function applyFilters(event: ChatEvent, options: ModerationOptions): ChatEvent | null {
  if (!options.bannedWords || options.bannedWords.length === 0) {
    return event;
  }

  const maskChar = options.maskCharacter ?? '*';
  let containsBannedWord = false;

  // Build regex for banned words, escaping them safely
  const escapedWords = options.bannedWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');

  if (pattern.test(event.message.text)) {
    containsBannedWord = true;
    if (options.bannedWordAction === 'drop') {
      return null; // Drop the message entirely
    }
  }

  if (containsBannedWord && options.bannedWordAction === 'mask') {
    // Reset regex index before replace
    pattern.lastIndex = 0;
    const newText = event.message.text.replace(pattern, (match) => maskChar.repeat(match.length));
    
    // Also mask fragments
    const newFragments = event.message.fragments?.map(frag => {
      if (frag.type === 'text') {
        pattern.lastIndex = 0;
        return {
          ...frag,
          text: frag.text.replace(pattern, (match) => maskChar.repeat(match.length))
        } as TextFragment;
      }
      return frag;
    });

    return {
      ...event,
      message: {
        ...event.message,
        text: newText,
        fragments: newFragments,
      }
    };
  }

  return event;
}

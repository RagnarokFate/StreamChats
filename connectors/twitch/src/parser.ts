import { ChatEvent, MessageFragment } from '@obs-chat/event-schema';
import crypto from 'crypto';

export interface TwitchIRCMessage {
  tags: Map<string, string>;
  source: string | null;
  command: string;
  parameters: string;
}

export function parseIRCMessage(message: string): TwitchIRCMessage | null {
  const parsedMessage: TwitchIRCMessage = {
    tags: new Map(),
    source: null,
    command: '',
    parameters: ''
  };

  let idx = 0;
  let rawTagsComponent: string | null = null;
  let rawSourceComponent: string | null = null; 
  let rawCommandComponent: string | null = null;
  let rawParametersComponent: string | null = null;

  if (message[idx] === '@') {
    const endIdx = message.indexOf(' ');
    if (endIdx === -1) return null;
    rawTagsComponent = message.slice(1, endIdx);
    idx = endIdx + 1;
  }

  if (message[idx] === ':') {
    const endIdx = message.indexOf(' ', idx);
    if (endIdx === -1) return null;
    rawSourceComponent = message.slice(idx + 1, endIdx);
    idx = endIdx + 1;
  }

  let endIdx = message.indexOf(':', idx);
  if (endIdx === -1) {
    endIdx = message.length;
  }

  rawCommandComponent = message.slice(idx, endIdx).trim();

  if (endIdx !== message.length) {
    idx = endIdx + 1;
    rawParametersComponent = message.slice(idx);
  }

  parsedMessage.command = rawCommandComponent;
  parsedMessage.source = rawSourceComponent;
  parsedMessage.parameters = rawParametersComponent || '';

  if (rawTagsComponent) {
    const tagsToParse = rawTagsComponent.split(';');
    for (const tag of tagsToParse) {
      const [key, value] = tag.split('=');
      parsedMessage.tags.set(key, value || '');
    }
  }

  return parsedMessage;
}

export function normalizeChatEvent(ircMessage: TwitchIRCMessage): ChatEvent | null {
  const commandParts = ircMessage.command.split(' ');
  if (commandParts[0] !== 'PRIVMSG') {
    return null;
  }
  
  const text = ircMessage.parameters.trim();
  const tags = ircMessage.tags;
  
  const authorName = tags.get('display-name') || ircMessage.source?.split('!')[0] || 'Unknown';
  const authorId = tags.get('user-id') || '0';
  const color = tags.get('color') || undefined;
  
  const badgesRaw = tags.get('badges');
  const badges = badgesRaw ? badgesRaw.split(',') : [];

  const fragments: MessageFragment[] = [];
  
  const emotesRaw = tags.get('emotes');
  const emotePositions: { id: string, start: number, end: number }[] = [];
  
  if (emotesRaw) {
    const emotes = emotesRaw.split('/');
    for (const emote of emotes) {
      const [id, positions] = emote.split(':');
      if (!positions) continue;
      const posList = positions.split(',');
      for (const pos of posList) {
        const [start, end] = pos.split('-');
        emotePositions.push({ id, start: parseInt(start, 10), end: parseInt(end, 10) });
      }
    }
  }
  
  emotePositions.sort((a, b) => a.start - b.start);
  
  let currentIdx = 0;
  for (const emote of emotePositions) {
    if (emote.start > currentIdx) {
      fragments.push({
        type: 'text',
        text: text.slice(currentIdx, emote.start)
      });
    }
    
    // Safety check: ensure slicing is valid
    const altText = emote.end + 1 <= text.length ? text.slice(emote.start, emote.end + 1) : '';
    
    fragments.push({
      type: 'emote',
      id: emote.id,
      url: `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/default/dark/1.0`,
      alt: altText
    });
    currentIdx = emote.end + 1;
  }
  
  if (currentIdx < text.length) {
    fragments.push({
      type: 'text',
      text: text.slice(currentIdx)
    });
  }

  const sentTs = tags.get('tmi-sent-ts');
  const timestamp = sentTs ? new Date(parseInt(sentTs, 10)).toISOString() : new Date().toISOString();
  
  // We need a proper UUID here. `tags.get('id')` is often a UUID from twitch, but let's ensure it is one
  // Zod requires a strict UUID format. So we just generate a fresh one if twitch's id is not compliant, 
  // but it usually is. For safety, we'll just generate one to guarantee valid ChatEvent.
  const eventId = crypto.randomUUID();

  return {
    eventId,
    platform: 'twitch',
    timestamp,
    type: 'chat',
    author: {
      id: authorId,
      name: authorName,
      color,
      badges
    },
    message: {
      text,
      fragments: fragments.length > 0 ? fragments : [{ type: 'text', text }]
    }
  };
}

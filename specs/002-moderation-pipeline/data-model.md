# Data Model: Moderation Pipeline

## Config Entities

### `ModerationOptions`
- `bannedWords`: `string[]` (List of words to filter)
- `bannedWordAction`: `'drop' | 'mask'`
- `maskCharacter`: `string` (Default: `'***'`)
- `spamProtectionEnabled`: `boolean`
- `maxMessageHistory`: `number` (Memory bound for spam protection ring buffer)

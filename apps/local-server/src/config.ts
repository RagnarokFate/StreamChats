import fs from 'fs';
import path from 'path';
import { ServerConfig, ServerConfigSchema } from '@obs-chat/event-schema';
import { logger } from './utils/logger';

const CONFIG_DIR = path.resolve(process.cwd(), 'config');
const CONFIG_FILE = path.join(CONFIG_DIR, 'server-settings.json');

const DEFAULT_CONFIG: ServerConfig = {
  bannedWords: ['spam', 'troll', 'bot'],
  bannedWordAction: 'mask',
  maskCharacter: '*',
  spamProtectionEnabled: true,
};

let currentConfig: ServerConfig = { ...DEFAULT_CONFIG };

export function loadConfig(): ServerConfig {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  if (!fs.existsSync(CONFIG_FILE)) {
    logger.info('No server-settings.json found, creating with defaults.');
    saveConfig(DEFAULT_CONFIG);
    return currentConfig;
  }

  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    const result = ServerConfigSchema.safeParse(parsed);
    
    if (result.success) {
      currentConfig = result.data;
      // Removed log here to prevent interval spam, though loadConfig is now only called at boot and on update
      logger.info('Server config loaded successfully.');
    } else {
      logger.error('Invalid server-settings.json schema, using defaults.', result.error.format());
      currentConfig = { ...DEFAULT_CONFIG };
    }
  } catch (err) {
    logger.error('Failed to read server-settings.json, using defaults.', err);
    currentConfig = { ...DEFAULT_CONFIG };
  }
  
  return currentConfig;
}

export function saveConfig(newConfig: ServerConfig): void {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    
    // Validate before saving
    const validConfig = ServerConfigSchema.parse(newConfig);
    const data = JSON.stringify(validConfig, null, 2);
    
    // Atomic write: write to temp file, then rename
    const tmpFile = `${CONFIG_FILE}.tmp`;
    fs.writeFileSync(tmpFile, data, 'utf-8');
    fs.renameSync(tmpFile, CONFIG_FILE);
    
    currentConfig = validConfig;
    logger.info('Server config saved successfully.');
  } catch (err) {
    logger.error('Failed to save server-settings.json', err);
    throw err;
  }
}

export function getConfig(): ServerConfig {
  return currentConfig;
}

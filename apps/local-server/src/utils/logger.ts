import fs from 'fs';
import path from 'path';

const LOG_DIR = path.resolve(process.cwd(), 'logs');
const APP_LOG_FILE = path.join(LOG_DIR, 'app.log');
const CHAT_LOG_FILE = path.join(LOG_DIR, 'chat.json');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export const logger = {
  info: (msg: string, ...args: any[]) => {
    const ts = new Date().toISOString();
    const argsStr = args.length ? ' ' + JSON.stringify(args) : '';
    const formatted = `[INFO] ${ts} - ${msg}${argsStr}\n`;
    console.log(`[App] ${msg}`);
    fs.appendFileSync(APP_LOG_FILE, formatted);
  },
  error: (msg: string, ...args: any[]) => {
    const ts = new Date().toISOString();
    const argsStr = args.length ? ' ' + JSON.stringify(args) : '';
    const formatted = `[ERROR] ${ts} - ${msg}${argsStr}\n`;
    console.error(`[App ERROR] ${msg}`, ...args);
    fs.appendFileSync(APP_LOG_FILE, formatted);
  }
};

export const chatLogger = {
  logMessage: (chatEvent: any) => {
    try {
      let data: any[] = [];
      if (fs.existsSync(CHAT_LOG_FILE)) {
        try {
          data = JSON.parse(fs.readFileSync(CHAT_LOG_FILE, 'utf-8'));
        } catch (e) {
          // Ignore invalid JSON, start fresh
        }
      }
      
      if (!Array.isArray(data)) {
        data = [];
      }
      
      data.push({
        timestamp: chatEvent.timestamp,
        platform: chatEvent.platform,
        author: chatEvent.author.name,
        message: chatEvent.message.text
      });
      
      if (data.length > 100) {
        data = data.slice(data.length - 100);
      }
      
      fs.writeFileSync(CHAT_LOG_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      logger.error('Failed to write to chat.json', err);
    }
  }
};

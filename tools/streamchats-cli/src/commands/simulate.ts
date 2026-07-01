import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import { PluginSandbox } from '@obs-chat/plugin-sdk/dist/sandbox';
import { parseManifest } from '@obs-chat/plugin-sdk/dist/manifest';
import { EventBus } from '@obs-chat/event-bus';
import * as readline from 'readline';

export const simulateCommand = new Command('simulate')
  .description('Simulate a plugin environment locally')
  .argument('<path>', 'Path to the plugin directory (e.g., ./plugins/my-plugin)')
  .option('-r, --rate <number>', 'Rate of synthetic chat messages per second (automated mode)', parseFloat)
  .option('-c, --count <number>', 'Total number of messages to generate (automated mode)', parseInt)
  .action(async (pluginPathArg: string, options: { rate?: number; count?: number }) => {
    const pluginDir = path.resolve(process.cwd(), pluginPathArg);
    const manifestPath = path.join(pluginDir, 'manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      console.error(`Manifest not found at ${manifestPath}`);
      process.exit(1);
    }
    
    try {
      const manifestRaw = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const manifest = parseManifest(manifestRaw);
      const entryPointPath = path.join(pluginDir, manifest.entryPoint);
      
      if (!fs.existsSync(entryPointPath)) {
        console.error(`Entry point not found at ${entryPointPath}`);
        process.exit(1);
      }
      
      const scriptCode = fs.readFileSync(entryPointPath, 'utf-8');
      
      // Initialize a mock EventBus
      const eventBus = new EventBus(':memory:');
      eventBus.getSessionManager().startSession(['twitch']);
      
      console.log(`[Simulator] Starting sandbox for ${manifest.id}...`);
      const sandbox = new PluginSandbox(manifest, scriptCode, eventBus);
      await sandbox.initialize();
      console.log(`[Simulator] Sandbox initialized.`);
      
      // Listen to events from the sandbox (e.g. plugin sending a message)
      eventBus.subscribe('cli', (evt) => {
        if (evt.type === 'chat' && evt.author.id === 'system') {
          console.log(`\n[Plugin -> System] ${evt.message.text}\n`);
        }
      });
      
      if (options.rate && options.rate > 0) {
        console.log(`[Simulator] Starting automated simulation: ${options.rate} msgs/sec for ${options.count ? options.count + ' msgs' : 'infinite msgs'}. Press Ctrl+C to exit.`);
        
        let sentCount = 0;
        const intervalMs = 1000 / options.rate;
        
        const intervalId = setInterval(() => {
          if (options.count && sentCount >= options.count) {
            clearInterval(intervalId);
            console.log(`[Simulator] Reached target count of ${options.count} messages. Exiting.`);
            process.exit(0);
            return;
          }
          
          sentCount++;
          eventBus.publish({
            eventId: 'sim-auto-' + Date.now(),
            type: 'chat',
            platform: 'twitch',
            author: { id: 'auto123', name: 'AutoBot' },
            message: { text: `Synthetic message ${sentCount}` },
            moderationStatus: 'visible',
            timestamp: new Date().toISOString()
          });
          
        }, intervalMs);
      } else {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        console.log(`[Simulator] Type a message and press Enter to simulate a chat event. Type 'exit' to quit.`);
        
        const prompt = () => {
          rl.question('> ', (input) => {
            if (input.toLowerCase() === 'exit') {
              rl.close();
              process.exit(0);
            }
            
            eventBus.publish({
              eventId: 'sim-' + Date.now(),
              type: 'chat',
              platform: 'twitch',
              author: {
                id: 'user123',
                name: 'SimUser',
              },
              message: { text: input },
              moderationStatus: 'visible',
              timestamp: new Date().toISOString()
            });
            
            prompt();
          });
        };
        
        prompt();
      }
      
    } catch (e: any) {
      console.error(`[Simulator] Error: ${e.message}`);
    }
  });

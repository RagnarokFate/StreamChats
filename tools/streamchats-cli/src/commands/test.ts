import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import { PluginSandbox } from '@obs-chat/plugin-sdk/dist/sandbox';
import { parseManifest } from '@obs-chat/plugin-sdk/dist/manifest';
import { EventBus } from '@obs-chat/event-bus';

export const testCommand = new Command('test')
  .description('Run automated tests against a plugin using synthetic events')
  .argument('<path>', 'Path to the plugin directory (e.g., ./plugins/my-plugin)')
  .option('-e, --events <path>', 'Path to a JSON file containing an array of events to dispatch')
  .action(async (pluginPathArg: string, options: { events?: string }) => {
    const pluginDir = path.resolve(process.cwd(), pluginPathArg);
    const manifestPath = path.join(pluginDir, 'manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      console.error(`[Test] Manifest not found at ${manifestPath}`);
      process.exit(1);
    }
    
    let eventsToDispatch: any[] = [];
    if (options.events) {
      const eventsPath = path.resolve(process.cwd(), options.events);
      if (!fs.existsSync(eventsPath)) {
        console.error(`[Test] Events file not found at ${eventsPath}`);
        process.exit(1);
      }
      try {
        eventsToDispatch = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
        if (!Array.isArray(eventsToDispatch)) {
          throw new Error('Events file must contain a JSON array');
        }
      } catch (e: any) {
        console.error(`[Test] Failed to parse events file: ${e.message}`);
        process.exit(1);
      }
    } else {
      // Default basic test suite
      eventsToDispatch = [
        {
          eventId: 'test-1',
          type: 'chat',
          platform: 'twitch',
          author: { id: 'testUser1', name: 'Tester1' },
          message: { text: 'Hello plugin!' },
          timestamp: new Date().toISOString()
        },
        {
          eventId: 'test-2',
          type: 'chat',
          platform: 'youtube',
          author: { id: 'testUser2', name: 'Tester2' },
          message: { text: '!ping' },
          timestamp: new Date().toISOString()
        }
      ];
    }
    
    try {
      const manifestRaw = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const manifest = parseManifest(manifestRaw);
      const entryPointPath = path.join(pluginDir, manifest.entryPoint);
      
      if (!fs.existsSync(entryPointPath)) {
        console.error(`[Test] Entry point not found at ${entryPointPath}`);
        process.exit(1);
      }
      
      const scriptCode = fs.readFileSync(entryPointPath, 'utf-8');
      
      const eventBus = new EventBus(':memory:');
      eventBus.getSessionManager().startSession(['twitch', 'youtube']);
      
      const capturedOutputs: any[] = [];
      
      eventBus.subscribe('cli-test', (evt: any) => {
        if (evt.type === 'send_chat' || (evt.type === 'chat' && evt.author?.id === 'system')) {
          capturedOutputs.push(evt);
        }
      });
      
      console.log(`[Test] Starting sandbox for ${manifest.id}...`);
      const sandbox = new PluginSandbox(manifest, scriptCode, eventBus);
      await sandbox.initialize();
      console.log(`[Test] Sandbox initialized. Running ${eventsToDispatch.length} events...`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const evt of eventsToDispatch) {
        try {
          eventBus.publish(evt);
          successCount++;
        } catch (e: any) {
          console.error(`[Test] Event ${evt.eventId} failed: ${e.message}`);
          errorCount++;
        }
      }
      
      // Give the isolate a brief moment to process async tasks
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`\n--- Test Results ---`);
      console.log(`Events Dispatched: ${successCount}`);
      console.log(`Events Failed: ${errorCount}`);
      console.log(`Outputs Captured: ${capturedOutputs.length}`);
      
      if (capturedOutputs.length > 0) {
        console.log(`\nCaptured Outputs:`);
        capturedOutputs.forEach((out, i) => {
          console.log(`[Output ${i + 1}] Type: ${out.type}`);
          console.log(JSON.stringify(out, null, 2));
        });
      }
      
      console.log(`\n[Test] Complete. ${errorCount === 0 ? 'SUCCESS' : 'FAILED'}`);
      process.exit(errorCount === 0 ? 0 : 1);
      
    } catch (e: any) {
      console.error(`[Test] Fatal Error: ${e.message}`);
      process.exit(1);
    }
  });

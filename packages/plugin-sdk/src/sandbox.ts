import { EventBus } from '@obs-chat/event-bus';
import { PluginManifest } from './manifest';
import * as vm from 'vm';

export class PluginSandbox {
  private manifest: PluginManifest;
  private scriptCode: string;
  private eventBus: EventBus;
  private isolateWrapper: any;

  constructor(manifest: PluginManifest, scriptCode: string, eventBus: EventBus) {
    this.manifest = manifest;
    this.scriptCode = scriptCode;
    this.eventBus = eventBus;
  }

  /**
   * Initializes the sandbox and evaluates the plugin script.
   */
  async initialize(): Promise<void> {
    try {
      // Attempt to load isolated-vm
      const ivm = require('isolated-vm');
      await this.initIsolatedVM(ivm);
    } catch (err) {
      console.warn(`[PluginSandbox] isolated-vm not available, falling back to Node.js vm for plugin ${this.manifest.id}`);
      await this.initNodeVM();
    }
  }

  private async initNodeVM(): Promise<void> {
    const sandboxContext = {
      console: {
        log: (...args: any[]) => console.log(`[Plugin:${this.manifest.id}]`, ...args),
        error: (...args: any[]) => console.error(`[Plugin:${this.manifest.id}]`, ...args),
        warn: (...args: any[]) => console.warn(`[Plugin:${this.manifest.id}]`, ...args),
      },
      StreamChats: {
        publish: (event: any) => {
          if (this.manifest.permissions.includes('send_chat') || this.manifest.permissions.includes('moderate_chat')) {
            this.eventBus.publish(event);
          } else {
            console.error(`[Plugin:${this.manifest.id}] Permission denied to publish events`);
          }
        },
        subscribe: (callback: (event: any) => void) => {
          if (this.manifest.permissions.includes('read_chat')) {
            // Note: We use the generic 'all' filter, or we can expose fine-grained filters later
            this.eventBus.on('event', (evt) => callback(evt));
          } else {
            console.error(`[Plugin:${this.manifest.id}] Permission denied to read chat`);
          }
        }
      },
      require: () => { throw new Error('Security Error: Filesystem/Network modules are not allowed in this sandbox context.'); },
      fetch: () => { throw new Error('Security Error: Network access is not allowed in this sandbox context.'); },
      XMLHttpRequest: undefined,
      WebSocket: undefined
    };

    vm.createContext(sandboxContext);
    const script = new vm.Script(this.scriptCode, { filename: `${this.manifest.id}.js` });
    script.runInContext(sandboxContext, { timeout: 1000 });
  }

  private async initIsolatedVM(ivm: any): Promise<void> {
    const isolate = new ivm.Isolate({ memoryLimit: 128 });
    const context = await isolate.createContext();
    const global = context.global;

    // Inject console
    await global.set('console', new ivm.Reference({
      log: (...args: any[]) => console.log(`[Plugin:${this.manifest.id}]`, ...args),
      error: (...args: any[]) => console.error(`[Plugin:${this.manifest.id}]`, ...args),
      warn: (...args: any[]) => console.warn(`[Plugin:${this.manifest.id}]`, ...args),
    }));

    // Inject StreamChats API
    await global.set('StreamChats', new ivm.Reference({
      publish: (event: any) => {
        if (this.manifest.permissions.includes('send_chat') || this.manifest.permissions.includes('moderate_chat')) {
          this.eventBus.publish(event);
        } else {
          console.error(`[Plugin:${this.manifest.id}] Permission denied to publish events`);
        }
      },
      subscribe: (callbackRef: any) => {
        if (this.manifest.permissions.includes('read_chat')) {
          this.eventBus.on('event', (evt) => {
            try {
              callbackRef.applyIgnored(undefined, [new ivm.ExternalCopy(evt).copyInto()]);
            } catch (e) {
              console.error(`[Plugin:${this.manifest.id}] Error in callback:`, e);
            }
          });
        } else {
          console.error(`[Plugin:${this.manifest.id}] Permission denied to read chat`);
        }
      }
    }));

    // Inject explicit lockouts
    await global.set('require', new ivm.Reference(() => { throw new Error('Security Error: require() is forbidden'); }));
    await global.set('fetch', new ivm.Reference(() => { throw new Error('Security Error: fetch() is forbidden'); }));
    await global.set('XMLHttpRequest', undefined);
    await global.set('WebSocket', undefined);

    const script = await isolate.compileScript(this.scriptCode, { filename: `${this.manifest.id}.js` });
    await script.run(context, { timeout: 1000 });
  }
}

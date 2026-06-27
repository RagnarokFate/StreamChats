import * as fs from 'fs';
import * as path from 'path';
import { EventBus } from '@obs-chat/event-bus';
import { PluginManifest, parseManifest } from './manifest';
import { PluginSandbox } from './sandbox';

export * from './manifest';
export * from './sandbox';
export * from './marketplace';

export class PluginManager {
  private eventBus: EventBus;
  private pluginsDir: string;
  private sandboxes: Map<string, PluginSandbox> = new Map();
  private manifests: Map<string, PluginManifest> = new Map();

  constructor(eventBus: EventBus, pluginsDir?: string) {
    this.eventBus = eventBus;
    this.pluginsDir = pluginsDir || path.resolve(process.cwd(), 'plugins');
    
    if (!fs.existsSync(this.pluginsDir)) {
      fs.mkdirSync(this.pluginsDir, { recursive: true });
    }
  }

  /**
   * Scans the plugins directory and loads all valid plugins.
   */
  async loadAllPlugins(): Promise<void> {
    const pluginFolders = fs.readdirSync(this.pluginsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const folder of pluginFolders) {
      await this.loadPlugin(folder);
    }
  }

  /**
   * Loads a specific plugin by folder name.
   */
  async loadPlugin(pluginFolder: string): Promise<boolean> {
    const pluginPath = path.join(this.pluginsDir, pluginFolder);
    const manifestPath = path.join(pluginPath, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      console.error(`[PluginManager] Missing manifest.json in ${pluginFolder}`);
      return false;
    }

    try {
      const manifestRaw = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const manifest = parseManifest(manifestRaw);
      
      const entryPointPath = path.join(pluginPath, manifest.entryPoint);
      if (!fs.existsSync(entryPointPath)) {
        console.error(`[PluginManager] Missing entry point ${manifest.entryPoint} for plugin ${manifest.id}`);
        return false;
      }

      const scriptCode = fs.readFileSync(entryPointPath, 'utf-8');
      
      const sandbox = new PluginSandbox(manifest, scriptCode, this.eventBus);
      await sandbox.initialize();

      this.manifests.set(manifest.id, manifest);
      this.sandboxes.set(manifest.id, sandbox);

      console.log(`[PluginManager] Loaded plugin: ${manifest.name} v${manifest.version}`);
      return true;
    } catch (e: any) {
      console.error(`[PluginManager] Failed to load plugin ${pluginFolder}:`, e.message);
      return false;
    }
  }

  /**
   * Get all loaded plugin manifests.
   */
  getPlugins(): PluginManifest[] {
    return Array.from(this.manifests.values());
  }

  /**
   * Disable a plugin (Note: Full unloading of sandbox memory isn't supported in this basic v1 manager, 
   * we would need to tear down the isolate and unsubscribe from EventBus).
   */
  disablePlugin(id: string): boolean {
    if (this.sandboxes.has(id)) {
      // In a full implementation, we'd unsubscribe from eventBus here.
      // For now, we just remove it from tracking.
      this.sandboxes.delete(id);
      console.log(`[PluginManager] Disabled plugin: ${id}`);
      return true;
    }
    return false;
  }
}

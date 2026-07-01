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
  private approvedPermissions: Record<string, string[]> = {};

  constructor(eventBus: EventBus, pluginsDir?: string) {
    this.eventBus = eventBus;
    this.pluginsDir = pluginsDir || path.resolve(process.cwd(), 'plugins');
    
    if (!fs.existsSync(this.pluginsDir)) {
      fs.mkdirSync(this.pluginsDir, { recursive: true });
    }
  }

  public setApprovedPermissions(perms: Record<string, string[]>) {
    this.approvedPermissions = perms || {};
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

      this.manifests.set(manifest.id, manifest);

      const requestedPerms = manifest.permissions || [];
      const granted = this.approvedPermissions[manifest.id] || [];
      const isApproved = requestedPerms.every(p => granted.includes(p));

      if (!isApproved) {
        console.log(`[PluginManager] Plugin ${manifest.id} is loaded but requires permission approval: ${requestedPerms.filter(p => !granted.includes(p)).join(', ')}`);
        // We load the manifest but do NOT initialize the sandbox.
        return true;
      }

      const scriptCode = fs.readFileSync(entryPointPath, 'utf-8');
      
      const sandbox = new PluginSandbox(manifest, scriptCode, this.eventBus);
      await sandbox.initialize();

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
  getPlugins(): (PluginManifest & { status: string; missingPermissions?: string[] })[] {
    return Array.from(this.manifests.values()).map(m => {
      const requested = m.permissions || [];
      const granted = this.approvedPermissions[m.id] || [];
      const missing = requested.filter(p => !granted.includes(p));
      const isActive = this.sandboxes.has(m.id);
      
      return {
        ...m,
        status: isActive ? 'active' : (missing.length > 0 ? 'needs_permission' : 'disabled'),
        missingPermissions: missing
      };
    });
  }

  /**
   * Disable a plugin by unsubscribing it from the event bus
   */
  disablePlugin(id: string): boolean {
    if (this.sandboxes.has(id)) {
      this.eventBus.unsubscribe('plugin-' + id);
      this.sandboxes.delete(id);
      console.log(`[PluginManager] Disabled plugin: ${id}`);
      return true;
    }
    return false;
  }

  /**
   * Uninstall a plugin completely by disabling it and removing its manifest.
   */
  uninstallPlugin(id: string): boolean {
    this.disablePlugin(id);
    if (this.manifests.has(id)) {
      this.manifests.delete(id);
      console.log(`[PluginManager] Uninstalled plugin: ${id}`);
      return true;
    }
    return false;
  }
}

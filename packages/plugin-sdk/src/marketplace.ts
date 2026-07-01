import { PluginManifest } from './manifest';

export interface MarketplacePlugin extends PluginManifest {
  downloadUrl: string;
  isPremium?: boolean;
  price?: number;
  tier?: 'free' | 'pro' | 'studio';
}

export class MarketplaceClient {
  /**
   * Mocks fetching available plugins from a remote registry.
   */
  async fetchAvailablePlugins(): Promise<MarketplacePlugin[]> {
    // In a real implementation, this would fetch from a central streamchats.dev API.
    // For US5, we mock a static JSON registry.
    const catalog: MarketplacePlugin[] = [
      {
        id: 'auto-welcomer',
        name: 'Auto Welcomer',
        version: '1.0.0',
        author: 'StreamChats Team',
        description: 'Automatically welcomes new chatters to the stream.',
        entryPoint: 'index.js',
        permissions: ['read_chat', 'send_chat'],
        downloadUrl: 'https://example.com/plugins/auto-welcomer.zip',
        isPremium: false,
        tier: 'free'
      },
      {
        id: 'chat-translator',
        name: 'Chat Translator',
        version: '1.0.0',
        author: 'StreamChats Team',
        description: 'Translates chat messages using an external API.',
        entryPoint: 'index.js',
        permissions: ['read_chat', 'send_chat', 'network'],
        downloadUrl: 'https://example.com/plugins/chat-translator.zip',
        isPremium: false,
        tier: 'free'
      },
      {
        id: 'local-logger',
        name: 'Local Logger',
        version: '1.0.0',
        author: 'StreamChats Team',
        description: 'Logs chat messages to a local file on the filesystem.',
        entryPoint: 'index.js',
        permissions: ['read_chat', 'filesystem'],
        downloadUrl: 'https://example.com/plugins/local-logger.zip',
        isPremium: false,
        tier: 'free'
      }
    ];

    return catalog;
  }

  /**
   * Mocks a purchase checkout flow for a premium plugin.
   */
  async purchasePlugin(pluginId: string): Promise<{ success: boolean, receipt?: string }> {
    console.log(`[MarketplaceClient] Initiating checkout for ${pluginId}...`);
    // Mock network checkout delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`[MarketplaceClient] Payment successful for ${pluginId}.`);
    return { success: true, receipt: crypto.randomUUID() };
  }

  /**
   * Mocks downloading and installing a plugin.
   */
  async installPlugin(pluginId: string): Promise<boolean> {
    console.log(`[MarketplaceClient] Downloading and installing plugin ${pluginId}...`);
    // Mock network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`[MarketplaceClient] Installed ${pluginId} successfully.`);
    return true;
  }
}

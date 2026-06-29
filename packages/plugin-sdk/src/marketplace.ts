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
    // Mocking both free and premium plugins
    return [
      {
        id: 'profanity-filter',
        name: 'Profanity Filter',
        version: '1.0.0',
        author: 'StreamChats',
        description: 'Automatically intercepts and scrubs profanity from chat messages.',
        entryPoint: 'dist/index.js',
        permissions: ['read_chat', 'moderate_chat'],
        downloadUrl: 'https://example.com/plugins/profanity-filter.zip',
        isPremium: false,
        tier: 'free'
      },
      {
        id: 'auto-greeter',
        name: 'Auto Greeter',
        version: '1.1.0',
        author: 'StreamChats',
        description: 'Greets new chatters when they send their first message of the stream.',
        entryPoint: 'dist/index.js',
        permissions: ['read_chat', 'send_chat'],
        downloadUrl: 'https://example.com/plugins/auto-greeter.zip',
        isPremium: false,
        tier: 'free'
      },
      {
        id: 'ai-summary',
        name: 'AI Chat Summarizer',
        version: '2.0.0',
        author: 'StreamChats Pro',
        description: 'Uses local AI to summarize long chat discussions automatically.',
        entryPoint: 'dist/index.js',
        permissions: ['read_chat'],
        downloadUrl: 'https://example.com/plugins/ai-summary-locked.zip',
        isPremium: true,
        price: 9.99,
        tier: 'pro'
      }
    ];
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

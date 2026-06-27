import OBSWebSocket from 'obs-websocket-js';

export class OBSClient {
  private obs: OBSWebSocket;
  private isConnected: boolean = false;
  private currentScene: string = '';
  private scenes: string[] = [];

  // Callbacks for the server to listen to OBS events
  public onConnectionChange?: (connected: boolean) => void;
  public onSceneChange?: (sceneName: string) => void;

  constructor() {
    this.obs = new OBSWebSocket();

    // Listen to OBS events
    this.obs.on('CurrentProgramSceneChanged', (data) => {
      this.currentScene = data.sceneName;
      if (this.onSceneChange) {
        this.onSceneChange(this.currentScene);
      }
    });

    this.obs.on('ConnectionClosed', () => {
      this.isConnected = false;
      if (this.onConnectionChange) {
        this.onConnectionChange(false);
      }
    });
  }

  /**
   * Connects to the OBS WebSocket server.
   */
  async connect(url: string, password?: string): Promise<boolean> {
    try {
      if (this.isConnected) {
        await this.disconnect();
      }
      
      const { obsWebSocketVersion } = await this.obs.connect(url, password);
      console.log(`[OBSClient] Connected to OBS WebSocket (v${obsWebSocketVersion})`);
      this.isConnected = true;
      
      if (this.onConnectionChange) {
        this.onConnectionChange(true);
      }

      // Fetch initial state
      await this.refreshScenes();

      return true;
    } catch (err: any) {
      console.error(`[OBSClient] Connection failed: ${err.message}`);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Disconnects from OBS.
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.obs.disconnect();
      this.isConnected = false;
      if (this.onConnectionChange) {
        this.onConnectionChange(false);
      }
    }
  }

  /**
   * Refreshes the internal list of scenes and the current scene.
   */
  async refreshScenes(): Promise<void> {
    if (!this.isConnected) return;

    try {
      const sceneListResponse = await this.obs.call('GetSceneList');
      this.scenes = sceneListResponse.scenes.map((s: any) => s.sceneName as string).reverse();
      this.currentScene = sceneListResponse.currentProgramSceneName;
    } catch (err: any) {
      console.error(`[OBSClient] Failed to refresh scenes: ${err.message}`);
    }
  }

  /**
   * Retrieves the cached list of scenes.
   */
  getScenes(): { scenes: string[], currentScene: string } {
    return {
      scenes: this.scenes,
      currentScene: this.currentScene
    };
  }

  /**
   * Switches the active scene in OBS.
   */
  async setCurrentScene(sceneName: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.obs.call('SetCurrentProgramScene', { sceneName });
      return true;
    } catch (err: any) {
      console.error(`[OBSClient] Failed to set scene to ${sceneName}: ${err.message}`);
      return false;
    }
  }
}

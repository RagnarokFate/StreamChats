import { OBSClient } from '@obs-chat/obs-integration';
import { EventBus } from '@obs-chat/event-bus';

export class OBSManager {
  private obsClient: OBSClient;
  private eventBus: EventBus;
  private broadcast: (message: any) => void;

  constructor(eventBus: EventBus, broadcast: (message: any) => void) {
    this.obsClient = new OBSClient();
    this.eventBus = eventBus;
    this.broadcast = broadcast;

    this.obsClient.onConnectionChange = (connected) => {
      this.broadcast({
        type: 'obs_status',
        connected
      });
      if (connected) {
        this.broadcastScenes();
      }
    };

    this.obsClient.onSceneChange = (sceneName) => {
      this.broadcast({
        type: 'obs_scene_changed',
        sceneName
      });
    };
  }

  async connect(url: string, password?: string): Promise<boolean> {
    return await this.obsClient.connect(url, password);
  }

  async disconnect(): Promise<void> {
    await this.obsClient.disconnect();
  }

  getScenes() {
    return this.obsClient.getScenes();
  }

  broadcastScenes() {
    const data = this.obsClient.getScenes();
    this.broadcast({
      type: 'obs_scenes',
      scenes: data.scenes,
      currentScene: data.currentScene
    });
  }

  async setScene(sceneName: string): Promise<boolean> {
    const success = await this.obsClient.setCurrentScene(sceneName);
    if (success) {
      this.broadcastScenes();
    }
    return success;
  }
}

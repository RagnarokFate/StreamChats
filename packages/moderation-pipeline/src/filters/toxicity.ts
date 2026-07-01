import { pipeline, Pipeline } from '@xenova/transformers';
import { StreamEvent } from '@obs-chat/event-schema';

export class ToxicityFilter {
  private classifier: any = null;
  private threshold: number;
  private initPromise: Promise<void> | null = null;

  constructor(threshold: number = 0.8) {
    this.threshold = threshold;
  }

  public setThreshold(threshold: number): void {
    this.threshold = threshold;
  }

  public async init(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = (async () => {
        // Using a tiny quantized model for toxicity/sentiment
        // In a real production scenario, use 'Xenova/toxic-bert' or similar
        this.classifier = await pipeline('text-classification', 'Xenova/toxic-bert');
      })();
    }
    return this.initPromise;
  }

  public async handle(event: StreamEvent): Promise<StreamEvent> {
    const text = event.type === 'chat' && event.message?.text 
                 ? event.message.text 
                 : (('text' in event && typeof (event as any).text === 'string') ? (event as any).text : null);

    if (!text || !this.classifier) {
      return event;
    }

    try {
      // The classifier returns an array of label/score objects
      const result = await this.classifier(text);
      let isToxic = false;
      let toxicityScore = 0;

      // Find toxicity score from result
      if (Array.isArray(result)) {
        for (const item of result as any[]) {
          if (item.label === 'toxic') {
            toxicityScore = item.score;
            if (item.score >= this.threshold) {
              isToxic = true;
            }
          }
        }
      }

      if (isToxic) {
        return {
          ...event,
          toxicityScore,
          moderationStatus: 'suppressed'
        } as unknown as StreamEvent;
      } else {
        return {
          ...event,
          toxicityScore
        } as unknown as StreamEvent;
      }
    } catch (e) {
      console.error('Error during toxicity classification', e);
      return event;
    }
  }
}

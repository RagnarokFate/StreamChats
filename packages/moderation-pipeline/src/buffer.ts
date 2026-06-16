export class RingBuffer<T> {
  private buffer: T[];
  private maxSize: number;
  private pointer: number = 0;
  
  constructor(maxSize: number) {
    this.maxSize = maxSize;
    this.buffer = new Array<T>(maxSize);
  }
  
  public push(item: T): void {
    if (this.maxSize === 0) return;
    this.buffer[this.pointer] = item;
    this.pointer = (this.pointer + 1) % this.maxSize;
  }
  
  public toArray(): T[] {
    const res = [];
    for (let i = 0; i < this.maxSize; i++) {
      const idx = (this.pointer + i) % this.maxSize;
      if (this.buffer[idx] !== undefined) {
        res.push(this.buffer[idx]);
      }
    }
    return res;
  }
}

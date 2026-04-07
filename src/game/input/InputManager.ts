export class InputManager {
  private pressedKeys: Set<string> = new Set();

  handleKeyDown(key: string): void {
    this.pressedKeys.add(key);
  }

  handleKeyUp(key: string): void {
    this.pressedKeys.delete(key);
  }

  isPressed(key: string): boolean {
    return this.pressedKeys.has(key);
  }

  getPressedKeys(): ReadonlySet<string> {
    return new Set(this.pressedKeys);
  }

  clear(): void {
    this.pressedKeys.clear();
  }
}

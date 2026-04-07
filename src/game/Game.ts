export interface Screen {
  update(): void;
  render(ctx: CanvasRenderingContext2D): void;
  handleKeyDown(key: string): void;
  handleKeyUp?(key: string): void;
}

const HIGH_SCORE_KEY = 'pang-high-score';

const FRAME_DURATION = 1000 / 60; // 60fps 고정 타임스텝

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentScreen: Screen | null = null;
  private animationId: number | null = null;
  private lastTime = 0;
  private accumulator = 0;
  private keyDownHandler: (e: KeyboardEvent) => void;
  private keyUpHandler: (e: KeyboardEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;

    this.keyDownHandler = (e: KeyboardEvent) => {
      e.preventDefault();
      this.currentScreen?.handleKeyDown(e.key);
    };

    this.keyUpHandler = (e: KeyboardEvent) => {
      this.currentScreen?.handleKeyUp?.(e.key);
    };
  }

  switchScreen(screen: Screen): void {
    this.currentScreen = screen;
  }

  getHighScore(): number {
    const stored = localStorage.getItem(HIGH_SCORE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  }

  setHighScore(score: number): void {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
  }

  start(): void {
    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.loop();
  }

  stop(): void {
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private loop = (): void => {
    const now = performance.now();
    const elapsed = Math.min(now - this.lastTime, 200); // 최대 200ms (탭 비활성 방지)
    this.lastTime = now;
    this.accumulator += elapsed;

    // 고정 타임스텝: 60fps 간격으로만 update 실행
    while (this.accumulator >= FRAME_DURATION) {
      if (this.currentScreen) {
        this.currentScreen.update();
      }
      this.accumulator -= FRAME_DURATION;
    }

    // 렌더는 매 프레임
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.currentScreen) {
      this.currentScreen.render(this.ctx);
    }

    this.animationId = requestAnimationFrame(this.loop);
  };
}

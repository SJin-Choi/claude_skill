import {
  GRAVITY, BOUNCE_DAMPING,
  BALLOON_RADIUS, BALLOON_SPEED_X, BALLOON_BOUNCE_VY, BALLOON_COLORS,
  CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, CEILING_Y,
} from '../constants';

export enum BalloonSize {
  LARGE = 0,
  MEDIUM = 1,
  SMALL = 2,
  TINY = 3,
}

export class Balloon {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public size: BalloonSize;
  public radius: number;
  public active = true;

  constructor(x: number, y: number, size: BalloonSize, direction: 1 | -1) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.radius = BALLOON_RADIUS[size];
    this.vx = BALLOON_SPEED_X[size] * direction;
    this.vy = 0;
  }

  update(): void {
    if (!this.active) return;

    const floorY = CANVAS_HEIGHT - GROUND_Y;

    // 중력 적용
    this.vy += GRAVITY;

    // 위치 업데이트
    this.x += this.vx;
    this.y += this.vy;

    // 바닥 바운스
    if (this.y + this.radius >= floorY) {
      this.y = floorY - this.radius;
      this.vy = BALLOON_BOUNCE_VY[this.size] * BOUNCE_DAMPING;
    }

    // 천장 반사
    if (this.y - this.radius <= CEILING_Y) {
      this.y = CEILING_Y + this.radius;
      this.vy = Math.abs(this.vy);
    }

    // 좌벽 반사
    if (this.x - this.radius <= 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx);
    }

    // 우벽 반사
    if (this.x + this.radius >= CANVAS_WIDTH) {
      this.x = CANVAS_WIDTH - this.radius;
      this.vx = -Math.abs(this.vx);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    const r = this.radius;
    const baseColor = BALLOON_COLORS[this.size];

    // === Radial gradient (bright center, darker edge) ===
    const grad = ctx.createRadialGradient(
      this.x - r * 0.25, this.y - r * 0.25, r * 0.1,
      this.x, this.y, r,
    );
    // Parse base color to create lighter/darker variants
    // baseColor is hex like '#ff4444'
    grad.addColorStop(0, this._lighten(baseColor, 60));
    grad.addColorStop(0.6, baseColor);
    grad.addColorStop(1, this._darken(baseColor, 40));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fill();

    // === Subtle outline ===
    ctx.strokeStyle = this._darken(baseColor, 60);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.stroke();

    // === Primary highlight (glass-like) ===
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.ellipse(
      this.x - r * 0.3, this.y - r * 0.35,
      r * 0.25, r * 0.35,
      -0.5, 0, Math.PI * 2,
    );
    ctx.fill();

    // === Secondary small highlight ===
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(this.x - r * 0.15, this.y - r * 0.55, r * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // === Bottom nub (small triangle knot) ===
    ctx.fillStyle = this._darken(baseColor, 30);
    ctx.beginPath();
    ctx.moveTo(this.x - r * 0.15, this.y + r);
    ctx.lineTo(this.x + r * 0.15, this.y + r);
    ctx.lineTo(this.x, this.y + r + r * 0.25);
    ctx.closePath();
    ctx.fill();
  }

  /** Lighten a hex color by amount (0-255) */
  private _lighten(hex: string, amount: number): string {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return `rgb(${r},${g},${b})`;
  }

  /** Darken a hex color by amount (0-255) */
  private _darken(hex: string, amount: number): string {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.max(0, ((num >> 16) & 0xff) - amount);
    const g = Math.max(0, ((num >> 8) & 0xff) - amount);
    const b = Math.max(0, (num & 0xff) - amount);
    return `rgb(${r},${g},${b})`;
  }

  hitByWire(wireX: number, wireTopY: number, _wireBottomY: number): boolean {
    if (!this.active) return false;

    // 작살 끝(topY) 부근만 판정 — 끝에서 12px 범위
    const tipLength = 12;
    const tipBottomY = wireTopY + tipLength;

    const dx = wireX - this.x;
    const closestY = Math.max(wireTopY, Math.min(this.y, tipBottomY));
    const dy = closestY - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  split(): Balloon[] {
    if (this.size === BalloonSize.TINY) return [];

    const nextSize = (this.size + 1) as BalloonSize;
    const left = new Balloon(this.x, this.y, nextSize, -1);
    const right = new Balloon(this.x, this.y, nextSize, 1);

    // 분열 시 위로 약간 튀어오름
    left.vy = BALLOON_BOUNCE_VY[nextSize] * 0.5;
    right.vy = BALLOON_BOUNCE_VY[nextSize] * 0.5;

    return [left, right];
  }

  hitPlayer(bounds: { left: number; top: number; right: number; bottom: number }): boolean {
    if (!this.active) return false;

    const closestX = Math.max(bounds.left, Math.min(this.x, bounds.right));
    const closestY = Math.max(bounds.top, Math.min(this.y, bounds.bottom));
    const dx = closestX - this.x;
    const dy = closestY - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}

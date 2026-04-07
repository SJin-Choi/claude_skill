import { CANVAS_HEIGHT, GROUND_Y } from '../constants';

export enum PowerUpType {
  DoubleWire = 'double_wire',
  PowerWire = 'power_wire',
  Shield = 'shield',
  Clock = 'clock',
  BonusFruit = 'bonus_fruit',
}

const FALL_SPEED = 1.5;
const RADIUS = 12;
const MAX_LIFETIME = 480; // 8초 (60fps)
const BLINK_THRESHOLD = 120; // 2초

const TYPE_STYLE: Record<PowerUpType, { color: string; letter: string }> = {
  [PowerUpType.DoubleWire]: { color: '#44AAFF', letter: 'W' },
  [PowerUpType.PowerWire]: { color: '#FF44AA', letter: 'P' },
  [PowerUpType.Shield]: { color: '#44FFAA', letter: 'S' },
  [PowerUpType.Clock]: { color: '#FFFF44', letter: 'C' },
  [PowerUpType.BonusFruit]: { color: '#FF8844', letter: 'F' },
};

const FLOOR_Y = CANVAS_HEIGHT - GROUND_Y; // 464

export class PowerUp {
  public x: number;
  public y: number;
  public type: PowerUpType;
  public active = true;
  public lifetime = MAX_LIFETIME;

  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  update(): void {
    if (!this.active) return;

    // 낙하
    this.y += FALL_SPEED;
    if (this.y + RADIUS > FLOOR_Y) {
      this.y = FLOOR_Y - RADIUS;
    }

    // 수명 감소
    this.lifetime--;
    if (this.lifetime <= 0) {
      this.active = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    // 남은 수명 2초 미만이면 깜빡임 (짝수 프레임만 렌더)
    if (this.lifetime < BLINK_THRESHOLD && Math.floor(this.lifetime / 4) % 2 === 0) {
      return;
    }

    const style = TYPE_STYLE[this.type];

    ctx.save();

    // 후광(aura) 효과 — 외곽 글로우
    ctx.shadowColor = style.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, RADIUS + 3, 0, Math.PI * 2);
    ctx.fill();

    // 바깥 링 글로우
    ctx.shadowBlur = 12;
    ctx.strokeStyle = style.color;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, RADIUS + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // 메인 원 — 그라데이션
    ctx.shadowBlur = 8;
    const grad = ctx.createRadialGradient(
      this.x - 3, this.y - 3, 2,
      this.x, this.y, RADIUS,
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, style.color);
    grad.addColorStop(1, this._darkenColor(style.color, 0.5));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // 윤곽선
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    // 하이라이트 (작은 반달 빛)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(this.x - 2, this.y - 3, RADIUS * 0.55, Math.PI * 1.2, Math.PI * 2.0);
    ctx.fill();

    // 중앙 글자 (그림자 포함 선명하게)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(style.letter, this.x, this.y);

    ctx.restore();
  }

  /** 색상을 어둡게 만드는 헬퍼 */
  private _darkenColor(hex: string, factor: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const dr = Math.round(r * factor);
    const dg = Math.round(g * factor);
    const db = Math.round(b * factor);
    return `rgb(${dr},${dg},${db})`;
  }

  hitPlayer(bounds: { left: number; top: number; right: number; bottom: number }): boolean {
    if (!this.active) return false;

    const closestX = Math.max(bounds.left, Math.min(this.x, bounds.right));
    const closestY = Math.max(bounds.top, Math.min(this.y, bounds.bottom));

    const dx = this.x - closestX;
    const dy = this.y - closestY;

    return dx * dx + dy * dy <= RADIUS * RADIUS;
  }
}

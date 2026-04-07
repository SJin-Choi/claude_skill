import { WIRE_SPEED, WIRE_WIDTH, CEILING_Y } from '../constants';

export class Wire {
  public x: number;
  public topY: number;
  public bottomY: number;
  public width = WIRE_WIDTH;
  public active = true;

  constructor(playerX: number, playerTopY: number) {
    this.x = playerX;
    this.topY = playerTopY;
    this.bottomY = playerTopY;
  }

  update(): void {
    if (!this.active) return;

    this.topY -= WIRE_SPEED;

    if (this.topY <= CEILING_Y) {
      this.active = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();

    // 외곽 글로우 (넓은 반투명 빛)
    ctx.shadowColor = '#66ccff';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
    ctx.lineWidth = this.width + 4;
    ctx.beginPath();
    ctx.moveTo(this.x, this.bottomY);
    ctx.lineTo(this.x, this.topY);
    ctx.stroke();

    // 내부 글로우
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(180, 220, 255, 0.6)';
    ctx.lineWidth = this.width + 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.bottomY);
    ctx.lineTo(this.x, this.topY);
    ctx.stroke();

    // 메인 와이어 (밝은 은색-파란 빛)
    ctx.shadowColor = '#aaddff';
    ctx.shadowBlur = 4;
    ctx.strokeStyle = '#ddeeff';
    ctx.lineWidth = this.width;
    ctx.beginPath();
    ctx.moveTo(this.x, this.bottomY);
    ctx.lineTo(this.x, this.topY);
    ctx.stroke();

    // 작살 헤드 글로우
    ctx.shadowColor = '#ffee66';
    ctx.shadowBlur = 10;

    // 작살 헤드 — 날카로운 다이아몬드 형태
    ctx.fillStyle = '#ffdd44';
    ctx.beginPath();
    ctx.moveTo(this.x, this.topY - 3);         // 꼭대기 (날카로운 끝)
    ctx.lineTo(this.x - 5, this.topY + 5);     // 왼쪽 날개
    ctx.lineTo(this.x, this.topY + 3);         // 안쪽 홈
    ctx.lineTo(this.x + 5, this.topY + 5);     // 오른쪽 날개
    ctx.closePath();
    ctx.fill();

    // 작살 헤드 하이라이트
    ctx.fillStyle = 'rgba(255, 255, 200, 0.7)';
    ctx.beginPath();
    ctx.moveTo(this.x, this.topY - 2);
    ctx.lineTo(this.x - 2, this.topY + 3);
    ctx.lineTo(this.x + 2, this.topY + 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

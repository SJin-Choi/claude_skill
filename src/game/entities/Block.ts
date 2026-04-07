export enum BlockType {
  Indestructible = 'indestructible',
  Destructible = 'destructible',
}

export class Block {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public type: BlockType;
  public active: boolean;

  constructor(x: number, y: number, width: number, height: number, type: BlockType) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.active = true;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();

    if (this.type === BlockType.Indestructible) {
      // === Indestructible: 벽돌 패턴 + 입체감 ===

      // 베이스 색상 (그라데이션으로 입체감)
      const baseGrad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
      baseGrad.addColorStop(0, '#9a9a9a');
      baseGrad.addColorStop(0.5, '#808080');
      baseGrad.addColorStop(1, '#606060');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // 벽돌 패턴 — 가로줄
      ctx.strokeStyle = '#555555';
      ctx.lineWidth = 1;
      const brickH = this.height / 3;
      for (let row = 1; row < 3; row++) {
        const ly = this.y + row * brickH;
        ctx.beginPath();
        ctx.moveTo(this.x, ly);
        ctx.lineTo(this.x + this.width, ly);
        ctx.stroke();
      }

      // 벽돌 패턴 — 엇갈린 세로줄
      const brickW = this.width / 4;
      for (let row = 0; row < 3; row++) {
        const offsetX = row % 2 === 0 ? 0 : brickW / 2;
        const rowY = this.y + row * brickH;
        for (let col = 1; col < 5; col++) {
          const lx = this.x + offsetX + col * brickW;
          if (lx > this.x && lx < this.x + this.width) {
            ctx.beginPath();
            ctx.moveTo(lx, rowY);
            ctx.lineTo(lx, rowY + brickH);
            ctx.stroke();
          }
        }
      }

      // 상단 하이라이트
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(this.x, this.y, this.width, 2);

      // 좌측 하이라이트
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(this.x, this.y, 2, this.height);

      // 하단 그림자
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(this.x, this.y + this.height - 2, this.width, 2);

      // 우측 그림자
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(this.x + this.width - 2, this.y, 2, this.height);

      // 외곽선
      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x, this.y, this.width, this.height);

    } else {
      // === Destructible: 나무 느낌 + 금 ===

      // 베이스 나무 색상 (그라데이션)
      const woodGrad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
      woodGrad.addColorStop(0, '#c08040');
      woodGrad.addColorStop(0.3, '#a06830');
      woodGrad.addColorStop(0.7, '#905828');
      woodGrad.addColorStop(1, '#704820');
      ctx.fillStyle = woodGrad;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // 나뭇결 가로 줄
      ctx.strokeStyle = 'rgba(60, 30, 10, 0.25)';
      ctx.lineWidth = 1;
      const grainGap = this.height / 5;
      for (let i = 1; i < 5; i++) {
        const gy = this.y + i * grainGap + (i % 2 === 0 ? 1 : -1);
        ctx.beginPath();
        ctx.moveTo(this.x + 2, gy);
        ctx.quadraticCurveTo(this.x + this.width * 0.5, gy + 2, this.x + this.width - 2, gy);
        ctx.stroke();
      }

      // 금간 무늬 (대각선 균열들)
      ctx.strokeStyle = 'rgba(30, 15, 5, 0.4)';
      ctx.lineWidth = 1;
      // 균열 1
      ctx.beginPath();
      ctx.moveTo(this.x + this.width * 0.3, this.y);
      ctx.lineTo(this.x + this.width * 0.35, this.y + this.height * 0.4);
      ctx.lineTo(this.x + this.width * 0.25, this.y + this.height * 0.7);
      ctx.stroke();
      // 균열 2
      ctx.beginPath();
      ctx.moveTo(this.x + this.width * 0.7, this.y + this.height * 0.2);
      ctx.lineTo(this.x + this.width * 0.75, this.y + this.height * 0.6);
      ctx.lineTo(this.x + this.width * 0.65, this.y + this.height);
      ctx.stroke();

      // 상단 하이라이트
      ctx.fillStyle = 'rgba(255, 220, 160, 0.2)';
      ctx.fillRect(this.x, this.y, this.width, 2);

      // 좌측 하이라이트
      ctx.fillStyle = 'rgba(255, 220, 160, 0.1)';
      ctx.fillRect(this.x, this.y, 2, this.height);

      // 하단 그림자
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(this.x, this.y + this.height - 2, this.width, 2);

      // 우측 그림자
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(this.x + this.width - 2, this.y, 2, this.height);

      // 외곽선
      ctx.strokeStyle = '#5a3518';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    ctx.restore();
  }

  intersectsWire(wireX: number, wireTopY: number): { hit: boolean; blockBottomY: number } {
    if (!this.active) {
      return { hit: false, blockBottomY: 0 };
    }

    const blockBottomY = this.y + this.height;
    const withinX = wireX >= this.x && wireX <= this.x + this.width;
    const reachedY = wireTopY <= blockBottomY;

    if (withinX && reachedY) {
      return { hit: true, blockBottomY };
    }

    return { hit: false, blockBottomY: 0 };
  }
}

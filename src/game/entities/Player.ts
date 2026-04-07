import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, GROUND_Y } from '../constants';

export class Player {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  constructor() {
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT - GROUND_Y;
  }

  update(keys: Set<string>): void {
    const left = keys.has('ArrowLeft');
    const right = keys.has('ArrowRight');

    if (left && !right) {
      this.x -= PLAYER_SPEED;
    } else if (right && !left) {
      this.x += PLAYER_SPEED;
    }

    // 경계 클램프
    const minX = PLAYER_WIDTH / 2;
    const maxX = CANVAS_WIDTH - PLAYER_WIDTH / 2;
    if (this.x < minX) this.x = minX;
    if (this.x > maxX) this.x = maxX;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const drawX = this.x - this.width / 2;
    const drawY = this.y - this.height;

    // === Shoes (brown) ===
    ctx.fillStyle = '#6B3A2A';
    // Left shoe
    ctx.beginPath();
    ctx.ellipse(drawX + 6, this.y - 2, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right shoe
    ctx.beginPath();
    ctx.ellipse(drawX + this.width - 6, this.y - 2, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // === Legs (pants - dark blue) ===
    ctx.fillStyle = '#2255aa';
    ctx.fillRect(drawX + 3, this.y - 14, 10, 12);
    ctx.fillRect(drawX + this.width - 13, this.y - 14, 10, 12);

    // === Body (vest - blue gradient) ===
    const vestGrad = ctx.createLinearGradient(drawX, drawY + 16, drawX + this.width, drawY + 16);
    vestGrad.addColorStop(0, '#3366cc');
    vestGrad.addColorStop(0.5, '#5599ff');
    vestGrad.addColorStop(1, '#3366cc');
    ctx.fillStyle = vestGrad;
    // Rounded torso
    ctx.beginPath();
    ctx.moveTo(drawX + 4, drawY + 34);
    ctx.lineTo(drawX + 4, drawY + 20);
    ctx.quadraticCurveTo(drawX + 4, drawY + 16, drawX + 8, drawY + 16);
    ctx.lineTo(drawX + this.width - 8, drawY + 16);
    ctx.quadraticCurveTo(drawX + this.width - 4, drawY + 16, drawX + this.width - 4, drawY + 20);
    ctx.lineTo(drawX + this.width - 4, drawY + 34);
    ctx.closePath();
    ctx.fill();

    // Vest collar / inner shirt (lighter stripe)
    ctx.fillStyle = '#88bbff';
    ctx.fillRect(this.x - 3, drawY + 16, 6, 18);

    // === Arms ===
    ctx.fillStyle = '#ffcc88';
    // Left arm
    ctx.beginPath();
    ctx.ellipse(drawX + 1, drawY + 24, 4, 8, 0.15, 0, Math.PI * 2);
    ctx.fill();
    // Right arm
    ctx.beginPath();
    ctx.ellipse(drawX + this.width - 1, drawY + 24, 4, 8, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // === Head ===
    const headCenterY = drawY + 10;
    const headRadius = 10;
    // Skin
    ctx.fillStyle = '#ffcc88';
    ctx.beginPath();
    ctx.arc(this.x, headCenterY, headRadius, 0, Math.PI * 2);
    ctx.fill();
    // Skin outline
    ctx.strokeStyle = '#e0aa66';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, headCenterY, headRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Eyes (small dark dots)
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(this.x - 4, headCenterY - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + 4, headCenterY - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (small smile)
    ctx.strokeStyle = '#aa6644';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, headCenterY + 3, 3, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // === Hair (brown tufts on top) ===
    ctx.fillStyle = '#553322';
    ctx.beginPath();
    ctx.ellipse(this.x - 5, headCenterY - 9, 4, 3, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(this.x + 1, headCenterY - 10, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(this.x + 6, headCenterY - 8, 3, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // === Hat (red explorer hat, rounded) ===
    // Hat dome
    ctx.fillStyle = '#cc3333';
    ctx.beginPath();
    ctx.ellipse(this.x, headCenterY - 10, 10, 6, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // Hat brim
    ctx.fillStyle = '#bb2222';
    ctx.beginPath();
    ctx.ellipse(this.x, headCenterY - 7, 14, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Hat band
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(this.x - 9, headCenterY - 9, 18, 2);
  }

  reset(): void {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT - GROUND_Y;
  }

  getBounds(): { left: number; top: number; right: number; bottom: number } {
    return {
      left: this.x - this.width / 2,
      top: this.y - this.height,
      right: this.x + this.width / 2,
      bottom: this.y,
    };
  }
}

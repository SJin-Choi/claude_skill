import type { Screen, Game } from '../Game';
import { MainScreen } from './MainScreen';

export class HowToPlayScreen implements Screen {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  update(): void {}

  render(ctx: CanvasRenderingContext2D): void {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Dark background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0a0a2e');
    bgGrad.addColorStop(1, '#1a1a4e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Title with accent
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Title underline
    ctx.strokeStyle = 'rgba(255,215,0,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 130, h * 0.18 + 22);
    ctx.lineTo(w / 2 + 130, h * 0.18 + 22);
    ctx.stroke();

    ctx.save();
    ctx.shadowColor = 'rgba(255,215,0,0.4)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('HOW TO PLAY', w / 2, h * 0.18);
    ctx.shadowBlur = 0;
    ctx.restore();

    // Controls section
    const sectionY = h * 0.32;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.roundRect(w * 0.12, sectionY - 20, w * 0.76, 130, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(w * 0.12, sectionY - 20, w * 0.76, 130, 10);
    ctx.stroke();

    // Section header
    ctx.fillStyle = '#88AAFF';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CONTROLS', w * 0.16, sectionY);

    const instructions = [
      ['Arrow Left / Right', 'Move character'],
      ['Space', 'Shoot wire upward'],
      ['ESC', 'Return to menu'],
    ];

    ctx.font = '18px monospace';
    const lineHeight = 32;
    for (let i = 0; i < instructions.length; i++) {
      const y = sectionY + 30 + i * lineHeight;

      // Key badge
      const keyText = instructions[i][0];
      const keyW = ctx.measureText(keyText).width + 16;
      ctx.fillStyle = 'rgba(255,215,0,0.15)';
      ctx.beginPath();
      ctx.roundRect(w * 0.16, y - 12, keyW, 24, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,215,0,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(w * 0.16, y - 12, keyW, 24, 4);
      ctx.stroke();

      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'left';
      ctx.fillText(keyText, w * 0.16 + 8, y);

      ctx.fillStyle = '#CCCCDD';
      ctx.fillText(instructions[i][1], w * 0.16 + keyW + 16, y);
    }

    // Objective section
    const objY = h * 0.62;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.roundRect(w * 0.12, objY - 20, w * 0.76, 90, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(w * 0.12, objY - 20, w * 0.76, 90, 10);
    ctx.stroke();

    ctx.fillStyle = '#88AAFF';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('OBJECTIVE', w * 0.16, objY);

    ctx.fillStyle = '#CCCCDD';
    ctx.font = '18px monospace';
    ctx.fillText('Pop all balloons to clear each stage.', w * 0.16, objY + 30);
    ctx.fillText('Avoid getting hit! Collect power-ups.', w * 0.16, objY + 55);

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '16px monospace';
    ctx.fillText('Press ESC to go back', w / 2, h * 0.92);
  }

  handleKeyDown(key: string): void {
    if (key === 'Escape') {
      this.game.switchScreen(new MainScreen(this.game));
    }
  }
}

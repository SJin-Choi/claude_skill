import type { Screen, Game } from '../Game';
import { HowToPlayScreen } from './HowToPlayScreen';
import { GameScreen } from './GameScreen';

const MENU_ITEMS = ['Game Start', 'How to Play', 'Game Exit'] as const;

export class MainScreen implements Screen {
  private game: Game;
  private selectedIndex = 0;

  constructor(game: Game) {
    this.game = game;
  }

  update(): void {}

  private frameCount = 0;

  render(ctx: CanvasRenderingContext2D): void {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    this.frameCount++;

    // Dark gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0a0a2e');
    bgGrad.addColorStop(0.5, '#1a1a4e');
    bgGrad.addColorStop(1, '#0a0a2e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Background stars / particles
    const starPositions = [
      [40, 30, 1.5], [120, 80, 1], [200, 45, 2], [280, 90, 1.5], [350, 25, 1],
      [430, 70, 2], [510, 35, 1.5], [580, 85, 1], [60, 130, 1], [170, 110, 1.5],
      [310, 120, 1], [450, 115, 2], [540, 100, 1], [90, 300, 1.5], [220, 350, 1],
      [380, 320, 2], [500, 370, 1.5], [600, 310, 1], [150, 400, 1], [340, 420, 1.5],
      [480, 440, 1], [50, 250, 1.5], [260, 200, 1], [520, 230, 2], [400, 180, 1],
    ];
    for (const [sx, sy, sr] of starPositions) {
      const twinkle = 0.4 + Math.sin(this.frameCount * 0.03 + sx * 0.1) * 0.3;
      ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floating particles (slow drift)
    for (let i = 0; i < 8; i++) {
      const px = (i * 83 + this.frameCount * 0.3) % w;
      const py = (i * 67 + Math.sin(this.frameCount * 0.02 + i) * 15) % h;
      const pa = 0.15 + Math.sin(this.frameCount * 0.04 + i * 2) * 0.1;
      ctx.fillStyle = `rgba(100,150,255,${pa})`;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // === TITLE ===
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Title shadow layers (retro arcade style)
    const titleY = h * 0.22;
    ctx.save();

    // Deep shadow
    ctx.fillStyle = '#220044';
    ctx.font = 'bold 68px monospace';
    ctx.fillText('P A N G', w / 2 + 4, titleY + 4);

    // Mid shadow
    ctx.fillStyle = '#6622AA';
    ctx.font = 'bold 68px monospace';
    ctx.fillText('P A N G', w / 2 + 2, titleY + 2);

    // Main title with gradient
    const titleGrad = ctx.createLinearGradient(w / 2 - 120, titleY - 30, w / 2 + 120, titleY + 30);
    titleGrad.addColorStop(0, '#FF6644');
    titleGrad.addColorStop(0.3, '#FFDD44');
    titleGrad.addColorStop(0.6, '#FF6644');
    titleGrad.addColorStop(1, '#FFDD44');
    ctx.fillStyle = titleGrad;
    ctx.font = 'bold 68px monospace';
    ctx.fillText('P A N G', w / 2, titleY);

    // Title glow
    ctx.shadowColor = '#FF8844';
    ctx.shadowBlur = 20;
    ctx.fillText('P A N G', w / 2, titleY);
    ctx.shadowBlur = 0;
    ctx.restore();

    // Subtitle
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '14px monospace';
    ctx.fillText('BUBBLE BUSTER', w / 2, titleY + 42);

    // === MENU ===
    ctx.font = '26px monospace';
    const menuStartY = h * 0.48;
    const lineHeight = 52;

    for (let i = 0; i < MENU_ITEMS.length; i++) {
      const y = menuStartY + i * lineHeight;
      const isSelected = i === this.selectedIndex;

      if (isSelected) {
        // Selected item box background
        const boxW = 260;
        const boxH = 40;
        const boxGrad = ctx.createLinearGradient(w / 2 - boxW / 2, y - boxH / 2, w / 2 + boxW / 2, y + boxH / 2);
        boxGrad.addColorStop(0, 'rgba(255,215,0,0.2)');
        boxGrad.addColorStop(0.5, 'rgba(255,215,0,0.1)');
        boxGrad.addColorStop(1, 'rgba(255,215,0,0.2)');
        ctx.fillStyle = boxGrad;
        ctx.beginPath();
        ctx.roundRect(w / 2 - boxW / 2, y - boxH / 2, boxW, boxH, 6);
        ctx.fill();

        // Box border
        ctx.strokeStyle = 'rgba(255,215,0,0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(w / 2 - boxW / 2, y - boxH / 2, boxW, boxH, 6);
        ctx.stroke();

        // Animated arrow
        const arrowBounce = Math.sin(this.frameCount * 0.1) * 3;
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 26px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`> ${MENU_ITEMS[i]} <`, w / 2 + arrowBounce, y);
      } else {
        ctx.fillStyle = '#8888AA';
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(MENU_ITEMS[i], w / 2, y);
      }
    }

    // === HIGH SCORE ===
    const hsY = h * 0.87;
    // High score box
    const hsBoxW = 280;
    const hsBoxH = 36;
    ctx.fillStyle = 'rgba(255,215,0,0.08)';
    ctx.beginPath();
    ctx.roundRect(w / 2 - hsBoxW / 2, hsY - hsBoxH / 2, hsBoxW, hsBoxH, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,215,0,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(w / 2 - hsBoxW / 2, hsY - hsBoxH / 2, hsBoxW, hsBoxH, 8);
    ctx.stroke();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    const trophy = String.fromCharCode(9733); // star
    ctx.fillText(`${trophy} HIGH SCORE: ${this.game.getHighScore()} ${trophy}`, w / 2, hsY);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '12px monospace';
    ctx.fillText('Use Arrow Keys + Enter', w / 2, h * 0.95);
  }

  handleKeyDown(key: string): void {
    switch (key) {
      case 'ArrowUp':
        this.selectedIndex = (this.selectedIndex - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
        break;
      case 'ArrowDown':
        this.selectedIndex = (this.selectedIndex + 1) % MENU_ITEMS.length;
        break;
      case 'Enter':
      case ' ':
        this.executeMenu();
        break;
    }
  }

  private executeMenu(): void {
    switch (this.selectedIndex) {
      case 0: // Game Start
        this.game.switchScreen(new GameScreen(this.game));
        break;
      case 1: // How to Play
        this.game.switchScreen(new HowToPlayScreen(this.game));
        break;
      case 2: // Game Exit
        break;
    }
  }
}

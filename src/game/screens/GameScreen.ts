import type { Screen, Game } from '../Game';
import { MainScreen } from './MainScreen';
import { Player } from '../entities/Player';
import { Wire } from '../entities/Wire';
import { Balloon } from '../entities/Balloon';
import { Block, BlockType } from '../entities/Block';
import { PowerUp, PowerUpType } from '../entities/PowerUp';
import { InputManager } from '../input/InputManager';
import { STAGES, StageConfig } from '../stages/StageData';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, CEILING_Y,
  SCORE_TABLE, TIME_BONUS_MULTIPLIER, BALLOON_COLORS,
} from '../constants';
import { Particle, spawnBurstParticles, spawnDeathParticles } from '../effects/Particle';
import { soundFx } from '../effects/SoundFx';

type GameState = 'stage_intro' | 'playing' | 'dying' | 'stage_clear' | 'mission_clear' | 'game_over';

const MAX_LIVES = 3;
const DEATH_FRAMES = 90;
const INVINCIBLE_FRAMES = 120;
const INTRO_FRAMES = 120;
const CLEAR_FRAMES = 150;
const POWERUP_DURATION = 480; // 8초

export class GameScreen implements Screen {
  private game: Game;
  private player: Player;
  private inputManager: InputManager;
  private wire: Wire | null = null;
  private secondWire: Wire | null = null; // 더블 와이어용
  private balloons: Balloon[] = [];
  private blocks: Block[] = [];
  private powerUps: PowerUp[] = [];

  private state: GameState = 'stage_intro';
  private lives = MAX_LIVES;
  private score = 0;
  private timeLeft = 0;
  private stageIndex = 0;
  private stateTimer = 0;
  private invincibleTimer = 0;

  // 파워업 상태
  private doubleWire = false;
  private doubleWireTimer = 0;
  private powerWireActive = false;
  private powerWireTimer = 0;
  private shieldActive = false;
  private shieldTimer = 0;
  private clockActive = false;
  private clockTimer = 0;

  // 드롭 추적
  private powerUpDropQueue: PowerUpType[] = [];
  private balloonsPopped = 0;

  // 이펙트
  private particles: Particle[] = [];
  private floatingTexts: { x: number; y: number; text: string; color: string; life: number }[] = [];

  constructor(game: Game) {
    this.game = game;
    this.player = new Player();
    this.inputManager = new InputManager();
    this.loadStage(0);
  }

  private loadStage(index: number): void {
    this.stageIndex = index;
    const cfg = STAGES[index];
    this.timeLeft = cfg.timeLimit;
    this.balloons = cfg.balloons.map(b => new Balloon(b.x, b.y, b.size, b.direction));
    this.blocks = cfg.blocks.map(b => new Block(b.x, b.y, b.width, b.height, b.type));
    this.powerUpDropQueue = [...cfg.powerUpDrops];
    this.powerUps = [];
    this.wire = null;
    this.secondWire = null;
    this.balloonsPopped = 0;
    this.player.reset();
    this.clearPowerUpEffects();
    this.state = 'stage_intro';
    this.stateTimer = INTRO_FRAMES;
  }

  private clearPowerUpEffects(): void {
    this.doubleWire = false;
    this.doubleWireTimer = 0;
    this.powerWireActive = false;
    this.powerWireTimer = 0;
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.clockActive = false;
    this.clockTimer = 0;
  }

  update(): void {
    switch (this.state) {
      case 'stage_intro':
        this.stateTimer--;
        if (this.stateTimer <= 0) this.state = 'playing';
        break;
      case 'playing':
        this.updatePlaying();
        break;
      case 'dying':
        this.stateTimer--;
        if (this.stateTimer <= 0) {
          if (this.lives <= 0) {
            this.state = 'game_over';
            this.stateTimer = 180;
            this.updateHighScore();
          } else {
            this.respawn();
          }
        }
        break;
      case 'stage_clear':
        this.stateTimer--;
        if (this.stateTimer <= 0) {
          if (this.stageIndex < STAGES.length - 1) {
            this.loadStage(this.stageIndex + 1);
          } else {
            this.state = 'mission_clear';
            this.stateTimer = 240;
            this.updateHighScore();
          }
        }
        break;
      case 'mission_clear':
        this.stateTimer--;
        if (this.stateTimer <= 0) {
          this.game.switchScreen(new MainScreen(this.game));
        }
        break;
      case 'game_over':
        this.stateTimer--;
        if (this.stateTimer <= 0) {
          this.game.switchScreen(new MainScreen(this.game));
        }
        break;
    }
  }

  private updatePlaying(): void {
    this.timeLeft--;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.killPlayer();
      return;
    }

    this.player.update(this.inputManager.getPressedKeys() as Set<string>);

    if (this.invincibleTimer > 0) this.invincibleTimer--;

    // 파워업 타이머
    this.updatePowerUpTimers();

    // 와이어 업데이트
    this.updateWire(this.wire, w => { this.wire = w; });
    this.updateWire(this.secondWire, w => { this.secondWire = w; });

    // 풍선 (시계 효과 중에는 정지)
    if (!this.clockActive) {
      for (const balloon of this.balloons) {
        balloon.update();
      }
    }

    // 파워업 아이템 업데이트
    for (const pu of this.powerUps) {
      pu.update();
    }
    this.powerUps = this.powerUps.filter(p => p.active);

    // 이펙트 업데이트
    this.particles = this.particles.filter(p => p.update());
    this.floatingTexts = this.floatingTexts.filter(t => { t.life--; t.y -= 0.5; return t.life > 0; });

    this.checkWireBalloonCollision();
    this.checkPlayerBalloonCollision();
    this.checkPlayerPowerUpCollision();

    // 클리어 체크
    const activeBalloons = this.balloons.filter(b => b.active);
    if (activeBalloons.length === 0) {
      const remainingSeconds = Math.floor(this.timeLeft / 60);
      this.score += remainingSeconds * TIME_BONUS_MULTIPLIER;
      this.state = 'stage_clear';
      this.stateTimer = CLEAR_FRAMES;
      soundFx.playClear();
    }
  }

  private updatePowerUpTimers(): void {
    if (this.doubleWire) {
      this.doubleWireTimer--;
      if (this.doubleWireTimer <= 0) this.doubleWire = false;
    }
    if (this.powerWireActive) {
      this.powerWireTimer--;
      if (this.powerWireTimer <= 0) this.powerWireActive = false;
    }
    if (this.shieldActive) {
      this.shieldTimer--;
      if (this.shieldTimer <= 0) this.shieldActive = false;
    }
    if (this.clockActive) {
      this.clockTimer--;
      if (this.clockTimer <= 0) this.clockActive = false;
    }
  }

  private updateWire(wire: Wire | null, setter: (w: Wire | null) => void): void {
    if (wire === null) return;

    wire.update();

    // 블록 충돌
    for (const block of this.blocks) {
      if (!block.active) continue;
      const { hit, blockBottomY } = block.intersectsWire(wire.x, wire.topY);
      if (hit) {
        if (this.powerWireActive) {
          // 파워 와이어: 천장/블록에 붙어서 유지
          wire.topY = blockBottomY;
          // 계속 활성 (일정 시간 붙어있음)
        } else {
          wire.topY = blockBottomY;
          wire.active = false;
        }
        if (block.type === BlockType.Destructible) {
          block.active = false;
        }
        break;
      }
    }

    if (!wire.active) {
      setter(null);
    }
  }

  private checkWireBalloonCollision(): void {
    this.checkSingleWireBalloon(this.wire, w => { this.wire = w; });
    this.checkSingleWireBalloon(this.secondWire, w => { this.secondWire = w; });
  }

  private checkSingleWireBalloon(wire: Wire | null, setter: (w: Wire | null) => void): void {
    if (wire === null || !wire.active) return;

    for (let i = 0; i < this.balloons.length; i++) {
      const balloon = this.balloons[i];
      if (!balloon.active) continue;

      if (balloon.hitByWire(wire.x, wire.topY, wire.bottomY)) {
        balloon.active = false;
        wire.active = false;
        setter(null);

        this.score += SCORE_TABLE[balloon.size];
        this.balloonsPopped++;

        // 이펙트
        this.particles.push(...spawnBurstParticles(balloon.x, balloon.y, BALLOON_COLORS[balloon.size]));
        this.floatingTexts.push({ x: balloon.x, y: balloon.y, text: `+${SCORE_TABLE[balloon.size]}`, color: '#FFD700', life: 45 });
        soundFx.playPop();

        const children = balloon.split();
        this.balloons.push(...children);

        this.tryDropPowerUp(balloon.x, balloon.y);
        break;
      }
    }
  }

  private tryDropPowerUp(x: number, y: number): void {
    if (this.powerUpDropQueue.length === 0) return;

    // 3번째 풍선 파괴마다 드롭
    if (this.balloonsPopped % 3 === 0) {
      const type = this.powerUpDropQueue.shift()!;
      this.powerUps.push(new PowerUp(x, y, type));
    }
  }

  private checkPlayerBalloonCollision(): void {
    if (this.invincibleTimer > 0 || this.shieldActive) return;

    const bounds = this.player.getBounds();
    for (const balloon of this.balloons) {
      if (balloon.hitPlayer(bounds)) {
        this.killPlayer();
        break;
      }
    }
  }

  private checkPlayerPowerUpCollision(): void {
    const bounds = this.player.getBounds();
    for (const pu of this.powerUps) {
      if (!pu.active) continue;
      if (pu.hitPlayer(bounds)) {
        pu.active = false;
        this.activatePowerUp(pu.type);
      }
    }
  }

  private activatePowerUp(type: PowerUpType): void {
    soundFx.playPowerUp();
    switch (type) {
      case PowerUpType.DoubleWire:
        this.doubleWire = true;
        this.doubleWireTimer = POWERUP_DURATION;
        break;
      case PowerUpType.PowerWire:
        this.powerWireActive = true;
        this.powerWireTimer = POWERUP_DURATION;
        break;
      case PowerUpType.Shield:
        this.shieldActive = true;
        this.shieldTimer = POWERUP_DURATION;
        break;
      case PowerUpType.Clock:
        this.clockActive = true;
        this.clockTimer = 300; // 5초
        break;
      case PowerUpType.BonusFruit:
        this.score += 500;
        break;
    }
  }

  private killPlayer(): void {
    this.particles.push(...spawnDeathParticles(this.player.x, this.player.y - this.player.height / 2));
    soundFx.playDeath();
    this.lives--;
    this.state = 'dying';
    this.stateTimer = DEATH_FRAMES;
    this.wire = null;
    this.secondWire = null;
  }

  private respawn(): void {
    this.player.reset();
    this.invincibleTimer = INVINCIBLE_FRAMES;
    this.state = 'playing';
  }

  private updateHighScore(): void {
    if (this.score > this.game.getHighScore()) {
      this.game.setHighScore(this.score);
    }
  }

  // === Rendering ===

  render(ctx: CanvasRenderingContext2D): void {
    const cfg = STAGES[this.stageIndex];
    this.renderBackground(ctx, cfg);

    for (const block of this.blocks) block.render(ctx);
    if (this.wire !== null) this.wire.render(ctx);
    if (this.secondWire !== null) this.secondWire.render(ctx);
    for (const balloon of this.balloons) balloon.render(ctx);
    for (const pu of this.powerUps) pu.render(ctx);

    // 플레이어 깜빡임
    if (this.state === 'dying') {
      if (this.stateTimer % 10 < 5) this.player.render(ctx);
    } else if (this.invincibleTimer > 0) {
      if (this.invincibleTimer % 8 < 4) this.player.render(ctx);
    } else if (this.state !== 'game_over') {
      this.player.render(ctx);
    }

    // 쉴드 이펙트
    if (this.shieldActive && this.state === 'playing') {
      ctx.strokeStyle = 'rgba(68, 255, 170, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.player.x, this.player.y - this.player.height / 2, 28, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 파티클
    for (const p of this.particles) p.render(ctx);

    // 플로팅 텍스트
    for (const ft of this.floatingTexts) {
      const alpha = Math.min(1, ft.life / 20);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.globalAlpha = 1;
    }

    this.renderHUD(ctx);
    this.renderOverlay(ctx, cfg);
  }

  private renderBackground(ctx: CanvasRenderingContext2D, cfg: StageConfig): void {
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, cfg.bgColor1);
    grad.addColorStop(1, cfg.bgColor2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const baseY = CANVAS_HEIGHT - GROUND_Y;
    const isNight = cfg.bgColor1 === '#1a1a3e';

    // --- Sky decorations ---
    if (isNight) {
      // Moon
      ctx.save();
      ctx.fillStyle = '#EEEEDD';
      ctx.shadowColor = '#EEEEDD';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(540, 55, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
      // Moon craters
      ctx.fillStyle = 'rgba(180,180,160,0.3)';
      ctx.beginPath(); ctx.arc(533, 50, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(548, 60, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(540, 68, 2.5, 0, Math.PI * 2); ctx.fill();

      // Many stars with varied sizes
      const stars = [
        [30, 28, 2.5], [80, 65, 1.5], [130, 38, 2], [180, 80, 1], [210, 22, 1.5],
        [260, 55, 2], [300, 18, 1.5], [340, 75, 2.5], [370, 32, 1], [420, 50, 1.5],
        [460, 20, 2], [500, 85, 1], [570, 30, 2], [600, 70, 1.5], [50, 95, 1],
        [110, 105, 1.5], [170, 48, 1], [310, 92, 2], [440, 98, 1.5], [490, 40, 1],
        [150, 110, 1], [350, 105, 1.5], [520, 100, 1], [240, 100, 2], [590, 50, 1],
      ];
      for (const [sx, sy, sr] of stars) {
        const alpha = 0.5 + Math.random() * 0.5;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Sun (for morning / sunset stages)
      const sunX = isNight ? 0 : 80;
      const sunY = 65;
      ctx.save();
      ctx.fillStyle = '#FFF4A0';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Clouds
      const drawCloud = (cx: number, cy: number, scale: number) => {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 16 * scale, cy - 6 * scale, 14 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 30 * scale, cy, 18 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 14 * scale, cy + 5 * scale, 12 * scale, 0, Math.PI * 2);
        ctx.fill();
      };
      drawCloud(120, 55, 1);
      drawCloud(380, 40, 0.8);
      drawCloud(520, 70, 0.7);
    }

    // --- Mountains (multiple ridges with gradient) ---
    // Back ridge (faded)
    const backMtnColor = isNight ? '#1e1e40' : this.blendColor(cfg.mountainColor, cfg.bgColor2, 0.5);
    ctx.fillStyle = backMtnColor;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(60, baseY - 80);
    ctx.lineTo(150, baseY - 50);
    ctx.lineTo(230, baseY - 110);
    ctx.lineTo(340, baseY - 60);
    ctx.lineTo(420, baseY - 90);
    ctx.lineTo(540, baseY - 55);
    ctx.lineTo(CANVAS_WIDTH, baseY - 70);
    ctx.lineTo(CANVAS_WIDTH, baseY);
    ctx.closePath();
    ctx.fill();

    // Main Fuji mountain (gradient fill)
    const mtnGrad = ctx.createLinearGradient(CANVAS_WIDTH * 0.5, baseY - 170, CANVAS_WIDTH * 0.5, baseY);
    mtnGrad.addColorStop(0, cfg.mountainColor);
    mtnGrad.addColorStop(1, this.blendColor(cfg.mountainColor, '#000000', 0.3));
    ctx.fillStyle = mtnGrad;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH * 0.22, baseY);
    ctx.quadraticCurveTo(CANVAS_WIDTH * 0.32, baseY - 80, CANVAS_WIDTH * 0.42, baseY - 150);
    ctx.lineTo(CANVAS_WIDTH * 0.5, baseY - 170);
    ctx.lineTo(CANVAS_WIDTH * 0.58, baseY - 150);
    ctx.quadraticCurveTo(CANVAS_WIDTH * 0.68, baseY - 80, CANVAS_WIDTH * 0.78, baseY);
    ctx.closePath();
    ctx.fill();

    // Snow cap (detailed)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH * 0.43, baseY - 140);
    ctx.lineTo(CANVAS_WIDTH * 0.46, baseY - 155);
    ctx.lineTo(CANVAS_WIDTH * 0.5, baseY - 170);
    ctx.lineTo(CANVAS_WIDTH * 0.54, baseY - 155);
    ctx.lineTo(CANVAS_WIDTH * 0.57, baseY - 140);
    ctx.lineTo(CANVAS_WIDTH * 0.53, baseY - 145);
    ctx.lineTo(CANVAS_WIDTH * 0.5, baseY - 138);
    ctx.lineTo(CANVAS_WIDTH * 0.47, baseY - 145);
    ctx.closePath();
    ctx.fill();

    // Front ridge (darker)
    const frontMtnColor = isNight ? '#15152e' : this.blendColor(cfg.mountainColor, '#000000', 0.4);
    ctx.fillStyle = frontMtnColor;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(80, baseY - 40);
    ctx.lineTo(180, baseY - 25);
    ctx.lineTo(280, baseY - 50);
    ctx.lineTo(380, baseY - 30);
    ctx.lineTo(480, baseY - 45);
    ctx.lineTo(580, baseY - 25);
    ctx.lineTo(CANVAS_WIDTH, baseY - 35);
    ctx.lineTo(CANVAS_WIDTH, baseY);
    ctx.closePath();
    ctx.fill();

    // --- Ground with grass/tile pattern ---
    const groundGrad = ctx.createLinearGradient(0, baseY, 0, CANVAS_HEIGHT);
    groundGrad.addColorStop(0, '#4a7a3a');
    groundGrad.addColorStop(0.3, '#3a6a2a');
    groundGrad.addColorStop(1, '#2a5a1a');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, baseY, CANVAS_WIDTH, GROUND_Y);

    // Grass blades on top edge
    ctx.strokeStyle = '#5a9a4a';
    ctx.lineWidth = 1.5;
    for (let gx = 0; gx < CANVAS_WIDTH; gx += 8) {
      const h = 3 + Math.sin(gx * 0.7) * 2;
      ctx.beginPath();
      ctx.moveTo(gx, baseY);
      ctx.lineTo(gx + 2, baseY - h);
      ctx.stroke();
    }

    // Tile lines on ground
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    for (let tx = 0; tx < CANVAS_WIDTH; tx += 32) {
      ctx.beginPath();
      ctx.moveTo(tx, baseY);
      ctx.lineTo(tx, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // --- Ceiling (metallic) ---
    const ceilGrad = ctx.createLinearGradient(0, CEILING_Y - 8, 0, CEILING_Y);
    ceilGrad.addColorStop(0, '#888');
    ceilGrad.addColorStop(0.3, '#AAA');
    ceilGrad.addColorStop(0.6, '#777');
    ceilGrad.addColorStop(1, '#555');
    ctx.fillStyle = ceilGrad;
    ctx.fillRect(0, CEILING_Y - 8, CANVAS_WIDTH, 8);

    // Rivets on ceiling
    ctx.fillStyle = '#999';
    for (let rx = 20; rx < CANVAS_WIDTH; rx += 40) {
      ctx.beginPath();
      ctx.arc(rx, CEILING_Y - 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Highlight line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, CEILING_Y - 7);
    ctx.lineTo(CANVAS_WIDTH, CEILING_Y - 7);
    ctx.stroke();
  }

  /** Helper: linearly blend two hex colors */
  private blendColor(c1: string, c2: string, t: number): string {
    const p = (c: string, i: number) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
    const r = Math.round(p(c1, 0) * (1 - t) + p(c2, 0) * t);
    const g = Math.round(p(c1, 1) * (1 - t) + p(c2, 1) * t);
    const b = Math.round(p(c1, 2) * (1 - t) + p(c2, 2) * t);
    return `rgb(${r},${g},${b})`;
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    // Gradient HUD bar
    const hudH = CEILING_Y - 4;
    const hudGrad = ctx.createLinearGradient(0, 0, 0, hudH);
    hudGrad.addColorStop(0, 'rgba(20,20,40,0.85)');
    hudGrad.addColorStop(1, 'rgba(10,10,30,0.7)');
    ctx.fillStyle = hudGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, hudH);

    // Subtle bottom border
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, hudH);
    ctx.lineTo(CANVAS_WIDTH, hudH);
    ctx.stroke();

    ctx.textBaseline = 'middle';
    const hudY = hudH / 2;

    // Draw heart icons instead of text
    for (let i = 0; i < this.lives; i++) {
      this.drawHeart(ctx, 16 + i * 24, hudY, 8, '#FF4444');
    }
    // Empty heart outlines for lost lives
    for (let i = this.lives; i < MAX_LIVES; i++) {
      this.drawHeart(ctx, 16 + i * 24, hudY, 8, 'rgba(255,68,68,0.25)');
    }

    // Score with shadow
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px monospace';
    ctx.shadowColor = 'rgba(255,215,0,0.5)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`SCORE`, CANVAS_WIDTH / 2 - 50, hudY);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFF';
    ctx.fillText(`${this.score}`, CANVAS_WIDTH / 2 + 20, hudY);
    ctx.restore();

    // Timer
    const seconds = Math.ceil(this.timeLeft / 60);
    const cfg = STAGES[this.stageIndex];

    const timeFraction = this.timeLeft / cfg.timeLimit;
    const isLow = seconds <= 10;

    // Timer bar background
    const barX = CANVAS_WIDTH - 160;
    const barW = 100;
    const barH = 8;
    const barY = hudY - barH / 2 + 10;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(barX, barY, barW, barH);

    // Timer bar fill
    const barColor = isLow ? '#FF4444' : '#44CC88';
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, barColor);
    barGrad.addColorStop(1, isLow ? '#FF6666' : '#66DDAA');
    ctx.fillStyle = barGrad;
    ctx.fillRect(barX, barY, barW * timeFraction, barH);

    // Timer bar border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Timer text
    ctx.fillStyle = isLow ? '#FF6666' : '#FFF';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`TIME ${seconds}`, CANVAS_WIDTH - 10, hudY - 4);

    // Power-up indicators
    let indicatorX = 10;

    if (this.doubleWire) { this.drawIndicator(ctx, indicatorX, '#44AAFF', 'W', this.doubleWireTimer, POWERUP_DURATION); indicatorX += 30; }
    if (this.powerWireActive) { this.drawIndicator(ctx, indicatorX, '#FF44AA', 'P', this.powerWireTimer, POWERUP_DURATION); indicatorX += 30; }
    if (this.shieldActive) { this.drawIndicator(ctx, indicatorX, '#44FFAA', 'S', this.shieldTimer, POWERUP_DURATION); indicatorX += 30; }
    if (this.clockActive) { this.drawIndicator(ctx, indicatorX, '#FFFF44', 'C', this.clockTimer, 300); }
  }

  private drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    const s = size;
    ctx.moveTo(x, y - s * 0.4);
    ctx.bezierCurveTo(x, y - s, x - s, y - s, x - s, y - s * 0.4);
    ctx.bezierCurveTo(x - s, y + s * 0.2, x, y + s * 0.6, x, y + s);
    ctx.bezierCurveTo(x, y + s * 0.6, x + s, y + s * 0.2, x + s, y - s * 0.4);
    ctx.bezierCurveTo(x + s, y - s, x, y - s, x, y - s * 0.4);
    ctx.fill();
    ctx.restore();
  }

  private drawIndicator(ctx: CanvasRenderingContext2D, x: number, color: string, letter: string, timer: number = 0, max: number = 1): void {
    const w = 24;
    const h = 10;
    const y = CEILING_Y + 2;
    const fraction = max > 0 ? timer / max : 1;

    // Background pill
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 3);
    ctx.fill();

    // Fill based on remaining time
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.roundRect(x, y, w * fraction, h, 3);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 3);
    ctx.stroke();

    // Letter
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, x + w / 2, y + h / 2);
  }

  private renderOverlay(ctx: CanvasRenderingContext2D, cfg: StageConfig): void {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    if (this.state === 'stage_intro') {
      // Fade-in via stateTimer
      const progress = 1 - this.stateTimer / INTRO_FRAMES;
      const alpha = Math.min(1, progress * 2);

      ctx.fillStyle = `rgba(0,0,0,${0.6 * alpha})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Stage name with scale-in effect
      const scale = 0.5 + Math.min(1, progress * 3) * 0.5;
      ctx.save();
      ctx.translate(cx, cy - 20);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 40px monospace';
      ctx.shadowColor = 'rgba(255,215,0,0.5)';
      ctx.shadowBlur = 15;
      ctx.fillText(cfg.name, 0, 0);
      ctx.shadowBlur = 0;
      ctx.restore();

      // "Ready?" text with blink
      if (progress > 0.3) {
        const readyAlpha = Math.sin(this.stateTimer * 0.1) * 0.3 + 0.7;
        ctx.globalAlpha = readyAlpha * alpha;
        ctx.fillStyle = '#FFF';
        ctx.font = '24px monospace';
        ctx.fillText('Ready?', cx, cy + 30);
        ctx.globalAlpha = 1;
      }

      // Decorative lines
      ctx.strokeStyle = `rgba(255,215,0,${0.3 * alpha})`;
      ctx.lineWidth = 2;
      const lineW = 120 * Math.min(1, progress * 2);
      ctx.beginPath(); ctx.moveTo(cx - lineW, cy + 55); ctx.lineTo(cx + lineW, cy + 55); ctx.stroke();
    }

    if (this.state === 'stage_clear') {
      ctx.fillStyle = 'rgba(0,0,20,0.5)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Sparkle stars effect
      const sparkleCount = 12;
      for (let i = 0; i < sparkleCount; i++) {
        const angle = (i / sparkleCount) * Math.PI * 2 + this.stateTimer * 0.05;
        const dist = 80 + Math.sin(this.stateTimer * 0.08 + i) * 20;
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist - 10;
        const sz = 2 + Math.sin(this.stateTimer * 0.1 + i * 0.5) * 1.5;
        ctx.fillStyle = `rgba(255,255,100,${0.5 + Math.sin(i + this.stateTimer * 0.15) * 0.3})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sz, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.shadowColor = '#44FF88';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#44FF88';
      ctx.font = 'bold 42px monospace';
      ctx.fillText('Stage Clear!', cx, cy - 15);
      ctx.shadowBlur = 0;
      ctx.restore();

      // Score box
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.roundRect(cx - 100, cy + 15, 200, 40, 8);
      ctx.fill();
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`Score: ${this.score}`, cx, cy + 36);
    }

    if (this.state === 'mission_clear') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Gold border frame
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.roundRect(cx - 180, cy - 80, 360, 180, 12);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner glow
      ctx.strokeStyle = 'rgba(255,215,0,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - 174, cy - 74, 348, 168, 10);
      ctx.stroke();

      // Sparkle particles around the frame
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + this.stateTimer * 0.03;
        const dist = 120 + Math.sin(this.stateTimer * 0.06 + i) * 15;
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + 10 + Math.sin(angle) * (dist * 0.6);
        ctx.fillStyle = `rgba(255,215,0,${0.3 + Math.sin(this.stateTimer * 0.1 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.shadowColor = 'rgba(255,215,0,0.8)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 46px monospace';
      ctx.fillText('MISSION 1', cx, cy - 25);
      ctx.font = 'bold 50px monospace';
      ctx.fillText('CLEAR!', cx, cy + 30);
      ctx.shadowBlur = 0;
      ctx.restore();

      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`Final Score: ${this.score}`, cx, cy + 75);
    }

    if (this.state === 'game_over') {
      // Dramatic dark overlay
      const darken = Math.min(0.8, (180 - this.stateTimer) / 60);
      ctx.fillStyle = `rgba(10,0,0,${darken})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Red vignette
      const vigGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, 350);
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(1, 'rgba(100,0,0,0.4)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.save();
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#FF3333';
      ctx.font = 'bold 52px monospace';
      ctx.fillText('GAME OVER', cx, cy - 25);
      ctx.shadowBlur = 0;
      ctx.restore();

      // Score
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '24px monospace';
      ctx.fillText(`Score: ${this.score}`, cx, cy + 25);

      // High score comparison
      const hs = this.game.getHighScore();
      if (this.score >= hs && this.score > 0) {
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('NEW HIGH SCORE!', cx, cy + 55);
      }
    }
  }

  handleKeyDown(key: string): void {
    if (key === 'Escape') {
      this.game.switchScreen(new MainScreen(this.game));
      return;
    }
    if (key === ' ' && this.state === 'playing') {
      this.fireWire();
    }
    this.inputManager.handleKeyDown(key);
  }

  private fireWire(): void {
    const playerTopY = this.player.y - this.player.height;
    if (this.doubleWire) {
      if (this.wire === null) {
        this.wire = new Wire(this.player.x, playerTopY);
        soundFx.playShoot();
      } else if (this.secondWire === null) {
        this.secondWire = new Wire(this.player.x, playerTopY);
        soundFx.playShoot();
      }
    } else {
      if (this.wire === null) {
        this.wire = new Wire(this.player.x, playerTopY);
        soundFx.playShoot();
      }
    }
  }

  handleKeyUp(key: string): void {
    this.inputManager.handleKeyUp(key);
  }
}

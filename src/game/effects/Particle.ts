export class Particle {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public life: number;
  public maxLife: number;
  public color: string;
  public size: number;

  constructor(x: number, y: number, color: string, spread: number = 100) {
    this.x = x;
    this.y = y;
    this.color = color;

    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * spread) / 60 + 0.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 1; // 약간 위로
    this.life = 20 + Math.random() * 25;
    this.maxLife = this.life;
    this.size = 2 + Math.random() * 4;
  }

  update(): boolean {
    this.vy += 0.05; // 중력
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    return this.life > 0;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
    ctx.globalAlpha = 1;
  }
}

/** 풍선 터짐: 해당 색상 파티클 생성 */
export function spawnBurstParticles(
  x: number,
  y: number,
  color: string,
  count: number = 12
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color));
  }
  return particles;
}

/** 사망: 빨/주/노/흰 파티클 20개 */
export function spawnDeathParticles(x: number, y: number): Particle[] {
  const colors = ['#ff3333', '#ff8800', '#ffdd00', '#ffffff'];
  const particles: Particle[] = [];
  for (let i = 0; i < 20; i++) {
    const color = colors[i % colors.length];
    particles.push(new Particle(x, y, color, 150));
  }
  return particles;
}

import { BalloonSize } from '../entities/Balloon';
import { BlockType } from '../entities/Block';
import { PowerUpType } from '../entities/PowerUp';

export interface BalloonConfig {
  x: number;
  y: number;
  size: BalloonSize;
  direction: 1 | -1;
}

export interface BlockConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  type: BlockType;
}

export interface StageConfig {
  name: string;
  timeLimit: number;
  balloons: BalloonConfig[];
  blocks: BlockConfig[];
  powerUpDrops: PowerUpType[];
  bgColor1: string;
  bgColor2: string;
  mountainColor: string;
}

/**
 * Mission 1 — 후지산 (Mt. Fuji)
 * 3개 스테이지: 아침 → 오후 → 밤
 */
export const STAGES: StageConfig[] = [
  // ── Stage 1: 아침 (Morning) ──
  {
    name: 'Mt. Fuji - Morning',
    timeLimit: 3600,   // 60초 × 60fps
    balloons: [
      { x: 320, y: 200, size: BalloonSize.LARGE, direction: 1 },
    ],
    blocks: [],
    powerUpDrops: [],
    bgColor1: '#87CEEB',
    bgColor2: '#E0F0FF',
    mountainColor: '#6B8E9B',
  },

  // ── Stage 2: 오후 (Afternoon) ──
  {
    name: 'Mt. Fuji - Afternoon',
    timeLimit: 5400,   // 90초 × 60fps
    balloons: [
      { x: 192, y: 200, size: BalloonSize.LARGE, direction: 1 },
      { x: 448, y: 250, size: BalloonSize.MEDIUM, direction: -1 },
    ],
    blocks: [
      { x: 270, y: 344, width: 100, height: 12, type: BlockType.Indestructible },
    ],
    powerUpDrops: [PowerUpType.DoubleWire],
    bgColor1: '#FF9944',
    bgColor2: '#FFCC88',
    mountainColor: '#7B6E5B',
  },

  // ── Stage 3: 밤 (Night) ──
  {
    name: 'Mt. Fuji - Night',
    timeLimit: 7200,   // 120초 × 60fps
    balloons: [
      { x: 160, y: 200, size: BalloonSize.LARGE, direction: 1 },
      { x: 480, y: 220, size: BalloonSize.LARGE, direction: -1 },
    ],
    blocks: [
      // 중앙 하단
      { x: 240, y: 344, width: 160, height: 12, type: BlockType.Indestructible },
      // 중앙 상단
      { x: 280, y: 264, width: 80, height: 12, type: BlockType.Destructible },
      // 좌측
      { x: 96, y: 324, width: 60, height: 12, type: BlockType.Indestructible },
      // 우측
      { x: 484, y: 324, width: 60, height: 12, type: BlockType.Indestructible },
    ],
    powerUpDrops: [PowerUpType.PowerWire, PowerUpType.BonusFruit],
    bgColor1: '#1a1a3e',
    bgColor2: '#2a2a5e',
    mountainColor: '#2B2B4B',
  },
];

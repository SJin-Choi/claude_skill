import { describe, it, expect } from 'vitest';

/**
 * Phase 6 테스트 — 플레이어 사망과 라이프
 */

import { Balloon, BalloonSize } from '../entities/Balloon';
import { Player } from '../entities/Player';
import { BALLOON_RADIUS } from '../constants';

describe('풍선-플레이어 충돌 판정', () => {
  it('플레이어 위에 풍선이 겹치면 충돌', () => {
    const player = new Player();
    const b = new Balloon(player.x, player.y - player.height / 2, BalloonSize.LARGE, 1);
    const bounds = {
      left: player.x - player.width / 2,
      top: player.y - player.height,
      right: player.x + player.width / 2,
      bottom: player.y,
    };
    expect(b.hitPlayer(bounds)).toBe(true);
  });

  it('플레이어에서 멀리 떨어진 풍선은 충돌 없음', () => {
    const player = new Player();
    const b = new Balloon(100, 100, BalloonSize.LARGE, 1);
    const bounds = {
      left: player.x - player.width / 2,
      top: player.y - player.height,
      right: player.x + player.width / 2,
      bottom: player.y,
    };
    expect(b.hitPlayer(bounds)).toBe(false);
  });

  it('비활성 풍선은 충돌하지 않음', () => {
    const player = new Player();
    const b = new Balloon(player.x, player.y - 20, BalloonSize.LARGE, 1);
    b.active = false;
    const bounds = {
      left: player.x - player.width / 2,
      top: player.y - player.height,
      right: player.x + player.width / 2,
      bottom: player.y,
    };
    expect(b.hitPlayer(bounds)).toBe(false);
  });

  it('풍선이 플레이어 사각형 가장자리에 닿으면 충돌', () => {
    const player = new Player();
    const r = BALLOON_RADIUS[BalloonSize.LARGE]; // 40
    // 풍선 중심을 플레이어 오른쪽 가장자리 + radius - 1 에 배치
    const b = new Balloon(
      player.x + player.width / 2 + r - 1,
      player.y - player.height / 2,
      BalloonSize.LARGE,
      1
    );
    const bounds = {
      left: player.x - player.width / 2,
      top: player.y - player.height,
      right: player.x + player.width / 2,
      bottom: player.y,
    };
    expect(b.hitPlayer(bounds)).toBe(true);
  });
});

describe('Player getBounds', () => {
  it('getBounds()가 올바른 사각형 반환', () => {
    const player = new Player();
    const bounds = player.getBounds();
    expect(bounds.left).toBe(player.x - player.width / 2);
    expect(bounds.right).toBe(player.x + player.width / 2);
    expect(bounds.top).toBe(player.y - player.height);
    expect(bounds.bottom).toBe(player.y);
  });
});

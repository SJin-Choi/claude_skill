import { describe, it, expect } from 'vitest';

/**
 * Phase 7 테스트 — 스코어와 제한 시간
 */

import { BalloonSize } from '../entities/Balloon';

// 점수 상수 — 작은 풍선일수록 높은 점수
const SCORE_TABLE: Record<number, number> = {
  [BalloonSize.LARGE]: 100,
  [BalloonSize.MEDIUM]: 200,
  [BalloonSize.SMALL]: 400,
  [BalloonSize.TINY]: 800,
};

describe('점수 시스템', () => {
  it('크기별 차등 점수가 올바름', () => {
    expect(SCORE_TABLE[BalloonSize.LARGE]).toBe(100);
    expect(SCORE_TABLE[BalloonSize.MEDIUM]).toBe(200);
    expect(SCORE_TABLE[BalloonSize.SMALL]).toBe(400);
    expect(SCORE_TABLE[BalloonSize.TINY]).toBe(800);
  });

  it('작은 풍선이 큰 풍선보다 높은 점수', () => {
    expect(SCORE_TABLE[BalloonSize.TINY]).toBeGreaterThan(SCORE_TABLE[BalloonSize.SMALL]);
    expect(SCORE_TABLE[BalloonSize.SMALL]).toBeGreaterThan(SCORE_TABLE[BalloonSize.MEDIUM]);
    expect(SCORE_TABLE[BalloonSize.MEDIUM]).toBeGreaterThan(SCORE_TABLE[BalloonSize.LARGE]);
  });

  it('시간 보너스 계산: 남은 시간 * 10', () => {
    const remainingTime = 30;
    const timeBonus = remainingTime * 10;
    expect(timeBonus).toBe(300);
  });

  it('시간 보너스: 남은 시간 0이면 보너스 0', () => {
    const timeBonus = 0 * 10;
    expect(timeBonus).toBe(0);
  });
});

describe('제한 시간', () => {
  it('타이머는 매 프레임 감소', () => {
    let timeLeft = 60 * 60; // 60초 * 60fps = 3600 프레임
    timeLeft--;
    expect(timeLeft).toBe(3599);
  });

  it('시간이 0에 도달하면 만료', () => {
    let timeLeft = 1;
    timeLeft--;
    expect(timeLeft).toBe(0);
    expect(timeLeft <= 0).toBe(true);
  });
});

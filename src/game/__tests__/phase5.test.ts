import { describe, it, expect } from 'vitest';

/**
 * Phase 5 테스트 — 와이어↔풍선 충돌과 분열
 */

import { Balloon, BalloonSize } from '../entities/Balloon';
import { BALLOON_RADIUS } from '../constants';

describe('Balloon 충돌 판정', () => {
  it('와이어 끝이 풍선에 닿으면 충돌', () => {
    const b = new Balloon(300, 200, BalloonSize.LARGE, 1);
    // 와이어 끝(topY)이 풍선 중심 근처에 도달
    expect(b.hitByWire(300, 195, 400)).toBe(true);
  });

  it('와이어가 풍선 밖을 지나가면 충돌 없음', () => {
    const b = new Balloon(300, 200, BalloonSize.LARGE, 1);
    // 와이어 x=100 (풍선에서 멀리)
    expect(b.hitByWire(100, 100, 400)).toBe(false);
  });

  it('와이어 topY가 풍선보다 아래면 충돌 없음', () => {
    const b = new Balloon(300, 200, BalloonSize.LARGE, 1);
    // 와이어가 아직 풍선까지 도달 안함
    expect(b.hitByWire(300, 300, 400)).toBe(false);
  });

  it('비활성 풍선은 충돌하지 않음', () => {
    const b = new Balloon(300, 200, BalloonSize.LARGE, 1);
    b.active = false;
    expect(b.hitByWire(300, 100, 400)).toBe(false);
  });

  it('와이어 끝이 풍선 가장자리에 걸치면 충돌', () => {
    const b = new Balloon(300, 200, BalloonSize.LARGE, 1);
    const r = BALLOON_RADIUS[BalloonSize.LARGE]; // 40
    // 와이어 끝이 풍선 높이에 도달 + x가 가장자리 근처
    expect(b.hitByWire(300 + r - 1, 200, 400)).toBe(true);
  });
});

describe('Balloon 분열', () => {
  it('LARGE 풍선 분열 시 MEDIUM 2개 생성', () => {
    const b = new Balloon(300, 200, BalloonSize.LARGE, 1);
    const children = b.split();
    expect(children).toHaveLength(2);
    expect(children[0].size).toBe(BalloonSize.MEDIUM);
    expect(children[1].size).toBe(BalloonSize.MEDIUM);
  });

  it('MEDIUM 풍선 분열 시 SMALL 2개 생성', () => {
    const b = new Balloon(300, 200, BalloonSize.MEDIUM, 1);
    const children = b.split();
    expect(children).toHaveLength(2);
    expect(children[0].size).toBe(BalloonSize.SMALL);
    expect(children[1].size).toBe(BalloonSize.SMALL);
  });

  it('SMALL 풍선 분열 시 TINY 2개 생성', () => {
    const b = new Balloon(300, 200, BalloonSize.SMALL, 1);
    const children = b.split();
    expect(children).toHaveLength(2);
    expect(children[0].size).toBe(BalloonSize.TINY);
    expect(children[1].size).toBe(BalloonSize.TINY);
  });

  it('TINY 풍선은 분열 없이 빈 배열 반환 (소멸)', () => {
    const b = new Balloon(300, 200, BalloonSize.TINY, 1);
    const children = b.split();
    expect(children).toHaveLength(0);
  });

  it('분열된 풍선은 좌우로 갈라짐 (vx 부호가 다름)', () => {
    const b = new Balloon(300, 200, BalloonSize.LARGE, 1);
    const children = b.split();
    expect(children[0].vx).toBeLessThan(0);  // 왼쪽
    expect(children[1].vx).toBeGreaterThan(0); // 오른쪽
  });

  it('분열된 풍선의 위치는 부모 풍선과 동일', () => {
    const b = new Balloon(300, 200, BalloonSize.LARGE, 1);
    const children = b.split();
    expect(children[0].x).toBe(300);
    expect(children[0].y).toBe(200);
    expect(children[1].x).toBe(300);
    expect(children[1].y).toBe(200);
  });

  it('분열된 풍선은 위로 약간 튀어오름 (vy < 0)', () => {
    const b = new Balloon(300, 200, BalloonSize.LARGE, 1);
    const children = b.split();
    expect(children[0].vy).toBeLessThan(0);
    expect(children[1].vy).toBeLessThan(0);
  });
});

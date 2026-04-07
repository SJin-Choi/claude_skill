import { describe, it, expect } from 'vitest';

/**
 * Phase 4 테스트 — 풍선 렌더링과 바운스 물리
 */

import { Balloon, BalloonSize } from '../entities/Balloon';
import {
  GRAVITY, BALLOON_RADIUS, BALLOON_SPEED_X, BALLOON_BOUNCE_VY,
  CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, CEILING_Y,
} from '../constants';

const FLOOR_Y = CANVAS_HEIGHT - GROUND_Y; // 464

describe('Balloon', () => {
  it('생성 시 크기별 속성이 올바름 (LARGE)', () => {
    const b = new Balloon(100, 200, BalloonSize.LARGE, 1);
    expect(b.radius).toBe(BALLOON_RADIUS[0]); // 40
    expect(b.vx).toBe(BALLOON_SPEED_X[0]);    // 1.5
    expect(b.vy).toBe(0);
    expect(b.active).toBe(true);
  });

  it('크기별 반지름 매핑이 올바름', () => {
    const sizes = [BalloonSize.LARGE, BalloonSize.MEDIUM, BalloonSize.SMALL, BalloonSize.TINY];
    for (const s of sizes) {
      const b = new Balloon(100, 200, s, 1);
      expect(b.radius).toBe(BALLOON_RADIUS[s]);
    }
  });

  it('direction -1이면 vx가 음수', () => {
    const b = new Balloon(100, 200, BalloonSize.LARGE, -1);
    expect(b.vx).toBe(-BALLOON_SPEED_X[0]);
  });

  it('중력 적용: update 후 vy가 GRAVITY만큼 증가', () => {
    const b = new Balloon(300, 200, BalloonSize.MEDIUM, 1);
    b.update();
    expect(b.vy).toBeCloseTo(GRAVITY);
  });

  it('위치 업데이트: x += vx, y += vy', () => {
    const b = new Balloon(300, 200, BalloonSize.MEDIUM, 1);
    const prevX = b.x;
    const prevY = b.y;
    b.update();
    // 중력 적용 후 이동이므로 vy = GRAVITY, y = prevY + GRAVITY
    expect(b.x).toBeCloseTo(prevX + BALLOON_SPEED_X[1]);
    expect(b.y).toBeCloseTo(prevY + GRAVITY);
  });

  describe('바닥 바운스', () => {
    it('바닥에 닿으면 vy가 음수로 반전 (위로 반발)', () => {
      const b = new Balloon(300, FLOOR_Y - 10, BalloonSize.LARGE, 1);
      b.vy = 5; // 아래로 이동중
      b.update();
      expect(b.vy).toBeLessThan(0);
    });

    it('바운스 후 풍선이 바닥 안에 머무름', () => {
      const b = new Balloon(300, FLOOR_Y - 10, BalloonSize.LARGE, 1);
      b.vy = 10;
      b.update();
      expect(b.y + b.radius).toBeLessThanOrEqual(FLOOR_Y);
    });

    it('대형 풍선의 바운스 vy가 최소 풍선보다 큼 (더 높이 뜀)', () => {
      const large = new Balloon(100, FLOOR_Y - 5, BalloonSize.LARGE, 1);
      large.vy = 10;
      large.update();

      const tiny = new Balloon(100, FLOOR_Y - 5, BalloonSize.TINY, 1);
      tiny.vy = 10;
      tiny.update();

      expect(Math.abs(large.vy)).toBeGreaterThan(Math.abs(tiny.vy));
    });
  });

  describe('벽 반사', () => {
    it('좌벽: x - radius <= 0이면 vx가 양수로 반전', () => {
      const r = BALLOON_RADIUS[BalloonSize.MEDIUM];
      const b = new Balloon(r - 1, 200, BalloonSize.MEDIUM, -1);
      b.update();
      expect(b.vx).toBeGreaterThan(0);
      expect(b.x).toBeGreaterThanOrEqual(b.radius);
    });

    it('우벽: x + radius >= CANVAS_WIDTH이면 vx가 음수로 반전', () => {
      const r = BALLOON_RADIUS[BalloonSize.MEDIUM];
      const b = new Balloon(CANVAS_WIDTH - r + 1, 200, BalloonSize.MEDIUM, 1);
      b.update();
      expect(b.vx).toBeLessThan(0);
      expect(b.x).toBeLessThanOrEqual(CANVAS_WIDTH - b.radius);
    });
  });

  describe('천장 반사', () => {
    it('천장에 닿으면 vy가 양수로 반전 (아래로)', () => {
      const r = BALLOON_RADIUS[BalloonSize.SMALL];
      const b = new Balloon(300, CEILING_Y + r - 1, BalloonSize.SMALL, 1);
      b.vy = -5; // 위로 이동중
      b.update();
      expect(b.vy).toBeGreaterThan(0);
      expect(b.y - b.radius).toBeGreaterThanOrEqual(CEILING_Y);
    });
  });

  describe('포물선 궤적', () => {
    it('바운스 후 y값이 감소했다 다시 증가하는 패턴', () => {
      const b = new Balloon(300, FLOOR_Y - BALLOON_RADIUS[0], BalloonSize.LARGE, 1);
      b.vy = BALLOON_BOUNCE_VY[0]; // 바운스 초기 속도

      // 바운스 한 주기 이상 시뮬레이션
      const yValues: number[] = [];
      for (let i = 0; i < 300; i++) {
        b.update();
        yValues.push(b.y);
      }

      // 초반에는 y가 감소 (위로 올라감)
      expect(yValues[10]).toBeLessThan(yValues[0]);
      // 충분한 프레임 후 바닥으로 돌아옴
      const lastY = yValues[yValues.length - 1];
      const minY = Math.min(...yValues);
      expect(lastY).toBeGreaterThan(minY);
    });
  });

  describe('이동 속도 차이', () => {
    it('TINY 풍선이 LARGE 풍선보다 수평 이동 거리가 큼', () => {
      const large = new Balloon(300, 200, BalloonSize.LARGE, 1);
      const tiny = new Balloon(300, 200, BalloonSize.TINY, 1);

      for (let i = 0; i < 10; i++) {
        large.update();
        tiny.update();
      }

      const largeDist = Math.abs(large.x - 300);
      const tinyDist = Math.abs(tiny.x - 300);
      expect(tinyDist).toBeGreaterThan(largeDist);
    });
  });

  it('비활성화된 풍선은 update 되지 않음', () => {
    const b = new Balloon(300, 200, BalloonSize.LARGE, 1);
    b.active = false;
    const prevX = b.x;
    const prevY = b.y;
    b.update();
    expect(b.x).toBe(prevX);
    expect(b.y).toBe(prevY);
  });
});

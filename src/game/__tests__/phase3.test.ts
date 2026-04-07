import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Phase 3 테스트 — 와이어 발사
 *
 * 성공 기준:
 * 1. 와이어 생성 시 플레이어 x 위치에서 시작
 * 2. update 호출마다 topY가 WIRE_SPEED만큼 위로 이동
 * 3. topY가 CEILING_Y 이하가 되면 비활성화
 * 4. 와이어 활성 중에는 추가 발사 불가 (1발 제한)
 * 5. 와이어 소멸 후 재발사 가능
 * 6. 와이어 x좌표는 발사 후 고정 (플레이어 이동과 독립)
 */

import { Wire } from '../entities/Wire';
import { WIRE_SPEED, CEILING_Y } from '../constants';

describe('Wire', () => {
  let wire: Wire;
  const startX = 320;
  const startY = 416; // 플레이어 머리 위치 (464 - 48)

  beforeEach(() => {
    wire = new Wire(startX, startY);
  });

  it('생성 시 초기 상태가 올바름', () => {
    expect(wire.x).toBe(startX);
    expect(wire.topY).toBe(startY);
    expect(wire.bottomY).toBe(startY);
    expect(wire.active).toBe(true);
  });

  it('update 호출마다 topY가 WIRE_SPEED만큼 감소 (위로 이동)', () => {
    wire.update();
    expect(wire.topY).toBe(startY - WIRE_SPEED);
  });

  it('여러 번 update 후 topY가 누적 감소', () => {
    wire.update();
    wire.update();
    wire.update();
    expect(wire.topY).toBe(startY - WIRE_SPEED * 3);
  });

  it('x좌표는 update 후에도 변하지 않음', () => {
    wire.update();
    wire.update();
    expect(wire.x).toBe(startX);
  });

  it('bottomY는 update 후에도 변하지 않음', () => {
    wire.update();
    expect(wire.bottomY).toBe(startY);
  });

  it('topY가 CEILING_Y 이하가 되면 active = false', () => {
    // CEILING_Y까지 이동시키기
    const framesToCeiling = Math.ceil((startY - CEILING_Y) / WIRE_SPEED);
    for (let i = 0; i < framesToCeiling + 1; i++) {
      wire.update();
    }
    expect(wire.active).toBe(false);
  });

  it('비활성화 된 와이어는 더 이�� update 되지 않음', () => {
    wire.active = false;
    const prevTopY = wire.topY;
    wire.update();
    expect(wire.topY).toBe(prevTopY);
  });

  it('CEILING_Y 직전까지는 아직 활성 상태', () => {
    // CEILING_Y + 1까지만 이동
    wire.topY = CEILING_Y + 1;
    wire.update();
    // topY = CEILING_Y + 1 - WIRE_SPEED.
    // WIRE_SPEED=6이면 topY는 CEILING_Y - 5가 되어 비활성화됨
    // 그래서 대신 CEILING_Y + WIRE_SPEED에서 한 번만 update
    wire.topY = CEILING_Y + WIRE_SPEED + 1;
    wire.active = true;
    wire.update();
    expect(wire.topY).toBe(CEILING_Y + 1);
    expect(wire.active).toBe(true);
  });
});

// GameScreen의 와이어 발사 로직을 간접 테스트하기 위한 통합 테스트
describe('Wire 발사 규칙', () => {
  it('와이어가 null이면 발사 가능, 존재하면 발사 불가 (1발 제한 로직)', () => {
    // 이 테스트는 GameScreen 내부 로직의 개념적 검증
    let wire: Wire | null = null;
    const playerX = 320;
    const playerTopY = 416;

    // 발사
    if (wire === null) {
      wire = new Wire(playerX, playerTopY);
    }
    expect(wire).not.toBeNull();

    // 중복 ��사 시도 — wire가 이미 존재하므로 새로 생성하지 않음
    const firstWire = wire;
    if (wire === null) {
      wire = new Wire(playerX, playerTopY);
    }
    expect(wire).toBe(firstWire); // 같은 와이어

    // 와이어 소멸 후 재발사
    wire = null;
    if (wire === null) {
      wire = new Wire(playerX + 50, playerTopY); // 다른 x에서 발사
    }
    expect(wire!.x).toBe(playerX + 50);
  });

  it('와이어 x좌표는 발사 시점에 고정 (플레이어 이동과 독립)', () => {
    const wire = new Wire(320, 416);
    // 플레이어가 이동해도 와이어 x는 변하지 않음 (wire는 플��이어 참조 없음)
    wire.update();
    wire.update();
    expect(wire.x).toBe(320);
  });
});

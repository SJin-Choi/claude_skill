import { describe, it, expect } from 'vitest';

/**
 * Phase 11 테스트 — PowerUp 엔티티
 */

import { PowerUp, PowerUpType } from '../entities/PowerUp';

describe('PowerUp 생성', () => {
  it('생성 시 속성이 올바르게 설정됨', () => {
    const pu = new PowerUp(100, 50, PowerUpType.Shield);
    expect(pu.x).toBe(100);
    expect(pu.y).toBe(50);
    expect(pu.type).toBe(PowerUpType.Shield);
    expect(pu.active).toBe(true);
    expect(pu.lifetime).toBe(480);
  });
});

describe('PowerUp 낙하', () => {
  it('update() 호출 시 y가 FALL_SPEED(1.5)만큼 증가', () => {
    const pu = new PowerUp(100, 50, PowerUpType.DoubleWire);
    const initialY = pu.y;
    pu.update();
    expect(pu.y).toBe(initialY + 1.5);
  });

  it('바닥(464 - 12 = 452)에 도달하면 y가 더 이상 증가하지 않음', () => {
    const pu = new PowerUp(100, 451, PowerUpType.PowerWire);
    pu.update(); // y = 452.5 → 클램프 → 452
    expect(pu.y).toBe(452);
    pu.update();
    expect(pu.y).toBe(452);
  });
});

describe('PowerUp 수명', () => {
  it('update() 호출마다 lifetime이 1씩 감소', () => {
    const pu = new PowerUp(100, 50, PowerUpType.Clock);
    pu.update();
    expect(pu.lifetime).toBe(479);
    pu.update();
    expect(pu.lifetime).toBe(478);
  });

  it('lifetime이 0이 되면 active가 false', () => {
    const pu = new PowerUp(100, 50, PowerUpType.BonusFruit);
    pu.lifetime = 1;
    pu.update();
    expect(pu.lifetime).toBe(0);
    expect(pu.active).toBe(false);
  });
});

describe('PowerUp 충돌 판정', () => {
  it('플레이어 근처에 있으면 hitPlayer true', () => {
    const pu = new PowerUp(100, 100, PowerUpType.Shield);
    const bounds = { left: 90, top: 90, right: 122, bottom: 138 };
    expect(pu.hitPlayer(bounds)).toBe(true);
  });

  it('플레이어가 멀리 있으면 hitPlayer false', () => {
    const pu = new PowerUp(100, 100, PowerUpType.Shield);
    const bounds = { left: 400, top: 400, right: 432, bottom: 448 };
    expect(pu.hitPlayer(bounds)).toBe(false);
  });

  it('비활성 PowerUp은 hitPlayer가 항상 false', () => {
    const pu = new PowerUp(100, 100, PowerUpType.Shield);
    pu.active = false;
    const bounds = { left: 90, top: 90, right: 122, bottom: 138 };
    expect(pu.hitPlayer(bounds)).toBe(false);
  });
});

describe('PowerUpType 열거형', () => {
  it('각 타입별 값이 올바름', () => {
    expect(PowerUpType.DoubleWire).toBe('double_wire');
    expect(PowerUpType.PowerWire).toBe('power_wire');
    expect(PowerUpType.Shield).toBe('shield');
    expect(PowerUpType.Clock).toBe('clock');
    expect(PowerUpType.BonusFruit).toBe('bonus_fruit');
  });
});

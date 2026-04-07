import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Phase 2 테스트 — 게임 캔버스와 플레이어 렌더링
 *
 * 성공 기준:
 * 1. 플레이어가 화면 하단 중앙에 초기 배치
 * 2. ArrowLeft/Right로 좌우 이동
 * 3. 키를 누르고 있으면 연속 이동 (매 update 호출마다 이동)
 * 4. 화면 좌측/우측 경계 밖으로 이동 불가
 * 5. InputManager가 키 상태를 올바르게 추적
 */

// === InputManager 테스트 ===
// InputManager는 아직 구현 전이므로 import 경로만 준비
import { InputManager } from '../input/InputManager';

describe('InputManager', () => {
  let input: InputManager;

  beforeEach(() => {
    input = new InputManager();
  });

  it('초기 상태에서 아무 키도 눌리지 않음', () => {
    expect(input.isPressed('ArrowLeft')).toBe(false);
    expect(input.isPressed('ArrowRight')).toBe(false);
  });

  it('keyDown 호출 후 해당 키가 눌린 상태', () => {
    input.handleKeyDown('ArrowLeft');
    expect(input.isPressed('ArrowLeft')).toBe(true);
    expect(input.isPressed('ArrowRight')).toBe(false);
  });

  it('keyUp 호출 후 해당 키가 해제된 상태', () => {
    input.handleKeyDown('ArrowLeft');
    input.handleKeyUp('ArrowLeft');
    expect(input.isPressed('ArrowLeft')).toBe(false);
  });

  it('getPressedKeys()로 현재 눌린 키 Set 반환', () => {
    input.handleKeyDown('ArrowLeft');
    input.handleKeyDown('ArrowRight');
    const keys = input.getPressedKeys();
    expect(keys.has('ArrowLeft')).toBe(true);
    expect(keys.has('ArrowRight')).toBe(true);
  });

  it('clear()로 모든 키 상태 초기화', () => {
    input.handleKeyDown('ArrowLeft');
    input.handleKeyDown('ArrowRight');
    input.clear();
    expect(input.isPressed('ArrowLeft')).toBe(false);
    expect(input.isPressed('ArrowRight')).toBe(false);
  });
});

// === Player 테스트 ===
import { Player } from '../entities/Player';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SPEED, PLAYER_WIDTH, GROUND_Y } from '../constants';

describe('Player', () => {
  let player: Player;

  beforeEach(() => {
    player = new Player();
  });

  it('초기 위치는 화면 하단 중앙', () => {
    expect(player.x).toBe(CANVAS_WIDTH / 2);
    expect(player.y).toBe(CANVAS_HEIGHT - GROUND_Y);
  });

  it('ArrowRight 키가 눌리면 오른쪽으로 이동', () => {
    const prevX = player.x;
    const keys = new Set(['ArrowRight']);
    player.update(keys);
    expect(player.x).toBe(prevX + PLAYER_SPEED);
  });

  it('ArrowLeft 키가 눌리면 왼쪽으로 이동', () => {
    const prevX = player.x;
    const keys = new Set(['ArrowLeft']);
    player.update(keys);
    expect(player.x).toBe(prevX - PLAYER_SPEED);
  });

  it('키를 누르지 않으면 이동하지 않음', () => {
    const prevX = player.x;
    const keys = new Set<string>();
    player.update(keys);
    expect(player.x).toBe(prevX);
  });

  it('좌우 동시에 누르면 이동하지 않음', () => {
    const prevX = player.x;
    const keys = new Set(['ArrowLeft', 'ArrowRight']);
    player.update(keys);
    expect(player.x).toBe(prevX);
  });

  it('왼쪽 경계를 넘어가지 않음', () => {
    player.x = 5;
    const keys = new Set(['ArrowLeft']);
    player.update(keys);
    expect(player.x).toBeGreaterThanOrEqual(PLAYER_WIDTH / 2);
  });

  it('오른쪽 경계를 넘어가지 않음', () => {
    player.x = CANVAS_WIDTH - 5;
    const keys = new Set(['ArrowRight']);
    player.update(keys);
    expect(player.x).toBeLessThanOrEqual(CANVAS_WIDTH - PLAYER_WIDTH / 2);
  });

  it('연속 update 호출 시 매번 이동 (부드러운 이동)', () => {
    const startX = player.x;
    const keys = new Set(['ArrowRight']);
    player.update(keys);
    player.update(keys);
    player.update(keys);
    expect(player.x).toBeCloseTo(startX + PLAYER_SPEED * 3);
  });

  it('reset() 호출 시 초기 위치로 복원', () => {
    player.x = 100;
    player.reset();
    expect(player.x).toBe(CANVAS_WIDTH / 2);
    expect(player.y).toBe(CANVAS_HEIGHT - GROUND_Y);
  });
});

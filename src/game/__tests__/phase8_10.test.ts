import { describe, it, expect } from 'vitest';
import { Block, BlockType } from '../entities/Block';

/**
 * Phase 8-10 테스트 — Block 엔티티
 */

describe('Block 엔티티', () => {
  it('생성 시 속성이 올바르게 설정됨', () => {
    const block = new Block(100, 200, 60, 20, BlockType.Indestructible);

    expect(block.x).toBe(100);
    expect(block.y).toBe(200);
    expect(block.width).toBe(60);
    expect(block.height).toBe(20);
    expect(block.type).toBe(BlockType.Indestructible);
    expect(block.active).toBe(true);
  });

  it('Destructible 타입으로 생성 가능', () => {
    const block = new Block(50, 100, 80, 30, BlockType.Destructible);

    expect(block.type).toBe(BlockType.Destructible);
  });

  it('Indestructible과 Destructible 타입이 구분됨', () => {
    expect(BlockType.Indestructible).toBe('indestructible');
    expect(BlockType.Destructible).toBe('destructible');
    expect(BlockType.Indestructible).not.toBe(BlockType.Destructible);
  });
});

describe('Block.intersectsWire', () => {
  it('와이어가 블록 가로 범위 안이고 하단에 도달하면 hit=true', () => {
    const block = new Block(100, 200, 60, 20, BlockType.Indestructible);
    // wireX=130 은 100~160 범위 안, wireTopY=220 은 220(=200+20) 이하
    const result = block.intersectsWire(130, 220);

    expect(result.hit).toBe(true);
  });

  it('와이어가 블록 상단을 지나쳐도 hit=true', () => {
    const block = new Block(100, 200, 60, 20, BlockType.Indestructible);
    // wireTopY=200 은 220 이하이므로 hit
    const result = block.intersectsWire(130, 200);

    expect(result.hit).toBe(true);
  });

  it('와이어가 블록 가로 범위 밖이면 hit=false', () => {
    const block = new Block(100, 200, 60, 20, BlockType.Indestructible);
    // wireX=50 은 100~160 범위 밖
    const result = block.intersectsWire(50, 210);

    expect(result.hit).toBe(false);
  });

  it('와이어가 블록 하단에 아직 도달하지 않으면 hit=false', () => {
    const block = new Block(100, 200, 60, 20, BlockType.Indestructible);
    // wireTopY=250 은 220(=200+20)보다 크므로 아직 도달 안 함
    const result = block.intersectsWire(130, 250);

    expect(result.hit).toBe(false);
  });

  it('비활성 블록은 항상 hit=false 반환', () => {
    const block = new Block(100, 200, 60, 20, BlockType.Destructible);
    block.active = false;

    const result = block.intersectsWire(130, 210);

    expect(result.hit).toBe(false);
    expect(result.blockBottomY).toBe(0);
  });

  it('blockBottomY가 block.y + block.height 값을 반환', () => {
    const block = new Block(100, 200, 60, 20, BlockType.Indestructible);
    const result = block.intersectsWire(130, 210);

    expect(result.blockBottomY).toBe(220); // 200 + 20
  });

  it('hit=false일 때 blockBottomY는 0', () => {
    const block = new Block(100, 200, 60, 20, BlockType.Indestructible);
    const result = block.intersectsWire(50, 210);

    expect(result.blockBottomY).toBe(0);
  });

  it('와이어가 블록 경계선 위에 있으면 hit=true', () => {
    const block = new Block(100, 200, 60, 20, BlockType.Destructible);
    // wireX=100 (좌측 경계), wireTopY=220 (하단 경계)
    const result = block.intersectsWire(100, 220);

    expect(result.hit).toBe(true);
  });
});

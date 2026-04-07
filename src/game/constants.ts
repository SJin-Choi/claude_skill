export const CANVAS_WIDTH = 640;
export const CANVAS_HEIGHT = 480;
export const PLAYER_WIDTH = 32;
export const PLAYER_HEIGHT = 48;
export const PLAYER_SPEED = 2.2;
export const GROUND_Y = 16; // 바닥으로부터의 여백
export const WIRE_SPEED = 4.5;
export const WIRE_WIDTH = 2;
export const CEILING_Y = 42;

// 풍선 물리
export const GRAVITY = 0.09;
export const BOUNCE_DAMPING = 1.0;

// 풍선 크기별 설정 [대, 중, 소, 최소]
export const BALLOON_RADIUS = [40, 28, 18, 10] as const;
export const BALLOON_SPEED_X = [0.65, 0.85, 1.1, 1.35] as const;
export const BALLOON_BOUNCE_VY = [-7.5, -6.5, -5.5, -4.5] as const;
export const BALLOON_COLORS = ['#ff4444', '#ff8844', '#44bb44', '#4488ff'] as const;

// 점수 시스템
export const SCORE_TABLE = [100, 200, 400, 800] as const; // [대, 중, 소, 최소]
export const TIME_BONUS_MULTIPLIER = 10;
export const STAGE_TIME_LIMIT = 60 * 60; // 60초 * 60fps

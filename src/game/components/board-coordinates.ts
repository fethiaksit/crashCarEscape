import type { LevelDefinition } from '@/src/game/types';

export type BoardTransform = {
  originX: number;
  originY: number;
  scale: number;
  offsetX: number;
  offsetY: number;
};

const DEFAULT_TRANSFORM: BoardTransform = {
  originX: 0,
  originY: 0,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

export type LevelBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
};

export function getLevelBounds(level: LevelDefinition): LevelBounds {
  const xs = [
    0,
    level.boardSize.width - 1,
    ...level.cars.map((item) => item.position.x),
    ...level.parkingSpots.map((item) => item.position.x),
    ...level.obstacles.map((item) => item.position.x),
  ];
  const ys = [
    0,
    level.boardSize.height - 1,
    ...level.cars.map((item) => item.position.y),
    ...level.parkingSpots.map((item) => item.position.y),
    ...level.obstacles.map((item) => item.position.y),
  ];

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

export function getResponsiveBoardTransform({
  viewportWidth,
  viewportHeight,
  levelBounds,
  tileSize,
  padding = 8,
  minScale = 0.45,
  maxScale = 1.3,
}: {
  viewportWidth: number;
  viewportHeight: number;
  levelBounds: LevelBounds;
  tileSize: number;
  padding?: number;
  minScale?: number;
  maxScale?: number;
}): BoardTransform {
  const safeWidth = Math.max(1, viewportWidth - padding * 2);
  const safeHeight = Math.max(1, viewportHeight - padding * 2);
  const rawWidth = Math.max(1, levelBounds.width * tileSize);
  const rawHeight = Math.max(1, levelBounds.height * tileSize);

  const computedScale = Math.min(safeWidth / rawWidth, safeHeight / rawHeight);
  const scale = Math.max(minScale, Math.min(maxScale, computedScale));

  const scaledWidth = levelBounds.width * tileSize * scale;
  const scaledHeight = levelBounds.height * tileSize * scale;

  return {
    originX: (viewportWidth - scaledWidth) / 2,
    originY: (viewportHeight - scaledHeight) / 2,
    scale,
    offsetX: levelBounds.minX,
    offsetY: levelBounds.minY,
  };
}

export function worldToScreen(tileX: number, tileY: number, tileSize: number, transform: BoardTransform = DEFAULT_TRANSFORM) {
  return {
    x: transform.originX + (tileX - transform.offsetX) * tileSize * transform.scale,
    y: transform.originY + (tileY - transform.offsetY) * tileSize * transform.scale,
  };
}

export function screenToWorld(
  screenX: number,
  screenY: number,
  tileSize: number,
  transform: BoardTransform = DEFAULT_TRANSFORM,
) {
  const scaledTileSize = tileSize * transform.scale;

  return {
    x: transform.offsetX + (screenX - transform.originX) / scaledTileSize,
    y: transform.offsetY + (screenY - transform.originY) / scaledTileSize,
  };
}

export const toBoardPixels = worldToScreen;

export function getBoardPixelSize(tileCount: number, tileSize: number, transform: BoardTransform = DEFAULT_TRANSFORM) {
  return tileCount * tileSize * transform.scale;
}

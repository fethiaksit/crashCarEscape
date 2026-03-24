export type BoardTransform = {
  originX: number;
  originY: number;
  scale: number;
};

const DEFAULT_TRANSFORM: BoardTransform = {
  originX: 0,
  originY: 0,
  scale: 1,
};

export function toBoardPixels(tileX: number, tileY: number, tileSize: number, transform: BoardTransform = DEFAULT_TRANSFORM) {
  return {
    x: transform.originX + tileX * tileSize * transform.scale,
    y: transform.originY + tileY * tileSize * transform.scale,
  };
}

export function getBoardPixelSize(tileCount: number, tileSize: number, transform: BoardTransform = DEFAULT_TRANSFORM) {
  return tileCount * tileSize * transform.scale;
}

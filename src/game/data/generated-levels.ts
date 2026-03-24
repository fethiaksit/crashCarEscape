import type { LevelDefinition, Obstacle, Position } from '@/src/game/types';

const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#f97316', '#06b6d4'];
const LABELS = ['R', 'G', 'B', 'Y', 'P', 'O', 'C'];

const keyOf = (p: Position) => `${p.x},${p.y}`;

const add = (set: Set<string>, x: number, y: number, width: number, height: number) => {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  set.add(`${x},${y}`);
};

const line = (set: Set<string>, from: Position, to: Position, width: number, height: number) => {
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  let x = from.x;
  let y = from.y;
  add(set, x, y, width, height);

  while (x !== to.x || y !== to.y) {
    if (x !== to.x) x += dx;
    if (y !== to.y) y += dy;
    add(set, x, y, width, height);
  }
};

const getCarCount = (levelNumber: number) => {
  if (levelNumber <= 3) return 2;
  if (levelNumber <= 10) return 3;
  if (levelNumber <= 20) return 4;
  if (levelNumber <= 40) return 5;
  if (levelNumber <= 70) return 6;
  return 7;
};

const getBoardSize = (levelNumber: number) => {
  if (levelNumber <= 10) return { width: 7 + (levelNumber % 2), height: 7 + ((levelNumber + 1) % 2) };
  if (levelNumber <= 30) return { width: 8 + (levelNumber % 2), height: 8 + ((levelNumber + 1) % 2) };
  if (levelNumber <= 60) return { width: 9, height: 9 + (levelNumber % 2) };
  return { width: 10, height: 10 };
};

const getDifficultyTag = (levelNumber: number) => {
  if (levelNumber <= 3) return 'Intro';
  if (levelNumber <= 10) return 'Tactical';
  if (levelNumber <= 20) return 'Challenging';
  if (levelNumber <= 40) return 'Hard';
  if (levelNumber <= 70) return 'Very Hard';
  return 'Expert';
};

const patternA = (open: Set<string>, width: number, height: number, phase: number) => {
  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);
  line(open, { x: 1, y: midY }, { x: width - 2, y: midY }, width, height);
  line(open, { x: midX, y: 1 }, { x: midX, y: height - 2 }, width, height);
  line(open, { x: 1, y: 1 + (phase % (height - 2)) }, { x: midX, y: 1 + (phase % (height - 2)) }, width, height);
  line(open, { x: midX, y: height - 2 - (phase % (height - 2)) }, { x: width - 2, y: height - 2 - (phase % (height - 2)) }, width, height);
};

const patternB = (open: Set<string>, width: number, height: number, phase: number) => {
  const top = 1;
  const bottom = height - 2;
  const left = 1;
  const right = width - 2;
  line(open, { x: left, y: top }, { x: right, y: top }, width, height);
  line(open, { x: right, y: top }, { x: right, y: bottom }, width, height);
  line(open, { x: right, y: bottom }, { x: left, y: bottom }, width, height);
  line(open, { x: left, y: bottom }, { x: left, y: top }, width, height);

  const gateX = 2 + (phase % Math.max(2, width - 4));
  line(open, { x: gateX, y: top }, { x: gateX, y: bottom }, width, height);
  line(open, { x: left, y: Math.floor(height / 2) }, { x: right, y: Math.floor(height / 2) }, width, height);
};

const patternC = (open: Set<string>, width: number, height: number, phase: number) => {
  const lanes = [1, Math.floor(height / 2), height - 2];
  lanes.forEach((y) => line(open, { x: 1, y }, { x: width - 2, y }, width, height));
  const x1 = 2 + (phase % Math.max(2, width - 4));
  const x2 = width - 3 - (phase % Math.max(2, width - 4));
  line(open, { x: x1, y: 1 }, { x: x1, y: height - 2 }, width, height);
  line(open, { x: x2, y: 1 }, { x: x2, y: height - 2 }, width, height);
};

const patternD = (open: Set<string>, width: number, height: number, phase: number) => {
  const midY = Math.floor(height / 2);
  for (let x = 1; x < width - 1; x += 1) {
    const y = 1 + ((x + phase) % Math.max(2, height - 2));
    add(open, x, y, width, height);
    if (x % 2 === 0) line(open, { x, y }, { x, midY }, width, height);
  }
  line(open, { x: 1, y: midY }, { x: width - 2, y: midY }, width, height);
};

const patternE = (open: Set<string>, width: number, height: number, phase: number) => {
  const pivotX = 2 + (phase % Math.max(2, width - 4));
  const pivotY = 2 + (phase % Math.max(2, height - 4));
  line(open, { x: 1, y: 1 }, { x: pivotX, y: 1 }, width, height);
  line(open, { x: pivotX, y: 1 }, { x: pivotX, y: pivotY }, width, height);
  line(open, { x: pivotX, y: pivotY }, { x: width - 2, y: pivotY }, width, height);
  line(open, { x: width - 2, y: pivotY }, { x: width - 2, y: height - 2 }, width, height);
  line(open, { x: 1, y: height - 2 }, { x: width - 2, y: height - 2 }, width, height);
  line(open, { x: 1, y: 1 }, { x: 1, y: height - 2 }, width, height);
};

const patternF = (open: Set<string>, width: number, height: number, phase: number) => {
  const yA = 1 + (phase % Math.max(2, height - 2));
  const yB = height - 2 - (phase % Math.max(2, height - 2));
  line(open, { x: 1, y: yA }, { x: width - 2, y: yA }, width, height);
  line(open, { x: 1, y: yB }, { x: width - 2, y: yB }, width, height);
  line(open, { x: Math.floor(width / 2), y: 1 }, { x: Math.floor(width / 2), y: height - 2 }, width, height);
  line(open, { x: 2, y: 1 }, { x: 2, y: height - 2 }, width, height);
  line(open, { x: width - 3, y: 1 }, { x: width - 3, y: height - 2 }, width, height);
};

const PATTERNS = [patternA, patternB, patternC, patternD, patternE, patternF];

const pointFromKey = (k: string): Position => {
  const [x, y] = k.split(',').map(Number);
  return { x, y };
};

const sortCells = (cells: string[]) =>
  cells.sort((a, b) => {
    const [ax, ay] = a.split(',').map(Number);
    const [bx, by] = b.split(',').map(Number);
    if (ay !== by) return ay - by;
    return ax - bx;
  });

const createLevel = (levelNumber: number): LevelDefinition => {
  const carCount = getCarCount(levelNumber);
  const boardSize = getBoardSize(levelNumber);
  const open = new Set<string>();

  const pattern = PATTERNS[(levelNumber - 1) % PATTERNS.length];
  pattern(open, boardSize.width, boardSize.height, levelNumber);

  // Shared choke corridors increase with difficulty.
  const midX = Math.floor(boardSize.width / 2);
  const midY = Math.floor(boardSize.height / 2);
  if (levelNumber >= 4) line(open, { x: 1, y: midY }, { x: boardSize.width - 2, y: midY }, boardSize.width, boardSize.height);
  if (levelNumber >= 15) line(open, { x: midX, y: 1 }, { x: midX, y: boardSize.height - 2 }, boardSize.width, boardSize.height);
  if (levelNumber >= 40) {
    line(open, { x: 2, y: 1 }, { x: 2, y: boardSize.height - 2 }, boardSize.width, boardSize.height);
    line(open, { x: boardSize.width - 3, y: 1 }, { x: boardSize.width - 3, y: boardSize.height - 2 }, boardSize.width, boardSize.height);
  }
  if (levelNumber >= 70) {
    line(open, { x: 1, y: 2 }, { x: boardSize.width - 2, y: 2 }, boardSize.width, boardSize.height);
    line(open, { x: 1, y: boardSize.height - 3 }, { x: boardSize.width - 2, y: boardSize.height - 3 }, boardSize.width, boardSize.height);
  }

  const sortedCells = sortCells(Array.from(open));
  const leftCells = sortedCells.filter((k) => Number(k.split(',')[0]) <= 1);
  const rightCells = sortedCells.filter((k) => Number(k.split(',')[0]) >= boardSize.width - 2);
  const innerCells = sortedCells.filter((k) => {
    const [x, y] = k.split(',').map(Number);
    return x > 1 && x < boardSize.width - 2 && y > 0 && y < boardSize.height - 1;
  });

  const cars = Array.from({ length: carCount }, (_, i) => {
    const source = leftCells[(i * 2 + levelNumber) % leftCells.length] ?? sortedCells[i % sortedCells.length];
    return {
      id: `car-${i + 1}`,
      label: LABELS[i],
      color: COLORS[i],
      position: pointFromKey(source),
    };
  });

  const parkingSpots = Array.from({ length: carCount }, (_, i) => {
    const preferInner = levelNumber >= 11 && i % 2 === 1;
    const sourcePool = preferInner ? innerCells : rightCells;
    const source = sourcePool[(levelNumber + i * 3) % sourcePool.length] ?? sortedCells[(i + 1) % sortedCells.length];
    return {
      id: `park-${i + 1}`,
      position: pointFromKey(source),
      color: COLORS[i],
      acceptsCarId: `car-${i + 1}`,
    };
  });

  // Ensure no start tile overlaps parking tile for cleaner puzzle states.
  const carPositions = new Set(cars.map((car) => keyOf(car.position)));
  parkingSpots.forEach((spot, idx) => {
    if (carPositions.has(keyOf(spot.position))) {
      const fallback = innerCells[(idx + levelNumber + 5) % innerCells.length] ?? sortedCells[(idx + 3) % sortedCells.length];
      spot.position = pointFromKey(fallback);
    }
  });

  const occupiedOpen = new Set(open);
  cars.forEach((car) => occupiedOpen.add(keyOf(car.position)));
  parkingSpots.forEach((spot) => occupiedOpen.add(keyOf(spot.position)));

  const obstacles: Obstacle[] = [];
  for (let y = 0; y < boardSize.height; y += 1) {
    for (let x = 0; x < boardSize.width; x += 1) {
      if (!occupiedOpen.has(`${x},${y}`)) {
        obstacles.push({ id: `obs-${x}-${y}`, position: { x, y } });
      }
    }
  }

  return {
    id: `level-${String(levelNumber).padStart(3, '0')}`,
    name: `Level ${levelNumber} - ${getDifficultyTag(levelNumber)}`,
    boardSize,
    cars,
    parkingSpots,
    obstacles,
  };
};

export const GENERATED_LEVELS: LevelDefinition[] = Array.from({ length: 99 }, (_, index) =>
  createLevel(index + 1),
);

if (GENERATED_LEVELS.length !== 99) {
  throw new Error('Crash Car Escape requires exactly 99 levels.');
}

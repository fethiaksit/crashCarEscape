import type { LevelDefinition, Obstacle, Position } from '@/src/game/types';

const COLOR_POOL = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#f97316', '#06b6d4'];
const LABEL_POOL = ['R', 'G', 'B', 'Y', 'P', 'O', 'C'];

type DifficultyBand = {
  key: 'tutorial' | 'easy' | 'medium' | 'medium-hard' | 'hard' | 'very-hard';
  minLevel: number;
  maxLevel: number;
  minSolutionDepth: number;
  maxSafeFirstMoves: number;
  minDeadlockFirstMoves: number;
  minDensity: number;
  minParkingConflicts: number;
  minForcedStates: number;
};

type LayoutFamily = 'single-choke' | 'double-choke' | 'misleading-side-branch' | 'pocket' | 'cross-pressure';

const DIFFICULTY_BANDS: DifficultyBand[] = [
  {
    key: 'tutorial',
    minLevel: 1,
    maxLevel: 8,
    minSolutionDepth: 2,
    maxSafeFirstMoves: 3,
    minDeadlockFirstMoves: 0,
    minDensity: 0.28,
    minParkingConflicts: 0,
    minForcedStates: 0,
  },
  {
    key: 'easy',
    minLevel: 9,
    maxLevel: 20,
    minSolutionDepth: 3,
    maxSafeFirstMoves: 2,
    minDeadlockFirstMoves: 0,
    minDensity: 0.34,
    minParkingConflicts: 1,
    minForcedStates: 1,
  },
  {
    key: 'medium',
    minLevel: 21,
    maxLevel: 40,
    minSolutionDepth: 4,
    maxSafeFirstMoves: 2,
    minDeadlockFirstMoves: 1,
    minDensity: 0.4,
    minParkingConflicts: 2,
    minForcedStates: 2,
  },
  {
    key: 'medium-hard',
    minLevel: 41,
    maxLevel: 60,
    minSolutionDepth: 4,
    maxSafeFirstMoves: 1,
    minDeadlockFirstMoves: 1,
    minDensity: 0.46,
    minParkingConflicts: 3,
    minForcedStates: 4,
  },
  {
    key: 'hard',
    minLevel: 61,
    maxLevel: 80,
    minSolutionDepth: 5,
    maxSafeFirstMoves: 1,
    minDeadlockFirstMoves: 2,
    minDensity: 0.5,
    minParkingConflicts: 4,
    minForcedStates: 6,
  },
  {
    key: 'very-hard',
    minLevel: 81,
    maxLevel: 99,
    minSolutionDepth: 5,
    maxSafeFirstMoves: 1,
    minDeadlockFirstMoves: 2,
    minDensity: 0.54,
    minParkingConflicts: 5,
    minForcedStates: 8,
  },
];

const keyOf = ({ x, y }: Position) => `${x},${y}`;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const createRng = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const pickOne = <T>(items: T[], rng: () => number) => items[Math.floor(rng() * items.length) % items.length];

const getBandForLevel = (levelNumber: number) =>
  DIFFICULTY_BANDS.find((band) => levelNumber >= band.minLevel && levelNumber <= band.maxLevel) ?? DIFFICULTY_BANDS[0];

const getCarCountForLevel = (levelNumber: number) => {
  if (levelNumber <= 8) return 2;
  if (levelNumber <= 20) return 3;
  if (levelNumber <= 35) return 4;
  if (levelNumber <= 55) return 5;
  if (levelNumber <= 80) return 6;
  return 7;
};

const getBoardSize = (levelNumber: number, carCount: number) => {
  if (levelNumber <= 12) return { width: 8, height: 6 };
  if (levelNumber <= 35) return { width: 9, height: 7 };
  if (carCount <= 5) return { width: 10, height: 8 };
  if (levelNumber <= 70) return { width: 10, height: 9 };
  return { width: 11, height: 9 };
};

const getDifficultyLabel = (levelNumber: number) => {
  if (levelNumber <= 8) return 'Tutorial Streets';
  if (levelNumber <= 20) return 'Early Pressure';
  if (levelNumber <= 40) return 'Trap District';
  if (levelNumber <= 60) return 'Gridlock Core';
  if (levelNumber <= 80) return 'Deadlock Sector';
  return 'No-Mistake Zone';
};

const getWinningOrder = (levelNumber: number, carCount: number, rng: () => number) => {
  const order = Array.from({ length: carCount }, (_, i) => i);

  if (levelNumber <= 8) return order;
  if (levelNumber <= 20) {
    const pivot = (levelNumber + Math.floor(rng() * carCount)) % carCount;
    return order.slice(pivot).concat(order.slice(0, pivot));
  }

  const pivot = (levelNumber * 3 + Math.floor(rng() * 11)) % carCount;
  const rotated = order.slice(pivot).concat(order.slice(0, pivot));
  if (carCount >= 4) {
    const tailStart = Math.max(1, carCount - 3);
    const tail = rotated.splice(tailStart);
    return rotated.concat(tail.reverse());
  }

  return rotated;
};

const carveLine = (open: Set<string>, from: Position, to: Position, width: number, height: number) => {
  let x = from.x;
  let y = from.y;
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);

  const add = (px: number, py: number) => {
    if (px >= 0 && px < width && py >= 0 && py < height) {
      open.add(`${px},${py}`);
    }
  };

  add(x, y);
  while (x !== to.x) {
    x += dx;
    add(x, y);
  }
  while (y !== to.y) {
    y += dy;
    add(x, y);
  }
};

const carvePath = (open: Set<string>, points: Position[], width: number, height: number) => {
  for (let i = 0; i < points.length - 1; i += 1) {
    carveLine(open, points[i], points[i + 1], width, height);
  }
};

const getStartRows = (height: number, carCount: number, rng: () => number) => {
  const mid = Math.floor(height / 2);
  const rows = [mid, mid - 1, mid + 1, mid - 2, mid + 2, 1, height - 2].map((row) => clamp(row, 1, height - 2));

  for (let i = rows.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }

  const unique: number[] = [];
  for (const row of rows) {
    if (!unique.includes(row)) unique.push(row);
    if (unique.length === carCount) break;
  }

  return unique.sort((a, b) => a - b);
};

const pickLayoutFamily = (levelNumber: number, rng: () => number): LayoutFamily => {
  if (levelNumber <= 8) return 'single-choke';
  if (levelNumber <= 20) return pickOne(['single-choke', 'misleading-side-branch'], rng);
  if (levelNumber <= 40) return pickOne(['single-choke', 'double-choke', 'misleading-side-branch'], rng);
  if (levelNumber <= 60) return pickOne(['double-choke', 'misleading-side-branch', 'pocket'], rng);
  if (levelNumber <= 80) return pickOne(['double-choke', 'pocket', 'cross-pressure'], rng);
  return pickOne(['double-choke', 'misleading-side-branch', 'pocket', 'cross-pressure'], rng);
};

const makeOpenCells = ({
  levelNumber,
  width,
  height,
  carRows,
  parkingPositions,
  family,
}: {
  levelNumber: number;
  width: number;
  height: number;
  carRows: number[];
  parkingPositions: Position[];
  family: LayoutFamily;
}) => {
  const open = new Set<string>();
  const midY = Math.floor(height / 2);
  const trunkStartX = 1;
  const trunkEndX = width - 2;
  const choke1 = clamp(2 + Math.floor(width * 0.35), 2, width - 5);
  const choke2 = clamp(choke1 + 2 + Math.floor((width - choke1) / 3), choke1 + 2, width - 3);

  carveLine(open, { x: trunkStartX, y: midY }, { x: trunkEndX, y: midY }, width, height);

  for (const startRow of carRows) {
    carvePath(
      open,
      [
        { x: 0, y: startRow },
        { x: 1, y: startRow },
        { x: 1, y: midY },
      ],
      width,
      height,
    );
  }

  if (family === 'single-choke' || family === 'misleading-side-branch') {
    carveLine(open, { x: choke1, y: midY - 1 }, { x: choke1, y: midY + 1 }, width, height);
  }

  if (family === 'double-choke' || family === 'cross-pressure' || family === 'pocket') {
    carveLine(open, { x: choke1, y: midY - 1 }, { x: choke1, y: midY + 1 }, width, height);
    carveLine(open, { x: choke2, y: midY - 1 }, { x: choke2, y: midY + 1 }, width, height);
  }

  if (family === 'misleading-side-branch' || family === 'pocket') {
    carveLine(open, { x: choke1 + 1, y: midY }, { x: choke1 + 1, y: clamp(midY - 2, 1, height - 2) }, width, height);
    carveLine(open, { x: choke1 + 2, y: midY }, { x: choke1 + 2, y: clamp(midY + 2, 1, height - 2) }, width, height);
  }

  if (family === 'cross-pressure') {
    const armX = clamp(choke2 + 1, 3, width - 2);
    carveLine(open, { x: armX, y: 1 }, { x: armX, y: height - 2 }, width, height);
    carveLine(open, { x: armX - 1, y: clamp(midY - 1, 1, height - 2) }, { x: armX + 1, y: clamp(midY - 1, 1, height - 2) }, width, height);
  }

  for (const park of parkingPositions) {
    carvePath(
      open,
      [
        { x: clamp(choke1, 1, width - 2), y: midY },
        { x: park.x, y: midY },
        { x: park.x, y: park.y },
      ],
      width,
      height,
    );
  }

  if (levelNumber >= 30) {
    const branchCount = 1 + Math.floor((levelNumber - 20) / 25);
    for (let i = 0; i < branchCount; i += 1) {
      const x = clamp(choke1 + 1 + i * 2, choke1 + 1, width - 3);
      const y = i % 2 === 0 ? clamp(midY - 2, 1, height - 2) : clamp(midY + 2, 1, height - 2);
      carveLine(open, { x, y: midY }, { x, y }, width, height);
    }
  }

  return open;
};

const makeObstacles = ({
  width,
  height,
  openCells,
}: {
  width: number;
  height: number;
  openCells: Set<string>;
}): Obstacle[] => {
  const obstacles: Obstacle[] = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!openCells.has(`${x},${y}`)) {
        obstacles.push({
          id: `obs-${x}-${y}`,
          position: { x, y },
        });
      }
    }
  }

  return obstacles;
};

const getParkingPositions = ({
  levelNumber,
  carCount,
  width,
  height,
  family,
  order,
  rng,
}: {
  levelNumber: number;
  carCount: number;
  width: number;
  height: number;
  family: LayoutFamily;
  order: number[];
  rng: () => number;
}) => {
  const used = new Set<string>();
  const positions: Position[] = Array.from({ length: carCount }, () => ({ x: 0, y: 0 }));
  const midY = Math.floor(height / 2);

  const conflictRowsByBand: number[] =
    levelNumber <= 8
      ? [midY - 1, midY, midY + 1]
      : levelNumber <= 40
        ? [midY - 1, midY, midY + 1, midY - 2]
        : [midY - 1, midY, midY + 1];

  const rightAnchor = family === 'single-choke' ? width - 2 : width - 3;

  for (let rank = 0; rank < order.length; rank += 1) {
    const carIndex = order[rank];
    const isLateOrder = rank >= Math.max(1, Math.floor(order.length / 2));

    const baseX = isLateOrder ? rightAnchor - 1 : rightAnchor;
    const preferredCols = [baseX, baseX - 1, baseX + 1, baseX - 2].map((x) =>
      clamp(x, Math.floor(width / 2), width - 2),
    );

    const preferredRow = conflictRowsByBand[(rank + Math.floor(rng() * conflictRowsByBand.length)) % conflictRowsByBand.length];
    const preferredRows = [preferredRow, midY, preferredRow - 1, preferredRow + 1, preferredRow - 2, preferredRow + 2]
      .map((y) => clamp(y, 1, height - 2));

    let chosen: Position | null = null;
    for (const y of preferredRows) {
      for (const x of preferredCols) {
        const key = `${x},${y}`;
        if (!used.has(key)) {
          chosen = { x, y };
          used.add(key);
          break;
        }
      }
      if (chosen) break;
    }

    if (!chosen) {
      throw new Error(`Unable to assign unique parking position for level ${levelNumber}`);
    }

    positions[carIndex] = chosen;
  }

  return positions;
};

const isInside = (width: number, height: number, p: Position) => p.x >= 0 && p.y >= 0 && p.x < width && p.y < height;

const hasPath = ({
  width,
  height,
  start,
  goal,
  blocked,
}: {
  width: number;
  height: number;
  start: Position;
  goal: Position;
  blocked: Set<string>;
}) => {
  const queue: Position[] = [start];
  const seen = new Set<string>([keyOf(start)]);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.x === goal.x && current.y === goal.y) {
      return true;
    }

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const next of neighbors) {
      const k = keyOf(next);
      if (!isInside(width, height, next) || blocked.has(k) || seen.has(k)) {
        continue;
      }

      seen.add(k);
      queue.push(next);
    }
  }

  return false;
};

const analyzeLevel = (level: LevelDefinition) => {
  const allMask = (1 << level.cars.length) - 1;
  const obstacleSet = new Set(level.obstacles.map((o) => keyOf(o.position)));
  const cars = level.cars;
  const spotByCarId = new Map(level.parkingSpots.map((spot) => [spot.acceptsCarId, spot.position]));

  const canParkWithMask = (index: number, mask: number) => {
    const car = cars[index];
    const spot = spotByCarId.get(car.id);
    if (!spot) return false;

    const blocked = new Set<string>(obstacleSet);

    for (let i = 0; i < cars.length; i += 1) {
      if (i === index) continue;
      const otherCar = cars[i];
      const isParked = (mask & (1 << i)) !== 0;
      blocked.add(keyOf(isParked ? (spotByCarId.get(otherCar.id) ?? otherCar.position) : otherCar.position));
    }

    return hasPath({
      width: level.boardSize.width,
      height: level.boardSize.height,
      start: car.position,
      goal: spot,
      blocked,
    });
  };

  const finishMemo = new Map<number, boolean>();
  const canFinishFromMask = (mask: number): boolean => {
    if (mask === allMask) return true;
    if (finishMemo.has(mask)) return finishMemo.get(mask)!;

    for (let i = 0; i < cars.length; i += 1) {
      if ((mask & (1 << i)) !== 0) continue;
      if (canParkWithMask(i, mask) && canFinishFromMask(mask | (1 << i))) {
        finishMemo.set(mask, true);
        return true;
      }
    }

    finishMemo.set(mask, false);
    return false;
  };

  const depthQueue: { mask: number; depth: number }[] = [{ mask: 0, depth: 0 }];
  const seenDepth = new Set<number>([0]);
  let minSolutionDepth = Number.POSITIVE_INFINITY;
  let forcedStates = 0;

  while (depthQueue.length > 0) {
    const { mask, depth } = depthQueue.shift()!;

    const moves: number[] = [];
    for (let i = 0; i < cars.length; i += 1) {
      if ((mask & (1 << i)) !== 0) continue;
      if (canParkWithMask(i, mask)) {
        moves.push(i);
      }
    }

    if (moves.length === 1 && mask !== allMask) {
      forcedStates += 1;
    }

    for (const move of moves) {
      const next = mask | (1 << move);
      if (next === allMask) {
        minSolutionDepth = Math.min(minSolutionDepth, depth + 1);
      }

      if (!seenDepth.has(next)) {
        seenDepth.add(next);
        depthQueue.push({ mask: next, depth: depth + 1 });
      }
    }
  }

  const validFirstMoves: number[] = [];
  const deadlockFirstMoves: number[] = [];
  const safeFirstMoves: number[] = [];

  for (let i = 0; i < cars.length; i += 1) {
    if (!canParkWithMask(i, 0)) continue;
    validFirstMoves.push(i);
    const nextMask = 1 << i;
    if (canFinishFromMask(nextMask)) {
      safeFirstMoves.push(i);
    } else {
      deadlockFirstMoves.push(i);
    }
  }

  let parkingConflictCount = 0;
  for (let i = 0; i < level.parkingSpots.length; i += 1) {
    for (let j = i + 1; j < level.parkingSpots.length; j += 1) {
      const a = level.parkingSpots[i].position;
      const b = level.parkingSpots[j].position;
      const sameLane = a.x === b.x || a.y === b.y;
      const close = Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= 3;
      if (sameLane || close) parkingConflictCount += 1;
    }
  }

  const totalTiles = level.boardSize.width * level.boardSize.height;
  const density = level.obstacles.length / totalTiles;

  return {
    solvable: canFinishFromMask(0),
    minSolutionDepth: Number.isFinite(minSolutionDepth) ? minSolutionDepth : 0,
    validFirstMoves: validFirstMoves.length,
    safeFirstMoves: safeFirstMoves.length,
    deadlockFirstMoves: deadlockFirstMoves.length,
    density,
    parkingConflictCount,
    forcedStates,
    misleadingBranchCount: Math.max(0, validFirstMoves.length - safeFirstMoves.length),
  };
};

const levelPassesDifficulty = (
  levelNumber: number,
  metrics: ReturnType<typeof analyzeLevel>,
  carCount: number,
) => {
  const band = getBandForLevel(levelNumber);

  if (!metrics.solvable) return false;
  if (metrics.minSolutionDepth < Math.min(band.minSolutionDepth, carCount)) return false;
  if (metrics.safeFirstMoves > band.maxSafeFirstMoves) return false;
  if (metrics.deadlockFirstMoves < band.minDeadlockFirstMoves) return false;
  if (metrics.density < band.minDensity) return false;
  if (metrics.parkingConflictCount < band.minParkingConflicts) return false;
  if (metrics.forcedStates < band.minForcedStates) return false;

  if (levelNumber >= 81 && metrics.misleadingBranchCount < 2) return false;
  if (levelNumber >= 61 && metrics.validFirstMoves > 3) return false;
  if (levelNumber >= 41 && metrics.validFirstMoves > 4) return false;

  return true;
};

const buildCandidateLevel = (levelNumber: number, attempt: number): LevelDefinition => {
  const carCount = getCarCountForLevel(levelNumber);
  const boardSize = getBoardSize(levelNumber, carCount);
  const rng = createRng(levelNumber * 1009 + attempt * 313 + carCount * 37);
  const order = getWinningOrder(levelNumber, carCount, rng);
  const family = pickLayoutFamily(levelNumber, rng);
  const carRows = getStartRows(boardSize.height, carCount, rng);
  const parkingPositions = getParkingPositions({
    levelNumber,
    carCount,
    width: boardSize.width,
    height: boardSize.height,
    family,
    order,
    rng,
  });

  const openCells = makeOpenCells({
    levelNumber,
    width: boardSize.width,
    height: boardSize.height,
    carRows,
    parkingPositions,
    family,
  });

  const cars = Array.from({ length: carCount }, (_, i) => ({
    id: `car-${i + 1}`,
    label: LABEL_POOL[i],
    color: COLOR_POOL[i],
    position: { x: 0, y: carRows[i] },
  }));

  const parkingSpots = Array.from({ length: carCount }, (_, i) => ({
    id: `park-${i + 1}`,
    position: parkingPositions[i],
    color: COLOR_POOL[i],
    acceptsCarId: `car-${i + 1}`,
  }));

  return {
    id: `level-${String(levelNumber).padStart(3, '0')}`,
    name: `Level ${levelNumber} - ${getDifficultyLabel(levelNumber)}`,
    boardSize,
    cars,
    parkingSpots,
    obstacles: makeObstacles({ width: boardSize.width, height: boardSize.height, openCells }),
  };
};

const buildLevel = (levelNumber: number): LevelDefinition => {
  const maxAttempts = 160;
  let fallback: { level: LevelDefinition; score: number } | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = buildCandidateLevel(levelNumber, attempt);
    const metrics = analyzeLevel(candidate);

    const score =
      metrics.minSolutionDepth * 10 +
      metrics.deadlockFirstMoves * 7 +
      metrics.parkingConflictCount * 3 +
      metrics.forcedStates * 2 -
      metrics.safeFirstMoves * 6;

    if (!fallback || score > fallback.score) {
      fallback = { level: candidate, score };
    }

    if (levelPassesDifficulty(levelNumber, metrics, candidate.cars.length)) {
      return candidate;
    }
  }

  if (fallback) {
    return fallback.level;
  }

  throw new Error(`Unable to generate level ${levelNumber}`);
};

const GENERATED_LEVELS: LevelDefinition[] = Array.from({ length: 99 }, (_, index) => buildLevel(index + 1));

if (GENERATED_LEVELS.length !== 99) {
  throw new Error('Crash Car Escape requires exactly 99 levels.');
}

for (const level of GENERATED_LEVELS) {
  const occupied = new Map<string, string>();

  for (const car of level.cars) {
    const k = keyOf(car.position);
    if (occupied.has(k)) {
      throw new Error(`Invalid level: overlapping car start tiles (${level.id}, ${k})`);
    }
    occupied.set(k, `car:${car.id}`);
  }

  for (const spot of level.parkingSpots) {
    const k = keyOf(spot.position);

    if (occupied.has(k)) {
      throw new Error(
        `Invalid level: overlapping tile (${level.id}, ${k}) between ${occupied.get(k)} and parking:${spot.id}`,
      );
    }

    occupied.set(k, `parking:${spot.id}`);
  }

  for (const obstacle of level.obstacles) {
    const k = keyOf(obstacle.position);

    if (occupied.has(k)) {
      throw new Error(
        `Invalid level: overlapping tile (${level.id}, ${k}) between ${occupied.get(k)} and obstacle:${obstacle.id}`,
      );
    }

    occupied.set(k, `obstacle:${obstacle.id}`);
  }

  const metrics = analyzeLevel(level);
  if (!metrics.solvable) {
    throw new Error(`Invalid level: no winning order exists (${level.id})`);
  }

  const levelNumber = Number(level.id.replace('level-', ''));
  if (!levelPassesDifficulty(levelNumber, metrics, level.cars.length)) {
    throw new Error(`Invalid level: difficulty validation failed (${level.id})`);
  }
}

export { GENERATED_LEVELS };

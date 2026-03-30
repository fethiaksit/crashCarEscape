import type { LevelDefinition, Position } from '@/src/game/types';

const COLOR_POOL = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#f97316', '#06b6d4'];
const LABEL_POOL = ['R', 'G', 'B', 'Y', 'P', 'O', 'C'];

type LayoutFamily =
  | 'single-choke'
  | 'double-choke'
  | 'switchback'
  | 'fork-trap'
  | 'ring-trap'
  | 'snake';

type DifficultyTier = {
  carCount: number;
  boardSize: { width: number; height: number };
  opennessMax: number;
  minChokepoints: number;
  minDeadFirstMoves: number;
  decoyDensity: number;
};

const keyOf = (p: Position) => `${p.x},${p.y}`;

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

const shuffle = <T>(items: T[], rng: () => number) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const getTier = (levelNumber: number): DifficultyTier => {
  if (levelNumber <= 10) {
    return {
      carCount: levelNumber <= 4 ? 2 : 3,
      boardSize: { width: 8, height: 6 },
      opennessMax: 0.42,
      minChokepoints: 7,
      minDeadFirstMoves: levelNumber <= 6 ? 0 : 1,
      decoyDensity: 0.08,
    };
  }

  if (levelNumber <= 30) {
    return {
      carCount: levelNumber <= 20 ? 4 : 5,
      boardSize: { width: 9, height: 7 },
      opennessMax: 0.38,
      minChokepoints: 10,
      minDeadFirstMoves: 1,
      decoyDensity: 0.12,
    };
  }

  return {
    carCount: levelNumber <= 60 ? 6 : 7,
    boardSize: levelNumber <= 60 ? { width: 10, height: 8 } : { width: 10, height: 9 },
    opennessMax: 0.34,
    minChokepoints: 14,
    minDeadFirstMoves: 2,
    decoyDensity: 0.16,
  };
};

const difficultyName = (levelNumber: number) => {
  if (levelNumber <= 10) return 'Tutorial Easy';
  if (levelNumber <= 30) return 'Thoughtful Traffic';
  return 'Hard Gridlock';
};

const getFamily = (levelNumber: number, attempt: number): LayoutFamily => {
  const easy: LayoutFamily[] = ['single-choke', 'double-choke', 'switchback'];
  const mid: LayoutFamily[] = ['double-choke', 'switchback', 'fork-trap', 'snake'];
  const hard: LayoutFamily[] = ['fork-trap', 'ring-trap', 'snake', 'double-choke', 'switchback'];
  const pool = levelNumber <= 10 ? easy : levelNumber <= 30 ? mid : hard;
  return pool[(levelNumber * 11 + attempt * 7) % pool.length];
};

const carveLine = (open: Set<string>, from: Position, to: Position, width: number, height: number) => {
  let x = from.x;
  let y = from.y;
  const add = (px: number, py: number) => {
    if (px >= 0 && py >= 0 && px < width && py < height) open.add(`${px},${py}`);
  };
  add(x, y);
  while (x !== to.x) {
    x += Math.sign(to.x - x);
    add(x, y);
  }
  while (y !== to.y) {
    y += Math.sign(to.y - y);
    add(x, y);
  }
};

const carvePath = (open: Set<string>, points: Position[], width: number, height: number) => {
  for (let i = 0; i < points.length - 1; i += 1) {
    carveLine(open, points[i], points[i + 1], width, height);
  }
};

const getCarRows = (height: number, carCount: number) => {
  const rows: number[] = [];
  const top = 1;
  const bottom = height - 2;
  const span = bottom - top;
  for (let i = 0; i < carCount; i += 1) {
    const row = top + Math.floor((i * Math.max(span, 1)) / Math.max(carCount - 1, 1));
    rows.push(clamp(row, 1, height - 2));
  }
  return Array.from(new Set(rows));
};

const routeForFamily = ({
  family,
  width,
  height,
  mainY,
}: {
  family: LayoutFamily;
  width: number;
  height: number;
  mainY: number;
}) => {
  const left = 1;
  const right = width - 2;
  const top = 1;
  const bottom = height - 2;
  const c1 = clamp(Math.floor(width * 0.35), 2, width - 4);
  const c2 = clamp(Math.floor(width * 0.62), 3, width - 3);
  const up = clamp(mainY - 2, top, bottom);
  const down = clamp(mainY + 2, top, bottom);

  const points: Position[][] = [];

  switch (family) {
    case 'single-choke':
      points.push([
        { x: left, y: mainY },
        { x: right, y: mainY },
      ]);
      points.push([
        { x: c1, y: up },
        { x: c1, y: down },
      ]);
      break;
    case 'double-choke':
      points.push([
        { x: left, y: mainY },
        { x: right, y: mainY },
      ]);
      points.push([
        { x: c1, y: top },
        { x: c1, y: bottom },
      ]);
      points.push([
        { x: c2, y: up },
        { x: c2, y: down },
      ]);
      break;
    case 'switchback':
      points.push([
        { x: left, y: mainY },
        { x: c1, y: mainY },
        { x: c1, y: up },
        { x: c2, y: up },
        { x: c2, y: down },
        { x: right, y: down },
      ]);
      break;
    case 'fork-trap':
      points.push([
        { x: left, y: mainY },
        { x: right, y: mainY },
      ]);
      points.push([
        { x: c1, y: mainY },
        { x: c1, y: up },
      ]);
      points.push([
        { x: c2, y: mainY },
        { x: c2, y: down },
      ]);
      points.push([
        { x: c2, y: down },
        { x: right, y: down },
      ]);
      break;
    case 'ring-trap':
      points.push([
        { x: left, y: up },
        { x: right, y: up },
      ]);
      points.push([
        { x: left, y: down },
        { x: right, y: down },
      ]);
      points.push([
        { x: left, y: up },
        { x: left, y: down },
      ]);
      points.push([
        { x: right, y: up },
        { x: right, y: down },
      ]);
      points.push([
        { x: c1, y: up },
        { x: c1, y: mainY },
      ]);
      break;
    case 'snake':
      points.push([
        { x: left, y: mainY },
        { x: c1, y: mainY },
        { x: c1, y: up },
        { x: c2, y: up },
        { x: c2, y: down },
        { x: c1 + 1, y: down },
        { x: c1 + 1, y: mainY + 1 <= bottom ? mainY + 1 : mainY - 1 },
        { x: right, y: mainY + 1 <= bottom ? mainY + 1 : mainY - 1 },
      ]);
      break;
  }

  return { points, c1, c2, up, down };
};

const getParkingPositions = ({
  carCount,
  width,
  height,
  order,
  rng,
}: {
  carCount: number;
  width: number;
  height: number;
  order: number[];
  rng: () => number;
}) => {
  const positions: Position[] = Array.from({ length: carCount }, () => ({ x: width - 2, y: 1 }));
  const used = new Set<string>();
  const coreRows = [
    Math.floor(height / 2),
    Math.floor(height / 2) - 1,
    Math.floor(height / 2) + 1,
    Math.floor(height / 2) - 2,
    Math.floor(height / 2) + 2,
  ].map((row) => clamp(row, 1, height - 2));

  for (let rank = 0; rank < order.length; rank += 1) {
    const carIndex = order[rank];
    const xPref = rank <= Math.floor(carCount / 2) ? width - 2 : width - 3;
    const rows = shuffle(coreRows, rng);

    let chosen: Position | undefined;
    for (const row of rows) {
      const p = { x: xPref, y: row };
      if (!used.has(keyOf(p))) {
        chosen = p;
        break;
      }
    }

    if (!chosen) {
      for (let y = 1; y < height - 1 && !chosen; y += 1) {
        for (let x = width - 3; x < width - 1; x += 1) {
          const p = { x, y };
          if (!used.has(keyOf(p))) {
            chosen = p;
            break;
          }
        }
      }
    }

    const finalPos = chosen ?? { x: width - 2, y: clamp(rank + 1, 1, height - 2) };
    used.add(keyOf(finalPos));
    positions[carIndex] = finalPos;
  }

  return positions;
};

const buildOpenCells = ({
  levelNumber,
  tier,
  family,
  carRows,
  parking,
  rng,
}: {
  levelNumber: number;
  tier: DifficultyTier;
  family: LayoutFamily;
  carRows: number[];
  parking: Position[];
  rng: () => number;
}) => {
  const { width, height } = tier.boardSize;
  const open = new Set<string>();
  const mainY = clamp(Math.floor(height / 2), 1, height - 2);

  for (const row of carRows) {
    carvePath(open, [{ x: 0, y: row }, { x: 1, y: row }, { x: 1, y: mainY }], width, height);
  }

  const route = routeForFamily({ family, width, height, mainY });
  for (const polyline of route.points) {
    carvePath(open, polyline, width, height);
  }

  parking.forEach((spot, i) => {
    const entryX = i % 2 === 0 ? route.c1 : route.c2;
    const entryY = i % 3 === 0 ? route.up : i % 3 === 1 ? mainY : route.down;
    carvePath(open, [{ x: entryX, y: entryY }, { x: spot.x, y: entryY }, { x: spot.x, y: spot.y }], width, height);
  });

  const decoys = Math.floor((width * height * tier.decoyDensity) / 2);
  for (let i = 0; i < decoys; i += 1) {
    const x = clamp(2 + Math.floor(rng() * (width - 4)), 1, width - 2);
    const y = clamp(1 + Math.floor(rng() * (height - 2)), 1, height - 2);
    const targetY = rng() > 0.5 ? route.up : route.down;
    carveLine(open, { x, y }, { x, y: targetY }, width, height);
  }

  if (levelNumber >= 30) {
    carveLine(open, { x: route.c2 - 1, y: mainY }, { x: route.c2 - 1, y: route.up }, width, height);
  }

  return open;
};

const makeObstacles = (width: number, height: number, open: Set<string>) => {
  const obstacles: LevelDefinition['obstacles'] = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!open.has(`${x},${y}`)) obstacles.push({ id: `obs-${x}-${y}`, position: { x, y } });
    }
  }
  return obstacles;
};

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
  const visited = new Set<string>([keyOf(start)]);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.x === goal.x && cur.y === goal.y) return true;
    const neighbors = [
      { x: cur.x + 1, y: cur.y },
      { x: cur.x - 1, y: cur.y },
      { x: cur.x, y: cur.y + 1 },
      { x: cur.x, y: cur.y - 1 },
    ];
    for (const next of neighbors) {
      const k = keyOf(next);
      if (next.x < 0 || next.y < 0 || next.x >= width || next.y >= height || blocked.has(k) || visited.has(k)) {
        continue;
      }
      visited.add(k);
      queue.push(next);
    }
  }
  return false;
};

const canPark = (level: LevelDefinition, carIndex: number, mask: number) => {
  const car = level.cars[carIndex];
  const target = level.parkingSpots.find((spot) => spot.acceptsCarId === car.id)?.position;
  if (!target) return false;

  const blocked = new Set(level.obstacles.map((o) => keyOf(o.position)));
  for (let i = 0; i < level.cars.length; i += 1) {
    if (i === carIndex) continue;
    const otherCar = level.cars[i];
    const parked = (mask & (1 << i)) !== 0;
    const parkedPos = level.parkingSpots.find((spot) => spot.acceptsCarId === otherCar.id)?.position;
    blocked.add(keyOf(parked ? parkedPos ?? otherCar.position : otherCar.position));
  }

  return hasPath({
    width: level.boardSize.width,
    height: level.boardSize.height,
    start: car.position,
    goal: target,
    blocked,
  });
};

const isSolvable = (level: LevelDefinition) => {
  const allMask = (1 << level.cars.length) - 1;
  const memo = new Map<number, boolean>();

  const dfs = (mask: number): boolean => {
    if (mask === allMask) return true;
    const cached = memo.get(mask);
    if (cached !== undefined) return cached;
    for (let i = 0; i < level.cars.length; i += 1) {
      if ((mask & (1 << i)) !== 0) continue;
      if (canPark(level, i, mask) && dfs(mask | (1 << i))) {
        memo.set(mask, true);
        return true;
      }
    }
    memo.set(mask, false);
    return false;
  };

  return dfs(0);
};

const countSolutions = (level: LevelDefinition, cap = 5) => {
  const allMask = (1 << level.cars.length) - 1;
  const memo = new Map<number, number>();

  const dfs = (mask: number): number => {
    if (mask === allMask) return 1;
    if (memo.has(mask)) return memo.get(mask)!;
    let total = 0;
    for (let i = 0; i < level.cars.length; i += 1) {
      if ((mask & (1 << i)) !== 0) continue;
      if (!canPark(level, i, mask)) continue;
      total += dfs(mask | (1 << i));
      if (total >= cap) {
        memo.set(mask, cap);
        return cap;
      }
    }
    memo.set(mask, total);
    return total;
  };

  return dfs(0);
};

const countDeadFirstMoves = (level: LevelDefinition) => {
  let dead = 0;
  for (let i = 0; i < level.cars.length; i += 1) {
    if (!canPark(level, i, 0)) continue;
    const solvableAfter = isMaskSolvable(level, 1 << i);
    if (!solvableAfter) dead += 1;
  }
  return dead;
};

const isMaskSolvable = (level: LevelDefinition, startMask: number) => {
  const allMask = (1 << level.cars.length) - 1;
  const memo = new Map<number, boolean>();
  const dfs = (mask: number): boolean => {
    if (mask === allMask) return true;
    if (memo.has(mask)) return memo.get(mask)!;
    for (let i = 0; i < level.cars.length; i += 1) {
      if ((mask & (1 << i)) !== 0) continue;
      if (canPark(level, i, mask) && dfs(mask | (1 << i))) {
        memo.set(mask, true);
        return true;
      }
    }
    memo.set(mask, false);
    return false;
  };
  return dfs(startMask);
};

const countChokepoints = (level: LevelDefinition) => {
  const blocked = new Set(level.obstacles.map((o) => keyOf(o.position)));
  let count = 0;
  for (let y = 0; y < level.boardSize.height; y += 1) {
    for (let x = 0; x < level.boardSize.width; x += 1) {
      const here = `${x},${y}`;
      if (blocked.has(here)) continue;
      const neighbors = [
        `${x + 1},${y}`,
        `${x - 1},${y}`,
        `${x},${y + 1}`,
        `${x},${y - 1}`,
      ].filter((k) => !blocked.has(k));
      if (neighbors.length <= 2) count += 1;
    }
  }
  return count;
};

const opennessRatio = (level: LevelDefinition) => {
  const total = level.boardSize.width * level.boardSize.height;
  return 1 - level.obstacles.length / total;
};

const hasOverlaps = (level: LevelDefinition) => {
  const used = new Set<string>();
  for (const car of level.cars) {
    const k = keyOf(car.position);
    if (used.has(k)) return true;
    used.add(k);
  }
  for (const spot of level.parkingSpots) {
    const k = keyOf(spot.position);
    if (used.has(k)) return true;
    used.add(k);
  }
  for (const obs of level.obstacles) {
    const k = keyOf(obs.position);
    if (used.has(k)) return true;
    used.add(k);
  }
  return false;
};

const isQualityLevel = (level: LevelDefinition, tier: DifficultyTier) => {
  if (hasOverlaps(level)) return false;
  if (!isSolvable(level)) return false;
  if (opennessRatio(level) > tier.opennessMax) return false;
  if (countChokepoints(level) < tier.minChokepoints) return false;
  if (countDeadFirstMoves(level) < tier.minDeadFirstMoves) return false;

  const solutionCount = countSolutions(level, 5);
  if (level.cars.length <= 3) {
    if (solutionCount === 0) return false;
  } else if (solutionCount >= 5) {
    return false;
  }

  return true;
};

const buildGeneratedLevel = (levelNumber: number, attempt: number): LevelDefinition => {
  const tier = getTier(levelNumber);
  const rng = createRng(levelNumber * 11939 + attempt * 131);
  const family = getFamily(levelNumber, attempt);
  const order = shuffle(Array.from({ length: tier.carCount }, (_, i) => i), rng);
  if (levelNumber <= 10) order.sort((a, b) => a - b);

  const carRows = getCarRows(tier.boardSize.height, tier.carCount);
  while (carRows.length < tier.carCount) carRows.push(clamp(carRows.length + 1, 1, tier.boardSize.height - 2));

  const parking = getParkingPositions({
    carCount: tier.carCount,
    width: tier.boardSize.width,
    height: tier.boardSize.height,
    order,
    rng,
  });

  const open = buildOpenCells({
    levelNumber,
    tier,
    family,
    carRows,
    parking,
    rng,
  });

  return {
    id: `level-${String(levelNumber).padStart(3, '0')}`,
    name: `Level ${levelNumber} - ${difficultyName(levelNumber)}`,
    boardSize: tier.boardSize,
    cars: Array.from({ length: tier.carCount }, (_, i) => ({
      id: `car-${i + 1}`,
      label: LABEL_POOL[i],
      color: COLOR_POOL[i],
      position: { x: 0, y: carRows[i] },
    })),
    parkingSpots: Array.from({ length: tier.carCount }, (_, i) => ({
      id: `park-${i + 1}`,
      color: COLOR_POOL[i],
      acceptsCarId: `car-${i + 1}`,
      position: parking[i],
    })),
    obstacles: makeObstacles(tier.boardSize.width, tier.boardSize.height, open),
  };
};

const buildFallbackLevel = (levelNumber: number): LevelDefinition => ({
  id: `level-${String(levelNumber).padStart(3, '0')}`,
  name: `Level ${levelNumber} - ${difficultyName(levelNumber)}`,
  boardSize: { width: 8, height: 6 },
  cars: [
    { id: 'car-1', label: 'R', color: COLOR_POOL[0], position: { x: 0, y: 2 } },
    { id: 'car-2', label: 'G', color: COLOR_POOL[1], position: { x: 0, y: 3 } },
  ],
  parkingSpots: [
    { id: 'park-1', color: COLOR_POOL[0], acceptsCarId: 'car-1', position: { x: 6, y: 2 } },
    { id: 'park-2', color: COLOR_POOL[1], acceptsCarId: 'car-2', position: { x: 6, y: 3 } },
  ],
  obstacles: makeObstacles(
    8,
    6,
    new Set([
      '0,2',
      '1,2',
      '2,2',
      '3,2',
      '4,2',
      '5,2',
      '6,2',
      '0,3',
      '1,3',
      '2,3',
      '3,3',
      '4,3',
      '5,3',
      '6,3',
      '1,1',
      '1,4',
    ]),
  ),
});

const STRONG_EXAMPLE_LEVELS: Record<number, LevelDefinition> = {
  31: buildGeneratedLevel(31, 301),
  32: buildGeneratedLevel(32, 302),
  33: buildGeneratedLevel(33, 303),
  34: buildGeneratedLevel(34, 304),
  35: buildGeneratedLevel(35, 305),
  36: buildGeneratedLevel(36, 306),
  37: buildGeneratedLevel(37, 307),
  38: buildGeneratedLevel(38, 308),
  39: buildGeneratedLevel(39, 309),
  40: buildGeneratedLevel(40, 310),
};

const buildLevel = (levelNumber: number): LevelDefinition => {
  const example = STRONG_EXAMPLE_LEVELS[levelNumber];
  if (example && isQualityLevel(example, getTier(levelNumber))) {
    return example;
  }

  const attempts = levelNumber <= 10 ? 24 : levelNumber <= 30 ? 40 : 72;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const candidate = buildGeneratedLevel(levelNumber, attempt);
    if (isQualityLevel(candidate, getTier(levelNumber))) return candidate;
  }

  return buildFallbackLevel(levelNumber);
};

export const GENERATED_LEVELS: LevelDefinition[] = Array.from({ length: 100 }, (_, index) =>
  buildLevel(index + 1),
);

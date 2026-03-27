import type { LevelDefinition, Obstacle, Position } from '@/src/game/types';

const COLOR_POOL = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#f97316', '#06b6d4'];
const LABEL_POOL = ['R', 'G', 'B', 'Y', 'P', 'O', 'C'];

type LayoutFamily =
  | 'single-choke'
  | 'double-choke'
  | 'side-pocket'
  | 'cross-road'
  | 'zigzag';

const keyOf = ({ x, y }: Position) => `${x},${y}`;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

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

const getCarCountForLevel = (levelNumber: number) => {
  if (levelNumber <= 8) return 2;
  if (levelNumber <= 18) return 3;
  if (levelNumber <= 35) return 4;
  if (levelNumber <= 58) return 5;
  if (levelNumber <= 82) return 6;
  return 7;
};

const getBoardSize = (levelNumber: number, carCount: number) => {
  if (levelNumber <= 10) return { width: 8, height: 6 };
  if (levelNumber <= 30) return { width: 9, height: 7 };
  if (levelNumber <= 55) return { width: 10, height: 8 };
  if (carCount <= 6) return { width: 10, height: 9 };
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

const getLayoutFamily = (levelNumber: number, rng: () => number): LayoutFamily => {
  if (levelNumber <= 8) return 'single-choke';
  if (levelNumber <= 20) {
    return shuffle<LayoutFamily>(['single-choke', 'side-pocket'], rng)[0];
  }
  if (levelNumber <= 40) {
    return shuffle<LayoutFamily>(
      ['single-choke', 'double-choke', 'side-pocket'],
      rng,
    )[0];
  }
  if (levelNumber <= 70) {
    return shuffle<LayoutFamily>(
      ['double-choke', 'side-pocket', 'cross-road', 'zigzag'],
      rng,
    )[0];
  }
  return shuffle<LayoutFamily>(
    ['double-choke', 'cross-road', 'zigzag', 'side-pocket'],
    rng,
  )[0];
};

const getWinningOrder = (
  levelNumber: number,
  carCount: number,
  rng: () => number,
) => {
  const order = Array.from({ length: carCount }, (_, i) => i);

  if (levelNumber <= 8) return order;

  if (levelNumber <= 20) {
    const pivot = levelNumber % carCount;
    return order.slice(pivot).concat(order.slice(0, pivot));
  }

  const shuffled = shuffle(order, rng);

  if (carCount >= 5) {
    const head = shuffled.slice(0, carCount - 2);
    const tail = shuffled.slice(carCount - 2).reverse();
    return head.concat(tail);
  }

  return shuffled;
};

const carveLine = (
  open: Set<string>,
  from: Position,
  to: Position,
  width: number,
  height: number,
) => {
  let x = from.x;
  let y = from.y;

  const add = (px: number, py: number) => {
    if (px >= 0 && px < width && py >= 0 && py < height) {
      open.add(`${px},${py}`);
    }
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

const carvePath = (
  open: Set<string>,
  points: Position[],
  width: number,
  height: number,
) => {
  for (let i = 0; i < points.length - 1; i += 1) {
    carveLine(open, points[i], points[i + 1], width, height);
  }
};

const getStartRows = (height: number, carCount: number, rng: () => number) => {
  const mid = Math.floor(height / 2);
  const candidates = [
    mid,
    mid - 1,
    mid + 1,
    mid - 2,
    mid + 2,
    1,
    height - 2,
  ].map((row) => clamp(row, 1, height - 2));

  const rows = shuffle(candidates, rng);
  const unique: number[] = [];

  for (const row of rows) {
    if (!unique.includes(row)) unique.push(row);
    if (unique.length === carCount) break;
  }

  return unique.sort((a, b) => a - b);
};

const getParkingPositions = ({
  levelNumber,
  carCount,
  width,
  height,
  order,
  family,
  rng,
}: {
  levelNumber: number;
  carCount: number;
  width: number;
  height: number;
  order: number[];
  family: LayoutFamily;
  rng: () => number;
}) => {
  const positions: Position[] = Array.from({ length: carCount }, () => ({ x: 0, y: 0 }));
  const used = new Set<string>();
  const midY = Math.floor(height / 2);

  const denseRows =
    levelNumber <= 10
      ? [midY - 1, midY, midY + 1]
      : levelNumber <= 40
        ? [midY - 1, midY, midY + 1, midY - 2]
        : [midY - 1, midY, midY + 1];

  const familyAnchor =
    family === 'single-choke'
      ? width - 2
      : family === 'double-choke'
        ? width - 3
        : family === 'cross-road'
          ? width - 4
          : width - 3;

  for (let rank = 0; rank < order.length; rank += 1) {
    const carIndex = order[rank];
    const isLateOrder = rank >= Math.floor(order.length / 2);

    const preferredX = isLateOrder
      ? clamp(familyAnchor - 1, Math.floor(width / 2), width - 2)
      : clamp(familyAnchor, Math.floor(width / 2), width - 2);

    const extraX =
      family === 'zigzag'
        ? [preferredX, preferredX - 2, preferredX + 1, preferredX - 1]
        : [preferredX, preferredX - 1, preferredX + 1, preferredX - 2];

    const preferredRow =
      denseRows[(rank + Math.floor(rng() * denseRows.length)) % denseRows.length];

    const candidateRows = [
      preferredRow,
      midY,
      preferredRow - 1,
      preferredRow + 1,
      preferredRow - 2,
      preferredRow + 2,
    ].map((y) => clamp(y, 1, height - 2));

    const candidateCols = extraX.map((x) =>
      clamp(x, Math.floor(width / 2), width - 2),
    );

    let chosen: Position | null = null;

    for (const y of candidateRows) {
      for (const x of candidateCols) {
        const k = `${x},${y}`;
        if (!used.has(k)) {
          chosen = { x, y };
          used.add(k);
          break;
        }
      }
      if (chosen) break;
    }

    if (!chosen) {
      // son çare: sağ yarıda ilk boş yer
      for (let y = 1; y < height - 1 && !chosen; y += 1) {
        for (let x = Math.floor(width / 2); x < width - 1; x += 1) {
          const k = `${x},${y}`;
          if (!used.has(k)) {
            chosen = { x, y };
            used.add(k);
            break;
          }
        }
      }
    }

    if (!chosen) {
      positions[carIndex] = { x: width - 2, y: clamp(midY, 1, height - 2) };
    } else {
      positions[carIndex] = chosen;
    }
  }

  return positions;
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
  const leftX = 1;
  const rightX = width - 2;

  const choke1 = clamp(2 + Math.floor(width * 0.3), 2, width - 5);
  const choke2 = clamp(2 + Math.floor(width * 0.6), 3, width - 3);

  carveLine(open, { x: leftX, y: midY }, { x: rightX, y: midY }, width, height);

  for (const row of carRows) {
    carvePath(
      open,
      [
        { x: 0, y: row },
        { x: 1, y: row },
        { x: 1, y: midY },
      ],
      width,
      height,
    );
  }

  if (family === 'single-choke' || family === 'side-pocket') {
    carveLine(
      open,
      { x: choke1, y: midY - 1 },
      { x: choke1, y: midY + 1 },
      width,
      height,
    );
  }

  if (family === 'double-choke' || family === 'cross-road' || family === 'zigzag') {
    carveLine(
      open,
      { x: choke1, y: midY - 1 },
      { x: choke1, y: midY + 1 },
      width,
      height,
    );
    carveLine(
      open,
      { x: choke2, y: midY - 1 },
      { x: choke2, y: midY + 1 },
      width,
      height,
    );
  }

  if (family === 'side-pocket') {
    carveLine(
      open,
      { x: choke1 + 1, y: midY },
      { x: choke1 + 1, y: clamp(midY - 2, 1, height - 2) },
      width,
      height,
    );
    carveLine(
      open,
      { x: choke1 + 2, y: clamp(midY - 2, 1, height - 2) },
      { x: choke1 + 3, y: clamp(midY - 2, 1, height - 2) },
      width,
      height,
    );
  }

  if (family === 'cross-road') {
    const crossX = clamp(choke2 + 1, 2, width - 2);
    carveLine(open, { x: crossX, y: 1 }, { x: crossX, y: height - 2 }, width, height);
  }

  if (family === 'zigzag') {
    const upper = clamp(midY - 2, 1, height - 2);
    const lower = clamp(midY + 2, 1, height - 2);
    carvePath(
      open,
      [
        { x: choke1, y: midY },
        { x: choke1, y: upper },
        { x: choke2 - 1, y: upper },
        { x: choke2 - 1, y: lower },
        { x: rightX, y: lower },
      ],
      width,
      height,
    );
  }

  for (let i = 0; i < parkingPositions.length; i += 1) {
    const park = parkingPositions[i];

    if (levelNumber <= 15) {
      carvePath(
        open,
        [
          { x: choke1, y: midY },
          { x: park.x, y: midY },
          { x: park.x, y: park.y },
        ],
        width,
        height,
      );
      continue;
    }

    if (family === 'zigzag' && levelNumber >= 45) {
      const detourY = park.y < midY ? clamp(midY - 1, 1, height - 2) : clamp(midY + 1, 1, height - 2);
      carvePath(
        open,
        [
          { x: choke1, y: midY },
          { x: choke2, y: detourY },
          { x: park.x, y: detourY },
          { x: park.x, y: park.y },
        ],
        width,
        height,
      );
      continue;
    }

    const entryX = i % 2 === 0 ? choke1 : choke2;
    carvePath(
      open,
      [
        { x: entryX, y: midY },
        { x: park.x, y: midY },
        { x: park.x, y: park.y },
      ],
      width,
      height,
    );
  }

  if (levelNumber >= 28) {
    const branchX = clamp(choke1 + 1, 2, width - 3);
    carveLine(
      open,
      { x: branchX, y: midY },
      { x: branchX, y: clamp(midY + 2, 1, height - 2) },
      width,
      height,
    );
  }

  if (levelNumber >= 52) {
    const branchX = clamp(choke2 - 1, 2, width - 3);
    carveLine(
      open,
      { x: branchX, y: midY },
      { x: branchX, y: clamp(midY - 2, 1, height - 2) },
      width,
      height,
    );
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

const isInside = (width: number, height: number, p: Position) =>
  p.x >= 0 && p.y >= 0 && p.x < width && p.y < height;

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

const isSolvable = (level: LevelDefinition) => {
  const allMask = (1 << level.cars.length) - 1;
  const obstacleSet = new Set(level.obstacles.map((o) => keyOf(o.position)));
  const cars = level.cars;
  const spotByCarId = new Map(
    level.parkingSpots.map((spot) => [spot.acceptsCarId, spot.position]),
  );
  const memo = new Map<number, boolean>();

  const canParkWithMask = (index: number, mask: number) => {
    const car = cars[index];
    const spot = spotByCarId.get(car.id);
    if (!spot) return false;

    const blocked = new Set<string>(obstacleSet);

    for (let i = 0; i < cars.length; i += 1) {
      if (i === index) continue;
      const otherCar = cars[i];
      const isParked = (mask & (1 << i)) !== 0;
      blocked.add(
        keyOf(isParked ? (spotByCarId.get(otherCar.id) ?? otherCar.position) : otherCar.position),
      );
    }

    return hasPath({
      width: level.boardSize.width,
      height: level.boardSize.height,
      start: car.position,
      goal: spot,
      blocked,
    });
  };

  const canFinish = (mask: number): boolean => {
    if (mask === allMask) return true;
    if (memo.has(mask)) return memo.get(mask)!;

    for (let i = 0; i < cars.length; i += 1) {
      if ((mask & (1 << i)) !== 0) continue;
      if (canParkWithMask(i, mask) && canFinish(mask | (1 << i))) {
        memo.set(mask, true);
        return true;
      }
    }

    memo.set(mask, false);
    return false;
  };

  return canFinish(0);
};

const overlapsExist = (level: LevelDefinition) => {
  const occupied = new Set<string>();

  for (const car of level.cars) {
    const k = keyOf(car.position);
    if (occupied.has(k)) return true;
    occupied.add(k);
  }

  for (const spot of level.parkingSpots) {
    const k = keyOf(spot.position);
    if (occupied.has(k)) return true;
    occupied.add(k);
  }

  for (const obstacle of level.obstacles) {
    const k = keyOf(obstacle.position);
    if (occupied.has(k)) return true;
    occupied.add(k);
  }

  return false;
};

const buildCandidateLevel = (
  levelNumber: number,
  attempt: number,
): LevelDefinition => {
  const carCount = getCarCountForLevel(levelNumber);
  const boardSize = getBoardSize(levelNumber, carCount);
  const rng = createRng(levelNumber * 997 + attempt * 131 + carCount * 17);
  const order = getWinningOrder(levelNumber, carCount, rng);
  const family = getLayoutFamily(levelNumber, rng);
  const carRows = getStartRows(boardSize.height, carCount, rng);
  const parkingPositions = getParkingPositions({
    levelNumber,
    carCount,
    width: boardSize.width,
    height: boardSize.height,
    order,
    family,
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
    obstacles: makeObstacles({
      width: boardSize.width,
      height: boardSize.height,
      openCells,
    }),
  };
};

const buildEmergencyLevel = (levelNumber: number): LevelDefinition => {
  const safeLevel = Math.max(1, Math.min(levelNumber, 30));
  const carCount = getCarCountForLevel(safeLevel);
  const boardSize = getBoardSize(safeLevel, carCount);
  const rng = createRng(500000 + levelNumber * 59);
  const order = getWinningOrder(safeLevel, carCount, rng);
  const family: LayoutFamily = levelNumber % 2 === 0 ? 'single-choke' : 'double-choke';
  const carRows = getStartRows(boardSize.height, carCount, rng);
  const parkingPositions = getParkingPositions({
    levelNumber: safeLevel,
    carCount,
    width: boardSize.width,
    height: boardSize.height,
    order,
    family,
    rng,
  });

  const openCells = makeOpenCells({
    levelNumber: safeLevel,
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
    obstacles: makeObstacles({
      width: boardSize.width,
      height: boardSize.height,
      openCells,
    }),
  };
};

const buildLevel = (levelNumber: number): LevelDefinition => {
  const attempts =
    levelNumber <= 20 ? 10 : levelNumber <= 60 ? 14 : 18;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    let candidate: LevelDefinition;

    try {
      candidate = buildCandidateLevel(levelNumber, attempt);
    } catch {
      continue;
    }

    if (overlapsExist(candidate)) continue;
    if (isSolvable(candidate)) return candidate;
  }

  const emergency = buildEmergencyLevel(levelNumber);
  if (!overlapsExist(emergency) && isSolvable(emergency)) {
    return emergency;
  }

  // En son çare: ultra basit ama mutlaka açılan level
  const boardSize = { width: 8, height: 6 };
  const cars = [
    {
      id: 'car-1',
      label: LABEL_POOL[0],
      color: COLOR_POOL[0],
      position: { x: 0, y: 2 },
    },
    {
      id: 'car-2',
      label: LABEL_POOL[1],
      color: COLOR_POOL[1],
      position: { x: 0, y: 3 },
    },
  ];
  const parkingSpots = [
    {
      id: 'park-1',
      position: { x: 6, y: 2 },
      color: COLOR_POOL[0],
      acceptsCarId: 'car-1',
    },
    {
      id: 'park-2',
      position: { x: 6, y: 3 },
      color: COLOR_POOL[1],
      acceptsCarId: 'car-2',
    },
  ];

  const openCells = new Set<string>();
  carveLine(openCells, { x: 0, y: 2 }, { x: 6, y: 2 }, boardSize.width, boardSize.height);
  carveLine(openCells, { x: 0, y: 3 }, { x: 6, y: 3 }, boardSize.width, boardSize.height);
  carveLine(openCells, { x: 1, y: 2 }, { x: 1, y: 3 }, boardSize.width, boardSize.height);

  return {
    id: `level-${String(levelNumber).padStart(3, '0')}`,
    name: `Level ${levelNumber} - ${getDifficultyLabel(levelNumber)}`,
    boardSize,
    cars,
    parkingSpots,
    obstacles: makeObstacles({
      width: boardSize.width,
      height: boardSize.height,
      openCells,
    }),
  };
};

export const GENERATED_LEVELS: LevelDefinition[] = Array.from(
  { length: 100 },
  (_, index) => buildLevel(index + 1),
);
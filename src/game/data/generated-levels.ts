import type { LevelDefinition, Obstacle, Position } from '@/src/game/types';

const COLOR_POOL = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#f97316', '#06b6d4'];
const LABEL_POOL = ['R', 'G', 'B', 'Y', 'P', 'O', 'C'];

const keyOf = ({ x, y }: Position) => `${x},${y}`;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getCarCountForLevel = (levelNumber: number) => {
  if (levelNumber <= 4) return 2;
  if (levelNumber <= 10) return 3;
  if (levelNumber <= 20) return 4;
  if (levelNumber <= 40) return 5;
  if (levelNumber <= 70) return 6;
  return 7;
};

const getBoardSize = (levelNumber: number, carCount: number) => {
  if (levelNumber <= 5) return { width: 8, height: 6 };
  if (levelNumber <= 10) return { width: 9, height: 7 };
  if (carCount <= 4) return { width: 10, height: 8 };
  if (carCount <= 5) return { width: 11, height: 9 };
  return { width: 12, height: 10 };
};

const getDifficultyLabel = (levelNumber: number) => {
  if (levelNumber <= 5) return 'Tutorial Streets';
  if (levelNumber <= 10) return 'Early Pressure';
  if (levelNumber <= 20) return 'Trap District';
  if (levelNumber <= 40) return 'Gridlock Core';
  if (levelNumber <= 70) return 'Deadlock Sector';
  return 'No-Mistake Zone';
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

const getStartRows = (height: number, carCount: number) => {
  const rows = [
    Math.floor(height / 2),
    Math.floor(height / 2) - 1,
    Math.floor(height / 2) + 1,
    Math.floor(height / 2) - 2,
    Math.floor(height / 2) + 2,
    1,
    height - 2,
  ];

  return rows.map((row) => clamp(row, 1, height - 2)).slice(0, carCount);
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

const getParkingRows = (levelNumber: number, carRows: number[], height: number) => {
  if (levelNumber <= 5) {
    return [...carRows].reverse();
  }

  const rows = [...carRows];
  const shift = levelNumber <= 10 ? 1 : Math.min(rows.length - 1, 1 + Math.floor((levelNumber - 10) / 15));
  const rotated = rows.map((_, i) => rows[(i + shift) % rows.length]);

  if (levelNumber >= 10 && rotated.length > 2) {
    rotated[0] = clamp(rotated[0] + 1, 1, height - 2);
    rotated[rotated.length - 1] = clamp(rotated[rotated.length - 1] - 1, 1, height - 2);
  }

  return rotated;
};

const getStage = (levelNumber: number) => {
  if (levelNumber <= 5) return 0;
  if (levelNumber <= 10) return 1;
  if (levelNumber <= 20) return 2;
  if (levelNumber <= 40) return 3;
  return 4;
};

const getParkingX = ({
  levelNumber,
  carIndex,
  width,
  variant,
}: {
  levelNumber: number;
  carIndex: number;
  width: number;
  variant: number;
}) => {
  if (levelNumber <= 5) {
    return width - 2 - ((carIndex + variant) % 2);
  }

  const stage = getStage(levelNumber);
  const base = width - 2 - (carIndex % 2 === 0 ? 0 : 1);
  const inward = stage <= 1 ? 0 : clamp(Math.floor((stage + carIndex + variant) / 2), 1, 4);

  return clamp(base - inward, Math.floor(width / 2) - 1, width - 2);
};

const makeOpenCells = ({
  levelNumber,
  width,
  height,
  carRows,
  parkingRows,
  parkingXs,
  variant,
}: {
  levelNumber: number;
  width: number;
  height: number;
  carRows: number[];
  parkingRows: number[];
  parkingXs: number[];
  variant: number;
}) => {
  const open = new Set<string>();
  const centerY = Math.floor(height / 2);
  const stage = getStage(levelNumber);

  const leftGateX = levelNumber <= 5 ? 1 : 2;
  const hubX = clamp(2 + stage + (variant % 2), 2, width - 6);
  const rightHubX = clamp(width - 3 - (stage >= 3 ? 1 : 0), hubX + 2, width - 2);

  carvePath(
    open,
    [
      { x: leftGateX, y: centerY },
      { x: hubX, y: centerY },
      { x: rightHubX, y: centerY },
    ],
    width,
    height,
  );

  if (stage >= 2) {
    const verticalChokeX = clamp(hubX + 1 + (variant % 2), 3, width - 4);
    carveLine(open, { x: verticalChokeX, y: 1 }, { x: verticalChokeX, y: height - 2 }, width, height);
  }

  for (let i = 0; i < carRows.length; i += 1) {
    const startRow = carRows[i];
    const parkingRow = parkingRows[i];
    const parkingX = parkingXs[i];
    const branchX = clamp(leftGateX + (i % 2 === 0 ? 0 : 1), 1, hubX);

    carvePath(
      open,
      [
        { x: 0, y: startRow },
        { x: branchX, y: startRow },
        { x: branchX, y: centerY },
        { x: hubX, y: centerY },
      ],
      width,
      height,
    );

    const pocketOffset = i % 2 === 0 ? -1 : 1;
    const stagingRow = clamp(parkingRow + pocketOffset, 1, height - 2);

    carvePath(
      open,
      [
        { x: hubX, y: centerY },
        { x: rightHubX, y: centerY },
        { x: rightHubX, y: stagingRow },
        { x: parkingX, y: stagingRow },
        { x: parkingX, y: parkingRow },
      ],
      width,
      height,
    );

    if (stage >= 1) {
      const deadEndLength = 1 + ((levelNumber + variant + i) % 2);
      const deadEndY = clamp(stagingRow + (i % 2 === 0 ? -1 : 1), 1, height - 2);
      carveLine(
        open,
        { x: clamp(parkingX - 1, hubX + 1, width - 2), y: deadEndY },
        { x: clamp(parkingX - 1 - deadEndLength, hubX + 1, width - 2), y: deadEndY },
        width,
        height,
      );
    }
  }

  if (stage >= 3) {
    const falsePocketX = clamp(hubX + 1, 2, width - 4);
    const falsePocketY = clamp(centerY + (variant % 2 === 0 ? -2 : 2), 1, height - 2);
    carvePath(
      open,
      [
        { x: falsePocketX, y: centerY },
        { x: falsePocketX, y: falsePocketY },
        { x: clamp(falsePocketX + 1, 1, width - 2), y: falsePocketY },
      ],
      width,
      height,
    );
  }

  return open;
};

const buildLevel = (levelNumber: number, variant = 0): LevelDefinition => {
  const carCount = getCarCountForLevel(levelNumber);
  const boardSize = getBoardSize(levelNumber, carCount);
  const carRows = getStartRows(boardSize.height, carCount);
  const parkingRows = getParkingRows(levelNumber, carRows, boardSize.height);
  const parkingXs = Array.from({ length: carCount }, (_, i) => getParkingX({ levelNumber, carIndex: i, width: boardSize.width, variant }));

  const openCells = makeOpenCells({
    levelNumber,
    width: boardSize.width,
    height: boardSize.height,
    carRows,
    parkingRows,
    parkingXs,
    variant,
  });

  const cars = Array.from({ length: carCount }, (_, i) => ({
    id: `car-${i + 1}`,
    label: LABEL_POOL[i],
    color: COLOR_POOL[i],
    position: { x: 0, y: carRows[i] },
  }));

  const parkingSpots = Array.from({ length: carCount }, (_, i) => ({
    id: `park-${i + 1}`,
    position: { x: parkingXs[i], y: parkingRows[i] },
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
    const current = queue.shift();

    if (!current) {
      continue;
    }

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

const getMovementContext = (level: LevelDefinition) => {
  const obstacleSet = new Set(level.obstacles.map((o) => keyOf(o.position)));
  const carByIndex = level.cars;
  const spotByCarId = new Map(level.parkingSpots.map((spot) => [spot.acceptsCarId, spot.position]));

  const canParkWithMask = (index: number, mask: number) => {
    const car = carByIndex[index];
    const spot = spotByCarId.get(car.id);
    if (!spot) return false;

    const blocked = new Set<string>(obstacleSet);

    for (let i = 0; i < carByIndex.length; i += 1) {
      const otherCar = carByIndex[i];
      if (otherCar.id === car.id) continue;

      const isParked = (mask & (1 << i)) !== 0;
      blocked.add(isParked ? keyOf(spotByCarId.get(otherCar.id) ?? otherCar.position) : keyOf(otherCar.position));
    }

    return hasPath({
      width: level.boardSize.width,
      height: level.boardSize.height,
      start: car.position,
      goal: spot,
      blocked,
    });
  };

  return {
    allMask: (1 << level.cars.length) - 1,
    carByIndex,
    canParkWithMask,
  };
};

const hasWinningOrder = (level: LevelDefinition) => {
  const { allMask, carByIndex, canParkWithMask } = getMovementContext(level);

  const dfs = (mask: number, visiting: Set<number>): boolean => {
    if (mask === allMask) return true;
    if (visiting.has(mask)) return false;

    visiting.add(mask);

    for (let i = 0; i < carByIndex.length; i += 1) {
      if ((mask & (1 << i)) !== 0) {
        continue;
      }

      if (canParkWithMask(i, mask) && dfs(mask | (1 << i), visiting)) {
        return true;
      }
    }

    return false;
  };

  return dfs(0, new Set<number>());
};

const getDifficultyTargets = (levelNumber: number) => {
  if (levelNumber <= 5) {
    return { maxWinningOrders: 20, minFailureRatio: 0, minPunishingStates: 0, maxOpenRatio: 0.52 };
  }

  if (levelNumber <= 10) {
    return { maxWinningOrders: 10, minFailureRatio: 0.25, minPunishingStates: 2, maxOpenRatio: 0.46 };
  }

  if (levelNumber <= 20) {
    return { maxWinningOrders: 6, minFailureRatio: 0.4, minPunishingStates: 5, maxOpenRatio: 0.42 };
  }

  if (levelNumber <= 40) {
    return { maxWinningOrders: 4, minFailureRatio: 0.5, minPunishingStates: 9, maxOpenRatio: 0.38 };
  }

  return { maxWinningOrders: 2, minFailureRatio: 0.6, minPunishingStates: 12, maxOpenRatio: 0.34 };
};

const analyzeOrderPressure = (level: LevelDefinition) => {
  const { allMask, carByIndex, canParkWithMask } = getMovementContext(level);
  const solvableMemo = new Map<number, boolean>();

  const canWinFromMask = (mask: number): boolean => {
    if (mask === allMask) return true;

    const cached = solvableMemo.get(mask);
    if (cached !== undefined) {
      return cached;
    }

    let result = false;
    for (let i = 0; i < carByIndex.length; i += 1) {
      if ((mask & (1 << i)) !== 0) {
        continue;
      }

      if (canParkWithMask(i, mask) && canWinFromMask(mask | (1 << i))) {
        result = true;
        break;
      }
    }

    solvableMemo.set(mask, result);
    return result;
  };

  let winningOrders = 0;

  const countOrders = (mask: number) => {
    if (mask === allMask) {
      winningOrders += 1;
      return;
    }

    for (let i = 0; i < carByIndex.length; i += 1) {
      if ((mask & (1 << i)) !== 0) {
        continue;
      }

      const nextMask = mask | (1 << i);
      if (!canParkWithMask(i, mask) || !canWinFromMask(nextMask)) {
        continue;
      }

      countOrders(nextMask);
    }
  };

  let totalMoves = 0;
  let punishingMoves = 0;
  let punishingStates = 0;

  for (let mask = 0; mask <= allMask; mask += 1) {
    if (!canWinFromMask(mask) || mask === allMask) {
      continue;
    }

    let stateHasPunishment = false;

    for (let i = 0; i < carByIndex.length; i += 1) {
      if ((mask & (1 << i)) !== 0 || !canParkWithMask(i, mask)) {
        continue;
      }

      const nextMask = mask | (1 << i);
      totalMoves += 1;

      if (!canWinFromMask(nextMask)) {
        punishingMoves += 1;
        stateHasPunishment = true;
      }
    }

    if (stateHasPunishment) {
      punishingStates += 1;
    }
  }

  countOrders(0);

  const failureRatio = totalMoves > 0 ? punishingMoves / totalMoves : 0;

  return {
    winningOrders,
    punishingStates,
    failureRatio,
  };
};

const passesDifficultyProfile = (level: LevelDefinition, levelNumber: number) => {
  const targets = getDifficultyTargets(levelNumber);
  const pressure = analyzeOrderPressure(level);
  const totalCells = level.boardSize.width * level.boardSize.height;
  const openCells = totalCells - level.obstacles.length;
  const openRatio = openCells / totalCells;

  return (
    pressure.winningOrders >= 1 &&
    pressure.winningOrders <= targets.maxWinningOrders &&
    pressure.failureRatio >= targets.minFailureRatio &&
    pressure.punishingStates >= targets.minPunishingStates &&
    openRatio <= targets.maxOpenRatio
  );
};

const buildLevelWithPressure = (levelNumber: number): LevelDefinition => {
  for (let variant = 0; variant < 12; variant += 1) {
    const candidate = buildLevel(levelNumber, variant);

    if (passesDifficultyProfile(candidate, levelNumber)) {
      return candidate;
    }
  }

  return buildLevel(levelNumber, 0);
};

export const GENERATED_LEVELS: LevelDefinition[] = Array.from({ length: 99 }, (_, index) =>
  buildLevelWithPressure(index + 1),
);

if (GENERATED_LEVELS.length !== 99) {
  throw new Error('Crash Car Escape requires exactly 99 levels.');
}

for (const level of GENERATED_LEVELS) {
  const occupied = new Set<string>();

  for (const car of level.cars) {
    occupied.add(keyOf(car.position));
  }

  for (const spot of level.parkingSpots) {
    const k = keyOf(spot.position);

    if (occupied.has(k)) {
      throw new Error(`Invalid level: overlapping start + parking tile (${level.id}, ${k})`);
    }

    occupied.add(k);
  }

  if (!hasWinningOrder(level)) {
    throw new Error(`Invalid level: no winning order exists (${level.id})`);
  }
}

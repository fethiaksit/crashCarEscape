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

const getWinningOrder = (levelNumber: number, carCount: number) => {
  const order = Array.from({ length: carCount }, (_, i) => i);

  if (levelNumber <= 5) return order;
  if (levelNumber <= 10) {
    const pivot = (levelNumber - 6) % carCount;
    return order.slice(pivot).concat(order.slice(0, pivot));
  }

  const pivot = (levelNumber * 2 + 1) % carCount;
  const rotated = order.slice(pivot).concat(order.slice(0, pivot));
  const tail = rotated.splice(-Math.min(2, Math.max(1, carCount - 2)));
  return rotated.concat(tail);
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

  const unique: number[] = [];
  for (const row of rows.map((row) => clamp(row, 1, height - 2))) {
    if (!unique.includes(row)) unique.push(row);
    if (unique.length === carCount) break;
  }

  return unique;
};

const makeOpenCells = ({
  levelNumber,
  width,
  height,
  carRows,
  parkingPositions,
}: {
  levelNumber: number;
  width: number;
  height: number;
  carRows: number[];
  parkingPositions: Position[];
}) => {
  const open = new Set<string>();
  const midY = Math.floor(height / 2);
  const trunkStartX = levelNumber <= 5 ? 2 : 3;
  const trunkEndX = width - 2;
  const chokeX = clamp(levelNumber <= 5 ? 4 : levelNumber <= 10 ? 5 : 5 + Math.floor((levelNumber - 11) / 20), 4, width - 4);

  carveLine(open, { x: trunkStartX, y: midY }, { x: trunkEndX, y: midY }, width, height);
  carveLine(open, { x: 1, y: 1 }, { x: 1, y: height - 2 }, width, height);

  for (const startRow of carRows) {
    carvePath(
      open,
      [
        { x: 0, y: startRow },
        { x: 1, y: startRow },
        { x: 1, y: midY },
        { x: trunkStartX, y: midY },
      ],
      width,
      height,
    );
  }

  for (const park of parkingPositions) {
    carvePath(
      open,
      [
        { x: chokeX, y: midY },
        { x: park.x, y: midY },
        { x: park.x, y: park.y },
      ],
      width,
      height,
    );
  }

  if (levelNumber >= 6) {
    const branchCount = levelNumber <= 10 ? 2 : 3 + Math.floor((levelNumber - 11) / 15);
    for (let i = 0; i < branchCount; i += 1) {
      const branchX = clamp(chokeX + 1 + i * 2, chokeX + 1, width - 3);
      const branchY = i % 2 === 0 ? clamp(midY - 1 - (i % 3), 1, height - 2) : clamp(midY + 1 + (i % 3), 1, height - 2);
      carveLine(open, { x: branchX, y: midY }, { x: branchX, y: branchY }, width, height);
    }
  }

  if (levelNumber >= 11) {
    const sideChokeX = clamp(chokeX - 1, 3, width - 4);
    carveLine(open, { x: sideChokeX, y: midY - 1 }, { x: sideChokeX, y: midY + 1 }, width, height);
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

const getParkingPositions = (
  levelNumber: number,
  carCount: number,
  width: number,
  height: number,
) => {
  const order = getWinningOrder(levelNumber, carCount);
  const used = new Set<string>();
  const positions: Position[] = Array.from({ length: carCount }, () => ({ x: 0, y: 0 }));
  const midY = Math.floor(height / 2);

  const fallbackRows = [midY - 2, midY + 2, midY - 1, midY + 1, 1, height - 2, midY];

  for (let rank = 0; rank < order.length; rank += 1) {
    const carIndex = order[rank];
    const isLateOrder = rank >= order.length - Math.min(2, Math.max(1, carCount - 2));

    const preferredX =
      levelNumber <= 5
        ? width - 2
        : levelNumber <= 10
          ? clamp(width - 3 - (rank % 2), Math.floor(width / 2), width - 2)
          : isLateOrder
            ? clamp(width - 5 + (rank - (order.length - 2)), Math.floor(width / 2), width - 3)
            : clamp(width - 2 - (rank % 3), Math.floor(width / 2) + 1, width - 2);

    const preferredY = levelNumber <= 5 ? fallbackRows[rank % fallbackRows.length] : isLateOrder ? midY : fallbackRows[(rank + levelNumber) % fallbackRows.length];
    const candidateRows = [preferredY, midY, preferredY - 1, preferredY + 1, preferredY - 2, preferredY + 2]
      .map((y) => clamp(y, 1, height - 2));
    const candidateCols = [preferredX, preferredX - 1, preferredX + 1].map((x) => clamp(x, Math.floor(width / 2), width - 2));

    let chosen: Position | null = null;
    for (const y of candidateRows) {
      for (const x of candidateCols) {
        const key = `${x},${y}`;
        if (!used.has(key)) {
          chosen = { x, y };
          used.add(key);
          break;
        }
      }
      if (chosen) break;
    }

    if (!chosen) throw new Error(`Unable to assign unique parking position for level ${levelNumber}`);
    positions[carIndex] = chosen;
  }

  return positions;
};

const buildLevel = (levelNumber: number): LevelDefinition => {
  const carCount = getCarCountForLevel(levelNumber);
  const boardSize = getBoardSize(levelNumber, carCount);
  const carRows = getStartRows(boardSize.height, carCount);
  const parkingPositions = getParkingPositions(levelNumber, carCount, boardSize.width, boardSize.height);

  const openCells = makeOpenCells({
    levelNumber,
    width: boardSize.width,
    height: boardSize.height,
    carRows,
    parkingPositions,
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

const hasWinningOrder = (level: LevelDefinition) => {
  const allMask = (1 << level.cars.length) - 1;
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
      blocked.add(
        isParked ? keyOf(spotByCarId.get(otherCar.id) ?? otherCar.position) : keyOf(otherCar.position),
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

  const memo = new Map<number, boolean>();

  const dfs = (mask: number): boolean => {
    if (mask === allMask) return true;
    if (memo.has(mask)) return memo.get(mask)!;

    for (let i = 0; i < carByIndex.length; i += 1) {
      if ((mask & (1 << i)) !== 0) continue;

      if (canParkWithMask(i, mask) && dfs(mask | (1 << i))) {
        memo.set(mask, true);
        return true;
      }
    }

    memo.set(mask, false);
    return false;
  };

  return dfs(0);
};

const hasDeadlockFirstMove = (level: LevelDefinition) => {
  if (level.cars.length <= 2) return false;

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
      const other = cars[i];
      const isParked = (mask & (1 << i)) !== 0;
      blocked.add(keyOf(isParked ? (spotByCarId.get(other.id) ?? other.position) : other.position));
    }

    return hasPath({
      width: level.boardSize.width,
      height: level.boardSize.height,
      start: car.position,
      goal: spot,
      blocked,
    });
  };

  const memo = new Map<number, boolean>();
  const canFinishFromMask = (mask: number): boolean => {
    if (mask === allMask) return true;
    if (memo.has(mask)) return memo.get(mask)!;

    for (let i = 0; i < cars.length; i += 1) {
      if ((mask & (1 << i)) !== 0) continue;
      if (canParkWithMask(i, mask) && canFinishFromMask(mask | (1 << i))) {
        memo.set(mask, true);
        return true;
      }
    }

    memo.set(mask, false);
    return false;
  };

  for (let i = 0; i < cars.length; i += 1) {
    if (canParkWithMask(i, 0) && !canFinishFromMask(1 << i)) {
      return true;
    }
  }

  return false;
};

export const GENERATED_LEVELS: LevelDefinition[] = Array.from({ length: 99 }, (_, index) => buildLevel(index + 1));

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

  if (!hasWinningOrder(level)) {
    throw new Error(`Invalid level: no winning order exists (${level.id})`);
  }

  const levelNumber = Number(level.id.replace('level-', ''));
  if (levelNumber >= 11 && !hasDeadlockFirstMove(level)) {
    throw new Error(`Invalid level: expected deadlocking wrong first move in hard levels (${level.id})`);
  }
}

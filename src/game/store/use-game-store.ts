import { create } from 'zustand';

import { LEVELS } from '@/src/game/data/levels';
import type { Car, GameStatus, LevelDefinition, ParkingSpot, Position } from '@/src/game/types';

type AppScreen = 'home' | 'levels' | 'game';

type GameStore = {
  levels: LevelDefinition[];
  currentScreen: AppScreen;
  selectedLevelId: string;
  highestUnlockedLevelIndex: number;
  completedLevelIds: string[];
  level: LevelDefinition;
  cars: Car[];
  status: GameStatus;
  statusMessage: string;
  selectedCarId?: string;
  movingCarId?: string;
  movingPath: Position[];
  parkedCarIds: string[];
  openHome: () => void;
  openLevelSelect: () => void;
  startLevel: (levelId: string) => void;
  restartLevel: () => void;
  tryMoveCarToOwnSpot: (carId: string) => void;
  clearStatusMessage: () => void;
  advanceMovingCar: () => void;
  goToNextLevel: () => void;
  isLevelUnlocked: (levelId: string) => boolean;
  unlockNextLevel: (currentLevelId: string) => void;
  getCompletedLevels: () => string[];
};

const cloneCars = (cars: Car[]) => cars.map((car) => ({ ...car, position: { ...car.position } }));

const getLevelById = (levelId: string) => LEVELS.find((level) => level.id === levelId) ?? LEVELS[0];

const key = (position: Position) => `${position.x},${position.y}`;

const isInsideBoard = (position: Position, level: LevelDefinition) => {
  return (
    position.x >= 0 &&
    position.x < level.boardSize.width &&
    position.y >= 0 &&
    position.y < level.boardSize.height
  );
};

const setupLevelState = (level: LevelDefinition) => ({
  level,
  cars: cloneCars(level.cars),
  status: 'playing' as GameStatus,
  statusMessage: '',
  selectedCarId: undefined,
  movingCarId: undefined,
  movingPath: [],
  parkedCarIds: [],
});

const DIRECTIONS: Position[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

const findPath = ({
  start,
  target,
  level,
  blocked,
}: {
  start: Position;
  target: Position;
  level: LevelDefinition;
  blocked: Set<string>;
}): Position[] | undefined => {
  if (start.x === target.x && start.y === target.y) {
    return [start];
  }

  const queue: Position[] = [{ ...start }];
  const visited = new Set<string>([key(start)]);
  const cameFrom = new Map<string, Position>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    for (const direction of DIRECTIONS) {
      const next = {
        x: current.x + direction.x,
        y: current.y + direction.y,
      };
      const nextKey = key(next);

      if (!isInsideBoard(next, level) || visited.has(nextKey) || blocked.has(nextKey)) {
        continue;
      }

      cameFrom.set(nextKey, current);

      if (next.x === target.x && next.y === target.y) {
        const path = [target];
        let cursor: Position | undefined = current;

        while (cursor) {
          path.push(cursor);
          if (cursor.x === start.x && cursor.y === start.y) {
            break;
          }

          cursor = cameFrom.get(key(cursor));
        }

        return path.reverse();
      }

      visited.add(nextKey);
      queue.push(next);
    }
  }

  return undefined;
};

const getMatchingParkingSpot = (level: LevelDefinition, car: Car): ParkingSpot | undefined => {
  return level.parkingSpots.find((spot) => {
    const matchesColor = spot.color.toLowerCase() === car.color.toLowerCase();
    const matchesCarId = !spot.acceptsCarId || spot.acceptsCarId === car.id;
    return matchesColor && matchesCarId;
  });
};

const canCarReachAnyMatchingSpot = ({
  car,
  cars,
  level,
  parkedCarIds,
}: {
  car: Car;
  cars: Car[];
  level: LevelDefinition;
  parkedCarIds: string[];
}) => {
  const matchingSpot = getMatchingParkingSpot(level, car);

  if (!matchingSpot) {
    return false;
  }

  const blockedByObstacles = new Set(level.obstacles.map((obstacle) => key(obstacle.position)));
  const blockedByCars = cars.filter((otherCar) => otherCar.id !== car.id).map((otherCar) => key(otherCar.position));

  const blocked = new Set([...blockedByObstacles, ...blockedByCars]);

  const occupyingCar = cars.find(
    (otherCar) =>
      otherCar.position.x === matchingSpot.position.x && otherCar.position.y === matchingSpot.position.y,
  );

  if (occupyingCar && occupyingCar.id !== car.id) {
    return false;
  }

  blocked.delete(key(matchingSpot.position));

  const path = findPath({
    start: car.position,
    target: matchingSpot.position,
    level,
    blocked,
  });

  if (!path) {
    return false;
  }

  if (path.length > 1) {
    return true;
  }

  return parkedCarIds.includes(car.id);
};

const isDeadlocked = ({
  cars,
  level,
  parkedCarIds,
}: {
  cars: Car[];
  level: LevelDefinition;
  parkedCarIds: string[];
}) => {
  const remainingCars = cars.filter((car) => !parkedCarIds.includes(car.id));

  if (remainingCars.length === 0) {
    return false;
  }

  return remainingCars.some(
    (car) =>
      !canCarReachAnyMatchingSpot({
        car,
        cars,
        level,
        parkedCarIds,
      }),
  );
};

export const useGameStore = create<GameStore>((set, get) => ({
  levels: LEVELS,
  currentScreen: 'home',
  selectedLevelId: LEVELS[0].id,
  highestUnlockedLevelIndex: 0,
  completedLevelIds: [],
  ...setupLevelState(LEVELS[0]),
  openHome: () => set({ currentScreen: 'home', statusMessage: '' }),
  openLevelSelect: () => set({ currentScreen: 'levels', statusMessage: '' }),
  isLevelUnlocked: (levelId) => {
    const state = get();
    const levelIndex = state.levels.findIndex((item) => item.id === levelId);
    if (levelIndex < 0) {
      return false;
    }

    return levelIndex <= state.highestUnlockedLevelIndex || state.completedLevelIds.includes(levelId);
  },
  unlockNextLevel: (currentLevelId) => {
    const state = get();
    const currentLevelIndex = state.levels.findIndex((level) => level.id === currentLevelId);

    if (currentLevelIndex < 0) {
      return;
    }

    const unlockedIndex = Math.max(
      state.highestUnlockedLevelIndex,
      Math.min(currentLevelIndex + 1, state.levels.length - 1),
    );

    set({ highestUnlockedLevelIndex: unlockedIndex });
  },
  getCompletedLevels: () => [...get().completedLevelIds],
  startLevel: (levelId) => {
    const level = getLevelById(levelId);
    const { isLevelUnlocked } = get();

    if (!isLevelUnlocked(level.id)) {
      return;
    }

    set({
      currentScreen: 'game',
      selectedLevelId: level.id,
      ...setupLevelState(level),
    });
  },
  restartLevel: () => {
    const { level } = get();
    set(setupLevelState(level));
  },
  tryMoveCarToOwnSpot: (carId) => {
    const state = get();
    if (state.status !== 'playing' || state.movingCarId || state.parkedCarIds.includes(carId)) {
      return;
    }

    const selectedCar = state.cars.find((car) => car.id === carId);
    if (!selectedCar) {
      return;
    }

    const targetSpot = getMatchingParkingSpot(state.level, selectedCar);
    if (!targetSpot) {
      set({
        selectedCarId: carId,
        statusMessage: 'No matching spot.',
      });
      return;
    }

    const blockedByObstacles = new Set(state.level.obstacles.map((obstacle) => key(obstacle.position)));
    const blockedByCars = state.cars.filter((car) => car.id !== selectedCar.id).map((car) => key(car.position));

    const blocked = new Set([...blockedByObstacles, ...blockedByCars]);
    blocked.delete(key(targetSpot.position));

    const path = findPath({
      start: selectedCar.position,
      target: targetSpot.position,
      level: state.level,
      blocked,
    });

    if (!path || path.length < 2) {
      set({
        selectedCarId: carId,
        statusMessage: 'No path',
      });
      return;
    }

    set({
      selectedCarId: carId,
      movingCarId: selectedCar.id,
      movingPath: path.slice(1),
      statusMessage: '',
    });
  },
  clearStatusMessage: () => set({ statusMessage: '' }),
  goToNextLevel: () => {
    const state = get();
    const currentLevelIndex = state.levels.findIndex((level) => level.id === state.level.id);
    const nextLevel = state.levels[currentLevelIndex + 1];

    if (!nextLevel) {
      set({ currentScreen: 'levels' });
      return;
    }

    state.startLevel(nextLevel.id);
  },
  advanceMovingCar: () => {
    const state = get();
    if (!state.movingCarId || state.movingPath.length === 0) {
      return;
    }

    const [nextPosition, ...restPath] = state.movingPath;

    const movedCars = state.cars.map((car) => {
      if (car.id !== state.movingCarId) {
        return car;
      }

      return {
        ...car,
        position: { ...nextPosition },
      };
    });

    if (restPath.length > 0) {
      set({
        cars: movedCars,
        movingPath: restPath,
      });
      return;
    }

    const movingCar = movedCars.find((car) => car.id === state.movingCarId);
    if (!movingCar) {
      set({ cars: movedCars, movingCarId: undefined, movingPath: [] });
      return;
    }

    const parkedSpot = state.level.parkingSpots.find(
      (spot) => spot.position.x === movingCar.position.x && spot.position.y === movingCar.position.y,
    );

    const colorMatchesSpot =
      parkedSpot &&
      parkedSpot.color.toLowerCase() === movingCar.color.toLowerCase() &&
      (!parkedSpot.acceptsCarId || parkedSpot.acceptsCarId === movingCar.id);

    const parkedCarIds = colorMatchesSpot
      ? Array.from(new Set([...state.parkedCarIds, movingCar.id]))
      : state.parkedCarIds;

    const hasWon = parkedCarIds.length === movedCars.length;
    const hasDeadlock = !hasWon
      ? isDeadlocked({
          cars: movedCars,
          level: state.level,
          parkedCarIds,
        })
      : false;

    const currentLevelIndex = state.levels.findIndex((level) => level.id === state.level.id);
    const unlockedIndex = hasWon
      ? Math.max(state.highestUnlockedLevelIndex, Math.min(currentLevelIndex + 1, state.levels.length - 1))
      : state.highestUnlockedLevelIndex;

    const completedLevelIds = hasWon
      ? Array.from(new Set([...state.completedLevelIds, state.level.id]))
      : state.completedLevelIds;

    set({
      cars: movedCars,
      movingCarId: undefined,
      movingPath: [],
      parkedCarIds,
      highestUnlockedLevelIndex: unlockedIndex,
      completedLevelIds,
      status: hasWon ? 'won' : hasDeadlock ? 'failed' : state.status,
      statusMessage: hasWon
        ? 'Tüm arabalar doğru yerlere park edildi!'
        : hasDeadlock
        ? 'No valid solution remains. You lost this level.'
        : state.statusMessage,
      selectedCarId: hasWon || hasDeadlock ? undefined : state.selectedCarId,
    });
  },
}));

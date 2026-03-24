import { create } from 'zustand';

import { LEVELS } from '@/src/game/data/levels';
import type { Car, GameStatus, LevelDefinition, Position } from '@/src/game/types';

type AppScreen = 'home' | 'game';

type GameStore = {
  levels: LevelDefinition[];
  currentScreen: AppScreen;
  selectedLevelId: string;
  level: LevelDefinition;
  cars: Car[];
  status: GameStatus;
  statusMessage: string;
  selectedCarId?: string;
  movingCarId?: string;
  movingPath: Position[];
  parkedCarIds: string[];
  openHome: () => void;
  startLevel: (levelId: string) => void;
  playSelectedLevel: () => void;
  restartLevel: () => void;
  selectCar: (carId: string) => void;
  sendSelectedCarToSpot: (spotId: string) => void;
  clearStatusMessage: () => void;
  advanceMovingCar: () => void;
  goToNextLevel: () => void;
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
  const matchingSpots = level.parkingSpots.filter((spot) => {
    const matchesColor = spot.color.toLowerCase() === car.color.toLowerCase();
    const matchesCarId = !spot.acceptsCarId || spot.acceptsCarId === car.id;
    return matchesColor && matchesCarId;
  });

  if (matchingSpots.length === 0) {
    return false;
  }

  const blockedByObstacles = new Set(level.obstacles.map((obstacle) => key(obstacle.position)));
  const blockedByCars = cars.filter((otherCar) => otherCar.id !== car.id).map((otherCar) => key(otherCar.position));

  const blocked = new Set([...blockedByObstacles, ...blockedByCars]);

  return matchingSpots.some((spot) => {
    const occupyingCar = cars.find(
      (otherCar) => otherCar.position.x === spot.position.x && otherCar.position.y === spot.position.y,
    );

    if (occupyingCar && occupyingCar.id !== car.id) {
      return false;
    }

    blocked.delete(key(spot.position));

    const path = findPath({
      start: car.position,
      target: spot.position,
      level,
      blocked,
    });

    blocked.add(key(spot.position));

    if (!path) {
      return false;
    }

    if (path.length > 1) {
      return true;
    }

    return parkedCarIds.includes(car.id);
  });
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
  ...setupLevelState(LEVELS[0]),
  openHome: () => set({ currentScreen: 'home' }),
  startLevel: (levelId) => {
    const level = getLevelById(levelId);

    set({
      currentScreen: 'game',
      selectedLevelId: level.id,
      ...setupLevelState(level),
    });
  },
  playSelectedLevel: () => {
    const state = get();
    state.startLevel(state.selectedLevelId);
  },
  restartLevel: () => {
    const { level } = get();
    set(setupLevelState(level));
  },
  selectCar: (carId) => {
    const state = get();
    if (state.status !== 'playing' || state.movingCarId || state.parkedCarIds.includes(carId)) {
      return;
    }

    set({
      selectedCarId: carId,
      statusMessage: '',
    });
  },
  sendSelectedCarToSpot: (spotId) => {
    const state = get();
    if (state.status !== 'playing' || state.movingCarId || !state.selectedCarId) {
      return;
    }

    const selectedCar = state.cars.find((car) => car.id === state.selectedCarId);
    const targetSpot = state.level.parkingSpots.find((spot) => spot.id === spotId);

    if (!selectedCar || !targetSpot || state.parkedCarIds.includes(selectedCar.id)) {
      return;
    }

    const matchesColor = targetSpot.color.toLowerCase() === selectedCar.color.toLowerCase();
    const matchesCarId = !targetSpot.acceptsCarId || targetSpot.acceptsCarId === selectedCar.id;

    if (!matchesColor || !matchesCarId) {
      set({
        statusMessage: 'Wrong parking spot.',
      });
      return;
    }

    const blockedByObstacles = new Set(state.level.obstacles.map((obstacle) => key(obstacle.position)));
    const blockedByCars = state.cars
      .filter((car) => car.id !== selectedCar.id)
      .map((car) => key(car.position));

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
        statusMessage: 'No path available.',
      });
      return;
    }

    set({
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
      set({ currentScreen: 'home' });
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

    set({
      cars: movedCars,
      movingCarId: undefined,
      movingPath: [],
      parkedCarIds,
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

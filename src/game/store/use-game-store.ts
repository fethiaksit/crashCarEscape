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
  drawingPath: Position[];
  parkedCarIds: string[];
  openHome: () => void;
  startLevel: (levelId: string) => void;
  playSelectedLevel: () => void;
  restartLevel: () => void;
  selectCar: (carId: string) => void;
  startDrawingPath: (position: Position) => void;
  extendDrawingPath: (position: Position) => void;
  finishDrawingPath: () => void;
  clearStatusMessage: () => void;
  advanceMovingCar: () => void;
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
  drawingPath: [],
  parkedCarIds: [],
});

const areAdjacent = (a: Position, b: Position) => {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return dx + dy === 1;
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
    if (state.status !== 'playing' || state.movingCarId) {
      return;
    }

    set({
      selectedCarId: carId,
      drawingPath: [],
      statusMessage: '',
    });
  },
  startDrawingPath: (position) => {
    const state = get();
    if (state.status !== 'playing' || state.movingCarId || !state.selectedCarId) {
      return;
    }

    const selectedCar = state.cars.find((car) => car.id === state.selectedCarId);
    if (!selectedCar || state.parkedCarIds.includes(selectedCar.id)) {
      return;
    }

    if (!isInsideBoard(position, state.level)) {
      return;
    }

    const start = selectedCar.position;

    if (position.x !== start.x || position.y !== start.y) {
      return;
    }

    set({ drawingPath: [{ ...start }] });
  },
  extendDrawingPath: (position) => {
    const state = get();
    if (state.status !== 'playing' || state.movingCarId || !state.selectedCarId || !state.drawingPath.length) {
      return;
    }

    if (!isInsideBoard(position, state.level)) {
      return;
    }

    const last = state.drawingPath[state.drawingPath.length - 1];
    if (last.x === position.x && last.y === position.y) {
      return;
    }

    if (!areAdjacent(last, position)) {
      return;
    }

    const selectedCar = state.cars.find((car) => car.id === state.selectedCarId);
    if (!selectedCar) {
      return;
    }

    const occupiedByObstacles = new Set(state.level.obstacles.map((obstacle) => key(obstacle.position)));
    const occupiedByOtherCars = new Set(
      state.cars.filter((car) => car.id !== selectedCar.id).map((car) => key(car.position)),
    );

    if (occupiedByObstacles.has(key(position)) || occupiedByOtherCars.has(key(position))) {
      return;
    }

    const alreadyInPath = state.drawingPath.some((point) => point.x === position.x && point.y === position.y);
    if (alreadyInPath) {
      return;
    }

    set({ drawingPath: [...state.drawingPath, position] });
  },
  finishDrawingPath: () => {
    const state = get();
    if (state.status !== 'playing' || state.movingCarId || !state.selectedCarId) {
      return;
    }

    const selectedCar = state.cars.find((car) => car.id === state.selectedCarId);
    if (!selectedCar || state.parkedCarIds.includes(selectedCar.id)) {
      set({ drawingPath: [] });
      return;
    }

    if (state.drawingPath.length < 2) {
      set({ drawingPath: [], statusMessage: 'Draw a route from the selected car.' });
      return;
    }

    const destination = state.drawingPath[state.drawingPath.length - 1];
    const destinationSpot = state.level.parkingSpots.find(
      (spot) => spot.position.x === destination.x && spot.position.y === destination.y,
    );

    if (!destinationSpot) {
      set({ drawingPath: [], statusMessage: 'Path must end on a parking spot.' });
      return;
    }

    const matchesColor = destinationSpot.color.toLowerCase() === selectedCar.color.toLowerCase();
    const matchesCarId = !destinationSpot.acceptsCarId || destinationSpot.acceptsCarId === selectedCar.id;

    if (!matchesColor || !matchesCarId) {
      set({
        status: 'failed',
        statusMessage: `${selectedCar.label} reached the wrong parking spot.`,
        drawingPath: [],
      });
      return;
    }

    set({
      movingCarId: selectedCar.id,
      movingPath: state.drawingPath.slice(1),
      drawingPath: [],
      statusMessage: '',
    });
  },
  clearStatusMessage: () => set({ statusMessage: '' }),
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

    const parkedCarIds = parkedSpot
      ? Array.from(new Set([...state.parkedCarIds, movingCar.id]))
      : state.parkedCarIds;

    const hasWon = parkedCarIds.length === movedCars.length;

    set({
      cars: movedCars,
      movingCarId: undefined,
      movingPath: [],
      parkedCarIds,
      status: hasWon ? 'won' : state.status,
      statusMessage: hasWon ? 'All cars parked in matching spots!' : state.statusMessage,
    });
  },
}));

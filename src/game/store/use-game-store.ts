import { create } from 'zustand';

import { LEVELS } from '@/src/game/data/levels';
import { resolveCarMove } from '@/src/game/engine/movement';
import type { Car, GameStatus, LevelDefinition, MoveResolution, Position } from '@/src/game/types';

type AppScreen = 'home' | 'game';

type GameStore = {
  levels: LevelDefinition[];
  currentScreen: AppScreen;
  selectedLevelId: string;
  level: LevelDefinition;
  cars: Car[];
  exitedCarIds: string[];
  status: GameStatus;
  statusMessage: string;
  selectedCarId?: string;
  movingCarId?: string;
  pendingMove?: MoveResolution;
  openHome: () => void;
  startLevel: (levelId: string) => void;
  playSelectedLevel: () => void;
  restartLevel: () => void;
  tapCar: (carId: string) => void;
  completeMove: () => void;
};

const cloneCars = (cars: Car[]) => cars.map((car) => ({ ...car, position: { ...car.position } }));

const toObstaclePositions = (level: LevelDefinition): Position[] => level.obstacles.map((obs) => obs.position);

const computeWinState = (level: LevelDefinition, exitedCarIds: string[]) => {
  const requiredIds = level.cars.filter((car) => car.requiredToExit).map((car) => car.id);
  return requiredIds.every((id) => exitedCarIds.includes(id));
};

const getLevelById = (levelId: string) => LEVELS.find((level) => level.id === levelId) ?? LEVELS[0];

const setupLevelState = (level: LevelDefinition) => ({
  level,
  cars: cloneCars(level.cars),
  exitedCarIds: [],
  status: 'playing' as GameStatus,
  statusMessage: '',
  selectedCarId: undefined,
  movingCarId: undefined,
  pendingMove: undefined,
});

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
  tapCar: (carId) => {
    const state = get();
    if (state.status !== 'playing' || state.movingCarId) {
      return;
    }

    const move = resolveCarMove({
      carId,
      cars: state.cars,
      obstacles: toObstaclePositions(state.level),
      exits: state.level.exits,
      boardSize: state.level.boardSize,
    });

    if (move.reason === 'none' || move.reason === 'invalid') {
      set({ selectedCarId: carId });
      return;
    }

    set({
      selectedCarId: carId,
      movingCarId: carId,
      pendingMove: move,
    });
  },
  completeMove: () => {
    const state = get();
    const move = state.pendingMove;

    if (!move || !state.movingCarId) {
      return;
    }

    const isExitMove = move.reason === 'exited';
    const movedCars = state.cars
      .map((car) => {
        if (car.id !== move.carId) {
          return car;
        }
        return {
          ...car,
          position: { ...move.to },
        };
      })
      .filter((car) => !(isExitMove && car.id === move.carId));

    const exitedCarIds = isExitMove ? [...state.exitedCarIds, move.carId] : state.exitedCarIds;

    if (move.failReason) {
      set({
        cars: movedCars,
        exitedCarIds,
        status: 'failed',
        statusMessage: move.failReason,
        movingCarId: undefined,
        pendingMove: undefined,
      });
      return;
    }

    if (computeWinState(state.level, exitedCarIds)) {
      set({
        cars: movedCars,
        exitedCarIds,
        status: 'won',
        statusMessage: 'All required cars escaped!',
        movingCarId: undefined,
        pendingMove: undefined,
      });
      return;
    }

    set({
      cars: movedCars,
      exitedCarIds,
      movingCarId: undefined,
      pendingMove: undefined,
    });
  },
}));

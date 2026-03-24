import { create } from 'zustand';

import { LEVEL_001 } from '@/src/game/data/level-001';
import { resolveCarMove } from '@/src/game/engine/movement';
import type { Car, GameStatus, LevelDefinition, MoveResolution, Position } from '@/src/game/types';

type GameStore = {
  level: LevelDefinition;
  cars: Car[];
  exitedCarIds: string[];
  status: GameStatus;
  statusMessage: string;
  selectedCarId?: string;
  movingCarId?: string;
  pendingMove?: MoveResolution;
  restartLevel: () => void;
  tapCar: (carId: string) => void;
  completeMove: () => void;
};

const cloneCars = (cars: Car[]) => cars.map((car) => ({ ...car, position: { ...car.position } }));

const toObstaclePositions = (level: LevelDefinition): Position[] => level.obstacles.map((obs) => obs.position);

const computeWinState = (cars: Car[], exitedCarIds: string[]) => {
  const requiredIds = cars.filter((car) => car.requiredToExit).map((car) => car.id);
  return requiredIds.every((id) => exitedCarIds.includes(id));
};

export const useGameStore = create<GameStore>((set, get) => ({
  level: LEVEL_001,
  cars: cloneCars(LEVEL_001.cars),
  exitedCarIds: [],
  status: 'playing',
  statusMessage: '',
  restartLevel: () => {
    set({
      cars: cloneCars(LEVEL_001.cars),
      exitedCarIds: [],
      status: 'playing',
      statusMessage: '',
      selectedCarId: undefined,
      movingCarId: undefined,
      pendingMove: undefined,
    });
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

    if (computeWinState(LEVEL_001.cars, exitedCarIds)) {
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

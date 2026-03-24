import { create } from 'zustand';

import { level001 } from '@/game/data/level-001';
import { getFinalPosition } from '@/game/engine/movement';
import { Car, GameStatus, Level, MovementResult } from '@/game/types/gameTypes';

type GameState = {
  currentLevel: Level;
  cars: Car[];
  selectedCarId: string | null;
  gameStatus: GameStatus;
  lastMove: MovementResult | null;
  selectCar: (carId: string) => void;
  moveSelectedCar: () => void;
  resetLevel: () => void;
};

const initialLevel = level001;

export const useGameStore = create<GameState>((set, get) => ({
  currentLevel: initialLevel,
  cars: initialLevel.cars,
  selectedCarId: null,
  gameStatus: 'idle',
  lastMove: null,

  selectCar: (carId) => set({ selectedCarId: carId }),

  moveSelectedCar: () => {
    const state = get();

    if (state.gameStatus === 'fail' || state.gameStatus === 'win' || !state.selectedCarId) {
      return;
    }

    const car = state.cars.find((c) => c.id === state.selectedCarId);
    if (!car || car.isAtExit) {
      return;
    }

    const result = getFinalPosition(
      car,
      state.cars,
      state.currentLevel.obstacles,
      state.currentLevel.exits,
      {
        width: state.currentLevel.width,
        height: state.currentLevel.height,
      },
    );

    const updatedCars = state.cars.map((c) => {
      if (c.id !== car.id) return c;
      return {
        ...c,
        position: result.finalPosition,
        isAtExit: result.reachedExit || c.isAtExit,
      };
    });

    const status: GameStatus = result.failed
      ? 'fail'
      : updatedCars.every((c) => c.isAtExit)
        ? 'win'
        : 'running';

    set({
      cars: updatedCars,
      gameStatus: status,
      lastMove: result,
    });
  },

  resetLevel: () =>
    set({
      currentLevel: initialLevel,
      cars: initialLevel.cars,
      selectedCarId: null,
      gameStatus: 'idle',
      lastMove: null,
    }),
}));

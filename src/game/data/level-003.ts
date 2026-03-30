import type { LevelDefinition } from '@/src/game/types';

export const LEVEL_003: LevelDefinition = {
  id: 'level-003',
  name: 'Level 3',
  boardSize: {
    width: 7,
    height: 6,
  },
  cars: [
    {
      id: 'car-red',
      label: 'R',
      color: '#ef4444',
      position: { x: 1, y: 2 },
    },
    {
      id: 'car-green',
      label: 'G',
      color: '#22c55e',
      position: { x: 0, y: 5 },
    },
    {
      id: 'car-cyan',
      label: 'C',
      color: '#06b6d4',
      position: { x: 6, y: 0 },
    },
  ],
  obstacles: [
    {
      id: 'obs-1',
      position: { x: 3, y: 2 },
    },
    {
      id: 'obs-2',
      position: { x: 4, y: 4 },
    },
    {
      id: 'obs-3',
      position: { x: 2, y: 0 },
    },
  ],
  parkingSpots: [
    {
      id: 'park-red',
      position: { x: 6, y: 2 },
      color: '#ef4444',
      acceptsCarId: 'car-red',
    },
    {
      id: 'park-green',
      position: { x: 0, y: 0 },
      color: '#22c55e',
      acceptsCarId: 'car-green',
    },
    {
      id: 'park-cyan',
      position: { x: 5, y: 5 },
      color: '#06b6d4',
      acceptsCarId: 'car-cyan',
    },
  ],
};

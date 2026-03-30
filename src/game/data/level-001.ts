import type { LevelDefinition } from '@/src/game/types';

export const LEVEL_001: LevelDefinition = {
  id: 'level-001',
  name: 'Level 1',
  boardSize: {
    width: 6,
    height: 6,
  },
  cars: [
    {
      id: 'car-red',
      label: 'R',
      color: '#ef4444',
      position: { x: 0, y: 2 },
    },
    {
      id: 'car-green',
      label: 'G',
      color: '#22c55e',
      position: { x: 1, y: 5 },
    },
  ],
  obstacles: [
    {
      id: 'obs-1',
      position: { x: 3, y: 4 },
    },
    {
      id: 'obs-2',
      position: { x: 1, y: 1 },
    },
  ],
  parkingSpots: [
    {
      id: 'park-red',
      position: { x: 5, y: 2 },
      color: '#ef4444',
      acceptsCarId: 'car-red',
    },
    {
      id: 'park-green',
      position: { x: 4, y: 5 },
      color: '#22c55e',
      acceptsCarId: 'car-green',
    },
  ],
};

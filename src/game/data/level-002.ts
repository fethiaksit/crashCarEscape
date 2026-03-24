import type { LevelDefinition } from '@/src/game/types';

export const LEVEL_002: LevelDefinition = {
  id: 'level-002',
  name: 'Level 2',
  boardSize: {
    width: 6,
    height: 6,
  },
  cars: [
    {
      id: 'car-red',
      label: 'R',
      color: '#ef4444',
      position: { x: 0, y: 3 },
      direction: 'right',
      requiredToExit: true,
    },
    {
      id: 'car-green',
      label: 'G',
      color: '#22c55e',
      position: { x: 2, y: 0 },
      direction: 'down',
      requiredToExit: false,
    },
    {
      id: 'car-blue',
      label: 'B',
      color: '#3b82f6',
      position: { x: 5, y: 1 },
      direction: 'down',
      requiredToExit: false,
    },
  ],
  obstacles: [
    {
      id: 'obs-1',
      position: { x: 2, y: 4 },
    },
    {
      id: 'obs-2',
      position: { x: 4, y: 2 },
    },
  ],
  exits: [
    {
      id: 'exit-main',
      position: { x: 5, y: 3 },
      acceptsCarIds: ['car-red'],
    },
  ],
};

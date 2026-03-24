import { LEVEL_001 } from '@/src/game/data/level-001';
import { LEVEL_002 } from '@/src/game/data/level-002';
import { LEVEL_003 } from '@/src/game/data/level-003';
import { EXTRA_LEVELS } from '@/src/game/data/extra-levels';
import { ORDER_DEPENDENT_LEVEL_OVERRIDES } from '@/src/game/data/order-dependent-level-overrides';

import type { LevelDefinition } from '@/src/game/types';

const BASE_LEVELS: LevelDefinition[] = [LEVEL_001, LEVEL_002, LEVEL_003, ...EXTRA_LEVELS];

const ORDER_OVERRIDE_BY_ID = new Map(
  ORDER_DEPENDENT_LEVEL_OVERRIDES.map((level) => [level.id, level] as const),
);

export const LEVELS: LevelDefinition[] = BASE_LEVELS.map(
  (level) => ORDER_OVERRIDE_BY_ID.get(level.id) ?? level,
);

import { FlatList, StyleSheet } from 'react-native';

import { LevelCard } from '@/src/ui/components/level-card';
import type { LevelDefinition } from '@/src/game/types';

type LevelGridProps = {
  levels: LevelDefinition[];
  selectedLevelId: string;
  completedLevelIds: string[];
  onSelectLevel: (levelId: string) => void;
};

export function LevelGrid({ levels, selectedLevelId, completedLevelIds, onSelectLevel }: LevelGridProps) {
  return (
    <FlatList
      data={levels}
      keyExtractor={(level) => level.id}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.row}
      numColumns={5}
      renderItem={({ item, index }) => (
        <LevelCard
          levelNumber={index + 1}
          isCompleted={completedLevelIds.includes(item.id)}
          isCurrent={item.id === selectedLevelId}
          onPress={() => onSelectLevel(item.id)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 10,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    gap: 10,
  },
});

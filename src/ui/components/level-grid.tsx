import { FlatList, StyleSheet, useWindowDimensions } from 'react-native';

import { LevelCard } from '@/src/ui/components/level-card';
import type { LevelDefinition } from '@/src/game/types';

type LevelGridProps = {
  levels: LevelDefinition[];
  selectedLevelId: string;
  completedLevelIds: string[];
  onSelectLevel: (levelId: string) => void;
};

export function LevelGrid({ levels, selectedLevelId, completedLevelIds, onSelectLevel }: LevelGridProps) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(280, width - 36);
  const numColumns = Math.max(5, Math.min(9, Math.floor(contentWidth / 56)));

  return (
    <FlatList
      data={levels}
      key={`grid-${numColumns}`}
      keyExtractor={(level) => level.id}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.row}
      numColumns={numColumns}
      showsVerticalScrollIndicator={false}
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
    gap: 8,
    paddingBottom: 20,
  },
  row: {
    gap: 8,
  },
});

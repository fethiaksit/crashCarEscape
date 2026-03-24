import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGameStore } from '@/src/game/store/use-game-store';
import { LevelGrid } from '@/src/ui/components/level-grid';

export function LevelSelectScreen() {
  const levels = useGameStore((state) => state.levels);
  const selectedLevelId = useGameStore((state) => state.selectedLevelId);
  const completedLevelIds = useGameStore((state) => state.completedLevelIds);
  const startLevel = useGameStore((state) => state.startLevel);
  const openHome = useGameStore((state) => state.openHome);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerWrap}>
          <Pressable onPress={openHome} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.title}>Bölümler</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <Text style={styles.progressText}>99 seviye açık • Tamamlanan: {completedLevelIds.length}</Text>

        <LevelGrid
          levels={levels}
          selectedLevelId={selectedLevelId}
          completedLevelIds={completedLevelIds}
          onSelectLevel={startLevel}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: '800',
  },
  backButtonPlaceholder: {
    width: 36,
    height: 36,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
  },
  progressText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
});

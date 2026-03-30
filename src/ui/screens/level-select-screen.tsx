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
          <Pressable
            onPress={openHome}
            style={({ pressed }) => [styles.backButton, pressed && { transform: [{ scale: 1.05 }] }]}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.title}>Bölümler</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <Text style={styles.progressText}>Toplam bölüm: {levels.length}</Text>

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
    backgroundColor: '#0F172A',
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
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    color: '#e2e8f0',
    fontSize: 24,
    fontWeight: '800',
  },
  backButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  title: {
    color: '#F1F5F9',
    fontSize: 28,
    fontWeight: '900',
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  progressText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
});

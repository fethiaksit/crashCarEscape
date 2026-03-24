import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGameStore } from '@/src/game/store/use-game-store';

export function HomeScreen() {
  const levels = useGameStore((state) => state.levels);
  const selectedLevelId = useGameStore((state) => state.selectedLevelId);
  const startLevel = useGameStore((state) => state.startLevel);
  const playSelectedLevel = useGameStore((state) => state.playSelectedLevel);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Crash Car Escape</Text>

        <Pressable style={styles.playButton} onPress={playSelectedLevel}>
          <Text style={styles.playButtonText}>Play</Text>
        </Pressable>

        <View style={styles.levelSection}>
          <Text style={styles.sectionTitle}>Select a level</Text>
          <View style={styles.levelList}>
            {levels.map((level) => {
              const isSelected = selectedLevelId === level.id;

              return (
                <Pressable
                  key={level.id}
                  onPress={() => startLevel(level.id)}
                  style={[styles.levelCard, isSelected && styles.levelCardSelected]}>
                  <Text style={styles.levelTitle}>{level.name}</Text>
                  <Text style={styles.levelMeta}>
                    {level.boardSize.width}x{level.boardSize.height} grid
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 36,
    gap: 22,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#f8fafc',
    textAlign: 'center',
  },
  playButton: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingHorizontal: 36,
    paddingVertical: 14,
  },
  playButtonText: {
    color: '#eff6ff',
    fontSize: 20,
    fontWeight: '800',
  },
  levelSection: {
    width: '100%',
    gap: 12,
  },
  sectionTitle: {
    color: '#cbd5e1',
    fontSize: 17,
    fontWeight: '700',
  },
  levelList: {
    gap: 10,
  },
  levelCard: {
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#0f172a',
  },
  levelCardSelected: {
    borderColor: '#facc15',
    backgroundColor: '#1e293b',
  },
  levelTitle: {
    color: '#f8fafc',
    fontWeight: '800',
    fontSize: 18,
  },
  levelMeta: {
    color: '#94a3b8',
    marginTop: 4,
    fontSize: 13,
  },
});

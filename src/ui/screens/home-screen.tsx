import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGameStore } from '@/src/game/store/use-game-store';

export function HomeScreen() {
  const openLevelSelect = useGameStore((state) => state.openLevelSelect);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable style={styles.settingsButton} onPress={() => undefined}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </Pressable>

        <View style={styles.centerContent}>
          <Text style={styles.title}>Crash Car Escape</Text>

          <Pressable style={styles.playButton} onPress={openLevelSelect}>
            <Text style={styles.playButtonText}>Oyuna Başla</Text>
          </Pressable>
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
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  settingsButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingBottom: 60,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#f8fafc',
    textAlign: 'center',
  },
  playButton: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingHorizontal: 30,
    paddingVertical: 14,
  },
  playButtonText: {
    color: '#eff6ff',
    fontSize: 21,
    fontWeight: '800',
  },
});

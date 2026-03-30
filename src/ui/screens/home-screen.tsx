import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGameStore } from '@/src/game/store/use-game-store';

export function HomeScreen() {
  const openLevelSelect = useGameStore((state) => state.openLevelSelect);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable
          style={({ pressed }) => [styles.settingsButton, pressed && { transform: [{ scale: 1.05 }] }]}
          onPress={() => undefined}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </Pressable>

        <View style={styles.centerContent}>
          <Text style={styles.title}>Untangle Puzzle</Text>

          <Pressable
            style={({ pressed }) => [
              styles.playButtonWrapper,
              pressed && { transform: [{ scale: 1.05 }] }
            ]}
            onPress={openLevelSelect}>
            <LinearGradient
              colors={['#8B5CF6', '#F472B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playButtonGradient}>
              <Text style={styles.playButtonText}>Oyuna Başla</Text>
            </LinearGradient>
          </Pressable>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  settingsButton: {
    alignSelf: 'flex-end',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingsIcon: {
    fontSize: 24,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    paddingBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#F1F5F9',
    textAlign: 'center',
    textShadowColor: '#2DD4BF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  playButtonWrapper: {
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 15,
  },
  playButtonGradient: {
    borderRadius: 24,
    paddingHorizontal: 48,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameBoard } from '@/src/game/components/game-board';
import { useGameStore } from '@/src/game/store/use-game-store';

const STATUS_TEXT: Record<string, string> = {
  won: 'You win!',
  failed: 'Level failed',
};

export function GameScreen() {
  const level = useGameStore((state) => state.level);
  const status = useGameStore((state) => state.status);
  const statusMessage = useGameStore((state) => state.statusMessage);
  const restartLevel = useGameStore((state) => state.restartLevel);

  const showOverlay = status !== 'playing';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Crash Car Escape</Text>
        <Text style={styles.levelLabel}>{level.name}</Text>

        <View style={styles.boardWrap}>
          <GameBoard />
          {showOverlay && (
            <View style={styles.overlay}>
              <Text style={styles.overlayTitle}>{STATUS_TEXT[status]}</Text>
              {!!statusMessage && <Text style={styles.overlayMessage}>{statusMessage}</Text>}
            </View>
          )}
        </View>

        <Pressable style={styles.button} onPress={restartLevel}>
          <Text style={styles.buttonText}>Restart</Text>
        </Pressable>
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
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontSize: 28,
    color: '#f8fafc',
    fontWeight: '800',
  },
  levelLabel: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 12,
  },
  boardWrap: {
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 20,
  },
  overlayTitle: {
    color: '#f8fafc',
    fontWeight: '900',
    fontSize: 30,
  },
  overlayMessage: {
    color: '#e2e8f0',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#eff6ff',
    fontWeight: '700',
    fontSize: 16,
  },
});

import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameBoard } from '@/src/game/components/game-board';
import { useGameStore } from '@/src/game/store/use-game-store';

const STATUS_TEXT: Record<string, string> = {
  won: 'Kazandın',
  failed: 'You lost',
};

export function GameScreen() {
  const levels = useGameStore((state) => state.levels);
  const level = useGameStore((state) => state.level);
  const status = useGameStore((state) => state.status);
  const statusMessage = useGameStore((state) => state.statusMessage);
  const goToNextLevel = useGameStore((state) => state.goToNextLevel);
  const restartLevel = useGameStore((state) => state.restartLevel);
  const openHome = useGameStore((state) => state.openHome);
  const isLastLevel = levels[levels.length - 1]?.id === level.id;

  const showOverlay = status !== 'playing';

  useEffect(() => {
    if (status !== 'won') {
      return;
    }

    const timer = setTimeout(() => {
      goToNextLevel();
    }, 900);

    return () => clearTimeout(timer);
  }, [goToNextLevel, status]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Crash Car Escape</Text>
        <Text style={styles.levelLabel}>{level.name}</Text>
        <Text style={styles.hint}>Tap a car, then tap a matching parking spot to auto-drive there.</Text>

        <View style={styles.boardWrap}>
          <GameBoard />
          {showOverlay && (
            <View style={styles.overlay}>
              <Text style={styles.overlayTitle}>{STATUS_TEXT[status]}</Text>
              {!!statusMessage && <Text style={styles.overlayMessage}>{statusMessage}</Text>}
              {status === 'won' && (
                <Text style={styles.overlayMessage}>
                  {isLastLevel ? 'Tüm bölümler tamamlandı! Ana menüye dönülüyor...' : 'Sıradaki bölüm yükleniyor...'}
                </Text>
              )}
            </View>
          )}
        </View>

        {!!statusMessage && status === 'playing' && <Text style={styles.message}>{statusMessage}</Text>}

        <View style={styles.buttonRow}>
          <Pressable style={styles.button} onPress={restartLevel}>
            <Text style={styles.buttonText}>Restart</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.secondaryButton]} onPress={openHome}>
            <Text style={styles.buttonText}>Main Menu</Text>
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
  },
  hint: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 8,
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
  message: {
    color: '#f8fafc',
    fontSize: 13,
  },
  buttonRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: '#475569',
  },
  buttonText: {
    color: '#eff6ff',
    fontWeight: '700',
    fontSize: 16,
  },
});

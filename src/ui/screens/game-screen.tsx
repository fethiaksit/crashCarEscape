import { useEffect, useMemo, useState } from 'react';
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
  const openHome = useGameStore((state) => state.openHome);
  const openLevelSelect = useGameStore((state) => state.openLevelSelect);
  const isLastLevel = levels[levels.length - 1]?.id === level.id;
  const [boardViewport, setBoardViewport] = useState({ width: 320, height: 320 });
  const [isPauseMenuOpen, setPauseMenuOpen] = useState(false);

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

  const normalizedBoardViewport = useMemo(
    () => ({
      width: Math.max(120, boardViewport.width),
      height: Math.max(120, boardViewport.height),
    }),
    [boardViewport.height, boardViewport.width],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View
          style={styles.boardArea}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setBoardViewport({ width, height });
          }}>
          <View style={styles.boardWrap}>
            <GameBoard viewportWidth={normalizedBoardViewport.width} viewportHeight={normalizedBoardViewport.height} />
            {showOverlay && (
              <View style={styles.overlay}>
                <Text style={styles.overlayTitle}>{STATUS_TEXT[status]}</Text>
                {!!statusMessage && <Text style={styles.overlayMessage}>{statusMessage}</Text>}
                {status === 'won' && (
                  <Text style={styles.overlayMessage}>
                    {isLastLevel ? 'Tüm bölümler tamamlandı! Bölüm seçimine dönülüyor...' : 'Sıradaki bölüm yükleniyor...'}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        <Pressable
          style={styles.pauseButton}
          onPress={() => setPauseMenuOpen((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel="Pause menu">
          <Text style={styles.pauseIcon}>⏸</Text>
        </Pressable>

        {isPauseMenuOpen && (
          <View style={styles.pauseOverlay}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setPauseMenuOpen(false)} />
            <View style={styles.pauseCard}>
              <Text style={styles.pauseTitle}>Paused</Text>
              <Pressable
                style={styles.pauseAction}
                onPress={() => {
                  setPauseMenuOpen(false);
                  openHome();
                }}>
                <Text style={styles.pauseActionText}>Return to Home Page</Text>
              </Pressable>
              <Pressable
                style={styles.pauseAction}
                onPress={() => {
                  setPauseMenuOpen(false);
                  openLevelSelect();
                }}>
                <Text style={styles.pauseActionText}>Return to Level Page</Text>
              </Pressable>
            </View>
          </View>
        )}
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
    position: 'relative',
  },
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardWrap: {
    position: 'relative',
    width: '100%',
    height: '100%',
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
  pauseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.86)',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pauseIcon: {
    fontSize: 20,
    color: '#f8fafc',
    fontWeight: '700',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 20,
  },
  pauseCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 18,
    gap: 10,
  },
  pauseTitle: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  pauseAction: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  pauseActionText: {
    color: '#e2e8f0',
    fontWeight: '700',
    textAlign: 'center',
  },
});

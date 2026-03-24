import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameBoard } from '@/src/game/components/game-board';
import { useGameStore } from '@/src/game/store/use-game-store';

const STATUS_TEXT: Record<string, string> = {
  won: 'Kazandın',
  failed: 'You lost',
};

export function GameScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const levels = useGameStore((state) => state.levels);
  const level = useGameStore((state) => state.level);
  const status = useGameStore((state) => state.status);
  const statusMessage = useGameStore((state) => state.statusMessage);
  const goToNextLevel = useGameStore((state) => state.goToNextLevel);
  const restartLevel = useGameStore((state) => state.restartLevel);
  const openLevelSelect = useGameStore((state) => state.openLevelSelect);
  const isLastLevel = levels[levels.length - 1]?.id === level.id;
  const [boardViewport, setBoardViewport] = useState({ width: 320, height: 320 });

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

  const sidePanelWidth = useMemo(() => Math.max(220, Math.min(360, windowWidth * 0.34)), [windowWidth]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.sidePanel, { width: sidePanelWidth }]}>
          <Text style={styles.title}>Crash Car Escape</Text>
          <Text style={styles.levelLabel}>{level.name}</Text>
          <Text style={styles.hint}>Tap a car to auto-send it to its own matching parking spot.</Text>

          <View style={styles.sidePanelSpacer} />

          {!!statusMessage && status === 'playing' && <Text style={styles.message}>{statusMessage}</Text>}

          <View style={styles.buttonColumn}>
            <Pressable style={styles.button} onPress={restartLevel}>
              <Text style={styles.buttonText}>Restart</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.secondaryButton]} onPress={openLevelSelect}>
              <Text style={styles.buttonText}>Levels</Text>
            </Pressable>
          </View>
        </View>

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
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  sidePanel: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  sidePanelSpacer: {
    flex: 1,
    minHeight: 8,
  },
  title: {
    fontSize: 30,
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
  },
  boardArea: {
    flex: 1,
    minWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
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
  buttonColumn: {
    gap: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
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

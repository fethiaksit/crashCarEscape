import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameBoard } from '@/src/game/components/game-board';
import { useGameStore } from '@/src/game/store/use-game-store';

const STATUS_TEXT: Record<string, string> = {
  won: 'Kazandın',
  failed: 'You lost',
};

export function GameScreen() {
  const { width, height } = useWindowDimensions();
  const levels = useGameStore((state) => state.levels);
  const level = useGameStore((state) => state.level);
  const status = useGameStore((state) => state.status);
  const statusMessage = useGameStore((state) => state.statusMessage);
  const goToNextLevel = useGameStore((state) => state.goToNextLevel);
  const restartLevel = useGameStore((state) => state.restartLevel);
  const openLevelSelect = useGameStore((state) => state.openLevelSelect);
  const isLastLevel = levels[levels.length - 1]?.id === level.id;

  const boardPixelSize = useMemo(() => {
    const horizontal = Math.min(width - 24, 560);
    const vertical = Math.max(240, height - 290);
    return Math.max(220, Math.min(horizontal, vertical));
  }, [height, width]);

  const showOverlay = status !== 'playing';

  useEffect(() => {
    if (status !== 'won') return;

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
        <Text style={styles.hint}>Arabaya dokun: sistem kendi rengine ait park alanına otomatik yollar.</Text>

        <View style={[styles.boardWrap, { width: boardPixelSize, height: boardPixelSize }]}> 
          <GameBoard boardPixelSize={boardPixelSize} />
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

        {!!statusMessage && status === 'playing' && <Text style={styles.message}>{statusMessage}</Text>}

        <View style={styles.buttonRow}>
          <Pressable style={styles.button} onPress={restartLevel}>
            <Text style={styles.buttonText}>Restart</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.secondaryButton]} onPress={openLevelSelect}>
            <Text style={styles.buttonText}>Levels</Text>
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
    justifyContent: 'space-evenly',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
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
    fontSize: 12,
    textAlign: 'center',
  },
  boardWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
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

import { Pressable, StyleSheet, Text, View } from 'react-native';

type LevelCardProps = {
  levelNumber: number;
  isLocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  onPress: () => void;
};

export function LevelCard({ levelNumber, isLocked, isCompleted, isCurrent, onPress }: LevelCardProps) {
  return (
    <Pressable
      style={[styles.card, isLocked && styles.lockedCard, isCurrent && styles.currentCard]}
      disabled={isLocked}
      onPress={onPress}>
      <Text style={[styles.levelText, isLocked && styles.lockedText]}>Level {levelNumber}</Text>
      <View style={styles.metaWrap}>
        {isLocked ? <Text style={styles.lockText}>🔒</Text> : <Text style={styles.lockText}>🔓</Text>}
        {isCompleted ? <Text style={styles.doneText}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '31%',
    minWidth: 96,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    backgroundColor: '#0f172a',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  lockedCard: {
    borderColor: '#475569',
    backgroundColor: '#111827',
    opacity: 0.82,
  },
  currentCard: {
    borderColor: '#facc15',
    backgroundColor: '#1e293b',
  },
  levelText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '800',
  },
  lockedText: {
    color: '#94a3b8',
  },
  metaWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lockText: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  doneText: {
    fontSize: 14,
    color: '#4ade80',
    fontWeight: '900',
  },
});

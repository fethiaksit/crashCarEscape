import { Pressable, StyleSheet, Text, View } from 'react-native';

type LevelCardProps = {
  levelNumber: number;
  isCompleted: boolean;
  isCurrent: boolean;
  onPress: () => void;
};

export function LevelCard({ levelNumber, isCompleted, isCurrent, onPress }: LevelCardProps) {
  return (
    <Pressable style={[styles.card, isCurrent && styles.currentCard]} onPress={onPress}>
      <Text style={styles.levelText}>{levelNumber}</Text>
      <View style={styles.metaWrap}>{isCompleted ? <Text style={styles.doneText}>✓</Text> : <Text style={styles.dot}>•</Text>}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#334155',
    backgroundColor: '#0f172a',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  currentCard: {
    borderColor: '#38bdf8',
    backgroundColor: '#1e293b',
  },
  levelText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '800',
  },
  metaWrap: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  dot: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  doneText: {
    fontSize: 12,
    color: '#4ade80',
    fontWeight: '900',
  },
});

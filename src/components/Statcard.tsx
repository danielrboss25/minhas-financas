import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { colors, radius, space } from '../theme/theme';

export default function StatCard({
  title,
  value,
  right,
  color = colors.primary,
}: {
  title: string;
  value: string;
  right?: React.ReactNode;
  color?: string;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400 }}
      style={{ flex: 1 }}
    >
      <BlurView intensity={30} tint="dark" style={styles.card}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
        {right}
      </BlurView>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  } as ViewStyle,
  dot: {
    width: 10, height: 10, borderRadius: 10,
    marginTop: 2,
  } as ViewStyle,
  title: { color: colors.sub, fontSize: 12 } as TextStyle,
  value: { color: colors.text, fontSize: 20, fontWeight: '700' } as TextStyle,
});

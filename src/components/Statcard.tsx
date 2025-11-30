// src/components/StatCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { COLORS } from "../theme/theme";

type StatCardProps = {
  title: string;
  value: string;
  right?: React.ReactNode;
  color?: string;
};

export default function StatCard({
  title,
  value,
  right,
  color = COLORS.income, // cor default se não passares nada
}: StatCardProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400 }}
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
    borderRadius: 16,
    overflow: "hidden",
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginTop: 2,
  },
  title: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
});

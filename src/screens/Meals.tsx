import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/theme";
export default function MealsScreen() {
  return (
    <View style={styles.c}>
      <Text>Refeições</Text>
    </View>
  );
}
const styles = StyleSheet.create({ c: { flex: 1 } });

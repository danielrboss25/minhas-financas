import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function BootScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Minhas Finanças</Text>
      <Text style={styles.subtitle}>A validar sessão. A sério.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  title: { color: "#F9FAFB", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#94A3B8", marginTop: 8, fontSize: 12, fontWeight: "600" },
});

// src/screens/Profile.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { LogOut, User } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const displayName = useMemo(() => {
    const name = user?.displayName?.trim();
    if (name) return name;
    const email = user?.email?.trim();
    if (email) return email;
    return "Utilizador";
  }, [user]);

  async function handleLogout() {
    await logout();
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <LinearGradient
          colors={["#1F2937", "#020617"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              <User color="#E5E7EB" size={18} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Perfil</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                Sessão iniciada como: {displayName}
              </Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>UID</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {user?.uid ?? "-"}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {user?.email ?? "-"}
            </Text>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={handleLogout}>
            <LinearGradient
              colors={["#EF4444", "#F97316"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoutBtn}
            >
              <LogOut color="#0B1220" size={18} />
              <Text style={styles.logoutText}>Terminar sessão</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.hint}>
            Isto é o botão que impede a tua app de parecer uma demo de feira.
          </Text>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020617" },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 18 },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#111827",
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.12)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "800", color: "#F9FAFB" },
  subtitle: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  infoBox: {
    backgroundColor: "rgba(15,23,42,0.92)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  infoLabel: { fontSize: 11, color: "#9CA3AF", marginBottom: 4 },
  infoValue: { fontSize: 13, color: "#E5E7EB", fontWeight: "600" },
  logoutBtn: {
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  logoutText: { color: "#0B1220", fontWeight: "900", fontSize: 13 },
  hint: { marginTop: 10, fontSize: 11, color: "#94A3B8" },
});

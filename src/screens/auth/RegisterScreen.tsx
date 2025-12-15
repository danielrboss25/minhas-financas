import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, UserPlus } from "lucide-react-native";

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onRegister() {
    const e = email.trim();
    if (!e || !password) return Alert.alert("Falha", "Preenche e-mail e password.");
    if (password.length < 6) return Alert.alert("Falha", "Password com pelo menos 6 caracteres.");
    try {
      setBusy(true);
      await register(name, e, password);
    } catch (err: any) {
      Alert.alert("Falha no registo", err?.message ?? "Erro desconhecido.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#0B1120", "#020617"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.9} style={styles.backBtn}>
          <ArrowLeft color="#F9FAFB" size={22} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Uma conta por pessoa. Como deve ser.</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.label}>Nome (opcional)</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="ex.: Daniel"
          placeholderTextColor="#6B7280"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>E-mail</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="ex.: daniel@email.com"
          placeholderTextColor="#6B7280"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="mín. 6 caracteres"
          placeholderTextColor="#6B7280"
          style={styles.input}
        />

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.btn, styles.btnPrimary]}
          onPress={onRegister}
          disabled={busy}
        >
          <UserPlus color="#E2E8F0" size={18} />
          <Text style={styles.btnPrimaryText}>{busy ? "A criar..." : "Criar conta"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020617" },
  header: {
    paddingTop: 60,
    paddingBottom: 22,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, width: 120 },
  backText: { color: "#CBD5E1", fontWeight: "700" },

  title: { color: "#F9FAFB", fontSize: 24, fontWeight: "900", marginTop: 10 },
  subtitle: { color: "#94A3B8", marginTop: 8, fontSize: 12, lineHeight: 18, fontWeight: "600" },

  card: {
    margin: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(15,23,42,0.96)",
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.55)",
  },
  label: { color: "#CBD5E1", fontSize: 12, fontWeight: "700" },
  input: {
    marginTop: 8,
    backgroundColor: "#0B1220",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1F2937",
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#F9FAFB",
    fontSize: 14,
    fontWeight: "600",
  },

  btn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnPrimary: {
    backgroundColor: "rgba(34,197,94,0.14)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.55)",
  },
  btnPrimaryText: { color: "#E2E8F0", fontWeight: "800" },
});

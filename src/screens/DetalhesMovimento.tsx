import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { useMovimentos, Movimento } from "../context/MovimentosContext";

function DetalhesMovimentoScreen({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const { id } = route.params;
  const { movimentos, updateMovimento } = useMovimentos();

  const movimento = movimentos.find((m) => m.id === id) as Movimento | undefined;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (movimento) {
      setTitle(movimento.title);
      setCategory(movimento.category);
      setDate(movimento.date);
      setAmount(movimento.amount);
    }
  }, [movimento]);

  function handleSave() {
    if (!movimento) return;

    updateMovimento(movimento.id, {
      title,
      category,
      date,
      amount,
    });
    navigation.goBack();
  }

  if (!movimento) {
    return (
      <View style={styles.root}>
        <Text style={{ color: "#F9FAFB", margin: 16 }}>
          Movimento não encontrado.
        </Text>
      </View>
    );
  }

  const isIncome = movimento.type === "income";

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#111827", "#020617"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft color="#E5E7EB" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do movimento</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.label}>Tipo</Text>
          <Text
            style={[
              styles.value,
              { color: isIncome ? "#22C55E" : "#EF4444" },
            ]}
          >
            {isIncome ? "Entrada" : "Despesa"}
          </Text>

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Descrição"
            placeholderTextColor="#6B7280"
          />

          <Text style={styles.label}>Categoria</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Categoria"
            placeholderTextColor="#6B7280"
          />

          <Text style={styles.label}>Data</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="Data"
            placeholderTextColor="#6B7280"
          />

          <Text style={styles.label}>Valor</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0,00"
            placeholderTextColor="#6B7280"
          />

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSave}
            style={{ marginTop: 18 }}
          >
            <LinearGradient
              colors={["#4F46E5", "#7C3AED", "#0EA5E9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Guardar alterações</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
  },
  header: {
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.15)",
  },
  label: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 10,
  },
  value: {
    fontSize: 15,
    color: "#E5E7EB",
    fontWeight: "600",
    marginTop: 2,
  },
  input: {
    marginTop: 2,
    backgroundColor: "#020617",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(31,41,55,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#F9FAFB",
    fontSize: 15,
  },
  saveButton: {
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F9FAFB",
  },
});

export default DetalhesMovimentoScreen;

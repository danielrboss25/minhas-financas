import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { useMovimentos } from "../context/MovimentosContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

type DetalhesMovimentoScreenProps = {
  route: { params: { id: string } };
  navigation: any;
};

function DetalhesMovimentoScreen({ route, navigation }: DetalhesMovimentoScreenProps) {
  const { id } = route.params;
  const { movimentos, updateMovimento } = useMovimentos();

  const movimento = movimentos.find((m) => m.id === id);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (d: Date) => format(d, "dd/MM/yyyy", { locale: pt });

  const parseDate = (s: string) => {
    const [day = "01", month = "01", year = String(new Date().getFullYear())] =
      s.split("/");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const dateValue = useMemo(() => {
    if (!date) return new Date();
    return parseDate(date);
  }, [date]);

  useEffect(() => {
    if (movimento) {
      setDescription(movimento.description ?? "");
      setCategory(movimento.category ?? "");
      setDate(movimento.date ? movimento.date : formatDate(new Date()));
      setAmount(String(movimento.amount ?? ""));
    }
  }, [movimento]);

  async function handleSave() {
    if (!movimento) return;

    const parsedAmount = Number(String(amount).replace(",", "."));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      // validação mínima (se quiseres Alert aqui, adiciona-o)
      return;
    }

    try {
      await updateMovimento(movimento.id, {
        description: description.trim() || "Sem descrição",
        category: category.trim() || "Sem categoria",
        date: date || formatDate(new Date()),
        amount: parsedAmount,
      });

      navigation.goBack();
    } catch (err) {
      console.error("Erro ao guardar movimento", err);
    }
  }

  function onChangeDate(_: any, selected?: Date) {
    if (Platform.OS !== "ios") setShowDatePicker(false);
    if (selected) setDate(formatDate(selected));
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
        colors={["#0B1120", "#020617"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.85}
        >
          <ArrowLeft color="#E5E7EB" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do movimento</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.label}>Tipo</Text>
          <Text style={[styles.value, { color: isIncome ? "#22C55E" : "#F97373" }]}>
            {isIncome ? "Entrada" : "Despesa"}
          </Text>

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Descrição"
            placeholderTextColor="#6B7280"
          />

          <Text style={styles.label}>Categoria</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Ex.: Supermercado, Renda, Ginásio..."
            placeholderTextColor="#6B7280"
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Data</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.dateTag}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTagText}>{date}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dateValue}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                onChange={onChangeDate}
              />
            )}
          </View>

          <Text style={styles.label}>Valor</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0,00"
            placeholderTextColor="#6B7280"
          />

          <TouchableOpacity activeOpacity={0.9} onPress={handleSave} style={{ marginTop: 20 }}>
            <LinearGradient
              colors={["#22C55E", "#3B82F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Guardar movimentação</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020617" },
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
    backgroundColor: "rgba(15,23,42,0.9)",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#F9FAFB" },
  card: {
    backgroundColor: "#020617",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.9)",
  },
  label: { fontSize: 12, color: "#9CA3AF", marginTop: 10 },
  value: { fontSize: 15, color: "#E5E7EB", fontWeight: "600", marginTop: 2 },
  input: {
    marginTop: 4,
    backgroundColor: "#020617",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1F2937",
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: "#F9FAFB",
    fontSize: 15,
  },
  saveButton: {
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#22C55E",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  saveButtonText: { fontSize: 15, fontWeight: "700", color: "#F9FAFB" },
  dateTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.06)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  dateTagText: { color: "#E5E7EB", fontWeight: "600", fontSize: 13 },
});

export default DetalhesMovimentoScreen;

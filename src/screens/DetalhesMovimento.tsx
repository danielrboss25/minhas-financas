import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { useMovimentos } from "../context/MovimentosContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

// O tipo Movimento vem implicitamente da estrutura do contexto,
// por isso não é estritamente necessário redefinir aqui.
// Se quiseres mesmo o tipo, importa-o do contexto em vez de duplicar.

type DetalhesMovimentoScreenProps = {
  route: { params: { id: string } };
  navigation: any;
};

function DetalhesMovimentoScreen({ route, navigation }: DetalhesMovimentoScreenProps) {
  const { id } = route.params;
  const { movimentos, updateMovimento } = useMovimentos();

  const movimento = movimentos.find((m) => m.id === id);

  const [title, setTitle] = useState("");
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

  // categorias únicas derivadas dos movimentos
  const categories = useMemo(() => {
    const setCat = new Set<string>();
    movimentos.forEach((m) => m.category && setCat.add(m.category));
    return Array.from(setCat).filter(Boolean);
  }, [movimentos]);

  // input para nova categoria
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    if (movimento) {
      setTitle(movimento.title ?? "");
      setCategory(movimento.category ?? "");
      // se não tiver data, usa hoje; normaliza para dd/MM/yyyy
      if (movimento.date) {
        // assumindo que já guardas dd/MM/yyyy
        setDate(movimento.date);
      } else {
        setDate(formatDate(new Date()));
      }
      setAmount(String(movimento.amount));
    }
  }, [movimento]);

  async function handleSave() {
    if (!movimento) return;

    const parsedAmount = Number(String(amount).replace(",", "."));
    const finalAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;

    try {
      await updateMovimento(movimento.id, {
        title: title.trim() || "Sem descrição",
        description: title.trim() || "",
        category: category.trim() || "Sem categoria",
        date: date || formatDate(new Date()),
        amount: finalAmount,
      });

      navigation.goBack();
    } catch (err) {
      console.error("Erro ao guardar movimento", err);
    }
  }

  function handleSelectCategory(cat: string) {
    setCategory(cat);
  }

  function handleAddCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    setCategory(trimmed);
    setNewCategory("");
  }

  function onChangeDate(_: any, selected?: Date) {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }
    if (selected) {
      setDate(formatDate(selected));
    }
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
            style={[styles.value, { color: isIncome ? "#22C55E" : "#EF4444" }]}
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

          {/* chips com categorias existentes */}
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i) => i}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item }) => {
              const selected = item === category;
              return (
                <TouchableOpacity
                  onPress={() => handleSelectCategory(item)}
                  style={[styles.chip, selected && styles.chipActive]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.chipText, selected && styles.chipTextActive]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          {/* adicionar nova categoria */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 8,
              alignItems: "center",
            }}
          >
            <TextInput
              placeholder="Adicionar categoria"
              placeholderTextColor="#6B7280"
              value={newCategory}
              onChangeText={setNewCategory}
              style={[styles.input, { flex: 1 }]}
            />
            <TouchableOpacity
              onPress={handleAddCategory}
              style={styles.addCatBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.addCatBtnText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {/* Data exibida como tag + picker */}
          <Text style={[styles.label, { marginTop: 12 }]}>Data</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
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

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSave}
            style={{ marginTop: 18 }}
          >
            <LinearGradient
              colors={["#10B981", "#3B82F6"]}
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
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.06)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.08)",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "rgba(34,197,94,0.12)",
    borderColor: "rgba(34,197,94,0.24)",
  },
  chipText: { color: "#94A3B8", fontWeight: "600" },
  chipTextActive: { color: "#E6FFFA" },
  addCatBtn: {
    backgroundColor: "rgba(14,165,233,0.08)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.12)",
  },
  addCatBtnText: { color: "#7DD3FC", fontWeight: "700" },
  dateTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.06)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.08)",
  },
  dateTagText: { color: "#94A3B8", fontWeight: "600" },
});

export default DetalhesMovimentoScreen;

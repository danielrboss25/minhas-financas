// src/screens/NovaMovimentacaoScreen.tsx

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  // *** REMOVIDO: Alert ***
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Save, X } from "lucide-react-native";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
// Adicionando Alert de volta, mas usando apenas no erro para não quebrar a importação
import { Alert } from "react-native";
import { useMovimentos } from "../context/MovimentosContext";

export default function NovaMovimentacaoScreen({ navigation }: any) {
  const { addMovimento, movimentos } = useMovimentos();

  const [type, setType] = useState<"income" | "expense">("income");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<string>(
    format(new Date(), "dd/MM/yyyy", { locale: pt })
  );
  const [amount, setAmount] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // categorias únicas derivadas dos movimentos já existentes
  const categories = useMemo(() => {
    const setCat = new Set<string>();
    movimentos.forEach((m) => {
      if (m.category && m.category.trim()) {
        setCat.add(m.category.trim());
      }
    });
    return Array.from(setCat).sort();
  }, [movimentos]);

  const parseDate = (s: string) => {
    const [day = "01", month = "01", year = String(new Date().getFullYear())] =
      s.split("/");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const dateValue = useMemo(() => {
    if (!date) return new Date();
    return parseDate(date);
  }, [date]);

  const formatDate = (d: Date): string =>
    format(d, "dd/MM/yyyy", { locale: pt });

  const onChangeDate = (_: any, selectedDate?: Date) => {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }
    const currentDate = selectedDate || new Date();
    setDate(formatDate(currentDate));
  };

  function handleSelectCategory(cat: string) {
    setCategory(cat);
  }

  function handleAddCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    setCategory(trimmed);
    setNewCategory("");
  }

  const handleSave = async () => {
    if (!description || !amount || !category) {
      // Usar Alert SÓ para avisos de preenchimento (necessário)
      Alert.alert("Erro", "Preencha a Descrição, Montante e Categoria.");
      return;
    }

    const parsedAmount = Number(String(amount).replace(",", "."));
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Erro", "Montante inválido.");
      return;
    }

    const movimento = {
      type,
      description: description.trim(),
      category: category.trim() || "Sem categoria",
      date,
      amount: parsedAmount,
    };

    try {
      await addMovimento(movimento);
      // *** REMOVIDO: Alert.alert("Sucesso", "Nova movimentação adicionada!"); ***
      // Apenas navega de volta para dar feedback de sucesso imediato e discreto
      navigation.goBack();
    } catch (err) {
      console.error("Erro ao guardar movimentação", err);
      // Mantém Alert SOMENTE em caso de erro real na base de dados
      Alert.alert("Erro", "Não foi possível completar a operação.");
    }
  };

  const handleCancel = () => {
    // Apenas voltar atrás
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#0B1120", "#020617"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <ArrowLeft color="#F9FAFB" size={26} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Nova movimentação</Text>
          </View>

          <Text style={styles.headerSubtitle}>
            Regista entradas e despesas com a seriedade de um adulto funcional.
          </Text>

          {/* Type Switch */}
          <View style={styles.typeSwitch}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.typeChip,
                type === "income" && styles.typeChipActiveIncome,
              ]}
              onPress={() => setType("income")}
            >
              <Text
                style={[
                  styles.typeChipText,
                  type === "income" && styles.typeChipTextActive,
                ]}
              >
                Entrada
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.typeChip,
                type === "expense" && styles.typeChipActiveExpense,
              ]}
              onPress={() => setType("expense")}
            >
              <Text
                style={[
                  styles.typeChipText,
                  type === "expense" && styles.typeChipTextActive,
                ]}
              >
                Despesa
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.form}>
          {/* Campo Descrição */}
          <View style={styles.field}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: Freelance, Supermercado..."
              placeholderTextColor="#6B7280"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Campo Categoria */}
          <View style={styles.field}>
            <Text style={styles.label}>Categoria / Tag</Text>

            {/* chips com categorias existentes */}
            {categories.length > 0 && (
              <View style={styles.chipsRow}>
                {categories.map((cat) => {
                  const selected = cat === category;
                  return (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.85}
                      onPress={() => handleSelectCategory(cat)}
                      style={[styles.chip, selected && styles.chipActive]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* criar nova tag/categoria */}
            <View style={styles.newTagRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Criar nova tag (ex.: Ginásio, Poupança...)"
                placeholderTextColor="#6B7280"
                value={newCategory}
                onChangeText={setNewCategory}
              />
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleAddCategory}
                style={styles.addTagButton}
              >
                <Text style={styles.addTagButtonText}>Criar</Text>
              </TouchableOpacity>
            </View>

            {/* valor efetivamente usado na movimentação */}
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              placeholder="Tag selecionada"
              placeholderTextColor="#6B7280"
              value={category}
              onChangeText={setCategory}
            />
          </View>

          {/* Campo Data */}
          <View style={styles.field}>
            <Text style={styles.label}>Data</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.dateBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateBtnText}>{date}</Text>
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

          {/* Campo Montante */}
          <View style={styles.field}>
            <Text style={styles.label}>Montante</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00 €"
              keyboardType="numeric"
              placeholderTextColor="#6B7280"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* BOTOÕES GUARDAR E CANCELAR */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleSave}
              style={styles.saveButton}
            >
              <Save color="#ECFDF5" size={20} />
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              <X color="#FCA5A5" size={20} />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 26,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F9FAFB",
  },
  headerSubtitle: {
    marginTop: 10,
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 20,
  },
  // --- Type Switch (Chips Entrada/Despesa) ---
  typeSwitch: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.95)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(31,41,55,0.9)",
  },
  typeChipActiveIncome: {
    backgroundColor: "rgba(34,197,94,0.20)",
    borderColor: "#22C55E",
  },
  typeChipActiveExpense: {
    backgroundColor: "rgba(248,113,113,0.16)",
    borderColor: "#F97373",
  },
  typeChipText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
  },
  typeChipTextActive: {
    color: "#F9FAFB",
  },
  // --- Form ---
  form: {
    paddingHorizontal: 22,
    gap: 18,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: "#CBD5E1",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#020617",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  dateBtn: {
    backgroundColor: "#020617",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  dateBtnText: {
    color: "#F9FAFB",
    fontSize: 15,
    fontWeight: "500",
  },
  // --- Chips de Categoria ---
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.9)",
  },
  chipActive: {
    backgroundColor: "rgba(56,189,248,0.18)",
    borderColor: "rgba(56,189,248,1)",
  },
  chipText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#E0F2FE",
  },
  newTagRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    alignItems: "center",
  },
  addTagButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(56,189,248,0.12)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.7)",
  },
  addTagButtonText: {
    color: "#E0F2FE",
    fontWeight: "700",
    fontSize: 12,
  },
  // --- Botoões Finais (Estilo Adaptado) ---
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(34,197,94,0.20)",
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ECFDF5",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(248,113,113,0.16)",
    borderWidth: 1,
    borderColor: "#F97373",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FCA5A5",
  },
});

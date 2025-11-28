import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { format } from "date-fns";
import * as pt from "date-fns/locale/pt";
import { useMovimentos } from "../context/MovimentosContext"; // Importando o contexto

export default function NovaMovimentacaoScreen({ navigation }: any) {
  const { addMovimento } = useMovimentos(); // Usando a função para adicionar movimentos
  const [type, setType] = useState<"income" | "expense">("income");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<string>(format(new Date(), "dd/MM/yyyy"));
  const [amount, setAmount] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Formatar data para "dd/MM/yyyy"
  const formatDate = (d: Date): string => {
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  // Atualizar a data
  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setDate(formatDate(currentDate));
    setShowDatePicker(Platform.OS === "ios");
  };

  // Função para salvar a movimentação
  const handleSave = async () => {
    if (!description || !amount || !category) {
      alert("Preencha todos os campos");
      return;
    }

    // aceita vírgula como separador decimal
    const parsedAmount = Number(String(amount).replace(",", "."));
    if (Number.isNaN(parsedAmount)) {
      alert("Montante inválido");
      return;
    }

    const movimento = {
      type,
      description: description.trim(),
      category: category.trim() || "Sem categoria",
      date,
      amount: parsedAmount,
    };

    await addMovimento(movimento); // Adicionando o movimento ao contexto/BD
    navigation.goBack(); // Navegar de volta após salvar
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#1F2937", "#111827"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color="#fff" size={28} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Nova movimentação</Text>
        </View>

        <Text style={styles.headerSubtitle}>
          Regista entradas e despesas para manter o controlo do mês.
        </Text>

        <View style={styles.typeSwitch}>
          <TouchableOpacity
            activeOpacity={0.85}
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
            activeOpacity={0.85}
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

        <View style={styles.field}>
          <Text style={styles.label}>Categoria</Text>
          <TextInput
            style={styles.input}
            placeholder="Supermercado, Renda, Salário..."
            placeholderTextColor="#6B7280"
            value={category}
            onChangeText={setCategory}
          />
        </View>

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
              value={new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "calendar"}
              onChange={onChangeDate}
            />
          )}
        </View>

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

        <TouchableOpacity activeOpacity={0.9} onPress={handleSave}>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0B0F14",
  },

  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },

  headerSubtitle: {
    marginTop: 12,
    fontSize: 15,
    color: "#CBD5E1",
    lineHeight: 22,
  },

  typeSwitch: {
    flexDirection: "row",
    gap: 12,
    marginTop: 25,
  },

  typeChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },

  typeChipActiveIncome: {
    backgroundColor: "rgba(16,185,129,0.20)",
    borderColor: "#10B981",
  },

  typeChipActiveExpense: {
    backgroundColor: "rgba(239,68,68,0.20)",
    borderColor: "#EF4444",
  },

  typeChipText: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "600",
  },

  typeChipTextActive: {
    color: "#fff",
  },

  form: {
    padding: 22,
    gap: 22,
  },

  field: {
    gap: 6,
  },

  label: {
    fontSize: 14,
    color: "#CBD5E1",
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#1F2937",
  },

  dateBtn: {
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  dateBtnText: { color: "#fff", fontSize: 16 },

  saveButton: {
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
});

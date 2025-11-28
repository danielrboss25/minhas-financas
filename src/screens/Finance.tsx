// src/screens/Finance.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  SafeAreaView as RNSafeAreaView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useMovimentos } from "../context/MovimentosContext";

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

type MovementType = "income" | "expense";

type Movement = {
  id: string;
  type: MovementType;
  description: string;
  category: string;
  date: string; // formato "DD/MM"
  amount: number;
};

type FinanceScreenProps = {
  navigation: any;
};

const initialMovements: Movement[] = [
  {
    id: "1",
    type: "income",
    description: "Salário",
    category: "Rendimento",
    date: "01/11",
    amount: 1200,
  },
  {
    id: "2",
    type: "expense",
    description: "Supermercado",
    category: "Supermercado",
    date: "03/11",
    amount: 120,
  },
  {
    id: "3",
    type: "expense",
    description: "Transportes",
    category: "Transportes",
    date: "04/11",
    amount: 45,
  },
  {
    id: "4",
    type: "expense",
    description: "Restaurantes",
    category: "Restaurantes",
    date: "05/11",
    amount: 80,
  },
  {
    id: "5",
    type: "income",
    description: "Freelance",
    category: "Trabalho extra",
    date: "10/11",
    amount: 150,
  },
];

export default function FinanceScreen({ navigation }: FinanceScreenProps) {
  const [budget] = useState(1000);
  const { movimentos, deleteMovimento } = useMovimentos();

  // substitui estado local por movimentos do contexto
  const movements = movimentos.map((m) => ({
    id: m.id,
    type: m.type,
    description: m.description,
    category: m.category,
    date: m.date, // já em "DD/MM[/YYYY]"
    amount: m.amount,
  }));

  // mês/ano visível
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [pickerVisible, setPickerVisible] = useState(false);
  const [tempMonthIndex, setTempMonthIndex] = useState<number>(
    currentMonth.getMonth()
  );
  const [tempYear, setTempYear] = useState<number>(currentMonth.getFullYear());

  function prevMonth() {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  function openPicker() {
    setTempMonthIndex(currentMonth.getMonth());
    setTempYear(currentMonth.getFullYear());
    setPickerVisible(true);
  }
  function confirmPicker() {
    setCurrentMonth(new Date(tempYear, tempMonthIndex, 1));
    setPickerVisible(false);
  }
  function cancelPicker() {
    setPickerVisible(false);
  }

  // filtrar por mês/ano (lê "DD/MM" ou "DD/MM/YYYY")
  const filteredMovements = useMemo(() => {
    const month = currentMonth.getMonth() + 1; // 1-12
    const year = currentMonth.getFullYear();
    return movements.filter((m) => {
      const parts = m.date.split("/").map((p) => p.trim());
      const mMonth = parts.length >= 2 ? parseInt(parts[1], 10) : NaN;
      const mYear = parts.length >= 3 ? parseInt(parts[2], 10) : year; // se não houver ano, assume o ano selecionado
      return mMonth === month && mYear === year;
    });
  }, [movements, currentMonth]);

  const totals = useMemo(() => {
    const income = filteredMovements
      .filter((m) => m.type === "income")
      .reduce((s, m) => s + m.amount, 0);
    const expenses = filteredMovements
      .filter((m) => m.type === "expense")
      .reduce((s, m) => s + m.amount, 0);
    const balance = income - expenses;
    const usedPct = budget > 0 ? Math.min(expenses / budget, 1) : 0;
    return { income, expenses, balance, usedPct };
  }, [filteredMovements, budget]);

  function handleDelete(id: string) {
    deleteMovimento(id);
  }

  function renderRightActions(id: string) {
    return (
      <View style={styles.deleteContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.deleteButton}
          onPress={() => handleDelete(id)}
        >
          <Trash2 color="#FFF" size={22} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com título (restaurado) */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Finanças</Text>
            <Text style={styles.subtitle}>Orçamento & despesas</Text>
          </View>
        </View>

        {/* Card de orçamento */}
        <LinearGradient
          colors={["#1F2937", "#020617"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.budgetCard}
        >
          <Text style={styles.budgetLabel}>Orçamento deste mês</Text>
          <Text style={styles.budgetAmount}>
            {budget.toLocaleString("pt-PT", {
              style: "currency",
              currency: "EUR",
            })}
          </Text>

          <View style={styles.budgetTotalsRow}>
            <View style={styles.budgetTotalsItem}>
              <Text style={styles.budgetTotalsLabel}>Entradas</Text>
              <Text style={[styles.budgetTotalsValue, { color: "#22C55E" }]}>
                {totals.income.toLocaleString("pt-PT", {
                  style: "currency",
                  currency: "EUR",
                })}
              </Text>
            </View>

            <View style={styles.budgetTotalsItem}>
              <Text style={styles.budgetTotalsLabel}>Despesas</Text>
              <Text style={[styles.budgetTotalsValue, { color: "#F97373" }]}>
                -
                {totals.expenses.toLocaleString("pt-PT", {
                  style: "currency",
                  currency: "EUR",
                })}
              </Text>
            </View>

            <View style={styles.budgetTotalsItem}>
              <Text style={styles.budgetTotalsLabel}>Saldo</Text>
              <Text style={[styles.budgetTotalsValue, { color: "#38BDF8" }]}>
                {totals.balance.toLocaleString("pt-PT", {
                  style: "currency",
                  currency: "EUR",
                })}
              </Text>
            </View>
          </View>

          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              Usado: {Math.round(totals.usedPct * 100)}%
            </Text>
            <Text style={styles.progressTextSecondary}>
              Disponível:{" "}
              {(budget - totals.expenses).toLocaleString("pt-PT", {
                style: "currency",
                currency: "EUR",
              })}
            </Text>
          </View>

          <View style={styles.progressBar}>
            <LinearGradient
              colors={["#10B981", "#3B82F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressFill,
                { width: `${totals.usedPct * 100}%` },
              ]}
            />
          </View>
        </LinearGradient>

        {/* filtro mês/ano — colocado abaixo do card "Orçamento deste mês" */}
        <View style={styles.monthFilterContainer}>
          <TouchableOpacity style={styles.monthNavButton} onPress={prevMonth}>
            <ChevronLeft color="#CBD5E1" size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.monthPill}
            onPress={openPicker}
            activeOpacity={0.9}
          >
            <Text style={styles.monthText}>
              {new Intl.DateTimeFormat("pt-PT", {
                month: "long",
                year: "numeric",
              }).format(currentMonth)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.monthNavButton} onPress={nextMonth}>
            <ChevronRight color="#CBD5E1" size={18} />
          </TouchableOpacity>
        </View>

        {/* Movimentos recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Movimentos recentes</Text>
            <Text style={styles.sectionSubtitle}>Entradas e despesas</Text>
          </View>

          <View style={styles.card}>
            {filteredMovements.map((m) => (
              <Swipeable
                key={m.id}
                overshootRight={false}
                renderRightActions={() => renderRightActions(m.id)}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.movementRow}
                  onPress={() =>
                    navigation.navigate("MovimentoDetalhe", { id: m.id })
                  }
                >
                  <View style={styles.movementLeft}>
                    <View
                      style={[
                        styles.movementDot,
                        m.type === "income"
                          ? { backgroundColor: "#22C55E" }
                          : { backgroundColor: "#F97373" },
                      ]}
                    />
                    <View>
                      <Text style={styles.movementDescription}>
                        {m.description}
                      </Text>

                      <View style={styles.metaRow}>
                        <View style={styles.tagPill}>
                          <Text style={styles.tagText}>{m.category}</Text>
                        </View>
                        <View style={styles.tagPill}>
                          <Text style={styles.tagText}>{m.date}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.movementRight}>
                    <Text
                      style={[
                        styles.movementAmount,
                        m.type === "income"
                          ? { color: "#22C55E" }
                          : { color: "#F97373" },
                      ]}
                    >
                      {m.type === "income" ? "+" : "-"}
                      {m.amount.toLocaleString("pt-PT", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </Text>
                    {m.type === "income" ? (
                      <ArrowUpCircle color="#22C55E" size={18} />
                    ) : (
                      <ArrowDownCircle color="#F97373" size={18} />
                    )}
                  </View>
                </TouchableOpacity>
              </Swipeable>
            ))}
            {filteredMovements.length === 0 && (
              <Text style={styles.emptyText}>Sem movimentos neste mês.</Text>
            )}
          </View>
        </View>

        {/* Por categoria (exemplo estático) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Por categoria</Text>
            <Text style={styles.sectionSubtitle}>Baseado nas despesas</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>Supermercado</Text>
              <Text style={styles.categoryAmount}>120,00 €</Text>
            </View>
            <View style={styles.categoryBarTrack}>
              <View style={[styles.categoryBarFill, { width: "80%" }]} />
            </View>

            <View style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>Restaurantes</Text>
              <Text style={styles.categoryAmount}>80,00 €</Text>
            </View>
            <View style={styles.categoryBarTrack}>
              <View style={[styles.categoryBarFill, { width: "55%" }]} />
            </View>

            <View style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>Transportes</Text>
              <Text style={styles.categoryAmount}>45,00 €</Text>
            </View>
            <View style={styles.categoryBarTrack}>
              <View style={[styles.categoryBarFill, { width: "35%" }]} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FAB flutuante no canto (restaurado) */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("NovaMovimentacao")}
        >
          <LinearGradient
            colors={["#166534", "#22C55E", "#38BDF8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Plus color="#F9FAFB" size={28} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Modal simples para escolher mês/ano (mobile-friendly) */}
      <Modal visible={pickerVisible} animationType="slide" transparent>
        <RNSafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecionar mês e ano</Text>

            <View style={styles.modalMonthsRow}>
              {MONTHS.map((m, i) => {
                const selected = i === tempMonthIndex;
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setTempMonthIndex(i)}
                    style={[
                      styles.modalMonthButton,
                      selected && styles.modalMonthButtonActive,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.modalMonthText,
                        selected && styles.modalMonthTextActive,
                      ]}
                    >
                      {m.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalYearRow}>
              <TouchableOpacity
                style={styles.yearNav}
                onPress={() => setTempYear((y) => y - 1)}
              >
                <ChevronLeft color="#94A3B8" size={20} />
              </TouchableOpacity>
              <Text style={styles.modalYearText}>{tempYear}</Text>
              <TouchableOpacity
                style={styles.yearNav}
                onPress={() => setTempYear((y) => y + 1)}
              >
                <ChevronRight color="#94A3B8" size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.modalBtnCancel} onPress={cancelPicker}>
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.modalBtnConfirm} onPress={confirmPicker}>
                <Text style={styles.modalBtnConfirmText}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </RNSafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020617" },
  scrollContent: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 90 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  monthFilterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  title: { fontSize: 26, fontWeight: "800", color: "#F9FAFB" },
  subtitle: { fontSize: 14, color: "#9CA3AF", marginTop: 2 },

  monthPickerRow: { flexDirection: "row", alignItems: "center", gap: 8 }, // mantido como compatibilidade
  monthPickerCenterRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  monthNavButton: { padding: 6, borderRadius: 8 },
  monthPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.06)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
    minWidth: 160,
    alignItems: "center",
  },
  monthText: {
    color: "#E5E7EB",
    fontWeight: "700",
    textTransform: "capitalize",
  },

  budgetCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#111827",
    marginBottom: 10,
  },
  budgetLabel: { fontSize: 14, color: "#CBD5E1", marginBottom: 4 },
  budgetAmount: {
    fontSize: 30,
    fontWeight: "800",
    color: "#F9FAFB",
    marginBottom: 14,
  },
  budgetTotalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  budgetTotalsItem: { flex: 1 },
  budgetTotalsLabel: { fontSize: 12, color: "#9CA3AF" },
  budgetTotalsValue: { fontSize: 15, fontWeight: "700", marginTop: 2 },

  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: { fontSize: 12, color: "#E5E7EB" },
  progressTextSecondary: { fontSize: 12, color: "#9CA3AF" },
  progressBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#020617",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#0F172A",
  },
  progressFill: { height: "100%", borderRadius: 999 },

  section: { marginBottom: 22 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#F9FAFB" },
  sectionSubtitle: { fontSize: 12, color: "#9CA3AF" },

  card: {
    backgroundColor: "#020617",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  movementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15,23,42,0.7)",
  },
  movementLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  movementDot: { width: 10, height: 10, borderRadius: 999 },
  movementDescription: { fontSize: 15, fontWeight: "600", color: "#E5E7EB" },
  movementRight: { alignItems: "flex-end", gap: 4 },
  movementAmount: { fontSize: 15, fontWeight: "700" },

  deleteContainer: { justifyContent: "center", alignItems: "flex-end" },
  deleteButton: {
    width: 64,
    marginVertical: 6,
    marginRight: 4,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    height: 44,
  },

  emptyText: { color: "#9CA3AF", textAlign: "center", paddingVertical: 12 },

  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  categoryLabel: { fontSize: 14, color: "#E5E7EB" },
  categoryAmount: { fontSize: 14, color: "#9CA3AF" },
  categoryBarTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.06)",
    overflow: "hidden",
    marginTop: 6,
  },
  categoryBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 999,
  },

  /* FAB flutuante (restaurado) */
  fabWrapper: { position: "absolute", right: 20, bottom: 20, zIndex: 40 },
  fab: {
    elevation: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    shadowOpacity: 0.18,
    shadowColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    height: 64,
    width: 64,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  /* Modal styles */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(1,2,6,0.45)",
  },
  modalCard: {
    backgroundColor: "#0B1220",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderColor: "#111827",
    borderWidth: 1,
  },
  modalTitle: {
    color: "#E5E7EB",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  modalMonthsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  modalMonthButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    margin: 4,
    backgroundColor: "transparent",
  },
  modalMonthButtonActive: { backgroundColor: "rgba(34,197,94,0.12)" },
  modalMonthText: {
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  modalMonthTextActive: { color: "#E6FFFA" },

  modalYearRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 12,
  },
  yearNav: { padding: 8 },
  modalYearText: { color: "#E5E7EB", fontWeight: "700", fontSize: 16 },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  modalBtnCancel: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  modalBtnCancelText: { textAlign: "center", color: "#94A3B8" },
  modalBtnConfirm: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    backgroundColor: "#10B981",
  },
  modalBtnConfirmText: {
    textAlign: "center",
    color: "#022C22",
    fontWeight: "700",
  },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.06)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.08)",
  },
  tagText: { color: "#94A3B8", fontSize: 12, fontWeight: "600" },
});

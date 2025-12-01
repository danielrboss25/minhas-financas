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
  TextInput,
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
  Wallet,
  Filter,
  PieChart,
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

type FinanceScreenProps = {
  navigation: any;
};

export default function FinanceScreen({ navigation }: FinanceScreenProps) {
  const { movimentos, deleteMovimento } = useMovimentos();

  const [budget, setBudget] = useState<number>(1000);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [budgetInput, setBudgetInput] = useState<string>(budget.toString());

  const movements = movimentos.map((m) => ({
    id: m.id,
    type: m.type,
    description: m.description,
    category: m.category,
    date: m.date,
    amount: m.amount,
  }));

  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [pickerVisible, setPickerVisible] = useState(false);
  const [tempMonthIndex, setTempMonthIndex] = useState<number>(
    currentMonth.getMonth()
  );
  const [tempYear, setTempYear] = useState<number>(currentMonth.getFullYear());

  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");

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

  // movimentos do mês selecionado
  const filteredMovements = useMemo(() => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();

    return movements.filter((m) => {
      if (!m.date) return false;
      const parts = m.date.split("/").map((p) => p.trim());
      const mMonth = parts.length >= 2 ? parseInt(parts[1], 10) : NaN;
      const mYear = parts.length >= 3 ? parseInt(parts[2], 10) : year;
      if (!Number.isFinite(mMonth) || !Number.isFinite(mYear)) return false;
      return mMonth === month && mYear === year;
    });
  }, [movements, currentMonth]);

  // categorias existentes neste mês
  const categories = useMemo(() => {
    const set = new Set<string>();
    filteredMovements.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return ["Todas", ...Array.from(set)];
  }, [filteredMovements]);

  // aplicar filtro de categoria à lista
  const movementsByCategory = useMemo(() => {
    if (selectedCategory === "Todas") return filteredMovements;
    return filteredMovements.filter((m) => m.category === selectedCategory);
  }, [filteredMovements, selectedCategory]);

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

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    filteredMovements
      .filter((m) => m.type === "expense")
      .forEach((m) => {
        const key = m.category || "Outros";
        map.set(key, (map.get(key) || 0) + m.amount);
      });

    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredMovements]);

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

  function openBudgetModal() {
    setBudgetInput(budget.toString());
    setBudgetModalVisible(true);
  }

  function confirmBudget() {
    const normalized = budgetInput.replace(",", ".").trim();
    const value = Number(normalized);
    if (Number.isFinite(value) && value >= 0) {
      setBudget(value);
    }
    setBudgetModalVisible(false);
  }

  const saldoDisponivel = budget - totals.expenses;

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Finanças</Text>
            <Text style={styles.subtitle}>
              Painel perigoso para saber quanto podes estragar-te.
            </Text>
          </View>

          <TouchableOpacity
            onPress={openBudgetModal}
            activeOpacity={0.9}
            style={styles.budgetTag}
          >
            <Text style={styles.budgetTagLabel}>Orçamento</Text>
            <Text style={styles.budgetTagValue}>
              {budget.toLocaleString("pt-PT", {
                style: "currency",
                currency: "EUR",
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* HERO / EQUILÍBRIO */}
        <LinearGradient
          colors={["#22C55E", "#3B82F6", "#0F172A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBorder}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroRowTop}>
              <View style={styles.heroLeft}>
                <View style={styles.heroIconBadge}>
                  <Wallet color="#BBF7D0" size={22} />
                </View>
                <View>
                  <Text style={styles.heroLabel}>Equilíbrio financeiro</Text>
                  <Text style={styles.heroAmount}>
                    {saldoDisponivel.toLocaleString("pt-PT", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </Text>
                  <Text style={styles.heroHint}>
                    Depois das despesas normais deste mês.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.monthChip}
                onPress={openPicker}
                activeOpacity={0.9}
              >
                <Text style={styles.monthChipLabel}>Período</Text>
                <Text style={styles.monthChipValue}>
                  {new Intl.DateTimeFormat("pt-PT", {
                    month: "long",
                    year: "numeric",
                  }).format(currentMonth)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.heroRowBottom}>
              <View style={styles.heroMiniBox}>
                <Text style={styles.heroMiniLabel}>Entradas</Text>
                <Text style={[styles.heroMiniValue, { color: "#22C55E" }]}>
                  {totals.income.toLocaleString("pt-PT", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </Text>
              </View>
              <View style={styles.heroMiniBox}>
                <Text style={styles.heroMiniLabel}>Despesas</Text>
                <Text style={[styles.heroMiniValue, { color: "#F97316" }]}>
                  -
                  {totals.expenses.toLocaleString("pt-PT", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </Text>
              </View>
              <View style={styles.heroMiniBox}>
                <Text style={styles.heroMiniLabel}>Saldo</Text>
                <Text style={[styles.heroMiniValue, { color: "#38BDF8" }]}>
                  {totals.balance.toLocaleString("pt-PT", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.progressWrapper}>
              <View style={styles.progressHeaderRow}>
                <Text style={styles.progressLabel}>Barra de sobrevivência</Text>
                <Text style={styles.progressLabelSecondary}>
                  Usado: {Math.round(totals.usedPct * 100)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={["#22C55E", "#FACC15", "#F97316", "#EF4444"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressFill,
                    { width: `${totals.usedPct * 100}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* NAVEGAÇÃO DE MÊS COM SETAS */}
        <View style={styles.monthNavRow}>
          <TouchableOpacity style={styles.monthNavButton} onPress={prevMonth}>
            <ChevronLeft color="#CBD5E1" size={18} />
          </TouchableOpacity>
          <Text style={styles.monthNavText}>
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <TouchableOpacity style={styles.monthNavButton} onPress={nextMonth}>
            <ChevronRight color="#CBD5E1" size={18} />
          </TouchableOpacity>
        </View>

        {/* FILTRO POR CATEGORIA */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Filter color="#38BDF8" size={16} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Filtro por categoria</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Vê só o que interessa neste momento.
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChipsRow}
          >
            {categories.map((cat) => {
              const selected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.85}
                  style={[
                    styles.categoryChip,
                    selected && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selected && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* MOVIMENTOS RECENTES */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <PieChart color="#F97316" size={16} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Movimentos</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Desliza para apagar. O resto é contigo.
            </Text>
          </View>

          <View style={styles.cardMovements}>
            {movementsByCategory.map((m) => (
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
                        styles.movementIcon,
                        m.type === "income"
                          ? styles.movementIconIncome
                          : styles.movementIconExpense,
                      ]}
                    >
                      {m.type === "income" ? (
                        <ArrowUpCircle color="#BBF7D0" size={18} />
                      ) : (
                        <ArrowDownCircle color="#FEE2E2" size={18} />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={styles.movementDescription}
                        numberOfLines={1}
                      >
                        {m.description}
                      </Text>

                      <View style={styles.metaRow}>
                        <View style={styles.tagPill}>
                          <Text style={styles.tagText}>
                            {m.category || "Sem categoria"}
                          </Text>
                        </View>
                        <View style={styles.tagPillMuted}>
                          <Text style={styles.tagTextMuted}>{m.date}</Text>
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
                  </View>
                </TouchableOpacity>
              </Swipeable>
            ))}

            {movementsByCategory.length === 0 && (
              <Text style={styles.emptyText}>
                Nada para mostrar aqui. Ou ainda não gastaste, ou estás a mentir
                à app.
              </Text>
            )}
          </View>
        </View>

        {/* MAPA DE CATEGORIAS DINÂMICO */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Mapa de categorias</Text>
            <Text style={styles.sectionSubtitle}>
              Só despesas. Onde o dinheiro se evaporou.
            </Text>
          </View>

          <View style={styles.cardCategories}>
            {categoryTotals.length === 0 && (
              <Text style={styles.emptyText}>
                Ainda não há despesas para analisar.
              </Text>
            )}

            {categoryTotals.map((item, index) => {
              const pct =
                totals.expenses > 0
                  ? Math.min((item.amount / totals.expenses) * 100, 100)
                  : 0;

              let barStyle = styles.categoryFillGreen;
              if (index === 0) barStyle = styles.categoryFillOrange;
              if (index === 1) barStyle = styles.categoryFillBlue;

              return (
                <View key={item.category} style={{ marginBottom: 10 }}>
                  <View style={styles.categoryRowHeader}>
                    <Text style={styles.categoryLabel}>{item.category}</Text>
                    <Text style={styles.categoryAmount}>
                      {item.amount.toLocaleString("pt-PT", {
                        style: "currency",
                        currency: "EUR",
                      })}{" "}
                      · {Math.round(pct)}%
                    </Text>
                  </View>
                  <View style={styles.categoryTrack}>
                    <View
                      style={[
                        barStyle,
                        {
                          width: `${pct}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("NovaMovimentacao")}
        >
          <LinearGradient
            colors={["#22C55E", "#3B82F6", "#38BDF8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Plus color="#F9FAFB" size={28} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* MODAL MÊS/ANO */}
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

      {/* MODAL ORÇAMENTO */}
      <Modal visible={budgetModalVisible} transparent animationType="fade">
        <View style={styles.budgetModalOverlay}>
          <View style={styles.budgetModalCard}>
            <Text style={styles.budgetModalTitle}>
              Definir orçamento deste mês
            </Text>
            <Text style={styles.budgetModalSubtitle}>
              Isto vira a tag verde no topo. Faz de conta que é sagrado.
            </Text>

            <TextInput
              style={styles.budgetInput}
              placeholder="Ex.: 1000"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={budgetInput}
              onChangeText={setBudgetInput}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalBtnCancel}
                onPress={() => setBudgetModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.modalBtnConfirm} onPress={confirmBudget}>
                <Text style={styles.modalBtnConfirmText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
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
  title: { fontSize: 26, fontWeight: "800", color: "#F9FAFB" },
  subtitle: { fontSize: 13, color: "#94A3B8", marginTop: 4, flex: 1 },

  budgetTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(22,163,74,0.18)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.7)",
    alignItems: "flex-end",
    marginLeft: 8,
  },
  budgetTagLabel: { fontSize: 10, color: "#BBF7D0" },
  budgetTagValue: {
    fontSize: 12,
    color: "#DCFCE7",
    fontWeight: "700",
    marginTop: 2,
  },

  heroBorder: {
    borderRadius: 22,
    padding: 1,
    marginBottom: 14,
  },
  heroCard: {
    borderRadius: 21,
    backgroundColor: "#020617",
    padding: 16,
  },
  heroRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  heroLeft: { flexDirection: "row", gap: 10, flex: 1 },
  heroIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,163,74,0.2)",
    borderWidth: 1,
    borderColor: "rgba(22,163,74,0.7)",
  },
  heroLabel: { fontSize: 11, color: "#A7F3D0" },
  heroAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F9FAFB",
    marginTop: 2,
  },
  heroHint: { fontSize: 11, color: "#9CA3AF", marginTop: 4 },

  monthChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.96)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
    alignItems: "flex-start",
    minWidth: 130,
  },
  monthChipLabel: { fontSize: 10, color: "#9CA3AF" },
  monthChipValue: {
    fontSize: 12,
    color: "#E5E7EB",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  heroRowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  heroMiniBox: { flex: 1, paddingRight: 8 },
  heroMiniLabel: { fontSize: 11, color: "#9CA3AF" },
  heroMiniValue: { fontSize: 14, fontWeight: "700", marginTop: 2 },

  progressWrapper: { marginTop: 12 },
  progressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: { fontSize: 12, color: "#E5E7EB" },
  progressLabelSecondary: { fontSize: 12, color: "#9CA3AF" },
  progressBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#0F172A",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 999 },

  monthNavRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  monthNavButton: { padding: 6, borderRadius: 8 },
  monthNavText: {
    color: "#E5E7EB",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  section: { marginTop: 14, marginBottom: 10 },
  sectionHeaderRow: { marginBottom: 6 },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#E5E7EB" },
  sectionSubtitle: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },

  categoryChipsRow: {
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.95)",
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.9)",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "rgba(56,189,248,0.22)",
    borderColor: "rgba(56,189,248,1)",
  },
  categoryChipText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#E0F2FE",
  },

  cardMovements: {
    backgroundColor: "rgba(15,23,42,0.96)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  movementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15,23,42,0.7)",
  },
  movementLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  movementIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  movementIconIncome: {
    backgroundColor: "rgba(34,197,94,0.16)",
  },
  movementIconExpense: {
    backgroundColor: "rgba(248,113,113,0.16)",
  },
  movementDescription: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E5E7EB",
  },
  movementRight: { alignItems: "flex-end" },
  movementAmount: { fontSize: 15, fontWeight: "700" },

  deleteContainer: { justifyContent: "center", alignItems: "flex-end" },
  deleteButton: {
    width: 64,
    marginVertical: 6,
    marginRight: 6,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    height: 44,
  },

  emptyText: {
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 12,
    fontSize: 12,
  },

  cardCategories: {
    backgroundColor: "#020617",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#111827",
    padding: 14,
  },
  categoryRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryLabel: { fontSize: 14, color: "#E5E7EB" },
  categoryAmount: { fontSize: 13, color: "#9CA3AF" },
  categoryTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.9)",
    overflow: "hidden",
    marginBottom: 8,
  },
  categoryFillGreen: {
    height: "100%",
    backgroundColor: "#22C55E",
    borderRadius: 999,
  },
  categoryFillOrange: {
    height: "100%",
    backgroundColor: "#F97316",
    borderRadius: 999,
  },
  categoryFillBlue: {
    height: "100%",
    backgroundColor: "#38BDF8",
    borderRadius: 999,
  },

  fabWrapper: { position: "absolute", right: 20, bottom: 20, zIndex: 40 },
  fab: {
    height: 64,
    width: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
    shadowColor: "#22C55E",
    shadowRadius: 14,
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 6 },
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(1,2,6,0.45)",
  },
  modalCard: {
    backgroundColor: "#020617",
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
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
    gap: 6,
  },
  modalMonthButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    margin: 2,
  },
  modalMonthButtonActive: {
    backgroundColor: "rgba(34,197,94,0.18)",
  },
  modalMonthText: {
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "capitalize",
    fontSize: 12,
  },
  modalMonthTextActive: { color: "#E0F2FE" },

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
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.3)",
  },
  modalBtnCancelText: {
    textAlign: "center",
    color: "#94A3B8",
    fontWeight: "600",
  },
  modalBtnConfirm: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginLeft: 8,
    backgroundColor: "#22C55E",
  },
  modalBtnConfirmText: {
    textAlign: "center",
    color: "#022C22",
    fontWeight: "700",
  },

  budgetModalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(2,6,23,0.8)",
  },
  budgetModalCard: {
    backgroundColor: "#020617",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.7)",
  },
  budgetModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E5E7EB",
  },
  budgetModalSubtitle: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
    marginBottom: 10,
  },
  budgetInput: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.9)",
    fontSize: 14,
    color: "#F9FAFB",
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.06)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.18)",
  },
  tagText: { color: "#A7F3D0", fontSize: 11, fontWeight: "600" },
  tagPillMuted: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.06)",
  },
  tagTextMuted: { color: "#9CA3AF", fontSize: 11, fontWeight: "600" },
});

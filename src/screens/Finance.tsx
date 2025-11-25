// src/screens/Finance.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Trash2,
} from "lucide-react-native";
import { Swipeable } from "react-native-gesture-handler";

type MovementType = "income" | "expense";

type Movement = {
  id: string;
  type: MovementType;
  description: string;
  category: string;
  date: string;
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
  const [movements, setMovements] = useState<Movement[]>(initialMovements);

  const totals = useMemo(() => {
    const income = movements
      .filter((m) => m.type === "income")
      .reduce((sum, m) => sum + m.amount, 0);
    const expenses = movements
      .filter((m) => m.type === "expense")
      .reduce((sum, m) => sum + m.amount, 0);
    const balance = income - expenses;
    const usedPct = budget > 0 ? Math.min(expenses / budget, 1) : 0;

    return { income, expenses, balance, usedPct };
  }, [movements, budget]);

  function handleDelete(id: string) {
    setMovements((prev) => prev.filter((m) => m.id !== id));
  }

  function renderRightActions(id: string) {
    return (
      <View style={styles.deleteContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.deleteButton}
          onPress={() => handleDelete(id)}
        >
          <Trash2 color="#F9FAFB" size={22} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header simples com título e chip de mês actual */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Finanças</Text>
            <Text style={styles.subtitle}>Orçamento & despesas</Text>
          </View>

          <View style={styles.chip}>
            <View style={styles.chipDot} />
            <Text style={styles.chipText}>Mês actual</Text>
          </View>
        </View>

        {/* Card de orçamento com destaque forte */}
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
              style={[styles.progressFill, { width: `${totals.usedPct * 100}%` }]}
            />
          </View>
        </LinearGradient>

        {/* Movimentos recentes em card próprio */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Movimentos recentes</Text>
            <Text style={styles.sectionSubtitle}>Entradas e despesas</Text>
          </View>

          <View style={styles.card}>
            {movements.map((m) => (
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
                      <Text style={styles.movementMeta}>
                        {m.category} • {m.date}
                      </Text>
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
          </View>
        </View>

        {/* Por categoria – mais analítico, menos destaque visual */}
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

      {/* Botão flutuante para nova movimentação */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("NovaMovimentacao")}
        >
            <LinearGradient
              colors={["#166534", "#22C55E", "#38BDF8"]}   // verde -> azul, igual ao resto do tema
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fab}
              >
              <Plus color="#F9FAFB" size={28} />
            </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 90,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#F9FAFB",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 2,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.15)",
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    color: "#E5E7EB",
    fontWeight: "600",
  },

  budgetCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#111827",
    marginBottom: 20,
  },
  budgetLabel: {
    fontSize: 14,
    color: "#CBD5E1",
    marginBottom: 4,
  },
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
  budgetTotalsItem: {
    flex: 1,
  },
  budgetTotalsLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  budgetTotalsValue: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: "#E5E7EB",
  },
  progressTextSecondary: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  progressBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#020617",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#0F172A",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  section: {
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
  },

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
  movementLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  movementDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  movementDescription: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E5E7EB",
  },
  movementMeta: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  movementRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  movementAmount: {
    fontSize: 15,
    fontWeight: "700",
  },

  deleteContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  deleteButton: {
    width: 64,
    marginVertical: 6,
    marginRight: 4,
    backgroundColor: "#EF4444",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: "#E5E7EB",
  },
  categoryAmount: {
    fontSize: 14,
    color: "#F97373",
  },
  categoryBarTrack: {
    marginTop: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#020617",
    overflow: "hidden",
  },
  categoryBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#F97373",
  },

  fabWrapper: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
